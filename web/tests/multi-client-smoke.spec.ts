import { test, expect } from '@playwright/test';

test.describe('Multi-Client Synchronization Smoke Test', () => {
    test('Should sync material changes and lock states between two clients', async ({ browser }) => {
        // Create two separate browser contexts
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        // 1. Setup: Open two windows to the same design URL
        await pageA.goto('/design/1');
        await pageB.goto('/design/1');

        // Wait for both to load the canvas
        await expect(pageA.getByText('Coastal Estate', { exact: false })).toBeVisible();
        await expect(pageB.getByText('Coastal Estate', { exact: false })).toBeVisible();

        // Wait a beat for ActionCable websockets to connect
        await pageA.waitForTimeout(1000);
        await pageB.waitForTimeout(1000);

        // 2. Apply Material: Change a material in Window A
        // Select 'walls' region via the category buttons
        await pageA.getByRole('button', { name: 'Paint' }).click();

        // Wait for material panel to show options and select one 
        const materialToClick = pageA.locator('text=Modern Charcoal').first();
        await materialToClick.click();
        await pageA.waitForTimeout(500); // Wait for optimistic update + network

        // Verify it instantly applies to Window B
        // We can check the Action Ledger in B to verify the sync arrived
        await pageB.getByRole('button', { name: /History/i }).click();
        await expect(pageB.getByText('Modern Charcoal', { exact: false }).first()).toBeVisible();
        // Close drawer (click backdrop or close button)
        await pageB.mouse.click(10, 10);
        await pageB.waitForTimeout(500);

        // 4. Locked Conflict: In Window A, lock the "Walls" region
        await pageA.getByRole('button', { name: 'Paint' }).click();
        // Click the lock action chip
        await pageA.getByRole('button', { name: /Lock/i }).click();
        await pageA.waitForTimeout(500); // Wait for lock broadcast

        // In Window B, try to apply material to Walls
        await pageB.getByRole('button', { name: 'Paint' }).click();
        await pageB.locator('text=Pacific Coast').first().click();

        // Verify Window B receives a "LOCKED" banner error
        await expect(pageB.getByText('Locked by', { exact: false })).toBeVisible();

        // Dismiss the banner
        await pageB.getByRole('button', { name: 'Dismiss' }).click();

        // 6. Live Comments: Drop a Region Comment in Window A
        // Region is still selected in A, click Comment
        await pageA.getByRole('button', { name: /Comment/i }).first().click();
        await pageA.getByPlaceholder('Type your feedback...').fill('Playwright test note');
        await pageA.getByRole('button', { name: 'Post' }).click();
        await pageA.waitForTimeout(500);

        // Verify comment instantly appears in Window B 
        await pageB.getByRole('button', { name: /Comment/i }).first().click();
        await expect(pageB.getByText('Playwright test note')).toBeVisible();

        // 7. Takeoff Recalculates
        await pageB.mouse.click(10, 10); // Close comments drawer
        await pageB.getByRole('button', { name: /Takeoff & Estimate/i }).click();
        await expect(pageB.getByText('Locked scope: 1 of')).toBeVisible();
        await expect(pageB.getByText('LIDAR Scan source')).toBeVisible();

        // Cleanup
        await contextA.close();
        await contextB.close();
    });
});
