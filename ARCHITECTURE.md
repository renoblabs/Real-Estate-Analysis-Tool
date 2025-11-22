# REI OPS™ Architecture

**System Architecture & Design Decisions**

This document provides a comprehensive overview of the REI OPS™ architecture, design patterns, and technical decisions.

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Architecture Patterns](#architecture-patterns)
- [Data Flow](#data-flow)
- [Core Modules](#core-modules)
- [Database Schema](#database-schema)
- [Security](#security)
- [Performance](#performance)
- [Design Decisions](#design-decisions)

---

## 🏗 System Overview

REI OPS™ is a **server-side rendered (SSR)** Next.js application with **API routes** for backend logic and **Supabase** for database, authentication, and storage.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │   Mobile     │  │    Tablet    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Next.js App    │
                    │   (SSR + CSR)    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐        ┌─────▼──────┐
   │ Server  │         │ Client  │        │   Edge     │
   │Component│         │Component│        │  Runtime   │
   └────┬────┘         └────┬────┘        └─────┬──────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
                   ┌────────▼──────────┐
                   │    Supabase       │
                   ├───────────────────┤
                   │  PostgreSQL + RLS │
                   │  Auth (JWT)       │
                   │  Storage          │
                   │  Realtime         │
                   └───────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.0.3 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.7+ | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **Recharts** | 2.15+ | Data visualizations |
| **shadcn/ui** | Latest | Component library |
| **Sonner** | Latest | Toast notifications |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Supabase** | Latest | Database, Auth, Storage |
| **PostgreSQL** | 15+ | Relational database |
| **Row Level Security** | Built-in | Data isolation |

### Development

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Jest** | 29+ | Testing framework |
| **React Testing Library** | Latest | Component testing |
| **ESLint** | Latest | Code quality |
| **Prettier** | Latest | Code formatting |

---

## 🏛 Architecture Patterns

### 1. **Server Components First**

We use React Server Components (RSC) by default for:
- **Better performance** - Less JavaScript sent to client
- **Direct database access** - No API routes needed
- **SEO friendly** - Fully rendered HTML

```typescript
// app/deals/page.tsx (Server Component)
export default async function DealsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('deals').select('*');

  return <DealsList deals={data} />; // Pre-rendered on server
}
```

### 2. **Client Components for Interactivity**

Use `'use client'` directive for:
- State management (`useState`, `useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Third-party libraries with browser dependencies

```typescript
// components/forms/PropertyDetailsForm.tsx
'use client';

export function PropertyDetailsForm() {
  const [formData, setFormData] = useState({});
  // Interactive form logic
}
```

### 3. **Separation of Concerns**

```
┌─────────────────────────────────────────┐
│            PRESENTATION                 │
│  Components (UI only, no business logic)│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          BUSINESS LOGIC                 │
│  /lib/*.ts (Pure functions, testable)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          DATA ACCESS                    │
│  /lib/database.ts (Supabase operations) │
└─────────────────────────────────────────┘
```

**Benefits:**
- **Testability** - Business logic is pure functions
- **Reusability** - Logic can be used anywhere
- **Maintainability** - Clear boundaries

### 4. **Feature-Based Organization**

```
/components
  /forms           # All form components
  /analysis        # Analysis-specific components
  /ui              # Reusable UI primitives
  /layout          # Layout components

/lib
  /constants       # Configuration & constants
  canadian-calculations.ts  # Canadian-specific logic
  deal-analyzer.ts         # Core analysis engine
  risk-analyzer.ts         # Risk assessment
  break-even-calculator.ts # Break-even analysis
```

### 5. **Error Handling Strategy**

**Three Layers:**

1. **Component Level** - ErrorBoundary for React errors
2. **Function Level** - Try/catch with structured logging
3. **Database Level** - Retry logic with exponential backoff

```typescript
// Layer 1: ErrorBoundary
<ErrorBoundary fallback={<ErrorPage />}>
  <AnalyzePage />
</ErrorBoundary>

// Layer 2: Function-level
async function saveDeal() {
  try {
    const result = await withRetry(() => db.insert(...), 3);
    return { data: result, error: null };
  } catch (error) {
    console.error('saveDeal failed:', { error, context: {...} });
    return { data: null, error };
  }
}

// Layer 3: Database-level (retry)
await withRetry(
  async () => supabase.from('deals').insert(data),
  3,  // 3 retries
  1000 // 1s base delay (exponential backoff)
);
```

---

## 🔄 Data Flow

### Analysis Flow

```
User Input (Form)
      │
      ▼
Form Validation (React Hook Form + Zod)
      │
      ▼
Business Logic (lib/deal-analyzer.ts)
      │
      ├─► Canadian Calculations (CMHC, LTT, Stress Test)
      ├─► Metrics Calculation (Cash Flow, ROI, Cap Rate)
      ├─► Risk Analysis (8 focused functions)
      ├─► Break-Even Analysis (9 focused functions)
      └─► Scoring Algorithm (A-F grade)
      │
      ▼
Database Save (with retry logic)
      │
      ▼
Results Display (Server Component)
```

### Authentication Flow

```
User Login
    │
    ▼
Supabase Auth (JWT)
    │
    ├─► Access Token (short-lived)
    ├─► Refresh Token (long-lived)
    └─► Session (stored in cookies)
    │
    ▼
Row Level Security (RLS)
    │
    └─► user_id filter on all queries
```

---

## 🧩 Core Modules

### 1. **Analysis Engine** (`lib/deal-analyzer.ts`)

**Purpose:** Core analysis orchestrator

**Input:** `PropertyInputs` (form data)
**Output:** `DealAnalysis` (complete analysis)

**Flow:**
```typescript
export function analyzeDeal(inputs: PropertyInputs): DealAnalysis {
  // 1. Calculate acquisition costs (CMHC, LTT, closing costs)
  const acquisition = calculateAcquisitionCosts(inputs);

  // 2. Calculate financing (mortgage, stress test)
  const financing = calculateFinancing(inputs, acquisition);

  // 3. Calculate revenue
  const revenue = calculateRevenue(inputs);

  // 4. Calculate expenses
  const expenses = calculateExpenses(inputs, revenue);

  // 5. Calculate cash flow
  const cashFlow = calculateCashFlow(revenue, expenses, financing);

  // 6. Calculate metrics (ROI, Cap Rate, DSCR, etc.)
  const metrics = calculateMetrics(inputs, cashFlow, acquisition);

  // 7. Score the deal (A-F)
  const scoring = scoreDeal(metrics, inputs);

  // 8. Generate warnings
  const warnings = generateWarnings(metrics, inputs);

  return { acquisition, financing, revenue, expenses, cashFlow, metrics, scoring, warnings };
}
```

### 2. **Canadian Calculations** (`lib/canadian-calculations.ts`)

**Purpose:** Canadian-specific real estate calculations

**Key Functions:**
- `calculateCMHCPremium()` - CMHC insurance based on down payment
- `calculateLandTransferTax()` - Provincial + municipal LTT
- `calculateStressTestRate()` - OSFI B-20 stress test
- `calculateClosingCosts()` - Legal, appraisal, inspections

**Constants:** `lib/constants/canadian-rates.ts`

### 3. **Risk Analyzer** (`lib/risk-analyzer.ts`)

**Purpose:** Comprehensive risk assessment

**Architecture:** **Refactored from 462-line God Function to 8 focused functions**

```typescript
// Main orchestrator
export function analyzeRisks(inputs, analysis): RiskAnalysis {
  const financial_risks = assessFinancialRisks(inputs, analysis);
  const market_risks = assessMarketRisks(inputs, analysis);
  const operational_risks = assessOperationalRisks(inputs, analysis);
  const liquidity_risks = assessLiquidityRisks(inputs, analysis);

  const scores = calculateCategoryScores([...financial_risks, ...market_risks, ...]);
  const stress_test = generateStressTests(analysis);
  const recommendations = generateRecommendations(scores.overall_risk_score);

  return { ...scores, risk_factors: [...], stress_test, recommendations };
}
```

**Risk Categories:**
1. **Financial** - Cash flow, leverage, DSCR
2. **Market** - Vacancy, property age, valuation
3. **Operational** - Property management, maintenance
4. **Liquidity** - Capital requirements

### 4. **Break-Even Calculator** (`lib/break-even-calculator.ts`)

**Purpose:** Find path to positive cash flow

**Architecture:** **Refactored from 198-line function to 9 focused functions**

```typescript
export function calculateBreakEven(analysis): BreakEvenAnalysis {
  const rentBreakEven = calculateRentBreakEven(monthly_rent, monthly_shortfall);
  const priceBreakEven = calculatePurchasePriceBreakEven(monthly_shortfall, analysis);
  const occupancyBreakEven = calculateOccupancyBreakEven(monthly_shortfall, is_positive, analysis);
  const expenseBreakEven = calculateExpenseBreakEven(monthly_shortfall, analysis);
  const interestRate = calculateInterestRateSensitivity(is_positive, monthly_shortfall, analysis);
  const timeline = calculateTimelineToPositive(is_positive, monthly_rent, analysis);

  return { ...rentBreakEven, ...priceBreakEven, ... };
}
```

### 5. **Database Operations** (`lib/database.ts`)

**Purpose:** All Supabase interactions with retry logic

**Pattern:**
```typescript
export async function saveDeal(userId, analysis): Promise<{ data, error }> {
  try {
    const { data, error } = await withRetry(
      async () => supabase.from('deals').insert(dealData).select().single(),
      3,    // 3 retries
      1000  // 1s base delay
    );

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('saveDeal failed after retries:', error);
    return { data: null, error };
  }
}
```

**Retry Strategy:**
- **3 retries** with exponential backoff (1s, 2s, 4s)
- **Applied to:** saveDeal, updateDeal, getUserDeals, getDeal
- **Graceful degradation** on final failure

---

## 🗄 Database Schema

### Core Tables

```sql
-- Deals (main table)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Property Info
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INT,
  bathrooms DECIMAL,
  square_feet INT,
  year_built INT,

  -- Financial Inputs
  purchase_price DECIMAL NOT NULL,
  down_payment_percent DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  monthly_rent DECIMAL NOT NULL,

  -- Calculated Outputs
  monthly_cash_flow DECIMAL,
  cash_on_cash_return DECIMAL,
  cap_rate DECIMAL,
  deal_grade TEXT,

  -- Management
  status TEXT DEFAULT 'analyzing',
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,

  investor_type TEXT DEFAULT 'Beginner',
  default_vacancy_rate DECIMAL DEFAULT 5.0,
  default_pm_percent DECIMAL DEFAULT 8.0,
  target_coc_return DECIMAL DEFAULT 8.0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Users can only access their own deals
CREATE POLICY "Users can view own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🔒 Security

### Authentication

- **Supabase Auth** - JWT-based authentication
- **Session management** - HTTP-only cookies
- **Automatic token refresh**

### Authorization

- **Row Level Security (RLS)** - Database-level isolation
- **User-scoped queries** - All queries filtered by user_id

### Data Protection

- **Environment variables** - Validated on startup
- **Input validation** - Zod schemas for all forms
- **SQL injection prevention** - Parameterized queries (Supabase handles this)
- **XSS prevention** - React's built-in escaping

### Production Checklist

- [x] Environment variable validation
- [x] RLS policies on all tables
- [x] HTTPS only (enforced by Vercel/deployment platform)
- [x] Secure cookie settings
- [x] CORS configuration
- [ ] Rate limiting (TODO: Add Upstash Redis)
- [ ] DDoS protection (TODO: Cloudflare)

---

## ⚡ Performance

### Optimization Strategies

1. **Server-Side Rendering**
   - Pre-render pages on server
   - Reduce client-side JavaScript
   - Better SEO

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (Next.js automatic)

3. **Database Optimization**
   - Indexes on frequently queried fields
   - Efficient query patterns
   - Connection pooling (Supabase handles this)

4. **Caching**
   - Next.js automatic page caching
   - Supabase query caching
   - Browser caching for static assets

5. **Error Resilience**
   - Timeout wrappers (10s auth, 15s DB)
   - Retry logic (3 retries, exponential backoff)
   - Graceful degradation

### Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | <1.5s | ✅ 1.2s |
| **Time to Interactive** | <3.5s | ✅ 2.8s |
| **Lighthouse Score** | >90 | ✅ 95 |

---

## 🧠 Design Decisions

### Why Next.js App Router?

**Pros:**
- Server Components by default (better performance)
- Streaming and Suspense support
- Simplified data fetching
- Better DX with layouts and templates

**Cons:**
- Learning curve for SSR concepts
- Some third-party libraries need adaptation

**Decision:** Use App Router for modern patterns and better performance.

### Why Supabase?

**Pros:**
- PostgreSQL (battle-tested, reliable)
- Built-in auth (saves weeks of development)
- Row Level Security (data isolation at DB level)
- Realtime capabilities (future feature)
- Free tier is generous

**Cons:**
- Vendor lock-in (mitigated: PostgreSQL is standard)
- Less control than self-hosted

**Decision:** Use Supabase for rapid development and reliability.

### Why TypeScript Strict Mode?

**Pros:**
- Catch bugs at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

**Cons:**
- More upfront work
- Learning curve

**Decision:** Use strict mode for long-term maintainability.

### Why Component Decomposition?

**Before:** 558-line analyze page, 462-line risk function
**After:** 7 focused components, 8 focused functions

**Benefits:**
- Single Responsibility Principle
- Easier testing
- Better reusability
- Reduced cognitive load

**Trade-off:** More files, but dramatically better maintainability.

---

## 📊 Metrics & Monitoring

### Error Tracking

**Current:** Structured console logging
**TODO:** Integrate Sentry or LogRocket

```typescript
// Production error monitoring hooks already in place
// TODO: Uncomment when ready
// Sentry.captureException(error, { extra: context });
```

### Analytics

**Current:** Custom analytics events
**TODO:** Integrate Google Analytics or Mixpanel

```typescript
// Track user actions
trackEvent('deal_analyzed', { deal_id, strategy, province });
```

### Performance Monitoring

**Current:** Manual testing
**TODO:** Integrate Web Vitals reporting

---

## 🚀 Deployment Architecture

```
GitHub Repository
      │
      ▼
Vercel CI/CD
      │
      ├─► Build & Type Check
      ├─► Run Tests
      ├─► Lint Code
      └─► Deploy to Edge Network
      │
      ▼
Production Environment
      │
      ├─► Next.js App (Vercel Edge)
      ├─► Supabase (Database + Auth)
      └─► Static Assets (CDN)
```

**Edge Deployment:**
- Global CDN (fast worldwide)
- Automatic scaling
- Zero-downtime deployments

---

## 📚 Further Reading

- [Contributing Guidelines](CONTRIBUTING.md)
- [API Documentation](API.md)
- [User Guide](USER_GUIDE.md)
- [Production Fixes](PRODUCTION_FIXES.md)

---

**Last Updated:** 2025-11-22
**Version:** 2.3.3 (Production Ready)
