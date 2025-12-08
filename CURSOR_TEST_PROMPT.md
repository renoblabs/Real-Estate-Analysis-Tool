# Cursor AI Testing Prompt

Copy and paste this into Cursor AI to help you test the 103 Main St property analysis:

---

## 🎯 TESTING MISSION

I need you to help me test the REI OPS real estate analysis app with a real property:

**Property:** 103 Main Street E, Port Colborne, ON (MLS# X12531322)
**Price:** $299,900
**Type:** 2 bed / 1 bath single family home

## 📋 WHAT TO TEST

### 1. Run the Automated E2E Test

**Command:**
```bash
npm run test:e2e -- tests/103-main-st.spec.ts
```

**What it tests:**
- Complete signup flow
- Property data entry (all fields)
- Analysis calculation
- Deal saving to database
- Deal viewing/editing
- Status workflow

**Expected outcome:**
- All tests should PASS ✅
- Should see negative cash flow (this is a challenging deal)
- Deal should save to database
- Deal should appear in /deals list

### 2. Check for Calculation Errors

**Review the test output for:**

**CMHC Insurance:**
- Should be $0 (20% down payment = no insurance)
- If it shows > $0, there's a bug

**Land Transfer Tax (Ontario):**
- Should be approximately $3,472
- Formula: Tiered rates on $299,900
- If significantly different, check lib/canadian-calculations.ts

**Mortgage Payment:**
- Should be approximately $1,506/month
- At 5.5% interest, 25-year amortization
- If off by more than $50, check calculation

**Monthly Cash Flow:**
- Should be NEGATIVE (around -$470)
- Revenue: $1,800 rent - 5% vacancy = $1,710
- Expenses: Mortgage + tax + insurance + management + maintenance
- If positive, something is wrong

**Deal Score:**
- Should be LOW (40-50 out of 100)
- Grade: D or F
- This is expected - it's a tough deal

### 3. Look for These Common Issues

**Check for:**
- [ ] Form validation errors when entering data
- [ ] Calculation errors (wrong math)
- [ ] Database save failures
- [ ] Missing fields in the analysis results
- [ ] React/TypeScript errors in console
- [ ] Supabase connection errors
- [ ] Slow performance (> 3 seconds for analysis)
- [ ] UI/UX issues (confusing labels, broken layout)

### 4. Test Edge Cases

**Try these variations:**

**Test A: Lower Down Payment (triggers CMHC)**
```
Down Payment: 10%
Expected: CMHC insurance should be ~$9,297 (3.10% of mortgage)
```

**Test B: Higher Rent (makes deal viable)**
```
Monthly Rent: $2,300
Expected: Positive cash flow, higher deal score
```

**Test C: Different Province**
```
Province: BC
Expected: Different land transfer tax calculation
```

**Test D: BRRRR Strategy**
```
Strategy: BRRRR
After Repair Value: $350,000
Expected: Shows cash recovered, refinance calculations
```

### 5. Check Database Persistence

**After running tests:**
```bash
# Check if deals were saved
# Look in Supabase dashboard OR
# Check /deals page in the app
```

**Verify:**
- [ ] Deal appears in deals list
- [ ] All property data is saved
- [ ] Status is "analyzing"
- [ ] Can edit and re-save
- [ ] Can delete the deal

### 6. Test Advanced Features (if implemented)

**Sensitivity Analysis:**
- Vary rent by ±20%
- Vary purchase price by ±10%
- Should show impact on cash flow/returns

**Break-Even Analysis:**
- Find minimum rent needed for $0 cash flow
- Should be around $2,270/month

**Cash Flow Projections:**
- 10-year forecast
- Should show equity build-up
- Should account for appreciation

**PDF Export:**
- Click "Export PDF"
- Check if PDF contains all data
- Verify formatting

## 🐛 DEBUGGING HELP

### If Tests Fail:

**1. Check server is running:**
```bash
npm run dev
# Should see: Ready in X.Xs
```

**2. Check environment variables:**
```bash
cat .env.local
# Should see:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - REPLIERS_API_KEY
```

**3. Check Supabase connection:**
Open browser console at http://localhost:3000 and run:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
// Should see: https://ljglboveufuwzolhdfue.supabase.co
```

**4. Check database schema:**
- Open Supabase dashboard
- Go to Table Editor
- Verify `deals` table exists
- Check if test deals are saving

**5. Check for TypeScript errors:**
```bash
npm run type-check
# Should have no errors
```

### Common Error Solutions:

**Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
- Solution: Check .env.local exists and has correct values

**Error: "Failed to save deal"**
- Solution: Check Supabase connection, verify RLS policies

**Error: "Analysis failed"**
- Solution: Check lib/deal-analyzer.ts for errors, check console logs

**Error: "Element not found" in Playwright**
- Solution: Check if UI changed, update selectors in test

## 📊 EXPECTED TEST RESULTS

### Passing Test Output:
```
✅ Account created
✅ Analyze page loaded
✅ All property data entered
✅ Analysis completed
✅ Calculations verified
✅ Deal appears in deals list
✅ Deal details page loaded
✅ Edit functionality works

Test Summary: 8 passed
```

### Expected Metrics for 103 Main St:
```
Purchase Price: $299,900
Monthly Cash Flow: -$470 (NEGATIVE)
Cash-on-Cash Return: -7.5%
Cap Rate: 4.4%
DSCR: 1.14
Deal Score: 45/100
Deal Grade: D or F
CMHC Premium: $0
Land Transfer Tax: $3,472
Monthly Mortgage: $1,506
```

## 🚀 RUNNING THE TESTS

### Quick Test (automated):
```bash
# Run the 103 Main St specific test
npm run test:e2e -- tests/103-main-st.spec.ts --headed

# Or run all E2E tests
npm run test:e2e
```

### Manual Test (in browser):
```bash
# 1. Start server
npm run dev

# 2. Open browser to:
http://localhost:3000/analyze

# 3. Fill in data from TEST_103_MAIN_ST.md

# 4. Click "Analyze Deal"

# 5. Verify calculations match expected results above
```

### Debug Mode (see what Playwright is doing):
```bash
npm run test:e2e -- tests/103-main-st.spec.ts --headed --debug
```

## 📝 REPORT FINDINGS

**After testing, report:**

### ✅ What Works:
- List features that passed tests
- Note any impressive functionality

### ❌ What Breaks:
- Specific error messages
- Steps to reproduce
- Console errors
- Screenshots if UI issues

### 🤔 What's Confusing:
- UX issues
- Unclear labels
- Missing help text
- Complex workflows

### 💡 What's Missing:
- Expected features not found
- Incomplete functionality
- Missing validations

## 🎯 SUCCESS CRITERIA

**Tests are successful if:**
- [ ] All Playwright tests pass
- [ ] Deal saves to database
- [ ] Calculations are accurate (within 5%)
- [ ] No console errors
- [ ] Can view/edit saved deals
- [ ] UI is responsive and clear
- [ ] Performance is acceptable (< 3s for analysis)

## 🔧 ADDITIONAL COMMANDS

```bash
# Run tests in watch mode
npm run test:e2e -- --ui

# Run specific test
npm run test:e2e -- -g "Verify specific calculations"

# Generate test report
npm run test:e2e -- --reporter=html

# Run with trace (for debugging)
npm run test:e2e -- --trace on
```

---

## 💬 CURSOR AI INSTRUCTIONS

**When helping with this testing:**

1. **Run the automated test first** and show me the results
2. **Analyze any failures** and suggest fixes
3. **Check the calculation logic** in lib/deal-analyzer.ts
4. **Review the UI** for UX issues
5. **Suggest improvements** based on what you find
6. **Help debug** any errors that occur

**Focus on:**
- Calculation accuracy (most critical)
- Database persistence
- Error handling
- User experience
- Performance

**Don't worry about:**
- Code style (unless it causes bugs)
- Minor UI tweaks (unless confusing)
- Edge cases not mentioned above

---

**Ready to test! Start by running:**
```bash
npm run test:e2e -- tests/103-main-st.spec.ts --headed
```
