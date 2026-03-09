import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const BUCKET = "generations";

function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function getPublicUrl(key: string): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
}

const IMAGE_FORMATS = new Set(["png", "jpg", "jpeg", "webp"]);
const MAX_DISPLAY_DIM = 1280;

/**
 * Attempt to resize image bytes to a smaller display version.
 * Returns compressed PNG bytes or null on failure.
 */
async function tryCompress(bytes: Uint8Array): Promise<Uint8Array | null> {
  try {
    const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
    const img = await Image.decode(bytes);
    if (img.width > MAX_DISPLAY_DIM || img.height > MAX_DISPLAY_DIM) {
      const scale = MAX_DISPLAY_DIM / Math.max(img.width, img.height);
      img.resize(Math.round(img.width * scale), Math.round(img.height * scale));
    }
    return await img.encode();
  } catch (e) {
    console.error("Image compression failed:", e);
    return null;
  }
}

/**
 * Download a file from URL and upload to Supabase Storage. Returns the storage key.
 */
export async function downloadAndUpload(
  sourceUrl: string, userId: string, format = "png",
): Promise<string> {
  const resp = await fetch(sourceUrl);
  if (!resp.ok) throw new Error("Failed to download generated file");
  const bytes = new Uint8Array(await resp.arrayBuffer());
  const contentType = resp.headers.get("content-type") || `image/${format}`;

  const ext = format === "jpeg" ? "jpg" : format;
  const key = `${userId}/${crypto.randomUUID()}.${ext}`;

  const adminClient = getAdminClient();
  const { error } = await adminClient.storage.from(BUCKET).upload(key, bytes, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return key;
}

/**
 * Download, upload original AND a compressed display version.
 * Returns { originalKey, displayKey }.
 * For non-image formats, both keys are the same.
 */
export async function downloadAndUploadDual(
  sourceUrl: string, userId: string, format = "png",
): Promise<{ originalKey: string; displayKey: string }> {
  const resp = await fetch(sourceUrl);
  if (!resp.ok) throw new Error("Failed to download generated file");
  const bytes = new Uint8Array(await resp.arrayBuffer());
  const contentType = resp.headers.get("content-type") || `image/${format}`;

  const ext = format === "jpeg" ? "jpg" : format;
  const originalKey = `${userId}/${crypto.randomUUID()}.${ext}`;

  const adminClient = getAdminClient();
  const { error: origErr } = await adminClient.storage.from(BUCKET).upload(originalKey, bytes, {
    contentType, upsert: false,
  });
  if (origErr) throw new Error(`Original upload failed: ${origErr.message}`);

  if (!IMAGE_FORMATS.has(format)) {
    return { originalKey, displayKey: originalKey };
  }

  const compressed = await tryCompress(bytes);
  if (!compressed) {
    return { originalKey, displayKey: originalKey };
  }

  const displayKey = `${userId}/${crypto.randomUUID()}_thumb.png`;
  const { error: compErr } = await adminClient.storage.from(BUCKET).upload(displayKey, compressed, {
    contentType: "image/png", upsert: false,
  });
  if (compErr) {
    console.error("Compressed upload failed:", compErr);
    return { originalKey, displayKey: originalKey };
  }

  return { originalKey, displayKey };
}

/**
 * Upload raw bytes to Supabase Storage. Returns the storage key.
 */
export async function uploadBytes(
  bytes: Uint8Array, userId: string, contentType = "image/png", ext = "png",
): Promise<string> {
  const key = `${userId}/${crypto.randomUUID()}.${ext}`;

  const adminClient = getAdminClient();
  const { error } = await adminClient.storage.from(BUCKET).upload(key, bytes, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return key;
}

/**
 * Upload raw bytes + compressed display version.
 * Returns { originalKey, displayKey }.
 */
export async function uploadBytesDual(
  bytes: Uint8Array, userId: string, contentType = "image/png", ext = "png",
): Promise<{ originalKey: string; displayKey: string }> {
  const originalKey = `${userId}/${crypto.randomUUID()}.${ext}`;

  const adminClient = getAdminClient();
  const { error: origErr } = await adminClient.storage.from(BUCKET).upload(originalKey, bytes, {
    contentType, upsert: false,
  });
  if (origErr) throw new Error(`Original upload failed: ${origErr.message}`);

  if (!IMAGE_FORMATS.has(ext)) {
    return { originalKey, displayKey: originalKey };
  }

  const compressed = await tryCompress(bytes);
  if (!compressed) {
    return { originalKey, displayKey: originalKey };
  }

  const displayKey = `${userId}/${crypto.randomUUID()}_thumb.png`;
  const { error: compErr } = await adminClient.storage.from(BUCKET).upload(displayKey, compressed, {
    contentType: "image/png", upsert: false,
  });
  if (compErr) {
    console.error("Compressed upload failed:", compErr);
    return { originalKey, displayKey: originalKey };
  }

  return { originalKey, displayKey };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(key: string): Promise<void> {
  const adminClient = getAdminClient();
  const { error } = await adminClient.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/**
 * Log a cauris ledger entry. Fire-and-forget — errors are logged but don't throw.
 */
export async function logCauris(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  type: "achat" | "generation" | "remboursement",
  description: string,
  amount: number,
  balanceAfter: number,
): Promise<void> {
  try {
    await adminClient.from("cauris_ledger").insert({
      user_id: userId,
      type,
      description,
      amount,
      balance_after: balanceAfter,
    });
  } catch (e) {
    console.error("logCauris error:", e);
  }
}

export { getPublicUrl };
