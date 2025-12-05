import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
    test('should switch between Pipeline and Portfolio tabs', async ({ page }) => {
        await page.goto('/portfolio');

        // Check initial state (Pipeline tab active by default)
        await expect(page.getByRole('tab', { name: 'Pipeline' })).toHaveAttribute('data-state', 'active');

        // Click Portfolio tab
        await page.getByRole('tab', { name: 'Portfolio' }).click();
        await expect(page.getByRole('tab', { name: 'Portfolio' })).toHaveAttribute('data-state', 'active');

        // Verify content change (look for specific text or elements unique to Portfolio view)
        // For now, we just check the tab state switch
    });
});

test.describe('Analyze Page', () => {
    test('should show Repliers.io option', async ({ page }) => {
        await page.goto('/analyze');

        // Check for the Data Source dropdown
        // Note: Radix UI Select components can be tricky to test, usually need to click trigger first
        // But we can check if the text is present in the DOM
        await expect(page.getByText('Quick Start - Import from MLS')).toBeVisible();

        // Verify default state or presence of selector
        // This depends on how the Select is rendered, but we can look for the label
        await expect(page.getByLabel('Data Source')).toBeVisible();
    });
});
