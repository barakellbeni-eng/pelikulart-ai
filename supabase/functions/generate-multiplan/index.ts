import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { uploadBytes, getPublicUrl } from "../_shared/storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAL_ENDPOINT = "https://fal.run/fal-ai/nano-banana-pro/edit";

const PLAN_TYPE_MAP: Record<string, string> = {
  "close-up": "close-up shot",
  "macro": "macro shot",
  "serre": "tight/medium close-up shot",
  "americain": "american shot (knee-level framing)",
  "large": "wide shot",
  "tres-large": "extreme wide shot",
  "plongee": "high-angle (bird's eye) shot",
  "contre-plongee": "low-angle (worm's eye) shot",
};

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
    const { image_url, plan_type, project_id, aspect_ratio = "1:1", resolution = "2K", plan_index } = body;

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: "Une image source est requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cost = 2;
    const { data: deductResult, error: deductError } = await adminClient.rpc("deduct_cauris", {
      p_user_id: userId, p_amount: cost,
    });

    if (deductError || deductResult === -1) {
      return new Response(
        JSON.stringify({ error: "Solde insuffisant" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Aspect ratio to image_size
    const ratioSizes: Record<string, Record<string, { width: number; height: number }>> = {
      "1:1":  { "2K": { width: 2048, height: 2048 }, "4K": { width: 4096, height: 4096 } },
      "16:9": { "2K": { width: 2048, height: 1152 }, "4K": { width: 3840, height: 2160 } },
      "9:16": { "2K": { width: 1152, height: 2048 }, "4K": { width: 2160, height: 3840 } },
      "4:3":  { "2K": { width: 2048, height: 1536 }, "4K": { width: 4096, height: 3072 } },
      "3:4":  { "2K": { width: 1536, height: 2048 }, "4K": { width: 3072, height: 4096 } },
    };

    const imageSize = ratioSizes[aspect_ratio]?.[resolution] || ratioSizes["1:1"]["2K"];

    const planLabel = PLAN_TYPE_MAP[plan_type] || plan_type;

    // Plan-specific prompts for buttons Plan 1-4
    const planPrompts: Record<number, string> = {
      1: "Select and generate only the first shot of this image.",
      2: "Select and generate only the second shot of this image.",
      3: "Select and generate only the third shot of this image.",
      4: "Select and generate only the fourth shot of this image.",
    };

    const prompt = plan_index && planPrompts[plan_index]
      ? planPrompts[plan_index]
      : `generate 4 different ${planLabel} shot of this exact image, Keep the same subject, same scene, same colors, same lighting.`;

    console.log(`Multi-plan: generating ${planLabel} ${aspect_ratio} ${resolution} via Fal AI`);

    // Call Fal AI nano-banana-pro/edit
    const falResp = await fetch(FAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_urls: [image_url],
        num_images: 1,
        output_format: "png",
        image_size: imageSize,
      }),
    });

    if (!falResp.ok) {
      const errText = await falResp.text();
      console.error("Fal AI error:", falResp.status, errText);
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });

      if (falResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques secondes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (falResp.status === 500 && errText.includes("temporarily overloaded")) {
        return new Response(
          JSON.stringify({ error: "Le service IA est temporairement surchargé. Réessayez." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "Erreur du service de génération." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const falData = await falResp.json();
    const imageResult = falData?.images?.[0]?.url;

    if (!imageResult) {
      console.error("No image in Fal response:", JSON.stringify(falData).slice(0, 500));
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Aucune image générée. Réessayez." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Download and upload to storage
    const imgResp = await fetch(imageResult);
    if (!imgResp.ok) {
      await adminClient.rpc("add_cauris", { p_user_id: userId, p_amount: cost });
      return new Response(
        JSON.stringify({ error: "Erreur de téléchargement de l'image générée." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const bytes = new Uint8Array(await imgResp.arrayBuffer());
    const storageKey = await uploadBytes(bytes, userId, "image/png", "png");
    const publicUrl = getPublicUrl(storageKey);

    // Save to generation_jobs
    const { data: jobData } = await adminClient.from("generation_jobs").insert({
      user_id: userId,
      tool_type: "image",
      model: "nano-banana-pro-edit",
      prompt: `Multi-Plan ${planLabel}`,
      provider: "fal",
      status: "completed",
      result_url: publicUrl,
      credits_used: cost,
      completed_at: new Date().toISOString(),
      project_id: project_id || null,
    }).select("id").single();

    return new Response(
      JSON.stringify({ image: { url: publicUrl, job_id: jobData?.id || "" }, new_balance: deductResult }),
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
