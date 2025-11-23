// REI OPS™ - Canadian Tax Impact Calculator

import type { DealAnalysis } from '@/types';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface ProvincialTaxRates {
  province: string;
  brackets: TaxBracket[];
}

// 2024 Federal Tax Brackets (Canada)
export const FEDERAL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 55867, rate: 15.0 },
  { min: 55867, max: 111733, rate: 20.5 },
  { min: 111733, max: 173205, rate: 26.0 },
  { min: 173205, max: 246752, rate: 29.0 },
  { min: 246752, max: Infinity, rate: 33.0 },
];

// Provincial Tax Brackets (2024 estimates - simplified)
export const PROVINCIAL_TAX_RATES: Record<string, TaxBracket[]> = {
  ON: [
    { min: 0, max: 51446, rate: 5.05 },
    { min: 51446, max: 102894, rate: 9.15 },
    { min: 102894, max: 150000, rate: 11.16 },
    { min: 150000, max: 220000, rate: 12.16 },
    { min: 220000, max: Infinity, rate: 13.16 },
  ],
  BC: [
    { min: 0, max: 47937, rate: 5.06 },
    { min: 47937, max: 95875, rate: 7.70 },
    { min: 95875, max: 110076, rate: 10.50 },
    { min: 110076, max: 133664, rate: 12.29 },
    { min: 133664, max: 181232, rate: 14.70 },
    { min: 181232, max: Infinity, rate: 16.80 },
  ],
  AB: [
    { min: 0, max: 148269, rate: 10.0 },
    { min: 148269, max: 177922, rate: 12.0 },
    { min: 177922, max: 237230, rate: 13.0 },
    { min: 237230, max: 355845, rate: 14.0 },
    { min: 355845, max: Infinity, rate: 15.0 },
  ],
  QC: [
    { min: 0, max: 51780, rate: 14.0 },
    { min: 51780, max: 103545, rate: 19.0 },
    { min: 103545, max: 126000, rate: 24.0 },
    { min: 126000, max: Infinity, rate: 25.75 },
  ],
  NS: [
    { min: 0, max: 29590, rate: 8.79 },
    { min: 29590, max: 59180, rate: 14.95 },
    { min: 59180, max: 93000, rate: 16.67 },
    { min: 93000, max: 150000, rate: 17.50 },
    { min: 150000, max: Infinity, rate: 21.00 },
  ],
};

export interface TaxImpact {
  // Rental Income Tax
  gross_rental_income: number;
  deductible_expenses: number;
  mortgage_interest_deduction: number;
  depreciation_deduction: number;
  net_rental_income: number;
  rental_income_tax: number;
  after_tax_cash_flow: number;

  // Capital Gains Tax (on sale)
  purchase_price: number;
  estimated_sale_price: number;
  capital_gain: number;
  taxable_capital_gain: number; // 50% of capital gain
  capital_gains_tax: number;
  net_proceeds_after_tax: number;

  // Effective Tax Rates
  effective_tax_rate_rental: number;
  effective_tax_rate_capital_gain: number;
  marginal_tax_rate: number;

  // Tax Savings
  total_tax_deductions: number;
  tax_savings_from_deductions: number;
}

/**
 * Calculate marginal tax rate based on income
 */
export function calculateMarginalTaxRate(
  totalIncome: number,
  province: string
): number {
  // Federal rate
  let federalRate = 0;
  for (const bracket of FEDERAL_TAX_BRACKETS) {
    if (totalIncome > bracket.min) {
      federalRate = bracket.rate;
    }
  }

  // Provincial rate
  const provincialBrackets = PROVINCIAL_TAX_RATES[province] || PROVINCIAL_TAX_RATES.ON;
  let provincialRate = 0;
  for (const bracket of provincialBrackets) {
    if (totalIncome > bracket.min) {
      provincialRate = bracket.rate;
    }
  }

  return federalRate + provincialRate;
}

/**
 * Calculate total tax on income using progressive brackets
 */
export function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[]
): number {
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInThisBracket * (bracket.rate / 100);
      previousMax = bracket.max;
    } else {
      break;
    }
  }

  return tax;
}

/**
 * Calculate mortgage interest for the year
 */
export function calculateAnnualMortgageInterest(
  mortgageAmount: number,
  interestRate: number,
  year: number = 1
): number {
  // Simplified calculation - assumes interest-only in year 1
  // For more accuracy, would need full amortization schedule
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = mortgageAmount * monthlyRate;

  // Approximate annual interest (higher in early years)
  const annualInterest = monthlyPayment * 12 * 0.9; // ~90% is interest in early years

  return annualInterest;
}

/**
 * Calculate depreciation (CCA - Capital Cost Allowance)
 * Class 1: Buildings - 4% declining balance
 * Class 8: Furniture & fixtures - 20% declining balance
 */
export function calculateDepreciation(
  buildingValue: number,
  year: number = 1
): number {
  // CCA Class 1 (Buildings): 4% declining balance
  // Half-year rule applies in year 1
  const ccaRate = 0.04;
  const halfYearRule = year === 1 ? 0.5 : 1.0;

  let undepreciatedBalance = buildingValue;
  let totalDepreciation = 0;

  for (let i = 1; i <= year; i++) {
    const yearDepreciation = undepreciatedBalance * ccaRate * (i === 1 ? halfYearRule : 1);
    totalDepreciation += yearDepreciation;
    undepreciatedBalance -= yearDepreciation;
  }

  return year === 1 ? buildingValue * ccaRate * halfYearRule : buildingValue * ccaRate;
}

/**
 * Calculate complete tax impact for rental property
 */
export function calculateTaxImpact(
  analysis: DealAnalysis,
  employmentIncome: number,
  yearsHeld: number = 5,
  appreciationRate: number = 3.0
): TaxImpact {
  const province = analysis.property.province;

  // Rental Income Tax Calculation
  const gross_rental_income = analysis.revenue.annual_rent;

  // Deductible expenses (all operating expenses)
  const deductible_expenses =
    analysis.expenses.annual_property_tax +
    analysis.expenses.annual_insurance +
    analysis.expenses.annual_utilities +
    analysis.expenses.annual_maintenance +
    analysis.expenses.annual_property_management +
    analysis.expenses.vacancy_cost;

  // Mortgage interest deduction (approximate for year 1)
  const mortgage_interest_deduction = calculateAnnualMortgageInterest(
    analysis.financing.total_mortgage_with_insurance,
    analysis.financing.interest_rate
  );

  // Depreciation (CCA) - assume 80% is building value
  const buildingValue = analysis.acquisition.purchase_price * 0.8;
  const depreciation_deduction = calculateDepreciation(buildingValue);

  // Net rental income for tax purposes
  const net_rental_income =
    gross_rental_income -
    deductible_expenses -
    mortgage_interest_deduction -
    depreciation_deduction;

  // Total income including rental income
  const total_income = employmentIncome + (net_rental_income > 0 ? net_rental_income : 0);

  // Calculate marginal tax rate
  const marginal_tax_rate = calculateMarginalTaxRate(total_income, province);

  // Tax on rental income
  const rental_income_tax = net_rental_income > 0 ? net_rental_income * (marginal_tax_rate / 100) : 0;

  // After-tax cash flow (actual cash flow - rental income tax)
  const after_tax_cash_flow = analysis.cash_flow.annual_net - rental_income_tax;

  // Capital Gains Tax Calculation
  const purchase_price = analysis.acquisition.purchase_price;
  const estimated_sale_price = purchase_price * Math.pow(1 + appreciationRate / 100, yearsHeld);
  const capital_gain = estimated_sale_price - purchase_price;

  // Only 50% of capital gains are taxable in Canada
  const taxable_capital_gain = capital_gain * 0.5;

  // Tax on capital gains (at marginal rate)
  const capital_gains_tax = taxable_capital_gain * (marginal_tax_rate / 100);

  // Net proceeds after capital gains tax
  const net_proceeds_after_tax = estimated_sale_price - capital_gains_tax;

  // Effective tax rates
  const effective_tax_rate_rental = gross_rental_income > 0
    ? (rental_income_tax / gross_rental_income) * 100
    : 0;

  const effective_tax_rate_capital_gain = capital_gain > 0
    ? (capital_gains_tax / capital_gain) * 100
    : 0;

  // Total tax deductions
  const total_tax_deductions =
    deductible_expenses +
    mortgage_interest_deduction +
    depreciation_deduction;

  // Tax savings from deductions
  const tax_savings_from_deductions = total_tax_deductions * (marginal_tax_rate / 100);

  return {
    gross_rental_income,
    deductible_expenses,
    mortgage_interest_deduction,
    depreciation_deduction,
    net_rental_income,
    rental_income_tax,
    after_tax_cash_flow,
    purchase_price,
    estimated_sale_price,
    capital_gain,
    taxable_capital_gain,
    capital_gains_tax,
    net_proceeds_after_tax,
    effective_tax_rate_rental,
    effective_tax_rate_capital_gain,
    marginal_tax_rate,
    total_tax_deductions,
    tax_savings_from_deductions,
  };
}

/**
 * Calculate multi-year tax projection
 */
export interface YearlyTaxProjection {
  year: number;
  rental_income: number;
  deductions: number;
  net_income: number;
  tax_owed: number;
  after_tax_cf: number;
  cumulative_tax: number;
}

export function calculateMultiYearTaxProjection(
  analysis: DealAnalysis,
  employmentIncome: number,
  years: number = 5
): YearlyTaxProjection[] {
  const projections: YearlyTaxProjection[] = [];
  let cumulative_tax = 0;

  for (let year = 1; year <= years; year++) {
    const taxImpact = calculateTaxImpact(analysis, employmentIncome, year);

    cumulative_tax += taxImpact.rental_income_tax;

    projections.push({
      year,
      rental_income: taxImpact.gross_rental_income,
      deductions: taxImpact.total_tax_deductions,
      net_income: taxImpact.net_rental_income,
      tax_owed: taxImpact.rental_income_tax,
      after_tax_cf: taxImpact.after_tax_cash_flow,
      cumulative_tax,
    });
  }

  return projections;
}
