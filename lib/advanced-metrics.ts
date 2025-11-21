// REI OPS™ - Advanced Financial Metrics

import type { DealAnalysis, PropertyInputs } from '@/types';

export interface AdvancedMetrics {
  // Internal Rate of Return
  irr: number;

  // Net Present Value
  npv: number;

  // Payback Period (years)
  payback_period: number;

  // Modified Internal Rate of Return
  mirr: number;

  // Equity Multiple
  equity_multiple: number;

  // Average Annual Return
  average_annual_return: number;

  // Cash-on-Cash return over time
  coc_progression: number[];

  // Total profit over hold period
  total_profit: number;

  // Annualized return
  annualized_return: number;
}

export interface ProjectionAssumptions {
  hold_period_years: number;
  appreciation_rate: number; // Annual %
  rent_growth_rate: number; // Annual %
  expense_growth_rate: number; // Annual %
  sale_costs_percent: number; // % of sale price (realtor, legal, etc.)
  discount_rate: number; // For NPV calculation
  reinvestment_rate?: number; // For MIRR (default to discount_rate)
}

/**
 * Calculate Internal Rate of Return (IRR)
 * The discount rate that makes NPV = 0
 */
export function calculateIRR(
  cashFlows: number[],
  initialInvestment: number,
  maxIterations: number = 100
): number {
  // Newton-Raphson method to find IRR
  let irr = 0.1; // Initial guess: 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;
    let derivative = 0;

    for (let year = 0; year < cashFlows.length; year++) {
      const discountFactor = Math.pow(1 + irr, year + 1);
      npv += cashFlows[year] / discountFactor;
      derivative -= (year + 1) * cashFlows[year] / Math.pow(1 + irr, year + 2);
    }

    const newIrr = irr - npv / derivative;

    if (Math.abs(newIrr - irr) < 0.00001) {
      return newIrr * 100; // Convert to percentage
    }

    irr = newIrr;
  }

  return irr * 100; // Convert to percentage
}

/**
 * Calculate Net Present Value (NPV)
 * Present value of all cash flows minus initial investment
 */
export function calculateNPV(
  cashFlows: number[],
  initialInvestment: number,
  discountRate: number
): number {
  let npv = -initialInvestment;

  for (let year = 0; year < cashFlows.length; year++) {
    npv += cashFlows[year] / Math.pow(1 + discountRate / 100, year + 1);
  }

  return npv;
}

/**
 * Calculate Payback Period
 * Number of years to recover initial investment
 */
export function calculatePaybackPeriod(
  cashFlows: number[],
  initialInvestment: number
): number {
  let cumulativeCashFlow = 0;

  for (let year = 0; year < cashFlows.length; year++) {
    cumulativeCashFlow += cashFlows[year];

    if (cumulativeCashFlow >= initialInvestment) {
      // Linear interpolation for fractional year
      const previousCumulative = cumulativeCashFlow - cashFlows[year];
      const fraction = (initialInvestment - previousCumulative) / cashFlows[year];
      return year + fraction;
    }
  }

  return cashFlows.length; // Didn't pay back within hold period
}

/**
 * Calculate Modified Internal Rate of Return (MIRR)
 * More realistic than IRR as it assumes reinvestment at a specified rate
 */
export function calculateMIRR(
  cashFlows: number[],
  initialInvestment: number,
  financeRate: number,
  reinvestmentRate: number
): number {
  const n = cashFlows.length;

  // Future value of positive cash flows (reinvested at reinvestment rate)
  let fvPositive = 0;
  for (let i = 0; i < n; i++) {
    if (cashFlows[i] > 0) {
      fvPositive += cashFlows[i] * Math.pow(1 + reinvestmentRate / 100, n - i - 1);
    }
  }

  // Present value of negative cash flows (financed at finance rate)
  let pvNegative = initialInvestment;
  for (let i = 0; i < n; i++) {
    if (cashFlows[i] < 0) {
      pvNegative += Math.abs(cashFlows[i]) / Math.pow(1 + financeRate / 100, i + 1);
    }
  }

  // MIRR formula
  const mirr = (Math.pow(fvPositive / pvNegative, 1 / n) - 1) * 100;

  return mirr;
}

/**
 * Generate year-by-year cash flow projections
 */
export function generateCashFlowProjections(
  inputs: PropertyInputs,
  analysis: DealAnalysis,
  assumptions: ProjectionAssumptions
): number[] {
  const cashFlows: number[] = [];

  for (let year = 1; year <= assumptions.hold_period_years; year++) {
    // Revenue growth
    const annualRent = analysis.revenue.annual_rent *
      Math.pow(1 + assumptions.rent_growth_rate / 100, year - 1);

    // Expense growth (excluding mortgage which is fixed)
    const baseExpenses = analysis.expenses.total_annual_expenses - analysis.expenses.annual_mortgage;
    const annualExpenses = baseExpenses * Math.pow(1 + assumptions.expense_growth_rate / 100, year - 1);

    // Annual cash flow (rent - expenses - mortgage)
    const annualCashFlow = annualRent - annualExpenses - analysis.expenses.annual_mortgage;

    // For the final year, add sale proceeds
    if (year === assumptions.hold_period_years) {
      const futureValue = inputs.purchase_price *
        Math.pow(1 + assumptions.appreciation_rate / 100, assumptions.hold_period_years);

      // Calculate remaining mortgage balance
      const monthlyRate = inputs.interest_rate / 100 / 12;
      const totalPayments = inputs.amortization_years * 12;
      const paymentsMade = assumptions.hold_period_years * 12;
      const paymentsRemaining = totalPayments - paymentsMade;

      let remainingBalance = 0;
      if (paymentsRemaining > 0) {
        remainingBalance = analysis.financing.total_mortgage_with_insurance *
          (Math.pow(1 + monthlyRate, paymentsRemaining) - 1) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1);
      }

      // Sale proceeds = Future Value - Remaining Mortgage - Sale Costs
      const saleCosts = futureValue * (assumptions.sale_costs_percent / 100);
      const saleProceeds = futureValue - remainingBalance - saleCosts;

      cashFlows.push(annualCashFlow + saleProceeds);
    } else {
      cashFlows.push(annualCashFlow);
    }
  }

  return cashFlows;
}

/**
 * Calculate all advanced metrics for a deal
 */
export function calculateAdvancedMetrics(
  inputs: PropertyInputs,
  analysis: DealAnalysis,
  assumptions: ProjectionAssumptions
): AdvancedMetrics {
  const initialInvestment = analysis.acquisition.total_cash_needed;
  const cashFlows = generateCashFlowProjections(inputs, analysis, assumptions);

  // Calculate IRR
  const irr = calculateIRR(cashFlows, initialInvestment);

  // Calculate NPV
  const npv = calculateNPV(cashFlows, initialInvestment, assumptions.discount_rate);

  // Calculate Payback Period
  const payback_period = calculatePaybackPeriod(cashFlows, initialInvestment);

  // Calculate MIRR
  const reinvestmentRate = assumptions.reinvestment_rate || assumptions.discount_rate;
  const mirr = calculateMIRR(cashFlows, initialInvestment, inputs.interest_rate, reinvestmentRate);

  // Calculate Equity Multiple
  const totalCashReturned = cashFlows.reduce((sum, cf) => sum + cf, 0);
  const equity_multiple = totalCashReturned / initialInvestment;

  // Calculate Average Annual Return
  const average_annual_return = (totalCashReturned / initialInvestment / assumptions.hold_period_years) * 100;

  // Calculate Cash-on-Cash progression
  const coc_progression: number[] = [];
  for (let year = 0; year < assumptions.hold_period_years; year++) {
    // Exclude sale proceeds from final year CoC
    const yearCashFlow = year === assumptions.hold_period_years - 1
      ? cashFlows[year] - (cashFlows[year] - analysis.cash_flow.annual_net)
      : cashFlows[year];
    coc_progression.push((yearCashFlow / initialInvestment) * 100);
  }

  // Calculate Total Profit
  const total_profit = totalCashReturned - initialInvestment;

  // Calculate Annualized Return
  const annualized_return = (Math.pow(equity_multiple, 1 / assumptions.hold_period_years) - 1) * 100;

  return {
    irr,
    npv,
    payback_period,
    mirr,
    equity_multiple,
    average_annual_return,
    coc_progression,
    total_profit,
    annualized_return,
  };
}

/**
 * Interpret IRR value
 */
export function interpretIRR(irr: number): string {
  if (irr < 0) return 'Negative - Loss expected';
  if (irr < 5) return 'Poor - Below inflation';
  if (irr < 10) return 'Below Average - Consider alternatives';
  if (irr < 15) return 'Good - Acceptable return';
  if (irr < 20) return 'Excellent - Strong return';
  return 'Outstanding - Exceptional return';
}

/**
 * Interpret NPV value
 */
export function interpretNPV(npv: number): string {
  if (npv < 0) return 'Negative NPV - Reject deal';
  if (npv < 10000) return 'Marginal NPV - Borderline';
  if (npv < 50000) return 'Positive NPV - Acceptable';
  if (npv < 100000) return 'Good NPV - Recommended';
  return 'Excellent NPV - Highly recommended';
}

/**
 * Interpret Payback Period
 */
export function interpretPaybackPeriod(years: number, holdPeriod: number): string {
  const percentage = (years / holdPeriod) * 100;

  if (years > holdPeriod) return 'Does not pay back within hold period';
  if (percentage < 30) return 'Excellent - Very quick payback';
  if (percentage < 50) return 'Good - Pays back in first half';
  if (percentage < 75) return 'Acceptable - Moderate payback';
  return 'Slow - Pays back late in hold period';
}
