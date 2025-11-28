// REI OPS™ - Small Multifamily (1-4 Units) Analysis Engine

import type {
  SmallMultifamilyInputs,
  SmallMultifamilyAnalysis,
  SmallMultifamilyUnit,
  RentComparable,
  ScenarioAnalysis,
  UnitType,
  DealAnalysis
} from '@/types';

// Note: Import analyzeRentalProperty to avoid circular dependency
// We'll implement a simplified base analysis instead
import { calculateMortgagePayment, calculateBreakevenOccupancy } from './canadian-calculations';

/**
 * Main small multifamily analysis function
 * Analyzes 1-4 unit properties for raw land development or existing structure conversion
 */
export async function analyzeSmallMultifamily(inputs: SmallMultifamilyInputs): Promise<SmallMultifamilyAnalysis> {
  // Create simplified base analysis to avoid circular dependency
  const baseAnalysis = createBaseAnalysis(inputs);
  
  // Calculate development costs
  const developmentCosts = calculateDevelopmentCosts(inputs);
  
  // Analyze each unit
  const unitAnalysis = analyzeUnits(inputs, developmentCosts);
  
  // Perform market analysis
  const marketAnalysis = analyzeMarketConditions(inputs);
  
  // Calculate profitability metrics
  const profitability = calculateProfitability(inputs, developmentCosts, unitAnalysis);
  
  // Assess risks
  const riskFactors = assessRisks(inputs, marketAnalysis);
  
  // Generate scenarios
  const scenarios = generateScenarios(inputs, profitability, developmentCosts);
  
  return {
    ...baseAnalysis,
    development_costs: developmentCosts,
    unit_analysis: unitAnalysis,
    market_analysis: marketAnalysis,
    profitability,
    risk_factors: riskFactors,
    scenarios
  };
}

/**
 * Calculate total development costs based on approach
 */
function calculateDevelopmentCosts(inputs: SmallMultifamilyInputs) {
  const { development_approach, target_unit_count } = inputs;
  
  let landAcquisition = 0;
  let sitePreparation = 0;
  let constructionPerUnit = 0;
  let renovationPerUnit = 0;
  let permitsAndApprovals = inputs.permit_and_approval_costs || 0;
  let utilityConnections = 0;
  
  if (development_approach === 'raw_land') {
    landAcquisition = inputs.land_acquisition_cost || 0;
    sitePreparation = inputs.site_preparation_cost || estimateSitePreparation(inputs);
    constructionPerUnit = inputs.construction_cost_per_unit || estimateConstructionCost(inputs);
    utilityConnections = inputs.utility_connections_cost || estimateUtilityConnections(target_unit_count);
    permitsAndApprovals = permitsAndApprovals || estimatePermitCosts('new_construction', target_unit_count);
  } else if (development_approach === 'existing_conversion') {
    landAcquisition = inputs.existing_structure_value || inputs.purchase_price;
    renovationPerUnit = inputs.renovation_cost_per_unit || estimateRenovationCost(inputs);
    permitsAndApprovals = permitsAndApprovals || estimatePermitCosts('conversion', target_unit_count);
  } else if (development_approach === 'existing_addition') {
    landAcquisition = inputs.existing_structure_value || inputs.purchase_price;
    constructionPerUnit = inputs.construction_cost_per_unit || estimateConstructionCost(inputs);
    renovationPerUnit = inputs.renovation_cost_per_unit || estimateRenovationCost(inputs);
    permitsAndApprovals = permitsAndApprovals || estimatePermitCosts('addition', target_unit_count);
  }
  
  const totalHardCosts = (constructionPerUnit + renovationPerUnit) * target_unit_count;
  const contingency = (totalHardCosts + sitePreparation + utilityConnections) * 0.1; // 10% contingency
  
  const totalDevelopmentCost = landAcquisition + sitePreparation + totalHardCosts + 
                              permitsAndApprovals + utilityConnections + contingency;
  
  return {
    land_acquisition: landAcquisition,
    site_preparation: sitePreparation,
    construction_per_unit: constructionPerUnit,
    renovation_per_unit: renovationPerUnit,
    permits_and_approvals: permitsAndApprovals,
    utility_connections: utilityConnections,
    contingency,
    total_development_cost: totalDevelopmentCost
  };
}

/**
 * Analyze each unit's financial performance
 */
function analyzeUnits(inputs: SmallMultifamilyInputs, developmentCosts: any) {
  return inputs.planned_units.map(unit => {
    const costToCreate = calculateUnitCost(unit, inputs, developmentCosts);
    const projectedRent = unit.target_monthly_rent;
    
    // Estimate unit-level expenses (proportional to rent)
    const monthlyExpenses = projectedRent * 0.35; // Rough estimate: 35% expense ratio
    const monthlyNetIncome = projectedRent - monthlyExpenses;
    const annualNetIncome = monthlyNetIncome * 12;
    
    const roiPerUnit = costToCreate > 0 ? (annualNetIncome / costToCreate) * 100 : 0;
    
    return {
      unit_number: unit.unit_number,
      projected_rent: projectedRent,
      cost_to_create: costToCreate,
      monthly_net_income: monthlyNetIncome,
      roi_per_unit: roiPerUnit
    };
  });
}

/**
 * Calculate cost to create each unit
 */
function calculateUnitCost(unit: SmallMultifamilyUnit, inputs: SmallMultifamilyInputs, developmentCosts: any): number {
  const { target_unit_count } = inputs;
  
  // Allocate shared costs proportionally
  const sharedCosts = (developmentCosts.land_acquisition + 
                      developmentCosts.site_preparation + 
                      developmentCosts.permits_and_approvals + 
                      developmentCosts.utility_connections + 
                      developmentCosts.contingency) / target_unit_count;
  
  const unitSpecificCosts = (unit.construction_cost || developmentCosts.construction_per_unit) +
                           (unit.renovation_cost || developmentCosts.renovation_per_unit);
  
  return sharedCosts + unitSpecificCosts;
}

/**
 * Analyze market conditions and rent comparables
 */
function analyzeMarketConditions(inputs: SmallMultifamilyInputs) {
  const { local_rent_comparables } = inputs;
  
  // Calculate average rents by unit type
  const averageRentPerUnitType: Record<UnitType, number> = {
    'studio': 0,
    '1br': 0,
    '2br': 0,
    '3br': 0,
    '4br': 0
  };
  
  const unitTypeCounts: Record<UnitType, number> = {
    'studio': 0,
    '1br': 0,
    '2br': 0,
    '3br': 0,
    '4br': 0
  };
  
  local_rent_comparables.forEach(comp => {
    averageRentPerUnitType[comp.unit_type] += comp.monthly_rent;
    unitTypeCounts[comp.unit_type]++;
  });
  
  // Calculate averages
  Object.keys(averageRentPerUnitType).forEach(unitType => {
    const type = unitType as UnitType;
    if (unitTypeCounts[type] > 0) {
      averageRentPerUnitType[type] = averageRentPerUnitType[type] / unitTypeCounts[type];
    }
  });
  
  // Calculate market strength score based on comparables
  const marketStrengthScore = calculateMarketStrength(local_rent_comparables, inputs);
  
  return {
    average_rent_per_unit_type: averageRentPerUnitType,
    market_vacancy_rate: inputs.market_vacancy_rate || 5.0, // Default 5%
    rent_growth_projection: 2.5, // Conservative 2.5% annual growth
    comparable_properties_count: local_rent_comparables.length,
    market_strength_score: marketStrengthScore
  };
}

/**
 * Calculate overall profitability metrics
 */
function calculateProfitability(inputs: SmallMultifamilyInputs, developmentCosts: any, unitAnalysis: any[]) {
  const totalInvestment = developmentCosts.total_development_cost + inputs.down_payment_amount;
  const totalAnnualIncome = unitAnalysis.reduce((sum, unit) => sum + (unit.projected_rent * 12), 0);
  
  // Calculate mortgage payment
  const purchasePrice = inputs.purchase_price || inputs.land_acquisition_cost || inputs.existing_structure_value || 0;
  const downPayment = inputs.down_payment_amount || (purchasePrice * (inputs.down_payment_percent / 100));
  const mortgageAmount = purchasePrice - downPayment;
  const monthlyMortgagePayment = calculateMortgagePayment(
    mortgageAmount,
    inputs.interest_rate,
    inputs.amortization_years
  );
  
  // Estimate total annual expenses
  const totalAnnualExpenses = totalAnnualIncome * 0.35 + // Operating expenses
                             monthlyMortgagePayment * 12; // Mortgage payments
  
  const netAnnualIncome = totalAnnualIncome - totalAnnualExpenses;
  const cashOnCashReturn = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
  const capRate = developmentCosts.total_development_cost > 0 ? 
                  (netAnnualIncome / developmentCosts.total_development_cost) * 100 : 0;
  
  const breakEvenOccupancy = totalAnnualExpenses > 0 ? 
                            (totalAnnualExpenses / totalAnnualIncome) * 100 : 0;
  
  const paybackPeriodYears = netAnnualIncome > 0 ? totalInvestment / netAnnualIncome : 0;
  
  return {
    total_investment: totalInvestment,
    total_annual_income: totalAnnualIncome,
    total_annual_expenses: totalAnnualExpenses,
    net_annual_income: netAnnualIncome,
    cash_on_cash_return: cashOnCashReturn,
    cap_rate: capRate,
    break_even_occupancy: breakEvenOccupancy,
    payback_period_years: paybackPeriodYears
  };
}

/**
 * Assess various risk factors
 */
function assessRisks(inputs: SmallMultifamilyInputs, marketAnalysis: any) {
  const constructionRisk: string[] = [];
  const marketRisk: string[] = [];
  const financialRisk: string[] = [];
  const regulatoryRisk: string[] = [];
  
  // Construction risks
  if (inputs.development_approach === 'raw_land') {
    constructionRisk.push('New construction timeline risk');
    constructionRisk.push('Weather and seasonal delays');
    constructionRisk.push('Material cost escalation');
  }
  
  if (inputs.development_approach === 'existing_conversion') {
    constructionRisk.push('Unknown structural issues');
    constructionRisk.push('Code compliance upgrades');
    if ((inputs.conversion_feasibility_score || 5) < 7) {
      constructionRisk.push('Low conversion feasibility score');
    }
  }
  
  // Market risks
  if (marketAnalysis.comparable_properties_count < 5) {
    marketRisk.push('Limited comparable data');
  }
  
  if (marketAnalysis.market_vacancy_rate > 7) {
    marketRisk.push('High market vacancy rate');
  }
  
  if (marketAnalysis.market_strength_score < 6) {
    marketRisk.push('Weak market conditions');
  }
  
  // Financial risks
  if (inputs.down_payment_percent < 20) {
    financialRisk.push('Low down payment increases leverage risk');
  }
  
  // Regulatory risks
  if (inputs.target_unit_count > (inputs.current_unit_count || 0)) {
    regulatoryRisk.push('Zoning approval required for additional units');
    regulatoryRisk.push('Building permit approval timeline');
  }
  
  // Calculate overall risk score (1-10, where 10 is highest risk)
  const totalRiskFactors = constructionRisk.length + marketRisk.length + 
                          financialRisk.length + regulatoryRisk.length;
  const overallRiskScore = Math.min(10, Math.max(1, totalRiskFactors + 2));
  
  return {
    construction_risk: constructionRisk,
    market_risk: marketRisk,
    financial_risk: financialRisk,
    regulatory_risk: regulatoryRisk,
    overall_risk_score: overallRiskScore
  };
}

/**
 * Generate conservative, realistic, and optimistic scenarios
 */
function generateScenarios(inputs: SmallMultifamilyInputs, baseProfitability: any, developmentCosts: any): {
  conservative: ScenarioAnalysis;
  realistic: ScenarioAnalysis;
  optimistic: ScenarioAnalysis;
} {
  const scenarios = {
    conservative: createScenario('Conservative', {
      rent_achievement: 85,
      vacancy_rate: 8,
      cost_overrun: 15,
      timeline_delay_months: 3
    }, baseProfitability, developmentCosts),
    
    realistic: createScenario('Realistic', {
      rent_achievement: 95,
      vacancy_rate: 5,
      cost_overrun: 5,
      timeline_delay_months: 1
    }, baseProfitability, developmentCosts),
    
    optimistic: createScenario('Optimistic', {
      rent_achievement: 105,
      vacancy_rate: 3,
      cost_overrun: 0,
      timeline_delay_months: 0
    }, baseProfitability, developmentCosts)
  };
  
  return scenarios;
}

/**
 * Create individual scenario analysis
 */
function createScenario(
  scenarioName: string, 
  assumptions: any, 
  baseProfitability: any, 
  developmentCosts: any
): ScenarioAnalysis {
  const adjustedIncome = baseProfitability.total_annual_income * (assumptions.rent_achievement / 100);
  const adjustedVacancyLoss = adjustedIncome * (assumptions.vacancy_rate / 100);
  const effectiveIncome = adjustedIncome - adjustedVacancyLoss;
  
  const adjustedCosts = developmentCosts.total_development_cost * (1 + assumptions.cost_overrun / 100);
  const annualCashFlow = effectiveIncome - baseProfitability.total_annual_expenses;
  const cashOnCashReturn = baseProfitability.total_investment > 0 ? 
                          (annualCashFlow / baseProfitability.total_investment) * 100 : 0;
  
  // Simple 5-year ROI calculation
  const totalRoi5Year = (annualCashFlow * 5 / baseProfitability.total_investment) * 100;
  
  return {
    scenario_name: scenarioName,
    assumptions,
    projected_returns: {
      annual_cash_flow: annualCashFlow,
      cash_on_cash_return: cashOnCashReturn,
      total_roi_5_year: totalRoi5Year
    }
  };
}

// Helper estimation functions
function estimateSitePreparation(inputs: SmallMultifamilyInputs): number {
  // Rough estimate: $15,000-30,000 per unit for site prep
  return inputs.target_unit_count * 22500;
}

function estimateConstructionCost(inputs: SmallMultifamilyInputs): number {
  // Rough estimate: $150-200 per sq ft for new construction
  const avgSqFt = inputs.planned_units.reduce((sum, unit) => sum + unit.square_feet, 0) / inputs.planned_units.length;
  return avgSqFt * 175; // $175/sq ft average
}

function estimateRenovationCost(inputs: SmallMultifamilyInputs): number {
  // Rough estimate: $75-125 per sq ft for renovation
  const avgSqFt = inputs.planned_units.reduce((sum, unit) => sum + unit.square_feet, 0) / inputs.planned_units.length;
  return avgSqFt * 100; // $100/sq ft average
}

function estimateUtilityConnections(unitCount: number): number {
  // Rough estimate: $8,000-12,000 per unit for utility connections
  return unitCount * 10000;
}

function estimatePermitCosts(type: 'new_construction' | 'conversion' | 'addition', unitCount: number): number {
  const baseCost = type === 'new_construction' ? 15000 : 
                   type === 'conversion' ? 8000 : 12000;
  return baseCost + (unitCount - 1) * 3000; // Additional cost per extra unit
}

function calculateMarketStrength(comparables: RentComparable[], inputs: SmallMultifamilyInputs): number {
  if (comparables.length === 0) return 5; // Neutral score
  
  let score = 5; // Start with neutral
  
  // Adjust based on number of comparables
  if (comparables.length >= 10) score += 1;
  else if (comparables.length < 3) score -= 2;
  
  // Adjust based on average property age
  const avgAge = comparables.reduce((sum, comp) => sum + comp.property_age_years, 0) / comparables.length;
  if (avgAge < 10) score += 1;
  else if (avgAge > 30) score -= 1;
  
  // Adjust based on rent variance (lower variance = more stable market)
  const rents = comparables.map(comp => comp.monthly_rent);
  const avgRent = rents.reduce((sum, rent) => sum + rent, 0) / rents.length;
  const variance = rents.reduce((sum, rent) => sum + Math.pow(rent - avgRent, 2), 0) / rents.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgRent;
  
  if (coefficientOfVariation < 0.1) score += 1; // Low variance = stable market
  else if (coefficientOfVariation > 0.3) score -= 1; // High variance = volatile market
  
  return Math.max(1, Math.min(10, score));
}

/**
 * Create simplified base analysis to avoid circular dependency with deal-analyzer
 */
function createBaseAnalysis(inputs: SmallMultifamilyInputs): DealAnalysis {
  // Calculate total monthly rent from all planned units
  const totalMonthlyRent = inputs.planned_units.reduce((sum, unit) => sum + unit.target_monthly_rent, 0);
  
  // Basic acquisition costs
  const purchasePrice = inputs.purchase_price || inputs.land_acquisition_cost || 0;
  const downPayment = inputs.down_payment_amount || (purchasePrice * (inputs.down_payment_percent / 100));
  const mortgageAmount = purchasePrice - downPayment;
  
  // Basic monthly mortgage payment
  const monthlyMortgagePayment = calculateMortgagePayment(
    mortgageAmount,
    inputs.interest_rate,
    inputs.amortization_years
  );
  
  // Simplified expenses (35% of gross rent is a common rule of thumb)
  const monthlyOperatingExpenses = totalMonthlyRent * 0.35;
  const totalMonthlyExpenses = monthlyMortgagePayment + monthlyOperatingExpenses;
  
  // Cash flow
  const monthlyCashFlow = totalMonthlyRent - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Basic metrics
  const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
  const capRate = purchasePrice > 0 ? ((totalMonthlyRent * 12 - monthlyOperatingExpenses * 12) / purchasePrice) * 100 : 0;
  
  // Create simplified DealAnalysis structure
  return {
    property: inputs,
    acquisition: {
      purchase_price: purchasePrice,
      down_payment: downPayment,
      land_transfer_tax: 0, // Simplified
      legal_fees: 2000,
      inspection: 500,
      appraisal: 400,
      other_closing_costs: 1000,
      total_acquisition_cost: purchasePrice + 3900
    },
    financing: {
      mortgage_amount: mortgageAmount,
      cmhc_premium: 0, // Simplified
      total_mortgage_with_insurance: mortgageAmount,
      monthly_payment: monthlyMortgagePayment,
      annual_payment: monthlyMortgagePayment * 12,
      stress_test_rate: inputs.interest_rate + 2,
      stress_test_payment: monthlyMortgagePayment * 1.1
    },
    revenue: {
      gross_monthly_rent: totalMonthlyRent,
      other_monthly_income: inputs.other_income || 0,
      total_monthly_income: totalMonthlyRent + (inputs.other_income || 0),
      vacancy_loss_monthly: totalMonthlyRent * (inputs.vacancy_rate / 100),
      effective_monthly_income: totalMonthlyRent * (1 - inputs.vacancy_rate / 100),
      annual_gross_income: totalMonthlyRent * 12,
      annual_effective_income: totalMonthlyRent * 12 * (1 - inputs.vacancy_rate / 100)
    },
    expenses: {
      monthly: {
        mortgage: monthlyMortgagePayment,
        property_tax: inputs.property_tax_annual / 12,
        insurance: inputs.insurance_annual / 12,
        property_management: totalMonthlyRent * (inputs.property_management_percent / 100),
        maintenance: totalMonthlyRent * (inputs.maintenance_percent / 100),
        utilities: inputs.utilities_monthly || 0,
        hoa_fees: inputs.hoa_condo_fees_monthly || 0,
        other: inputs.other_expenses_monthly || 0,
        total: totalMonthlyExpenses
      },
      annual: {
        mortgage: monthlyMortgagePayment * 12,
        property_tax: inputs.property_tax_annual,
        insurance: inputs.insurance_annual,
        property_management: totalMonthlyRent * 12 * (inputs.property_management_percent / 100),
        maintenance: totalMonthlyRent * 12 * (inputs.maintenance_percent / 100),
        utilities: (inputs.utilities_monthly || 0) * 12,
        hoa_fees: (inputs.hoa_condo_fees_monthly || 0) * 12,
        other: (inputs.other_expenses_monthly || 0) * 12,
        total: totalMonthlyExpenses * 12
      }
    },
    cash_flow: {
      monthly_net: monthlyCashFlow,
      annual_net: annualCashFlow,
      monthly_before_debt: totalMonthlyRent - monthlyOperatingExpenses,
      annual_noi: (totalMonthlyRent - monthlyOperatingExpenses) * 12
    },
    metrics: {
      cash_on_cash_return: cashOnCashReturn,
      cap_rate: capRate,
      dscr: monthlyMortgagePayment > 0 ? totalMonthlyRent / monthlyMortgagePayment : 0,
      grm: purchasePrice > 0 ? purchasePrice / (totalMonthlyRent * 12) : 0,
      expense_ratio: totalMonthlyRent > 0 ? (monthlyOperatingExpenses / totalMonthlyRent) * 100 : 0,
      breakeven_occupancy: totalMonthlyRent > 0 ? (totalMonthlyExpenses / totalMonthlyRent) * 100 : 0
    },
    market_comparison: {
      market_avg_cap_rate: 5.5, // Default
      cap_rate_vs_market: capRate >= 5.5 ? 'Above Market' : 'Below Market',
      market_avg_rent_to_price: 0.006, // Default 0.6%
      deal_rent_to_price: purchasePrice > 0 ? (totalMonthlyRent * 12) / purchasePrice : 0,
      rent_to_price_vs_market: 'Market Rate' // Simplified
    },
    scoring: {
      total_score: 50, // Neutral score
      grade: 'C' as const,
      color: 'yellow',
      reasons: ['Small multifamily analysis']
    },
    warnings: [],
    flags: {
      negative_cash_flow: monthlyCashFlow < 0,
      low_dscr: (totalMonthlyRent / monthlyMortgagePayment) < 1.2,
      below_market_cap_rate: capRate < 4,
      high_ltv: (mortgageAmount / purchasePrice) > 0.8,
      fails_stress_test: false // Simplified
    }
  };
}