import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { uploadBytesToR2, downloadAndUploadToR2, getR2SignedUrl } from "../_shared/r2.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const ALLOWED_SETTINGS = new Set(["aspect_ratio", "resolution"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
    const { prompt, num_images = 1, cauris_cost = 0, image_url, ...rawSettings } = body;

    // --- Validation ---
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

    const safeNumImages = Math.min(Math.max(1, Number(num_images) || 1), 4);

    const modelSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawSettings)) {
      if (ALLOWED_SETTINGS.has(key) && value !== "" && value !== null && value !== undefined) {
        modelSettings[key] = value;
      }
    }

    // --- Deduct credits ---
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

    // --- Build prompt with settings ---
    let fullPrompt = prompt;
    if (modelSettings.aspect_ratio) {
      fullPrompt += `\n\nAspect ratio: ${modelSettings.aspect_ratio}`;
    }
    if (modelSettings.resolution) {
      fullPrompt += `\nResolution: ${modelSettings.resolution}`;
    }

    const content: any[] = [{ type: "text", text: `Generate an image.\n${fullPrompt}` }];
    if (image_url) {
      content.push({ type: "image_url", image_url: { url: image_url } });
    }

    const messages = [{ role: "user", content }];
    const savedImages = [];

    for (let i = 0; i < safeNumImages; i++) {
      console.log(`Generating image ${i + 1}/${safeNumImages} via Lovable AI gateway`);

      const aiResp = await fetch(LOVABLE_AI_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages,
          modalities: ["image", "text"],
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("Lovable AI error:", aiResp.status, errText);

        if (savedImages.length === 0) {
          await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });

          if (aiResp.status === 429) {
            return new Response(
              JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques secondes." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
          if (aiResp.status === 402) {
            return new Response(
              JSON.stringify({ error: "Crédits IA insuffisants pour effectuer la génération." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
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
          const url = part?.image_url?.url;
          if (part?.type === "image_url" && typeof url === "string" && url) {
            imageCandidates.push(url);
          }
        }
      }

      if (!imageCandidates.length) {
        console.error("No image returned by Lovable AI", {
          hasMessageImages: Array.isArray(messageImages),
          contentIsArray: Array.isArray(messageContent),
          finishReason: choice?.finish_reason ?? null,
        });
      }

      for (const imageSource of imageCandidates) {
        try {
          let r2Key: string;

          if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
            r2Key = await downloadAndUploadToR2(imageSource, userId, "png");
          } else {
            // Base64 image
            const raw = imageSource.replace(/^data:image\/\w+;base64,/, "");
            const binaryStr = atob(raw);
            const bytes = new Uint8Array(binaryStr.length);
            for (let j = 0; j < binaryStr.length; j++) {
              bytes[j] = binaryStr.charCodeAt(j);
            }
            r2Key = await uploadBytesToR2(bytes, userId, "image/png", "png");
          }

          // Store with r2: prefix
          await adminClient.from("generations").insert({
            user_id: userId,
            prompt: prompt.slice(0, 5000),
            image_url: `r2:${r2Key}`,
            aspect_ratio: modelSettings.aspect_ratio || null,
            resolution: modelSettings.resolution || null,
            output_format: "png",
          });

          const signedUrl = await getR2SignedUrl(r2Key, 3600);
          savedImages.push({ url: signedUrl });
        } catch (uploadErr) {
          console.error("R2 upload error:", uploadErr);
        }
      }
    }

    if (savedImages.length === 0) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée. Essayez un prompt différent." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ images: savedImages, new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-image-google error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
