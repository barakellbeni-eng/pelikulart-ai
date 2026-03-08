import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { downloadAndUpload, downloadAndUploadDual, uploadBytes, uploadBytesDual, getPublicUrl } from "../_shared/storage.ts";

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

const KIE_AI_BASE = "https://api.kie.ai";

// ── KIE AI model IDs mapped to their KIE model names ──
const KIE_MODELS: Record<string, string> = {
  // Image
  "kie-nano-banana": "google/nano-banana",       // auto → google/nano-banana-edit with image
  "kie-nano-banana-pro": "nano-banana-pro",
  "kie-nano-banana-2": "nano-banana-2",
  "kie-imagen4": "google/imagen4",
  "kie-imagen4-fast": "google/imagen4-fast",
  "kie-imagen4-ultra": "google/imagen4-ultra",
  "kie-flux2-pro": "flux-2/pro-text-to-image",   // auto → flux-2/pro-image-to-image with image
  "kie-seedream-v45": "seedream/4.5-text-to-image", // auto → seedream/4.5-edit with image
  // Video
  "kie-kling-30": "kling-3.0/video",
  "kie-kling-26": "kling-2.6/text-to-video",     // auto → kling-2.6/image-to-video with image
  "kie-kling-25-turbo": "kling/v2-5-turbo-text-to-video-pro", // auto → kling/v2-5-turbo-image-to-video-pro with image
  "kie-kling-21": "kling/v2-1-master-text-to-video", // auto → kling/v2-1-master-image-to-video with image
  "kie-wan-26": "wan/2-6-text-to-video",          // auto → wan/2-6-image-to-video with image
  "kie-seedance-15-pro": "bytedance/seedance-1.5-pro",
  // Audio
  "kie-elevenlabs-sfx": "elevenlabs/sound-effect-v2",
  "kie-elevenlabs-tts": "elevenlabs/text-to-speech-multilingual-v2",
};

// Auto-switch map: model_id → [t2i_model, i2i_model]
const KIE_AUTO_SWITCH: Record<string, [string, string]> = {
  "kie-nano-banana": ["google/nano-banana", "google/nano-banana-edit"],
  "kie-flux2-pro": ["flux-2/pro-text-to-image", "flux-2/pro-image-to-image"],
  "kie-seedream-v45": ["seedream/4.5-text-to-image", "seedream/4.5-edit"],
  "kie-kling-26": ["kling-2.6/text-to-video", "kling-2.6/image-to-video"],
  "kie-kling-25-turbo": ["kling/v2-5-turbo-text-to-video-pro", "kling/v2-5-turbo-image-to-video-pro"],
  "kie-kling-21": ["kling/v2-1-master-text-to-video", "kling/v2-1-master-image-to-video"],
  "kie-wan-26": ["wan/2-6-text-to-video", "wan/2-6-image-to-video"],
};

// Models that use `image_input` param
const KIE_IMAGE_INPUT_MODELS = new Set(["nano-banana-pro", "nano-banana-2"]);
// Models that use `input_urls` param
const KIE_INPUT_URLS_MODELS = new Set(["flux-2/pro-image-to-image", "bytedance/seedance-1.5-pro"]);
// Models that use `aspect_ratio` + `resolution` (not `image_size`)
const KIE_ASPECT_RESOLUTION_MODELS = new Set(["nano-banana-pro", "nano-banana-2", "seedream/4.5-text-to-image", "seedream/4.5-edit"]);

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

// ──────────────────────── KIE AI HELPERS ────────────────────────

async function kieCreateTask(kieModel: string, input: Record<string, any>, apiKey: string): Promise<string> {
  const resp = await fetch(`${KIE_AI_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: kieModel, input }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("KIE createTask error:", resp.status, errText);
    throw new Error(`KIE AI error: ${resp.status} ${errText}`);
  }

  const data = await resp.json();
  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(`KIE AI error: ${data.msg || "No taskId returned"}`);
  }

  return data.data.taskId;
}

async function kiePollTask(taskId: string, apiKey: string, maxAttempts = 150): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const resp = await fetch(`${KIE_AI_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    let data: any;
    try { data = await resp.json(); } catch { continue; }

    if (data.code !== 200 || !data.data) continue;

    const state = data.data.state;
    if (state === "success") {
      let resultJson: any;
      try { resultJson = JSON.parse(data.data.resultJson); } catch {
        throw new Error("KIE AI: could not parse resultJson");
      }
      return resultJson;
    }
    if (state === "fail") {
      throw new Error(`KIE AI generation failed: ${data.data.failMsg || "unknown"}`);
    }
    // waiting, queuing, generating → continue polling
  }
  throw new Error("KIE AI generation timed out");
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
    const displayKeys: string[] = [];

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
        let originalKey: string;
        let displayKey: string;
        if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
          const dual = await downloadAndUploadDual(imageSource, userId, "png");
          originalKey = dual.originalKey;
          displayKey = dual.displayKey;
        } else {
          const raw = imageSource.replace(/^data:image\/\w+;base64,/, "");
          const binaryStr = atob(raw);
          const bytes = new Uint8Array(binaryStr.length);
          for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
          const dual = await uploadBytesDual(bytes, userId, "image/png", "png");
          originalKey = dual.originalKey;
          displayKey = dual.displayKey;
        }
        storageKeys.push(originalKey);
        displayKeys.push(displayKey);

        const dUrl = getPublicUrl(displayKey);
        await adminClient.from("generations").insert({
          user_id: userId, prompt: prompt.slice(0, 5000), image_url: dUrl,
          aspect_ratio: modelSettings.aspect_ratio || null, resolution: modelSettings.resolution || null, output_format: "png",
        });

        if (storageKeys.length === 1) {
          await updateJob(adminClient, jobId, { result_url_temp: dUrl, progress: 50 });
        }
      }
    }

    if (storageKeys.length === 0) throw new Error("No images generated");

    const displayUrl = getPublicUrl(displayKeys[0]);
    const originalUrl = getPublicUrl(storageKeys[0]);
    await updateJob(adminClient, jobId, {
      status: "completed", progress: 100, result_url: displayUrl, result_url_original: originalUrl, result_url_temp: displayUrl,
      result_metadata: { storage_keys: storageKeys, display_keys: displayKeys, count: storageKeys.length, format: "png" },
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
      status: "completed", progress: 100, result_url: publicUrl, result_url_original: publicUrl, result_url_temp: publicUrl,
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
      status: "completed", progress: 100, result_url: publicUrl, result_url_original: publicUrl, result_url_temp: publicUrl,
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

// ──────────────────────── KIE AI PROCESSOR ────────────────────────

async function processKie(jobId: string, userId: string, body: any) {
  const adminClient = getAdminClient();
  const KIE_API_KEY = Deno.env.get("KIE_AI_API_KEY");
  if (!KIE_API_KEY) throw new Error("KIE_AI_API_KEY is not configured");

  const { prompt, model_id, tool_type, image_url, image_urls, num_images = 1, ...rawSettings } = body;
  let kieModel = KIE_MODELS[model_id];
  if (!kieModel) throw new Error(`Unknown KIE model: ${model_id}`);

  try {
    await updateJob(adminClient, jobId, { status: "processing", started_at: new Date().toISOString() });

    // Build KIE input payload based on tool type
    const input: Record<string, any> = { prompt };

    // Determine if user provided images
    const imageList = (image_urls && Array.isArray(image_urls) && image_urls.length > 0)
      ? image_urls : (image_url ? [image_url] : []);
    const hasImages = imageList.length > 0;

    if (tool_type === "image") {
      // Auto-switch based on image presence
      if (hasImages && KIE_AUTO_SWITCH[model_id]) {
        kieModel = KIE_AUTO_SWITCH[model_id][1]; // switch to I2I/Edit variant
        console.log(`[KIE] Auto-switched to ${kieModel} (image provided)`);
      }

      // Param routing per model
      if (KIE_ASPECT_RESOLUTION_MODELS.has(kieModel)) {
        if (rawSettings.aspect_ratio) input.aspect_ratio = rawSettings.aspect_ratio;
        if (rawSettings.resolution) input.resolution = rawSettings.resolution;
      } else {
        // google/nano-banana, google/nano-banana-edit, imagen4, etc. use image_size
        if (rawSettings.image_size) input.image_size = rawSettings.image_size;
        else if (rawSettings.aspect_ratio) input.image_size = rawSettings.aspect_ratio;
      }
      if (rawSettings.output_format) input.output_format = rawSettings.output_format;
      if (rawSettings.google_search !== undefined) input.google_search = rawSettings.google_search;

      // Image input param routing
      if (hasImages) {
        if (KIE_IMAGE_INPUT_MODELS.has(kieModel)) {
          input.image_input = imageList.slice(0, 14);
        } else if (KIE_INPUT_URLS_MODELS.has(kieModel)) {
          input.input_urls = imageList.slice(0, 8);
        } else {
          input.image_urls = imageList.slice(0, 10);
        }
      }
    } else if (tool_type === "video") {
      // Auto-switch video T2V → I2V
      if (hasImages && KIE_AUTO_SWITCH[model_id]) {
        kieModel = KIE_AUTO_SWITCH[model_id][1];
        console.log(`[KIE] Auto-switched to ${kieModel} (image provided)`);
      }

      if (rawSettings.duration) input.duration = String(rawSettings.duration);
      if (rawSettings.resolution) input.resolution = rawSettings.resolution;
      if (rawSettings.generate_audio !== undefined) input.generate_audio = rawSettings.generate_audio;
      if (rawSettings.negative_prompt) input.negative_prompt = rawSettings.negative_prompt;
      if (rawSettings.cfg_scale !== undefined) input.cfg_scale = rawSettings.cfg_scale;

      // Kling 2.6 I2V does NOT support aspect_ratio, only T2V does
      const isKling26I2V = kieModel === "kling-2.6/image-to-video";
      if (rawSettings.aspect_ratio && !isKling26I2V) input.aspect_ratio = rawSettings.aspect_ratio;

      // Sound param (Kling 2.6 & 3.0)
      if (rawSettings.sound !== undefined) input.sound = rawSettings.sound;

      // Kling 3.0 specific (unified model, accepts image_urls optionally)
      if (kieModel === "kling-3.0/video") {
        input.multi_shots = false;
        if (rawSettings.mode) input.mode = rawSettings.mode;
      }

      // Image input for video
      if (hasImages) {
        // V2.5 Turbo I2V and V2.1 Master I2V use singular `image_url`
        const singularImageUrlModels = new Set([
          "kling/v2-5-turbo-image-to-video-pro",
          "kling/v2-1-master-image-to-video",
        ]);

        if (KIE_INPUT_URLS_MODELS.has(kieModel)) {
          input.input_urls = imageList.slice(0, 2);
        } else if (singularImageUrlModels.has(kieModel)) {
          input.image_url = imageList[0];
        } else {
          input.image_urls = imageList.slice(0, 1);
        }
      }
    } else if (tool_type === "audio") {
      if (rawSettings.duration) input.duration = rawSettings.duration;
      if (kieModel.includes("text-to-speech")) {
        input.text = prompt;
        delete input.prompt;
      }
    }

    console.log(`[KIE] Creating task for ${kieModel}`);
    const taskId = await kieCreateTask(kieModel, input, KIE_API_KEY);
    await updateJob(adminClient, jobId, { external_job_id: taskId, progress: 10 });

    console.log(`[KIE] Polling task ${taskId}`);
    const result = await kiePollTask(taskId, KIE_API_KEY);

    // Extract result URLs
    const resultUrls: string[] = result.resultUrls || [];
    const resultObject = result.resultObject;

    if (resultUrls.length === 0 && !resultObject) {
      throw new Error("KIE AI: no results returned");
    }

    // Determine media type and format
    const isVideo = tool_type === "video";
    const isAudio = tool_type === "audio";
    const format = isVideo ? "mp4" : isAudio ? "wav" : "png";
    const mediaType = isVideo ? "video" : isAudio ? "audio" : "image";

    // Download and store results (handle multiple for images)
    const safeNumImages = isVideo || isAudio ? 1 : Math.min(Math.max(1, Number(num_images) || 1), 4);
    const urlsToProcess = resultUrls.slice(0, safeNumImages);

    if (urlsToProcess.length === 0) throw new Error("KIE AI: no result URLs");

    // Set temp URL immediately
    await updateJob(adminClient, jobId, { result_url_temp: urlsToProcess[0], progress: 50 });

    const storageKeys: string[] = [];
    const displayKeys: string[] = [];
    const isImageType = !isVideo && !isAudio;
    for (const url of urlsToProcess) {
      try {
        if (isImageType) {
          const { originalKey, displayKey } = await downloadAndUploadDual(url, userId, format);
          storageKeys.push(originalKey);
          displayKeys.push(displayKey);
          const dUrl = getPublicUrl(displayKey);
          await adminClient.from("generations").insert({
            user_id: userId, prompt: prompt.slice(0, 5000), image_url: dUrl,
            media_type: mediaType, aspect_ratio: rawSettings.aspect_ratio || rawSettings.image_size || null,
          });
        } else {
          const storageKey = await downloadAndUpload(url, userId, format);
          storageKeys.push(storageKey);
          displayKeys.push(storageKey);
          const publicUrl = getPublicUrl(storageKey);
          await adminClient.from("generations").insert({
            user_id: userId, prompt: prompt.slice(0, 5000), image_url: publicUrl,
            media_type: mediaType, aspect_ratio: rawSettings.aspect_ratio || rawSettings.image_size || null,
          });
        }
      } catch (dlErr) {
        console.error(`[KIE] Download error for ${url}:`, dlErr);
        storageKeys.push(url);
        displayKeys.push(url);
      }
    }

    const finalDisplayUrl = displayKeys.length > 0
      ? (displayKeys[0].startsWith("http") ? displayKeys[0] : getPublicUrl(displayKeys[0]))
      : urlsToProcess[0];
    const finalOriginalUrl = storageKeys.length > 0
      ? (storageKeys[0].startsWith("http") ? storageKeys[0] : getPublicUrl(storageKeys[0]))
      : urlsToProcess[0];

    await updateJob(adminClient, jobId, {
      status: "completed", progress: 100, result_url: finalDisplayUrl, result_url_original: finalOriginalUrl, result_url_temp: finalDisplayUrl,
      result_metadata: { storage_keys: storageKeys, display_keys: displayKeys, count: storageKeys.length, format, provider: "kie" },
      completed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[job ${jobId}] KIE processing failed:`, err);
    await updateJob(adminClient, jobId, {
      status: "failed", result_metadata: { error: err.message, provider: "kie" }, completed_at: new Date().toISOString(),
    });
    const defaultCost = tool_type === "video" ? 10 : tool_type === "audio" ? 5 : 2;
    await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: body.cauris_cost || defaultCost });
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
    const isKieModel = !!KIE_MODELS[model_id];
    let provider = "fal";
    let endpoint: string | undefined;

    if (isGoogleModel) {
      provider = "lovable-ai";
    } else if (isKieModel) {
      provider = "kie";
    } else if (tool_type === "image") {
      endpoint = IMAGE_ENDPOINTS[model_id];
    } else if (tool_type === "video") {
      endpoint = VIDEO_ENDPOINTS[model_id];
    } else if (tool_type === "audio") {
      endpoint = AUDIO_ENDPOINTS[model_id];
    }

    if (!isGoogleModel && !isKieModel && !endpoint) {
      return new Response(JSON.stringify({ error: "Modèle inconnu" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (tool_type === "image" && MODELS_USING_IMAGE_URLS.has(model_id)) {
      const hasImages = (body.image_urls?.length > 0) || !!body.image_url;
      if (!hasImages) {
        return new Response(JSON.stringify({ error: "Ce modèle d'édition nécessite au moins une image de référence." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ── Concurrent job limits per user ──
    const maxConcurrent = tool_type === "video" ? 2 : 4;
    const { count: activeCount, error: countError } = await adminClient
      .from("generation_jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("tool_type", tool_type)
      .in("status", ["pending", "processing"])
      .is("deleted_at", null);

    if (!countError && (activeCount ?? 0) >= maxConcurrent) {
      const label = tool_type === "video" ? "vidéos" : tool_type === "audio" ? "audios" : "images";
      return new Response(
        JSON.stringify({ error: `Limite atteinte : ${maxConcurrent} ${label} simultanées maximum. Attendez qu'un job se termine.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
        if (isKieModel) await processKie(jobId, userId, body);
        else if (isGoogleModel) await processImageGoogle(jobId, userId, body);
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
