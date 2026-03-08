import { S3Client, PutObjectCommand, GetObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.679.0";
import { getSignedUrl as awsGetSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.679.0";

const R2_BUCKET = "pelikulart-generations";

export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: Deno.env.get("R2_ENDPOINT_URL")!,
    credentials: {
      accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
      secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
    },
  });
}

/**
 * Upload bytes to R2. Returns the object key.
 */
export async function uploadToR2(
  bytes: Uint8Array,
  key: string,
  contentType: string,
): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }),
  );
}

/**
 * Generate a presigned GET URL for an R2 object.
 */
export async function getR2SignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const client = getR2Client();
  return await awsGetSignedUrl(
    client,
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    { expiresIn },
  );
}

/**
 * Download a file from a URL and upload it to R2.
 * Returns the R2 object key.
 */
export async function downloadAndUploadToR2(
  sourceUrl: string,
  userId: string,
  format = "png",
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
 * Upload raw bytes (e.g. base64-decoded) to R2.
 * Returns the R2 object key.
 */
export async function uploadBytesToR2(
  bytes: Uint8Array,
  userId: string,
  contentType = "image/png",
  ext = "png",
): Promise<string> {
  const key = `${userId}/${crypto.randomUUID()}.${ext}`;
  await uploadToR2(bytes, key, contentType);
  return key;
}
