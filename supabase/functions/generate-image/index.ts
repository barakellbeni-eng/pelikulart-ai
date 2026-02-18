import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREEPIK_BASE = "https://api.freepik.com";

const MODEL_PATHS: Record<string, string> = {
  "classic-fast": "/v1/ai/text-to-image",
  "mystic": "/v1/ai/mystic",
  "flux-pro-v1-1": "/v1/ai/text-to-image/flux-pro-v1-1",
  "flux-2-pro": "/v1/ai/text-to-image/flux-2-pro",
  "flux-2-turbo": "/v1/ai/text-to-image/flux-2-turbo",
  "flux-dev": "/v1/ai/text-to-image/flux-dev",
  "hyperflux": "/v1/ai/text-to-image/hyperflux",
  "seedream-v4": "/v1/ai/text-to-image/seedream-v4",
  "seedream-v45": "/v1/ai/text-to-image/seedream-v4-5",
  "flux-kontext-pro": "/v1/ai/text-to-image/flux-kontext-pro",
  "runway-t2i": "/v1/ai/text-to-image/runway",
};

// Classic endpoint is synchronous (returns base64), all others are async (task_id + polling)
const SYNC_MODELS = new Set(["classic-fast"]);

async function pollForResult(endpoint: string, taskId: string, apiKey: string): Promise<any> {
  const pollUrl = `${FREEPIK_BASE}${endpoint}/${taskId}`;
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
        const errText = await resp.text();
        console.warn(`Poll ${i + 1}: HTTP ${resp.status} - ${errText.slice(0, 100)}`);
        if (consecutiveErrors > 20) throw new Error(`Polling failed after ${consecutiveErrors} errors`);
        continue;
      }

      consecutiveErrors = 0;
      const data = await resp.json();
      const status = data.data?.status;
      console.log(`Poll ${i + 1}: status=${status}`);

      if (status === "COMPLETED") return data;
      if (status === "FAILED") throw new Error("Image generation failed on Freepik");
    } catch (err: any) {
      if (err.message?.includes("failed") || err.message?.includes("Polling")) throw err;
      consecutiveErrors++;
      console.warn(`Poll ${i + 1}: network error - ${err.message}`);
      if (consecutiveErrors > 10) throw new Error("Polling aborted after network errors");
    }
  }
  throw new Error("Generation timed out");
}

async function downloadAndUpload(
  supabase: any, imageUrl: string, userId: string, format: string
): Promise<string> {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error("Failed to download generated image");
  const uint8 = new Uint8Array(await resp.arrayBuffer());
  const ext = format === "jpeg" ? "jpg" : format;
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("generations")
    .upload(fileName, uint8, { contentType: `image/${format}`, upsert: false });
  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error("Failed to upload image to storage");
  }

  const { data: publicUrlData } = supabase.storage.from("generations").getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

async function base64ToUpload(
  supabase: any, base64: string, userId: string, format: string
): Promise<string> {
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const ext = format === "jpeg" ? "jpg" : format;
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("generations")
    .upload(fileName, binary, { contentType: `image/${format}`, upsert: false });
  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error("Failed to upload image to storage");
  }

  const { data: publicUrlData } = supabase.storage.from("generations").getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FREEPIK_API_KEY = Deno.env.get("FREEPIK_API_KEY");
    if (!FREEPIK_API_KEY) throw new Error("FREEPIK_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    // Auth
    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    let user: { id: string } | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await userClient.auth.getClaims(token);
      if (!error && data?.claims?.sub) user = { id: data.claims.sub as string };
    }
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const {
      prompt, model_id = "mystic", output_format = "png",
      num_images = 1, image_url, ...modelSettings
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const path = MODEL_PATHS[model_id];
    if (!path) {
      return new Response(JSON.stringify({ error: `Unknown model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build payload
    const payload: Record<string, any> = { prompt, num_images: Math.min(num_images, 4) };

    // Classic fast uses nested image.size format
    if (model_id === "classic-fast") {
      payload.image = { size: modelSettings.image_size || "square_1_1" };
      if (modelSettings.negative_prompt) payload.negative_prompt = modelSettings.negative_prompt;
      if (modelSettings.guidance_scale) payload.guidance_scale = modelSettings.guidance_scale;
      if (modelSettings.seed) payload.seed = modelSettings.seed;
      if (modelSettings.styling?.style) payload.styling = { style: modelSettings.styling.style };
    } else {
      // Other models: pass settings directly
      for (const [key, value] of Object.entries(modelSettings)) {
        if (value === "" || value === null || value === undefined) continue;
        if (key === "seed" && value === 0) continue;
        if (key === "image_size") continue; // handled separately if needed
        payload[key] = value;
      }
      if (modelSettings.image_size) payload.image_size = modelSettings.image_size;
    }

    // Image input for models that support it (Flux Kontext, etc.)
    if (image_url) payload.image_url = image_url;

    // Clean empty values
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) delete payload[key];
      if (key === "seed" && payload[key] === 0) delete payload[key];
    }

    const endpoint = `${FREEPIK_BASE}${path}`;
    console.log(`Submitting to ${model_id} (${endpoint}):`, JSON.stringify(payload));

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
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: `Erreur Freepik (${submitResp.status}). Réessayez.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const submitData = await submitResp.json();
    console.log("Freepik response keys:", JSON.stringify(submitData).slice(0, 300));

    let imageUrls: string[] = [];

    if (SYNC_MODELS.has(model_id)) {
      // Classic: synchronous response with base64
      const images = submitData.data;
      if (Array.isArray(images)) {
        for (const img of images) {
          if (img.base64) {
            const storedUrl = await base64ToUpload(adminClient, img.base64, user?.id || "anonymous", output_format);
            imageUrls.push(storedUrl);
          }
        }
      }
    } else {
      // Async: get task_id and poll
      const taskId = submitData.data?.task_id;
      if (!taskId) {
        // Maybe it completed immediately
        const generated = submitData.data?.generated;
        if (generated?.length) {
          imageUrls = generated;
        } else {
          throw new Error("No task_id returned from Freepik");
        }
      } else {
        const result = await pollForResult(path, taskId, FREEPIK_API_KEY);
        imageUrls = result.data?.generated || [];
      }
    }

    if (!imageUrls.length) {
      return new Response(JSON.stringify({ error: "No images generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Upload to storage and save to DB
    const savedImages = [];
    for (const url of imageUrls) {
      try {
        let storedUrl: string;
        if (url.startsWith("http")) {
          storedUrl = await downloadAndUpload(adminClient, url, user?.id || "anonymous", output_format);
        } else {
          storedUrl = url; // Already uploaded (base64 case)
        }

        if (user) {
          await adminClient.from("generations").insert({
            user_id: user.id,
            prompt,
            image_url: storedUrl,
            aspect_ratio: modelSettings.aspect_ratio || null,
            resolution: modelSettings.resolution || modelSettings.image_size || null,
            output_format,
          });
        }

        savedImages.push({ url: storedUrl, width: null, height: null });
      } catch (uploadErr) {
        console.error("Upload/save error:", uploadErr);
        savedImages.push({ url, width: null, height: null });
      }
    }

    return new Response(JSON.stringify({ images: savedImages }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
