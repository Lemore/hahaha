// One-off script that builds the PWA icons from the Noto Emoji 😂 SVG (DESIGN 2.3).
// Usage: node scripts/generate-icons.mjs <path-to-emoji_u1f602.svg>
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const COMIC_YELLOW = "#F6B41F";
const svgPath = process.argv[2];
if (!svgPath) {
  console.error("Usage: node scripts/generate-icons.mjs <emoji svg>");
  process.exit(1);
}

// Regular icons use ~75% of the width; maskable keeps the emoji inside the 80% safe zone.
const ICONS = [
  { file: "public/icons/icon-192.png", size: 192, scale: 0.75 },
  { file: "public/icons/icon-512.png", size: 512, scale: 0.75 },
  { file: "public/icons/icon-maskable-512.png", size: 512, scale: 0.6 },
  { file: "app/apple-icon.png", size: 180, scale: 0.75 },
  { file: "app/icon.png", size: 64, scale: 0.75 },
];

for (const { file, size, scale } of ICONS) {
  const emojiSize = Math.round(size * scale);
  const emoji = await sharp(svgPath, { density: 600 })
    .resize(emojiSize, emojiSize)
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 3, background: COMIC_YELLOW },
  })
    .composite([{ input: emoji, gravity: "center" }])
    .removeAlpha()
    .png()
    .toFile(file);
  console.log(`Wrote ${file}`);
}

// Browser tab icon: an ICO file with embedded PNGs, built from the 512px icon.
const FAVICON_SIZES = [16, 32, 48];
const pngs = await Promise.all(
  FAVICON_SIZES.map((size) =>
    sharp("public/icons/icon-512.png")
      .resize(size, size)
      .ensureAlpha() // ICO decoders expect RGBA PNGs
      .png()
      .toBuffer(),
  ),
);
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(FAVICON_SIZES[i], entry);
  header.writeUInt8(FAVICON_SIZES[i], entry + 1);
  header.writeUInt16LE(1, entry + 4); // color planes
  header.writeUInt16LE(32, entry + 6); // bits per pixel
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile("app/favicon.ico", Buffer.concat([header, ...pngs]));
console.log("Wrote app/favicon.ico");
