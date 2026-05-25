import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
};

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 85;

export async function optimizeListingImage(
  input: Buffer
): Promise<ProcessedImage> {
  const pipeline = sharp(input).rotate().resize({
    width: MAX_WIDTH,
    height: MAX_WIDTH,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await pipeline
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    mimeType: "image/webp",
  };
}

export function isAllowedImageMime(mime: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(
    mime
  );
}
