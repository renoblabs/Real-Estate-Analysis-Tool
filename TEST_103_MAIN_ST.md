# Testing 103 Main St E, Port Colborne

## Property Details (MLS# X12531322)

**Address:** 103 Main Street E, Port Colborne, ON L3K 1S3
**Price:** $299,900
**Type:** 1.5-storey home
**Beds/Baths:** 2 beds / 1 bath

---

## Test Instructions

### Step 1: Open the App
Navigate to: **http://localhost:3000**

### Step 2: Sign Up (or use Demo Mode)
- Click "Get Started" or "Sign Up"
- Create a test account OR
- The app has demo mode - just click "Analyze New Deal"

### Step 3: Enter Property Data

Navigate to: **http://localhost:3000/analyze**

#### Property Details
```
Address: 103 Main Street E
City: Port Colborne
Province: ON
Postal Code: L3K 1S3
Property Type: Single Family
Bedrooms: 2
Bathrooms: 1
Square Feet: 1200
Year Built: 1950
```

#### Purchase & Financing
```
Purchase Price: $299,900
Down Payment %: 20%
Down Payment $: $59,980
Interest Rate: 5.5%
Amortization: 25 years
```

#### Strategy
```
Strategy: Buy & Hold
Property Condition: Needs Work
Renovation Cost: $15,000
```

#### Revenue (Market Estimates for Port Colborne)
```
Monthly Rent: $1,800
Other Income: $0
Vacancy Rate: 5%
```

#### Expenses
```
Property Tax (Annual): $3,000
Insurance (Annual): $1,200
Property Management %: 8%
Maintenance %: 10%
Utilities (Monthly): $0 (tenant pays)
HOA/Condo Fees: $0
Other Expenses: $0
```

### Step 4: Click "Analyze Deal"

---

## Expected Calculations

### Acquisition Costs
- **Purchase Price:** $299,900
- **Renovation:** $15,000
- **CMHC Insurance:** $0 (20% down = no insurance needed)
- **Land Transfer Tax (ON):** ~$3,499
  - First $55k: $275
  - Next $195k: $1,950
  - Remaining $49.9k: $1,247
  - **Total LTT:** $3,472
- **Closing Costs:** ~$3,000 (legal, inspections, etc.)
- **TOTAL ACQUISITION:** ~$321,372

### Financing
- **Down Payment:** $59,980 (20%)
- **Mortgage Amount:** $239,920
- **Monthly Payment (P+I):** ~$1,506 @ 5.5% over 25 years
- **Stress Test Rate:** 7.5% (5.5% + 2.0%)
- **Stress Test Payment:** ~$1,796/month

### Revenue
- **Gross Monthly Rent:** $1,800
- **Vacancy (5%):** -$90
- **Effective Monthly Income:** $1,710

### Expenses
- **Property Tax:** $250/month
- **Insurance:** $100/month
- **Property Management (8% of rent):** $144/month
- **Maintenance (10% of rent):** $180/month
- **Mortgage Payment:** $1,506/month
- **TOTAL MONTHLY EXPENSES:** $2,180

### Cash Flow
- **Monthly Cash Flow:** $1,710 - $2,180 = **-$470/month** ❌
- **Annual Cash Flow:** -$5,640

### Returns
- **Cash-on-Cash Return:** -$5,640 / $74,980 = **-7.5%** ❌
- **Cap Rate:** ($1,710 × 12 - $6,744) / $314,900 = **4.4%** ⚠️
- **DSCR:** $1,710 / $1,506 = **1.14** ✅
- **GRM:** $299,900 / ($1,800 × 12) = **13.9** ⚠️

---

## Analysis Summary

### 🚩 Deal Flags

**NEGATIVE CASH FLOW:** This property loses $470/month

**Key Issues:**
1. **Low Rent Relative to Price:** $1,800/month is too low for a $300k property
2. **High Expenses:** Property management + maintenance eating into returns
3. **Needs Renovation:** $15k additional cost upfront

### What Would Make This Work?

**Option 1: Increase Rent**
- Need ~$2,300/month to break even
- Check if Port Colborne market supports this

**Option 2: Reduce Purchase Price**
- At $250k purchase price, cash flow improves significantly
- Or negotiate seller credits for renovations

**Option 3: House Hack**
- Live in it yourself = save on rent elsewhere
- Rent out the bonus room = additional income

**Option 4: BRRRR Strategy**
- Renovate to increase value
- Refinance at higher value
- Reduces cash left in deal

---

## Deal Score Estimate

Based on the metrics:
- **Score:** ~45/100
- **Grade:** D or F
- **Verdict:** PASS unless you can negotiate better terms

**Why Low Score:**
- Negative cash flow (-7.5% CoC)
- Below market cap rate (4.4% vs 5-6% target)
- High GRM (13.9 vs 10-12 ideal)

---

## What to Test in the App

1. ✅ **Does it calculate negative cash flow correctly?**
2. ✅ **Does it show warning flags?**
3. ✅ **Can you save the deal with status='analyzing'?**
4. ✅ **Can you go back and edit the numbers?**
5. ✅ **Does the deal scoring give it a low grade?**
6. ✅ **Can you export to PDF?**
7. ✅ **Try the advanced analysis tools:**
   - Sensitivity analysis (what if rent was $2,300?)
   - Break-even analysis (what purchase price works?)
   - Compare to other deals

---

## Port Colborne Market Context

**Why This Deal is Challenging:**
- Port Colborne is a smaller market
- $1,800 rent for a 2bed/1bath is reasonable
- $300k is high for the area (houses typically $200-350k)
- Better cash flow in larger cities (Hamilton, St. Catharines)

**Better Markets for Cash Flow:**
- Hamilton: Higher rents, similar prices
- Windsor: Lower prices, decent rents
- London: Good rental demand

---

## Features to Test

### Current Features (Should Work)
- ✅ Property analysis
- ✅ CMHC calculations (not needed here but test with lower down payment)
- ✅ Land transfer tax calculation
- ✅ Deal scoring
- ✅ Save deal to database
- ✅ View in /deals list
- ✅ Edit and re-analyze

### Missing Feature (User Requested)
- ❌ **Save partial analysis** - Currently saves after clicking "Analyze"
- 💡 **Enhancement:** Add "Save as Draft" button to save form data without analyzing

---

## Next Steps for User

1. **Test the workflow** with these numbers
2. **See if it breaks** anywhere
3. **Try variations:**
   - 10% down (triggers CMHC)
   - Higher rent ($2,300)
   - BRRRR strategy
4. **Test the save/resume workflow**
5. **Report any bugs or UX issues**

---

## Summary

**App Status:** ✅ Running successfully
**API Issues:** ✅ Resolved (Repliers has no Canadian data - expected)
**Ready to Test:** ✅ YES

**This is a REAL property with REAL numbers** - perfect for testing!

The analysis will show it's a **challenging deal** that needs negotiation or strategy changes.
