import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let userEmail: string;

test('Complete User Flow: Signup -> Analyze -> Portfolio', async ({ page }) => {
    // 1. Sign Up
    const timestamp = Date.now();
    userEmail = `test-${timestamp}@example.com`;
    const password = 'password123';

    console.log(`Creating test user: ${userEmail}`);

    await page.goto('/signup');
    await page.fill('input[id="email"]', userEmail);
    await page.fill('input[id="password"]', password);
    await page.fill('input[id="confirmPassword"]', password);
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await expect(page.getByText('Account created successfully!')).toBeVisible({ timeout: 10000 });
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 2. Test Analyze Page (Repliers Integration & Create Deal)
    console.log('Testing Analyze Page...');
    await page.goto('/analyze');

    // Check for the Data Source dropdown
    await expect(page.getByText('Quick Start - Import from MLS')).toBeVisible();

    // Test Repliers Import with MLS X12531322 (103 Main St E)
    console.log('Testing Repliers Import with MLS X12531322...');

    // Enter MLS Number
    await page.fill('input[placeholder*="Enter MLS Number"]', 'X12531322');

    // Click Auto-Fill
    await page.getByRole('button', { name: 'Auto-Fill' }).click();

    // Wait for success toast
    await expect(page.getByText('Property details imported successfully')).toBeVisible({ timeout: 15000 });

    // Verify fields are populated
    const addressValue = await page.inputValue('input[id="address"]');
    console.log(`Imported Address: ${addressValue}`);
    expect(addressValue).not.toBe('');
    // Verify it matches the expected property
    expect(addressValue.toLowerCase()).toContain('main');

    const priceValue = await page.inputValue('input[id="purchase_price"]');
    console.log(`Imported Price: ${priceValue}`);
    expect(priceValue).not.toBe('');
    expect(priceValue).not.toBe('0');

    // Fill remaining required fields if any are missing
    // Monthly Rent in RevenueForm (Estimate for test)
    await page.fill('input[id="monthly_rent"]', '2500');

    // Click Analyze
    console.log('Submitting analysis...');
    await page.getByRole('button', { name: 'Analyze Rental Property' }).click();

    // Wait for success toast
    await expect(page.getByText('Deal analyzed and saved successfully!')).toBeVisible({ timeout: 10000 });

    // 3. Test Portfolio Page (Tabs)
    console.log('Testing Portfolio Page...');
    await page.goto('/portfolio');

    // Now that we have a deal, the tabs should be visible!
    const pipelineTab = page.getByRole('tab', { name: 'Pipeline' });
    const portfolioTab = page.getByRole('tab', { name: 'Portfolio' });

    await expect(pipelineTab).toBeVisible();
    await expect(pipelineTab).toHaveAttribute('data-state', 'active');

    // Click Portfolio tab
    await portfolioTab.click();
    await expect(portfolioTab).toHaveAttribute('data-state', 'active');
    await expect(pipelineTab).toHaveAttribute('data-state', 'inactive');

    console.log('Portfolio tabs switched successfully!');
});
