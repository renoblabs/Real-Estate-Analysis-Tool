# REI OPS™ 🇨🇦

**Investment Analysis Platform Built for Canadian Real Estate**

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)](https://github.com/renoblabs/Real-Estate-Analysis-Tool)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

---

## ✨ Features

### 🇨🇦 Canadian-Specific Calculations
- **CMHC Insurance**: Accurate premium calculations based on down payment percentage
- **Land Transfer Tax**: Provincial calculations for ON, BC, AB, NS, QC with municipal taxes and first-time buyer rebates
- **OSFI B-20 Stress Test**: Mortgage qualification at stress-tested rates
- **Multi-unit Financing**: Different requirements for 2-4 units vs 5+ units

### 📊 Comprehensive Deal Analysis
- **Multiple Strategies**: BRRRR, Buy & Hold, Fix & Flip
- **Key Metrics**: Cash flow, cap rate, cash-on-cash return, DSCR, GRM, expense ratio
- **Deal Scoring**: AI-powered grading system (A-F) with detailed reasoning
- **Market Comparison**: Compare deals against regional benchmarks

### 📈 **NEW** Data Visualizations
- **Cash Flow Projections**: 10-year forecast with equity growth and property value
- **Deal Metrics Charts**: Bar and radar charts comparing your deal to market benchmarks
- **Interactive Tooltips**: Detailed breakdowns on hover
- **Customizable Assumptions**: Adjust appreciation and rent growth rates

### 🔄 **NEW** Deal Comparison Tool
- **Side-by-Side Comparison**: Compare up to 3 deals simultaneously
- **Visual Indicators**: Color-coded arrows showing performance differences
- **Comprehensive Metrics**: Property info, financials, scores, and grades
- **Mobile Responsive**: Works seamlessly on all devices

### 💼 **NEW** Portfolio Analytics
- **Aggregate Metrics**: Total portfolio value, cash flow, and returns
- **Visual Distribution**: Pie and bar charts for property types and grades
- **Top Performers**: Ranked list of your best deals
- **Needs Attention**: Identify underperforming properties

### 🎯 **NEW** Advanced Analysis Tools (7 Modules)
- **Sensitivity Analysis**: Interactive what-if scenarios for rent, vacancy, rates, price, expenses
- **IRR & NPV Calculator**: Institutional-grade financial metrics with multi-year projections
- **Break-Even Analysis**: Find the path to positive cash flow - rent, price, expenses, timeline
- **Expense Ratio Optimizer**: Detailed cost analysis vs market benchmarks with optimization opportunities
- **Risk Analysis Dashboard**: Comprehensive risk assessment (financial, market, operational, liquidity)
- **Canadian Tax Impact**: Federal + provincial tax calculator with deductions and capital gains
- **Airbnb/STR Analysis**: Short-term rental modeling vs long-term comparison

### 💼 Portfolio Management
- **All Deals List**: View, filter, and sort all your deals
- **Deal Details**: Complete analysis view with charts and visualizations
- **Edit Deals**: Update and re-analyze existing deals
- **Delete Deals**: Remove deals with confirmation
- **Export PDF**: Professional deal reports

### 🎯 Advanced Features
- **Settings Page**: Customize default analysis assumptions
- **Toast Notifications**: Real-time feedback on all actions
- **Keyboard Shortcuts**: Power user features (Ctrl+N, Ctrl+D, etc.)
- **Loading States**: Professional skeleton loaders
- **Error Boundaries**: Graceful error handling
- **Analytics Tracking**: Built-in event tracking
- **Comprehensive Testing**: 75+ unit tests with 70% coverage threshold

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/renoblabs/Real-Estate-Analysis-Tool.git
cd Real-Estate-Analysis-Tool

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the SQL from `supabase/schema.sql`
4. Copy your Project URL and anon key to `.env.local`

See [SETUP.md](SETUP.md) for detailed instructions.

---

## 📚 Documentation

### Developer Documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - **NEW** How to contribute (coding standards, PR process)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - **NEW** System architecture & design decisions
- **[API.md](API.md)** - **NEW** Internal API reference for developers
- **[PRODUCTION_FIXES.md](PRODUCTION_FIXES.md)** - Production readiness improvements (v2.3.3)

### User Documentation
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user manual (300+ lines)
- **[ADVANCED_ANALYSIS_FEATURES.md](ADVANCED_ANALYSIS_FEATURES.md)** - Advanced analysis documentation (7 modules)
- **[SESSION_2_FEATURES.md](SESSION_2_FEATURES.md)** - Data visualization features summary

### Deployment Documentation
- **[SETUP.md](SETUP.md)** - Complete deployment instructions
- **[DEPLOY_COOLIFY.md](DEPLOY_COOLIFY.md)** - Self-hosted deployment guide
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Initial MVP summary

### Feature Documentation
- **[FEATURES.md](FEATURES.md)** - Comprehensive feature list (20+ major features)

---

## 🛠 Tech Stack

- **Framework**: Next.js 16+ with App Router & Turbopack
- **Language**: TypeScript (strict mode, 100% coverage)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS 4 + Custom Components
- **Forms**: React Hook Form + Zod validation
- **State**: React Hooks + Zustand
- **Visualizations**: **NEW** Recharts (bar, line, pie, radar charts)
- **PDF**: jsPDF
- **Testing**: **NEW** Jest + React Testing Library + ts-jest
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel / Coolify / Docker

---

## 📖 Project Structure

```
/app                          # Next.js pages
  /(auth)/login              # Authentication
  /dashboard                 # Main dashboard
  /analyze                   # Deal analysis form
  /deals                     # All deals list
  /deals/[id]                # Deal detail view (with charts!)
  /compare                   # NEW: Compare up to 3 deals
  /portfolio                 # NEW: Portfolio analytics
  /settings                  # User settings
/components                   # Reusable components
  /ui                        # UI primitives
  /charts                    # NEW: Recharts visualizations
    cash-flow-projection-chart.tsx
    deal-metrics-chart.tsx
  error-boundary.tsx         # Error handling
  loading-skeletons.tsx      # Loading states
/lib                         # Core business logic
  canadian-calculations.ts   # CMHC, LTT, Stress Test
  deal-analyzer.ts          # Main analysis engine
  deal-scoring.ts           # Scoring algorithm
  database.ts               # Supabase operations
  pdf-export.ts             # PDF generation
  analytics.ts              # Event tracking
/__tests__                   # NEW: Test suites
  /lib
    canadian-calculations.test.ts
    deal-scoring.test.ts
/types                       # TypeScript definitions
/constants                   # Market data & benchmarks
/supabase                    # Database schema
/jest.config.ts              # NEW: Jest configuration
/jest.setup.ts               # NEW: Test environment
```

---

## 🎯 Key Features

### v3.0 (Current) - Canadian Market Differentiators
✅ **ACRE™ Property Analyzer** - Don Campbell's scoring system (auto-integrated)
✅ **Mortgage Qualification Calculator** - GDS/TDS with OSFI B-20 stress test
✅ **ADU Opportunity Analyzer** - Signal detection + profit calculator + funding stack
✅ **Provincial ADU Database** - Regulations for ON, BC, AB, NS, QC
✅ **Municipal Hotspots** - ADU-friendly cities across Canada
✅ **Funding Stack Analyzer** - Federal, provincial, and municipal programs

### v2.0
✅ Complete CRUD for deals
✅ Advanced filtering & sorting
✅ Deal detail views
✅ PDF export
✅ User settings
✅ Toast notifications
✅ Error boundaries
✅ Loading skeletons
✅ Keyboard shortcuts
✅ Analytics tracking
✅ SEO optimization
✅ Code quality tools

### See [FEATURES.md](FEATURES.md) for complete list

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run tests (NEW)
npm test

# Run tests in watch mode (NEW)
npm run test:watch

# Generate test coverage report (NEW)
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## 📊 Canadian Calculations

### CMHC Insurance Rates (2024)
- 5-9.99% down: **4.00%** premium
- 10-14.99% down: **3.10%** premium
- 15-19.99% down: **2.80%** premium
- 20%+ down: **No insurance** required

### Land Transfer Tax
- **Ontario**: Tiered rates + Toronto municipal
- **BC**: Property Transfer Tax with exemptions
- **Alberta**: No LTT (registration fees only)
- **Nova Scotia**: Deed Transfer Tax
- **Quebec**: Welcome Tax (municipal-specific)

### OSFI B-20 Stress Test
Qualify at **higher of**:
- Contract rate + 2.0%
- 5.25% floor rate

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

See [SETUP.md](SETUP.md) for complete instructions.

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

---

## 📝 License

Copyright © 2024 REI OPS™. All rights reserved.

---

## 🎯 What Makes This Different

**Every existing tool** (DealCheck, PropStream, BiggerPockets) is US-focused.

**REI OPS™ is the ONLY platform** with:
- ✅ Accurate CMHC calculations
- ✅ All provincial land transfer taxes
- ✅ OSFI B-20 stress test compliance
- ✅ Canadian market benchmarks
- ✅ Regional regulatory differences

---

## 📞 Support

- **Documentation**: See docs in this repo
- **Issues**: Open a GitHub issue
- **Email**: support@reiops.ca (coming soon)

---

**Built with ❤️ for Canadian real estate investors**

🚀 **Status**: Production Ready | v2.3.3 - **Production Hardening Complete!**

**Latest Updates (v2.3.3):**
- ✅ All 5 critical production issues fixed (100%)
- ✅ Component refactoring (73% code reduction in analyze page)
- ✅ Error handling with retry logic & exponential backoff
- ✅ Loading states & professional toast notifications
- ✅ God function decomposition (Risk Analyzer: 8 functions, Break-Even: 9 functions)
- ✅ Comprehensive documentation (Contributing, Architecture, API guides)
