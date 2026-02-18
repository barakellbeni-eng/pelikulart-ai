import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREEPIK_BASE = "https://api.freepik.com";

const MODEL_PATHS: Record<string, string> = {
  // Kling (Image-to-Video)
  "kling-v26-pro-i2v": "/v1/ai/image-to-video/kling-v2-6-pro",
  "kling-v25-pro-i2v": "/v1/ai/image-to-video/kling-v2-5-pro",
  "kling-v21-master-i2v": "/v1/ai/image-to-video/kling-v2-1-master",
  "kling-o1-std-i2v": "/v1/ai/image-to-video/kling-o1-std",
  // WAN
  "wan-26-t2v": "/v1/ai/text-to-video/wan-v2-6-720p",
  "wan-26-i2v": "/v1/ai/image-to-video/wan-v2-6-720p",
  "wan-25-t2v": "/v1/ai/text-to-video/wan-2-5-t2v-1080p",
  // Seedance
  "seedance-pro-i2v": "/v1/ai/image-to-video/seedance-pro-1080p",
  // MiniMax
  "minimax-hailuo-i2v": "/v1/ai/image-to-video/minimax-hailuo-02-1080p",
  // RunWay
  "runway-gen4-turbo-i2v": "/v1/ai/image-to-video/runway-gen4-turbo",
};

async function pollForResult(pollUrl: string, apiKey: string): Promise<any> {
  let consecutiveErrors = 0;
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    try {
      const resp = await fetch(pollUrl, {
        method: "GET",
        headers: { "x-freepik-api-key": apiKey, Accept: "application/json" },
      });

      if (!resp.ok) {
        consecutiveErrors++;
        const errText = await resp.text();
        console.warn(`Poll ${i + 1}: HTTP ${resp.status} - ${errText.slice(0, 100)}`);
        if (consecutiveErrors > 30) throw new Error(`Polling failed after ${consecutiveErrors} errors`);
        continue;
      }

      consecutiveErrors = 0;
      const data = await resp.json();
      const status = data.data?.status;
      console.log(`Poll ${i + 1}: status=${status}`);

      if (status === "COMPLETED") return data;
      if (status === "FAILED") throw new Error("Video generation failed on Freepik");
    } catch (err: any) {
      if (err.message?.includes("failed") || err.message?.includes("Polling")) throw err;
      consecutiveErrors++;
      console.warn(`Poll ${i + 1}: network error - ${err.message}`);
      if (consecutiveErrors > 15) throw new Error("Polling aborted after network errors");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Video generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FREEPIK_API_KEY = Deno.env.get("FREEPIK_API_KEY");
    if (!FREEPIK_API_KEY) throw new Error("FREEPIK_API_KEY is not configured");

    const body = await req.json();
    const { prompt, model_id = "kling-v25-pro-i2v", image_url, ...modelSettings } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const path = MODEL_PATHS[model_id];
    if (!path) {
      return new Response(JSON.stringify({ error: `Unknown video model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build payload
    const payload: Record<string, any> = { prompt };

    // Pass through model settings (duration, size, aspect_ratio, etc.)
    for (const [key, value] of Object.entries(modelSettings)) {
      if (value === "" || value === null || value === undefined) continue;
      if (key === "seed" && value === 0) continue;
      payload[key] = value;
    }

    // Freepik i2v uses "image" field for the image URL
    if (image_url) {
      payload.image = image_url;
    }

    // Clean
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) delete payload[key];
    }

    const endpoint = `${FREEPIK_BASE}${path}`;
    console.log(`Submitting video to ${model_id} (${endpoint}):`, JSON.stringify(payload));

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-freepik-api-key": FREEPIK_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.error("Freepik submit error:", submitResp.status, errText);
      if (submitResp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: `Erreur Freepik (${submitResp.status}): ${errText.slice(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const submitData = await submitResp.json();
    console.log("Submit response:", JSON.stringify(submitData).slice(0, 300));

    let videoUrl: string | null = null;

    // Check if completed immediately
    if (submitData.data?.generated?.length) {
      videoUrl = submitData.data.generated[0];
    } else if (submitData.data?.task_id) {
      const pollUrl = `${FREEPIK_BASE}${path}/${submitData.data.task_id}`;
      console.log("Polling:", pollUrl);
      const result = await pollForResult(pollUrl, FREEPIK_API_KEY);
      const generated = result.data?.generated;
      if (generated?.length) videoUrl = generated[0];
    }

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "No video generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ video_url: videoUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-video error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
