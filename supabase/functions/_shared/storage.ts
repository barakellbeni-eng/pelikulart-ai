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
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(key: string): Promise<void> {
  const adminClient = getAdminClient();
  const { error } = await adminClient.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

export { getPublicUrl };
