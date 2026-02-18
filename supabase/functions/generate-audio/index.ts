import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREEPIK_BASE = "https://api.freepik.com";

const MODEL_PATHS: Record<string, string> = {
  "music-generation": "/v1/ai/music-generation",
  "sound-effects": "/v1/ai/sound-effects",
};

async function pollForResult(pollUrl: string, apiKey: string): Promise<any> {
  let consecutiveErrors = 0;
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const resp = await fetch(pollUrl, {
        method: "GET",
        headers: { "x-freepik-api-key": apiKey, Accept: "application/json" },
      });

      if (!resp.ok) {
        consecutiveErrors++;
        console.warn(`Poll ${i + 1}: HTTP ${resp.status}`);
        if (consecutiveErrors > 20) throw new Error("Polling failed");
        continue;
      }

      consecutiveErrors = 0;
      const data = await resp.json();
      const status = data.data?.status;
      console.log(`Poll ${i + 1}: status=${status}`);

      if (status === "COMPLETED") return data;
      if (status === "FAILED") throw new Error("Audio generation failed on Freepik");
    } catch (err: any) {
      if (err.message?.includes("failed") || err.message?.includes("Polling")) throw err;
      consecutiveErrors++;
      if (consecutiveErrors > 10) throw new Error("Polling aborted");
    }
  }
  throw new Error("Audio generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FREEPIK_API_KEY = Deno.env.get("FREEPIK_API_KEY");
    if (!FREEPIK_API_KEY) throw new Error("FREEPIK_API_KEY is not configured");

    const body = await req.json();
    const { prompt, model_id = "music-generation", ...modelSettings } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const path = MODEL_PATHS[model_id];
    if (!path) {
      return new Response(JSON.stringify({ error: `Unknown audio model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build payload - sound-effects uses "text" field, music-generation uses "prompt"
    const payload: Record<string, any> = {};
    if (model_id === "sound-effects") {
      payload.text = prompt;
      if (modelSettings.duration) payload.duration = modelSettings.duration;
    } else {
      payload.prompt = prompt;
      if (modelSettings.duration) payload.duration = modelSettings.duration;
    }

    const endpoint = `${FREEPIK_BASE}${path}`;
    console.log(`Submitting audio to ${model_id} (${endpoint}):`, JSON.stringify(payload));

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
      return new Response(JSON.stringify({ error: `Erreur Freepik (${submitResp.status}): ${errText.slice(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const submitData = await submitResp.json();
    console.log("Submit response:", JSON.stringify(submitData).slice(0, 300));

    let audioUrl: string | null = null;

    if (submitData.data?.generated?.length) {
      audioUrl = submitData.data.generated[0];
    } else if (submitData.data?.task_id) {
      const pollUrl = `${FREEPIK_BASE}${path}/${submitData.data.task_id}`;
      const result = await pollForResult(pollUrl, FREEPIK_API_KEY);
      const generated = result.data?.generated;
      if (generated?.length) audioUrl = generated[0];
    }

    if (!audioUrl) {
      return new Response(JSON.stringify({ error: "No audio generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ audio_url: audioUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
