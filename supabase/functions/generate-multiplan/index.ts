import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { uploadBytes, getPublicUrl } from "../_shared/storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
    const { image_url, plan_type, mode, plan_index, project_id } = body;

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: "Une image source est requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Cost: 3 cauris for "vary" (4 images), 2 cauris for single plan
    const cost = mode === "vary" ? 3 : 2;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId, p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const planTypeMap: Record<string, string> = {
      "close-up": "close-up shot",
      "macro": "macro shot",
      "serre": "tight/medium close-up shot",
      "americain": "american shot (knee-level framing)",
      "large": "wide shot",
      "tres-large": "extreme wide shot",
      "plongee": "high-angle (bird's eye) shot",
      "contre-plongee": "low-angle (worm's eye) shot",
    };

    const planLabel = planTypeMap[plan_type] || plan_type;

    const angleVariations = [
      "from the front, slightly to the left",
      "from the right side, 45 degrees",
      "from a higher angle, looking down",
      "from a lower angle, looking up",
    ];

    let prompt: string;
    if (mode === "vary") {
      // prompt will be customized per iteration below
      prompt = "";
    } else {
      prompt = `Generate only the ${plan_index === 1 ? "first" : plan_index === 2 ? "second" : plan_index === 3 ? "third" : "fourth"} cinematic shot of this image as a ${planLabel}. Keep the same subject, same scene, same lighting, change only the camera angle. Output one high-quality image.`;
    }

    const numImages = mode === "vary" ? 4 : 1;
    const savedImages: { url: string; job_id: string }[] = [];

    for (let i = 0; i < numImages; i++) {
      const iterationPrompt = mode === "vary"
        ? `Generate a different cinematic camera angle of this exact image as a ${planLabel}, shot ${angleVariations[i]}. Keep the same subject, same scene, same lighting. Only the camera angle changes. Output one high-quality cinematic image.`
        : prompt;

      const messages = [{
        role: "user",
        content: [
          { type: "text", text: iterationPrompt },
          { type: "image_url", image_url: { url: image_url } },
        ],
      }];

      console.log(`Multi-plan: generating image ${i + 1}/${numImages}`);

      let imageCandidates: string[] = [];
      const MAX_RETRIES = 2;

      for (let attempt = 0; attempt <= MAX_RETRIES && imageCandidates.length === 0; attempt++) {
        if (attempt > 0) console.log(`Retry attempt ${attempt} for image ${i + 1}`);

        const aiResp = await fetch(LOVABLE_AI_ENDPOINT, {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages,
            modalities: ["image", "text"],
          }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          console.error("AI error:", aiResp.status, errText);
          if (aiResp.status === 429) {
            await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
            return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (aiResp.status === 402) {
            await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
            return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          break;
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
      }

      // Take first candidate
      const imageSource = imageCandidates[0];
      if (!imageSource) continue;

      try {
        let storageKey: string;
        if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
          const resp = await fetch(imageSource);
          if (!resp.ok) continue;
          const bytes = new Uint8Array(await resp.arrayBuffer());
          storageKey = await uploadBytes(bytes, userId, "image/png", "png");
        } else {
          const raw = imageSource.replace(/^data:image\/\w+;base64,/, "");
          const binaryStr = atob(raw);
          const bytes = new Uint8Array(binaryStr.length);
          for (let j = 0; j < binaryStr.length; j++) bytes[j] = binaryStr.charCodeAt(j);
          storageKey = await uploadBytes(bytes, userId, "image/png", "png");
        }

        const publicUrl = getPublicUrl(storageKey);
        const internalPrompt = mode === "vary" ? `Multi-Plan ${planLabel} #${i + 1}` : `Multi-Plan ${planLabel} Plan ${plan_index}`;

        // Save to generation_jobs
        const { data: jobData, error: jobError } = await adminClient.from("generation_jobs").insert({
          user_id: userId,
          tool_type: "image",
          model: "nano-banana",
          prompt: internalPrompt,
          provider: "lovable-ai",
          status: "completed",
          result_url: publicUrl,
          credits_used: mode === "vary" ? 1 : cost,
          completed_at: new Date().toISOString(),
          project_id: project_id || null,
        }).select("id").single();

        savedImages.push({ url: publicUrl, job_id: jobData?.id || "" });
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
      }
    }

    if (savedImages.length === 0) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ images: savedImages, new_balance: deductResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-multiplan error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur interne est survenue." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
