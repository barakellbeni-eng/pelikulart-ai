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

    // Try generation_jobs first
    const { data: job, error: jobError } = await adminClient
      .from("generation_jobs")
      .select("id, user_id, result_url, result_metadata")
      .eq("id", job_id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    // If not found in generation_jobs, try legacy generations table
    if (jobError || !job) {
      const { data: legacyGen, error: legacyError } = await adminClient
        .from("generations")
        .select("id, user_id, image_url")
        .eq("id", job_id)
        .eq("user_id", userId)
        .single();

      if (legacyError || !legacyGen) {
        return new Response(
          JSON.stringify({ error: "Job introuvable" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Delete R2 file if applicable
      const r2Key = legacyGen.image_url?.startsWith("r2:")
        ? legacyGen.image_url.slice(3)
        : legacyGen.image_url;
      if (r2Key) {
        try { await deleteFromR2(r2Key); } catch (e) { console.error("R2 delete failed:", e); }
      }

      // Hard delete from generations table
      await adminClient.from("generations").delete().eq("id", job_id).eq("user_id", userId);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Collect keys + URL variants to clean legacy rows reliably
    const r2KeysToDelete = new Set<string>();
    const imageUrlsToDelete = new Set<string>();

    const addLookupCandidates = (value?: string | null) => {
      if (!value || typeof value !== "string") return;
      const raw = value.trim();
      if (!raw) return;

      imageUrlsToDelete.add(raw);

      if (raw.startsWith("r2:")) {
        const key = raw.slice(3);
        if (!key) return;
        r2KeysToDelete.add(key);
        imageUrlsToDelete.add(key);
        imageUrlsToDelete.add(`r2:${key}`);
        return;
      }

      // Old rows may store raw key without r2: prefix
      if (!/^https?:\/\//i.test(raw)) {
        r2KeysToDelete.add(raw);
        imageUrlsToDelete.add(`r2:${raw}`);
      }
    };

    addLookupCandidates(job.result_url);

    // Check result_metadata for additional R2 keys (multi-image generations)
    const metadata = job.result_metadata as Record<string, any> | null;
    if (metadata?.r2_key && typeof metadata.r2_key === "string") {
      addLookupCandidates(metadata.r2_key);
    }
    if (metadata?.r2_keys && Array.isArray(metadata.r2_keys)) {
      for (const key of metadata.r2_keys) {
        if (typeof key === "string") addLookupCandidates(key);
      }
    }

    // Delete R2 files in parallel (non-blocking — don't fail if R2 delete fails)
    const r2Deletions = Array.from(r2KeysToDelete).map(async (key) => {
      try {
        await deleteFromR2(key);
      } catch (e) {
        console.error(`R2 delete failed for ${key}:`, e);
      }
    });

    // Delete matching entries from legacy 'generations' table with both formats
    const generationsDeletion = imageUrlsToDelete.size > 0
      ? adminClient
          .from("generations")
          .delete()
          .eq("user_id", userId)
          .in("image_url", Array.from(imageUrlsToDelete))
      : Promise.resolve({ error: null as unknown });

    // Soft-delete the job
    const jobSoftDelete = adminClient
      .from("generation_jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", job_id)
      .eq("user_id", userId);

    const [, generationsDeleteRes, jobSoftDeleteRes] = await Promise.all([
      Promise.all(r2Deletions),
      generationsDeletion,
      jobSoftDelete,
    ]);

    if ((generationsDeleteRes as { error?: unknown })?.error) {
      console.error("Legacy generations delete error:", (generationsDeleteRes as { error?: unknown }).error);
    }

    if (jobSoftDeleteRes.error) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la suppression en base" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
