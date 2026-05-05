/**
 * convert_coastal_masks.js
 * Converts Design 1 (coastal) black-and-white mask PNGs to proper alpha-channel PNGs.
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const MASK_DIR = path.join(__dirname, '../public/demo/coastal');

const MASKS = [
  'mask_roof.png',
  'mask_walls.png',
  'mask_windows.png',
  'mask_door.png',
  'mask_garage.png',
];

async function convertMask(filename) {
  const filePath = path.join(MASK_DIR, filename);
  const backupPath = path.join(MASK_DIR, filename.replace('.png', '_bw_backup.png'));

  console.log(`\n── Processing: ${filename}`);

  const img = await loadImage(filePath);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  console.log(`   Dimensions: ${w}x${h}`);

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let convertedPixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    data[i]     = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = luma; // white region = opaque, black = transparent
    if (luma > 0) convertedPixels++;
  }

  console.log(`   Opaque pixels: ${convertedPixels.toLocaleString()} / ${(w * h).toLocaleString()}`);

  fs.copyFileSync(filePath, backupPath);
  console.log(`   Backup saved: ${path.basename(backupPath)}`);

  ctx.putImageData(imageData, 0, 0);
  const outBuffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, outBuffer);
  console.log(`   ✅ Written alpha PNG: ${filename}`);
}

async function main() {
  console.log('=== Coastal (Design 1) B&W → Alpha Mask Converter ===');
  console.log(`Target dir: ${MASK_DIR}\n`);

  for (const mask of MASKS) {
    const filePath = path.join(MASK_DIR, mask);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping (not found): ${mask}`);
      continue;
    }
    await convertMask(mask);
  }

  console.log('\n=== All coastal masks converted! ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
