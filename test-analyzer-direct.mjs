#!/usr/bin/env node
// Direct test of the deal analyzer - bypasses all UI and auth

import { analyzeRentalProperty } from './lib/deal-analyzer.ts';

const propertyInputs = {
  // Location
  address: '103 Main Street E',
  city: 'Port Colborne',
  province: 'ON',
  postal_code: 'L3K 3V3',

  // Property details
  property_type: 'Single Family',
  bedrooms: 3,
  bathrooms: 1.5,
  square_feet: 1200,
  year_built: 1960,

  // Financial details
  purchase_price: 299900,
  down_payment_percent: 20,
  down_payment_amount: 59980,

  // Revenue
  monthly_rent: 1800,
  laundry_income: 0,
  parking_income: 0,
  storage_income: 0,
  other_income: 0,

  // Expenses
  monthly_property_tax: 250,
  monthly_insurance: 100,
  monthly_utilities: 0,
  monthly_hoa: 0,
  property_management_percent: 8,
  vacancy_rate: 5,
  maintenance_percent: 10,

  // Financing
  interest_rate: 5.5,
  amortization_years: 25,

  // Other
  strategy: 'buy_hold',
  is_first_time_buyer: false,
  renovation_budget: 15000,
};

console.log('🔧 Testing Deal Analyzer Core...\n');
console.log('Property: 103 Main St E, Port Colborne');
console.log('Price: $299,900 | Rent: $1,800/mo | Down: 20%\n');

try {
  const analysis = analyzeRentalProperty(propertyInputs);

  console.log('✅ ANALYZER WORKS!\n');
  console.log('📊 Results:');
  console.log('─────────────────────────────────────');
  console.log(`Monthly Cash Flow: $${analysis.cash_flow.monthly_cash_flow.toFixed(2)}`);
  console.log(`Annual Cash Flow: $${analysis.cash_flow.annual_cash_flow.toFixed(2)}`);
  console.log(`Cash-on-Cash Return: ${analysis.metrics.cash_on_cash_return.toFixed(2)}%`);
  console.log(`Cap Rate: ${analysis.metrics.cap_rate.toFixed(2)}%`);
  console.log(`DSCR: ${analysis.metrics.dscr.toFixed(2)}`);
  console.log(`Deal Score: ${analysis.scoring.total_score}/100 (Grade: ${analysis.scoring.grade})`);
  console.log('─────────────────────────────────────\n');

  console.log('💰 Costs:');
  console.log(`  Down Payment: $${analysis.acquisition.down_payment.toLocaleString()}`);
  console.log(`  Land Transfer Tax: $${analysis.acquisition.land_transfer_tax.toFixed(2)}`);
  console.log(`  CMHC Insurance: $${analysis.financing.cmhc_premium.toFixed(2)}`);
  console.log(`  Total Cash Needed: $${analysis.acquisition.total_acquisition_cost.toLocaleString()}\n`);

  if (analysis.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    analysis.warnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }

  console.log('✅ Core deal analyzer is WORKING');

} catch (error) {
  console.error('❌ ANALYZER BROKEN:');
  console.error(error);
  process.exit(1);
}
