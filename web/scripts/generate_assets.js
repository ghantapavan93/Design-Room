const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const WIDTH = 1024;
const HEIGHT = 576; // 16:9
const DIR = path.join(__dirname, '..', 'public', 'demo');

if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
}

// Helper to draw a modern house
function drawHousePath(ctx, type) {
    // Common paths
    const houseY = 200;
    const houseW = 600;
    const houseH = 300;
    const houseX = (WIDTH - houseW) / 2;

    // Roof
    const roofHeight = 150;

    if (type === 'base') {
        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Grass
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, houseY + houseH, WIDTH, HEIGHT - (houseY + houseH));

        // Base shadows and outlines (greyscale)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(houseX, houseY, houseW, houseH);

        // Base Roof shape
        ctx.beginPath();
        ctx.moveTo(houseX - 50, houseY);
        ctx.lineTo(houseX + houseW / 2, houseY - roofHeight);
        ctx.lineTo(houseX + houseW + 50, houseY);
        ctx.closePath();
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();

        // Base trim
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(houseX - 10, houseY, houseW + 20, 15);
    }

    if (type === 'walls') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(houseX, houseY, houseW, houseH);

        // Cut out windows area (rough)
        ctx.globalCompositeOperation = 'destination-out';
        const winW = 100;
        const winH = 120;
        ctx.fillRect(houseX + 50, houseY + 50, winW, winH);
        ctx.fillRect(houseX + houseW - 150, houseY + 50, winW, winH);
        ctx.globalCompositeOperation = 'source-over';
    }

    if (type === 'roof') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(houseX - 50, houseY);
        ctx.lineTo(houseX + houseW / 2, houseY - roofHeight);
        ctx.lineTo(houseX + houseW + 50, houseY);
        ctx.closePath();
        ctx.fill();
    }

    if (type === 'trim') {
        ctx.fillStyle = '#000000';
        // Fascia
        ctx.fillRect(houseX - 10, houseY, houseW + 20, 15);
        // Corners
        ctx.fillRect(houseX, houseY, 15, houseH);
        ctx.fillRect(houseX + houseW - 15, houseY, 15, houseH);
        // Window trim
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;
        ctx.strokeRect(houseX + 50 - 5, houseY + 50 - 5, 110, 130);
        ctx.strokeRect(houseX + houseW - 150 - 5, houseY + 50 - 5, 110, 130);
    }

    if (type === 'windows') {
        ctx.fillStyle = '#000000';
        const winW = 100;
        const winH = 120;
        ctx.fillRect(houseX + 50, houseY + 50, winW, winH);
        ctx.fillRect(houseX + houseW - 150, houseY + 50, winW, winH);

        // Add realistic reflections to base out, for masks we want pure black where the mask should apply 
        // Wait, typical masks: white = apply, black = mask out? Or black = apply in multiply mode?
        // In our canvas code: offCtx.drawImage(maskImg, 0, 0); offCtx.globalCompositeOperation = 'destination-in';
        // This means mask should be opaque where you WANT color, and transparent where you don't.
        // The previous fills above were black but opaque black, so that works. We'll use Black.
    }
}

// Actually, destination-in with an image requires the image to be opaque where color should show, and transparent otherwise.
// If type=base, it's a solid JPG.
// If type=mask_*, we want transparent background and opaque shapes.

const generate = (name, type) => {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Clear to transparent (for masks)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawHousePath(ctx, type);

    const ext = type === 'base' ? 'jpg' : 'png';
    const buffer = ext === 'jpg' ? canvas.toBuffer('image/jpeg', { quality: 0.9 }) : canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(DIR, `${name}.${ext}`), buffer);
    console.log(`Generated ${name}.${ext}`);
};

generate('exterior_base', 'base');
generate('mask_walls', 'walls');
generate('mask_roof', 'roof');
generate('mask_trim', 'trim');
generate('mask_windows', 'windows');
