import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const R2_BUCKET = "pelikulart-generations";

// --- AWS Signature V4 helpers ---
async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAmzDate() {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return { amzDate, shortDate: amzDate.slice(0, 8) };
}

async function getSigningKey(secretKey: string, shortDate: string, region: string, service: string) {
  let key = await hmacSha256(new TextEncoder().encode("AWS4" + secretKey), shortDate);
  key = await hmacSha256(key, region);
  key = await hmacSha256(key, service);
  key = await hmacSha256(key, "aws4_request");
  return key;
}

async function deleteFromR2(r2Key: string): Promise<void> {
  const endpoint = Deno.env.get("R2_ENDPOINT_URL")!;
  const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID")!;
  const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
  const region = "auto";
  const service = "s3";

  const url = new URL(`/${R2_BUCKET}/${r2Key}`, endpoint);
  const { amzDate, shortDate } = getAmzDate();

  const payloadHash = await sha256Hex("");

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");

  const canonicalRequest = ["DELETE", url.pathname, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const credentialScope = `${shortDate}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, shortDate, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const resp = await fetch(url.toString(), {
    method: "DELETE",
    headers: { ...headers, Authorization: authHeader },
  });

  if (!resp.ok && resp.status !== 404) {
    const errText = await resp.text();
    throw new Error(`R2 delete failed: ${resp.status} ${errText}`);
  }
  await resp.text();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { job_id } = await req.json();
    if (!job_id) throw new Error("Missing job_id");

    const adminClient = createClient(supabaseUrl, supabaseKey);

    // Fetch the job (must belong to user)
    const { data: job, error: fetchErr } = await adminClient
      .from("generation_jobs")
      .select("id, user_id, result_url, result_url_temp, status")
      .eq("id", job_id)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !job) throw new Error("Job not found");

    // Delete R2 files
    const r2KeysToDelete: string[] = [];
    if (job.result_url && job.result_url.startsWith("r2:")) {
      r2KeysToDelete.push(job.result_url.replace("r2:", ""));
    }

    for (const key of r2KeysToDelete) {
      try {
        await deleteFromR2(key);
      } catch (e) {
        console.error("R2 delete error (non-fatal):", e);
      }
    }

    // Soft-delete: set deleted_at
    const { error: updateErr } = await adminClient
      .from("generation_jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", job_id)
      .eq("user_id", user.id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
