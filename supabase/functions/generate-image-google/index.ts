import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_AI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const ALLOWED_SETTINGS = new Set([
  "aspect_ratio", "resolution",
]);

async function downloadAndUpload(
  supabase: any,
  imageData: string,
  userId: string,
  format: string,
): Promise<string> {
  // imageData is base64
  const binaryStr = atob(imageData);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const ext = format === "jpeg" ? "jpg" : format;
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("generations")
    .upload(fileName, bytes, {
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
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) throw new Error("GOOGLE_AI_API_KEY is not configured");

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
    const {
      prompt,
      num_images = 1,
      cauris_cost = 0,
      image_url,
      ...rawSettings
    } = body;

    // --- Validation ---
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
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Build Google AI request ---
    // Build the prompt with aspect ratio/resolution hints
    let fullPrompt = prompt;
    if (modelSettings.aspect_ratio) {
      fullPrompt += `\n\nAspect ratio: ${modelSettings.aspect_ratio}`;
    }
    if (modelSettings.resolution) {
      fullPrompt += `\nResolution: ${modelSettings.resolution}`;
    }

    const contents: any[] = [];

    // If there's a reference image, include it
    if (image_url) {
      if (image_url.startsWith("data:")) {
        // Base64 data URL
        const match = image_url.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          contents.push({
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: `image/${match[1]}`,
                  data: match[2],
                },
              },
              { text: fullPrompt },
            ],
          });
        } else {
          contents.push({ role: "user", parts: [{ text: fullPrompt }] });
        }
      } else {
        // URL - download and convert to base64
        try {
          const imgResp = await fetch(image_url);
          if (imgResp.ok) {
            const imgBuf = await imgResp.arrayBuffer();
            const imgBase64 = btoa(String.fromCharCode(...new Uint8Array(imgBuf)));
            const ct = imgResp.headers.get("content-type") || "image/png";
            contents.push({
              role: "user",
              parts: [
                { inline_data: { mime_type: ct, data: imgBase64 } },
                { text: fullPrompt },
              ],
            });
          } else {
            contents.push({ role: "user", parts: [{ text: fullPrompt }] });
          }
        } catch {
          contents.push({ role: "user", parts: [{ text: fullPrompt }] });
        }
      }
    } else {
      contents.push({ role: "user", parts: [{ text: fullPrompt }] });
    }

    const savedImages = [];

    // Generate images one by one (Gemini generates one image per call)
    for (let i = 0; i < safeNumImages; i++) {
      console.log(`Google AI: generating image ${i + 1}/${safeNumImages}`);

      const googlePayload = {
        contents,
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      };

      const googleResp = await fetch(
        `${GOOGLE_AI_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(googlePayload),
        }
      );

      if (!googleResp.ok) {
        const errText = await googleResp.text();
        console.error("Google AI error:", googleResp.status, errText);

        if (savedImages.length === 0) {
          // Refund on first failure
          await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });

          if (googleResp.status === 429) {
            return new Response(
              JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques secondes." }),
              { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ error: "Erreur du service Google AI. Réessayez." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break; // Already got some images, return what we have
      }

      const googleData = await googleResp.json();

      // Extract images from response
      const candidates = googleData.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith("image/")) {
            try {
              const format = part.inlineData.mimeType.replace("image/", "");
              const storedUrl = await downloadAndUpload(
                adminClient,
                part.inlineData.data,
                userId,
                format || "png"
              );

              await adminClient.from("generations").insert({
                user_id: userId,
                prompt: prompt.slice(0, 5000),
                image_url: storedUrl,
                aspect_ratio: modelSettings.aspect_ratio || null,
                resolution: modelSettings.resolution || null,
                output_format: format || "png",
              });

              savedImages.push({ url: storedUrl });
            } catch (uploadErr) {
              console.error("Upload error:", uploadErr);
            }
          }
        }
      }
    }

    if (savedImages.length === 0) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée. Essayez un prompt différent." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ images: savedImages, new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-image-google error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue. Réessayez." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
