/**
 * Generate PRECISE house-accurate mask PNGs for Coastal (Design 1).
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

function drawRectCoords(ctx, px1, py1, px2, py2) {
    const x = px1 * scale;
    const y = py1 * scale;
    const w = (px2 - px1) * scale;
    const h = (py2 - py1) * scale;
    ctx.fillRect(x, y, w, h);
}

function drawLine(ctx, x1, y1, x2, y2, width) {
    ctx.lineWidth = width * scale;
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();
}

function generatePreciseCoastalMasks(outDir) {
    console.log(`\nGenerating Precise Coastal masks at ${W}x${H}...`);
    fs.mkdirSync(outDir, { recursive: true });

    // ── COORDINATES FROM SUBAGENT (1024 scale -> normalized to 640x640) ──
    // The subagent points were picked on a 1024x1024 canvas but they represent features on the image.
    // However, I noticed the image is loaded as 1024x1024 in the picker.
    // The true image size is 640x640. Our `scale = 640 / 1024` handles this.

    // ROOF
    const roofMain = [
        [316, 201], [740, 208], [892, 392], [592, 371], [468, 371], [163, 357]
    ];
    const roofGableLeft = [[320, 285], [165, 505], [475, 525]];
    const roofGableRight = [[750, 295], [600, 525], [905, 555]];
    const roofPeakCenter = [[540, 270], [450, 370], [620, 370]]; // Added missing center dormer peak

    // WALLS
    const wallLeft = [[312, 335], [195, 490], [195, 940], [424, 940], [424, 490]];
    const wallRight = [[744, 310], [610, 483], [610, 660], [874, 660], [874, 483]];
    const wallDarkSiding = [[670, 790], [890, 790], [890, 960], [670, 960]];
    const wallCenter = [[424, 490], [424, 940], [670, 940], [670, 790], [610, 790], [610, 483]]; // Filler

    // WINDOWS/DOORS (Rectangles)
    const winLeft = [230, 620, 160, 280]; // From center [327, 720] -> approx bounds
    const winMiddle = [450, 480, 140, 150]; // From center [523, 598]
    const winRight = [680, 520, 130, 130]; // From center [747, 604]

    const door = [460, 700, 120, 250]; // From center [523, 850]
    const garageD = [670, 790, 220, 170]; // The dark siding is actually the garage door

    // ── ROOF ──
    let c = createCanvas(W, H);
    let ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawPoly(ctx, roofMain);
    drawPoly(ctx, roofGableLeft);
    drawPoly(ctx, roofGableRight);
    drawPoly(ctx, roofPeakCenter);
    saveMask(c, path.join(outDir, 'mask_roof.png'));

    // ── WALLS ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawPoly(ctx, wallLeft);
    drawPoly(ctx, wallRight);
    drawPoly(ctx, wallCenter);

    ctx.globalCompositeOperation = 'destination-out';
    drawRectCoords(ctx, winLeft[0], winLeft[1], winLeft[0] + winLeft[2], winLeft[1] + winLeft[3]);
    drawRectCoords(ctx, winMiddle[0], winMiddle[1], winMiddle[0] + winMiddle[2], winMiddle[1] + winMiddle[3]);
    drawRectCoords(ctx, winRight[0], winRight[1], winRight[0] + winRight[2], winRight[1] + winRight[3]);
    drawRectCoords(ctx, door[0], door[1], door[0] + door[2], door[1] + door[3]);
    drawRectCoords(ctx, garageD[0], garageD[1], garageD[0] + garageD[2], garageD[1] + garageD[3]);
    saveMask(c, path.join(outDir, 'mask_walls.png'));

    // ── WINDOWS ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRectCoords(ctx, winLeft[0], winLeft[1], winLeft[0] + winLeft[2], winLeft[1] + winLeft[3]);
    drawRectCoords(ctx, winMiddle[0], winMiddle[1], winMiddle[0] + winMiddle[2], winMiddle[1] + winMiddle[3]);
    drawRectCoords(ctx, winRight[0], winRight[1], winRight[0] + winRight[2], winRight[1] + winRight[3]);
    saveMask(c, path.join(outDir, 'mask_windows.png'));

    // window_1
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRectCoords(ctx, winLeft[0], winLeft[1], winLeft[0] + winLeft[2], winLeft[1] + winLeft[3]);
    drawRectCoords(ctx, winMiddle[0], winMiddle[1], winMiddle[0] + winMiddle[2], winMiddle[1] + winMiddle[3]);
    saveMask(c, path.join(outDir, 'window_1.png'));

    // window_2 
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRectCoords(ctx, winRight[0], winRight[1], winRight[0] + winRight[2], winRight[1] + winRight[3]);
    saveMask(c, path.join(outDir, 'window_2.png'));

    // ── TRIM ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.strokeStyle = 'black';
    drawLine(ctx, 312, 335, 195, 490, 15);
    drawLine(ctx, 312, 335, 424, 490, 15);
    drawLine(ctx, 744, 310, 610, 483, 15);
    drawLine(ctx, 744, 310, 874, 483, 15);
    drawLine(ctx, 165, 505, 475, 525, 20); // Porch roof edge
    drawLine(ctx, 600, 525, 905, 555, 20); // Garage roof edge
    saveMask(c, path.join(outDir, 'mask_trim.png'));

    // ── DOOR / GARAGE ──
    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRectCoords(ctx, door[0], door[1], door[0] + door[2], door[1] + door[3]);
    saveMask(c, path.join(outDir, 'mask_door.png'));

    c = createCanvas(W, H);
    ctx = c.getContext('2d');
    ctx.fillStyle = 'black';
    drawRectCoords(ctx, garageD[0], garageD[1], garageD[0] + garageD[2], garageD[1] + garageD[3]);
    saveMask(c, path.join(outDir, 'mask_garage.png'));

    console.log('  Precise Coastal masks generated.');
}

const pubDir = 'C:/Users/Pavan Kalyan/OneDrive/Documents/Desktop/Design Room/web/public/demo';
generatePreciseCoastalMasks(path.join(pubDir, 'coastal'));
generatePreciseCoastalMasks(path.join(pubDir, 'blank'));
