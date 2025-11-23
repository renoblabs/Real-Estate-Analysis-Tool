// REI OPS™ - Break-Even Analysis

import type { DealAnalysis } from '@/types';

export interface BreakEvenAnalysis {
  // Cash Flow Break-Even
  monthly_shortfall: number;
  break_even_rent: number;
  rent_increase_needed_percent: number;
  rent_increase_needed_dollars: number;

  // Purchase Price Break-Even
  max_purchase_price_for_positive_cf: number;
  purchase_price_reduction_needed: number;
  purchase_price_reduction_percent: number;

  // Occupancy Break-Even
  break_even_occupancy: number;
  current_vacancy_cost: number;
  max_affordable_vacancy_percent: number;

  // Expense Break-Even
  max_affordable_expenses: number;
  expense_reduction_needed: number;
  expense_reduction_percent: number;

  // Interest Rate Sensitivity
  max_affordable_interest_rate: number;
  interest_rate_cushion: number;

  // Timeline Analysis
  years_to_positive_cf: number; // Assuming rent growth
  cumulative_loss_until_positive: number;

  // Summary
  is_currently_cash_flow_positive: boolean;
  primary_issue: string;
  quickest_path_to_positive: string;
}

/**
 * Calculate rent-based break-even
 */
function calculateRentBreakEven(
  current_monthly_rent: number,
  monthly_shortfall: number
) {
  const break_even_rent = current_monthly_rent + monthly_shortfall;
  const rent_increase_needed_dollars = break_even_rent - current_monthly_rent;
  const rent_increase_needed_percent = (rent_increase_needed_dollars / current_monthly_rent) * 100;

  return {
    break_even_rent,
    rent_increase_needed_dollars,
    rent_increase_needed_percent,
  };
}

/**
 * Calculate purchase price break-even
 */
function calculatePurchasePriceBreakEven(
  monthly_shortfall: number,
  analysis: DealAnalysis
) {
  // Simplified: reduce price to eliminate cash flow gap
  // Assumes 20% down, same financing terms
  const down_payment_ratio = analysis.acquisition.down_payment_percent / 100;
  const monthly_rate = analysis.financing.interest_rate / 100 / 12;
  const num_payments = analysis.financing.amortization_years * 12;
  const monthly_factor = (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) /
                        (Math.pow(1 + monthly_rate, num_payments) - 1);

  const price_reduction_for_break_even = monthly_shortfall /
    ((1 - down_payment_ratio) * monthly_factor);

  const max_purchase_price_for_positive_cf = analysis.acquisition.purchase_price - price_reduction_for_break_even;
  const purchase_price_reduction_needed = price_reduction_for_break_even;
  const purchase_price_reduction_percent = (price_reduction_for_break_even / analysis.acquisition.purchase_price) * 100;

  return {
    max_purchase_price_for_positive_cf,
    purchase_price_reduction_needed,
    purchase_price_reduction_percent,
  };
}

/**
 * Calculate occupancy break-even
 */
function calculateOccupancyBreakEven(
  monthly_shortfall: number,
  is_currently_cash_flow_positive: boolean,
  analysis: DealAnalysis
) {
  const current_vacancy_cost = analysis.expenses.vacancy_cost;
  const monthly_vacancy_cost = current_vacancy_cost / 12;

  // What's the max vacancy we can afford?
  let max_affordable_vacancy_percent = 0;
  if (!is_currently_cash_flow_positive) {
    // Currently negative, need to reduce vacancy
    max_affordable_vacancy_percent = Math.max(0,
      ((analysis.revenue.monthly_rent * (analysis.inputs?.vacancy_rate || 5) / 100) - monthly_shortfall) /
      analysis.revenue.monthly_rent * 100
    );
  } else {
    // Currently positive, calculate max we could afford
    max_affordable_vacancy_percent = Math.min(100,
      ((analysis.revenue.monthly_rent * (analysis.inputs?.vacancy_rate || 5) / 100) + analysis.cash_flow.monthly_net) /
      analysis.revenue.monthly_rent * 100
    );
  }

  const break_even_occupancy = 100 - max_affordable_vacancy_percent;

  return {
    break_even_occupancy,
    current_vacancy_cost,
    max_affordable_vacancy_percent,
  };
}

/**
 * Calculate expense break-even
 */
function calculateExpenseBreakEven(
  monthly_shortfall: number,
  analysis: DealAnalysis
) {
  const current_monthly_expenses = analysis.expenses.total_annual_expenses / 12;
  const max_affordable_expenses = current_monthly_expenses - monthly_shortfall;
  const expense_reduction_needed = current_monthly_expenses - max_affordable_expenses;
  const expense_reduction_percent = (expense_reduction_needed / current_monthly_expenses) * 100;

  return {
    max_affordable_expenses,
    expense_reduction_needed,
    expense_reduction_percent,
  };
}

/**
 * Calculate interest rate sensitivity
 */
function calculateInterestRateSensitivity(
  is_currently_cash_flow_positive: boolean,
  monthly_shortfall: number,
  analysis: DealAnalysis
) {
  // Calculate max interest rate that still gives positive cash flow
  let max_affordable_interest_rate = analysis.financing.interest_rate;

  if (!is_currently_cash_flow_positive) {
    // Would need lower rate
    const rate_reduction_needed = (monthly_shortfall / analysis.financing.total_mortgage_with_insurance) * 12 * 100;
    max_affordable_interest_rate = Math.max(0, analysis.financing.interest_rate - rate_reduction_needed);
  } else {
    // Calculate how much higher rate we could afford
    const rate_cushion = (analysis.cash_flow.monthly_net / analysis.financing.total_mortgage_with_insurance) * 12 * 100;
    max_affordable_interest_rate = analysis.financing.interest_rate + rate_cushion;
  }

  const interest_rate_cushion = max_affordable_interest_rate - analysis.financing.interest_rate;

  return {
    max_affordable_interest_rate,
    interest_rate_cushion,
  };
}

/**
 * Calculate timeline to positive cash flow (assuming 2.5% annual rent growth)
 */
function calculateTimelineToPositive(
  is_currently_cash_flow_positive: boolean,
  current_monthly_rent: number,
  analysis: DealAnalysis
) {
  const rent_growth_rate = 0.025;
  let years_to_positive_cf = 0;
  let cumulative_loss_until_positive = 0;

  if (!is_currently_cash_flow_positive) {
    let projected_rent = current_monthly_rent;
    let annual_loss = analysis.cash_flow.annual_net;

    for (let year = 1; year <= 30; year++) {
      projected_rent *= (1 + rent_growth_rate);
      const projected_monthly_cf = analysis.cash_flow.monthly_net + (projected_rent - current_monthly_rent);

      if (projected_monthly_cf >= 0) {
        years_to_positive_cf = year;
        break;
      }

      cumulative_loss_until_positive += annual_loss;
      annual_loss *= 1.025; // Expenses also grow
    }

    if (years_to_positive_cf === 0) {
      years_to_positive_cf = 999; // Never reaches positive
    }
  }

  return {
    years_to_positive_cf,
    cumulative_loss_until_positive,
  };
}

/**
 * Determine the primary issue causing negative cash flow
 */
function determinePrimaryIssue(
  is_currently_cash_flow_positive: boolean,
  rent_increase_needed_percent: number,
  purchase_price_reduction_percent: number,
  expense_reduction_percent: number,
  interest_rate_cushion: number
): string {
  if (is_currently_cash_flow_positive) {
    return 'None - cash flow positive';
  }

  const issues = [
    { name: 'Low Rent', severity: rent_increase_needed_percent },
    { name: 'High Purchase Price', severity: purchase_price_reduction_percent },
    { name: 'High Expenses', severity: expense_reduction_percent },
    { name: 'High Interest Rate', severity: Math.abs(interest_rate_cushion) * 10 },
  ];

  issues.sort((a, b) => b.severity - a.severity);
  return issues[0].name;
}

/**
 * Determine the quickest path to positive cash flow
 */
function determineQuickestPath(
  is_currently_cash_flow_positive: boolean,
  rent_increase_needed_dollars: number,
  rent_increase_needed_percent: number,
  purchase_price_reduction_needed: number,
  purchase_price_reduction_percent: number,
  expense_reduction_needed: number,
  expense_reduction_percent: number,
  years_to_positive_cf: number
): string {
  if (is_currently_cash_flow_positive) {
    return 'Already positive';
  }

  const paths = [
    {
      path: `Increase rent by $${rent_increase_needed_dollars.toFixed(0)}`,
      feasibility: rent_increase_needed_percent < 10 ? 1 : rent_increase_needed_percent < 20 ? 2 : 3
    },
    {
      path: `Reduce purchase price by $${purchase_price_reduction_needed.toFixed(0)}`,
      feasibility: purchase_price_reduction_percent < 5 ? 1 : purchase_price_reduction_percent < 10 ? 2 : 3
    },
    {
      path: `Reduce expenses by $${expense_reduction_needed.toFixed(0)}/month`,
      feasibility: expense_reduction_percent < 10 ? 1 : expense_reduction_percent < 20 ? 2 : 3
    },
    {
      path: `Wait ${years_to_positive_cf} years for rent growth`,
      feasibility: years_to_positive_cf < 3 ? 2 : years_to_positive_cf < 5 ? 3 : 4
    },
  ];

  paths.sort((a, b) => a.feasibility - b.feasibility);
  return paths[0].path;
}

/**
 * Calculate comprehensive break-even analysis (Main orchestrator)
 */
export function calculateBreakEven(analysis: DealAnalysis): BreakEvenAnalysis {
  const monthly_shortfall = analysis.cash_flow.monthly_net < 0
    ? Math.abs(analysis.cash_flow.monthly_net)
    : 0;

  const is_currently_cash_flow_positive = analysis.cash_flow.monthly_net >= 0;
  const current_monthly_rent = analysis.revenue.monthly_rent;

  // Calculate all break-even scenarios
  const rentBreakEven = calculateRentBreakEven(current_monthly_rent, monthly_shortfall);
  const priceBreakEven = calculatePurchasePriceBreakEven(monthly_shortfall, analysis);
  const occupancyBreakEven = calculateOccupancyBreakEven(monthly_shortfall, is_currently_cash_flow_positive, analysis);
  const expenseBreakEven = calculateExpenseBreakEven(monthly_shortfall, analysis);
  const interestRate = calculateInterestRateSensitivity(is_currently_cash_flow_positive, monthly_shortfall, analysis);
  const timeline = calculateTimelineToPositive(is_currently_cash_flow_positive, current_monthly_rent, analysis);

  // Determine primary issue and quickest path
  const primary_issue = determinePrimaryIssue(
    is_currently_cash_flow_positive,
    rentBreakEven.rent_increase_needed_percent,
    priceBreakEven.purchase_price_reduction_percent,
    expenseBreakEven.expense_reduction_percent,
    interestRate.interest_rate_cushion
  );

  const quickest_path_to_positive = determineQuickestPath(
    is_currently_cash_flow_positive,
    rentBreakEven.rent_increase_needed_dollars,
    rentBreakEven.rent_increase_needed_percent,
    priceBreakEven.purchase_price_reduction_needed,
    priceBreakEven.purchase_price_reduction_percent,
    expenseBreakEven.expense_reduction_needed * 12, // Convert to annual
    expenseBreakEven.expense_reduction_percent,
    timeline.years_to_positive_cf
  );

  return {
    monthly_shortfall,
    ...rentBreakEven,
    ...priceBreakEven,
    ...occupancyBreakEven,
    max_affordable_expenses: expenseBreakEven.max_affordable_expenses * 12, // Annual
    expense_reduction_needed: expenseBreakEven.expense_reduction_needed * 12, // Annual
    expense_reduction_percent: expenseBreakEven.expense_reduction_percent,
    ...interestRate,
    ...timeline,
    is_currently_cash_flow_positive,
    primary_issue,
    quickest_path_to_positive,
  };
}

/**
 * Calculate expense breakdown and optimization opportunities
 */
export interface ExpenseOptimization {
  category: string;
  current_annual: number;
  current_percent_of_revenue: number;
  market_benchmark_percent: number;
  potential_savings: number;
  optimization_difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendations: string[];
}

export function analyzeExpenseOptimization(analysis: DealAnalysis): ExpenseOptimization[] {
  const total_revenue = analysis.revenue.annual_rent;

  const expenses: ExpenseOptimization[] = [
    {
      category: 'Property Tax',
      current_annual: analysis.expenses.annual_property_tax,
      current_percent_of_revenue: (analysis.expenses.annual_property_tax / total_revenue) * 100,
      market_benchmark_percent: 10, // Typical 8-12%
      potential_savings: 0,
      optimization_difficulty: 'Hard',
      recommendations: [
        'Appeal property tax assessment',
        'Check for available tax credits or exemptions',
        'Compare to similar properties in area',
      ],
    },
    {
      category: 'Insurance',
      current_annual: analysis.expenses.annual_insurance,
      current_percent_of_revenue: (analysis.expenses.annual_insurance / total_revenue) * 100,
      market_benchmark_percent: 3, // Typical 2-4%
      potential_savings: 0,
      optimization_difficulty: 'Easy',
      recommendations: [
        'Shop for competitive quotes annually',
        'Increase deductible to lower premium',
        'Bundle with other policies for discounts',
        'Install security systems for discounts',
      ],
    },
    {
      category: 'Maintenance',
      current_annual: analysis.expenses.annual_maintenance,
      current_percent_of_revenue: (analysis.expenses.annual_maintenance / total_revenue) * 100,
      market_benchmark_percent: 10, // 1% of property value or 10% of revenue
      potential_savings: 0,
      optimization_difficulty: 'Medium',
      recommendations: [
        'Preventive maintenance reduces emergency costs',
        'Build relationships with reliable contractors',
        'Consider warranty plans for major systems',
        'DIY minor repairs when possible',
      ],
    },
    {
      category: 'Property Management',
      current_annual: analysis.expenses.annual_property_management,
      current_percent_of_revenue: (analysis.expenses.annual_property_management / total_revenue) * 100,
      market_benchmark_percent: 8, // Typical 8-10%
      potential_savings: 0,
      optimization_difficulty: 'Medium',
      recommendations: [
        'Negotiate fees with current manager',
        'Self-manage if you have time',
        'Compare multiple PM companies',
        'Ensure you\'re getting value for cost',
      ],
    },
    {
      category: 'Vacancy',
      current_annual: analysis.expenses.vacancy_cost,
      current_percent_of_revenue: ((analysis.inputs?.vacancy_rate || 5)) || 5,
      market_benchmark_percent: 5, // Typical 5-8%
      potential_savings: 0,
      optimization_difficulty: 'Easy',
      recommendations: [
        'Screen tenants thoroughly',
        'Maintain property to retain tenants',
        'Competitive pricing to minimize vacancy',
        'Start marketing before current tenant leaves',
      ],
    },
  ];

  // Calculate potential savings
  expenses.forEach(expense => {
    if (expense.current_percent_of_revenue > expense.market_benchmark_percent) {
      expense.potential_savings =
        total_revenue * ((expense.current_percent_of_revenue - expense.market_benchmark_percent) / 100);
    }
  });

  return expenses;
}
