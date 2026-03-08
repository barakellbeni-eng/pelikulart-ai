import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { uploadBytes, downloadAndUpload, getPublicUrl } from "../_shared/storage.ts";

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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

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
    const { prompt, num_images = 1, cauris_cost = 0, image_url, project_id, ...rawSettings } = body;

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

    const cost = typeof cauris_cost === "number" && cauris_cost > 0 ? cauris_cost : 2;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId, p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let fullPrompt = prompt;
    if (modelSettings.aspect_ratio) fullPrompt += `\n\nAspect ratio: ${modelSettings.aspect_ratio}`;
    if (modelSettings.resolution) fullPrompt += `\nResolution: ${modelSettings.resolution}`;

    const content: any[] = [{ type: "text", text: `Generate an image based on this description: ${fullPrompt}` }];
    if (image_url) content.push({ type: "image_url", image_url: { url: image_url } });

    const messages = [{ role: "user", content }];
    const savedImages = [];

    for (let i = 0; i < safeNumImages; i++) {
      console.log(`Generating image ${i + 1}/${safeNumImages} via Lovable AI gateway`);

      let imageCandidates: string[] = [];
      const MAX_RETRIES = 2;

      for (let attempt = 0; attempt <= MAX_RETRIES && imageCandidates.length === 0; attempt++) {
        const promptMessages = attempt === 0
          ? messages
          : [{ role: "user", content: [{ type: "text", text: `Create a high quality image: ${fullPrompt}. Output only the image.` }] }];

        if (attempt > 0) console.log(`Retry attempt ${attempt} for image ${i + 1}`);

        const aiResp = await fetch(LOVABLE_AI_ENDPOINT, {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image", messages: promptMessages, modalities: ["image", "text"] }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          console.error("Lovable AI error:", aiResp.status, errText);
          if (savedImages.length === 0 && attempt === MAX_RETRIES) {
            await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
            if (aiResp.status === 429) {
              return new Response(JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques secondes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
            if (aiResp.status === 402) {
              return new Response(JSON.stringify({ error: "Crédits IA insuffisants pour effectuer la génération." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
          }
          if (!aiResp.ok) break;
        }

        const aiData = await aiResp.json();
        const choice = aiData?.choices?.[0];

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
            if (part?.type === "image_url" && typeof url === "string" && url) imageCandidates.push(url);
          }
        }

        if (typeof messageContent === "string" && messageContent.startsWith("data:image")) {
          imageCandidates.push(messageContent);
        }

        if (!imageCandidates.length) {
          console.warn(`Attempt ${attempt}: No image returned`);
        }
      }

      for (const imageSource of imageCandidates) {
        try {
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

          const publicUrl = getPublicUrl(storageKey);

          await adminClient.from("generations").insert({
            user_id: userId,
            prompt: prompt.slice(0, 5000),
            image_url: publicUrl,
            aspect_ratio: modelSettings.aspect_ratio || null,
            resolution: modelSettings.resolution || null,
            output_format: "png",
            project_id: project_id || null,
          });

          savedImages.push({ url: publicUrl });
        } catch (uploadErr) {
          console.error("Storage upload error:", uploadErr);
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
