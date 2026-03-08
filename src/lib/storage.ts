import { supabase } from "@/integrations/supabase/client";

const BUCKET = "generations";
const SIGNED_URL_EXPIRY = 3600; // 1 hour
const R2_SIGN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-signed-url`;

/**
 * Check if a path is an R2 storage path (prefixed with "r2:")
 */
function isR2Path(urlOrPath: string): boolean {
  return urlOrPath.startsWith("r2:");
}

/**
 * Extract the storage path from a full public URL or return as-is if already a path.
 * Returns null for external URLs (not in our bucket).
 */
export function extractStoragePath(urlOrPath: string): string | null {
  if (!urlOrPath) return null;
  if (isR2Path(urlOrPath)) return null; // R2 paths handled separately

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
 * Get R2 signed URLs for a batch of R2 keys.
 */
async function getR2SignedUrls(r2Keys: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (r2Keys.length === 0) return result;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return result;

    const resp = await fetch(R2_SIGN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ keys: r2Keys }),
    });

    if (!resp.ok) return result;

    const data = await resp.json();
    if (data.urls) {
      for (const [key, url] of Object.entries(data.urls)) {
        result.set(key, url as string);
      }
    }
  } catch (e) {
    console.error("R2 signing error:", e);
  }

  return result;
}

/**
 * Get a signed URL for a stored file. Handles both Supabase and R2 storage.
 */
export async function getSignedUrl(urlOrPath: string): Promise<string> {
  if (!urlOrPath) return urlOrPath;

  // R2 path
  if (isR2Path(urlOrPath)) {
    const signed = await getR2SignedUrls([urlOrPath]);
    return signed.get(urlOrPath) || urlOrPath;
  }

  // Supabase storage path
  const path = extractStoragePath(urlOrPath);
  if (!path) return urlOrPath; // External URL, return as-is

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error);
    return urlOrPath;
  }

  return data.signedUrl;
}

/**
 * Get signed URLs for multiple items in batch. Handles both Supabase and R2 paths.
 */
export async function getSignedUrls(urlsOrPaths: string[]): Promise<string[]> {
  // Separate R2 and Supabase paths
  const r2Indices: number[] = [];
  const r2Keys: string[] = [];
  const supabaseIndices: number[] = [];
  const supabasePaths: string[] = [];

  for (let i = 0; i < urlsOrPaths.length; i++) {
    const item = urlsOrPaths[i];
    if (isR2Path(item)) {
      r2Indices.push(i);
      r2Keys.push(item);
    } else {
      const path = extractStoragePath(item);
      if (path) {
        supabaseIndices.push(i);
        supabasePaths.push(path);
      }
    }
  }

  // Fetch both in parallel
  const [r2SignedMap, supabaseResult] = await Promise.all([
    getR2SignedUrls(r2Keys),
    supabasePaths.length > 0
      ? supabase.storage.from(BUCKET).createSignedUrls(supabasePaths, SIGNED_URL_EXPIRY)
      : Promise.resolve({ data: null, error: null }),
  ]);

  // Build Supabase signed URL map
  const supabaseSignedMap = new Map<string, string>();
  if (supabaseResult.data) {
    for (const item of supabaseResult.data) {
      if (item.signedUrl && item.path) {
        supabaseSignedMap.set(item.path, item.signedUrl);
      }
    }
  }

  // Map results back
  const results = [...urlsOrPaths];

  for (const idx of r2Indices) {
    const key = urlsOrPaths[idx];
    if (r2SignedMap.has(key)) {
      results[idx] = r2SignedMap.get(key)!;
    }
  }

  for (let j = 0; j < supabaseIndices.length; j++) {
    const idx = supabaseIndices[j];
    const path = supabasePaths[j];
    if (supabaseSignedMap.has(path)) {
      results[idx] = supabaseSignedMap.get(path)!;
    }
  }

  return results;
}
