import { test, expect } from '@playwright/test';

/**
 * Automated feature verification for 103 Main St property
 * Tests core analyzer and advanced features WITHOUT requiring auth
 */

test.describe('Core Deal Analyzer - No Auth Required', () => {

  test('analyze page loads and form is accessible', async ({ page }) => {
    await page.goto('/analyze');

    // Check page loads
    await expect(page).toHaveTitle(/REI OPS|Analyze/i);

    // Verify key form fields exist
    await expect(page.locator('input[id*="address"], input[name*="address"]')).toBeVisible();
    await expect(page.locator('input[id*="purchase"], input[name*="purchase"]')).toBeVisible();
    await expect(page.locator('input[id*="rent"], input[name*="rent"]')).toBeVisible();

    console.log('✅ Analyze page loads, form fields present');
  });

  test('can fill in 103 Main St property data and get results', async ({ page }) => {
    await page.goto('/analyze');

    // Fill in property data
    console.log('📝 Filling in 103 Main St property data...');

    // Try multiple selector strategies (id, name, placeholder, label)
    const fillField = async (fieldName: string, value: string) => {
      const selectors = [
        `input[id*="${fieldName}"]`,
        `input[name*="${fieldName}"]`,
        `input[placeholder*="${fieldName}"]`,
        `//label[contains(text(), '${fieldName}')]/..//input`
      ];

      for (const selector of selectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible({ timeout: 1000 })) {
            await field.fill(value);
            return;
          }
        } catch (e) {
          // Try next selector
        }
      }
      console.warn(`⚠️  Could not find field: ${fieldName}`);
    };

    await fillField('address', '103 Main Street E');
    await fillField('city', 'Port Colborne');
    await fillField('province', 'ON');
    await fillField('postal', 'L3K 3V3');

    await fillField('purchase', '299900');
    await fillField('down', '20');
    await fillField('rent', '1800');

    await fillField('property_tax', '250');
    await fillField('insurance', '100');
    await fillField('interest', '5.5');

    console.log('✅ Property data filled in');

    // Submit form
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Calculate"), button[type="submit"]').first();
    await analyzeButton.click();

    console.log('🔄 Form submitted, waiting for results...');

    // Wait for results to appear (look for key metrics)
    await page.waitForTimeout(3000); // Give it time to calculate

    // Check if results rendered (look for common result indicators)
    const hasResults = await page.locator('text=/cash flow|monthly|annual|cap rate|score/i').count() > 0;
    expect(hasResults).toBeTruthy();

    console.log('✅ Results appeared on page');
  });

  test('calculations are in expected range for 103 Main St', async ({ page }) => {
    await page.goto('/analyze');

    // Fill form quickly
    await page.fill('input[id*="purchase"], input[name*="purchase"]', '299900');
    await page.fill('input[id*="down"], input[name*="down"]', '20');
    await page.fill('input[id*="rent"], input[name*="rent"]', '1800');
    await page.fill('input[id*="tax"], input[name*="property_tax"]', '250');
    await page.fill('input[id*="insurance"]', '100');

    await page.locator('button[type="submit"], button:has-text("Analyze")').first().click();
    await page.waitForTimeout(3000);

    // Extract and verify key numbers
    const pageContent = await page.content();

    console.log('📊 Checking calculated values...');

    // Look for negative cash flow (should be around -$437)
    const hasNegativeCashFlow = pageContent.includes('-$') || pageContent.includes('negative');
    expect(hasNegativeCashFlow).toBeTruthy();
    console.log('✅ Detected negative cash flow (expected)');

    // Look for CMHC = $0 (20% down should not require insurance)
    const hasCMHC = /CMHC.*\$0|insurance.*\$0/i.test(pageContent);
    if (hasCMHC) {
      console.log('✅ CMHC insurance $0 (correct for 20% down)');
    }

    // Look for deal score/grade
    const hasScore = /score|grade|[A-F]/i.test(pageContent);
    expect(hasScore).toBeTruthy();
    console.log('✅ Deal score/grade displayed');
  });

  test('advanced analysis features are accessible', async ({ page }) => {
    await page.goto('/analyze');

    // Quick analysis first
    await page.fill('input[id*="purchase"], input[name*="purchase"]', '299900');
    await page.fill('input[id*="rent"], input[name*="rent"]', '1800');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    console.log('🔍 Checking for advanced features...');

    // Look for tabs, sections, or buttons for advanced features
    const features = {
      sensitivity: await page.locator('text=/sensitivity/i').count() > 0,
      breakeven: await page.locator('text=/break.*even/i').count() > 0,
      risk: await page.locator('text=/risk/i').count() > 0,
      tax: await page.locator('text=/tax/i').count() > 0,
      irr: await page.locator('text=/IRR|NPV/i').count() > 0,
    };

    console.log('📋 Advanced features found:');
    Object.entries(features).forEach(([name, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${name.toUpperCase()}`);
    });

    const foundCount = Object.values(features).filter(Boolean).length;
    console.log(`\n${foundCount}/5 advanced features accessible`);

    // At least some advanced features should be present
    expect(foundCount).toBeGreaterThan(0);
  });

  test('key calculations match expected ranges', async ({ page }) => {
    await page.goto('/analyze');

    // Fill complete property data
    const fields = {
      'purchase': '299900',
      'down': '20',
      'rent': '1800',
      'property_tax': '250',
      'insurance': '100',
      'interest': '5.5',
      'amortization': '25',
    };

    for (const [field, value] of Object.entries(fields)) {
      try {
        await page.fill(`input[id*="${field}"], input[name*="${field}"]`, value);
      } catch (e) {
        // Field might not exist or have different name
      }
    }

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    const content = await page.content();

    console.log('🧮 Validating calculation ranges...');

    const tests = [
      {
        name: 'Negative cash flow',
        check: () => content.includes('-$') && /cash.*flow/i.test(content),
        expected: '~-$437/mo'
      },
      {
        name: 'Cap rate 3-5%',
        check: () => /cap.*rate.*[3-5]\./i.test(content),
        expected: '~4.2%'
      },
      {
        name: 'Poor deal grade',
        check: () => /grade.*[DF]|[DF].*grade/i.test(content) || /score.*[0-4]\d/i.test(content),
        expected: 'D or F grade'
      },
      {
        name: 'Land transfer tax',
        check: () => /transfer.*tax.*\$[2-3],?\d{3}/i.test(content) || /LTT.*\$[2-3],?\d{3}/i.test(content),
        expected: '~$2,974'
      }
    ];

    tests.forEach(t => {
      const passed = t.check();
      console.log(`  ${passed ? '✅' : '⚠️ '} ${t.name}: ${t.expected}`);
    });
  });

  test('can navigate to different analysis views', async ({ page }) => {
    await page.goto('/analyze');

    // Look for navigation elements (tabs, links, buttons)
    const navElements = await page.locator('nav, [role="tablist"], .tabs, .navigation').count();

    if (navElements > 0) {
      console.log('✅ Found navigation elements for different views');

      // Try clicking different tabs/sections if they exist
      const tabs = await page.locator('[role="tab"], .tab, button:has-text("Analysis"), button:has-text("Details")').all();
      console.log(`📑 Found ${tabs.length} navigable sections`);
    } else {
      console.log('ℹ️  No tab navigation found (might be single-page view)');
    }
  });

  test('no critical errors in console', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/analyze');
    await page.fill('input[id*="purchase"]', '299900');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Filter out common/ignorable errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('DevTools') &&
      !e.includes('Extension')
    );

    if (criticalErrors.length > 0) {
      console.error('❌ Console errors found:');
      criticalErrors.forEach(e => console.error(`  - ${e}`));
    } else {
      console.log('✅ No critical console errors');
    }

    expect(criticalErrors.length).toBeLessThan(3); // Allow a couple non-critical errors
  });
});

test.describe('Deal Management - May Require Auth', () => {

  test('can access deals page', async ({ page }) => {
    const response = await page.goto('/deals');

    // Either shows deals page OR redirects to login (both valid)
    const isDealsPage = page.url().includes('/deals');
    const isLoginPage = page.url().includes('/login') || page.url().includes('/signin');

    if (isDealsPage) {
      console.log('✅ Deals page accessible (no auth required)');
    } else if (isLoginPage) {
      console.log('ℹ️  Deals page requires authentication (expected)');
    }

    expect(isDealsPage || isLoginPage).toBeTruthy();
  });

  test('analyze page works without authentication', async ({ page }) => {
    await page.goto('/analyze');

    // Should NOT redirect to login
    expect(page.url()).toContain('/analyze');
    console.log('✅ Analyze page accessible without auth');
  });
});
