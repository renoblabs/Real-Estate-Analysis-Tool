// REI OPS™ - Profitability Gap Analysis Engine

import type {
  MultiFamilyInputs,
  MultiFamilyAnalysis,
  ProfitabilityGaps,
  ProfitabilityGap,
  DevelopmentAnalysis,
  MarketAnalysis,
  UnitType
} from '@/types';

// Target return thresholds
const DEFAULT_TARGETS = {
  min_cash_flow_per_unit: 200, // $200/month per unit minimum
  min_cash_on_cash_return: 0.12, // 12% minimum CoC return
  min_cap_rate: 0.06, // 6% minimum cap rate
  max_cost_per_sqft: 200, // $200/sqft maximum all-in cost
};

/**
 * Main gap analysis function
 */
export function analyzeProfitabilityGaps(
  inputs: MultiFamilyInputs,
  development_analysis: DevelopmentAnalysis,
  market_analysis: MarketAnalysis,
  cash_flow: number,
  total_investment: number
): ProfitabilityGaps {
  
  const cash_flow_gap = calculateCashFlowGap(inputs, cash_flow);
  const roi_gap = calculateROIGap(total_investment, cash_flow);
  const rent_gap = calculateRentGap(inputs, market_analysis);
  const cost_gap = calculateCostGap(development_analysis, inputs);
  
  const recommendations = generateGapRecommendations({
    cash_flow_gap,
    roi_gap,
    rent_gap,
    cost_gap
  });

  return {
    cash_flow_gap,
    roi_gap,
    rent_gap,
    cost_gap,
    recommendations
  };
}

/**
 * Calculate cash flow gap
 */
function calculateCashFlowGap(inputs: MultiFamilyInputs, current_cash_flow: number): ProfitabilityGap {
  const target_cash_flow = inputs.target_units.length * DEFAULT_TARGETS.min_cash_flow_per_unit * 12; // Annual
  const gap_amount = target_cash_flow - current_cash_flow;
  const gap_percentage = current_cash_flow !== 0 ? (gap_amount / Math.abs(current_cash_flow)) * 100 : 100;

  return {
    current_value: current_cash_flow,
    target_value: target_cash_flow,
    gap_amount,
    gap_percentage
  };
}

/**
 * Calculate ROI gap
 */
function calculateROIGap(total_investment: number, annual_cash_flow: number): ProfitabilityGap {
  const current_roi = total_investment > 0 ? annual_cash_flow / total_investment : 0;
  const target_roi = DEFAULT_TARGETS.min_cash_on_cash_return;
  const gap_amount = target_roi - current_roi;
  const gap_percentage = current_roi !== 0 ? (gap_amount / Math.abs(current_roi)) * 100 : 100;

  return {
    current_value: current_roi,
    target_value: target_roi,
    gap_amount,
    gap_percentage
  };
}

/**
 * Calculate rent gap - what rents need to be to achieve targets
 */
function calculateRentGap(inputs: MultiFamilyInputs, market_analysis: MarketAnalysis): ProfitabilityGap {
  // Calculate current weighted average rent
  const current_avg_rent = inputs.target_units.reduce((sum, unit) => sum + unit.target_rent, 0) / inputs.target_units.length;
  
  // Calculate market average rent
  const market_rents = Object.values(market_analysis.rent_analysis_by_unit);
  const market_avg_rent = market_rents.reduce((sum, analysis) => sum + analysis.market_rent_range.average, 0) / market_rents.length;
  
  const gap_amount = market_avg_rent - current_avg_rent;
  const gap_percentage = current_avg_rent !== 0 ? (gap_amount / current_avg_rent) * 100 : 0;

  return {
    current_value: current_avg_rent,
    target_value: market_avg_rent,
    gap_amount,
    gap_percentage
  };
}

/**
 * Calculate cost gap - how much costs need to decrease
 */
function calculateCostGap(development_analysis: DevelopmentAnalysis, inputs: MultiFamilyInputs): ProfitabilityGap {
  const current_cost_per_sqft = development_analysis.cost_per_sqft;
  const target_cost_per_sqft = DEFAULT_TARGETS.max_cost_per_sqft;
  const gap_amount = current_cost_per_sqft - target_cost_per_sqft;
  const gap_percentage = target_cost_per_sqft !== 0 ? (gap_amount / target_cost_per_sqft) * 100 : 0;

  return {
    current_value: current_cost_per_sqft,
    target_value: target_cost_per_sqft,
    gap_amount,
    gap_percentage
  };
}

/**
 * Generate recommendations to close profitability gaps
 */
function generateGapRecommendations(gaps: {
  cash_flow_gap: ProfitabilityGap;
  roi_gap: ProfitabilityGap;
  rent_gap: ProfitabilityGap;
  cost_gap: ProfitabilityGap;
}): string[] {
  const recommendations: string[] = [];

  // Cash flow recommendations
  if (gaps.cash_flow_gap.gap_amount > 0) {
    recommendations.push(`💰 Increase monthly cash flow by $${Math.round(gaps.cash_flow_gap.gap_amount / 12)} to meet targets`);
    
    if (gaps.rent_gap.gap_amount < 0) {
      recommendations.push(`📈 Consider raising rents - currently ${Math.abs(gaps.rent_gap.gap_percentage).toFixed(1)}% below market`);
    }
    
    if (gaps.cost_gap.gap_amount > 0) {
      recommendations.push(`🔨 Reduce construction costs by $${gaps.cost_gap.gap_amount.toFixed(0)}/sqft to improve returns`);
    }
  }

  // ROI recommendations
  if (gaps.roi_gap.gap_amount > 0) {
    const additional_return_needed = gaps.roi_gap.gap_amount * 100;
    recommendations.push(`📊 Need ${additional_return_needed.toFixed(1)}% higher cash-on-cash return`);
    
    // Specific strategies
    if (gaps.cost_gap.gap_amount > 0) {
      recommendations.push(`🏗️ Value engineering could reduce costs and improve ROI`);
    }
    
    recommendations.push(`🏦 Consider alternative financing structures to reduce equity requirements`);
  }

  // Rent optimization recommendations
  if (gaps.rent_gap.gap_percentage < -5) {
    recommendations.push(`🎯 Rents are ${Math.abs(gaps.rent_gap.gap_percentage).toFixed(1)}% below market - significant upside potential`);
  } else if (gaps.rent_gap.gap_percentage > 10) {
    recommendations.push(`⚠️ Rents are ${gaps.rent_gap.gap_percentage.toFixed(1)}% above market - may face leasing challenges`);
  }

  // Cost optimization recommendations
  if (gaps.cost_gap.gap_amount > 50) {
    recommendations.push(`🔧 Significant cost reduction needed - consider alternative construction methods`);
    recommendations.push(`📋 Review scope and specifications for potential savings`);
  } else if (gaps.cost_gap.gap_amount > 20) {
    recommendations.push(`💡 Moderate cost optimization opportunities available`);
  }

  // Strategic recommendations
  if (gaps.cash_flow_gap.gap_amount > 0 && gaps.roi_gap.gap_amount > 0) {
    recommendations.push(`🎯 Consider phased development to reduce initial capital requirements`);
    recommendations.push(`🤝 Explore joint venture partnerships to share costs and risks`);
  }

  return recommendations;
}

/**
 * Calculate required rent to achieve target returns
 */
export function calculateRequiredRent(
  inputs: MultiFamilyInputs,
  development_analysis: DevelopmentAnalysis,
  target_cash_flow: number
): Record<UnitType, number> {
  const required_rents: Record<UnitType, number> = {} as Record<UnitType, number>;
  
  // Calculate total operating expenses (estimated)
  const total_investment = development_analysis.total_development_cost;
  const annual_debt_service = calculateAnnualDebtService(total_investment);
  const annual_operating_expenses = calculateAnnualOperatingExpenses(inputs);
  
  // Total expenses that need to be covered
  const total_annual_expenses = annual_debt_service + annual_operating_expenses + target_cash_flow;
  
  // Account for vacancy
  const vacancy_rate = inputs.market_vacancy_rate || 0.05;
  const required_gross_income = total_annual_expenses / (1 - vacancy_rate);
  
  // Distribute across units based on size
  const total_sqft = inputs.target_units.reduce((sum, unit) => sum + unit.square_feet, 0);
  
  for (const unit of inputs.target_units) {
    const unit_share = unit.square_feet / total_sqft;
    const unit_annual_income = required_gross_income * unit_share;
    required_rents[unit.unit_type] = unit_annual_income / 12;
  }
  
  return required_rents;
}

/**
 * Calculate annual debt service
 */
function calculateAnnualDebtService(total_investment: number): number {
  // Assume 75% LTV, 5.5% interest, 25-year amortization
  const loan_amount = total_investment * 0.75;
  const annual_rate = 0.055;
  const years = 25;
  
  // Monthly payment calculation
  const monthly_rate = annual_rate / 12;
  const num_payments = years * 12;
  const monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                         (Math.pow(1 + monthly_rate, num_payments) - 1);
  
  return monthly_payment * 12;
}

/**
 * Calculate annual operating expenses
 */
function calculateAnnualOperatingExpenses(inputs: MultiFamilyInputs): number {
  // Estimate operating expenses as percentage of gross income
  const estimated_gross_income = inputs.target_units.reduce((sum, unit) => sum + unit.target_rent * 12, 0);
  
  // Typical operating expense ratios for multi-family
  const expense_ratios = {
    property_tax: 0.12, // 12% of gross income
    insurance: 0.03, // 3% of gross income
    maintenance: 0.08, // 8% of gross income
    property_management: 0.06, // 6% of gross income
    utilities: 0.04, // 4% of gross income
    other: 0.02 // 2% of gross income
  };
  
  const total_expense_ratio = Object.values(expense_ratios).reduce((sum, ratio) => sum + ratio, 0);
  
  return estimated_gross_income * total_expense_ratio;
}

/**
 * Analyze sensitivity to key variables
 */
export function analyzeSensitivity(
  inputs: MultiFamilyInputs,
  development_analysis: DevelopmentAnalysis
): {
  rent_sensitivity: Array<{rent_change: number, cash_flow_impact: number}>;
  cost_sensitivity: Array<{cost_change: number, roi_impact: number}>;
  timeline_sensitivity: Array<{timeline_change: number, financing_impact: number}>;
} {
  const base_cash_flow = calculateBaseCashFlow(inputs, development_analysis);
  const base_roi = calculateBaseROI(inputs, development_analysis);
  const base_financing_cost = development_analysis.financing_needs.interest_during_construction;
  
  // Rent sensitivity analysis
  const rent_sensitivity = [-20, -10, -5, 0, 5, 10, 20].map(percent => {
    const adjusted_inputs = { ...inputs };
    adjusted_inputs.target_units = inputs.target_units.map(unit => ({
      ...unit,
      target_rent: unit.target_rent * (1 + percent / 100)
    }));
    
    const adjusted_cash_flow = calculateBaseCashFlow(adjusted_inputs, development_analysis);
    const cash_flow_impact = adjusted_cash_flow - base_cash_flow;
    
    return { rent_change: percent, cash_flow_impact };
  });
  
  // Cost sensitivity analysis
  const cost_sensitivity = [-20, -10, -5, 0, 5, 10, 20].map(percent => {
    const adjusted_cost = development_analysis.total_development_cost * (1 + percent / 100);
    const adjusted_roi = base_cash_flow / adjusted_cost;
    const roi_impact = adjusted_roi - base_roi;
    
    return { cost_change: percent, roi_impact };
  });
  
  // Timeline sensitivity analysis
  const timeline_sensitivity = [-6, -3, -1, 0, 1, 3, 6].map(months => {
    const adjusted_timeline = development_analysis.timeline_months + months;
    const adjusted_financing_cost = calculateFinancingCostForTimeline(
      development_analysis.financing_needs.construction_loan_amount,
      adjusted_timeline
    );
    const financing_impact = adjusted_financing_cost - base_financing_cost;
    
    return { timeline_change: months, financing_impact };
  });
  
  return {
    rent_sensitivity,
    cost_sensitivity,
    timeline_sensitivity
  };
}

/**
 * Calculate base cash flow for sensitivity analysis
 */
function calculateBaseCashFlow(inputs: MultiFamilyInputs, development_analysis: DevelopmentAnalysis): number {
  const gross_income = inputs.target_units.reduce((sum, unit) => sum + unit.target_rent * 12, 0);
  const vacancy_rate = inputs.market_vacancy_rate || 0.05;
  const effective_income = gross_income * (1 - vacancy_rate);
  const operating_expenses = calculateAnnualOperatingExpenses(inputs);
  const debt_service = calculateAnnualDebtService(development_analysis.total_development_cost);
  
  return effective_income - operating_expenses - debt_service;
}

/**
 * Calculate base ROI for sensitivity analysis
 */
function calculateBaseROI(inputs: MultiFamilyInputs, development_analysis: DevelopmentAnalysis): number {
  const cash_flow = calculateBaseCashFlow(inputs, development_analysis);
  const total_investment = development_analysis.total_development_cost;
  
  return total_investment > 0 ? cash_flow / total_investment : 0;
}

/**
 * Calculate financing cost for different timeline scenarios
 */
function calculateFinancingCostForTimeline(loan_amount: number, timeline_months: number): number {
  const annual_rate = 0.07; // 7% construction loan rate
  const monthly_rate = annual_rate / 12;
  
  return loan_amount * monthly_rate * timeline_months;
}

/**
 * Generate scenario analysis
 */
export function generateScenarioAnalysis(
  inputs: MultiFamilyInputs,
  development_analysis: DevelopmentAnalysis
): {
  conservative: { description: string; cash_flow: number; roi: number };
  moderate: { description: string; cash_flow: number; roi: number };
  optimistic: { description: string; cash_flow: number; roi: number };
} {
  // Conservative scenario: 10% higher costs, 5% lower rents, 20% longer timeline
  const conservative_inputs = { ...inputs };
  conservative_inputs.target_units = inputs.target_units.map(unit => ({
    ...unit,
    target_rent: unit.target_rent * 0.95
  }));
  
  const conservative_development = {
    ...development_analysis,
    total_development_cost: development_analysis.total_development_cost * 1.1,
    timeline_months: Math.ceil(development_analysis.timeline_months * 1.2)
  };
  
  const conservative_cash_flow = calculateBaseCashFlow(conservative_inputs, conservative_development);
  const conservative_roi = calculateBaseROI(conservative_inputs, conservative_development);
  
  // Moderate scenario: base case
  const moderate_cash_flow = calculateBaseCashFlow(inputs, development_analysis);
  const moderate_roi = calculateBaseROI(inputs, development_analysis);
  
  // Optimistic scenario: 5% lower costs, 5% higher rents, 10% faster timeline
  const optimistic_inputs = { ...inputs };
  optimistic_inputs.target_units = inputs.target_units.map(unit => ({
    ...unit,
    target_rent: unit.target_rent * 1.05
  }));
  
  const optimistic_development = {
    ...development_analysis,
    total_development_cost: development_analysis.total_development_cost * 0.95,
    timeline_months: Math.ceil(development_analysis.timeline_months * 0.9)
  };
  
  const optimistic_cash_flow = calculateBaseCashFlow(optimistic_inputs, optimistic_development);
  const optimistic_roi = calculateBaseROI(optimistic_inputs, optimistic_development);
  
  return {
    conservative: {
      description: "Higher costs, lower rents, longer timeline",
      cash_flow: conservative_cash_flow,
      roi: conservative_roi
    },
    moderate: {
      description: "Base case assumptions",
      cash_flow: moderate_cash_flow,
      roi: moderate_roi
    },
    optimistic: {
      description: "Lower costs, higher rents, faster timeline",
      cash_flow: optimistic_cash_flow,
      roi: optimistic_roi
    }
  };
}