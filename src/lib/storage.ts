import { supabase } from "@/integrations/supabase/client";

const BUCKET = "generations";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Extract the storage path from a full public URL or return as-is if already a path.
 * Returns null for external URLs (not in our bucket).
 */
export function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;

  // Legacy r2: prefix — extract the key
  if (urlOrPath.startsWith("r2:")) return urlOrPath.slice(3);

  // Already a relative path (e.g. "userId/filename.png")
  if (!urlOrPath.startsWith("http")) return urlOrPath;

  // Extract path from Supabase public URL pattern
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return urlOrPath.substring(idx + marker.length).split("?")[0];
  }

  // Not a generations bucket URL — return null (external URL)
  return null;
}

/**
 * Get a displayable URL for a stored file.
 * Public bucket URLs work directly. Legacy r2: paths get a signed URL.
 */
export async function getSignedUrl(urlOrPath: string): Promise<string> {
  if (!urlOrPath) return urlOrPath;

  // Legacy r2: path — create a signed URL via Supabase Storage
  if (urlOrPath.startsWith("r2:")) {
    const path = urlOrPath.slice(3);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRY);
    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return urlOrPath;
    }
    return data.signedUrl;
  }

  // Supabase public URL — return as-is (bucket is public)
  const path = extractStoragePath(urlOrPath);
  if (path) return urlOrPath;

  // External URL — return as-is
  return urlOrPath;
}

/**
 * Get displayable URLs for multiple items in batch.
 */
export async function getSignedUrls(urlsOrPaths: string[]): Promise<string[]> {
  // For public bucket, most URLs work as-is. Only legacy r2: paths need signing.
  const legacyIndices: number[] = [];
  const legacyPaths: string[] = [];

  for (let i = 0; i < urlsOrPaths.length; i++) {
    if (urlsOrPaths[i].startsWith("r2:")) {
      legacyIndices.push(i);
      legacyPaths.push(urlsOrPaths[i].slice(3));
    }
  }

  const results = [...urlsOrPaths];

  if (legacyPaths.length > 0) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(legacyPaths, SIGNED_URL_EXPIRY);

    if (!error && data) {
      for (let j = 0; j < legacyIndices.length; j++) {
        const idx = legacyIndices[j];
        if (data[j]?.signedUrl) {
          results[idx] = data[j].signedUrl;
        }
      }
    }
  }

  return results;
}
