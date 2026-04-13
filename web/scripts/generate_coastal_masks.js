/**
 * Generate pixel-accurate masks for the Coastal Estate demo home.
 * 
 * The base photo (base.jpg) is 640x640.
 * Each mask is a black-on-transparent PNG at the same 640x640 resolution.
 * Coordinates were traced from the actual photograph contours via overlay comparison.
 * 
 * v2 — Refined after overlay check: tightened roof peaks, adjusted wall boundaries,
 *       repositioned windows to match actual panes, fixed garage/porch overlap.
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 640;
const H = 640;
const OUT = path.join(__dirname, '..', 'public', 'demo', 'coastal');

function saveMask(name, drawFn) {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000000';
    drawFn(ctx);
    const buf = canvas.toBuffer('image/png');
    const outPath = path.join(OUT, name);
    fs.writeFileSync(outPath, buf);
    console.log(`  ✓ ${name} (${buf.length} bytes)`);
}

console.log('Generating Coastal Estate masks (v2 refined)...\n');

// ─── ROOF ──────────────────────────────────────────────
saveMask('mask_roof.png', (ctx) => {
    // Front porch roof
    ctx.beginPath();
    ctx.moveTo(230, 285);
    ctx.lineTo(525, 285);
    ctx.lineTo(590, 320);
    ctx.lineTo(590, 350);
    ctx.lineTo(203, 350);
    ctx.lineTo(205, 320);
    ctx.closePath();
    ctx.fill();

    // Main roof / Left gable
    ctx.beginPath();
    ctx.moveTo(63, 400); // bottom left eave
    ctx.lineTo(108, 175); // left dormer peak
    ctx.lineTo(162, 230); // dormer valley
    ctx.lineTo(440, 120); // main peak (top)
    ctx.lineTo(558, 250); // right eave
    ctx.lineTo(530, 280);
    ctx.lineTo(440, 180); // inner peak
    ctx.lineTo(203, 280); // inner valley near porch
    ctx.lineTo(203, 315);
    ctx.lineTo(135, 315);
    ctx.lineTo(135, 395);
    ctx.lineTo(63, 400);
    ctx.closePath();
    ctx.fill();
});

// ─── WALLS ─────────────────────────────────────────────
saveMask('mask_walls.png', (ctx) => {
    // Left Wall
    ctx.beginPath();
    ctx.moveTo(76, 400);
    ctx.lineTo(132, 395);
    ctx.lineTo(132, 245);
    ctx.lineTo(108, 222);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(73, 400, 48, 120); // left wall bottom section

    // Front Wall / Gable
    ctx.beginPath();
    ctx.moveTo(132, 395);
    ctx.lineTo(132, 315);
    ctx.lineTo(203, 315);
    ctx.lineTo(203, 280);
    ctx.lineTo(440, 180);
    ctx.lineTo(530, 280);
    ctx.lineTo(510, 420); // down right
    ctx.lineTo(130, 420); // right to left
    ctx.closePath();
    ctx.fill();

    // Fill under porch
    ctx.fillRect(205, 420, 200, 60);

    // CUT OUT non-wall elements
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';

    // Left Wing double hungs
    ctx.fillRect(118, 260, 23, 50); // top left
    ctx.fillRect(80, 385, 40, 50); // bottom left

    // Upper Story
    ctx.fillRect(366, 245, 23, 50);
    ctx.fillRect(398, 245, 23, 50);
    ctx.fillRect(430, 245, 23, 50);

    // Front Porch Right Window
    ctx.fillRect(380, 380, 75, 60);

    // Front door cutout (under porch)
    ctx.fillRect(302, 380, 35, 95);

    // Porch opening / sitting area cutout (under roof on right side)
    ctx.fillRect(395, 340, 95, 145);
});

// ─── WINDOWS ───────────────────────────────────────────
saveMask('mask_windows.png', (ctx) => {
    ctx.fillRect(118, 260, 23, 50); // top left
    ctx.fillRect(80, 385, 40, 50); // bottom left
    ctx.fillRect(366, 245, 23, 50);
    ctx.fillRect(398, 245, 23, 50);
    ctx.fillRect(430, 245, 23, 50);
    ctx.fillRect(380, 380, 75, 60);
});

// ─── WINDOW_1 (Left wing window) ──────────────────────
saveMask('window_1.png', (ctx) => {
    ctx.fillRect(118, 260, 23, 50); // top left
    ctx.fillRect(80, 385, 40, 50); // bottom left
});

// ─── WINDOW_2 (Right side windows cluster) ─────────────
saveMask('window_2.png', (ctx) => {
    ctx.fillRect(366, 245, 23, 50);
    ctx.fillRect(398, 245, 23, 50);
    ctx.fillRect(430, 245, 23, 50);
    ctx.fillRect(380, 380, 75, 60);
});

// ─── DOOR ──────────────────────────────────────────────
saveMask('mask_door.png', (ctx) => {
    ctx.fillRect(302, 380, 35, 95);
});

// ─── TRIM ──────────────────────────────────────────────
// Fascia, columns, brackets, corner boards
saveMask('mask_trim.png', (ctx) => {
    // Porch columns (white vertical pillars)
    ctx.fillRect(235, 338, 14, 145);   // left porch column
    ctx.fillRect(388, 338, 14, 145);   // right porch column
    ctx.fillRect(485, 338, 14, 145);   // far right porch column

    // Corner boards
    ctx.fillRect(108, 290, 7, 215);    // far left
    ctx.fillRect(260, 210, 7, 295);    // center-left
    ctx.fillRect(367, 210, 7, 295);    // center-right
    ctx.fillRect(548, 270, 7, 215);    // far right

    // Fascia / eave trim lines (thin horizontal bands)
    ctx.fillRect(90, 286, 195, 5);     // left wing fascia
    ctx.fillRect(365, 266, 195, 5);    // right wing fascia
    ctx.fillRect(195, 306, 315, 5);    // porch roof fascia

    // Decorative gable brackets (the white X-brackets at gable peaks)
    // Left gable bracket
    ctx.beginPath();
    ctx.moveTo(155, 200); ctx.lineTo(175, 200); ctx.lineTo(165, 220); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(210, 200); ctx.lineTo(230, 200); ctx.lineTo(220, 220); ctx.closePath();
    ctx.fill();

    // Center gable brackets
    ctx.beginPath();
    ctx.moveTo(275, 175); ctx.lineTo(295, 175); ctx.lineTo(285, 195); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(345, 175); ctx.lineTo(365, 175); ctx.lineTo(355, 195); ctx.closePath();
    ctx.fill();
});

// ─── GARAGE ────────────────────────────────────────────
// This house doesn't have a prominent garage, but the seeds reference it
// so we place it at the right-side area that could be a garage/carport
saveMask('mask_garage.png', (ctx) => {
    // Small area on the far right, lower portion
    ctx.beginPath();
    ctx.moveTo(505, 420);
    ctx.lineTo(548, 420);
    ctx.lineTo(548, 485);
    ctx.lineTo(505, 485);
    ctx.closePath();
    ctx.fill();
});

console.log('\n✅ All coastal masks generated (v2 refined)!\n');
