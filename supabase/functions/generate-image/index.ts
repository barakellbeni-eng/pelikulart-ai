import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { downloadAndUploadToR2, getR2SignedUrl } from "../_shared/r2.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_ENDPOINTS: Record<string, string> = {
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

const MODELS_USING_IMAGE_URLS = new Set([
  "seedream-v4-edit", "seedream-v45-edit", "flux2-dev-edit", "nano-banana-pro-edit",
]);

const ALLOWED_SETTINGS = new Set([
  "aspect_ratio", "resolution", "image_size", "guidance_scale", "seed",
  "negative_prompt", "num_inference_steps", "style", "safety_tolerance",
  "enable_safety_checker", "expand_prompt", "raw",
]);

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

    // --- Authentication ---
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = claimsData.claims.sub as string;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const {
      prompt,
      model_id = "nano-banana-pro",
      output_format = "png",
      num_images = 1,
      image_url,
      image_urls,
      cauris_cost = 0,
      project_id,
      ...rawSettings
    } = body;

    // --- Input validation ---
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Un prompt est requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Le prompt est trop long (max 5000 caractères)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const endpoint = MODEL_ENDPOINTS[model_id];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Modèle inconnu" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const safeNumImages = Math.min(Math.max(1, Number(num_images) || 1), 4);

    const modelSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawSettings)) {
      if (ALLOWED_SETTINGS.has(key) && value !== "" && value !== null && value !== undefined) {
        if (key === "seed" && value === 0) continue;
        modelSettings[key] = value;
      }
    }

    // --- Credit deduction ---
    const cost = typeof cauris_cost === "number" && cauris_cost > 0 ? cauris_cost : 2;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId,
      p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Edit models require at least one reference image
    const isEditModel = MODELS_USING_IMAGE_URLS.has(model_id);
    const hasImages = (image_urls && Array.isArray(image_urls) && image_urls.length > 0) || !!image_url;
    if (isEditModel && !hasImages) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Ce modèle d'édition nécessite au moins une image de référence." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build payload
    const payload: Record<string, any> = {
      prompt,
      num_images: safeNumImages,
      output_format,
      ...modelSettings,
    };

    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      if (MODELS_USING_IMAGE_URLS.has(model_id)) {
        payload.image_urls = image_urls.slice(0, 5);
      } else {
        payload.image_url = image_urls[0];
      }
    } else if (image_url) {
      if (MODELS_USING_IMAGE_URLS.has(model_id)) {
        payload.image_urls = [image_url];
      } else {
        payload.image_url = image_url;
      }
    }

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
      const errText = await submitResp.text();
      console.error("Fal submit error:", submitResp.status, errText);
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });

      if (submitResp.status === 500 && errText.includes("temporarily overloaded")) {
        return new Response(
          JSON.stringify({ error: "Le service IA est temporairement surchargé. Réessayez dans quelques secondes." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Erreur du service de génération. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const submitData = await submitResp.json();
    const falImages = submitData.images || submitData.output?.images;

    if (!falImages?.length) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const savedImages = [];
    for (const img of falImages) {
      try {
        // Upload to R2 instead of Supabase storage
        const r2Key = await downloadAndUploadToR2(img.url, userId, output_format);

        // Store with r2: prefix in DB to distinguish from old Supabase paths
        await adminClient.from("generations").insert({
          user_id: userId,
          prompt: prompt.slice(0, 5000),
          image_url: `r2:${r2Key}`,
          aspect_ratio: modelSettings.aspect_ratio || null,
          resolution: modelSettings.resolution || modelSettings.image_size || null,
          output_format,
          project_id: project_id || null,
        });

        // Generate a presigned URL for immediate display
        const signedUrl = await getR2SignedUrl(r2Key, 3600);
        savedImages.push({ url: signedUrl, width: img.width, height: img.height });
      } catch (uploadErr) {
        console.error("R2 upload error:", uploadErr);
        // Fallback to fal URL
        savedImages.push({ url: img.url, width: img.width, height: img.height });
      }
    }

    return new Response(
      JSON.stringify({ images: savedImages, new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
