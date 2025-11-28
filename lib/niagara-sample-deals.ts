// Sample Niagara real estate deals for analysis

import { PropertyInputs } from '@/types';

export const NIAGARA_SAMPLE_DEALS: PropertyInputs[] = [
  {
    // St. Catharines - BRRRR Opportunity
    address: '123 Main Street',
    city: 'St. Catharines',
    province: 'ON',
    postal_code: 'L2R 3M1',
    property_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1200,
    year_built: 1985,
    lot_size: 0.15,
    purchase_price: 580000,
    down_payment_percent: 20,
    down_payment_amount: 116000,
    interest_rate: 6.2,
    amortization_years: 25,
    strategy: 'brrrr',
    property_condition: 'moderate_reno',
    renovation_cost: 45000,
    monthly_rent: 2800,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: 4200,
    insurance_annual: 1400,
    property_management_percent: 0, // Self-managed
    maintenance_percent: 8,
    utilities_monthly: 0, // Tenant pays
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 100
  },
  {
    // Welland - Cash Flow Focus
    address: '456 Oak Avenue',
    city: 'Welland',
    province: 'ON',
    postal_code: 'L3C 2B4',
    property_type: 'duplex',
    bedrooms: 4, // Total units
    bathrooms: 3,
    square_feet: 1800,
    year_built: 1978,
    lot_size: 0.2,
    purchase_price: 520000,
    down_payment_percent: 25,
    down_payment_amount: 130000,
    interest_rate: 6.1,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'cosmetic',
    renovation_cost: 25000,
    monthly_rent: 3200, // Both units combined
    other_income: 0,
    vacancy_rate: 6,
    property_tax_annual: 3800,
    insurance_annual: 1600,
    property_management_percent: 0,
    maintenance_percent: 10,
    utilities_monthly: 150, // Shared utilities
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 75
  },
  {
    // Fort Erie - Border Town Opportunity
    address: '789 Lake Road',
    city: 'Fort Erie',
    province: 'ON',
    postal_code: 'L2A 1K5',
    property_type: 'single_family',
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 950,
    year_built: 1965,
    lot_size: 0.12,
    purchase_price: 450000,
    down_payment_percent: 20,
    down_payment_amount: 90000,
    interest_rate: 6.3,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'heavy_reno',
    renovation_cost: 60000,
    monthly_rent: 2200,
    other_income: 0,
    vacancy_rate: 7,
    property_tax_annual: 3200,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 12,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 50
  },
  {
    // Niagara Falls - Tourism/Short-term Rental
    address: '321 Falls View Drive',
    city: 'Niagara Falls',
    province: 'ON',
    postal_code: 'L2G 4H8',
    property_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1100,
    year_built: 1992,
    lot_size: 0.1,
    purchase_price: 620000,
    down_payment_percent: 25,
    down_payment_amount: 155000,
    interest_rate: 6.0,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'move_in_ready',
    renovation_cost: 15000, // Minor updates for short-term rental
    monthly_rent: 3500, // Higher due to tourism potential
    other_income: 500, // Parking/amenities
    vacancy_rate: 8, // Seasonal variations
    property_tax_annual: 4800,
    insurance_annual: 1800,
    property_management_percent: 12, // Higher for short-term management
    maintenance_percent: 10,
    utilities_monthly: 200, // Owner pays for short-term rental
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 150
  },
  {
    // St. Catharines Condo - Entry Point Opportunity
    address: '555 Downtown Plaza, Unit 1205',
    city: 'St. Catharines',
    province: 'ON',
    postal_code: 'L2R 7K3',
    property_type: 'single_family', // Condo treated as single unit
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 850,
    year_built: 2008,
    lot_size: 0,
    purchase_price: 320000, // Reflecting 21.7% condo price drop
    down_payment_percent: 20,
    down_payment_amount: 64000,
    interest_rate: 6.4,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'move_in_ready',
    renovation_cost: 8000, // Minor cosmetic updates
    monthly_rent: 2100,
    other_income: 0,
    vacancy_rate: 4, // Lower vacancy in downtown core
    property_tax_annual: 2800,
    insurance_annual: 800,
    property_management_percent: 8,
    maintenance_percent: 5, // Lower for condo
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 420, // Condo fees
    other_expenses_monthly: 25
  }
];

export const NIAGARA_MARKET_INSIGHTS = {
  'St. Catharines': {
    averageRent: {
      '1br': 1650,
      '2br': 2100,
      '3br': 2800,
      '4br': 3200
    },
    vacancyRate: 4.2,
    marketTrends: [
      'Strong student rental demand from Brock University',
      'Downtown revitalization driving rental growth',
      'Major employer presence (General Motors, hospitals)',
      'GO Train extension improving Toronto commuter appeal'
    ],
    investmentTips: [
      'Focus on properties near Brock University for student rentals',
      'Downtown core offers best appreciation potential',
      'Consider properties near future GO station locations',
      'Older homes (1970s-1980s) offer best BRRRR opportunities'
    ]
  },
  'Welland': {
    averageRent: {
      '1br': 1400,
      '2br': 1800,
      '3br': 2400,
      '4br': 2800
    },
    vacancyRate: 5.8,
    marketTrends: [
      'Government investment in housing infrastructure',
      'Growing manufacturing and logistics sector',
      'Most affordable entry point in Niagara',
      'Strong local workforce rental demand'
    ],
    investmentTips: [
      'Target multi-family properties for best cash flow',
      'Focus on areas near major employers',
      'Consider properties that can be converted to multi-unit',
      'Government incentives available for housing development'
    ]
  },
  'Fort Erie': {
    averageRent: {
      '1br': 1350,
      '2br': 1750,
      '3br': 2200,
      '4br': 2600
    },
    vacancyRate: 6.5,
    marketTrends: [
      'Cross-border worker demand',
      'Peace Bridge proximity benefits',
      'Lakefront and canal access premium',
      'Growing retiree population'
    ],
    investmentTips: [
      'Target properties near Peace Bridge for cross-border workers',
      'Lakefront properties command premium rents',
      'Consider seasonal rental potential',
      'Older properties often undervalued'
    ]
  },
  'Niagara Falls': {
    averageRent: {
      '1br': 1550,
      '2br': 2000,
      '3br': 2600,
      '4br': 3200
    },
    vacancyRate: 7.2,
    marketTrends: [
      'Tourism industry recovery driving demand',
      'Short-term rental opportunities',
      'Seasonal rental premium potential',
      'Infrastructure investments ongoing'
    ],
    investmentTips: [
      'Consider short-term rental licensing requirements',
      'Properties near tourist areas command higher rents',
      'Factor in seasonal vacancy variations',
      'Tourism recovery still ongoing - good entry timing'
    ]
  }
};

export function getNiagaraMarketInsights(city: string) {
  return NIAGARA_MARKET_INSIGHTS[city as keyof typeof NIAGARA_MARKET_INSIGHTS] || null;
}