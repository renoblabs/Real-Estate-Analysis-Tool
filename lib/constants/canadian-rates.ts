/**
 * REI OPS™ - Canadian Real Estate Constants
 * Last updated: 2024 - Verify rates annually
 */

/**
 * CMHC Premium Rates (as of 2024)
 * Based on down payment percentage
 * Source: https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/mortgage-loan-insurance-homeownership-programs/cmhc-mortgage-loan-insurance-cost
 */
export const CMHC_PREMIUM_RATES = {
  '20+': 0.00,     // No insurance required
  '15-20': 2.80,   // 15% to 19.99% down
  '10-15': 3.10,   // 10% to 14.99% down
  '5-10': 4.00,    // 5% to 9.99% down (minimum for most properties)
} as const;

/**
 * Get CMHC premium rate based on down payment percentage
 */
export function getCMHCPremiumRate(downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) return CMHC_PREMIUM_RATES['20+'];
  if (downPaymentPercent >= 15) return CMHC_PREMIUM_RATES['15-20'];
  if (downPaymentPercent >= 10) return CMHC_PREMIUM_RATES['10-15'];
  return CMHC_PREMIUM_RATES['5-10'];
}

/**
 * Land Transfer Tax (LTT) Brackets for Ontario (2024)
 * Source: https://www.ontario.ca/page/land-transfer-tax
 */
export const ONTARIO_LTT_BRACKETS = [
  { max: 55000, rate: 0.5 },
  { max: 250000, rate: 1.0 },
  { max: 400000, rate: 1.5 },
  { max: 2000000, rate: 2.0 },
  { max: Infinity, rate: 2.5 },
] as const;

/**
 * Toronto Municipal Land Transfer Tax Brackets (2024)
 * Toronto has an additional municipal LTT on top of provincial
 */
export const TORONTO_MUNICIPAL_LTT_BRACKETS = [
  { max: 55000, rate: 0.5 },
  { max: 400000, rate: 1.0 },
  { max: Infinity, rate: 2.0 },
] as const;

/**
 * Land Transfer Tax rates for other provinces
 */
export const PROVINCIAL_LTT_RATES = {
  ON: ONTARIO_LTT_BRACKETS,
  BC: [
    { max: 200000, rate: 1.0 },
    { max: 2000000, rate: 2.0 },
    { max: 3000000, rate: 3.0 },
    { max: Infinity, rate: 5.0 },  // BC has higher rates for luxury properties
  ],
  AB: [
    { max: Infinity, rate: 0.0 },  // Alberta has no land transfer tax!
  ],
  QC: [
    { max: Infinity, rate: 0.5 },  // Quebec uses "Welcome Tax" (flat 0.5% in most cases)
  ],
  NS: [
    { max: Infinity, rate: 1.5 },  // Nova Scotia flat rate
  ],
} as const;

/**
 * OSFI Stress Test Rate (2024)
 * Borrowers must qualify at the higher of:
 * - Contract rate + 2%
 * - 5.25% (minimum qualifying rate)
 * Source: https://www.osfi-bsif.gc.ca/
 */
export const OSFI_STRESS_TEST = {
  RATE_BUFFER: 2.0,           // +2% over contract rate
  MINIMUM_QUALIFYING_RATE: 5.25,  // Absolute minimum
} as const;

/**
 * Standard closing costs as percentages
 */
export const CLOSING_COSTS = {
  LEGAL_FEES: {
    MIN: 1500,
    MAX: 3000,
    TYPICAL: 2000,
  },
  HOME_INSPECTION: {
    MIN: 400,
    MAX: 800,
    TYPICAL: 600,
  },
  APPRAISAL: {
    MIN: 300,
    MAX: 600,
    TYPICAL: 500,
  },
  TITLE_INSURANCE: {
    PERCENT: 0.1,  // ~0.1% of purchase price
  },
  OTHER_CLOSING: {
    PERCENT: 0.5,  // ~0.5% buffer for misc costs
  },
} as const;

/**
 * BRRRR (Buy, Rehab, Rent, Refinance, Repeat) Strategy Constants
 */
export const BRRRR_STRATEGY = {
  REFINANCE_LTV: 75,              // Can typically refinance up to 75% of ARV
  HOLDING_PERIOD_MONTHS: 6,       // Minimum hold before refinance (most lenders)
  RENOVATION_CONTINGENCY: 0.15,   // 15% buffer for cost overruns
} as const;

/**
 * Property maintenance budgets (% of property value per year)
 */
export const MAINTENANCE_BUDGETS = {
  NEW_CONSTRUCTION: 0.5,    // 0-5 years old
  MODERN: 1.0,              // 6-15 years old
  AVERAGE: 1.5,             // 16-30 years old
  OLDER: 2.5,               // 31-50 years old
  HISTORIC: 3.5,            // 50+ years old
} as const;

/**
 * Typical property management fees by property type
 */
export const PROPERTY_MANAGEMENT_FEES = {
  SINGLE_FAMILY: 8,         // 8% of rent
  MULTI_FAMILY_SMALL: 10,   // 10% for 2-4 units
  MULTI_FAMILY_LARGE: 6,    // 6% for 5+ units (economies of scale)
  CONDO: 10,                // 10% (harder to manage)
} as const;

/**
 * Typical vacancy rates by market (%)
 */
export const VACANCY_RATES = {
  TIGHT_MARKET: 3,          // Toronto, Vancouver
  BALANCED: 5,              // Most Canadian markets
  SOFT: 7,                  // Smaller cities, seasonal areas
} as const;

/**
 * Get appropriate maintenance budget based on property age
 */
export function getMaintenanceBudget(yearBuilt: number): number {
  const age = new Date().getFullYear() - yearBuilt;

  if (age <= 5) return MAINTENANCE_BUDGETS.NEW_CONSTRUCTION;
  if (age <= 15) return MAINTENANCE_BUDGETS.MODERN;
  if (age <= 30) return MAINTENANCE_BUDGETS.AVERAGE;
  if (age <= 50) return MAINTENANCE_BUDGETS.OLDER;
  return MAINTENANCE_BUDGETS.HISTORIC;
}

/**
 * Export all constants as a single object for convenience
 */
export const CANADIAN_REAL_ESTATE_CONSTANTS = {
  CMHC_PREMIUM_RATES,
  ONTARIO_LTT_BRACKETS,
  TORONTO_MUNICIPAL_LTT_BRACKETS,
  PROVINCIAL_LTT_RATES,
  OSFI_STRESS_TEST,
  CLOSING_COSTS,
  BRRRR_STRATEGY,
  MAINTENANCE_BUDGETS,
  PROPERTY_MANAGEMENT_FEES,
  VACANCY_RATES,
} as const;
