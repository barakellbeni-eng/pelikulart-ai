import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_ENDPOINTS: Record<string, string> = {
  // Google
  "veo3": "https://queue.fal.run/fal-ai/veo3",
  // Kling
  "kling-v3-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v3/standard/text-to-video",
  "kling-v3-pro-t2v": "https://queue.fal.run/fal-ai/kling-video/o3/pro/text-to-video",
  "kling-v25-turbo-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
  "kling-v21-std-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video",
  "kling-v2-master-t2v": "https://queue.fal.run/fal-ai/kling-video/v2/master/text-to-video",
  "kling-v16-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
  "kling-v16-elements": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/elements",
  // Seedance
  "seedance-pro-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/text-to-video",
  "seedance-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/image-to-video",
  "seedance-pro-fast-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
  "seedance-pro-fast-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
  "seedance-15-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
  "seedance-lite-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/image-to-video",
  "seedance-lite-ref": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/reference-to-video",
  // Luma
  "luma-ray2-t2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2",
  "luma-ray2-i2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2/image-to-video",
  // Wan
  "wan-26-t2v": "https://queue.fal.run/wan/v2.6/text-to-video",
  "wan-26-i2v": "https://queue.fal.run/wan/v2.6/image-to-video",
  // MiniMax
  "minimax-video": "https://queue.fal.run/fal-ai/minimax/video-01-live",
  // Framepack
  "framepack-f1": "https://queue.fal.run/fal-ai/framepack/f1",
};

async function pollForResult(statusUrl: string, responseUrl: string, apiKey: string): Promise<any> {
  let consecutiveErrors = 0;
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const statusResp = await fetch(statusUrl, {
        method: "GET",
        headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
      });

      if (!statusResp.ok) {
        const errText = await statusResp.text();
        console.warn(`Poll attempt ${i + 1}: HTTP ${statusResp.status} - ${errText.slice(0, 100)}`);
        consecutiveErrors++;
        if (consecutiveErrors > 30) {
          throw new Error(`Polling failed after ${consecutiveErrors} consecutive errors (last: HTTP ${statusResp.status})`);
        }
        continue;
      }

      consecutiveErrors = 0;
      const statusData = await statusResp.json();
      console.log("Poll attempt", i + 1, "status:", statusData.status);

      if (statusData.status === "COMPLETED") {
        const resultResp = await fetch(responseUrl, {
          method: "GET",
          headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
        });
        if (!resultResp.ok) {
          throw new Error(`Failed to fetch result: HTTP ${resultResp.status}`);
        }
        return await resultResp.json();
      }
      if (statusData.status === "FAILED") {
        throw new Error("Video generation failed on Fal AI");
      }
    } catch (fetchErr: any) {
      if (fetchErr.message?.includes("Polling failed") || fetchErr.message?.includes("Video generation failed") || fetchErr.message?.includes("Failed to fetch result")) {
        throw fetchErr;
      }
      consecutiveErrors++;
      console.warn(`Poll attempt ${i + 1}: network error - ${fetchErr.message || fetchErr}`);
      if (consecutiveErrors > 15) {
        throw new Error(`Polling aborted after ${consecutiveErrors} consecutive network errors`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY is not configured");

    const body = await req.json();
    const { prompt, model_id = "veo3", image_url, ...modelSettings } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endpoint = MODEL_ENDPOINTS[model_id];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Unknown video model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, any> = { prompt, ...modelSettings };
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) delete payload[key];
      if (key === "seed" && payload[key] === 0) delete payload[key];
    }
    if (image_url) payload.image_url = image_url;

    console.log(`Submitting video to ${model_id} (${endpoint}):`, JSON.stringify(payload));

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
      return new Response(
        JSON.stringify({ error: `Fal AI error (${submitResp.status}): ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitData = await submitResp.json();
    console.log("Submit response keys:", Object.keys(submitData));
    let videoUrl = submitData.video?.url;

    if (!videoUrl && submitData.request_id) {
      const statusUrl = submitData.status_url || `${endpoint}/requests/${submitData.request_id}/status`;
      const responseUrl = submitData.response_url || `${endpoint}/requests/${submitData.request_id}`;
      console.log("Polling with status_url:", statusUrl);
      const result = await pollForResult(statusUrl, responseUrl, FAL_API_KEY);
      videoUrl = result.video?.url;
    }

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "No video generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ video_url: videoUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
