# REI OPS™ API Documentation

Internal API reference for developers working with REI OPS™.

---

## 📋 Table of Contents

- [Core Analysis Functions](#core-analysis-functions)
- [Canadian Calculations](#canadian-calculations)
- [Risk Analysis](#risk-analysis)
- [Break-Even Analysis](#break-even-analysis)
- [Database Operations](#database-operations)
- [Utilities](#utilities)
- [Types](#types)

---

## 🎯 Core Analysis Functions

### `analyzeDeal(inputs: PropertyInputs): DealAnalysis`

**File:** `lib/deal-analyzer.ts`

**Purpose:** Main orchestrator for deal analysis. Takes property inputs and returns complete analysis with all metrics, scoring, and warnings.

**Parameters:**
```typescript
interface PropertyInputs {
  // Property Details
  address: string;
  city: string;
  province: 'ON' | 'BC' | 'AB' | 'NS' | 'QC';
  property_type: 'single_family' | 'duplex' | 'triplex' | 'fourplex' | 'multi_unit_5plus';
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;

  // Financial
  purchase_price: number;
  down_payment_percent: number;
  down_payment_amount: number;
  interest_rate: number;
  amortization_years: number;

  // Strategy
  strategy: 'buy_hold' | 'brrrr' | 'flip' | 'house_hack';
  property_condition: 'move_in_ready' | 'cosmetic_reno' | 'full_reno' | 'tear_down';
  renovation_cost: number;

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
  hoa_condo_fees_monthly: number;
  other_expenses_monthly: number;
}
```

**Returns:**
```typescript
interface DealAnalysis {
  property: PropertyInfo;
  acquisition: AcquisitionCosts;
  financing: FinancingDetails;
  revenue: RevenueDetails;
  expenses: ExpenseDetails;
  cash_flow: CashFlowDetails;
  metrics: InvestmentMetrics;
  scoring: DealScoring;
  warnings: string[];
  brrrr?: BRRRRAnalysis; // Only if strategy is 'brrrr'
}
```

**Example:**
```typescript
import { analyzeDeal } from '@/lib/deal-analyzer';

const inputs: PropertyInputs = {
  address: '123 Main St',
  city: 'Toronto',
  province: 'ON',
  purchase_price: 500000,
  down_payment_percent: 20,
  monthly_rent: 2500,
  // ... other fields
};

const analysis = analyzeDeal(inputs);
console.log(analysis.metrics.cash_on_cash_return); // 8.5
console.log(analysis.scoring.grade); // 'B'
```

---

## 🇨🇦 Canadian Calculations

### `calculateCMHCPremium(purchasePrice, downPaymentPercent): number`

**File:** `lib/canadian-calculations.ts`

**Purpose:** Calculate CMHC insurance premium based on down payment percentage.

**CMHC Rates (2024):**
- 5-9.99% down: 4.00%
- 10-14.99% down: 3.10%
- 15-19.99% down: 2.80%
- 20%+ down: 0.00% (no insurance required)

**Example:**
```typescript
import { calculateCMHCPremium } from '@/lib/canadian-calculations';

const premium = calculateCMHCPremium(500000, 10); // 10% down
console.log(premium); // 13,950 (3.10% of 450,000 mortgage)
```

---

### `calculateLandTransferTax(price, province, city, firstTimeBuyer): LTTResult`

**File:** `lib/canadian-calculations.ts`

**Purpose:** Calculate provincial + municipal land transfer tax with first-time buyer rebates.

**Parameters:**
- `price` - Purchase price
- `province` - 'ON', 'BC', 'AB', 'NS', 'QC'
- `city` - Optional (for Toronto municipal LTT)
- `firstTimeBuyer` - Boolean for rebate eligibility

**Returns:**
```typescript
interface LTTResult {
  provincial_tax: number;
  municipal_tax: number;
  first_time_buyer_rebate: number;
  total_tax: number;
}
```

**Example:**
```typescript
import { calculateLandTransferTax } from '@/lib/canadian-calculations';

const ltt = calculateLandTransferTax(500000, 'ON', 'Toronto', true);
console.log(ltt.total_tax); // 11,475 (after first-time buyer rebate)
```

---

### `calculateStressTestRate(contractRate): number`

**File:** `lib/canadian-calculations.ts`

**Purpose:** Calculate OSFI B-20 stress test rate.

**Formula:** Higher of (contract rate + 2.0%) or 5.25% floor

**Example:**
```typescript
import { calculateStressTestRate } from '@/lib/canadian-calculations';

const stressRate = calculateStressTestRate(4.5);
console.log(stressRate); // 6.5% (4.5% + 2.0%)

const stressRate2 = calculateStressTestRate(3.0);
console.log(stressRate2); // 5.25% (floor rate)
```

---

## 🎲 Risk Analysis

### `analyzeRisks(inputs, analysis): RiskAnalysis`

**File:** `lib/risk-analyzer.ts`

**Purpose:** Comprehensive risk assessment across 4 categories with 9 risk factors.

**Architecture:** Refactored into 8 focused functions:

```typescript
// Main orchestrator
export function analyzeRisks(inputs, analysis): RiskAnalysis

// Sub-functions (modular design)
function assessFinancialRisks(inputs, analysis): RiskFactor[]
function assessMarketRisks(inputs, analysis): RiskFactor[]
function assessOperationalRisks(inputs, analysis): RiskFactor[]
function assessLiquidityRisks(inputs, analysis): RiskFactor[]
function calculateCategoryScores(riskFactors): CategoryScores
function generateStressTests(analysis): StressTest[]
function generateRecommendations(score, level): Recommendations
function getRiskLevel(score): RiskLevel
```

**Returns:**
```typescript
interface RiskAnalysis {
  overall_risk_score: number; // 0-100 (higher = more risky)
  overall_risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_factors: RiskFactor[]; // 9 risk factors

  // Category Scores
  financial_risk_score: number;
  market_risk_score: number;
  operational_risk_score: number;
  liquidity_risk_score: number;

  // Warnings
  critical_risks: string[];
  high_risks: string[];

  // Stress Tests
  stress_test: {
    scenario: string;
    monthly_cash_flow_impact: number;
    annual_cash_flow_impact: number;
    break_even_impact: string;
  }[];

  // Recommendations
  risk_tolerance_recommendation: 'Conservative' | 'Moderate' | 'Aggressive';
  suitable_for_investor_types: string[];
  overall_recommendation: string;
}
```

**Risk Factors Assessed:**

**Financial (3):**
1. Cash Flow Risk
2. Leverage Risk (LTV)
3. Debt Service Coverage Risk (DSCR)

**Market (3):**
4. Vacancy Risk
5. Property Age Risk
6. Valuation Risk (GRM)

**Operational (2):**
7. Property Management Risk
8. Maintenance Reserve Risk

**Liquidity (1):**
9. Capital Requirements Risk

**Example:**
```typescript
import { analyzeRisks } from '@/lib/risk-analyzer';

const riskAnalysis = analyzeRisks(inputs, dealAnalysis);
console.log(riskAnalysis.overall_risk_level); // 'Medium'
console.log(riskAnalysis.financial_risk_score); // 45
console.log(riskAnalysis.critical_risks); // []
console.log(riskAnalysis.high_risks); // ['DSCR of 1.12 is below lender requirements']
```

---

## 📊 Break-Even Analysis

### `calculateBreakEven(analysis): BreakEvenAnalysis`

**File:** `lib/break-even-calculator.ts`

**Purpose:** Find the path to positive cash flow through various scenarios.

**Architecture:** Refactored into 9 focused functions:

```typescript
// Main orchestrator
export function calculateBreakEven(analysis): BreakEvenAnalysis

// Sub-functions (modular design)
function calculateRentBreakEven(rent, shortfall): RentBreakEven
function calculatePurchasePriceBreakEven(shortfall, analysis): PriceBreakEven
function calculateOccupancyBreakEven(shortfall, isPositive, analysis): OccupancyBreakEven
function calculateExpenseBreakEven(shortfall, analysis): ExpenseBreakEven
function calculateInterestRateSensitivity(isPositive, shortfall, analysis): InterestRateSensitivity
function calculateTimelineToPositive(isPositive, rent, analysis): TimelineAnalysis
function determinePrimaryIssue(...): string
function determineQuickestPath(...): string
```

**Returns:**
```typescript
interface BreakEvenAnalysis {
  // Current State
  monthly_shortfall: number;
  is_currently_cash_flow_positive: boolean;

  // Rent-Based Break-Even
  break_even_rent: number;
  rent_increase_needed_percent: number;
  rent_increase_needed_dollars: number;

  // Price-Based Break-Even
  max_purchase_price_for_positive_cf: number;
  purchase_price_reduction_needed: number;
  purchase_price_reduction_percent: number;

  // Occupancy-Based Break-Even
  break_even_occupancy: number;
  max_affordable_vacancy_percent: number;

  // Expense-Based Break-Even
  max_affordable_expenses: number;
  expense_reduction_needed: number;
  expense_reduction_percent: number;

  // Interest Rate Sensitivity
  max_affordable_interest_rate: number;
  interest_rate_cushion: number;

  // Timeline Analysis (2.5% annual rent growth assumed)
  years_to_positive_cf: number;
  cumulative_loss_until_positive: number;

  // Recommendations
  primary_issue: string; // 'Low Rent' | 'High Purchase Price' | 'High Expenses' | 'High Interest Rate'
  quickest_path_to_positive: string; // Actionable recommendation
}
```

**Example:**
```typescript
import { calculateBreakEven } from '@/lib/break-even-calculator';

const breakEven = calculateBreakEven(dealAnalysis);
console.log(breakEven.is_currently_cash_flow_positive); // false
console.log(breakEven.monthly_shortfall); // -$250
console.log(breakEven.primary_issue); // 'Low Rent'
console.log(breakEven.quickest_path_to_positive); // 'Increase rent by $250'
console.log(breakEven.years_to_positive_cf); // 3 years (with 2.5% annual growth)
```

---

## 💾 Database Operations

All database operations use **retry logic** with exponential backoff (3 retries, 1s/2s/4s delays).

### `saveDeal(userId, analysis, status?, notes?): Promise<{ data, error }>`

**File:** `lib/database.ts`

**Purpose:** Save new deal to database with retry logic.

**Example:**
```typescript
import { saveDeal } from '@/lib/database';

const { data, error } = await saveDeal(user.id, analysis, 'analyzing', 'Potential investment');
if (error) {
  console.error('Failed to save deal:', error);
} else {
  console.log('Deal saved:', data.id);
}
```

---

### `updateDeal(dealId, analysis, status?, notes?): Promise<{ data, error }>`

**File:** `lib/database.ts`

**Purpose:** Update existing deal with retry logic.

**Example:**
```typescript
import { updateDeal } from '@/lib/database';

const { data, error } = await updateDeal(dealId, updatedAnalysis, 'offer_made');
```

---

### `getUserDeals(userId): Promise<{ data, error }>`

**File:** `lib/database.ts`

**Purpose:** Get all deals for a user with retry logic.

**Example:**
```typescript
import { getUserDeals } from '@/lib/database';

const { data, error } = await getUserDeals(user.id);
console.log(`Found ${data?.length || 0} deals`);
```

---

### `getDeal(dealId): Promise<{ data, error }>`

**File:** `lib/database.ts`

**Purpose:** Get single deal by ID with retry logic.

**Example:**
```typescript
import { getDeal } from '@/lib/database';

const { data, error } = await getDeal('uuid-here');
if (data) {
  console.log(data.address);
}
```

---

## 🛠 Utilities

### `formatCurrency(value, decimals?): string`

**File:** `lib/utils.ts`

**Purpose:** Format number as Canadian currency.

**Example:**
```typescript
import { formatCurrency } from '@/lib/utils';

console.log(formatCurrency(1234.56)); // '$1,235'
console.log(formatCurrency(1234.56, 2)); // '$1,234.56'
console.log(formatCurrency(-500)); // '-$500'
```

---

### `formatPercent(value, decimals?): string`

**File:** `lib/utils.ts`

**Purpose:** Format number as percentage.

**Example:**
```typescript
import { formatPercent } from '@/lib/utils';

console.log(formatPercent(8.5)); // '8.5%'
console.log(formatPercent(12.345, 2)); // '12.35%'
```

---

### `withTimeout<T>(promise, timeoutMs): Promise<T>`

**File:** `lib/utils.ts`

**Purpose:** Wrap promise with timeout to prevent hanging operations.

**Example:**
```typescript
import { withTimeout } from '@/lib/utils';

const user = await withTimeout(
  supabase.auth.getUser(),
  10000 // 10 second timeout
);
```

---

### `withRetry<T>(fn, retries, delayMs): Promise<T>`

**File:** `lib/utils.ts`

**Purpose:** Retry failed operations with exponential backoff.

**Example:**
```typescript
import { withRetry } from '@/lib/utils';

const data = await withRetry(
  async () => supabase.from('deals').select('*'),
  3,    // 3 retries
  1000  // 1s base delay (becomes 1s, 2s, 4s)
);
```

**Backoff Schedule:**
- Attempt 1: Immediate
- Attempt 2: 1s delay
- Attempt 3: 2s delay
- Attempt 4: 4s delay

---

### `formatDate(date): string`

**File:** `lib/utils.ts`

**Purpose:** Format date as Canadian locale.

**Example:**
```typescript
import { formatDate } from '@/lib/utils';

console.log(formatDate(new Date())); // 'Nov 22, 2025'
console.log(formatDate('2025-11-22')); // 'Nov 22, 2025'
```

---

## 📘 Types

### Core Types

**File:** `types/index.ts`

```typescript
// Property inputs from user
export interface PropertyInputs {
  // See Core Analysis section above for full definition
}

// Complete deal analysis result
export interface DealAnalysis {
  property: PropertyInfo;
  acquisition: AcquisitionCosts;
  financing: FinancingDetails;
  revenue: RevenueDetails;
  expenses: ExpenseDetails;
  cash_flow: CashFlowDetails;
  metrics: InvestmentMetrics;
  scoring: DealScoring;
  warnings: string[];
  brrrr?: BRRRRAnalysis;
}

// Saved deal in database
export interface Deal {
  id: string;
  user_id: string;
  address: string;
  city: string;
  province: string;
  purchase_price: number;
  monthly_cash_flow: number;
  cash_on_cash_return: number;
  cap_rate: number;
  deal_grade: string;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

// Deal status
export type DealStatus =
  | 'analyzing'
  | 'offer_made'
  | 'under_contract'
  | 'closed'
  | 'passed';

// User preferences
export interface UserPreferences {
  user_id: string;
  investor_type: InvestorType;
  default_vacancy_rate: number;
  default_pm_percent: number;
  default_maintenance_percent: number;
  target_coc_return: number;
  target_cap_rate: number;
}

export type InvestorType =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Professional';
```

---

## 🧪 Testing Utilities

### Mock Data Generators

**File:** `__tests__/helpers/mock-data.ts` (create if needed)

```typescript
export function createMockPropertyInputs(overrides?: Partial<PropertyInputs>): PropertyInputs {
  return {
    address: '123 Main St',
    city: 'Toronto',
    province: 'ON',
    property_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    year_built: 2010,
    purchase_price: 500000,
    down_payment_percent: 20,
    down_payment_amount: 100000,
    interest_rate: 5.5,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'move_in_ready',
    renovation_cost: 0,
    monthly_rent: 2500,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: 4500,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0,
    ...overrides,
  };
}
```

---

## 📚 Additional Resources

- [Architecture Guide](ARCHITECTURE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [User Guide](USER_GUIDE.md)
- [Production Fixes](PRODUCTION_FIXES.md)

---

**Last Updated:** 2025-11-22
**Version:** 2.3.3 (Production Ready)
