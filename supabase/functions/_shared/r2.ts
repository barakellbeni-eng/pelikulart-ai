const R2_BUCKET = "pelikulart-generations";

// --- AWS Signature V4 helpers using Web Crypto API (Deno-compatible) ---

async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(hash));
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAmzDate(): { amzDate: string; shortDate: string } {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return { amzDate, shortDate: amzDate.slice(0, 8) };
}

async function getSigningKey(
  secretKey: string, shortDate: string, region: string, service: string,
): Promise<Uint8Array> {
  let key = await hmacSha256(new TextEncoder().encode("AWS4" + secretKey), shortDate);
  key = await hmacSha256(key, region);
  key = await hmacSha256(key, service);
  key = await hmacSha256(key, "aws4_request");
  return key;
}

function getR2Config() {
  return {
    endpoint: Deno.env.get("R2_ENDPOINT_URL")!,
    accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
    region: "auto",
    service: "s3",
  };
}

/**
 * Upload bytes to R2 using raw S3 PUT with AWS Signature V4.
 */
export async function uploadToR2(
  bytes: Uint8Array, key: string, contentType: string,
): Promise<void> {
  const { endpoint, accessKeyId, secretAccessKey, region, service } = getR2Config();
  const url = new URL(`/${R2_BUCKET}/${key}`, endpoint);
  const { amzDate, shortDate } = getAmzDate();

  const payloadHash = await sha256Hex(bytes);

  const headers: Record<string, string> = {
    "content-length": bytes.length.toString(),
    "content-type": contentType,
    "host": url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");

  const canonicalRequest = [
    "PUT", url.pathname, "", canonicalHeaders, signedHeaders, payloadHash,
  ].join("\n");

  const credentialScope = `${shortDate}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, shortDate, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const resp = await fetch(url.toString(), {
    method: "PUT",
    headers: { ...headers, Authorization: authHeader },
    body: bytes,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`R2 upload failed: ${resp.status} ${errText}`);
  }
  // Consume response body to avoid resource leak
  await resp.text();
}

/**
 * Generate a presigned GET URL for an R2 object (AWS Sig V4 query string).
 */
export async function getR2SignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const { endpoint, accessKeyId, secretAccessKey, region, service } = getR2Config();
  const url = new URL(`/${R2_BUCKET}/${key}`, endpoint);
  const { amzDate, shortDate } = getAmzDate();

  const credentialScope = `${shortDate}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  // Query params must be sorted for canonical request
  const params: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", credential],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", expiresIn.toString()],
    ["X-Amz-SignedHeaders", "host"],
  ];
  params.sort((a, b) => a[0].localeCompare(b[0]));

  const canonicalQueryString = params
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const canonicalRequest = [
    "GET", url.pathname, canonicalQueryString,
    `host:${url.host}\n`, "host", "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, shortDate, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  return `${url.toString()}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Download a file from URL and upload to R2. Returns the R2 object key.
 */
export async function downloadAndUploadToR2(
  sourceUrl: string, userId: string, format = "png",
): Promise<string> {
  const resp = await fetch(sourceUrl);
  if (!resp.ok) throw new Error("Failed to download generated file");
  const bytes = new Uint8Array(await resp.arrayBuffer());
  const contentType = resp.headers.get("content-type") || `image/${format}`;

  const ext = format === "jpeg" ? "jpg" : format;
  const key = `${userId}/${crypto.randomUUID()}.${ext}`;
  await uploadToR2(bytes, key, contentType);
  return key;
}

/**
 * Upload raw bytes to R2. Returns the R2 object key.
 */
export async function uploadBytesToR2(
  bytes: Uint8Array, userId: string, contentType = "image/png", ext = "png",
): Promise<string> {
  const key = `${userId}/${crypto.randomUUID()}.${ext}`;
  await uploadToR2(bytes, key, contentType);
  return key;
}

/**
 * Delete an object from R2 using AWS Signature V4.
 */
export async function deleteFromR2(key: string): Promise<void> {
  const { endpoint, accessKeyId, secretAccessKey, region, service } = getR2Config();
  const url = new URL(`/${R2_BUCKET}/${key}`, endpoint);
  const { amzDate, shortDate } = getAmzDate();

  const payloadHash = await sha256Hex("");

  const headers: Record<string, string> = {
    "host": url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaderKeys = Object.keys(headers).sort();
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");

  const canonicalRequest = [
    "DELETE", url.pathname, "", canonicalHeaders, signedHeaders, payloadHash,
  ].join("\n");

  const credentialScope = `${shortDate}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, shortDate, region, service);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const resp = await fetch(url.toString(), {
    method: "DELETE",
    headers: { ...headers, Authorization: authHeader },
  });

  if (!resp.ok && resp.status !== 404) {
    const errText = await resp.text();
    throw new Error(`R2 delete failed: ${resp.status} ${errText}`);
  }
  await resp.text();
}
