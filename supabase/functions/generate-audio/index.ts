import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { downloadAndUploadToR2, getR2SignedUrl } from "../_shared/r2.ts";

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

const ALLOWED_SETTINGS = new Set([
  "duration", "lyrics", "voice", "num_inference_steps", "audio_type",
]);

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
      continue;
    }
    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`${endpoint}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      const resultText = await resultResp.text();
      try {
        return JSON.parse(resultText);
      } catch {
        throw new Error("Invalid response from AI service");
      }
    }
    if (statusData.status === "FAILED") {
      throw new Error("Audio generation failed");
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
    const { prompt, model_id = "stable-audio", cauris_cost = 0, ...rawSettings } = body;

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
        JSON.stringify({ error: "Modèle audio inconnu" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Server-side credit deduction ---
    const cost = typeof cauris_cost === "number" && cauris_cost > 0 ? cauris_cost : 5;
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

    // Build payload based on model
    const payload: Record<string, any> = { prompt };

    if (model_id === "stable-audio") {
      payload.seconds_total = rawSettings.duration || 15;
      payload.steps = rawSettings.num_inference_steps || 25;
    } else if (model_id === "ace-step") {
      payload.duration = rawSettings.duration || 30;
      if (rawSettings.lyrics) payload.lyrics = String(rawSettings.lyrics).slice(0, 5000);
    } else if (model_id === "dia-tts") {
      delete payload.prompt;
      payload.text = prompt;
    } else if (model_id === "kokoro-tts") {
      delete payload.prompt;
      payload.text = prompt;
      if (rawSettings.voice) payload.voice = rawSettings.voice;
    } else if (model_id === "mmaudio") {
      payload.duration = rawSettings.duration || 5;
      if (rawSettings.image_url) payload.video_url = rawSettings.image_url;
    }

    delete payload.audio_type;
    delete payload.num_inference_steps;

    console.log(`Submitting to ${model_id}`);

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) {
      console.error("Fal submit error:", submitResp.status);
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Erreur du service de génération audio. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result = await submitResp.json();

    if (result.request_id && !result.audio_file && !result.audio) {
      result = await pollForResult(endpoint, result.request_id, FAL_API_KEY);
    }

    let audioUrl = null;
    if (result.audio_file?.url) audioUrl = result.audio_file.url;
    else if (result.audio?.url) audioUrl = result.audio.url;
    else if (result.output?.url) audioUrl = result.output.url;
    else if (typeof result.audio_url === "string") audioUrl = result.audio_url;

    if (!audioUrl) {
      console.error("No audio in response");
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucun audio généré" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload to R2
    try {
      const r2Key = await downloadAndUploadToR2(audioUrl, userId, "wav");
      await adminClient.from("generations").insert({
        user_id: userId,
        prompt: prompt.slice(0, 5000),
        image_url: `r2:${r2Key}`,
        media_type: "audio",
      });
      const signedUrl = await getR2SignedUrl(r2Key, 3600);
      return new Response(
        JSON.stringify({ audio_url: signedUrl, r2_path: `r2:${r2Key}`, new_balance: deductResult }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (r2Err) {
      console.error("R2 upload error:", r2Err);
      return new Response(
        JSON.stringify({ audio_url: audioUrl, new_balance: deductResult }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
