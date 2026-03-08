import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { uploadBytes, downloadAndUpload, getPublicUrl } from "../_shared/storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAL_ENDPOINT = "https://fal.run/fal-ai/nano-banana-pro/edit";
const KIE_AI_BASE = "https://api.kie.ai";
const KIE_MODEL = "nano-banana-2";

const PLAN_TYPE_MAP: Record<string, string> = {
  "close-up": "close-up shot",
  "macro": "macro shot",
  "serre": "tight/medium close-up shot",
  "americain": "american shot (knee-level framing)",
  "large": "wide shot",
  "tres-large": "extreme wide shot",
  "plongee": "high-angle (bird's eye) shot",
  "contre-plongee": "low-angle (worm's eye) shot",
};

// ── KIE AI helpers ──
async function kieGenerate(prompt: string, imageUrl: string, imageSize: any, apiKey: string): Promise<string> {
  // Create task
  const createResp = await fetch(`${KIE_AI_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/nano-banana-edit",
      input: {
        prompt,
        image_urls: [imageUrl],
        image_size: typeof imageSize === "object" ? "1:1" : imageSize,
        output_format: "png",
      },
    }),
  });

  if (!createResp.ok) {
    const errText = await createResp.text();
    throw new Error(`KIE createTask error: ${createResp.status} ${errText}`);
  }

  const createData = await createResp.json();
  if (createData.code !== 200 || !createData.data?.taskId) {
    throw new Error(`KIE error: ${createData.msg || "No taskId"}`);
  }

  const taskId = createData.data.taskId;

  // Poll for result
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollResp = await fetch(`${KIE_AI_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    let data: any;
    try { data = await pollResp.json(); } catch { continue; }
    if (data.code !== 200 || !data.data) continue;

    if (data.data.state === "success") {
      let resultJson: any;
      try { resultJson = JSON.parse(data.data.resultJson); } catch {
        throw new Error("KIE: could not parse resultJson");
      }
      if (resultJson.resultUrls?.length > 0) return resultJson.resultUrls[0];
      throw new Error("KIE: no result URLs");
    }
    if (data.data.state === "fail") {
      throw new Error(`KIE generation failed: ${data.data.failMsg || "unknown"}`);
    }
  }
  throw new Error("KIE generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    const KIE_AI_API_KEY = Deno.env.get("KIE_AI_API_KEY");
    if (!FAL_API_KEY && !KIE_AI_API_KEY) throw new Error("No API key configured (FAL or KIE)");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Authentification invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { image_url, plan_type, project_id, aspect_ratio = "1:1", resolution = "2K", plan_index } = body;

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: "Une image source est requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cost = 2;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId, p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ratioSizes: Record<string, Record<string, { width: number; height: number }>> = {
      "1:1":  { "2K": { width: 2048, height: 2048 }, "4K": { width: 4096, height: 4096 } },
      "16:9": { "2K": { width: 2048, height: 1152 }, "4K": { width: 3840, height: 2160 } },
      "9:16": { "2K": { width: 1152, height: 2048 }, "4K": { width: 2160, height: 3840 } },
      "4:3":  { "2K": { width: 2048, height: 1536 }, "4K": { width: 4096, height: 3072 } },
      "3:4":  { "2K": { width: 1536, height: 2048 }, "4K": { width: 3072, height: 4096 } },
    };

    const imageSize = ratioSizes[aspect_ratio]?.[resolution] || ratioSizes["1:1"]["2K"];
    const planLabel = PLAN_TYPE_MAP[plan_type] || plan_type;

    const planPrompts: Record<number, string> = {
      1: "Reframe this exact image, camera angle variation 1, same subject, same scene, same lighting, same style",
      2: "Reframe this exact image, camera angle variation 2, same subject, same scene, same lighting, same style",
      3: "Reframe this exact image, camera angle variation 3, same subject, same scene, same lighting, same style",
      4: "Reframe this exact image, camera angle variation 4, same subject, same scene, same lighting, same style",
    };

    const prompt = plan_index && planPrompts[plan_index]
      ? planPrompts[plan_index]
      : `generate 4 different ${planLabel} shot of this exact image, Keep the same subject, same scene, same colors, same lighting.`;

    let imageResult: string | null = null;
    let usedProvider = "fal";

    // Try Fal AI first, fallback to KIE AI
    if (FAL_API_KEY) {
      try {
        console.log(`Multi-plan: generating ${planLabel} ${aspect_ratio} ${resolution} via Fal AI`);
        const falResp = await fetch(FAL_ENDPOINT, {
          method: "POST",
          headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt, image_urls: [image_url], num_images: 1, output_format: "png", image_size: imageSize,
          }),
        });

        if (falResp.ok) {
          const falData = await falResp.json();
          imageResult = falData?.images?.[0]?.url || null;
        } else {
          const errText = await falResp.text();
          console.error("Fal AI error:", falResp.status, errText);
        }
      } catch (falErr) {
        console.error("Fal AI exception:", falErr);
      }
    }

    // Fallback to KIE AI if Fal failed
    if (!imageResult && KIE_AI_API_KEY) {
      try {
        console.log(`Multi-plan: falling back to KIE AI for ${planLabel}`);
        usedProvider = "kie";
        imageResult = await kieGenerate(prompt, image_url, aspect_ratio, KIE_AI_API_KEY);
      } catch (kieErr: any) {
        console.error("KIE AI error:", kieErr.message);
      }
    }

    if (!imageResult) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée. Les deux providers ont échoué." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Download and upload to storage
    let publicUrl: string;
    try {
      if (usedProvider === "kie") {
        // KIE returns direct URLs, download and store
        const storageKey = await downloadAndUpload(imageResult, userId, "png");
        publicUrl = getPublicUrl(storageKey);
      } else {
        const imgResp = await fetch(imageResult);
        if (!imgResp.ok) throw new Error("Download failed");
        const bytes = new Uint8Array(await imgResp.arrayBuffer());
        const storageKey = await uploadBytes(bytes, userId, "image/png", "png");
        publicUrl = getPublicUrl(storageKey);
      }
    } catch (dlErr) {
      console.error("Storage upload error:", dlErr);
      publicUrl = imageResult; // Use temp URL as fallback
    }

    // Save to generation_jobs
    const { data: jobData } = await adminClient.from("generation_jobs").insert({
      user_id: userId,
      tool_type: "image",
      model: usedProvider === "kie" ? "kie-nano-banana-edit" : "nano-banana-pro-edit",
      prompt: `Multi-Plan ${planLabel}`,
      provider: usedProvider,
      status: "completed",
      result_url: publicUrl,
      credits_used: cost,
      completed_at: new Date().toISOString(),
      project_id: project_id || null,
    }).select("id").single();

    return new Response(
      JSON.stringify({ image: { url: publicUrl, job_id: jobData?.id || "" }, new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-multiplan error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
