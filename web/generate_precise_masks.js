/**
 * Generate PRECISE house-accurate mask PNGs for Craftsman (Design 2).
 * Resolution matching the base house photos (640x640).
 * Black (opaque) = region area, Transparent = not this region.
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 640, H = 640;
const scale = 640 / 1024; // Coordinates were picked at 1024x1024

function saveMask(canvas, filePath) {
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buf);
    console.log(`  Wrote ${path.basename(filePath)} (${buf.length} bytes)`);
}

function drawPoly(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0] * scale, points[0][1] * scale);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] * scale, points[i][1] * scale);
    }
    ctx.closePath();
    ctx.fill();
}

function drawRect(ctx, x, y, w, h) {
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

function drawLine(ctx, x1, y1, x2, y2, width) {
    ctx.lineWidth = width * scale;
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();
}

function generatePreciseCraftsmanMasks(outDir) {
    console.log(`\nGenerating Precise Craftsman masks at ${W}x${H}...`);
    fs.mkdirSync(outDir, { recursive: true });

    // ── COORDINATES FROM SUBAGENT (1024 scale -> normalized to 640x640) ──
    const roofMain = [[260, 222], [128, 417], [363, 417], [315, 235], [400, 417], [476, 417], [597, 244], [476, 417], [727, 417]];
    const wallsMain = [[261, 222], [139, 417], [185, 755], [345, 755], [365, 417], [490, 439], [420, 439], [597, 244], [476, 417], [727, 417], [520, 532], [520, 775], [708, 775], [708, 532]];

    // Windows 
    const wLeft = [200, 424, 343 - 200, 755 - 424];
    const wMidTop = [375, 442, 464 - 375, 520 - 442];
    const wRight = [526, 432, 683 - 526, 560 - 432];

    const door = [464, 520, 520 - 464, 775 - 520];

    // ── ROOF ──
    let c = createCanvas(W, H);
    let ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawPoly(ctx, roofMain);
    saveMask(c, path.join(outDir, 'mask_roof.png'));

    // ── WALLS ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawPoly(ctx, wallsMain);

    ctx.globalCompositeOperation = 'destination-out';
    drawRect(ctx, wLeft[0], wLeft[1], wLeft[2], wLeft[3]);
    drawRect(ctx, wMidTop[0], wMidTop[1], wMidTop[2], wMidTop[3]);
    drawRect(ctx, wRight[0], wRight[1], wRight[2], wRight[3]);
    drawRect(ctx, door[0], door[1], door[2], door[3]);
    saveMask(c, path.join(outDir, 'mask_walls.png'));

    // ── WINDOWS ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRect(ctx, wLeft[0], wLeft[1], wLeft[2], wLeft[3]);
    drawRect(ctx, wMidTop[0], wMidTop[1], wMidTop[2], wMidTop[3]);
    drawRect(ctx, wRight[0], wRight[1], wRight[2], wRight[3]);
    saveMask(c, path.join(outDir, 'mask_windows.png'));

    // ── TRIM ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.strokeStyle = 'black';
    drawLine(ctx, 139, 417, 365, 417, 15);
    drawLine(ctx, 476, 417, 727, 417, 15);
    drawLine(ctx, 185, 755, 345, 755, 10);
    drawLine(ctx, 520, 775, 708, 775, 10);
    saveMask(c, path.join(outDir, 'mask_trim.png'));

    // ── DOOR ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRect(ctx, door[0], door[1], door[2], door[3]);
    saveMask(c, path.join(outDir, 'mask_door.png'));

    // Individual windows
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRect(ctx, wLeft[0], wLeft[1], wLeft[2], wLeft[3]);
    saveMask(c, path.join(outDir, 'window_1.png'));

    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRect(ctx, wRight[0], wRight[1], wRight[2], wRight[3]);
    saveMask(c, path.join(outDir, 'window_2.png'));
}

generatePreciseCraftsmanMasks(path.join('C:/Users/Pavan Kalyan/OneDrive/Documents/Desktop/Design Room/web/public/demo', 'craftsman'));
