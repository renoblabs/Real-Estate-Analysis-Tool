import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' }); // Run tests in order, sharing state if needed

let userEmail: string;

test.beforeAll(async ({ browser }) => {
    // Optional: Create a context if we wanted to reuse it across tests, 
    // but Playwright creates a fresh context per test by default.
    // To share auth state, we can use storageState, or just sign up in a setup step 
    // and save the state, or sign up in a beforeEach.
    // For simplicity in this "gauntlet", let's just sign up once in the first test 
    // and use that state, OR sign up in every test (slower but isolated).

    // Actually, let's use a "setup" test pattern or just put the signup in a beforeEach 
    // if we want isolation, but that spams the DB.
    // Let's do a single flow test for now: Signup -> Analyze -> Portfolio
});

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

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 2. Test Analyze Page (Repliers Integration)
    console.log('Testing Analyze Page...');
    await page.goto('/analyze');

    // Check for the Data Source dropdown
    await expect(page.getByText('Quick Start - Import from MLS')).toBeVisible();

    // Check if Repliers option is available (it's in a Select, so we might need to open it to see the option, 
    // but the label "Data Source" should be visible)
    await expect(page.getByLabel('Data Source')).toBeVisible();

    // 3. Test Portfolio Page (Tabs)
    console.log('Testing Portfolio Page...');
    await page.goto('/portfolio');

    // Check initial state (Pipeline tab active by default)
    // Note: Radix UI tabs use role="tab"
    const pipelineTab = page.getByRole('tab', { name: 'Pipeline' });
    const portfolioTab = page.getByRole('tab', { name: 'Portfolio' }); // or "Owned Properties" depending on text

    await expect(pipelineTab).toBeVisible();
    await expect(pipelineTab).toHaveAttribute('data-state', 'active');

    // Click Portfolio tab
    await portfolioTab.click();
    await expect(portfolioTab).toHaveAttribute('data-state', 'active');
    await expect(pipelineTab).toHaveAttribute('data-state', 'inactive');

    console.log('Portfolio tabs switched successfully!');
});
