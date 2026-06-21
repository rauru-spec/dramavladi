import crypto from "crypto";

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY!;
const HOSTNAME = process.env.BUNNY_STREAM_HOSTNAME ?? "iframe.mediadelivery.net";

export function getSignedVideoUrl(videoId: string, expiresInSeconds = 3600): string {
  const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const pathToSign = `/${LIBRARY_ID}/${videoId}`;
  const hashableBase = TOKEN_AUTH_KEY + pathToSign + expiry;
  const token = crypto
    .createHash("sha256")
    .update(hashableBase)
    .digest("hex")
    .substring(0, 32);

  return `https://${HOSTNAME}/embed/${LIBRARY_ID}/${videoId}?token=${token}&expires=${expiry}`;
}

export function getBunnyEmbedUrl(videoId: string): string {
  return `https://${HOSTNAME}/embed/${LIBRARY_ID}/${videoId}`;
}

export function isBunnyConfigured(): boolean {
  return Boolean(LIBRARY_ID && TOKEN_AUTH_KEY);
}
