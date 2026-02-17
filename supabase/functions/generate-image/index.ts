import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAL_ENDPOINT = "https://queue.fal.run/fal-ai/nano-banana-pro";

async function pollForResult(requestId: string, apiKey: string): Promise<any> {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusResp = await fetch(`${FAL_ENDPOINT}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    const statusData = await statusResp.json();
    console.log("Poll attempt", i + 1, "status:", statusData.status);

    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`${FAL_ENDPOINT}/requests/${requestId}`, {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    const body = await req.json();
    const {
      prompt,
      aspect_ratio = "1:1",
      resolution = "1K",
      output_format = "png",
      num_images = 1,
      image_url, // for image-to-image
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the payload
    const payload: Record<string, any> = {
      prompt,
      num_images: Math.min(num_images, 4),
      aspect_ratio,
      output_format,
      resolution,
    };

    // If image_url provided, include as image reference for image-to-image
    if (image_url) {
      payload.image_url = image_url;
    }

    console.log("Submitting to Fal AI Nano Banana Pro:", JSON.stringify(payload));

    const submitResp = await fetch(FAL_ENDPOINT, {
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

    // Direct sync response
    if (submitData.images?.length) {
      return new Response(
        JSON.stringify({
          images: submitData.images.map((img: any) => ({
            url: img.url,
            width: img.width,
            height: img.height,
          })),
          description: submitData.description || "",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Queue-based
    const requestId = submitData.request_id;
    if (!requestId) {
      console.error("No request_id or images:", JSON.stringify(submitData));
      return new Response(
        JSON.stringify({ error: "Unexpected response from Fal AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await pollForResult(requestId, FAL_API_KEY);

    if (result.images?.length) {
      return new Response(
        JSON.stringify({
          images: result.images.map((img: any) => ({
            url: img.url,
            width: img.width,
            height: img.height,
          })),
          description: result.description || "",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "No images generated" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
