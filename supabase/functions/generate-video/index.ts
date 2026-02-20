import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com")) return true;
  if (origin === "http://localhost:5173" || origin === "http://localhost:8080") return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin : "https://africa-art-ai.lovable.app",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const MODEL_ENDPOINTS: Record<string, string> = {
  "veo3": "https://queue.fal.run/fal-ai/veo3",
  "kling-v3-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v3/standard/text-to-video",
  "kling-v3-pro-t2v": "https://queue.fal.run/fal-ai/kling-video/o3/pro/text-to-video",
  "kling-v25-turbo-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
  "kling-v21-std-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video",
  "kling-v2-master-t2v": "https://queue.fal.run/fal-ai/kling-video/v2/master/text-to-video",
  "kling-v16-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
  "kling-v16-elements": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/elements",
  "seedance-pro-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/text-to-video",
  "seedance-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/image-to-video",
  "seedance-pro-fast-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
  "seedance-pro-fast-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
  "seedance-15-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
  "seedance-lite-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/image-to-video",
  "seedance-lite-ref": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/reference-to-video",
  "luma-ray2-t2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2",
  "luma-ray2-i2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2/image-to-video",
  "wan-26-t2v": "https://queue.fal.run/wan/v2.6/text-to-video",
  "wan-26-i2v": "https://queue.fal.run/wan/v2.6/image-to-video",
  "minimax-video": "https://queue.fal.run/fal-ai/minimax/video-01-live",
  "framepack-f1": "https://queue.fal.run/fal-ai/framepack/f1",
};

const ALLOWED_SETTINGS = new Set([
  "aspect_ratio", "duration", "resolution", "seed", "negative_prompt",
  "guidance_scale", "num_inference_steps", "fps",
]);

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    // --- Authentication ---
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { prompt, model_id = "veo3", image_url, action, status_url, response_url, cauris_cost = 0, ...rawSettings } = body;

    // === POLL ACTION ===
    if (action === "poll") {
      if (!status_url || !response_url) {
        return new Response(
          JSON.stringify({ error: "status_url and response_url required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const statusResp = await fetch(status_url, {
          method: "GET",
          headers: { Authorization: `Key ${FAL_API_KEY}`, Accept: "application/json" },
        });

        if (!statusResp.ok) {
          return new Response(
            JSON.stringify({ status: "IN_PROGRESS" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const statusData = await statusResp.json();

        if (statusData.status === "COMPLETED") {
          const resultResp = await fetch(response_url, {
            method: "GET",
            headers: { Authorization: `Key ${FAL_API_KEY}`, Accept: "application/json" },
          });
          if (!resultResp.ok) {
            return new Response(
              JSON.stringify({ status: "IN_PROGRESS" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const result = await resultResp.json();
          const videoUrl = result.video?.url;
          if (!videoUrl) {
            return new Response(
              JSON.stringify({ status: "FAILED", error: "Aucune vidéo dans le résultat" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ status: "COMPLETED", video_url: videoUrl }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (statusData.status === "FAILED") {
          return new Response(
            JSON.stringify({ status: "FAILED", error: "La génération vidéo a échoué" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ status: statusData.status || "IN_PROGRESS" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (pollErr) {
        console.error("Poll exception:", pollErr);
        return new Response(
          JSON.stringify({ status: "IN_PROGRESS" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // === SUBMIT ACTION ===
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Un prompt est requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Le prompt est trop long (max 5000 caractères)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endpoint = MODEL_ENDPOINTS[model_id];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Modèle vidéo inconnu" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter settings
    const modelSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawSettings)) {
      if (ALLOWED_SETTINGS.has(key) && value !== "" && value !== null && value !== undefined) {
        if (key === "seed" && value === 0) continue;
        modelSettings[key] = value;
      }
    }

    // --- Server-side credit deduction ---
    const cost = typeof cauris_cost === "number" && cauris_cost > 0 ? cauris_cost : 10;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId,
      p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, any> = { prompt, ...modelSettings };
    if (image_url) payload.image_url = image_url;

    console.log(`Submitting video to ${model_id}`);

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.error("Fal submit error:", submitResp.status, errText);
      // Refund on failure
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Erreur du service de génération vidéo. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitData = await submitResp.json();

    const videoUrl = submitData.video?.url;
    if (videoUrl) {
      return new Response(
        JSON.stringify({ video_url: videoUrl, new_balance: deductResult }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (submitData.request_id) {
      const sUrl = submitData.status_url || `${endpoint}/requests/${submitData.request_id}/status`;
      const rUrl = submitData.response_url || `${endpoint}/requests/${submitData.request_id}`;
      return new Response(
        JSON.stringify({
          status: "QUEUED",
          request_id: submitData.request_id,
          status_url: sUrl,
          response_url: rUrl,
          new_balance: deductResult,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refund if nothing returned
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
    return new Response(
      JSON.stringify({ error: "Aucune vidéo générée" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-video error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
