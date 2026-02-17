import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Model endpoint mapping
const MODEL_ENDPOINTS: Record<string, string> = {
  "nano-banana-pro": "https://queue.fal.run/fal-ai/nano-banana-pro",
  "flux-dev": "https://queue.fal.run/fal-ai/flux/dev",
  "flux-schnell": "https://queue.fal.run/fal-ai/flux/schnell",
  "flux-pro-ultra": "https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra",
  "flux-kontext": "https://queue.fal.run/fal-ai/flux-pro/kontext",
  "recraft-v3": "https://queue.fal.run/fal-ai/recraft/v3",
  "ideogram-v2": "https://queue.fal.run/fal-ai/ideogram/v2",
  "imagen4": "https://queue.fal.run/fal-ai/imagen4/preview",
  "fast-sdxl": "https://queue.fal.run/fal-ai/fast-sdxl",
  "hidream-i1": "https://queue.fal.run/fal-ai/hidream-i1-full",
  "flux2-dev": "https://queue.fal.run/fal-ai/flux2/dev",
};

async function pollForResult(endpoint: string, requestId: string, apiKey: string): Promise<any> {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusResp = await fetch(`${endpoint}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    const statusData = await statusResp.json();
    console.log("Poll attempt", i + 1, "status:", statusData.status);
    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`${endpoint}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      return await resultResp.json();
    }
    if (statusData.status === "FAILED") {
      throw new Error("Image generation failed on Fal AI");
    }
  }
  throw new Error("Generation timed out");
}

async function downloadAndUpload(
  supabase: any,
  imageUrl: string,
  userId: string,
  format: string,
): Promise<string> {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error("Failed to download generated image");
  const arrayBuffer = await resp.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const ext = format === "jpeg" ? "jpg" : format;
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("generations")
    .upload(fileName, uint8, {
      contentType: `image/${format}`,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error("Failed to upload image to storage");
  }

  const { data: publicUrlData } = supabase.storage
    .from("generations")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase config missing");
    }

    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    let user: { id: string } | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await userClient.auth.getClaims(token);
      if (!error && data?.claims?.sub) {
        user = { id: data.claims.sub as string };
      }
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const {
      prompt,
      model_id = "nano-banana-pro",
      output_format = "png",
      num_images = 1,
      image_url,
      // All other settings are model-specific and passed through
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
        JSON.stringify({ error: `Unknown model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build payload — always include prompt and num_images
    const payload: Record<string, any> = {
      prompt,
      num_images: Math.min(num_images, 4),
      output_format,
      ...modelSettings,
    };

    // Remove empty/null values and seed=0
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
      if (key === "seed" && payload[key] === 0) {
        delete payload[key];
      }
    }

    if (image_url) payload.image_url = image_url;

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

    const submitData = await submitResp.json();
    let falImages = submitData.images;

    if (!falImages?.length && submitData.request_id) {
      const result = await pollForResult(endpoint, submitData.request_id, FAL_API_KEY);
      falImages = result.images;
    }

    if (!falImages?.length) {
      return new Response(
        JSON.stringify({ error: "No images generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const savedImages = [];
    for (const img of falImages) {
      try {
        const storedUrl = await downloadAndUpload(
          adminClient,
          img.url,
          user?.id || "anonymous",
          output_format,
        );

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

        savedImages.push({
          url: storedUrl,
          width: img.width,
          height: img.height,
        });
      } catch (uploadErr) {
        console.error("Upload/save error:", uploadErr);
        savedImages.push({
          url: img.url,
          width: img.width,
          height: img.height,
        });
      }
    }

    return new Response(
      JSON.stringify({ images: savedImages }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
