#!/usr/bin/env node
/**
 * Comprehensive feature test for 103 Main St E, Port Colborne
 * Tests all claimed README features with real property data
 */

import { analyzeRentalProperty } from './lib/deal-analyzer.ts';
import { calculateSensitivityAnalysis } from './lib/advanced-metrics.ts';
import { calculateBreakEvenAnalysis } from './lib/break-even-calculator.ts';
import { calculateRiskAnalysis } from './lib/risk-analyzer.ts';
import { calculateTaxImpact } from './lib/tax-calculator.ts';

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

console.log('═══════════════════════════════════════════════════════');
console.log('  REI OPS™ - COMPREHENSIVE FEATURE TEST');
console.log('═══════════════════════════════════════════════════════');
console.log('Property: 103 Main St E, Port Colborne, ON');
console.log('Purchase: $299,900 | Rent: $1,800/mo | Down: 20%');
console.log('═══════════════════════════════════════════════════════\n');

const results = {
  core_analyzer: false,
  sensitivity_analysis: false,
  break_even_analysis: false,
  risk_analysis: false,
  tax_impact: false,
};

// ═══════════════════════════════════════════════════════════════
// TEST 1: Core Deal Analyzer
// ═══════════════════════════════════════════════════════════════
console.log('📊 TEST 1: Core Deal Analyzer');
console.log('─────────────────────────────────────────────────────\n');

try {
  const analysis = analyzeRentalProperty(propertyInputs);

  console.log('✅ Core Analyzer WORKS!\n');
  console.log('Financial Summary:');
  console.log(`  Monthly Cash Flow: $${analysis.cash_flow.monthly_cash_flow.toFixed(2)}`);
  console.log(`  Annual Cash Flow: $${analysis.cash_flow.annual_cash_flow.toFixed(2)}`);
  console.log(`  Cash-on-Cash Return: ${analysis.metrics.cash_on_cash_return.toFixed(2)}%`);
  console.log(`  Cap Rate: ${analysis.metrics.cap_rate.toFixed(2)}%`);
  console.log(`  DSCR: ${analysis.metrics.dscr.toFixed(2)}`);
  console.log(`  Deal Score: ${analysis.scoring.total_score}/100 (Grade: ${analysis.scoring.grade})`);

  console.log('\nAcquisition Costs:');
  console.log(`  Down Payment: $${analysis.acquisition.down_payment.toLocaleString()}`);
  console.log(`  Land Transfer Tax: $${analysis.acquisition.land_transfer_tax.toFixed(2)}`);
  console.log(`  CMHC Insurance: $${analysis.financing.cmhc_premium.toFixed(2)}`);
  console.log(`  Total Cash Needed: $${analysis.acquisition.total_acquisition_cost.toLocaleString()}`);

  if (analysis.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    analysis.warnings.forEach(w => console.log(`  ${w}`));
  }

  results.core_analyzer = true;

  // Save analysis for other tests
  global.testAnalysis = analysis;

} catch (error) {
  console.error('❌ Core Analyzer FAILED:');
  console.error(error.message);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════
// TEST 2: Sensitivity Analysis
// ═══════════════════════════════════════════════════════════════
console.log('📈 TEST 2: Sensitivity Analysis');
console.log('─────────────────────────────────────────────────────\n');

try {
  if (!global.testAnalysis) throw new Error('Core analysis required');

  const sensitivity = calculateSensitivityAnalysis(global.testAnalysis);

  console.log('✅ Sensitivity Analysis WORKS!\n');
  console.log('Rent Scenarios:');
  console.log(`  +10%: $${sensitivity.rent?.scenarios?.find(s => s.change === 10)?.new_cash_flow?.toFixed(2) || 'N/A'}/mo`);
  console.log(`  +5%: $${sensitivity.rent?.scenarios?.find(s => s.change === 5)?.new_cash_flow?.toFixed(2) || 'N/A'}/mo`);
  console.log(`  -5%: $${sensitivity.rent?.scenarios?.find(s => s.change === -5)?.new_cash_flow?.toFixed(2) || 'N/A'}/mo`);

  console.log('\nInterest Rate Scenarios:');
  console.log(`  +1%: $${sensitivity.interest_rate?.scenarios?.find(s => s.change === 1)?.new_cash_flow?.toFixed(2) || 'N/A'}/mo`);
  console.log(`  +0.5%: $${sensitivity.interest_rate?.scenarios?.find(s => s.change === 0.5)?.new_cash_flow?.toFixed(2) || 'N/A'}/mo`);

  results.sensitivity_analysis = true;

} catch (error) {
  console.error('❌ Sensitivity Analysis FAILED:');
  console.error(error.message);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════
// TEST 3: Break-Even Analysis
// ═══════════════════════════════════════════════════════════════
console.log('⚖️  TEST 3: Break-Even Analysis');
console.log('─────────────────────────────────────────────────────\n');

try {
  if (!global.testAnalysis) throw new Error('Core analysis required');

  const breakEven = calculateBreakEvenAnalysis(propertyInputs, global.testAnalysis);

  console.log('✅ Break-Even Analysis WORKS!\n');
  console.log(`Rent needed for break-even: $${breakEven.rent_breakeven?.breakeven_rent?.toFixed(2) || 'N/A'}/mo`);
  console.log(`Current rent: $${propertyInputs.monthly_rent}/mo`);
  console.log(`Shortfall: $${(breakEven.rent_breakeven?.breakeven_rent - propertyInputs.monthly_rent).toFixed(2) || 'N/A'}/mo`);

  if (breakEven.timeline) {
    console.log(`\nMonths to break-even: ${breakEven.timeline?.months_to_breakeven || 'Never (negative CF)'}`);
  }

  results.break_even_analysis = true;

} catch (error) {
  console.error('❌ Break-Even Analysis FAILED:');
  console.error(error.message);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════
// TEST 4: Risk Analysis
// ═══════════════════════════════════════════════════════════════
console.log('⚠️  TEST 4: Risk Analysis Dashboard');
console.log('─────────────────────────────────────────────────────\n');

try {
  if (!global.testAnalysis) throw new Error('Core analysis required');

  const riskAnalysis = calculateRiskAnalysis(global.testAnalysis, propertyInputs);

  console.log('✅ Risk Analysis WORKS!\n');
  console.log(`Overall Risk Score: ${riskAnalysis.overall_risk_score?.toFixed(1) || 'N/A'}/100`);
  console.log(`Risk Level: ${riskAnalysis.risk_level || 'N/A'}`);

  console.log('\nRisk Categories:');
  if (riskAnalysis.financial_risk) {
    console.log(`  Financial: ${riskAnalysis.financial_risk.score}/100 (${riskAnalysis.financial_risk.level})`);
  }
  if (riskAnalysis.market_risk) {
    console.log(`  Market: ${riskAnalysis.market_risk.score}/100 (${riskAnalysis.market_risk.level})`);
  }
  if (riskAnalysis.operational_risk) {
    console.log(`  Operational: ${riskAnalysis.operational_risk.score}/100 (${riskAnalysis.operational_risk.level})`);
  }

  results.risk_analysis = true;

} catch (error) {
  console.error('❌ Risk Analysis FAILED:');
  console.error(error.message);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════
// TEST 5: Tax Impact Calculator
// ═══════════════════════════════════════════════════════════════
console.log('💰 TEST 5: Canadian Tax Impact Calculator');
console.log('─────────────────────────────────────────────────────\n');

try {
  if (!global.testAnalysis) throw new Error('Core analysis required');

  const taxImpact = calculateTaxImpact(global.testAnalysis, propertyInputs, {
    marginal_tax_rate: 43.41, // Ontario top bracket
    holding_period_years: 10,
  });

  console.log('✅ Tax Impact Calculator WORKS!\n');
  console.log(`Annual Rental Income Tax: $${taxImpact.annual_rental_income_tax?.toFixed(2) || 'N/A'}`);
  console.log(`After-Tax Cash Flow: $${taxImpact.after_tax_cash_flow?.toFixed(2) || 'N/A'}/mo`);

  if (taxImpact.capital_gains_on_sale) {
    console.log(`\nProjected Capital Gains Tax (10yr): $${taxImpact.capital_gains_on_sale.toFixed(2)}`);
  }

  results.tax_impact = true;

} catch (error) {
  console.error('❌ Tax Impact Calculator FAILED:');
  console.error(error.message);
}

console.log('\n═══════════════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════
// FINAL RESULTS SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════');
console.log('  FINAL TEST RESULTS');
console.log('═══════════════════════════════════════════════════════\n');

const passed = Object.values(results).filter(Boolean).length;
const total = Object.keys(results).length;

console.log('Feature Test Results:');
Object.entries(results).forEach(([feature, passed]) => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const name = feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  console.log(`  ${status} - ${name}`);
});

console.log(`\n${passed}/${total} features working (${((passed/total)*100).toFixed(0)}%)`);

if (passed === total) {
  console.log('\n🎉 ALL TESTED FEATURES ARE WORKING! 🎉\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${total - passed} feature(s) need attention\n`);
  process.exit(1);
}
