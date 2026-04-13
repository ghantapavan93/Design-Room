const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function checkMasks() {
    const img = await loadImage('./public/demo/craftsman/base.jpg');
    const canvas = createCanvas(640, 640);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // ROOF (Dark Shingles) - Blue
    ctx.fillStyle = 'rgba(0, 0, 255, 0.4)';
    // Left side roof + middle roof behind it
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

    // Right gable roof
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

    // WALLS - Red
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';

    // Left Wing (Wood)
    ctx.beginPath();
    ctx.moveTo(122, 222); // Top left
    ctx.lineTo(195, 150); // Peak
    ctx.lineTo(252, 205); // Top right
    ctx.lineTo(252, 422); // Bottom right
    ctx.lineTo(122, 422); // Bottom left
    ctx.closePath();
    ctx.fill();

    // Right Wing (Stucco)
    ctx.beginPath();
    ctx.moveTo(270, 238); // Top left under roof
    ctx.lineTo(390, 238); // to inner valley
    ctx.lineTo(465, 165); // Peak
    ctx.lineTo(530, 238); // Top right
    ctx.lineTo(560, 238); // eave bump out
    ctx.lineTo(560, 422); // Bottom right
    ctx.lineTo(270, 422); // Bottom left
    ctx.closePath();
    ctx.fill();

    // Middle section walls
    ctx.fillRect(252, 230, 145, 75); // Above porch

    // WINDOWS - Green
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    // Left big window
    ctx.fillRect(152, 230, 90, 185);
    // Upper Right Windows
    ctx.fillRect(410, 235, 38, 38);
    ctx.fillRect(455, 235, 38, 38);
    // Mid windows
    ctx.fillRect(285, 245, 95, 40);

    // DOOR - Yellow
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.fillRect(290, 335, 60, 85);

    // GARAGE - Purple
    ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
    ctx.fillRect(398, 355, 140, 65);

    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync('./public/demo/craftsman/overlay_test.png', buf);
    console.log('Saved overley_test.png');
}

checkMasks();
