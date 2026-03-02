import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = "generations";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Extract the storage path from a full public URL or return as-is if already a path.
 */
export function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;

  // Already a relative path (e.g. "userId/filename.png")
  if (!urlOrPath.startsWith("http")) return urlOrPath;

  // Extract path from Supabase public URL pattern
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return urlOrPath.substring(idx + marker.length).split("?")[0];
  }

  // Not a generations bucket URL — return original (external URL)
  return null;
}

/**
 * Get a signed URL for a stored file. Falls back to original URL for external sources.
 */
export async function getSignedUrl(urlOrPath: string): Promise<string> {
  const path = extractStoragePath(urlOrPath);
  if (!path) return urlOrPath; // External URL, return as-is

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error);
    return urlOrPath; // Fallback
  }

  return data.signedUrl;
}

/**
 * Get signed URLs for multiple items in batch.
 */
export async function getSignedUrls(urlsOrPaths: string[]): Promise<string[]> {
  const paths: (string | null)[] = urlsOrPaths.map(extractStoragePath);
  const validPaths = paths.filter((p): p is string => p !== null);

  if (validPaths.length === 0) return urlsOrPaths;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(validPaths, SIGNED_URL_EXPIRY);

  if (error || !data) {
    console.error("Batch signed URL error:", error);
    return urlsOrPaths;
  }

  // Map results back
  const signedMap = new Map<string, string>();
  for (const item of data) {
    if (item.signedUrl && item.path) {
      signedMap.set(item.path, item.signedUrl);
    }
  }

  return urlsOrPaths.map((original, i) => {
    const path = paths[i];
    if (path && signedMap.has(path)) {
      return signedMap.get(path)!;
    }
    return original;
  });
}
