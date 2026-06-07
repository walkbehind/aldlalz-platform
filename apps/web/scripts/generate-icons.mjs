import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const NAVY = "#0a2d5e";
const GOLD = "#d4af57";

// Maskable-safe, full-bleed navy background with the Aldlalz mark centered
// inside the ~80% safe zone (buildings + Kuwait Towers gold spire).
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${NAVY}"/>
  <rect x="150" y="250" width="70" height="152" rx="8" fill="#ffffff"/>
  <rect x="232" y="190" width="82" height="212" rx="8" fill="#ffffff"/>
  <g stroke="${NAVY}" stroke-width="7" opacity="0.55" stroke-linecap="round">
    <line x1="252" y1="226" x2="294" y2="226"/>
    <line x1="252" y1="262" x2="294" y2="262"/>
    <line x1="252" y1="298" x2="294" y2="298"/>
  </g>
  <line x1="344" y1="118" x2="344" y2="402" stroke="${GOLD}" stroke-width="15" stroke-linecap="round"/>
  <circle cx="344" cy="172" r="27" fill="${GOLD}"/>
  <circle cx="344" cy="240" r="18" fill="${GOLD}"/>
</svg>`;

const svgBuffer = Buffer.from(svg);

function render(size) {
  return sharp(svgBuffer).resize(size, size).png().toBuffer();
}

async function main() {
  const targets = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
  ];

  for (const { name, size } of targets) {
    const buf = await render(size);
    await writeFile(join(publicDir, name), buf);
    console.log(`wrote ${name} (${size}x${size})`);
  }

  // favicon.ico bundles 16/32/48 px PNG frames.
  const icoFrames = await Promise.all([16, 32, 48].map((s) => render(s)));
  const ico = await pngToIco(icoFrames);
  await writeFile(join(publicDir, "favicon.ico"), ico);
  console.log("wrote favicon.ico (16/32/48)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
