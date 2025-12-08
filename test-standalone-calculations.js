/**
 * Standalone Calculation Test - No Auth Required
 * Tests the deal analyzer with 103 Main St E, Port Colborne
 */

// Mock the types we need
const property103MainSt = {
    address: '103 Main Street E',
    city: 'Port Colborne',
    province: 'ON',
    postal_code: 'L3K 1S3',
    property_type: 'single_family',
    bedrooms: 2,
    bathrooms: 1,
    square_feet: 1200,
    year_built: 1950,
    lot_size: 3500,

    // Purchase & Financing
    purchase_price: 299900,
    down_payment_percent: 20,
    down_payment_amount: 59980,
    interest_rate: 5.5,
    amortization_years: 25,

    // Strategy
    strategy: 'buy_hold',
    property_condition: 'needs_work',
    renovation_cost: 15000,

    // Revenue
    monthly_rent: 1800,
    other_income: 0,
    vacancy_rate: 5,

    // Expenses
    property_tax_annual: 3000,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0
};

console.log('🏠 Testing: 103 Main St E, Port Colborne (No Auth Required)');
console.log('='.repeat(70));
console.log('\n📊 Property Data:');
console.log(`   Address: ${property103MainSt.address}, ${property103MainSt.city}`);
console.log(`   Purchase Price: $${property103MainSt.purchase_price.toLocaleString()}`);
console.log(`   Monthly Rent: $${property103MainSt.monthly_rent.toLocaleString()}`);
console.log(`   Down Payment: ${property103MainSt.down_payment_percent}% ($${property103MainSt.down_payment_amount.toLocaleString()})`);

// Manual calculation verification
console.log('\n🧮 Manual Calculations:');

// CMHC Insurance (20% down = no insurance)
const cmhc = property103MainSt.down_payment_percent >= 20 ? 0 :
    (property103MainSt.purchase_price * 0.031); // 3.1% for 10-14.99% down
console.log(`   CMHC Insurance: $${cmhc.toFixed(2)} (20% down = no insurance needed)`);

// Land Transfer Tax (Ontario)
const calculateOntarioLTT = (price) => {
    let ltt = 0;
    if (price <= 55000) {
        ltt = price * 0.005;
    } else if (price <= 250000) {
        ltt = 275 + (price - 55000) * 0.01;
    } else if (price <= 400000) {
        ltt = 275 + 1950 + (price - 250000) * 0.015;
    } else {
        ltt = 275 + 1950 + 2250 + (price - 400000) * 0.02;
    }
    return ltt;
};

const ltt = calculateOntarioLTT(property103MainSt.purchase_price);
console.log(`   Land Transfer Tax (ON): $${ltt.toFixed(2)}`);

// Mortgage Calculation
const mortgageAmount = property103MainSt.purchase_price - property103MainSt.down_payment_amount;
const monthlyRate = property103MainSt.interest_rate / 100 / 12;
const numPayments = property103MainSt.amortization_years * 12;
const monthlyPayment = mortgageAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

console.log(`   Mortgage Amount: $${mortgageAmount.toLocaleString()}`);
console.log(`   Monthly Mortgage Payment: $${monthlyPayment.toFixed(2)}`);

// Revenue
const effectiveMonthlyIncome = property103MainSt.monthly_rent * (1 - property103MainSt.vacancy_rate / 100);
console.log(`\n💰 Monthly Revenue:`);
console.log(`   Gross Rent: $${property103MainSt.monthly_rent.toFixed(2)}`);
console.log(`   Vacancy (${property103MainSt.vacancy_rate}%): -$${(property103MainSt.monthly_rent * property103MainSt.vacancy_rate / 100).toFixed(2)}`);
console.log(`   Effective Income: $${effectiveMonthlyIncome.toFixed(2)}`);

// Expenses
const monthlyPropertyTax = property103MainSt.property_tax_annual / 12;
const monthlyInsurance = property103MainSt.insurance_annual / 12;
const monthlyManagement = property103MainSt.monthly_rent * property103MainSt.property_management_percent / 100;
const monthlyMaintenance = property103MainSt.monthly_rent * property103MainSt.maintenance_percent / 100;

const totalMonthlyExpenses = monthlyPayment + monthlyPropertyTax + monthlyInsurance +
    monthlyManagement + monthlyMaintenance + property103MainSt.utilities_monthly +
    property103MainSt.hoa_condo_fees_monthly + property103MainSt.other_expenses_monthly;

console.log(`\n💸 Monthly Expenses:`);
console.log(`   Mortgage: $${monthlyPayment.toFixed(2)}`);
console.log(`   Property Tax: $${monthlyPropertyTax.toFixed(2)}`);
console.log(`   Insurance: $${monthlyInsurance.toFixed(2)}`);
console.log(`   Property Mgmt (${property103MainSt.property_management_percent}%): $${monthlyManagement.toFixed(2)}`);
console.log(`   Maintenance (${property103MainSt.maintenance_percent}%): $${monthlyMaintenance.toFixed(2)}`);
console.log(`   Utilities: $${property103MainSt.utilities_monthly.toFixed(2)}`);
console.log(`   Total Expenses: $${totalMonthlyExpenses.toFixed(2)}`);

// Cash Flow
const monthlyCashFlow = effectiveMonthlyIncome - totalMonthlyExpenses;
const annualCashFlow = monthlyCashFlow * 12;

console.log(`\n📈 Cash Flow:`);
console.log(`   Monthly: $${monthlyCashFlow.toFixed(2)} ${monthlyCashFlow < 0 ? '❌ NEGATIVE' : '✅'}`);
console.log(`   Annual: $${annualCashFlow.toFixed(2)}`);

// Total Cash Invested
const totalCashInvested = property103MainSt.down_payment_amount +
    ltt +
    property103MainSt.renovation_cost +
    3000; // Closing costs estimate

console.log(`\n💼 Investment:`);
console.log(`   Down Payment: $${property103MainSt.down_payment_amount.toLocaleString()}`);
console.log(`   Land Transfer Tax: $${ltt.toFixed(2)}`);
console.log(`   Renovation: $${property103MainSt.renovation_cost.toLocaleString()}`);
console.log(`   Closing Costs: $3,000 (est)`);
console.log(`   Total Cash Invested: $${totalCashInvested.toLocaleString()}`);

// Returns
const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;

const annualRevenue = effectiveMonthlyIncome * 12;
const annualOperatingExpenses = (totalMonthlyExpenses - monthlyPayment) * 12;
const noi = annualRevenue - annualOperatingExpenses;
const capRate = (noi / property103MainSt.purchase_price) * 100;

const dscr = effectiveMonthlyIncome / monthlyPayment;

console.log(`\n📊 Key Metrics:`);
console.log(`   Cash-on-Cash Return: ${cashOnCashReturn.toFixed(2)}% ${cashOnCashReturn < 0 ? '❌' : cashOnCashReturn > 8 ? '✅' : '⚠️'}`);
console.log(`   Cap Rate: ${capRate.toFixed(2)}% ${capRate < 4 ? '❌' : capRate > 6 ? '✅' : '⚠️'}`);
console.log(`   DSCR: ${dscr.toFixed(2)} ${dscr < 1.2 ? '⚠️' : '✅'}`);

// Deal Grading
let dealScore = 50; // Base score

// Cash flow scoring (-10 to +20 points)
if (monthlyCashFlow < -500) dealScore -= 10;
else if (monthlyCashFlow < -200) dealScore -= 5;
else if (monthlyCashFlow < 0) dealScore -= 2;
else if (monthlyCashFlow > 500) dealScore += 20;
else if (monthlyCashFlow > 200) dealScore += 10;
else if (monthlyCashFlow > 0) dealScore += 5;

// Cap rate scoring (-10 to +15 points)
if (capRate < 3) dealScore -= 10;
else if (capRate < 4) dealScore -= 5;
else if (capRate > 7) dealScore += 15;
else if (capRate > 6) dealScore += 10;
else if (capRate > 5) dealScore += 5;

// DSCR scoring (-5 to +10 points)
if (dscr < 1.0) dealScore -= 5;
else if (dscr > 1.5) dealScore += 10;
else if (dscr > 1.25) dealScore += 5;

// CoC scoring (-10 to +15 points)
if (cashOnCashReturn < -5) dealScore -= 10;
else if (cashOnCashReturn < 0) dealScore -= 5;
else if (cashOnCashReturn > 15) dealScore += 15;
else if (cashOnCashReturn > 10) dealScore += 10;
else if (cashOnCashReturn > 8) dealScore += 5;

dealScore = Math.max(0, Math.min(100, dealScore)); // Clamp between 0-100

let dealGrade;
if (dealScore >= 90) dealGrade = 'A';
else if (dealScore >= 80) dealGrade = 'B';
else if (dealScore >= 70) dealGrade = 'C';
else if (dealScore >= 60) dealGrade = 'D';
else dealGrade = 'F';

console.log(`\n🎯 Deal Score: ${dealScore}/100 (Grade: ${dealGrade})`);

console.log(`\n📋 Analysis:`);
if (monthlyCashFlow < 0) {
    console.log(`   ❌ NEGATIVE cash flow of $${Math.abs(monthlyCashFlow).toFixed(2)}/month`);
    console.log(`   ⚠️  This property loses money each month`);

    // Calculate break-even rent
    const breakEvenRent = (totalMonthlyExpenses / (1 - property103MainSt.vacancy_rate / 100));
    console.log(`   💡 Need $${breakEvenRent.toFixed(2)}/month rent to break even`);
    console.log(`   💡 That's ${((breakEvenRent / property103MainSt.monthly_rent - 1) * 100).toFixed(1)}% more than current rent`);
}

if (capRate < 5) {
    console.log(`   ⚠️  Low cap rate (${capRate.toFixed(2)}%) - expect 5-6%+ for rental properties`);
}

if (dealGrade === 'F' || dealGrade === 'D') {
    console.log(`   🚫 PASS on this deal - Poor investment metrics`);
} else if (dealGrade === 'C') {
    console.log(`   ⚠️  Marginal deal - Negotiate better terms`);
}

console.log('\n' + '='.repeat(70));
console.log('✅ Calculation Test Complete (No Supabase Required)');
console.log('='.repeat(70));

// Summary
console.log('\n📄 SUMMARY:');
console.log(`Property: ${property103MainSt.address}, ${property103MainSt.city}, ${property103MainSt.province}`);
console.log(`Price: $${property103MainSt.purchase_price.toLocaleString()}`);
console.log(`Monthly Cash Flow: $${monthlyCashFlow.toFixed(2)} ${monthlyCashFlow < 0 ? '(NEGATIVE)' : ''}`);
console.log(`Cash-on-Cash: ${cashOnCashReturn.toFixed(2)}%`);
console.log(`Deal Grade: ${dealGrade} (Score: ${dealScore}/100)`);
console.log(`\nVerdict: ${dealGrade === 'F' || dealGrade === 'D' ? 'PASS ❌' : dealGrade === 'C' ? 'MAYBE ⚠️' : 'GOOD DEAL ✅'}\n`);
