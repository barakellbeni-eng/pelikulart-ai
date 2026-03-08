import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { deleteFromR2 } from "../_shared/r2.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Authentification invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = userData.user.id;
    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch the job — must belong to user
    const { data: job, error: jobError } = await adminClient
      .from("generation_jobs")
      .select("id, user_id, result_url, result_metadata")
      .eq("id", job_id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job introuvable" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Collect all R2 keys to delete
    const r2KeysToDelete: string[] = [];

    if (job.result_url?.startsWith("r2:")) {
      r2KeysToDelete.push(job.result_url.slice(3));
    }

    // Check result_metadata for additional R2 keys (multi-image generations)
    const metadata = job.result_metadata as Record<string, any> | null;
    if (metadata?.r2_keys && Array.isArray(metadata.r2_keys)) {
      for (const key of metadata.r2_keys) {
        const cleanKey = typeof key === "string" && key.startsWith("r2:") ? key.slice(3) : key;
        if (typeof cleanKey === "string" && !r2KeysToDelete.includes(cleanKey)) {
          r2KeysToDelete.push(cleanKey);
        }
      }
    }

    // Delete R2 files in parallel (non-blocking — don't fail if R2 delete fails)
    const r2Deletions = r2KeysToDelete.map(async (key) => {
      try {
        await deleteFromR2(key);
      } catch (e) {
        console.error(`R2 delete failed for ${key}:`, e);
      }
    });

    // Also delete matching entries from the legacy 'generations' table
    const generationsDeletion = (async () => {
      for (const key of r2KeysToDelete) {
        await adminClient
          .from("generations")
          .delete()
          .eq("user_id", userId)
          .eq("image_url", `r2:${key}`);
      }
    })();

    // Soft-delete the job
    const jobSoftDelete = adminClient
      .from("generation_jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", job_id)
      .eq("user_id", userId);

    await Promise.all([...r2Deletions, generationsDeletion, jobSoftDelete]);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("delete-generation error:", e);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
