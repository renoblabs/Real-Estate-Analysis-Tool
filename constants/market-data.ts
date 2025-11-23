// REI OPS™ - Market Data & Benchmarks

export const MARKET_BENCHMARKS = {
  cap_rates: {
    'Toronto': { single_family: 3.5, multi_unit: 4.5 },
    'Vancouver': { single_family: 2.5, multi_unit: 3.5 },
    'Calgary': { single_family: 5.5, multi_unit: 6.5 },
    'Edmonton': { single_family: 5.0, multi_unit: 6.0 },
    'Montreal': { single_family: 4.5, multi_unit: 5.5 },
    'Ottawa': { single_family: 4.0, multi_unit: 5.0 },
    'Halifax': { single_family: 5.5, multi_unit: 6.0 },
    'Winnipeg': { single_family: 6.0, multi_unit: 7.0 },
    'Hamilton': { single_family: 4.0, multi_unit: 5.0 },
    'London': { single_family: 4.5, multi_unit: 5.5 },
    'Kitchener': { single_family: 4.0, multi_unit: 5.0 },
    'Waterloo': { single_family: 4.0, multi_unit: 5.0 },
    'Mississauga': { single_family: 3.5, multi_unit: 4.5 },
    'Brampton': { single_family: 3.5, multi_unit: 4.5 },
    'Surrey': { single_family: 2.8, multi_unit: 3.8 },
    'Burnaby': { single_family: 2.5, multi_unit: 3.5 },
    'Richmond': { single_family: 2.5, multi_unit: 3.5 },
    'default': { single_family: 5.0, multi_unit: 6.0 }
  },

  rent_to_price_ratios: {
    'Toronto': 0.35,
    'Vancouver': 0.30,
    'Calgary': 0.55,
    'Edmonton': 0.50,
    'Montreal': 0.55,
    'Ottawa': 0.45,
    'Halifax': 0.50,
    'Winnipeg': 0.60,
    'Hamilton': 0.40,
    'London': 0.50,
    'Kitchener': 0.45,
    'Waterloo': 0.45,
    'Mississauga': 0.35,
    'Brampton': 0.40,
    'Surrey': 0.35,
    'Burnaby': 0.30,
    'Richmond': 0.30,
    'default': 0.50
  },

  average_days_on_market: {
    'Toronto': 15,
    'Vancouver': 20,
    'Calgary': 30,
    'Edmonton': 35,
    'Montreal': 45,
    'Ottawa': 25,
    'Halifax': 30,
    'Winnipeg': 40,
    'Hamilton': 20,
    'London': 25,
    'default': 30
  }
};

export const OPERATING_EXPENSES = {
  single_family: {
    property_management_percent: 8,
    maintenance_percent: 12,
    property_tax_percent_of_value: 0.9,
    insurance_annual_base: 1200,
    vacancy_rate: 4
  },
  duplex: {
    property_management_percent: 8,
    maintenance_percent: 15,
    property_tax_percent_of_value: 1.0,
    insurance_annual_base: 1500,
    vacancy_rate: 6
  },
  triplex: {
    property_management_percent: 7,
    maintenance_percent: 15,
    property_tax_percent_of_value: 1.1,
    insurance_annual_base: 1800,
    vacancy_rate: 6
  },
  fourplex: {
    property_management_percent: 7,
    maintenance_percent: 16,
    property_tax_percent_of_value: 1.1,
    insurance_annual_base: 2000,
    vacancy_rate: 7
  },
  multi_unit_5plus: {
    property_management_percent: 7,
    maintenance_percent: 18,
    property_tax_percent_of_value: 1.2,
    insurance_annual_base: 2500,
    vacancy_rate: 7
  }
};

export const RENOVATION_COSTS_PER_SF = {
  move_in_ready: { low: 0, mid: 0, high: 0 },
  cosmetic: { low: 15, mid: 25, high: 40 },
  moderate_reno: { low: 40, mid: 65, high: 90 },
  heavy_reno: { low: 100, mid: 150, high: 200 },
  gut_job: { low: 150, mid: 200, high: 300 }
};

export const CLOSING_COSTS = {
  legal_fees: 1500,
  inspection: 500,
  appraisal: 300,
  title_insurance: 250,
  home_insurance_first_year: 1200
};

// CMHC Premium Rates (as of 2024)
export const CMHC_RATES = {
  '5-9.99': 4.00,
  '10-14.99': 3.10,
  '15-19.99': 2.80
};

// OSFI B-20 Stress Test
export const OSFI_STRESS_TEST_FLOOR = 5.25;
export const OSFI_STRESS_TEST_BUFFER = 2.0;

// Maximum LTV ratios
export const MAX_LTV = {
  under_500k: 95,
  '500k_to_1m': 90,
  over_1m: 80,
  investment_property: 80
};

// Minimum down payment percentages
export const MIN_DOWN_PAYMENT = {
  first_500k: 5,
  above_500k: 10,
  over_1m: 20
};
