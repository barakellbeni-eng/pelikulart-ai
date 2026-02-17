import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_ENDPOINTS: Record<string, string> = {
  "veo3": "https://queue.fal.run/fal-ai/veo3",
  "minimax-video": "https://queue.fal.run/fal-ai/minimax/video-01-live",
  "kling-video": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
  "framepack-f1": "https://queue.fal.run/fal-ai/framepack/f1",
};

async function pollForResult(endpoint: string, requestId: string, apiKey: string): Promise<any> {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusResp = await fetch(`${endpoint}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    const statusText = await statusResp.text();
    let statusData: any;
    try {
      statusData = JSON.parse(statusText);
    } catch {
      console.error("Non-JSON status response:", statusText.slice(0, 200));
      continue;
    }
    console.log("Poll attempt", i + 1, "status:", statusData.status);
    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`${endpoint}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      const resultText = await resultResp.text();
      try {
        return JSON.parse(resultText);
      } catch {
        console.error("Non-JSON result response:", resultText.slice(0, 200));
        throw new Error("Invalid response from Fal AI");
      }
    }
    if (statusData.status === "FAILED") {
      throw new Error("Video generation failed on Fal AI");
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
    const {
      prompt,
      model_id = "veo3",
      image_url,
      ...modelSettings
    } = body;

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

    // Clean empty/null/seed=0
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
    let videoUrl = submitData.video?.url;

    if (!videoUrl && submitData.request_id) {
      const result = await pollForResult(endpoint, submitData.request_id, FAL_API_KEY);
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
