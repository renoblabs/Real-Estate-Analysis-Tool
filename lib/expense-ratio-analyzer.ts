// REI OPS™ - Expense Ratio Analyzer

import type { DealAnalysis } from '@/types';

export interface ExpenseBreakdown {
  category: string;
  annual_amount: number;
  percent_of_total: number;
  percent_of_revenue: number;
  is_optimizable: boolean;
  market_benchmark_percent?: number;
  potential_savings?: number;
}

export interface ExpenseRatioAnalysis {
  // Current State
  total_annual_expenses: number;
  total_annual_revenue: number;
  expense_ratio: number;

  // Benchmarks
  market_benchmark_ratio: number;
  target_ratio: number;
  variance_from_benchmark: number;

  // Breakdown
  expense_breakdown: ExpenseBreakdown[];

  // Optimization
  total_potential_savings: number;
  optimized_expense_ratio: number;
  improvement_potential_percent: number;

  // Rankings
  highest_expense_categories: string[];
  most_optimizable_categories: string[];

  // Assessment
  efficiency_rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendations: string[];
}

/**
 * Market benchmarks for expense ratios by property type
 */
export const EXPENSE_RATIO_BENCHMARKS: Record<string, number> = {
  single_family: 35, // 35% of gross revenue
  multi_family_2_4: 40,
  multi_family_5_plus: 45,
  condo: 50, // Higher due to condo fees
  townhouse: 38,
  duplex: 38,
  triplex: 40,
  fourplex: 42,
};

/**
 * Benchmark percentages for each expense category (as % of revenue)
 */
export const CATEGORY_BENCHMARKS: Record<string, number> = {
  property_tax: 12, // 12% of revenue is typical
  insurance: 5,
  property_management: 8, // 8-10% typical
  maintenance: 8, // 1% of property value as % of revenue varies
  utilities: 5,
  hoa_condo: 15, // For condos
  vacancy: 5,
};

/**
 * Analyze expense ratio and identify optimization opportunities
 */
export function analyzeExpenseRatio(analysis: DealAnalysis): ExpenseRatioAnalysis {
  const revenue = analysis.revenue.annual_rent;
  const expenses = analysis.expenses.total_annual_expenses - analysis.expenses.annual_mortgage;

  // Calculate expense breakdown
  const breakdown: ExpenseBreakdown[] = [
    {
      category: 'Property Tax',
      annual_amount: analysis.expenses.annual_property_tax,
      percent_of_total: (analysis.expenses.annual_property_tax / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_property_tax / revenue) * 100,
      is_optimizable: false, // Fixed by municipality
      market_benchmark_percent: CATEGORY_BENCHMARKS.property_tax,
    },
    {
      category: 'Insurance',
      annual_amount: analysis.expenses.annual_insurance,
      percent_of_total: (analysis.expenses.annual_insurance / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_insurance / revenue) * 100,
      is_optimizable: true,
      market_benchmark_percent: CATEGORY_BENCHMARKS.insurance,
      potential_savings: Math.max(0, analysis.expenses.annual_insurance * 0.15), // 15% savings possible
    },
    {
      category: 'Property Management',
      annual_amount: analysis.expenses.annual_property_management,
      percent_of_total: (analysis.expenses.annual_property_management / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_property_management / revenue) * 100,
      is_optimizable: true,
      market_benchmark_percent: CATEGORY_BENCHMARKS.property_management,
      potential_savings: analysis.expenses.annual_property_management, // Can self-manage
    },
    {
      category: 'Maintenance',
      annual_amount: analysis.expenses.annual_maintenance,
      percent_of_total: (analysis.expenses.annual_maintenance / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_maintenance / revenue) * 100,
      is_optimizable: true,
      market_benchmark_percent: CATEGORY_BENCHMARKS.maintenance,
      potential_savings: Math.max(0, analysis.expenses.annual_maintenance * 0.25), // 25% reduction possible
    },
    {
      category: 'Utilities',
      annual_amount: analysis.expenses.annual_utilities,
      percent_of_total: (analysis.expenses.annual_utilities / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_utilities / revenue) * 100,
      is_optimizable: true,
      market_benchmark_percent: CATEGORY_BENCHMARKS.utilities,
      potential_savings: Math.max(0, analysis.expenses.annual_utilities * 0.20), // 20% reduction possible
    },
    {
      category: 'Vacancy Cost',
      annual_amount: analysis.expenses.vacancy_cost,
      percent_of_total: (analysis.expenses.vacancy_cost / expenses) * 100,
      percent_of_revenue: (analysis.expenses.vacancy_cost / revenue) * 100,
      is_optimizable: true,
      market_benchmark_percent: CATEGORY_BENCHMARKS.vacancy,
      potential_savings: Math.max(0, analysis.expenses.vacancy_cost * 0.30), // Better tenant screening
    },
  ];

  // Add HOA/Condo fees if applicable
  if (analysis.expenses.annual_hoa_condo > 0) {
    breakdown.push({
      category: 'HOA/Condo Fees',
      annual_amount: analysis.expenses.annual_hoa_condo,
      percent_of_total: (analysis.expenses.annual_hoa_condo / expenses) * 100,
      percent_of_revenue: (analysis.expenses.annual_hoa_condo / revenue) * 100,
      is_optimizable: false, // Fixed fees
      market_benchmark_percent: CATEGORY_BENCHMARKS.hoa_condo,
    });
  }

  // Calculate total potential savings
  const total_potential_savings = breakdown
    .filter(item => item.is_optimizable && item.potential_savings)
    .reduce((sum, item) => sum + (item.potential_savings || 0), 0);

  // Current expense ratio
  const expense_ratio = (expenses / revenue) * 100;

  // Benchmark based on property type
  const market_benchmark_ratio = EXPENSE_RATIO_BENCHMARKS[analysis.property.property_type] || 40;
  const target_ratio = market_benchmark_ratio * 0.9; // 10% better than market

  const variance_from_benchmark = expense_ratio - market_benchmark_ratio;

  // Optimized ratio
  const optimized_expenses = expenses - total_potential_savings;
  const optimized_expense_ratio = (optimized_expenses / revenue) * 100;
  const improvement_potential_percent = ((expense_ratio - optimized_expense_ratio) / expense_ratio) * 100;

  // Rankings
  const sorted_by_amount = [...breakdown].sort((a, b) => b.annual_amount - a.annual_amount);
  const highest_expense_categories = sorted_by_amount.slice(0, 3).map(item => item.category);

  const optimizable = breakdown.filter(item => item.is_optimizable && (item.potential_savings || 0) > 0);
  const sorted_by_savings = optimizable.sort((a, b) => (b.potential_savings || 0) - (a.potential_savings || 0));
  const most_optimizable_categories = sorted_by_savings.slice(0, 3).map(item => item.category);

  // Efficiency rating
  let efficiency_rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (expense_ratio <= target_ratio) {
    efficiency_rating = 'Excellent';
  } else if (expense_ratio <= market_benchmark_ratio) {
    efficiency_rating = 'Good';
  } else if (expense_ratio <= market_benchmark_ratio * 1.15) {
    efficiency_rating = 'Fair';
  } else {
    efficiency_rating = 'Poor';
  }

  // Recommendations
  const recommendations: string[] = [];

  // Insurance optimization
  const insurance = breakdown.find(item => item.category === 'Insurance');
  if (insurance && insurance.percent_of_revenue > (CATEGORY_BENCHMARKS.insurance * 1.2)) {
    recommendations.push(
      `Insurance costs are ${insurance.percent_of_revenue.toFixed(1)}% of revenue (benchmark: ${CATEGORY_BENCHMARKS.insurance}%). Shop for quotes from at least 3 providers to save ~${((insurance.potential_savings || 0) / 12).toFixed(0)}/month.`
    );
  }

  // Property management optimization
  const pm = breakdown.find(item => item.category === 'Property Management');
  if (pm && pm.annual_amount > 0) {
    if (pm.percent_of_revenue > 10) {
      recommendations.push(
        `Property management at ${pm.percent_of_revenue.toFixed(1)}% is high. Consider self-managing for the first year to save ${((pm.potential_savings || 0) / 12).toFixed(0)}/month and learn the property.`
      );
    } else {
      recommendations.push(
        `Property management at ${pm.percent_of_revenue.toFixed(1)}% is reasonable, but self-managing could save ${((pm.potential_savings || 0) / 12).toFixed(0)}/month if you have the time.`
      );
    }
  }

  // Maintenance optimization
  const maintenance = breakdown.find(item => item.category === 'Maintenance');
  if (maintenance && maintenance.percent_of_revenue > (CATEGORY_BENCHMARKS.maintenance * 1.3)) {
    recommendations.push(
      `Maintenance budget at ${maintenance.percent_of_revenue.toFixed(1)}% is conservative. For a property built in ${analysis.property.year_built}, you may be able to reduce this by 20-30% after the first year once major repairs are completed.`
    );
  }

  // Utilities optimization
  const utilities = breakdown.find(item => item.category === 'Utilities');
  if (utilities && utilities.annual_amount > 1200) {
    recommendations.push(
      `Consider making utilities tenant-paid to eliminate ${(utilities.annual_amount / 12).toFixed(0)}/month in expenses. This is standard for most rental properties.`
    );
  }

  // Vacancy optimization
  const vacancy = breakdown.find(item => item.category === 'Vacancy Cost');
  if (vacancy && vacancy.percent_of_revenue > 7) {
    recommendations.push(
      `Vacancy rate of ${((vacancy.annual_amount / revenue) * 100).toFixed(1)}% is high. Improve tenant screening and retention to reduce turnover and save ${(vacancy.potential_savings || 0 / 12).toFixed(0)}/month.`
    );
  }

  // Overall efficiency
  if (efficiency_rating === 'Poor') {
    recommendations.push(
      `⚠️ Your expense ratio of ${expense_ratio.toFixed(1)}% is significantly above the market benchmark of ${market_benchmark_ratio}%. Focus on the optimizations above to improve cash flow.`
    );
  } else if (efficiency_rating === 'Excellent') {
    recommendations.push(
      `✅ Your expense ratio of ${expense_ratio.toFixed(1)}% is excellent - below the market benchmark of ${market_benchmark_ratio}%. Continue monitoring costs to maintain this efficiency.`
    );
  }

  // Tax assessment
  const propTax = breakdown.find(item => item.category === 'Property Tax');
  if (propTax && propTax.percent_of_revenue > 15) {
    recommendations.push(
      `Property taxes at ${propTax.percent_of_revenue.toFixed(1)}% of revenue are high. Consider filing a property tax appeal if the assessment seems inflated compared to recent sales.`
    );
  }

  return {
    total_annual_expenses: expenses,
    total_annual_revenue: revenue,
    expense_ratio,
    market_benchmark_ratio,
    target_ratio,
    variance_from_benchmark,
    expense_breakdown: breakdown,
    total_potential_savings,
    optimized_expense_ratio,
    improvement_potential_percent,
    highest_expense_categories,
    most_optimizable_categories,
    efficiency_rating,
    recommendations,
  };
}

/**
 * Calculate expense ratio trend over multiple years
 */
export interface YearlyExpenseProjection {
  year: number;
  revenue: number;
  expenses: number;
  expense_ratio: number;
  cumulative_savings: number;
}

export function projectExpenseRatio(
  analysis: DealAnalysis,
  years: number = 5,
  revenueGrowth: number = 2.5,
  expenseGrowth: number = 2.5
): YearlyExpenseProjection[] {
  const projections: YearlyExpenseProjection[] = [];
  const expenseAnalysis = analyzeExpenseRatio(analysis);

  let revenue = expenseAnalysis.total_annual_revenue;
  let expenses = expenseAnalysis.total_annual_expenses;
  let cumulative_savings = 0;

  for (let year = 1; year <= years; year++) {
    // Apply growth rates
    revenue *= (1 + revenueGrowth / 100);
    expenses *= (1 + expenseGrowth / 100);

    // Calculate savings from optimizations (assume 50% implemented in year 1, 100% by year 3)
    const implementation_factor = Math.min(year * 0.5, 1.0);
    const yearly_savings = expenseAnalysis.total_potential_savings * implementation_factor;
    cumulative_savings += yearly_savings;

    const adjusted_expenses = expenses - yearly_savings;
    const expense_ratio = (adjusted_expenses / revenue) * 100;

    projections.push({
      year,
      revenue,
      expenses: adjusted_expenses,
      expense_ratio,
      cumulative_savings,
    });
  }

  return projections;
}
