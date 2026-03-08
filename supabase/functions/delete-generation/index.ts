import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { deleteFile } from "../_shared/storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BUCKET = "generations";

/** Extract the storage key from a public URL or r2: prefixed path */
function extractStorageKey(url: string): string | null {
  if (!url) return null;
  // Legacy r2: prefix
  if (url.startsWith("r2:")) return url.slice(3);
  // Supabase public URL
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) return url.substring(idx + marker.length).split("?")[0];
  // Raw key (no http)
  if (!url.startsWith("http")) return url;
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Authentification invalide" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = userData.user.id;
    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Try generation_jobs first
    const { data: job, error: jobError } = await adminClient
      .from("generation_jobs")
      .select("id, user_id, result_url, result_metadata")
      .eq("id", job_id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    // If not found, try legacy generations table
    if (jobError || !job) {
      const { data: legacyGen, error: legacyError } = await adminClient
        .from("generations")
        .select("id, user_id, image_url")
        .eq("id", job_id)
        .eq("user_id", userId)
        .single();

      if (legacyError || !legacyGen) {
        return new Response(JSON.stringify({ error: "Job introuvable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Delete file from storage
      const key = extractStorageKey(legacyGen.image_url);
      if (key) {
        try { await deleteFile(key); } catch (e) { console.error("Storage delete failed:", e); }
      }

      await adminClient.from("generations").delete().eq("id", job_id).eq("user_id", userId);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Collect keys to delete
    const keysToDelete = new Set<string>();
    const imageUrlsToDelete = new Set<string>();

    const addCandidates = (value?: string | null) => {
      if (!value || typeof value !== "string") return;
      const raw = value.trim();
      if (!raw) return;
      imageUrlsToDelete.add(raw);
      const key = extractStorageKey(raw);
      if (key) keysToDelete.add(key);
      // Also add alternate forms for legacy cleanup
      if (raw.startsWith("r2:")) {
        imageUrlsToDelete.add(raw.slice(3));
        imageUrlsToDelete.add(raw);
      }
    };

    addCandidates(job.result_url);

    const metadata = job.result_metadata as Record<string, any> | null;
    if (metadata?.r2_key && typeof metadata.r2_key === "string") addCandidates(metadata.r2_key);
    if (metadata?.r2_keys && Array.isArray(metadata.r2_keys)) {
      for (const key of metadata.r2_keys) if (typeof key === "string") addCandidates(key);
    }
    if (metadata?.storage_keys && Array.isArray(metadata.storage_keys)) {
      for (const key of metadata.storage_keys) if (typeof key === "string") addCandidates(key);
    }

    // Delete files in parallel
    const deletions = Array.from(keysToDelete).map(async (key) => {
      try { await deleteFile(key); } catch (e) { console.error(`Storage delete failed for ${key}:`, e); }
    });

    // Delete from legacy generations table
    const generationsDeletion = imageUrlsToDelete.size > 0
      ? adminClient.from("generations").delete().eq("user_id", userId).in("image_url", Array.from(imageUrlsToDelete))
      : Promise.resolve({ error: null });

    // Soft-delete the job
    const jobSoftDelete = adminClient
      .from("generation_jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", job_id)
      .eq("user_id", userId);

    const [, , jobSoftDeleteRes] = await Promise.all([
      Promise.all(deletions),
      generationsDeletion,
      jobSoftDelete,
    ]);

    if (jobSoftDeleteRes.error) {
      return new Response(JSON.stringify({ error: "Erreur lors de la suppression en base" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("delete-generation error:", e);
    return new Response(JSON.stringify({ error: "Erreur interne" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
