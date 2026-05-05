/**
 * convert_bw_to_alpha.js
 *
 * Converts black-and-white mask PNGs (where white = region, black = background)
 * into proper alpha-channel PNGs (where white region = opaque, black = transparent).
 *
 * The PreviewCanvas reads ONLY the alpha channel for hit-testing and tinting.
 * B&W masks have alpha=255 everywhere → tint bleeds over the whole image.
 * Alpha masks have alpha=0 in black areas → tint only appears on the region.
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const MASK_DIR = path.join(__dirname, '../public/demo/blank');

const MASKS = [
  'mask_walls.png',
  'mask_roof.png',
  'mask_windows.png',
  'mask_door.png',
  'mask_garage.png',
];

async function convertMask(filename) {
  const filePath = path.join(MASK_DIR, filename);
  const backupPath = path.join(MASK_DIR, filename.replace('.png', '_bw_backup.png'));

  console.log(`\n── Processing: ${filename}`);

  // Load original
  const img = await loadImage(filePath);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  console.log(`   Dimensions: ${w}x${h}`);

  // Create canvas and read pixels
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Convert: use the RED channel luminance as the new ALPHA value
  // White pixels (R≈255) → alpha=255 (opaque)
  // Black pixels (R≈0)   → alpha=0   (transparent)
  let convertedPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance as alpha (white=opaque, black=transparent)
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    data[i]     = 255; // R: white
    data[i + 1] = 255; // G: white
    data[i + 2] = 255; // B: white
    data[i + 3] = luma; // A: derived from original brightness
    if (luma > 0) convertedPixels++;
  }

  console.log(`   Opaque pixels: ${convertedPixels.toLocaleString()} / ${(w * h).toLocaleString()}`);

  // Backup original
  fs.copyFileSync(filePath, backupPath);
  console.log(`   Backup saved: ${path.basename(backupPath)}`);

  // Write converted alpha PNG
  ctx.putImageData(imageData, 0, 0);
  const outBuffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, outBuffer);
  console.log(`   ✅ Written alpha PNG: ${filename}`);
}

async function main() {
  console.log('=== B&W → Alpha Mask Converter ===');
  console.log(`Target dir: ${MASK_DIR}\n`);

  for (const mask of MASKS) {
    const filePath = path.join(MASK_DIR, mask);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping (not found): ${mask}`);
      continue;
    }
    await convertMask(mask);
  }

  console.log('\n=== All masks converted! Reload the app to see the changes. ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
