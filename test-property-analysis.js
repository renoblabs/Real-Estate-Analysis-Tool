#!/usr/bin/env node

/**
 * Test Property Analysis Workflow
 * Tests analyzing 103 Main St E, Port Colborne with the real app
 */

// Import the analysis library directly
const path = require('path');

// Property data for 103 Main St E, Port Colborne
const property103MainSt = {
    // Property Details
    address: '103 Main Street E',
    city: 'Port Colborne',
    province: 'ON',
    postal_code: 'L3K 1S3',
    property_type: 'single_family',
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 1200, // Estimate for older 1.5 storey
    year_built: 1950, // Estimate
    lot_size: 3500, // Estimate

    // Purchase & Financing
    purchase_price: 299900,
    down_payment_percent: 20,
    down_payment_amount: 59980,
    interest_rate: 5.5,
    amortization_years: 25,

    // Strategy
    strategy: 'buy_hold',
    property_condition: 'needs_work',
    renovation_cost: 15000, // Light reno estimate

    // Revenue (Port Colborne market estimates)
    monthly_rent: 1800, // Conservative for Port Colborne
    other_income: 0,
    vacancy_rate: 5,

    // Expenses (estimates for Port Colborne)
    property_tax_annual: 3000,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0, // Assume tenant pays
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0
};

console.log('🏠 Testing Property Analysis: 103 Main St E, Port Colborne');
console.log('=' .repeat(70));
console.log('\nProperty Details:');
console.log(JSON.stringify(property103MainSt, null, 2));

async function testAnalysis() {
    try {
        // Import the deal analyzer
        const analyzerPath = path.join(__dirname, 'lib', 'deal-analyzer.ts');
        console.log('\n📊 Loading deal analyzer from:', analyzerPath);

        // Since we can't directly import TS, let's test via API endpoint
        console.log('\n🔗 Testing via API endpoint...');

        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(property103MainSt)
        });

        console.log(`\n📡 Response Status: ${response.status}`);

        if (!response.ok) {
            const error = await response.text();
            console.log('❌ Error Response:', error);

            if (response.status === 404) {
                console.log('\n⚠️  API endpoint not found. This is expected - the app uses client-side analysis.');
                console.log('✅ The analysis happens in the browser, not via API.');
                console.log('\n💡 To test, you need to:');
                console.log('   1. Open http://localhost:3000/analyze in a browser');
                console.log('   2. Fill in the property details shown above');
                console.log('   3. Click "Analyze Deal"');
                return;
            }
        }

        const result = await response.json();
        console.log('\n✅ Analysis Result:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('\n❌ Error: Cannot connect to dev server');
            console.log('Make sure the dev server is running: npm run dev');
        } else {
            console.error('\n❌ Error:', error.message);
            console.error(error);
        }
    }
}

console.log('\n🚀 Starting test...\n');
testAnalysis();
