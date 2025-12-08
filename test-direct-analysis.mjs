/**
 * Direct Test of Deal Analyzer
 * Tests the core calculation logic with 103 Main St E
 */

import { analyzeDeal } from './lib/deal-analyzer.ts';

const property103MainSt = {
    address: '103 Main Street E',
    city: 'Port Colborne',
    province: 'ON',
    postal_code: 'L3K 1S3',
    property_type: 'single_family',
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 1200,
    year_built: 1950,
    lot_size: 3500,
    purchase_price: 299900,
    down_payment_percent: 20,
    down_payment_amount: 59980,
    interest_rate: 5.5,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'needs_work',
    renovation_cost: 15000,
    monthly_rent: 1800,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: 3000,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0
};

console.log('🏠 Testing: 103 Main St E, Port Colborne');
console.log('=' .repeat(70));

try {
    const analysis = await analyzeDeal(property103MainSt);

    console.log('\n✅ ANALYSIS RESULTS:\n');
    console.log('📊 Key Metrics:');
    console.log(`   Purchase Price: $${analysis.inputs.purchase_price.toLocaleString()}`);
    console.log(`   Monthly Cash Flow: $${analysis.monthly_cash_flow?.toFixed(2)}`);
    console.log(`   Cash-on-Cash Return: ${analysis.cash_on_cash_return?.toFixed(2)}%`);
    console.log(`   Cap Rate: ${analysis.cap_rate?.toFixed(2)}%`);
    console.log(`   Deal Score: ${analysis.deal_score}/100`);
    console.log(`   Deal Grade: ${analysis.deal_grade}`);

    console.log('\n💰 Financial Breakdown:');
    console.log(`   Total Acquisition: $${analysis.total_acquisition_cost?.toLocaleString()}`);
    console.log(`   CMHC Insurance: $${analysis.cmhc_premium?.toLocaleString()}`);
    console.log(`   Land Transfer Tax: $${analysis.land_transfer_tax?.toLocaleString()}`);
    console.log(`   Mortgage Amount: $${analysis.mortgage_amount?.toLocaleString()}`);
    console.log(`   Monthly Mortgage: $${analysis.monthly_mortgage_payment?.toFixed(2)}`);

    console.log('\n📈 Returns:');
    console.log(`   Annual Cash Flow: $${analysis.annual_cash_flow?.toFixed(2)}`);
    console.log(`   DSCR: ${analysis.dscr?.toFixed(2)}`);
    console.log(`   GRM: ${analysis.grm?.toFixed(2)}`);

    if (analysis.reasoning) {
        console.log('\n🤔 Deal Analysis:');
        console.log(analysis.reasoning);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Test Complete!\n');

} catch (error) {
    console.error('\n❌ Error analyzing deal:', error.message);
    console.error(error);
}
