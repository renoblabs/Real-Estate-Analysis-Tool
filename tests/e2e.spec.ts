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

    // Fill out the form to create a deal
    console.log('Filling out analysis form...');
    await page.fill('input[id="address"]', '123 Test St');
    await page.fill('input[id="city"]', 'Test City');

    // We need to scroll or ensure elements are visible, but Playwright auto-scrolls.
    // Purchase Price is likely in PurchaseFinancingForm
    // We assume the ID is purchase_price. If it's not, we might fail, but let's try.
    await page.fill('input[id="purchase_price"]', '500000');

    // Monthly Rent in RevenueForm
    await page.fill('input[id="monthly_rent"]', '3000');

    // Click Analyze
    console.log('Submitting analysis...');
    await page.click('button:has-text("Analyze Rental Property")');

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
