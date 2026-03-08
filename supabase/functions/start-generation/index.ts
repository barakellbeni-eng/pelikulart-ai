import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { downloadAndUpload, uploadBytes, getPublicUrl } from "../_shared/storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ──────────────────────── MODEL REGISTRIES ────────────────────────

const IMAGE_ENDPOINTS: Record<string, string> = {
  "nano-banana-pro": "https://fal.run/fal-ai/nano-banana-pro",
  "nano-banana-pro-edit": "https://fal.run/fal-ai/nano-banana-pro/edit",
  "flux-dev": "https://fal.run/fal-ai/flux/dev",
  "flux-schnell": "https://fal.run/fal-ai/flux/schnell",
  "flux-pro-ultra": "https://fal.run/fal-ai/flux-pro/v1.1-ultra",
  "flux-kontext": "https://fal.run/fal-ai/flux-pro/kontext",
  "flux-kontext-max": "https://fal.run/fal-ai/flux-pro/kontext/max",
  "recraft-v3": "https://fal.run/fal-ai/recraft/v3",
  "ideogram-v2": "https://fal.run/fal-ai/ideogram/v2",
  "imagen4": "https://fal.run/fal-ai/imagen4/preview",
  "imagen4-fast": "https://fal.run/fal-ai/imagen4/preview/fast",
  "imagen4-ultra": "https://fal.run/fal-ai/imagen4/preview/ultra",
  "fast-sdxl": "https://fal.run/fal-ai/fast-sdxl",
  "hidream-i1": "https://fal.run/fal-ai/hidream-i1-full",
  "flux2-dev": "https://fal.run/fal-ai/flux-2/dev",
  "flux2-dev-edit": "https://fal.run/fal-ai/flux-2/edit",
  "seedream-v4-t2i": "https://fal.run/fal-ai/bytedance/seedream/v4/text-to-image",
  "seedream-v4-edit": "https://fal.run/fal-ai/bytedance/seedream/v4/edit",
  "seedream-v45-t2i": "https://fal.run/fal-ai/bytedance/seedream/v4.5/text-to-image",
  "seedream-v45-edit": "https://fal.run/fal-ai/bytedance/seedream/v4.5/edit",
};

const VIDEO_ENDPOINTS: Record<string, string> = {
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

const AUDIO_ENDPOINTS: Record<string, string> = {
  "stable-audio": "https://queue.fal.run/fal-ai/stable-audio",
  "ace-step": "https://queue.fal.run/fal-ai/ace-step",
  "dia-tts": "https://queue.fal.run/fal-ai/dia-tts",
  "kokoro-tts": "https://queue.fal.run/fal-ai/kokoro/american-english",
  "mmaudio": "https://queue.fal.run/fal-ai/mmaudio/v2",
};

const MODELS_USING_IMAGE_URLS = new Set([
  "seedream-v4-edit", "seedream-v45-edit", "flux2-dev-edit", "nano-banana-pro-edit",
]);

const ALLOWED_IMAGE_SETTINGS = new Set([
  "aspect_ratio", "resolution", "image_size", "guidance_scale", "seed",
  "negative_prompt", "num_inference_steps", "style", "safety_tolerance",
  "enable_safety_checker", "expand_prompt", "raw",
]);

const ALLOWED_VIDEO_SETTINGS = new Set([
  "aspect_ratio", "duration", "resolution", "seed", "negative_prompt",
  "guidance_scale", "num_inference_steps", "fps",
]);

const ALLOWED_AUDIO_SETTINGS = new Set([
  "duration", "lyrics", "voice", "num_inference_steps", "audio_type",
]);

const LOVABLE_AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ──────────────────────── HELPERS ────────────────────────

function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function filterSettings(raw: Record<string, any>, allowed: Set<string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (allowed.has(key) && value !== "" && value !== null && value !== undefined) {
      if (key === "seed" && value === 0) continue;
      result[key] = value;
    }
  }
  return result;
}

async function updateJob(adminClient: any, jobId: string, updates: Record<string, any>) {
  await adminClient.from("generation_jobs").update(updates).eq("id", jobId);
}

async function pollFalQueue(endpoint: string, requestId: string, apiKey: string, maxAttempts = 120): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusResp = await fetch(`${endpoint}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    let statusData: any;
    try { statusData = await statusResp.json(); } catch { continue; }
    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`${endpoint}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      return await resultResp.json();
    }
    if (statusData.status === "FAILED") throw new Error("Generation failed on provider side");
  }
  throw new Error("Generation timed out");
}

// ──────────────────────── BACKGROUND PROCESSORS ────────────────────────

async function processImage(jobId: string, userId: string, body: any) {
  const adminClient = getAdminClient();
  const FAL_API_KEY = Deno.env.get("FAL_API_KEY")!;
  const { prompt, model_id, output_format = "png", num_images = 1, image_url, image_urls, ...rawSettings } = body;

  try {
    await updateJob(adminClient, jobId, { status: "processing", started_at: new Date().toISOString() });

    const endpoint = IMAGE_ENDPOINTS[model_id];
    const safeNumImages = Math.min(Math.max(1, Number(num_images) || 1), 4);
    const modelSettings = filterSettings(rawSettings, ALLOWED_IMAGE_SETTINGS);

    const payload: Record<string, any> = { prompt, num_images: safeNumImages, output_format, ...modelSettings };

    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      if (MODELS_USING_IMAGE_URLS.has(model_id)) payload.image_urls = image_urls.slice(0, 5);
      else payload.image_url = image_urls[0];
    } else if (image_url) {
      if (MODELS_USING_IMAGE_URLS.has(model_id)) payload.image_urls = [image_url];
      else payload.image_url = image_url;
    }

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) throw new Error(`Fal API error: ${submitResp.status}`);

    const submitData = await submitResp.json();
    const falImages = submitData.images || submitData.output?.images;
    if (!falImages?.length) throw new Error("No images returned");

    const firstTempUrl = falImages[0].url;
    await updateJob(adminClient, jobId, { result_url_temp: firstTempUrl, progress: 50 });

    const storageKeys: string[] = [];
    for (const img of falImages) {
      const storageKey = await downloadAndUpload(img.url, userId, output_format);
      storageKeys.push(storageKey);

      await adminClient.from("generations").insert({
        user_id: userId,
        prompt: prompt.slice(0, 5000),
        image_url: getPublicUrl(storageKey),
        aspect_ratio: modelSettings.aspect_ratio || null,
        resolution: modelSettings.resolution || modelSettings.image_size || null,
        output_format,
      });
    }

    const publicUrl = getPublicUrl(storageKeys[0]);

    await updateJob(adminClient, jobId, {
      status: "completed",
      progress: 100,
      result_url: publicUrl,
      result_url_temp: publicUrl,
      result_metadata: {
        storage_keys: storageKeys,
        count: storageKeys.length,
        format: output_format,
        dimensions: falImages[0]?.width ? { width: falImages[0].width, height: falImages[0].height } : null,
      },
      completed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[job ${jobId}] image processing failed:`, err);
    await updateJob(adminClient, jobId, {
      status: "failed", result_metadata: { error: err.message }, completed_at: new Date().toISOString(),
    });
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: body.cauris_cost || 2 });
  }
}

async function processImageGoogle(jobId: string, userId: string, body: any) {
  const adminClient = getAdminClient();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
  const { prompt, num_images = 1, image_url, ...rawSettings } = body;

  try {
    await updateJob(adminClient, jobId, { status: "processing", started_at: new Date().toISOString() });

    const modelSettings = filterSettings(rawSettings, ALLOWED_IMAGE_SETTINGS);
    const safeNumImages = Math.min(Math.max(1, Number(num_images) || 1), 4);

    let fullPrompt = prompt;
    if (modelSettings.aspect_ratio) fullPrompt += `\n\nAspect ratio: ${modelSettings.aspect_ratio}`;
    if (modelSettings.resolution) fullPrompt += `\nResolution: ${modelSettings.resolution}`;

    const content: any[] = [{ type: "text", text: `Generate an image.\n${fullPrompt}` }];
    if (image_url) content.push({ type: "image_url", image_url: { url: image_url } });
    const messages = [{ role: "user", content }];

    const storageKeys: string[] = [];

    for (let i = 0; i < safeNumImages; i++) {
      const aiResp = await fetch(LOVABLE_AI_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash-image", messages, modalities: ["image", "text"] }),
      });

      if (!aiResp.ok) {
        if (storageKeys.length === 0) throw new Error(`Lovable AI error: ${aiResp.status}`);
        break;
      }

      const aiData = await aiResp.json();
      const choice = aiData?.choices?.[0];
      const imageCandidates: string[] = [];

      const messageImages = choice?.message?.images;
      if (Array.isArray(messageImages)) {
        for (const img of messageImages) {
          const url = img?.image_url?.url;
          if (typeof url === "string" && url) imageCandidates.push(url);
        }
      }
      const messageContent = choice?.message?.content;
      if (Array.isArray(messageContent)) {
        for (const part of messageContent) {
          if (part?.type === "image_url" && typeof part?.image_url?.url === "string") imageCandidates.push(part.image_url.url);
        }
      }

      for (const imageSource of imageCandidates) {
        let storageKey: string;
        if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
          storageKey = await downloadAndUpload(imageSource, userId, "png");
        } else {
          const raw = imageSource.replace(/^data:image\/\w+;base64,/, "");
          const binaryStr = atob(raw);
          const bytes = new Uint8Array(binaryStr.length);
          for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
          storageKey = await uploadBytes(bytes, userId, "image/png", "png");
        }
        storageKeys.push(storageKey);

        const publicUrl = getPublicUrl(storageKey);
        await adminClient.from("generations").insert({
          user_id: userId, prompt: prompt.slice(0, 5000), image_url: publicUrl,
          aspect_ratio: modelSettings.aspect_ratio || null, resolution: modelSettings.resolution || null, output_format: "png",
        });

        if (storageKeys.length === 1) {
          await updateJob(adminClient, jobId, { result_url_temp: publicUrl, progress: 50 });
        }
      }
    }

    if (storageKeys.length === 0) throw new Error("No images generated");

    const publicUrl = getPublicUrl(storageKeys[0]);
    await updateJob(adminClient, jobId, {
      status: "completed", progress: 100, result_url: publicUrl, result_url_temp: publicUrl,
      result_metadata: { storage_keys: storageKeys, count: storageKeys.length, format: "png" },
      completed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[job ${jobId}] google image failed:`, err);
    await updateJob(adminClient, jobId, {
      status: "failed", result_metadata: { error: err.message }, completed_at: new Date().toISOString(),
    });
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: body.cauris_cost || 2 });
  }
}

async function processVideo(jobId: string, userId: string, body: any) {
  const adminClient = getAdminClient();
  const FAL_API_KEY = Deno.env.get("FAL_API_KEY")!;
  const { prompt, model_id, image_url, ...rawSettings } = body;

  try {
    await updateJob(adminClient, jobId, { status: "processing", started_at: new Date().toISOString() });

    const endpoint = VIDEO_ENDPOINTS[model_id];
    const modelSettings = filterSettings(rawSettings, ALLOWED_VIDEO_SETTINGS);

    const payload: Record<string, any> = { prompt, ...modelSettings };
    if (image_url) payload.image_url = image_url;

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) throw new Error(`Fal API error: ${submitResp.status}`);

    let submitData = await submitResp.json();

    if (submitData.request_id && !submitData.video?.url) {
      await updateJob(adminClient, jobId, { external_job_id: submitData.request_id, progress: 10 });
      submitData = await pollFalQueue(endpoint, submitData.request_id, FAL_API_KEY, 200);
    }

    const videoUrl = submitData.video?.url;
    if (!videoUrl) throw new Error("No video returned");

    await updateJob(adminClient, jobId, { result_url_temp: videoUrl, progress: 70 });

    const storageKey = await downloadAndUpload(videoUrl, userId, "mp4");
    const publicUrl = getPublicUrl(storageKey);

    await adminClient.from("generations").insert({
      user_id: userId, prompt: prompt.slice(0, 5000), image_url: publicUrl, media_type: "video",
    });

    await updateJob(adminClient, jobId, {
      status: "completed", progress: 100, result_url: publicUrl, result_url_temp: publicUrl,
      result_metadata: { storage_keys: [storageKey], format: "mp4" },
      completed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[job ${jobId}] video processing failed:`, err);
    await updateJob(adminClient, jobId, {
      status: "failed", result_metadata: { error: err.message }, completed_at: new Date().toISOString(),
    });
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: body.cauris_cost || 10 });
  }
}

async function processAudio(jobId: string, userId: string, body: any) {
  const adminClient = getAdminClient();
  const FAL_API_KEY = Deno.env.get("FAL_API_KEY")!;
  const { prompt, model_id, ...rawSettings } = body;

  try {
    await updateJob(adminClient, jobId, { status: "processing", started_at: new Date().toISOString() });

    const endpoint = AUDIO_ENDPOINTS[model_id];

    const payload: Record<string, any> = { prompt };
    if (model_id === "stable-audio") {
      payload.seconds_total = rawSettings.duration || 15;
      payload.steps = rawSettings.num_inference_steps || 25;
    } else if (model_id === "ace-step") {
      payload.duration = rawSettings.duration || 30;
      if (rawSettings.lyrics) payload.lyrics = String(rawSettings.lyrics).slice(0, 5000);
    } else if (model_id === "dia-tts") {
      delete payload.prompt; payload.text = prompt;
    } else if (model_id === "kokoro-tts") {
      delete payload.prompt; payload.text = prompt;
      if (rawSettings.voice) payload.voice = rawSettings.voice;
    } else if (model_id === "mmaudio") {
      payload.duration = rawSettings.duration || 5;
      if (rawSettings.image_url) payload.video_url = rawSettings.image_url;
    }
    delete payload.audio_type;
    delete payload.num_inference_steps;

    const submitResp = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) throw new Error(`Fal API error: ${submitResp.status}`);

    let result = await submitResp.json();
    if (result.request_id && !result.audio_file && !result.audio) {
      await updateJob(adminClient, jobId, { external_job_id: result.request_id, progress: 10 });
      result = await pollFalQueue(endpoint, result.request_id, FAL_API_KEY);
    }

    let audioUrl: string | null = null;
    if (result.audio_file?.url) audioUrl = result.audio_file.url;
    else if (result.audio?.url) audioUrl = result.audio.url;
    else if (result.output?.url) audioUrl = result.output.url;
    else if (typeof result.audio_url === "string") audioUrl = result.audio_url;

    if (!audioUrl) throw new Error("No audio returned");

    await updateJob(adminClient, jobId, { result_url_temp: audioUrl, progress: 70 });

    const storageKey = await downloadAndUpload(audioUrl, userId, "wav");
    const publicUrl = getPublicUrl(storageKey);

    await adminClient.from("generations").insert({
      user_id: userId, prompt: prompt.slice(0, 5000), image_url: publicUrl, media_type: "audio",
    });

    await updateJob(adminClient, jobId, {
      status: "completed", progress: 100, result_url: publicUrl, result_url_temp: publicUrl,
      result_metadata: { storage_keys: [storageKey], format: "wav" },
      completed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[job ${jobId}] audio processing failed:`, err);
    await updateJob(adminClient, jobId, {
      status: "failed", result_metadata: { error: err.message }, completed_at: new Date().toISOString(),
    });
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: body.cauris_cost || 5 });
  }
}

// ──────────────────────── MAIN HANDLER ────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Authentification invalide" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { tool_type, model_id, prompt, cauris_cost = 0 } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Un prompt est requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (prompt.length > 5000) {
      return new Response(JSON.stringify({ error: "Le prompt est trop long (max 5000 caractères)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!["image", "video", "audio"].includes(tool_type)) {
      return new Response(JSON.stringify({ error: "tool_type invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isGoogleModel = model_id === "google-direct";
    let provider = "fal";
    let endpoint: string | undefined;

    if (isGoogleModel) {
      provider = "lovable-ai";
    } else if (tool_type === "image") {
      endpoint = IMAGE_ENDPOINTS[model_id];
    } else if (tool_type === "video") {
      endpoint = VIDEO_ENDPOINTS[model_id];
    } else if (tool_type === "audio") {
      endpoint = AUDIO_ENDPOINTS[model_id];
    }

    if (!isGoogleModel && !endpoint) {
      return new Response(JSON.stringify({ error: "Modèle inconnu" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (tool_type === "image" && MODELS_USING_IMAGE_URLS.has(model_id)) {
      const hasImages = (body.image_urls?.length > 0) || !!body.image_url;
      if (!hasImages) {
        return new Response(JSON.stringify({ error: "Ce modèle d'édition nécessite au moins une image de référence." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const cost = typeof cauris_cost === "number" && cauris_cost > 0 ? cauris_cost : (
      tool_type === "video" ? 10 : tool_type === "audio" ? 5 : 2
    );

    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId, p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(JSON.stringify({ error: "Solde insuffisant" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: jobData, error: jobError } = await adminClient
      .from("generation_jobs")
      .insert({
        user_id: userId, provider, tool_type, model: model_id,
        prompt: prompt.slice(0, 5000), params: body, status: "pending", credits_used: cost,
      })
      .select("id")
      .single();

    if (jobError || !jobData) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      console.error("Job insert error:", jobError);
      return new Response(JSON.stringify({ error: "Erreur lors de la création du job" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const jobId = jobData.id;

    const response = new Response(
      JSON.stringify({ job_id: jobId, status: "pending", new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

    const bgPromise = (async () => {
      try {
        if (isGoogleModel) await processImageGoogle(jobId, userId, body);
        else if (tool_type === "image") await processImage(jobId, userId, body);
        else if (tool_type === "video") await processVideo(jobId, userId, body);
        else if (tool_type === "audio") await processAudio(jobId, userId, body);
      } catch (err) {
        console.error(`[job ${jobId}] unhandled background error:`, err);
      }
    })();

    if (typeof (globalThis as any).EdgeRuntime !== "undefined" && (globalThis as any).EdgeRuntime.waitUntil) {
      (globalThis as any).EdgeRuntime.waitUntil(bgPromise);
    } else {
      bgPromise.catch((e) => console.error("bg error:", e));
    }

    return response;
  } catch (e: any) {
    console.error("start-generation error:", e);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
