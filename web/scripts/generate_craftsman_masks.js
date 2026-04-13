/**
 * Generate pixel-accurate masks for the Craftsman Mod demo home.
 * 
 * The base photo (base.jpg) is 640x640.
 * Each mask is a black-on-transparent PNG at the same 640x640 resolution.
 * 
 * This is a modern farmhouse with:
 *   - Wood-clad left wing with large floor-to-ceiling windows
 *   - White/gray right wing with upper windows 
 *   - Dark charcoal garage on the right
 *   - Central front door with stone surround
 *   - Dark angular roof
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 640;
const H = 640;
const OUT = path.join(__dirname, '..', 'public', 'demo', 'craftsman');

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

console.log('Generating Craftsman Mod masks...\n');

// ─── ROOF ──────────────────────────────────────────────
saveMask('mask_roof.png', (ctx) => {
    // Left wing roof
    ctx.beginPath();
    ctx.moveTo(100, 225); // Far left eave
    ctx.lineTo(195, 130); // Left peak
    ctx.lineTo(260, 190); // Valley
    ctx.lineTo(260, 168); // Up to main ridge
    ctx.lineTo(465, 168); // Main ridge right
    ctx.lineTo(465, 230); // intersection with right gable
    ctx.lineTo(350, 230); // just to close for now
    ctx.closePath();
    ctx.fill();

    // Right wing gable
    ctx.beginPath();
    ctx.moveTo(350, 238); // Valley left
    ctx.lineTo(465, 130); // Right peak
    ctx.lineTo(560, 238); // Right eave
    ctx.lineTo(510, 238); // inner eave
    ctx.lineTo(465, 185); // inner peak
    ctx.lineTo(390, 238); // inner valley
    ctx.closePath();
    ctx.fill();

    // Front porch roof
    ctx.beginPath();
    ctx.moveTo(255, 305);
    ctx.lineTo(395, 305);
    ctx.lineTo(405, 320);
    ctx.lineTo(245, 320);
    ctx.closePath();
    ctx.fill();
});

// ─── WALLS ─────────────────────────────────────────────
saveMask('mask_walls.png', (ctx) => {
    // Left Wing (Wood)
    ctx.beginPath();
    ctx.moveTo(122, 222);
    ctx.lineTo(195, 150);
    ctx.lineTo(252, 205);
    ctx.lineTo(252, 422);
    ctx.lineTo(122, 422);
    ctx.closePath();
    ctx.fill();

    // Right Wing (Stucco)
    ctx.beginPath();
    ctx.moveTo(270, 238);
    ctx.lineTo(390, 238);
    ctx.lineTo(465, 165);
    ctx.lineTo(530, 238);
    ctx.lineTo(560, 238);
    ctx.lineTo(560, 422);
    ctx.lineTo(270, 422);
    ctx.closePath();
    ctx.fill();

    // Middle section walls
    ctx.fillRect(252, 230, 145, 75);

    // CUT OUT window, door, garage areas
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';

    // Left large floor-to-ceiling window grid
    ctx.fillRect(156, 233, 91, 185);

    // Upper-right windows
    ctx.fillRect(413, 240, 36, 42);
    ctx.fillRect(456, 240, 36, 42);

    // Mid-level window
    ctx.fillRect(290, 246, 75, 44);

    // Front door
    ctx.fillRect(296, 332, 45, 87);

    // Garage door
    ctx.fillRect(400, 355, 140, 65);
});

// ─── WINDOWS ───────────────────────────────────────────
saveMask('mask_windows.png', (ctx) => {
    // Left wing floor-to-ceiling window grid
    ctx.fillRect(156, 233, 91, 185);

    // Upper-right pair of windows
    ctx.fillRect(413, 240, 36, 42);
    ctx.fillRect(456, 240, 36, 42);

    // Right wing mid-level window
    ctx.fillRect(290, 246, 75, 44);
});

// ─── WINDOW_1 (Left floor-to-ceiling) ─────────────────
saveMask('window_1.png', (ctx) => {
    ctx.fillRect(156, 233, 91, 185);
});

// ─── WINDOW_2 (Right side windows) ────────────────────
saveMask('window_2.png', (ctx) => {
    ctx.fillRect(413, 240, 36, 42);
    ctx.fillRect(456, 240, 36, 42);
    ctx.fillRect(290, 246, 75, 44);
});

// ─── DOOR ──────────────────────────────────────────────
saveMask('mask_door.png', (ctx) => {
    // Front door
    ctx.fillRect(296, 332, 45, 87);
});

// ─── TRIM ──────────────────────────────────────────────
saveMask('mask_trim.png', (ctx) => {
    // Trim lines based on the boundaries
    ctx.fillRect(122, 220, 130, 6);   // left wing
    ctx.fillRect(270, 234, 290, 6);  // right wing

    // Overhang trim above door
    ctx.fillRect(245, 316, 160, 5);

    // Corner boards / vertical trim
    ctx.fillRect(122, 222, 6, 200);   // far left
    ctx.fillRect(246, 205, 6, 217);  // center-left
    ctx.fillRect(270, 238, 6, 184);  // center-right
    ctx.fillRect(554, 238, 6, 184);  // far right

    // Window frames (thin lines around windows)
    ctx.fillRect(154, 231, 95, 3);
    ctx.fillRect(154, 418, 95, 3);
    ctx.fillRect(154, 231, 3, 190);
    ctx.fillRect(246, 231, 3, 190);

    // Right side big windows
    ctx.fillRect(411, 238, 83, 3);
    ctx.fillRect(411, 282, 83, 3);
    ctx.fillRect(411, 238, 3, 47);
    ctx.fillRect(491, 238, 3, 47);
});

// ─── GARAGE ────────────────────────────────────────────
saveMask('mask_garage.png', (ctx) => {
    // Garage door on right side
    ctx.fillRect(400, 355, 140, 65);
});

console.log('\n✅ All Craftsman masks generated!\n');
