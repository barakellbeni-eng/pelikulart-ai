import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_ENDPOINTS: Record<string, string> = {
  "stable-audio": "https://queue.fal.run/fal-ai/stable-audio",
  "ace-step": "https://queue.fal.run/fal-ai/ace-step",
  "dia-tts": "https://queue.fal.run/fal-ai/dia-tts",
  "kokoro-tts": "https://queue.fal.run/fal-ai/kokoro/american-english",
  "mmaudio": "https://queue.fal.run/fal-ai/mmaudio/v2",
};

async function pollForResult(endpoint: string, requestId: string, apiKey: string): Promise<any> {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
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
      throw new Error("Audio generation failed on Fal AI");
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
      model_id = "stable-audio",
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
        JSON.stringify({ error: `Unknown audio model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build payload based on model
    const payload: Record<string, any> = { prompt };

    if (model_id === "stable-audio") {
      payload.seconds_total = modelSettings.duration || 15;
      payload.steps = modelSettings.num_inference_steps || 25;
    } else if (model_id === "ace-step") {
      payload.duration = modelSettings.duration || 30;
      if (modelSettings.lyrics) payload.lyrics = modelSettings.lyrics;
    } else if (model_id === "dia-tts") {
      // Dia uses "text" field instead of "prompt"
      delete payload.prompt;
      payload.text = prompt;
    } else if (model_id === "kokoro-tts") {
      // Kokoro uses "text" field
      delete payload.prompt;
      payload.text = prompt;
      if (modelSettings.voice) payload.voice = modelSettings.voice;
    } else if (model_id === "mmaudio") {
      payload.duration = modelSettings.duration || 5;
      if (modelSettings.image_url) payload.video_url = modelSettings.image_url;
    }

    // Remove client-only settings
    delete payload.audio_type;
    delete payload.num_inference_steps;

    console.log(`Submitting to ${model_id} (${endpoint}):`, JSON.stringify(payload));

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

    let result = await submitResp.json();

    // Poll if queued
    if (result.request_id && !result.audio_file && !result.audio) {
      result = await pollForResult(endpoint, result.request_id, FAL_API_KEY);
    }

    // Extract audio URL from various response formats
    let audioUrl = null;
    if (result.audio_file?.url) {
      audioUrl = result.audio_file.url;
    } else if (result.audio?.url) {
      audioUrl = result.audio.url;
    } else if (result.output?.url) {
      audioUrl = result.output.url;
    } else if (typeof result.audio_url === "string") {
      audioUrl = result.audio_url;
    }

    if (!audioUrl) {
      console.error("Unexpected response format:", JSON.stringify(result).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No audio generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ audio_url: audioUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
