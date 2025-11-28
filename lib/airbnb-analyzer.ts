// REI OPS™ - Airbnb/Short-Term Rental Analysis

import type { PropertyInputs, DealAnalysis } from '@/types';
import { analyzeDeal } from '@/lib/deal-analyzer';

export interface AirbnbInputs {
  average_daily_rate: number; // ADR
  occupancy_rate: number; // Annual occupancy %
  cleaning_fee_per_booking: number;
  average_length_of_stay: number; // Days
  bookings_per_month: number; // Estimated

  // STR-specific expenses
  cleaning_cost_per_booking: number;
  utilities_included: boolean;
  furnishing_cost: number; // One-time
  monthly_utilities: number; // Higher for STR
  platform_fees_percent: number; // Airbnb/VRBO fee (typically 3%)
  extra_insurance_annual: number; // STR insurance premium
  supplies_monthly: number; // Toiletries, linens, etc.
  management_percent: number; // STR management (20-30% typical)
}

export interface AirbnbAnalysis {
  // Revenue
  gross_rental_income: number;
  cleaning_fees_collected: number;
  total_gross_revenue: number;

  // Expenses
  platform_fees: number;
  cleaning_costs: number;
  utilities_cost: number;
  supplies_cost: number;
  management_fee: number;
  extra_insurance: number;
  total_str_expenses: number;

  // Net Revenue
  net_revenue_before_mortgage: number;
  annual_mortgage_payment: number;
  net_cash_flow: number;
  monthly_average_cash_flow: number;

  // Metrics
  occupancy_rate: number;
  average_daily_rate: number;
  revenue_per_available_night: number; // RevPAR
  annual_bookings: number;
  average_revenue_per_booking: number;

  // Comparison to Long-Term Rental
  long_term_analysis: DealAnalysis;
  str_vs_ltr_cash_flow_difference: number;
  str_vs_ltr_percentage_increase: number;
  break_even_occupancy: number; // Occupancy needed to match LTR

  // ROI
  initial_investment: number; // Including furnishing
  first_year_coc_return: number;

  // Risks
  seasonal_variance_risk: 'Low' | 'Medium' | 'High';
  regulatory_risk: 'Low' | 'Medium' | 'High';
  management_intensity: 'Low' | 'Medium' | 'High';
}

/**
 * Analyze Airbnb/STR potential
 */
export function analyzeAirbnb(
  propertyInputs: PropertyInputs,
  airbnbInputs: AirbnbInputs,
  baseAnalysis: DealAnalysis
): AirbnbAnalysis {
  // Calculate Revenue
  const nights_per_year = 365;
  const occupied_nights = nights_per_year * (airbnbInputs.occupancy_rate / 100);
  const annual_bookings = airbnbInputs.bookings_per_month * 12;

  const gross_rental_income = airbnbInputs.average_daily_rate * occupied_nights;
  const cleaning_fees_collected = airbnbInputs.cleaning_fee_per_booking * annual_bookings;
  const total_gross_revenue = gross_rental_income + cleaning_fees_collected;

  // Calculate Expenses
  const platform_fees = total_gross_revenue * (airbnbInputs.platform_fees_percent / 100);
  const cleaning_costs = airbnbInputs.cleaning_cost_per_booking * annual_bookings;
  const utilities_cost = airbnbInputs.monthly_utilities * 12;
  const supplies_cost = airbnbInputs.supplies_monthly * 12;
  const management_fee = total_gross_revenue * (airbnbInputs.management_percent / 100);
  const extra_insurance = airbnbInputs.extra_insurance_annual;

  const total_str_expenses =
    platform_fees +
    cleaning_costs +
    utilities_cost +
    supplies_cost +
    management_fee +
    extra_insurance +
    baseAnalysis.expenses.annual.property_tax +
    baseAnalysis.expenses.annual.insurance; // Base insurance

  // Net Revenue
  const net_revenue_before_mortgage = total_gross_revenue - total_str_expenses;
  const annual_mortgage_payment = baseAnalysis.expenses.annual.mortgage;
  const net_cash_flow = net_revenue_before_mortgage - annual_mortgage_payment;
  const monthly_average_cash_flow = net_cash_flow / 12;

  // Metrics
  const revenue_per_available_night = gross_rental_income / nights_per_year;
  const average_revenue_per_booking = total_gross_revenue / annual_bookings;

  // Comparison to Long-Term Rental
  const long_term_analysis = baseAnalysis;
  const str_vs_ltr_cash_flow_difference = net_cash_flow - long_term_analysis.cash_flow.annual_net;
  const str_vs_ltr_percentage_increase =
    (str_vs_ltr_cash_flow_difference / Math.abs(long_term_analysis.cash_flow.annual_net)) * 100;

  // Break-even occupancy (to match LTR cash flow)
  const ltr_net_revenue = long_term_analysis.revenue.annual_gross_income -
    (long_term_analysis.expenses.annual.total - annual_mortgage_payment);
  const daily_profit = airbnbInputs.average_daily_rate -
    (total_str_expenses / occupied_nights);
  const break_even_nights = ltr_net_revenue / daily_profit;
  const break_even_occupancy = Math.min((break_even_nights / nights_per_year) * 100, 100);

  // ROI
  const initial_investment = baseAnalysis.acquisition.total_acquisition_cost + airbnbInputs.furnishing_cost;
  const first_year_coc_return = (net_cash_flow / initial_investment) * 100;

  // Risk Assessment
  const seasonal_variance_risk = assessSeasonalRisk(airbnbInputs.occupancy_rate);
  const regulatory_risk = assessRegulatoryRisk(propertyInputs.city);
  const management_intensity = assessManagementIntensity(airbnbInputs.average_length_of_stay);

  return {
    gross_rental_income,
    cleaning_fees_collected,
    total_gross_revenue,
    platform_fees,
    cleaning_costs,
    utilities_cost,
    supplies_cost,
    management_fee,
    extra_insurance,
    total_str_expenses,
    net_revenue_before_mortgage,
    annual_mortgage_payment,
    net_cash_flow,
    monthly_average_cash_flow,
    occupancy_rate: airbnbInputs.occupancy_rate,
    average_daily_rate: airbnbInputs.average_daily_rate,
    revenue_per_available_night,
    annual_bookings,
    average_revenue_per_booking,
    long_term_analysis,
    str_vs_ltr_cash_flow_difference,
    str_vs_ltr_percentage_increase,
    break_even_occupancy,
    initial_investment,
    first_year_coc_return,
    seasonal_variance_risk,
    regulatory_risk,
    management_intensity,
  };
}

function assessSeasonalRisk(occupancy: number): 'Low' | 'Medium' | 'High' {
  // Higher occupancy = more consistent demand = lower seasonal risk
  if (occupancy >= 75) return 'Low';
  if (occupancy >= 55) return 'Medium';
  return 'High';
}

function assessRegulatoryRisk(city: string): 'Low' | 'Medium' | 'High' {
  // Cities with known STR restrictions
  const highRiskCities = ['Toronto', 'Vancouver', 'Montreal'];
  const mediumRiskCities = ['Calgary', 'Ottawa', 'Quebec City'];

  if (highRiskCities.includes(city)) return 'High';
  if (mediumRiskCities.includes(city)) return 'Medium';
  return 'Low';
}

function assessManagementIntensity(avgStay: number): 'Low' | 'Medium' | 'High' {
  // Longer stays = less turnover = lower management intensity
  if (avgStay >= 7) return 'Low';
  if (avgStay >= 3) return 'Medium';
  return 'High';
}

/**
 * Calculate optimal pricing strategy
 */
export interface PricingStrategy {
  base_rate: number;
  weekend_rate: number; // +20% typical
  peak_season_rate: number; // +40% typical
  off_season_rate: number; // -20% typical
  last_minute_discount: number; // -15% typical
  weekly_discount_percent: number;
  monthly_discount_percent: number;

  estimated_average_rate: number;
}

export function calculateOptimalPricing(
  baseRate: number,
  market: 'urban' | 'resort' | 'suburban' = 'urban'
): PricingStrategy {
  const multipliers = {
    urban: { weekend: 1.15, peak: 1.30, off: 0.90 },
    resort: { weekend: 1.25, peak: 1.50, off: 0.75 },
    suburban: { weekend: 1.10, peak: 1.20, off: 0.95 },
  };

  const m = multipliers[market];

  return {
    base_rate: baseRate,
    weekend_rate: baseRate * m.weekend,
    peak_season_rate: baseRate * m.peak,
    off_season_rate: baseRate * m.off,
    last_minute_discount: baseRate * 0.85,
    weekly_discount_percent: 10,
    monthly_discount_percent: 20,
    estimated_average_rate: baseRate * 1.05, // Slight premium on average
  };
}

/**
 * Calculate seasonality impact
 */
export interface SeasonalProjection {
  month: string;
  occupancy: number;
  adr: number;
  revenue: number;
  days: number;
}

export function calculateSeasonalProjections(
  baseADR: number,
  baseOccupancy: number,
  market: 'urban' | 'resort' | 'suburban' = 'urban'
): SeasonalProjection[] {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Seasonal multipliers by market type
  const seasonality = {
    urban: [0.85, 0.85, 0.95, 1.00, 1.10, 1.15, 1.20, 1.10, 1.05, 1.00, 0.90, 0.85],
    resort: [0.70, 0.70, 0.80, 0.90, 1.00, 1.20, 1.40, 1.40, 1.10, 0.90, 0.80, 1.00],
    suburban: [0.80, 0.80, 0.90, 1.00, 1.10, 1.20, 1.20, 1.15, 1.05, 0.95, 0.85, 0.90],
  };

  const multipliers = seasonality[market];

  return months.map((month, index) => {
    const occupancy = Math.min(baseOccupancy * multipliers[index], 100);
    const adr = baseADR * multipliers[index];
    const days = daysInMonth[index];
    const revenue = adr * days * (occupancy / 100);

    return {
      month,
      occupancy,
      adr,
      revenue,
      days,
    };
  });
}

/**
 * Generate STR market benchmarks
 */
export interface STRBenchmarks {
  city: string;
  average_adr: number;
  average_occupancy: number;
  average_revenue_per_month: number;
  competition_level: 'Low' | 'Medium' | 'High';
  best_property_types: string[];
}

export const STR_MARKET_BENCHMARKS: Record<string, STRBenchmarks> = {
  Toronto: {
    city: 'Toronto',
    average_adr: 180,
    average_occupancy: 65,
    average_revenue_per_month: 3510,
    competition_level: 'High',
    best_property_types: ['Condo', 'Downtown Loft', 'Entire Home'],
  },
  Vancouver: {
    city: 'Vancouver',
    average_adr: 200,
    average_occupancy: 70,
    average_revenue_per_month: 4200,
    competition_level: 'High',
    best_property_types: ['Condo', 'Waterfront', 'Mountain View'],
  },
  Montreal: {
    city: 'Montreal',
    average_adr: 140,
    average_occupancy: 68,
    average_revenue_per_month: 2856,
    competition_level: 'Medium',
    best_property_types: ['Old Montreal', 'Plateau', 'Downtown'],
  },
  Calgary: {
    city: 'Calgary',
    average_adr: 130,
    average_occupancy: 60,
    average_revenue_per_month: 2340,
    competition_level: 'Medium',
    best_property_types: ['Downtown', 'Near Stampede', 'Beltline'],
  },
  'Quebec City': {
    city: 'Quebec City',
    average_adr: 150,
    average_occupancy: 72,
    average_revenue_per_month: 3240,
    competition_level: 'Low',
    best_property_types: ['Old Quebec', 'Near Chateau', 'Historic District'],
  },
  Ottawa: {
    city: 'Ottawa',
    average_adr: 135,
    average_occupancy: 62,
    average_revenue_per_month: 2511,
    competition_level: 'Medium',
    best_property_types: ['ByWard Market', 'Glebe', 'Downtown'],
  },
  Whistler: {
    city: 'Whistler',
    average_adr: 350,
    average_occupancy: 75,
    average_revenue_per_month: 7875,
    competition_level: 'High',
    best_property_types: ['Ski-in/Ski-out', 'Village', 'Creekside'],
  },
  'Niagara Falls': {
    city: 'Niagara Falls',
    average_adr: 160,
    average_occupancy: 70,
    average_revenue_per_month: 3360,
    competition_level: 'Medium',
    best_property_types: ['Near Falls', 'Clifton Hill', 'Winery'],
  },
};
