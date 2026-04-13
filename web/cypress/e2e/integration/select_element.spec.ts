import { test, expect } from '@playwright/test';

test('selects granular window independent of other layers on Craftsman design', async ({ page }) => {
    await page.goto('http://localhost:3001/design/2');

    // Wait for canvas ready state and 2D mode initialization
    await page.waitForTimeout(4000);

    // Take a full-layout screenshot for context
    await page.screenshot({ path: 'cypress/e2e/screenshots/initial-load.png' });

    // Note: the mouse needs to hover over the canvas
    // The lower-left window roughly revolves around ~ x=450 y=500 visually scaled depending on the window
    const canvasElement = page.locator('#design-canvas');
    await canvasElement.waitFor({ state: 'visible' });

    // Get bounding box of canvas
    const box = await canvasElement.boundingBox();
    if (box) {
        // Attempt clicking towards the lower-left middle section of the screen where the porch window rests
        await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.5);

        // Allow canvas a moment to re-render processing
        await page.waitForTimeout(500);

        // Screenshot click
        await page.screenshot({ path: 'cypress/e2e/screenshots/click-result.png' });

        // Now verify the actual text on the left MaterialPanel heading changed
        const headingText = await page.locator('.col-span-12 .text-slate-800.font-bold').textContent();
        console.log("Found Active Selection Header:", headingText);

        // To strictly test independence
        expect(headingText).toContain('Lower Left Window');
    }
});
