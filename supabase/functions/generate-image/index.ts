import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAL_ENDPOINT = "https://queue.fal.run/fal-ai/nano-banana-pro";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    const { prompt, aspect_ratio } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Submitting to Fal AI Nano Banana Pro:", prompt);

    // Submit request
    const submitResp = await fetch(FAL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        num_images: 1,
        aspect_ratio: aspect_ratio || "4:3",
        output_format: "png",
        resolution: "1K",
      }),
    });

    if (!submitResp.ok) {
      const errText = await submitResp.text();
      console.error("Fal submit error:", submitResp.status, errText);
      return new Response(
        JSON.stringify({ error: `Fal AI error (${submitResp.status})` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitData = await submitResp.json();

    // If we got images directly (sync response)
    if (submitData.images?.length) {
      return new Response(
        JSON.stringify({ image_url: submitData.images[0].url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Queue-based: poll for result
    const requestId = submitData.request_id;
    if (!requestId) {
      console.error("No request_id or images:", JSON.stringify(submitData));
      return new Response(
        JSON.stringify({ error: "Unexpected response from Fal AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Queued, request_id:", requestId);

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const statusResp = await fetch(`${FAL_ENDPOINT}/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${FAL_API_KEY}` },
      });
      const statusData = await statusResp.json();

      if (statusData.status === "COMPLETED") {
        const resultResp = await fetch(`${FAL_ENDPOINT}/requests/${requestId}`, {
          headers: { Authorization: `Key ${FAL_API_KEY}` },
        });
        const resultData = await resultResp.json();

        if (resultData.images?.length) {
          return new Response(
            JSON.stringify({ image_url: resultData.images[0].url }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "No image in result" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
