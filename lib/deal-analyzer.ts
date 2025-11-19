// REI OPS™ - Deal Analysis Engine

import type {
  PropertyInputs,
  DealAnalysis,
  AcquisitionCosts,
  Financing,
  Revenue,
  Expenses,
  CashFlow,
  Metrics,
  BRRRRAnalysis,
  MarketComparison,
  DealFlags,
  PropertyType
} from '@/types';

import {
  calculateCMHCInsurance,
  calculateLandTransferTax,
  calculateStressTest,
  calculateMortgagePayment,
  calculateMortgageBalance,
  calculateBreakevenOccupancy
} from './canadian-calculations';

import { calculateDealScore } from './deal-scoring';
import { MARKET_BENCHMARKS, CLOSING_COSTS } from '@/constants/market-data';

/**
 * Main deal analysis function
 * Takes property inputs and returns comprehensive analysis
 */
export function analyzeDeal(inputs: PropertyInputs): DealAnalysis {
  // Calculate acquisition costs
  const acquisition = calculateAcquisitionCosts(inputs);

  // Calculate financing details
  const financing = calculateFinancing(inputs, acquisition);

  // Calculate revenue
  const revenue = calculateRevenue(inputs);

  // Calculate expenses
  const expenses = calculateExpenses(inputs, financing, revenue);

  // Calculate cash flow
  const cash_flow = calculateCashFlow(revenue, expenses);

  // Calculate key metrics
  const metrics = calculateMetrics(
    inputs,
    acquisition,
    revenue,
    expenses,
    cash_flow
  );

  // Calculate BRRRR analysis if applicable
  const brrrr = inputs.strategy === 'brrrr' && inputs.after_repair_value
    ? calculateBRRRR(inputs, acquisition, financing, cash_flow)
    : undefined;

  // Get market comparison
  const market_comparison = getMarketComparison(inputs, metrics);

  // Generate warnings and flags
  const { warnings, flags } = generateWarningsAndFlags(
    inputs,
    metrics,
    financing,
    cash_flow,
    market_comparison
  );

  // Create initial analysis object
  const analysis: DealAnalysis = {
    property: inputs,
    acquisition,
    financing,
    revenue,
    expenses,
    cash_flow,
    metrics,
    brrrr,
    market_comparison,
    warnings,
    flags,
    scoring: { total_score: 0, grade: 'F', color: 'red', reasons: [] }
  };

  // Calculate deal score (needs full analysis)
  analysis.scoring = calculateDealScore(analysis);

  return analysis;
}

/**
 * Calculate acquisition costs
 */
function calculateAcquisitionCosts(inputs: PropertyInputs): AcquisitionCosts {
  const { purchase_price, down_payment_amount, province, city, is_first_time_buyer } = inputs;

  // Calculate land transfer tax
  const lttResult = calculateLandTransferTax(
    purchase_price,
    province,
    city,
    is_first_time_buyer || false
  );

  const legal_fees = inputs.legal_fees || CLOSING_COSTS.legal_fees;
  const inspection = inputs.inspection_cost || CLOSING_COSTS.inspection;
  const appraisal = inputs.appraisal_cost || CLOSING_COSTS.appraisal;
  const other_closing_costs = CLOSING_COSTS.title_insurance;

  const total_acquisition_cost =
    down_payment_amount +
    lttResult.netTax +
    legal_fees +
    inspection +
    appraisal +
    other_closing_costs;

  return {
    purchase_price,
    down_payment: down_payment_amount,
    land_transfer_tax: lttResult.netTax,
    legal_fees,
    inspection,
    appraisal,
    other_closing_costs,
    total_acquisition_cost
  };
}

/**
 * Calculate financing details
 */
function calculateFinancing(
  inputs: PropertyInputs,
  acquisition: AcquisitionCosts
): Financing {
  const { purchase_price, down_payment_percent, interest_rate, amortization_years } = inputs;

  // Calculate CMHC insurance
  const cmhcResult = calculateCMHCInsurance(purchase_price, down_payment_percent);

  const mortgage_amount = cmhcResult.totalMortgageWithInsurance;
  const monthly_payment = calculateMortgagePayment(
    mortgage_amount,
    interest_rate,
    amortization_years
  );

  // Calculate stress test
  const stressTest = calculateStressTest(
    mortgage_amount,
    interest_rate,
    amortization_years
  );

  return {
    mortgage_amount: purchase_price - acquisition.down_payment,
    cmhc_premium: cmhcResult.premium,
    total_mortgage_with_insurance: mortgage_amount,
    monthly_payment,
    annual_payment: monthly_payment * 12,
    stress_test_rate: stressTest.stressTestRate,
    stress_test_payment: stressTest.qualificationPayment
  };
}

/**
 * Calculate revenue
 */
function calculateRevenue(inputs: PropertyInputs): Revenue {
  const { monthly_rent, other_income, vacancy_rate } = inputs;

  const gross_monthly_rent = monthly_rent;
  const other_monthly_income = other_income;
  const total_monthly_income = gross_monthly_rent + other_monthly_income;
  const vacancy_loss_monthly = total_monthly_income * (vacancy_rate / 100);
  const effective_monthly_income = total_monthly_income - vacancy_loss_monthly;

  return {
    gross_monthly_rent,
    other_monthly_income,
    total_monthly_income,
    vacancy_loss_monthly,
    effective_monthly_income,
    annual_gross_income: total_monthly_income * 12,
    annual_effective_income: effective_monthly_income * 12
  };
}

/**
 * Calculate expenses
 */
function calculateExpenses(
  inputs: PropertyInputs,
  financing: Financing,
  revenue: Revenue
): Expenses {
  const {
    property_tax_annual,
    insurance_annual,
    property_management_percent,
    maintenance_percent,
    utilities_monthly,
    hoa_condo_fees_monthly,
    other_expenses_monthly
  } = inputs;

  const monthly_mortgage = financing.monthly_payment;
  const monthly_property_tax = property_tax_annual / 12;
  const monthly_insurance = insurance_annual / 12;
  const monthly_pm = (revenue.gross_monthly_rent * property_management_percent) / 100;
  const monthly_maintenance = (revenue.gross_monthly_rent * maintenance_percent) / 100;

  const monthly_total =
    monthly_mortgage +
    monthly_property_tax +
    monthly_insurance +
    monthly_pm +
    monthly_maintenance +
    utilities_monthly +
    hoa_condo_fees_monthly +
    other_expenses_monthly;

  return {
    monthly: {
      mortgage: monthly_mortgage,
      property_tax: monthly_property_tax,
      insurance: monthly_insurance,
      property_management: monthly_pm,
      maintenance: monthly_maintenance,
      utilities: utilities_monthly,
      hoa_fees: hoa_condo_fees_monthly,
      other: other_expenses_monthly,
      total: monthly_total
    },
    annual: {
      mortgage: monthly_mortgage * 12,
      property_tax: property_tax_annual,
      insurance: insurance_annual,
      property_management: monthly_pm * 12,
      maintenance: monthly_maintenance * 12,
      utilities: utilities_monthly * 12,
      hoa_fees: hoa_condo_fees_monthly * 12,
      other: other_expenses_monthly * 12,
      total: monthly_total * 12
    }
  };
}

/**
 * Calculate cash flow
 */
function calculateCashFlow(revenue: Revenue, expenses: Expenses): CashFlow {
  const monthly_net = revenue.effective_monthly_income - expenses.monthly.total;
  const annual_net = monthly_net * 12;

  // NOI = Net Operating Income (before debt service)
  const monthly_before_debt =
    revenue.effective_monthly_income -
    (expenses.monthly.total - expenses.monthly.mortgage);
  const annual_noi = monthly_before_debt * 12;

  return {
    monthly_net,
    annual_net,
    monthly_before_debt,
    annual_noi
  };
}

/**
 * Calculate key metrics
 */
function calculateMetrics(
  inputs: PropertyInputs,
  acquisition: AcquisitionCosts,
  revenue: Revenue,
  expenses: Expenses,
  cash_flow: CashFlow
): Metrics {
  const { purchase_price } = inputs;

  // Cap Rate = NOI / Purchase Price
  const cap_rate = (cash_flow.annual_noi / purchase_price) * 100;

  // Cash-on-Cash Return = Annual Cash Flow / Total Cash Invested
  const total_cash_invested = acquisition.total_acquisition_cost;
  const cash_on_cash_return = total_cash_invested > 0
    ? (cash_flow.annual_net / total_cash_invested) * 100
    : 0;

  // DSCR = NOI / Annual Debt Service
  const annual_debt_service = expenses.annual.mortgage;
  const dscr = annual_debt_service > 0
    ? cash_flow.annual_noi / annual_debt_service
    : 0;

  // GRM = Purchase Price / Gross Annual Rent
  const grm = revenue.annual_gross_income > 0
    ? purchase_price / revenue.annual_gross_income
    : 0;

  // Expense Ratio = Operating Expenses / Gross Income
  const operating_expenses = expenses.annual.total - expenses.annual.mortgage;
  const expense_ratio = revenue.annual_gross_income > 0
    ? (operating_expenses / revenue.annual_gross_income) * 100
    : 0;

  // Breakeven Occupancy
  const breakeven_occupancy = calculateBreakevenOccupancy(
    expenses.annual.total,
    revenue.annual_gross_income
  );

  return {
    cap_rate,
    cash_on_cash_return,
    dscr,
    grm,
    expense_ratio,
    breakeven_occupancy
  };
}

/**
 * Calculate BRRRR strategy analysis
 */
function calculateBRRRR(
  inputs: PropertyInputs,
  acquisition: AcquisitionCosts,
  financing: Financing,
  cash_flow: CashFlow
): BRRRRAnalysis {
  const {
    after_repair_value = 0,
    renovation_cost,
    interest_rate,
    amortization_years
  } = inputs;

  const total_investment =
    acquisition.total_acquisition_cost + renovation_cost;

  // Assume refinance at 75% LTV
  const refinance_ltv_percent = 75;
  const refinance_amount = after_repair_value * (refinance_ltv_percent / 100);

  // Calculate remaining mortgage balance (assume 1 year for reno + refinance)
  const original_mortgage_balance = calculateMortgageBalance(
    financing.total_mortgage_with_insurance,
    interest_rate,
    amortization_years,
    1
  );

  // Cash recovered = refinance amount - original mortgage payoff
  const cash_recovered = Math.max(0, refinance_amount - original_mortgage_balance);

  // Cash left in deal
  const cash_left_in_deal = total_investment - cash_recovered;

  // Infinite return if all cash recovered
  const infinite_return = cash_left_in_deal <= 0;

  // New mortgage payment after refinance
  const new_monthly_payment = calculateMortgagePayment(
    refinance_amount,
    interest_rate,
    amortization_years
  );

  // Cash flow after refinance (simplified - assumes same rent/expenses)
  const cash_flow_after_refi =
    cash_flow.monthly_net -
    (new_monthly_payment - financing.monthly_payment);

  // Effective CoC return
  const effective_coc_return = infinite_return
    ? '∞'
    : cash_left_in_deal > 0
      ? ((cash_flow_after_refi * 12) / cash_left_in_deal) * 100
      : 0;

  return {
    total_investment,
    after_repair_value,
    refinance_ltv_percent,
    refinance_amount,
    original_mortgage_balance,
    cash_recovered,
    cash_left_in_deal,
    infinite_return,
    new_monthly_payment,
    cash_flow_after_refi,
    effective_coc_return
  };
}

/**
 * Get market comparison data
 */
function getMarketComparison(
  inputs: PropertyInputs,
  metrics: Metrics
): MarketComparison {
  const { city, property_type } = inputs;

  // Get market averages
  const cityKey = (city in MARKET_BENCHMARKS.cap_rates ? city : 'default') as keyof typeof MARKET_BENCHMARKS.cap_rates;
  const propertyTypeKey: 'single_family' | 'multi_unit' =
    property_type === 'single_family' ? 'single_family' : 'multi_unit';

  const market_avg_cap_rate = MARKET_BENCHMARKS.cap_rates[cityKey][propertyTypeKey];
  const market_avg_rent_to_price = MARKET_BENCHMARKS.rent_to_price_ratios[cityKey as keyof typeof MARKET_BENCHMARKS.rent_to_price_ratios];

  // Calculate deal rent-to-price
  const deal_rent_to_price = (inputs.monthly_rent * 12 / inputs.purchase_price) * 100;

  // Generate comparison text
  const capRateDiff = metrics.cap_rate - market_avg_cap_rate;
  const cap_rate_vs_market = capRateDiff > 0
    ? `${Math.abs(capRateDiff).toFixed(1)}% above market`
    : `${Math.abs(capRateDiff).toFixed(1)}% below market`;

  const rentRatioDiff = deal_rent_to_price - market_avg_rent_to_price;
  const rent_to_price_vs_market = rentRatioDiff > 0
    ? `${Math.abs(rentRatioDiff).toFixed(2)}% above market`
    : `${Math.abs(rentRatioDiff).toFixed(2)}% below market`;

  return {
    market_avg_cap_rate,
    cap_rate_vs_market,
    market_avg_rent_to_price,
    deal_rent_to_price,
    rent_to_price_vs_market
  };
}

/**
 * Generate warnings and flags
 */
function generateWarningsAndFlags(
  inputs: PropertyInputs,
  metrics: Metrics,
  financing: Financing,
  cash_flow: CashFlow,
  market_comparison: MarketComparison
): { warnings: string[]; flags: DealFlags } {
  const warnings: string[] = [];

  const flags: DealFlags = {
    negative_cash_flow: cash_flow.monthly_net < 0,
    low_dscr: metrics.dscr < 1.2,
    below_market_cap_rate: metrics.cap_rate < market_comparison.market_avg_cap_rate,
    high_ltv: inputs.down_payment_percent < 20,
    fails_stress_test: false // We don't have income data, so this is informational
  };

  // Generate warnings based on flags
  if (flags.negative_cash_flow) {
    warnings.push(`⚠️ Negative cash flow: -$${Math.abs(cash_flow.monthly_net).toFixed(2)}/mo`);
  }

  if (flags.low_dscr) {
    warnings.push(`⚠️ DSCR below 1.2 (${metrics.dscr.toFixed(2)}) - may face lender challenges`);
  }

  if (flags.below_market_cap_rate) {
    const diff = market_comparison.market_avg_cap_rate - metrics.cap_rate;
    warnings.push(`⚠️ Cap rate ${diff.toFixed(1)}% below market average`);
  }

  if (metrics.cap_rate < 3) {
    warnings.push(`⚠️ Very low cap rate (${metrics.cap_rate.toFixed(1)}%) - difficult to cash flow`);
  }

  if (metrics.breakeven_occupancy > 80) {
    warnings.push(`⚠️ High breakeven occupancy (${metrics.breakeven_occupancy.toFixed(1)}%) - limited margin for error`);
  }

  if (flags.high_ltv && inputs.purchase_price > 1000000) {
    warnings.push(`⚠️ Properties over $1M require 20% down payment for conventional financing`);
  }

  if (inputs.property_condition === 'heavy_reno' || inputs.property_condition === 'gut_job') {
    warnings.push(`⚠️ Major renovations required - ensure budget includes contingency (15-20%)`);
  }

  if (metrics.expense_ratio > 50) {
    warnings.push(`⚠️ High expense ratio (${metrics.expense_ratio.toFixed(1)}%) - verify operating costs`);
  }

  return { warnings, flags };
}
