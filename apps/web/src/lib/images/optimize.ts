import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
};

/** Max dimension — balanced for mobile detail + desktop */
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

export async function optimizeListingImage(
  input: Buffer
): Promise<ProcessedImage> {
  const pipeline = sharp(input)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_WIDTH,
      fit: "inside",
      withoutEnlargement: true,
    });

  const { data, info } = await pipeline
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    mimeType: "image/webp",
  };
}

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function isAllowedImageMime(mime: string) {
  return ALLOWED_MIMES.has(mime);
}

export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return true;
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }
  // WebP (RIFF....WEBP)
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true;
  }
  return false;
}
