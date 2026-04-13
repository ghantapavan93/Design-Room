/**
 * Debug: overlay each mask on the base photo to see alignment.
 * Outputs composite images with red-tinted mask areas on the photo.
 */
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function overlayMask(basePath, maskPath, outPath) {
    const base = await loadImage(basePath);
    const mask = await loadImage(maskPath);

    const c = createCanvas(base.width, base.height);
    const ctx = c.getContext('2d');

    // Draw base photo
    ctx.drawImage(base, 0, 0);

    // Draw mask as semi-transparent red overlay
    const mc = createCanvas(mask.width, mask.height);
    const mctx = mc.getContext('2d');
    mctx.drawImage(mask, 0, 0);

    // Get mask pixel data and colorize it
    const imageData = mctx.getImageData(0, 0, mask.width, mask.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // if opaque in mask
            data[i] = 255;   // R
            data[i + 1] = 0;   // G
            data[i + 2] = 0;   // B
            data[i + 3] = 120; // semi-transparent
        }
    }
    mctx.putImageData(imageData, 0, 0);

    // Overlay on base
    ctx.drawImage(mc, 0, 0);

    const buf = c.toBuffer('image/png');
    fs.writeFileSync(outPath, buf);
    console.log(`  Wrote ${path.basename(outPath)}`);
}

async function main() {
    const demoDir = 'C:/Users/Pavan Kalyan/OneDrive/Documents/Desktop/Design Room/web/public/demo/coastal';
    const outDir = 'C:/Users/Pavan Kalyan/.gemini/antigravity/brain/f7ec8da5-fb86-4b48-a445-b918ce8e174d';

    const basePath = path.join(demoDir, 'base.jpg');

    const masks = ['mask_roof', 'mask_walls', 'mask_windows', 'mask_trim', 'mask_door', 'mask_garage'];

    for (const m of masks) {
        await overlayMask(basePath, path.join(demoDir, m + '.png'), path.join(outDir, `debug_${m}.png`));
    }

    console.log('\nDone! Check debug overlay images.');
}

main().catch(console.error);
