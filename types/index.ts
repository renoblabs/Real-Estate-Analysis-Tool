// REI OPS™ - TypeScript Type Definitions

export type Province = 'ON' | 'BC' | 'AB' | 'NS' | 'QC';
export type PropertyType = 'single_family' | 'duplex' | 'triplex' | 'fourplex' | 'multi_unit_5plus';
export type Strategy = 'brrrr' | 'buy_hold' | 'fix_flip';
export type PropertyCondition = 'move_in_ready' | 'cosmetic' | 'moderate_reno' | 'heavy_reno' | 'gut_job';
export type InvestorType = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
export type DealStatus = 'analyzing' | 'pursuing' | 'under_contract' | 'closed' | 'passed';
export type DealGrade = 'A' | 'B' | 'C' | 'D' | 'F';

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
