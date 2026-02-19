import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL_ENDPOINTS: Record<string, string> = {
  // Google
  "veo3": "https://queue.fal.run/fal-ai/veo3",
  // Kling
  "kling-v3-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v3/standard/text-to-video",
  "kling-v3-pro-t2v": "https://queue.fal.run/fal-ai/kling-video/o3/pro/text-to-video",
  "kling-v25-turbo-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
  "kling-v21-std-i2v": "https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video",
  "kling-v2-master-t2v": "https://queue.fal.run/fal-ai/kling-video/v2/master/text-to-video",
  "kling-v16-std-t2v": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/text-to-video",
  "kling-v16-elements": "https://queue.fal.run/fal-ai/kling-video/v1.6/standard/elements",
  // Seedance
  "seedance-pro-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/text-to-video",
  "seedance-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/image-to-video",
  "seedance-pro-fast-t2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
  "seedance-pro-fast-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
  "seedance-15-pro-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
  "seedance-lite-i2v": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/image-to-video",
  "seedance-lite-ref": "https://queue.fal.run/fal-ai/bytedance/seedance/v1/lite/reference-to-video",
  // Luma
  "luma-ray2-t2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2",
  "luma-ray2-i2v": "https://queue.fal.run/fal-ai/luma-dream-machine/ray-2/image-to-video",
  // Wan
  "wan-26-t2v": "https://queue.fal.run/wan/v2.6/text-to-video",
  "wan-26-i2v": "https://queue.fal.run/wan/v2.6/image-to-video",
  // MiniMax
  "minimax-video": "https://queue.fal.run/fal-ai/minimax/video-01-live",
  // Framepack
  "framepack-f1": "https://queue.fal.run/fal-ai/framepack/f1",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (!FAL_API_KEY) throw new Error("FAL_API_KEY is not configured");

    const body = await req.json();
    const { prompt, model_id = "veo3", image_url, action, status_url, response_url, ...modelSettings } = body;

    // === POLL ACTION: client asks us to check status ===
    if (action === "poll") {
      if (!status_url || !response_url) {
        return new Response(
          JSON.stringify({ error: "status_url and response_url required for polling" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const statusResp = await fetch(status_url, {
          method: "GET",
          headers: { Authorization: `Key ${FAL_API_KEY}`, Accept: "application/json" },
        });

        console.log("Poll status HTTP:", statusResp.status);

        if (!statusResp.ok) {
          const errText = await statusResp.text();
          console.log("Poll status error body:", errText.slice(0, 300));
          // Don't return error — return IN_PROGRESS so client retries
          return new Response(
            JSON.stringify({ status: "IN_PROGRESS" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const statusData = await statusResp.json();
        console.log("Poll status data:", JSON.stringify(statusData).slice(0, 300));

        if (statusData.status === "COMPLETED") {
          const resultResp = await fetch(response_url, {
            method: "GET",
            headers: { Authorization: `Key ${FAL_API_KEY}`, Accept: "application/json" },
          });
          console.log("Result fetch HTTP:", resultResp.status);
          if (!resultResp.ok) {
            const errText = await resultResp.text();
            console.log("Result fetch error:", errText.slice(0, 300));
            // Retry on next poll instead of failing permanently
            return new Response(
              JSON.stringify({ status: "IN_PROGRESS" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const result = await resultResp.json();
          console.log("Result keys:", Object.keys(result));
          const videoUrl = result.video?.url;
          if (!videoUrl) {
            console.log("No video.url found in result:", JSON.stringify(result).slice(0, 500));
            return new Response(
              JSON.stringify({ status: "FAILED", error: "No video URL in result" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ status: "COMPLETED", video_url: videoUrl }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (statusData.status === "FAILED") {
          return new Response(
            JSON.stringify({ status: "FAILED", error: statusData.error || "Video generation failed" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ status: statusData.status || "IN_PROGRESS" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (pollErr) {
        console.error("Poll exception:", pollErr);
        // Return IN_PROGRESS so client retries instead of treating as permanent error
        return new Response(
          JSON.stringify({ status: "IN_PROGRESS" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // === SUBMIT ACTION: submit job and return polling URLs ===
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "A prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endpoint = MODEL_ENDPOINTS[model_id];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Unknown video model: ${model_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, any> = { prompt, ...modelSettings };
    for (const key of Object.keys(payload)) {
      if (payload[key] === "" || payload[key] === null || payload[key] === undefined) delete payload[key];
      if (key === "seed" && payload[key] === 0) delete payload[key];
    }
    if (image_url) payload.image_url = image_url;

    console.log(`Submitting video to ${model_id} (${endpoint}):`, JSON.stringify(payload));

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
    console.log("Submit response keys:", Object.keys(submitData));

    // If video is immediately available (unlikely for queue endpoints)
    const videoUrl = submitData.video?.url;
    if (videoUrl) {
      return new Response(
        JSON.stringify({ video_url: videoUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return polling info to client
    if (submitData.request_id) {
      const sUrl = submitData.status_url || `${endpoint}/requests/${submitData.request_id}/status`;
      const rUrl = submitData.response_url || `${endpoint}/requests/${submitData.request_id}`;
      return new Response(
        JSON.stringify({
          status: "QUEUED",
          request_id: submitData.request_id,
          status_url: sUrl,
          response_url: rUrl,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "No video generated and no request_id returned" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
