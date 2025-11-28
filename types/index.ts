// REI OPS™ - TypeScript Type Definitions

export type Province = 'ON' | 'BC' | 'AB' | 'NS' | 'QC';
export type PropertyType = 'single_family' | 'duplex' | 'triplex' | 'fourplex' | 'multi_unit_5plus';
export type Strategy = 'brrrr' | 'buy_hold' | 'fix_flip' | 'multifamily_development';
export type PropertyCondition = 'move_in_ready' | 'cosmetic' | 'moderate_reno' | 'heavy_reno' | 'gut_job';
export type InvestorType = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
export type DealStatus = 'analyzing' | 'pursuing' | 'under_contract' | 'closed' | 'passed';
export type DealGrade = 'A' | 'B' | 'C' | 'D' | 'F';

// Multi-Family Development Types
export type DevelopmentType = 'raw_land' | 'existing_structure' | 'new_construction';
export type RenovationScope = 'cosmetic' | 'moderate' | 'heavy' | 'gut_renovation' | 'new_build';
export type UnitType = 'studio' | '1br' | '2br' | '3br' | '4br';
export type AnalysisType = 'rental' | 'multifamily_development' | 'deal_sourcing';

export interface PropertyUnit {
  unit_number: string;
  bedrooms: number;
  rent: number;
}

export interface PropertyInputs {
  // Location
  address: string;
  city: string;
  province: Province;
  postal_code?: string;

  // Property Details
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built?: number;
  lot_size?: number;

  // Financial Inputs
  purchase_price: number;
  down_payment_percent: number;
  down_payment_amount: number;
  interest_rate: number;
  amortization_years: number;

  // Strategy
  strategy: Strategy;

  // Condition & Renovation
  property_condition: PropertyCondition;
  renovation_cost: number;
  after_repair_value?: number;
  renovation_timeline_months?: number;

  // Revenue (Monthly)
  monthly_rent: number;
  units?: PropertyUnit[];
  other_income: number;
  vacancy_rate: number;

  // Expenses (Annual unless noted)
  property_tax_annual: number;
  insurance_annual: number;
  property_management_percent: number;
  maintenance_percent: number;
  utilities_monthly: number;
  hoa_condo_fees_monthly: number;
  other_expenses_monthly: number;

  // Closing Costs (optional overrides)
  legal_fees?: number;
  inspection_cost?: number;
  appraisal_cost?: number;

  // Optional
  is_first_time_buyer?: boolean;
}

export interface CMHCResult {
  premium: number;
  premiumRate: number;
  insuranceRequired: boolean;
  totalMortgageWithInsurance: number;
  message: string;
}

export interface LandTransferTaxResult {
  provincialTax: number;
  municipalTax: number;
  totalTax: number;
  rebate: number;
  netTax: number;
  breakdown: string[];
}

export interface StressTestResult {
  stressTestRate: number;
  qualificationPayment: number;
  contractPayment: number;
  passes: boolean;
  message: string;
}

export interface AcquisitionCosts {
  purchase_price: number;
  down_payment: number;
  land_transfer_tax: number;
  legal_fees: number;
  inspection: number;
  appraisal: number;
  other_closing_costs: number;
  total_acquisition_cost: number;
}

export interface Financing {
  mortgage_amount: number;
  cmhc_premium: number;
  total_mortgage_with_insurance: number;
  monthly_payment: number;
  annual_payment: number;
  stress_test_rate: number;
  stress_test_payment: number;
}

export interface Revenue {
  gross_monthly_rent: number;
  other_monthly_income: number;
  total_monthly_income: number;
  vacancy_loss_monthly: number;
  effective_monthly_income: number;
  annual_gross_income: number;
  annual_effective_income: number;
}

export interface MonthlyExpenses {
  mortgage: number;
  property_tax: number;
  insurance: number;
  property_management: number;
  maintenance: number;
  utilities: number;
  hoa_fees: number;
  other: number;
  total: number;
}

export interface AnnualExpenses {
  mortgage: number;
  property_tax: number;
  insurance: number;
  property_management: number;
  maintenance: number;
  utilities: number;
  hoa_fees: number;
  other: number;
  total: number;
}

export interface Expenses {
  monthly: MonthlyExpenses;
  annual: AnnualExpenses;
}

export interface CashFlow {
  monthly_net: number;
  annual_net: number;
  monthly_before_debt: number;
  annual_noi: number;
}

export interface Metrics {
  cap_rate: number;
  cash_on_cash_return: number;
  dscr: number;
  grm: number;
  expense_ratio: number;
  breakeven_occupancy: number;
}

export interface BRRRRAnalysis {
  total_investment: number;
  after_repair_value: number;
  refinance_ltv_percent: number;
  refinance_amount: number;
  original_mortgage_balance: number;
  cash_recovered: number;
  cash_left_in_deal: number;
  infinite_return: boolean;
  new_monthly_payment: number;
  cash_flow_after_refi: number;
  effective_coc_return: number | string;
}

export interface MarketComparison {
  market_avg_cap_rate: number;
  cap_rate_vs_market: string;
  market_avg_rent_to_price: number;
  deal_rent_to_price: number;
  rent_to_price_vs_market: string;
}

export interface DealScoring {
  total_score: number;
  grade: DealGrade;
  color: string;
  reasons: string[];
}

export interface DealFlags {
  negative_cash_flow: boolean;
  low_dscr: boolean;
  below_market_cap_rate: boolean;
  high_ltv: boolean;
  fails_stress_test: boolean;
}

export interface DealAnalysis {
  property: PropertyInputs;
  acquisition: AcquisitionCosts;
  financing: Financing;
  revenue: Revenue;
  expenses: Expenses;
  cash_flow: CashFlow;
  metrics: Metrics;
  brrrr?: BRRRRAnalysis;
  market_comparison: MarketComparison;
  scoring: DealScoring;
  warnings: string[];
  flags: DealFlags;
}

export interface UserPreferences {
  user_id: string;
  investor_type: InvestorType;
  default_vacancy_rate: number;
  default_pm_percent: number;
  default_maintenance_percent: number;
  target_coc_return: number;
  target_cap_rate: number;
}

export interface Deal {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // Property Information
  address: string;
  city: string;
  province: Province;
  postal_code?: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built?: number;
  lot_size?: number;

  // Financial Inputs
  purchase_price: number;
  down_payment_percent: number;
  down_payment_amount: number;
  interest_rate: number;
  amortization_years: number;

  // Strategy & Condition
  strategy: Strategy;
  property_condition: PropertyCondition;
  renovation_cost: number;
  after_repair_value?: number;

  // Revenue
  monthly_rent: number;
  other_income: number;
  vacancy_rate: number;

  // Expenses
  property_tax_annual: number;
  insurance_annual: number;
  property_management_percent: number;
  maintenance_percent: number;
  utilities_monthly: number;
  hoa_fees_monthly: number;
  other_expenses_monthly: number;

  // Calculated Outputs
  total_acquisition_cost: number;
  cmhc_premium: number;
  land_transfer_tax: number;
  mortgage_amount: number;
  monthly_mortgage_payment: number;
  monthly_cash_flow: number;
  annual_cash_flow: number;
  cash_on_cash_return: number;
  cap_rate: number;
  dscr: number;
  grm: number;
  deal_score: number;
  deal_grade: DealGrade;

  // BRRRR Specific
  brrrr_cash_left_in_deal?: number;
  brrrr_cash_recovered?: number;

  // Management
  status: DealStatus;
  notes?: string;
  is_favorite: boolean;
}

// Multi-Family Development Interfaces
export interface MultiFamilyUnit {
  unit_type: UnitType;
  square_feet: number;
  target_rent: number;
  construction_cost?: number;
  bedrooms: number;
  bathrooms: number;
}

export interface MarketComparable {
  address: string;
  unit_type: UnitType;
  rent: number;
  square_feet: number;
  distance_km: number;
  age_years: number;
  bedrooms: number;
  bathrooms: number;
}

export interface MultiFamilyInputs extends PropertyInputs {
  // Analysis Type
  analysis_type: AnalysisType;
  
  // Development Type
  development_type: DevelopmentType;
  
  // Land/Site Analysis
  land_cost?: number;
  site_preparation_cost?: number;
  zoning_compliance_cost?: number;
  
  // Construction/Renovation
  construction_cost_per_sqft?: number;
  renovation_scope: RenovationScope;
  permit_costs?: number;
  architect_engineer_fees?: number;
  
  // Unit Configuration
  target_units: MultiFamilyUnit[];
  
  // Market Analysis
  comparable_rents: MarketComparable[];
  market_vacancy_rate?: number;
  rent_growth_projection?: number;
}

export interface ConstructionCosts {
  base_construction: number;
  site_preparation: number;
  permits_approvals: number;
  utilities_connections: number;
  landscaping: number;
  total_hard_costs: number;
}

export interface SoftCosts {
  architect_engineer: number;
  legal_fees: number;
  development_management: number;
  financing_costs: number;
  marketing_leasing: number;
  contingency: number;
  total_soft_costs: number;
}

export interface DevelopmentAnalysis {
  construction_costs: ConstructionCosts;
  soft_costs: SoftCosts;
  total_development_cost: number;
  cost_per_unit: number;
  cost_per_sqft: number;
  timeline_months: number;
  financing_needs: DevelopmentFinancing;
}

export interface DevelopmentFinancing {
  total_project_cost: number;
  equity_required: number;
  construction_loan_amount: number;
  permanent_financing: number;
  interest_during_construction: number;
}

export interface RentAnalysis {
  market_rent_range: {
    low: number;
    average: number;
    high: number;
  };
  target_rent: number;
  rent_premium_discount: number;
  rent_per_sqft: number;
  market_rent_per_sqft: number;
}

export interface MarketAnalysis {
  rent_analysis_by_unit: Record<UnitType, RentAnalysis>;
  overall_market_score: number;
  demand_indicators: {
    vacancy_rate: number;
    rent_growth_trend: number;
    competition_level: 'low' | 'moderate' | 'high';
  };
  location_factors: {
    transit_score: number;
    amenity_score: number;
    school_district_rating: number;
  };
}

export interface ProfitabilityGap {
  current_value: number;
  target_value: number;
  gap_amount: number;
  gap_percentage: number;
}

export interface ProfitabilityGaps {
  cash_flow_gap: ProfitabilityGap;
  roi_gap: ProfitabilityGap;
  rent_gap: ProfitabilityGap;
  cost_gap: ProfitabilityGap;
  recommendations: string[];
}

export interface ConstructionTimeline {
  planning_phase_months: number;
  construction_phase_months: number;
  leasing_phase_months: number;
  total_timeline_months: number;
  key_milestones: {
    permits_approved: number;
    construction_start: number;
    construction_complete: number;
    first_tenant: number;
    stabilized_occupancy: number;
  };
}

export interface DevelopmentRiskAssessment {
  construction_risk: {
    score: number;
    factors: string[];
  };
  market_risk: {
    score: number;
    factors: string[];
  };
  financing_risk: {
    score: number;
    factors: string[];
  };
  overall_risk_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'very_high';
}

export interface MultiFamilyAnalysis extends DealAnalysis {
  development_analysis: DevelopmentAnalysis;
  market_analysis: MarketAnalysis;
  profitability_gaps: ProfitabilityGaps;
  construction_timeline: ConstructionTimeline;
  risk_assessment: DevelopmentRiskAssessment;
}
