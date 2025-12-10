# REI OPS™ - Implementation Plan for Missing Features

**Date:** November 23, 2025
**Goal:** Build out missing features from Canadian RE Platform plan
**Budget:** $150 Claude Code credits (estimated $25-30 used for initial build)

---

## 🎯 Priority 1: Core Value Features (Weeks 1-2)

### 1. ACRE Property Analyzer
**Effort:** Medium | **Value:** High | **Est. Credits:** $10-15

Implement Don R. Campbell's ACRE scoring system to provide actionable Buy/No-Buy recommendations.

**Implementation:**
- Create `/lib/acre-analyzer.ts`
- Four scoring dimensions:
  1. **Cash Flow Score (40%)**: Calculate rent-to-price ratio, compare to 0.8% benchmark
  2. **Location Score (30%)**: Population growth, employment, infrastructure (manual inputs for MVP)
  3. **Appreciation Potential (20%)**: Historical data, market trends
  4. **Risk Assessment (10%)**: Use existing risk dashboard data
- Output: 0-100 ACRE score with grade (A-F)
- Add to main analysis page as new tab
- Include book citation: "Based on Don R. Campbell's ACRE System"

**Files to Create:**
- `/lib/acre-analyzer.ts` - Core scoring logic
- `/components/analysis/acre-score-display.tsx` - Visual display component
- `/app/analyze/acre/page.tsx` - Dedicated ACRE analysis page

**Success Criteria:**
- [ ] ACRE score calculated for any deal
- [ ] Visual grade display (A-F with color coding)
- [ ] Breakdown showing each dimension's contribution
- [ ] Buy/No-Buy recommendation based on threshold (>70 = Buy)

---

### 2. Mortgage Qualification Calculator (GDS/TDS)
**Effort:** Medium | **Value:** High | **Est. Credits:** $8-12

Add comprehensive mortgage qualification tools with Canadian lending standards.

**Implementation:**
- Create `/lib/mortgage-qualification.ts`
- **GDS Ratio**: (Housing costs / Gross income) <= 39%
  - Housing costs = Mortgage + Property Tax + Heating + 50% of Condo Fees
- **TDS Ratio**: (All debt payments / Gross income) <= 44%
  - All debt = Housing costs + Credit cards + Car loans + Student loans
- **Lender Approval Odds**:
  - A Lender (Prime): GDS < 39%, TDS < 44%, Credit score >= 680
  - B Lender (Alt-A): GDS < 42%, TDS < 47%, Credit score >= 600
  - Private: GDS/TDS flexible, focus on equity/DSCR
- Add to `/app/mortgage-qualification/page.tsx`

**Files to Create:**
- `/lib/mortgage-qualification.ts` - GDS/TDS calculators
- `/components/mortgage/gds-tds-calculator.tsx` - Input form
- `/components/mortgage/qualification-results.tsx` - Results display
- `/app/mortgage-qualification/page.tsx` - Main page

**Success Criteria:**
- [ ] GDS/TDS calculated based on user inputs
- [ ] Lender approval odds (A/B/Private)
- [ ] Visual indicators (green/yellow/red for ratios)
- [ ] Tooltips citing Canadian lending standards

---

## 🎯 Priority 2: User Experience (Weeks 3-4)

### 3. Onboarding Wizard
**Effort:** Medium-High | **Value:** Medium | **Est. Credits:** $12-18

Guide new users through their first property analysis with a multi-step wizard.

**Implementation:**
- Create `/app/onboarding/page.tsx` with stepper UI
- **Step 1:** Welcome + explain ACRE/analysis
- **Step 2:** Property basics (address, type, purchase price)
  - Mock Canada Post address autocomplete
- **Step 3:** Financing details (down payment, interest rate)
- **Step 4:** Revenue & expenses
- **Step 5:** Review & analyze
- Save to database and redirect to analysis results
- Use `react-hook-form` + `zod` for validation
- Show progress bar (e.g., "Step 2 of 5")

**Files to Create:**
- `/app/onboarding/page.tsx` - Main wizard
- `/components/onboarding/step-1-welcome.tsx`
- `/components/onboarding/step-2-property.tsx`
- `/components/onboarding/step-3-financing.tsx`
- `/components/onboarding/step-4-revenue.tsx`
- `/components/onboarding/step-5-review.tsx`

**Success Criteria:**
- [ ] 5-step wizard with validation
- [ ] Progress indicator
- [ ] Back/Next navigation
- [ ] Saves deal to database on completion
- [ ] First-time user auto-redirected to wizard

---

## 🎯 Priority 3: ADU & Zoning Arbitrage Engine (Weeks 5-6)
**Effort:** High | **Value:** Very High (Unique Selling Point) | **Est. Credits:** $20-30

Build a system to identify properties with hidden value through Additional Dwelling Unit (ADU) conversion or zoning arbitrage.

**Implementation:**
- **Signal Detection Engine:**
  - Scan listing descriptions for keywords: "separate entrance", "detached garage", "high ceilings", "in-law suite".
  - Identify "Zoning Mismatch": Listed as single-family but in R2/R3 zone (requires zoning map overlay).
  - Market Timing: Flag properties with DOM > 60 or recent price drops.
- **ADU Profit Calculator:**
  - **Gap Analysis Formula:** `(Post-Reno Value + Rental Income) - (Purchase + Reno + Carrying Costs)`
  - **Funding Stack Calculator:** Auto-apply Canada Secondary Suite Loan ($80k @ 2%), municipal grants, and rebates.
  - **Renovation Estimator:** Standard costs for Basement Suite ($40-60k) vs Garden Suite ($80-120k).
- **Risk Adjustment Layer:**
  - Penalize for: Septic (vs Sewer), Heritage designation, Flood zone.

**Files to Create:**
- `/lib/adu-analyzer.ts` - Core profit & gap analysis logic
- `/lib/signal-detector.ts` - Keyword & zoning signal logic
- `/components/adu/adu-potential-card.tsx` - Visual indicator of ADU potential
- `/app/analyze/adu/page.tsx` - Dedicated ADU analysis view

**Success Criteria:**
- [ ] Detects "hidden" ADU potential in listings
- [ ] Calculates ROI for adding a basement or garden suite
- [ ] Auto-suggests applicable government grants/loans

---

## 🎯 Priority 4: Advanced Developer Tools (Weeks 7-8)
**Effort:** Very High | **Value:** Extreme (Developer Niche) | **Est. Credits:** $30-40

Transform the platform into a developer's operating system with advanced strategies.

**Implementation:**
- **"Dad's Rules" Engine (Local Knowledge Layer):**
  - Codify local insights: "Avoid Stanley St (foundations)", "North End (sewer access)".
  - Flag "Estate Sales" and "Corner Lots" (ADU parking bonus).
- **DIY Renovation Calculator:**
  - Calculate "Sweat Equity": `Contractor Cost - (Materials + Permits)`.
  - Filters: Structural simplicity, electrical capacity, lot access.
- **New Construction Multi-Family Analyzer:**
  - Compare `Renovation ROI` vs `New Build 3-Plex ROI`.
  - Purpose-built ADU modeling (Main + Upper + Garden).
- **Lot Severance Engine:**
  - Identify severance candidates: Frontage >= 100ft, Depth >= 150ft.
  - Calculate: `(Lot A Value + Lot B Value) - (Acquisition + Severance Costs)`.

**Files to Create:**
- `/lib/strategies/diy-calculator.ts`
- `/lib/strategies/new-construction.ts`
- `/lib/strategies/severance.ts`
- `/components/developer/strategy-comparison.tsx`

**Success Criteria:**
- [ ] Calculate "Sweat Equity" potential
- [ ] Compare Reno vs New Build scenarios
- [ ] Identify potential lot severance opportunities

---

## 🎯 Priority 5: Knowledge Enhancement (Weeks 9-10)

### 4. Knowledge Vault
**Effort:** High | **Value:** High (long-term) | **Est. Credits:** $15-20

Systematically extract and structure insights from Canadian RE books.

**Implementation:**
- **Phase 1:** Manual extraction (use Claude to help)
  - Extract key formulas, strategies, legal tips from PDFs
  - Structure as JSON: `{ source, category, content, tags, page }`
  - Categories: formula, strategy, legal, market_data, case_study
- **Phase 2:** Create searchable database
  - Store in Supabase `knowledge_vault` table
  - Full-text search capability
  - Tag-based filtering
- **Phase 3:** Integration
  - Add book citations to analysis results
  - Show relevant "Learn More" tips based on analysis
  - Create `/app/knowledge/page.tsx` for browsing vault
- **Phase 4:** AI Enhancement (future)
  - Use vault as RAG context for AI assistant
  - Generate personalized recommendations

**Files to Create:**
- `/lib/knowledge-vault/book-insights.json` - Initial data
- `/lib/knowledge-vault/search.ts` - Search logic
- `/components/knowledge/insight-card.tsx` - Display component
- `/app/knowledge/page.tsx` - Browse interface
- `/supabase/migrations/003_knowledge_vault.sql` - DB schema

**Data Structure:**
```json
{
  "id": "acre_ch3_cashflow",
  "source": "Don R. Campbell - Real Estate Investing in Canada",
  "category": "formula",
  "title": "ACRE Cash Flow Score",
  "content": "ACRE cash flow score formula: (Monthly Rent / Purchase Price) * 100. Target: >0.8% for positive cash flow markets.",
  "tags": ["cash_flow", "acre", "property_selection"],
  "chapter": "Chapter 3",
  "page": 47,
  "priority": "high"
}
```

**Success Criteria:**
- [ ] 100+ insights extracted and structured
- [ ] Searchable by keyword and tag
- [ ] Displayed in relevant analysis sections
- [ ] Browse page with filters (category, source, tags)

---

## 🎯 Priority 4: Architecture (Weeks 7-8)

### 5. Multi-Tenant Architecture (Enterprise Tier)
**Effort:** Very High | **Value:** Medium (future growth) | **Est. Credits:** $25-35

Prepare for enterprise clients with multi-tenant support.

**Implementation:**
- **Database Schema Changes:**
  - Create `organizations` table
  - Create `organization_members` table (user-org mapping)
  - Add `organization_id` to `deals`, `settings`, etc.
  - Row-level security based on org membership
- **UI Changes:**
  - Org switcher in header
  - Team member invitation flow
  - Role-based permissions (Admin, Editor, Viewer)
- **White-labeling:**
  - Custom branding per org (logo, colors)
  - Custom domain support
  - Branded PDFs

**Files to Create:**
- `/lib/organizations.ts` - Org management logic
- `/components/organizations/org-switcher.tsx`
- `/components/organizations/invite-member.tsx`
- `/app/organizations/page.tsx` - Org settings
- `/supabase/migrations/004_multi_tenant.sql`

**Success Criteria:**
- [ ] Organizations can be created
- [ ] Users can belong to multiple orgs
- [ ] Data isolation (RLS enforced)
- [ ] Team invitations work
- [ ] Basic white-labeling (logo + colors)

---

## 📊 Implementation Timeline

**Total Estimated Credits:** $70-100 (well within budget!)

### Week 1-2: Core Value
- ✅ ACRE Property Analyzer
- ✅ Mortgage Qualification (GDS/TDS)

### Week 3-4: User Experience
- ✅ Onboarding Wizard

### Week 5-6: Knowledge Enhancement
- ✅ Knowledge Vault (Phase 1-3)

### Week 7-8: Architecture (Optional)
- ⚠️ Multi-Tenant (only if needed for enterprise sales)

### Phase 4: Data Standardization (Future)
- [ ] **RESO Data Dictionary Alignment**
  - Refactor `PropertyInputs` and database schema to match [RESO Data Dictionary](https://www.reso.org/data-dictionary/) standards.
  - Ensure field names (e.g., `LivingArea`, `ListPrice`, `StandardStatus`) align with Canadian CREA/DDF feeds.
  - This prepares the platform for direct DDF integration.
- [ ] **Advanced Data Feeds**
  - Integrate direct CREA DDF feed (requires RESO alignment).
  - Add historical market data tracking.

---

## 🚀 Quick Wins (Can do now!)

### Immediate Improvements (<$5 credits)
1. **Add "Learn More" tooltips** to existing calculations
   - Cite formulas from Canadian RE books
   - Explain CMHC, LTT, OSFI B-20 in plain language

2. **Enhanced Dashboard**
   - Add "Recommended Next Steps" widget
   - Show ACRE score summary on deal cards

3. **PDF Export Improvements**
   - Include ACRE score in reports
   - Add book citations

---

## 💡 Recommendations

### Start Here (Highest ROI):
1. **ACRE Analyzer** - Instant differentiation, ties to Canadian expertise
2. **GDS/TDS Calculator** - Solves real pain point for investors
3. **Knowledge Vault (Phase 1)** - Start manually, automate later

### Save for Later:
- Multi-tenant architecture - Only needed when you have enterprise leads
- Advanced AI features - Build after validating PMF with retail users

---

## 🎯 Success Metrics

**After Priority 1 & 2:**
- Users can get Buy/No-Buy recommendations (ACRE)
- Users can check mortgage qualification before applying
- New users guided through first analysis
- 50%+ of users complete onboarding wizard

**After Priority 3:**
- 100+ knowledge vault entries
- Users browse vault for education
- Analysis results cite book insights
- Increased trust/authority from book references

---

## 📝 Notes

- All features maintain Canadian focus (CMHC, provincial regs, etc.)
- Each feature should have tests (Jest)
- Document new features in `FEATURES.md`
- Update `README.md` with new capabilities
- Consider user feedback before building Priority 4

**Next Action:** Review this plan and choose which feature to build first!
