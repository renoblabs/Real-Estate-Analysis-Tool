// REI OPS™ - Market Analysis Engine for Multi-Family Development

import type {
  MultiFamilyInputs,
  MarketAnalysis,
  RentAnalysis,
  MarketComparable,
  UnitType,
  MultiFamilyUnit
} from '@/types';

/**
 * Main market analysis function
 */
export function analyzeMarket(inputs: MultiFamilyInputs): MarketAnalysis {
  const rent_analysis_by_unit = analyzeRentsByUnitType(inputs);
  const overall_market_score = calculateOverallMarketScore(inputs, rent_analysis_by_unit);
  const demand_indicators = assessDemandIndicators(inputs);
  const location_factors = assessLocationFactors(inputs);

  return {
    rent_analysis_by_unit,
    overall_market_score,
    demand_indicators,
    location_factors
  };
}

/**
 * Analyze market rents by unit type
 */
function analyzeRentsByUnitType(inputs: MultiFamilyInputs): Record<UnitType, RentAnalysis> {
  const analysis: Record<UnitType, RentAnalysis> = {} as Record<UnitType, RentAnalysis>;

  for (const unit of inputs.target_units) {
    const comparables = inputs.comparable_rents.filter(comp => comp.unit_type === unit.unit_type);
    
    if (comparables.length === 0) {
      // Use estimated rents if no comparables available
      analysis[unit.unit_type] = estimateRentAnalysis(unit);
    } else {
      analysis[unit.unit_type] = analyzeUnitRents(unit, comparables);
    }
  }

  return analysis;
}

/**
 * Analyze rents for a specific unit type
 */
function analyzeUnitRents(unit: MultiFamilyUnit, comparables: MarketComparable[]): RentAnalysis {
  // Sort comparables by rent
  const sortedRents = comparables.map(c => c.rent).sort((a, b) => a - b);
  
  // Calculate market rent range
  const market_rent_range = {
    low: sortedRents[0] || 0,
    average: sortedRents.length > 0 ? 
      sortedRents.reduce((sum, rent) => sum + rent, 0) / sortedRents.length : 0,
    high: sortedRents[sortedRents.length - 1] || 0
  };

  // Calculate weighted average based on distance and property age
  const weighted_market_rent = calculateWeightedMarketRent(comparables);

  // Analyze target rent vs market
  const target_rent = unit.target_rent;
  const rent_premium_discount = ((target_rent - weighted_market_rent) / weighted_market_rent) * 100;

  // Calculate per square foot metrics
  const rent_per_sqft = target_rent / unit.square_feet;
  const market_rent_per_sqft = weighted_market_rent / unit.square_feet;

  return {
    market_rent_range,
    target_rent,
    rent_premium_discount,
    rent_per_sqft,
    market_rent_per_sqft
  };
}

/**
 * Calculate weighted market rent based on comparable quality
 */
function calculateWeightedMarketRent(comparables: MarketComparable[]): number {
  if (comparables.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const comp of comparables) {
    // Weight based on distance (closer = higher weight)
    const distanceWeight = Math.max(0.1, 1 / (1 + comp.distance_km * 0.5));
    
    // Weight based on age (newer = higher weight for new construction)
    const ageWeight = Math.max(0.3, 1 / (1 + comp.age_years * 0.1));
    
    // Weight based on size similarity
    const sizeWeight = 1; // Could be enhanced with size comparison
    
    const totalItemWeight = distanceWeight * ageWeight * sizeWeight;
    
    weightedSum += comp.rent * totalItemWeight;
    totalWeight += totalItemWeight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Estimate rent analysis when no comparables are available
 */
function estimateRentAnalysis(unit: MultiFamilyUnit): RentAnalysis {
  // Use general market estimates based on unit type and size
  const estimatedRentPerSqft = getEstimatedRentPerSqft(unit.unit_type);
  const estimated_market_rent = estimatedRentPerSqft * unit.square_feet;

  const market_rent_range = {
    low: estimated_market_rent * 0.85,
    average: estimated_market_rent,
    high: estimated_market_rent * 1.15
  };

  const target_rent = unit.target_rent;
  const rent_premium_discount = ((target_rent - estimated_market_rent) / estimated_market_rent) * 100;

  return {
    market_rent_range,
    target_rent,
    rent_premium_discount,
    rent_per_sqft: target_rent / unit.square_feet,
    market_rent_per_sqft: estimatedRentPerSqft
  };
}

/**
 * Get estimated rent per square foot by unit type
 */
function getEstimatedRentPerSqft(unitType: UnitType): number {
  // Average rent per sqft in Canadian markets (CAD)
  const rentPerSqft = {
    studio: 2.8,
    '1br': 2.6,
    '2br': 2.4,
    '3br': 2.2,
    '4br': 2.0
  };

  return rentPerSqft[unitType] || 2.4;
}

/**
 * Assess demand indicators
 */
function assessDemandIndicators(inputs: MultiFamilyInputs): {
  vacancy_rate: number;
  rent_growth_trend: number;
  competition_level: 'low' | 'moderate' | 'high';
} {
  const vacancy_rate = inputs.market_vacancy_rate || 0.05; // 5% default
  const rent_growth_trend = inputs.rent_growth_projection || 0.03; // 3% default

  // Assess competition level based on vacancy rate
  let competition_level: 'low' | 'moderate' | 'high';
  if (vacancy_rate < 0.03) {
    competition_level = 'low'; // Low vacancy = high demand, low competition
  } else if (vacancy_rate < 0.07) {
    competition_level = 'moderate';
  } else {
    competition_level = 'high'; // High vacancy = low demand, high competition
  }

  return {
    vacancy_rate,
    rent_growth_trend,
    competition_level
  };
}

/**
 * Assess location factors
 */
function assessLocationFactors(inputs: MultiFamilyInputs): {
  transit_score: number;
  amenity_score: number;
  school_district_rating: number;
} {
  // These would ideally be calculated from real data sources
  // For now, we'll use estimated scores based on city/province
  
  const transit_score = estimateTransitScore(inputs.city, inputs.province);
  const amenity_score = estimateAmenityScore(inputs.city, inputs.province);
  const school_district_rating = estimateSchoolRating(inputs.city, inputs.province);

  return {
    transit_score,
    amenity_score,
    school_district_rating
  };
}

/**
 * Estimate transit score based on location
 */
function estimateTransitScore(city: string, province: string): number {
  // Major cities typically have better transit
  const majorCities = ['toronto', 'vancouver', 'montreal', 'calgary', 'ottawa', 'edmonton'];
  const cityLower = city.toLowerCase();

  if (majorCities.includes(cityLower)) {
    return Math.random() * 2 + 8; // 8-10 for major cities
  } else if (province === 'ON' || province === 'BC') {
    return Math.random() * 3 + 6; // 6-9 for other cities in major provinces
  } else {
    return Math.random() * 4 + 4; // 4-8 for smaller markets
  }
}

/**
 * Estimate amenity score based on location
 */
function estimateAmenityScore(city: string, province: string): number {
  const cityLower = city.toLowerCase();
  
  // Urban centers typically have more amenities
  if (['toronto', 'vancouver', 'montreal'].includes(cityLower)) {
    return Math.random() * 1.5 + 8.5; // 8.5-10 for major metros
  } else if (['calgary', 'ottawa', 'edmonton', 'winnipeg'].includes(cityLower)) {
    return Math.random() * 2 + 7; // 7-9 for secondary cities
  } else {
    return Math.random() * 3 + 5; // 5-8 for smaller cities
  }
}

/**
 * Estimate school district rating
 */
function estimateSchoolRating(city: string, province: string): number {
  // Ontario and BC generally have well-regarded school systems
  if (province === 'ON' || province === 'BC') {
    return Math.random() * 2 + 7; // 7-9
  } else if (province === 'AB') {
    return Math.random() * 2.5 + 6.5; // 6.5-9
  } else {
    return Math.random() * 3 + 6; // 6-9
  }
}

/**
 * Calculate overall market score
 */
function calculateOverallMarketScore(
  inputs: MultiFamilyInputs, 
  rent_analysis: Record<UnitType, RentAnalysis>
): number {
  let totalScore = 0;
  let factors = 0;

  // Rent competitiveness (30% weight)
  const avgRentPremium = Object.values(rent_analysis).reduce((sum, analysis) => {
    return sum + Math.abs(analysis.rent_premium_discount);
  }, 0) / Object.values(rent_analysis).length;

  const rentScore = Math.max(0, 10 - (avgRentPremium / 5)); // Lower premium = higher score
  totalScore += rentScore * 0.3;
  factors += 0.3;

  // Vacancy rate (25% weight)
  const vacancy_rate = inputs.market_vacancy_rate || 0.05;
  const vacancyScore = Math.max(0, 10 - (vacancy_rate * 100)); // Lower vacancy = higher score
  totalScore += vacancyScore * 0.25;
  factors += 0.25;

  // Rent growth (20% weight)
  const rent_growth = inputs.rent_growth_projection || 0.03;
  const growthScore = Math.min(10, rent_growth * 200); // Higher growth = higher score
  totalScore += growthScore * 0.2;
  factors += 0.2;

  // Location factors (25% weight)
  const location_factors = assessLocationFactors(inputs);
  const locationScore = (location_factors.transit_score + location_factors.amenity_score + 
                        location_factors.school_district_rating) / 3;
  totalScore += locationScore * 0.25;
  factors += 0.25;

  return Math.round((totalScore / factors) * 10) / 10; // Round to 1 decimal
}

/**
 * Generate market insights and recommendations
 */
export function generateMarketInsights(
  inputs: MultiFamilyInputs, 
  analysis: MarketAnalysis
): string[] {
  const insights: string[] = [];

  // Overall market assessment
  if (analysis.overall_market_score >= 8) {
    insights.push("🟢 Excellent market conditions for multi-family development");
  } else if (analysis.overall_market_score >= 6) {
    insights.push("🟡 Good market conditions with some considerations");
  } else {
    insights.push("🔴 Challenging market conditions - proceed with caution");
  }

  // Vacancy rate insights
  const vacancy = analysis.demand_indicators.vacancy_rate;
  if (vacancy < 0.03) {
    insights.push("🏠 Very low vacancy rate indicates strong rental demand");
  } else if (vacancy > 0.08) {
    insights.push("⚠️ High vacancy rate suggests oversupply or weak demand");
  }

  // Rent growth insights
  const growth = analysis.demand_indicators.rent_growth_trend;
  if (growth > 0.05) {
    insights.push("📈 Strong rent growth trend supports development");
  } else if (growth < 0.02) {
    insights.push("📉 Slow rent growth may impact long-term returns");
  }

  // Unit-specific insights
  for (const [unitType, rentAnalysis] of Object.entries(analysis.rent_analysis_by_unit)) {
    if (rentAnalysis.rent_premium_discount > 10) {
      insights.push(`💰 ${unitType} units priced at significant premium to market`);
    } else if (rentAnalysis.rent_premium_discount < -10) {
      insights.push(`💡 ${unitType} units priced below market - opportunity for higher rents`);
    }
  }

  return insights;
}

/**
 * Identify optimal unit mix based on market analysis
 */
export function optimizeUnitMix(inputs: MultiFamilyInputs, analysis: MarketAnalysis): {
  recommended_mix: Record<UnitType, number>;
  reasoning: string[];
} {
  const reasoning: string[] = [];
  const recommended_mix: Record<UnitType, number> = {} as Record<UnitType, number>;

  // Analyze rent per sqft efficiency
  const rentEfficiency: Array<{unitType: UnitType, efficiency: number}> = [];
  
  for (const [unitType, rentAnalysis] of Object.entries(analysis.rent_analysis_by_unit)) {
    const efficiency = rentAnalysis.rent_per_sqft;
    rentEfficiency.push({ unitType: unitType as UnitType, efficiency });
  }

  // Sort by efficiency (rent per sqft)
  rentEfficiency.sort((a, b) => b.efficiency - a.efficiency);

  // Generate recommendations based on efficiency and market conditions
  const totalUnits = inputs.target_units.length;
  
  if (analysis.demand_indicators.competition_level === 'low') {
    // Low competition - can focus on higher-efficiency units
    reasoning.push("Low competition allows focus on most profitable unit types");
    
    // Allocate 60% to top efficiency, 30% to second, 10% to third
    if (rentEfficiency.length >= 1) {
      recommended_mix[rentEfficiency[0].unitType] = Math.ceil(totalUnits * 0.6);
    }
    if (rentEfficiency.length >= 2) {
      recommended_mix[rentEfficiency[1].unitType] = Math.ceil(totalUnits * 0.3);
    }
    if (rentEfficiency.length >= 3) {
      recommended_mix[rentEfficiency[2].unitType] = Math.ceil(totalUnits * 0.1);
    }
  } else {
    // Higher competition - need more balanced mix
    reasoning.push("Moderate/high competition requires diversified unit mix");
    
    // More even distribution
    const unitsPerType = Math.floor(totalUnits / rentEfficiency.length);
    const remainder = totalUnits % rentEfficiency.length;
    
    rentEfficiency.forEach((item, index) => {
      recommended_mix[item.unitType] = unitsPerType + (index < remainder ? 1 : 0);
    });
  }

  return { recommended_mix, reasoning };
}