import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    const { prompt, image_size } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating image with prompt:", prompt);

    // Submit request to Fal AI
    const submitResponse = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: image_size || "landscape_4_3",
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error("Fal AI error:", submitResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Fal AI error: ${submitResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await submitResponse.json();
    console.log("Fal AI result:", JSON.stringify(result));

    // Handle queue-based response
    if (result.request_id && !result.images) {
      // Poll for result
      const requestId = result.request_id;
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;

        const statusResponse = await fetch(
          `https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`,
          {
            headers: { Authorization: `Key ${FAL_API_KEY}` },
          }
        );

        const statusData = await statusResponse.json();
        console.log("Poll attempt", attempts, "status:", statusData.status);

        if (statusData.status === "COMPLETED") {
          const resultResponse = await fetch(
            `https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`,
            {
              headers: { Authorization: `Key ${FAL_API_KEY}` },
            }
          );
          const finalResult = await resultResponse.json();
          return new Response(
            JSON.stringify({
              image_url: finalResult.images?.[0]?.url,
              seed: finalResult.seed,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (statusData.status === "FAILED") {
          return new Response(
            JSON.stringify({ error: "Image generation failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Generation timed out" }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Direct response (synchronous)
    return new Response(
      JSON.stringify({
        image_url: result.images?.[0]?.url,
        seed: result.seed,
      }),
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
