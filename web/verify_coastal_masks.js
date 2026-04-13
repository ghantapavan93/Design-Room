const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function checkMasks() {
    const img = await loadImage('./public/demo/coastal/base.jpg');
    const canvas = createCanvas(640, 640);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // ROOF - Dark Gray Shingles
    ctx.fillStyle = 'rgba(0, 0, 255, 0.4)';

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

    // WALLS - Cedar Shake Siding
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';

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

    // WINDOWS - Green
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    // Left Wing double hungs
    ctx.fillRect(118, 260, 23, 50); // top left
    ctx.fillRect(80, 385, 40, 50); // bottom left

    // Upper Story
    ctx.fillRect(366, 245, 23, 50);
    ctx.fillRect(398, 245, 23, 50);
    ctx.fillRect(430, 245, 23, 50);

    // Front Porch Right Window
    ctx.fillRect(380, 380, 75, 60);

    // DOOR - Yellow
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.fillRect(302, 380, 35, 95);

    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync('./public/demo/coastal/overlay_test.png', buf);
    console.log('Saved coastal overlay_test.png');
}

checkMasks();
