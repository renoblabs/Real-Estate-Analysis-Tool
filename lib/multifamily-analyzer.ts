// REI OPS™ - Multi-Family Development Analysis Orchestrator

import type {
  MultiFamilyInputs,
  MultiFamilyAnalysis,
  DevelopmentRiskAssessment
} from '@/types';

import { analyzeDeal } from './deal-analyzer';
import { analyzeDevelopment, createConstructionTimeline } from './development-analyzer';
import { analyzeMarket } from './market-analyzer';
import { analyzeProfitabilityGaps } from './gap-analyzer';

/**
 * Main multi-family development analysis function
 */
export async function analyzeMultiFamilyDevelopment(inputs: MultiFamilyInputs): Promise<MultiFamilyAnalysis> {
  try {
    // First, run the standard rental analysis to get base metrics
    const base_analysis = await analyzeDeal(inputs);
    
    // Then run specialized multi-family development analysis
    const development_analysis = analyzeDevelopment(inputs);
    const market_analysis = analyzeMarket(inputs);
    const construction_timeline = createConstructionTimeline(inputs);
    
    // Calculate total investment including development costs
    const total_investment = development_analysis.total_development_cost + (inputs.land_cost || 0);
    
    // Analyze profitability gaps
    const profitability_gaps = analyzeProfitabilityGaps(
      inputs,
      development_analysis,
      market_analysis,
      base_analysis.cash_flow.annual_net,
      total_investment
    );
    
    // Assess development risks
    const risk_assessment = assessDevelopmentRisks(inputs, development_analysis, market_analysis);
    
    // Combine all analyses
    const multifamily_analysis: MultiFamilyAnalysis = {
      ...base_analysis,
      development_analysis,
      market_analysis,
      profitability_gaps,
      construction_timeline,
      risk_assessment
    };
    
    // Update warnings with development-specific insights
    multifamily_analysis.warnings = [
      ...base_analysis.warnings,
      ...generateDevelopmentWarnings(inputs, development_analysis, market_analysis, risk_assessment)
    ];
    
    return multifamily_analysis;
    
  } catch (error) {
    console.error('Error in multi-family analysis:', error);
    throw new Error(`Multi-family analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Assess development-specific risks
 */
function assessDevelopmentRisks(
  inputs: MultiFamilyInputs,
  development_analysis: any,
  market_analysis: any
): DevelopmentRiskAssessment {
  
  // Construction risk assessment
  const construction_risk = assessConstructionRisk(inputs, development_analysis);
  
  // Market risk assessment
  const market_risk = assessMarketRisk(inputs, market_analysis);
  
  // Financing risk assessment
  const financing_risk = assessFinancingRisk(inputs, development_analysis);
  
  // Calculate overall risk score (weighted average)
  const overall_risk_score = (
    construction_risk.score * 0.4 +
    market_risk.score * 0.35 +
    financing_risk.score * 0.25
  );
  
  // Determine risk level
  let risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  if (overall_risk_score <= 3) {
    risk_level = 'low';
  } else if (overall_risk_score <= 5) {
    risk_level = 'moderate';
  } else if (overall_risk_score <= 7) {
    risk_level = 'high';
  } else {
    risk_level = 'very_high';
  }
  
  return {
    construction_risk,
    market_risk,
    financing_risk,
    overall_risk_score,
    risk_level
  };
}

/**
 * Assess construction-related risks
 */
function assessConstructionRisk(inputs: MultiFamilyInputs, development_analysis: any): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];
  
  // Timeline risk
  if (development_analysis.timeline_months > 18) {
    score += 2;
    factors.push('Extended construction timeline increases risk');
  } else if (development_analysis.timeline_months > 12) {
    score += 1;
    factors.push('Moderate construction timeline');
  }
  
  // Cost per sqft risk
  if (development_analysis.cost_per_sqft > 250) {
    score += 2;
    factors.push('High construction cost per sqft');
  } else if (development_analysis.cost_per_sqft > 200) {
    score += 1;
    factors.push('Above-average construction costs');
  }
  
  // Development type risk
  switch (inputs.development_type) {
    case 'raw_land':
      score += 2;
      factors.push('Raw land development has highest complexity');
      break;
    case 'new_construction':
      score += 1;
      factors.push('New construction on prepared site');
      break;
    case 'existing_structure':
      if (inputs.renovation_scope === 'gut_renovation') {
        score += 2;
        factors.push('Gut renovation can reveal unexpected issues');
      } else if (inputs.renovation_scope === 'heavy') {
        score += 1;
        factors.push('Heavy renovation scope');
      }
      break;
  }
  
  // Project size risk
  const unit_count = inputs.target_units.length;
  if (unit_count > 3) {
    score += 1;
    factors.push('Larger projects have increased complexity');
  }
  
  // Experience factor (would be based on user profile in real implementation)
  score += 1;
  factors.push('Consider your development experience level');
  
  return { score: Math.min(10, score), factors };
}

/**
 * Assess market-related risks
 */
function assessMarketRisk(inputs: MultiFamilyInputs, market_analysis: any): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];
  
  // Vacancy rate risk
  const vacancy_rate = market_analysis.demand_indicators.vacancy_rate;
  if (vacancy_rate > 0.08) {
    score += 2;
    factors.push('High vacancy rate indicates weak demand');
  } else if (vacancy_rate > 0.05) {
    score += 1;
    factors.push('Moderate vacancy rate');
  }
  
  // Competition level risk
  switch (market_analysis.demand_indicators.competition_level) {
    case 'high':
      score += 2;
      factors.push('High competition may impact leasing');
      break;
    case 'moderate':
      score += 1;
      factors.push('Moderate competition in market');
      break;
  }
  
  // Rent growth risk
  const rent_growth = market_analysis.demand_indicators.rent_growth_trend;
  if (rent_growth < 0.02) {
    score += 2;
    factors.push('Slow rent growth limits upside potential');
  } else if (rent_growth < 0.03) {
    score += 1;
    factors.push('Below-average rent growth');
  }
  
  // Market score risk
  if (market_analysis.overall_market_score < 6) {
    score += 2;
    factors.push('Below-average market conditions');
  } else if (market_analysis.overall_market_score < 7) {
    score += 1;
    factors.push('Moderate market conditions');
  }
  
  // Rent premium risk
  const rent_analyses = Object.values(market_analysis.rent_analysis_by_unit);
  const avg_premium = rent_analyses.reduce((sum: number, analysis: any) => 
    sum + analysis.rent_premium_discount, 0) / rent_analyses.length;
  
  if (avg_premium > 15) {
    score += 2;
    factors.push('Significant rent premium may impact leasing velocity');
  } else if (avg_premium > 10) {
    score += 1;
    factors.push('Moderate rent premium to market');
  }
  
  return { score: Math.min(10, score), factors };
}

/**
 * Assess financing-related risks
 */
function assessFinancingRisk(inputs: MultiFamilyInputs, development_analysis: any): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];
  
  // Equity requirement risk
  const equity_percentage = development_analysis.financing_needs.equity_required / 
                           development_analysis.financing_needs.total_project_cost;
  
  if (equity_percentage > 0.35) {
    score += 2;
    factors.push('High equity requirement limits leverage');
  } else if (equity_percentage > 0.25) {
    score += 1;
    factors.push('Above-average equity requirement');
  }
  
  // Construction loan size risk
  const loan_amount = development_analysis.financing_needs.construction_loan_amount;
  if (loan_amount > 2000000) {
    score += 2;
    factors.push('Large construction loan may face stricter underwriting');
  } else if (loan_amount > 1000000) {
    score += 1;
    factors.push('Significant construction financing needed');
  }
  
  // Interest rate environment (would be dynamic in real implementation)
  score += 1;
  factors.push('Consider current interest rate environment');
  
  // Debt service coverage risk
  const estimated_noi = calculateEstimatedNOI(inputs);
  const permanent_debt_service = development_analysis.financing_needs.permanent_financing * 0.06; // Assume 6% rate
  const dscr = estimated_noi / permanent_debt_service;
  
  if (dscr < 1.2) {
    score += 2;
    factors.push('Low debt service coverage ratio');
  } else if (dscr < 1.35) {
    score += 1;
    factors.push('Moderate debt service coverage');
  }
  
  return { score: Math.min(10, score), factors };
}

/**
 * Calculate estimated NOI for financing risk assessment
 */
function calculateEstimatedNOI(inputs: MultiFamilyInputs): number {
  const gross_income = inputs.target_units.reduce((sum, unit) => sum + unit.target_rent * 12, 0);
  const vacancy_rate = inputs.market_vacancy_rate || 0.05;
  const effective_income = gross_income * (1 - vacancy_rate);
  const operating_expense_ratio = 0.40; // 40% typical for multi-family
  
  return effective_income * (1 - operating_expense_ratio);
}

/**
 * Generate development-specific warnings
 */
function generateDevelopmentWarnings(
  inputs: MultiFamilyInputs,
  development_analysis: any,
  market_analysis: any,
  risk_assessment: DevelopmentRiskAssessment
): string[] {
  const warnings: string[] = [];
  
  // High-risk warnings
  if (risk_assessment.overall_risk_score > 7) {
    warnings.push('⚠️ Very high development risk - consider reducing scope or improving market conditions');
  } else if (risk_assessment.overall_risk_score > 5) {
    warnings.push('⚠️ High development risk - ensure adequate contingencies and experience');
  }
  
  // Timeline warnings
  if (development_analysis.timeline_months > 18) {
    warnings.push('⏰ Extended construction timeline increases carrying costs and market risk');
  }
  
  // Cost warnings
  if (development_analysis.cost_per_sqft > 250) {
    warnings.push('💰 High construction cost per sqft - consider value engineering');
  }
  
  // Market warnings
  if (market_analysis.demand_indicators.vacancy_rate > 0.08) {
    warnings.push('🏠 High market vacancy rate may impact leasing timeline');
  }
  
  if (market_analysis.demand_indicators.competition_level === 'high') {
    warnings.push('🏢 High competition - ensure strong differentiation strategy');
  }
  
  // Financing warnings
  const equity_percentage = development_analysis.financing_needs.equity_required / 
                           development_analysis.financing_needs.total_project_cost;
  if (equity_percentage > 0.35) {
    warnings.push('🏦 High equity requirement - consider alternative financing structures');
  }
  
  // Rent premium warnings
  const rent_analyses = Object.values(market_analysis.rent_analysis_by_unit);
  const avg_premium = rent_analyses.reduce((sum: number, analysis: any) => 
    sum + analysis.rent_premium_discount, 0) / rent_analyses.length;
  
  if (avg_premium > 15) {
    warnings.push('📈 Significant rent premium to market - validate demand at target rents');
  }
  
  return warnings;
}

/**
 * Generate executive summary for multi-family development
 */
export function generateExecutiveSummary(analysis: MultiFamilyAnalysis): {
  recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
  key_metrics: Record<string, string>;
  critical_factors: string[];
  next_steps: string[];
} {
  const { development_analysis, market_analysis, risk_assessment, profitability_gaps } = analysis;
  
  // Determine recommendation
  let recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
  
  if (risk_assessment.overall_risk_score <= 4 && 
      analysis.cash_flow.annual_net > 0 && 
      profitability_gaps.roi_gap.gap_amount <= 0) {
    recommendation = 'proceed';
  } else if (risk_assessment.overall_risk_score <= 6 && 
             analysis.cash_flow.annual_net > -10000) {
    recommendation = 'proceed_with_caution';
  } else {
    recommendation = 'do_not_proceed';
  }
  
  // Key metrics
  const key_metrics = {
    'Total Development Cost': `$${development_analysis.total_development_cost.toLocaleString()}`,
    'Cost per Unit': `$${development_analysis.cost_per_unit.toLocaleString()}`,
    'Cost per Sq Ft': `$${development_analysis.cost_per_sqft.toFixed(0)}`,
    'Timeline': `${development_analysis.timeline_months} months`,
    'Annual Cash Flow': `$${analysis.cash_flow.annual_net.toLocaleString()}`,
    'Cash-on-Cash Return': `${(analysis.metrics.cash_on_cash_return * 100).toFixed(1)}%`,
    'Market Score': `${market_analysis.overall_market_score}/10`,
    'Risk Level': risk_assessment.risk_level
  };
  
  // Critical factors
  const critical_factors: string[] = [];
  
  if (profitability_gaps.cash_flow_gap.gap_amount > 0) {
    critical_factors.push(`Cash flow gap: $${profitability_gaps.cash_flow_gap.gap_amount.toLocaleString()}/year`);
  }
  
  if (profitability_gaps.roi_gap.gap_amount > 0) {
    critical_factors.push(`ROI gap: ${(profitability_gaps.roi_gap.gap_amount * 100).toFixed(1)}%`);
  }
  
  if (risk_assessment.overall_risk_score > 6) {
    critical_factors.push(`High risk score: ${risk_assessment.overall_risk_score}/10`);
  }
  
  if (market_analysis.demand_indicators.vacancy_rate > 0.08) {
    critical_factors.push(`High vacancy rate: ${(market_analysis.demand_indicators.vacancy_rate * 100).toFixed(1)}%`);
  }
  
  // Next steps
  const next_steps: string[] = [];
  
  if (recommendation === 'proceed') {
    next_steps.push('Secure development financing pre-approval');
    next_steps.push('Finalize architectural plans and permits');
    next_steps.push('Lock in construction contracts');
    next_steps.push('Begin pre-leasing marketing');
  } else if (recommendation === 'proceed_with_caution') {
    next_steps.push('Address identified risk factors');
    next_steps.push('Optimize costs and/or rents to improve returns');
    next_steps.push('Secure experienced development partners');
    next_steps.push('Increase contingency reserves');
  } else {
    next_steps.push('Reconsider project scope and scale');
    next_steps.push('Explore alternative sites or markets');
    next_steps.push('Wait for improved market conditions');
    next_steps.push('Consider alternative investment strategies');
  }
  
  return {
    recommendation,
    key_metrics,
    critical_factors,
    next_steps
  };
}