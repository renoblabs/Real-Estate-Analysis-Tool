# REI OPS™ 🇨🇦

**The Only Investment Analysis Platform Built for Canadian Real Estate**

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)](https://github.com/renoblabs/Real-Estate-Analysis-Tool)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

REI OPS™ is a comprehensive real estate investment analysis tool designed specifically for the Canadian market, with accurate calculations for CMHC insurance, provincial land transfer taxes, OSFI B-20 stress tests, and regional market intelligence.

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

### 💼 Portfolio Management
- **All Deals List**: View, filter, and sort all your deals
- **Deal Details**: Complete analysis view for any saved deal
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

- **[SETUP.md](SETUP.md)** - Complete deployment instructions
- **[FEATURES.md](FEATURES.md)** - Comprehensive feature list (15+ major features)
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Initial MVP summary

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + Custom Components
- **Forms**: React Hook Form + Zod validation
- **State**: React Hooks
- **PDF**: jsPDF
- **Deployment**: Vercel-ready

---

## 📖 Project Structure

```
/app                          # Next.js pages
  /(auth)/login              # Authentication
  /dashboard                 # Main dashboard
  /analyze                   # Deal analysis form
  /deals                     # All deals list
  /deals/[id]                # Deal detail view
  /settings                  # User settings
/components                   # Reusable components
  /ui                        # UI primitives
  error-boundary.tsx         # Error handling
  loading-skeletons.tsx      # Loading states
/lib                         # Core business logic
  canadian-calculations.ts   # CMHC, LTT, Stress Test
  deal-analyzer.ts          # Main analysis engine
  deal-scoring.ts           # Scoring algorithm
  database.ts               # Supabase operations
  pdf-export.ts             # PDF generation
  analytics.ts              # Event tracking
/types                       # TypeScript definitions
/constants                   # Market data & benchmarks
/supabase                    # Database schema
```

---

## 🎯 Key Features

### v2.0 (Current)
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

🚀 **Status**: Production Ready | v2.0.0
