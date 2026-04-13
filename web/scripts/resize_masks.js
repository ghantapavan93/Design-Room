const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processDemos(demoDir) {
    if (!fs.existsSync(demoDir)) {
        console.log(`Directory not found: ${demoDir}`);
        return;
    }

    const reports = [];
    const houses = fs.readdirSync(demoDir);

    for (const house of houses) {
        const houseDir = path.join(demoDir, house);
        if (!fs.statSync(houseDir).isDirectory()) continue;

        const baseImgPath = path.join(houseDir, 'base.jpg');
        if (!fs.existsSync(baseImgPath)) continue;

        // Get dimensions of base.jpg
        const baseMeta = await sharp(baseImgPath).metadata();
        const targetWidth = baseMeta.width;
        const targetHeight = baseMeta.height;

        let resizedCount = 0;
        const files = fs.readdirSync(houseDir);

        for (const file of files) {
            if (file === 'base.jpg') continue;

            const isMask = file.startsWith('mask_') && file.endsWith('.png');
            const isWindow = file.startsWith('window_') && file.endsWith('.png');

            if (isMask || isWindow) {
                const filePath = path.join(houseDir, file);
                const meta = await sharp(filePath).metadata();

                if (meta.width !== targetWidth || meta.height !== targetHeight) {
                    // Resize preserving transparency
                    const buffer = await sharp(filePath)
                        .resize({
                            width: targetWidth,
                            height: targetHeight,
                            fit: 'fill' // Force exact sizing to match aspect ratio mapping
                        })
                        .toBuffer();

                    fs.writeFileSync(filePath, buffer);
                    resizedCount++;
                }
            }
        }

        reports.push({
            folder: house,
            baseSize: `${targetWidth}x${targetHeight}`,
            filesResized: resizedCount
        });
    }

    console.log('\n--- Mask Resizer Report ---');
    console.table(reports);
    console.log('---------------------------\n');
}

processDemos(path.join(__dirname, '../public/demo'));
