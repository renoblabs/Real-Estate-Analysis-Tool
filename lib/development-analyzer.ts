// REI OPS™ - Multi-Family Development Analysis Engine

import type {
  MultiFamilyInputs,
  DevelopmentAnalysis,
  ConstructionCosts,
  SoftCosts,
  DevelopmentFinancing,
  ConstructionTimeline,
  UnitType
} from '@/types';

// Construction cost constants (per sq ft in CAD)
const CONSTRUCTION_COSTS_PER_SQFT = {
  new_build: {
    studio: 180,
    '1br': 175,
    '2br': 170,
    '3br': 165,
    '4br': 160
  },
  gut_renovation: {
    studio: 140,
    '1br': 135,
    '2br': 130,
    '3br': 125,
    '4br': 120
  },
  heavy: {
    studio: 100,
    '1br': 95,
    '2br': 90,
    '3br': 85,
    '4br': 80
  },
  moderate: {
    studio: 60,
    '1br': 55,
    '2br': 50,
    '3br': 45,
    '4br': 40
  },
  cosmetic: {
    studio: 25,
    '1br': 22,
    '2br': 20,
    '3br': 18,
    '4br': 15
  }
};

// Soft cost percentages
const SOFT_COST_PERCENTAGES = {
  architect_engineer: 0.08, // 8% of construction costs
  legal_fees: 0.02, // 2% of total project
  development_management: 0.05, // 5% of construction costs
  financing_costs: 0.03, // 3% of total project (interest during construction)
  marketing_leasing: 0.02, // 2% of construction costs
  contingency: 0.15 // 15% of hard costs
};

/**
 * Main development analysis function
 */
export function analyzeDevelopment(inputs: MultiFamilyInputs): DevelopmentAnalysis {
  const construction_costs = calculateConstructionCosts(inputs);
  const soft_costs = calculateSoftCosts(inputs, construction_costs);
  const total_development_cost = construction_costs.total_hard_costs + soft_costs.total_soft_costs;
  const cost_per_unit = total_development_cost / inputs.target_units.length;
  const total_sqft = inputs.target_units.reduce((sum, unit) => sum + unit.square_feet, 0);
  const cost_per_sqft = total_development_cost / total_sqft;
  const timeline_months = estimateConstructionTimeline(inputs);
  const financing_needs = calculateDevelopmentFinancing(inputs, total_development_cost, timeline_months);

  return {
    construction_costs,
    soft_costs,
    total_development_cost,
    cost_per_unit,
    cost_per_sqft,
    timeline_months,
    financing_needs
  };
}

/**
 * Calculate construction costs breakdown
 */
function calculateConstructionCosts(inputs: MultiFamilyInputs): ConstructionCosts {
  let base_construction = 0;

  // Calculate construction cost per unit based on type and scope
  for (const unit of inputs.target_units) {
    const costPerSqft = inputs.construction_cost_per_sqft || 
      CONSTRUCTION_COSTS_PER_SQFT[inputs.renovation_scope]?.[unit.unit_type] || 
      CONSTRUCTION_COSTS_PER_SQFT.moderate[unit.unit_type];
    
    base_construction += unit.square_feet * costPerSqft;
  }

  // Site preparation costs
  const site_preparation = inputs.site_preparation_cost || (base_construction * 0.1); // 10% default

  // Permits and approvals
  const permits_approvals = inputs.permit_costs || (base_construction * 0.05); // 5% default

  // Utilities connections (water, sewer, electrical, gas)
  const utilities_connections = calculateUtilitiesConnections(inputs);

  // Landscaping and exterior work
  const landscaping = base_construction * 0.03; // 3% of construction

  const total_hard_costs = base_construction + site_preparation + permits_approvals + 
                          utilities_connections + landscaping;

  return {
    base_construction,
    site_preparation,
    permits_approvals,
    utilities_connections,
    landscaping,
    total_hard_costs
  };
}

/**
 * Calculate soft costs
 */
function calculateSoftCosts(inputs: MultiFamilyInputs, construction_costs: ConstructionCosts): SoftCosts {
  const hard_costs = construction_costs.total_hard_costs;

  const architect_engineer = inputs.architect_engineer_fees || 
    (hard_costs * SOFT_COST_PERCENTAGES.architect_engineer);

  const legal_fees = hard_costs * SOFT_COST_PERCENTAGES.legal_fees;

  const development_management = hard_costs * SOFT_COST_PERCENTAGES.development_management;

  const financing_costs = hard_costs * SOFT_COST_PERCENTAGES.financing_costs;

  const marketing_leasing = hard_costs * SOFT_COST_PERCENTAGES.marketing_leasing;

  const contingency = hard_costs * SOFT_COST_PERCENTAGES.contingency;

  const total_soft_costs = architect_engineer + legal_fees + development_management + 
                          financing_costs + marketing_leasing + contingency;

  return {
    architect_engineer,
    legal_fees,
    development_management,
    financing_costs,
    marketing_leasing,
    contingency,
    total_soft_costs
  };
}

/**
 * Calculate utilities connection costs
 */
function calculateUtilitiesConnections(inputs: MultiFamilyInputs): number {
  const unitCount = inputs.target_units.length;
  
  // Base costs per unit for utilities connections
  const baseUtilityCost = 8000; // $8,000 per unit for basic connections
  
  // Additional costs for new construction vs renovation
  const multiplier = inputs.development_type === 'raw_land' ? 1.5 : 
                    inputs.development_type === 'new_construction' ? 1.2 : 0.8;
  
  return unitCount * baseUtilityCost * multiplier;
}

/**
 * Estimate construction timeline
 */
function estimateConstructionTimeline(inputs: MultiFamilyInputs): number {
  const unitCount = inputs.target_units.length;
  const totalSqft = inputs.target_units.reduce((sum, unit) => sum + unit.square_feet, 0);

  let baseMonths = 0;

  // Base timeline by development type
  switch (inputs.development_type) {
    case 'raw_land':
      baseMonths = 18; // 18 months for new construction from raw land
      break;
    case 'new_construction':
      baseMonths = 12; // 12 months for new construction on prepared site
      break;
    case 'existing_structure':
      baseMonths = 8; // 8 months for renovation
      break;
  }

  // Adjust for renovation scope
  const scopeMultiplier = {
    cosmetic: 0.5,
    moderate: 0.7,
    heavy: 1.0,
    gut_renovation: 1.3,
    new_build: 1.5
  }[inputs.renovation_scope] || 1.0;

  // Adjust for size (more units = longer timeline)
  const sizeMultiplier = 1 + (unitCount - 2) * 0.1; // +10% per unit above 2

  // Adjust for complexity (larger units = more complex)
  const complexityMultiplier = 1 + (totalSqft - 2000) / 10000; // +10% per 1000 sqft above 2000

  const estimatedMonths = Math.ceil(baseMonths * scopeMultiplier * sizeMultiplier * complexityMultiplier);

  // Minimum 3 months, maximum 36 months
  return Math.max(3, Math.min(36, estimatedMonths));
}

/**
 * Calculate development financing needs
 */
function calculateDevelopmentFinancing(
  inputs: MultiFamilyInputs, 
  total_project_cost: number, 
  timeline_months: number
): DevelopmentFinancing {
  // Add land cost if applicable
  const land_cost = inputs.land_cost || 0;
  const total_cost_with_land = total_project_cost + land_cost;

  // Typical development financing structure
  const equity_percentage = 0.25; // 25% equity requirement
  const equity_required = total_cost_with_land * equity_percentage;

  // Construction loan covers remaining costs
  const construction_loan_amount = total_cost_with_land - equity_required;

  // Interest during construction (assume 7% annual rate)
  const construction_interest_rate = 0.07;
  const interest_during_construction = construction_loan_amount * 
    (construction_interest_rate / 12) * timeline_months;

  // Permanent financing (after construction completion)
  // Assume 80% LTV on completed value
  const estimated_completed_value = calculateEstimatedCompletedValue(inputs);
  const permanent_financing = estimated_completed_value * 0.8;

  return {
    total_project_cost: total_cost_with_land,
    equity_required,
    construction_loan_amount,
    permanent_financing,
    interest_during_construction
  };
}

/**
 * Estimate completed property value based on rental income
 */
function calculateEstimatedCompletedValue(inputs: MultiFamilyInputs): number {
  // Calculate total annual rental income
  const annual_rental_income = inputs.target_units.reduce((sum, unit) => {
    return sum + (unit.target_rent * 12);
  }, 0);

  // Apply vacancy rate
  const vacancy_rate = inputs.market_vacancy_rate || 0.05; // 5% default
  const effective_annual_income = annual_rental_income * (1 - vacancy_rate);

  // Estimate operating expenses (40% of effective income is typical)
  const operating_expense_ratio = 0.40;
  const net_operating_income = effective_annual_income * (1 - operating_expense_ratio);

  // Apply cap rate to determine value (6% cap rate typical for new construction)
  const cap_rate = 0.06;
  const estimated_value = net_operating_income / cap_rate;

  return estimated_value;
}

/**
 * Create construction timeline with milestones
 */
export function createConstructionTimeline(inputs: MultiFamilyInputs): ConstructionTimeline {
  const total_months = estimateConstructionTimeline(inputs);
  
  // Phase breakdown
  const planning_phase_months = Math.ceil(total_months * 0.2); // 20% planning
  const construction_phase_months = Math.ceil(total_months * 0.7); // 70% construction
  const leasing_phase_months = Math.ceil(total_months * 0.1); // 10% leasing overlap

  // Key milestones (months from start)
  const permits_approved = planning_phase_months;
  const construction_start = permits_approved;
  const construction_complete = construction_start + construction_phase_months;
  const first_tenant = construction_complete - 1; // Start leasing 1 month before completion
  const stabilized_occupancy = construction_complete + 3; // 3 months to reach 90% occupancy

  return {
    planning_phase_months,
    construction_phase_months,
    leasing_phase_months,
    total_timeline_months: total_months,
    key_milestones: {
      permits_approved,
      construction_start,
      construction_complete,
      first_tenant,
      stabilized_occupancy
    }
  };
}

/**
 * Calculate cost per unit by unit type
 */
export function calculateCostPerUnitType(inputs: MultiFamilyInputs): Record<UnitType, number> {
  const costs: Record<UnitType, number> = {} as Record<UnitType, number>;

  for (const unit of inputs.target_units) {
    const costPerSqft = inputs.construction_cost_per_sqft || 
      CONSTRUCTION_COSTS_PER_SQFT[inputs.renovation_scope]?.[unit.unit_type] || 
      CONSTRUCTION_COSTS_PER_SQFT.moderate[unit.unit_type];
    
    costs[unit.unit_type] = unit.square_feet * costPerSqft;
  }

  return costs;
}