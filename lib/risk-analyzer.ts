// REI OPS™ - Investment Risk Analyzer

import type { DealAnalysis, PropertyInputs } from '@/types';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskFactor {
  category: string;
  risk_level: RiskLevel;
  score: number; // 0-100 (higher = more risk)
  description: string;
  impact: string;
  mitigation_strategies: string[];
}

export interface RiskAnalysis {
  overall_risk_score: number; // 0-100
  overall_risk_level: RiskLevel;
  risk_factors: RiskFactor[];

  // Risk Categories
  financial_risk_score: number;
  market_risk_score: number;
  operational_risk_score: number;
  liquidity_risk_score: number;

  // Key Warnings
  critical_risks: string[];
  high_risks: string[];

  // Stress Test Results
  stress_test: {
    scenario: string;
    monthly_cash_flow_impact: number;
    annual_cash_flow_impact: number;
    break_even_impact: string;
  }[];

  // Overall Assessment
  risk_tolerance_recommendation: 'Conservative' | 'Moderate' | 'Aggressive';
  suitable_for_investor_types: string[];
  overall_recommendation: string;
}

/**
 * Assess a specific risk factor
 */
function assessRisk(
  score: number,
  description: string,
  impact: string,
  mitigation: string[]
): RiskFactor {
  let risk_level: RiskLevel;
  let category = '';

  if (score >= 75) {
    risk_level = 'Critical';
  } else if (score >= 50) {
    risk_level = 'High';
  } else if (score >= 25) {
    risk_level = 'Medium';
  } else {
    risk_level = 'Low';
  }

  return {
    category,
    risk_level,
    score,
    description,
    impact,
    mitigation_strategies: mitigation,
  };
}

/**
 * Comprehensive risk analysis
 */
export function analyzeRisks(
  inputs: PropertyInputs,
  analysis: DealAnalysis
): RiskAnalysis {
  const risk_factors: RiskFactor[] = [];

  // 1. FINANCIAL RISKS

  // Cash Flow Risk
  const cashFlowMargin = Math.abs(analysis.cash_flow.monthly_net);
  const revenuePercent = (cashFlowMargin / analysis.revenue.gross_monthly_rent) * 100;
  let cashFlowRiskScore = 0;

  if (analysis.cash_flow.monthly_net < 0) {
    cashFlowRiskScore = 80 + Math.min(revenuePercent, 20);
  } else if (revenuePercent < 10) {
    cashFlowRiskScore = 60;
  } else if (revenuePercent < 20) {
    cashFlowRiskScore = 30;
  } else {
    cashFlowRiskScore = 10;
  }

  risk_factors.push({
    ...assessRisk(
      cashFlowRiskScore,
      analysis.cash_flow.monthly_net < 0
        ? `Negative cash flow of ${Math.abs(analysis.cash_flow.monthly_net).toFixed(0)}/month`
        : `Cash flow margin of ${revenuePercent.toFixed(1)}% is ${revenuePercent < 15 ? 'tight' : 'healthy'}`,
      'A tight cash flow margin means small increases in expenses or vacancy could turn the deal negative',
      [
        'Negotiate a lower purchase price',
        'Increase rent if market supports it',
        'Reduce operating expenses',
        'Build a cash reserve for shortfalls',
      ]
    ),
    category: 'Cash Flow Risk',
  });

  // Leverage Risk (High LTV)
  const ltv = ((analysis.financing.total_mortgage_with_insurance / analysis.acquisition.purchase_price) * 100);
  let leverageRiskScore = 0;

  if (ltv >= 95) {
    leverageRiskScore = 85;
  } else if (ltv >= 90) {
    leverageRiskScore = 65;
  } else if (ltv >= 80) {
    leverageRiskScore = 40;
  } else {
    leverageRiskScore = 15;
  }

  risk_factors.push({
    ...assessRisk(
      leverageRiskScore,
      `Loan-to-value ratio of ${ltv.toFixed(1)}% means ${ltv >= 80 ? 'high' : 'moderate'} leverage`,
      'High leverage amplifies losses if property value declines, and limits refinancing options',
      [
        'Increase down payment to reduce LTV',
        'Accelerate principal payments',
        'Focus on value-add improvements to build equity',
        'Avoid this deal if market is at peak pricing',
      ]
    ),
    category: 'Leverage Risk',
  });

  // DSCR Risk
  let dscrRiskScore = 0;

  if (analysis.metrics.dscr < 1.0) {
    dscrRiskScore = 90;
  } else if (analysis.metrics.dscr < 1.15) {
    dscrRiskScore = 60;
  } else if (analysis.metrics.dscr < 1.25) {
    dscrRiskScore = 30;
  } else {
    dscrRiskScore = 10;
  }

  risk_factors.push({
    ...assessRisk(
      dscrRiskScore,
      `DSCR of ${analysis.metrics.dscr.toFixed(2)} is ${analysis.metrics.dscr < 1.15 ? 'below lender requirements' : 'acceptable'}`,
      'Commercial lenders typically require 1.25+ DSCR. Low DSCR limits financing options and signals cash flow stress',
      [
        'Increase net operating income (raise rents, reduce expenses)',
        'Reduce mortgage payment (larger down payment, better rate)',
        'Consider owner financing or private money',
      ]
    ),
    category: 'Debt Service Coverage Risk',
  });

  // 2. MARKET RISKS

  // Vacancy Risk
  const vacancyRate = inputs.vacancy_rate;
  let vacancyRiskScore = 0;

  if (vacancyRate >= 10) {
    vacancyRiskScore = 70;
  } else if (vacancyRate >= 7) {
    vacancyRiskScore = 45;
  } else if (vacancyRate >= 5) {
    vacancyRiskScore = 25;
  } else {
    vacancyRiskScore = 10;
  }

  risk_factors.push({
    ...assessRisk(
      vacancyRiskScore,
      `Vacancy rate of ${vacancyRate}% ${vacancyRate > 7 ? 'exceeds typical market average' : 'is within normal range'}`,
      'Higher vacancy means lost income and increased turn costs. Also signals weak demand or poor property management',
      [
        'Improve property condition to attract quality tenants',
        'Price rent competitively based on market comps',
        'Screen tenants rigorously to improve retention',
        'Offer lease incentives for longer terms',
      ]
    ),
    category: 'Vacancy Risk',
  });

  // Property Age Risk
  const propertyAge = new Date().getFullYear() - inputs.year_built;
  let ageRiskScore = 0;

  if (propertyAge >= 50) {
    ageRiskScore = 65;
  } else if (propertyAge >= 30) {
    ageRiskScore = 40;
  } else if (propertyAge >= 15) {
    ageRiskScore = 20;
  } else {
    ageRiskScore = 10;
  }

  risk_factors.push({
    ...assessRisk(
      ageRiskScore,
      `Property built in ${inputs.year_built} (${propertyAge} years old) may require ${propertyAge >= 40 ? 'major' : 'moderate'} capital improvements`,
      'Older properties have higher maintenance costs, deferred maintenance, and systems nearing end of life (roof, HVAC, plumbing)',
      [
        'Get a thorough inspection to identify deferred maintenance',
        'Budget 10-15% of purchase price for capital improvements in first 2 years',
        'Negotiate price reduction based on needed repairs',
        'Consider properties with recent major system upgrades',
      ]
    ),
    category: 'Property Age Risk',
  });

  // Market Overvaluation Risk
  const pricePerSqFt = analysis.acquisition.purchase_price / inputs.square_feet;
  const grm = analysis.metrics.grm;
  let valuationRiskScore = 0;

  // GRM benchmark: 10-15 is typical for rental properties
  if (grm > 20) {
    valuationRiskScore = 75;
  } else if (grm > 15) {
    valuationRiskScore = 50;
  } else if (grm > 12) {
    valuationRiskScore = 25;
  } else {
    valuationRiskScore = 15;
  }

  risk_factors.push({
    ...assessRisk(
      valuationRiskScore,
      `GRM of ${grm.toFixed(1)} suggests ${grm > 15 ? 'overpriced relative to income' : 'reasonable valuation'}`,
      'Overpaying leaves little room for appreciation and makes exit difficult. Limits refinance and resale options',
      [
        'Order an independent appraisal',
        'Analyze recent comparable sales',
        'Negotiate price down to achieve GRM under 12',
        'Walk away if seller won\'t negotiate',
      ]
    ),
    category: 'Valuation Risk',
  });

  // 3. OPERATIONAL RISKS

  // Property Management Risk
  const hasPM = inputs.property_management_percent > 0;
  let pmRiskScore = hasPM ? 15 : 50;

  risk_factors.push({
    ...assessRisk(
      pmRiskScore,
      hasPM
        ? `Professional property management at ${inputs.property_management_percent}% reduces operational burden`
        : 'Self-management saves money but requires significant time and expertise',
      'Self-management risk includes: legal compliance, tenant disputes, maintenance emergencies, and time commitment',
      [
        'Hire professional property management (8-10% of rent)',
        'If self-managing: educate yourself on landlord-tenant law',
        'Build a network of reliable contractors',
        'Use property management software for organization',
      ]
    ),
    category: 'Property Management Risk',
  });

  // Maintenance Reserve Risk
  const maintenancePercent = (analysis.expenses.annual_maintenance / analysis.acquisition.purchase_price) * 100;
  let maintenanceRiskScore = 0;

  if (maintenancePercent < 1.0) {
    maintenanceRiskScore = 70;
  } else if (maintenancePercent < 1.5) {
    maintenanceRiskScore = 40;
  } else if (maintenancePercent < 2.5) {
    maintenanceRiskScore = 20;
  } else {
    maintenanceRiskScore = 10;
  }

  risk_factors.push({
    ...assessRisk(
      maintenanceRiskScore,
      `Maintenance budget at ${maintenancePercent.toFixed(1)}% of property value is ${maintenancePercent < 1 ? 'insufficient' : 'adequate'}`,
      'Underfunding maintenance leads to deferred repairs, tenant complaints, and emergency expenses that kill cash flow',
      [
        'Budget at least 1% of property value annually',
        'Increase to 2%+ for older properties',
        'Maintain separate capital improvement reserve',
        'Address issues promptly to avoid escalation',
      ]
    ),
    category: 'Maintenance Risk',
  });

  // 4. LIQUIDITY RISKS

  // Capital Requirements Risk
  const totalCashNeeded = analysis.acquisition.total_cash_needed;
  let liquidityRiskScore = 0;

  if (totalCashNeeded > 200000) {
    liquidityRiskScore = 60;
  } else if (totalCashNeeded > 100000) {
    liquidityRiskScore = 35;
  } else {
    liquidityRiskScore = 15;
  }

  risk_factors.push({
    ...assessRisk(
      liquidityRiskScore,
      `Total cash required of ${totalCashNeeded.toFixed(0)} represents significant capital commitment`,
      'Large capital requirements tie up liquidity and limit ability to handle emergencies or pursue other opportunities',
      [
        'Ensure you have 6 months of reserves after closing',
        'Don\'t invest your last dollar into the property',
        'Consider partnerships to split capital requirements',
        'Line up backup financing (HELOC, private lenders)',
      ]
    ),
    category: 'Liquidity Risk',
  });

  // Calculate category scores
  const financial_risks = risk_factors.filter(r =>
    ['Cash Flow Risk', 'Leverage Risk', 'Debt Service Coverage Risk'].includes(r.category)
  );
  const financial_risk_score = financial_risks.reduce((sum, r) => sum + r.score, 0) / financial_risks.length;

  const market_risks = risk_factors.filter(r =>
    ['Vacancy Risk', 'Property Age Risk', 'Valuation Risk'].includes(r.category)
  );
  const market_risk_score = market_risks.reduce((sum, r) => sum + r.score, 0) / market_risks.length;

  const operational_risks = risk_factors.filter(r =>
    ['Property Management Risk', 'Maintenance Risk'].includes(r.category)
  );
  const operational_risk_score = operational_risks.reduce((sum, r) => sum + r.score, 0) / operational_risks.length;

  const liquidity_risk_score = liquidityRiskScore;

  // Overall risk score (weighted average)
  const overall_risk_score =
    (financial_risk_score * 0.4) +
    (market_risk_score * 0.3) +
    (operational_risk_score * 0.2) +
    (liquidity_risk_score * 0.1);

  // Overall risk level
  let overall_risk_level: RiskLevel;
  if (overall_risk_score >= 70) overall_risk_level = 'Critical';
  else if (overall_risk_score >= 50) overall_risk_level = 'High';
  else if (overall_risk_score >= 30) overall_risk_level = 'Medium';
  else overall_risk_level = 'Low';

  // Critical and high risks
  const critical_risks = risk_factors.filter(r => r.risk_level === 'Critical').map(r => r.description);
  const high_risks = risk_factors.filter(r => r.risk_level === 'High').map(r => r.description);

  // Stress test scenarios
  const stress_test = [
    {
      scenario: 'Vacancy increases to 10%',
      monthly_cash_flow_impact: -analysis.revenue.gross_monthly_rent * 0.05, // 5% increase in vacancy
      annual_cash_flow_impact: -analysis.revenue.annual_rent * 0.05,
      break_even_impact: 'Would require rent increase of 5% to maintain current cash flow',
    },
    {
      scenario: 'Interest rate increases 2%',
      monthly_cash_flow_impact: -analysis.financing.total_mortgage_with_insurance * 0.02 / 12, // Rough approximation
      annual_cash_flow_impact: -analysis.financing.total_mortgage_with_insurance * 0.02,
      break_even_impact: 'Would reduce cash flow by ~16% at refinance',
    },
    {
      scenario: 'Major repair needed ($10,000)',
      monthly_cash_flow_impact: -10000 / 12,
      annual_cash_flow_impact: -10000,
      break_even_impact: 'Would wipe out 12+ months of cash flow for typical deal',
    },
    {
      scenario: 'Property value declines 10%',
      monthly_cash_flow_impact: 0, // No immediate cash flow impact
      annual_cash_flow_impact: 0,
      break_even_impact: `Equity would decrease by ${(analysis.acquisition.purchase_price * 0.1).toFixed(0)}, limiting refinance options`,
    },
  ];

  // Risk tolerance recommendation
  let risk_tolerance_recommendation: 'Conservative' | 'Moderate' | 'Aggressive';
  if (overall_risk_score < 30) {
    risk_tolerance_recommendation = 'Conservative';
  } else if (overall_risk_score < 55) {
    risk_tolerance_recommendation = 'Moderate';
  } else {
    risk_tolerance_recommendation = 'Aggressive';
  }

  // Suitable investor types
  const suitable_for_investor_types: string[] = [];
  if (overall_risk_score < 30) {
    suitable_for_investor_types.push('First-time investors', 'Passive investors', 'Retirement portfolios');
  }
  if (overall_risk_score >= 20 && overall_risk_score < 60) {
    suitable_for_investor_types.push('Experienced investors', 'Active investors', 'Growth-focused investors');
  }
  if (overall_risk_score >= 40) {
    suitable_for_investor_types.push('Advanced investors', 'Value-add specialists', 'High-risk tolerance investors');
  }

  // Overall recommendation
  let overall_recommendation = '';
  if (overall_risk_level === 'Low') {
    overall_recommendation = '✅ This is a relatively low-risk investment suitable for most investor profiles. The deal metrics are solid with manageable risks.';
  } else if (overall_risk_level === 'Medium') {
    overall_recommendation = '⚠️ This deal carries moderate risk. Suitable for experienced investors who can actively manage the identified risk factors. Consider mitigation strategies carefully.';
  } else if (overall_risk_level === 'High') {
    overall_recommendation = '⚠️ HIGH RISK: This deal has significant risk factors that require careful consideration. Only suitable for experienced investors with strong reserves and risk management capabilities. Seriously consider the mitigation strategies or walking away.';
  } else {
    overall_recommendation = '🚨 CRITICAL RISK: This investment carries critical risks that could result in significant losses. Strongly recommend passing on this deal unless you can negotiate major improvements (lower price, higher rents, better terms) to reduce risk to acceptable levels.';
  }

  return {
    overall_risk_score,
    overall_risk_level,
    risk_factors,
    financial_risk_score,
    market_risk_score,
    operational_risk_score,
    liquidity_risk_score,
    critical_risks,
    high_risks,
    stress_test,
    risk_tolerance_recommendation,
    suitable_for_investor_types,
    overall_recommendation,
  };
}
