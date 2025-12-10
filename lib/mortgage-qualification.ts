export interface MortgageQualInput {
    grossAnnualIncome: number;
    monthlyMortgagePayment: number;
    annualPropertyTax: number;
    monthlyHeatingCost: number;
    monthlyCondoFees: number; // 50% included in calculations
    otherMonthlyDebts: number; // Credit cards, car loans, etc.
    creditScore: number;
}

export interface MaxBorrowingInput {
    grossAnnualIncome: number;
    otherMonthlyDebts: number;
    creditScore: number;
    downPaymentAvailable: number;
    interestRate?: number; // Default to stress test rate
    amortizationYears?: number; // Default 25
}

export interface MaxBorrowingResult {
    maxMortgageAmount: number;
    maxPurchasePrice: number;
    downPaymentPercent: number;
    estimatedMonthlyPayment: number;
    stressTestRate: number;
    gdsAtMax: number;
    tdsAtMax: number;
    lenderType: 'A-Lender' | 'B-Lender' | 'Private';
    assumptions: {
        propertyTaxRate: number;
        heatingCost: number;
        condoFees: number;
    };
}

export interface MortgageQualResult {
    gdsRatio: number; // Percentage
    tdsRatio: number; // Percentage
    qualificationAmount: number;
    maxPurchasePrice: number;
    approvalOdds: 'High' | 'Medium' | 'Low' | 'None';
    lenderType: 'A-Lender' | 'B-Lender' | 'Private' | 'Unqualified';
    recommendation: string;
    affordabilityWarning?: string;
}

/**
 * Calculates GDS and TDS ratios and determines approval odds.
 * Based on standard Canadian Lender guidelines (CMHC/insurable):
 * - GDS Max: 39%
 * - TDS Max: 44%
 * 
 * B-Lenders can go higher (e.g., 50%/50% or 60% TDS), but with higher rates.
 */
export function calculateMortgageQualification(input: MortgageQualInput): MortgageQualResult {
    const annualIncome = input.grossAnnualIncome;
    const monthlyIncome = annualIncome / 12;

    if (monthlyIncome <= 0) {
        return {
            gdsRatio: 0,
            tdsRatio: 0,
            approvalOdds: 'None',
            lenderType: 'Unqualified',
            recommendation: "Income must be greater than zero.",
            qualificationAmount: 0
        };
    }

    // Calculate Housing Costs (GDS components)
    // GDS = (Principal + Interest + Taxes + Heat + 50% Condo Fees) / Gross Income
    const monthlyTax = input.annualPropertyTax / 12;
    const qualifyingCondoFees = input.monthlyCondoFees * 0.5;

    const housingCosts = input.monthlyMortgagePayment + monthlyTax + input.monthlyHeatingCost + qualifyingCondoFees;

    const gdsRatio = (housingCosts / monthlyIncome) * 100;

    // Calculate Total Debt Load (TDS components)
    // TDS = (Housing Costs + Other Debts) / Gross Income
    const totalDebtCosts = housingCosts + input.otherMonthlyDebts;

    const tdsRatio = (totalDebtCosts / monthlyIncome) * 100;

    // Determine Qualification
    let lenderType: MortgageQualResult['lenderType'] = 'Unqualified';
    let approvalOdds: MortgageQualResult['approvalOdds'] = 'None';
    let recommendation = "";

    // A-Lender Criteria (Prime)
    // GDS <= 39, TDS <= 44, Credit >= 680
    const isGdsGood = gdsRatio <= 39;
    const isTdsGood = tdsRatio <= 44;
    const isCreditPrime = input.creditScore >= 680;

    if (isGdsGood && isTdsGood && isCreditPrime) {
        lenderType = 'A-Lender';
        approvalOdds = 'High';
        recommendation = "Excellent profile. You likely qualify for prime rates with major banks.";
    }
    // B-Lender Criteria (Alternative)
    // GDS ~42-45, TDS ~50, Credit >= 600
    else if (gdsRatio <= 45 && tdsRatio <= 50 && input.creditScore >= 600) {
        lenderType = 'B-Lender';
        approvalOdds = 'Medium';
        recommendation = "You may need an alternative lender (B-Lender) due to ratios or credit score. Expect higher rates.";
    }
    // Private Lender / Hard Money
    // Focus on equity, often ignore ratios if LTV is good (not checked here)
    else {
        lenderType = 'Private';
        approvalOdds = 'Low';
        recommendation = " Traditional qualification is unlikely. Consider private lending or reducing debts/increasing income.";
    }

    if (input.creditScore < 500) {
        lenderType = 'Unqualified';
        approvalOdds = 'None';
        recommendation = "Credit score is too low for most mortgages. Focus on credit repair.";
    }

    // Calculate max qualification amount based on GDS
    const maxBorrowing = calculateMaxBorrowingPower({
        grossAnnualIncome: input.grossAnnualIncome,
        otherMonthlyDebts: input.otherMonthlyDebts,
        creditScore: input.creditScore,
        downPaymentAvailable: 0 // Not used for this calculation
    });

    return {
        gdsRatio: parseFloat(gdsRatio.toFixed(2)),
        tdsRatio: parseFloat(tdsRatio.toFixed(2)),
        approvalOdds,
        lenderType,
        recommendation,
        qualificationAmount: maxBorrowing.maxMortgageAmount,
        maxPurchasePrice: maxBorrowing.maxPurchasePrice
    };
}

/**
 * Calculate the maximum borrowing power based on income and debts.
 * Uses stress test rate (higher of contract + 2% or 5.25%)
 */
export function calculateMaxBorrowingPower(input: MaxBorrowingInput): MaxBorrowingResult {
    const {
        grossAnnualIncome,
        otherMonthlyDebts,
        creditScore,
        downPaymentAvailable,
        interestRate = 5.5,
        amortizationYears = 25
    } = input;

    const monthlyIncome = grossAnnualIncome / 12;

    // Stress test rate (higher of contract + 2% or 5.25%)
    const stressTestRate = Math.max(interestRate + 2, 5.25);

    // Assumptions for non-property specific expenses
    const assumptions = {
        propertyTaxRate: 1.1, // 1.1% of home value annually
        heatingCost: 150, // $150/month
        condoFees: 0 // Assume no condo fees for max calculation
    };

    // Determine max GDS based on lender type
    let maxGds = 39; // A-Lender default
    let maxTds = 44;
    let lenderType: 'A-Lender' | 'B-Lender' | 'Private' = 'A-Lender';

    if (creditScore < 680 || creditScore >= 600) {
        maxGds = 42;
        maxTds = 50;
        lenderType = 'B-Lender';
    }
    if (creditScore < 600) {
        maxGds = 50;
        maxTds = 60;
        lenderType = 'Private';
    }

    // Calculate max housing costs based on GDS
    const maxHousingCostsGds = (monthlyIncome * maxGds) / 100;

    // Calculate max total debt based on TDS
    const maxTotalDebtTds = (monthlyIncome * maxTds) / 100;
    const maxHousingCostsTds = maxTotalDebtTds - otherMonthlyDebts;

    // Use the lower of GDS or TDS constraint
    const maxHousingCosts = Math.min(maxHousingCostsGds, maxHousingCostsTds);

    // Iteratively calculate max mortgage (need to account for property tax which depends on price)
    // Start with an estimate
    let maxMortgage = 0;
    let maxPurchasePrice = 0;

    // Binary search for max purchase price
    let low = 0;
    let high = maxHousingCosts * 300; // Rough upper bound

    for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const testPrice = mid;
        const testMortgage = testPrice * 0.8; // Assume 20% down

        // Calculate monthly costs at this price
        const monthlyPropTax = (testPrice * assumptions.propertyTaxRate / 100) / 12;
        const monthlyMortgage = calculateMonthlyPaymentAtRate(testMortgage, stressTestRate, amortizationYears);
        const totalHousingCost = monthlyMortgage + monthlyPropTax + assumptions.heatingCost;

        if (totalHousingCost <= maxHousingCosts) {
            low = mid;
            maxPurchasePrice = testPrice;
            maxMortgage = testMortgage;
        } else {
            high = mid;
        }
    }

    // Round to nearest $1,000
    maxPurchasePrice = Math.floor(maxPurchasePrice / 1000) * 1000;
    maxMortgage = maxPurchasePrice * 0.8;

    // Calculate actual GDS/TDS at max
    const monthlyPropTax = (maxPurchasePrice * assumptions.propertyTaxRate / 100) / 12;
    const estimatedMonthlyPayment = calculateMonthlyPaymentAtRate(maxMortgage, stressTestRate, amortizationYears);
    const housingCostsAtMax = estimatedMonthlyPayment + monthlyPropTax + assumptions.heatingCost;
    const gdsAtMax = (housingCostsAtMax / monthlyIncome) * 100;
    const tdsAtMax = ((housingCostsAtMax + otherMonthlyDebts) / monthlyIncome) * 100;

    // Adjust if down payment is less than 20%
    let downPaymentPercent = 20;
    if (downPaymentAvailable > 0 && downPaymentAvailable < maxPurchasePrice * 0.2) {
        downPaymentPercent = (downPaymentAvailable / maxPurchasePrice) * 100;
        // Need CMHC insurance - recalculate
        if (downPaymentPercent >= 5) {
            const ltv = 100 - downPaymentPercent;
            let cmhcRate = 0;
            if (ltv > 95) cmhcRate = 4.0;
            else if (ltv > 90) cmhcRate = 3.1;
            else if (ltv > 85) cmhcRate = 2.8;
            else if (ltv > 80) cmhcRate = 2.4;

            // Adjust max purchase price for CMHC
            maxMortgage = maxMortgage * (1 + cmhcRate / 100);
        }
    }

    return {
        maxMortgageAmount: Math.round(maxMortgage),
        maxPurchasePrice: Math.round(maxPurchasePrice),
        downPaymentPercent: parseFloat(downPaymentPercent.toFixed(1)),
        estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment),
        stressTestRate,
        gdsAtMax: parseFloat(gdsAtMax.toFixed(1)),
        tdsAtMax: parseFloat(tdsAtMax.toFixed(1)),
        lenderType,
        assumptions
    };
}

/**
 * Helper function to calculate monthly payment at a given rate
 */
function calculateMonthlyPaymentAtRate(principal: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) return principal / numPayments;

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Quick affordability check for a specific property
 */
export function checkAffordability(
    purchasePrice: number,
    grossAnnualIncome: number,
    otherMonthlyDebts: number,
    creditScore: number,
    downPaymentPercent: number = 20
): {
    canAfford: boolean;
    message: string;
    maxAffordable: number;
    shortfall: number;
} {
    const maxBorrowing = calculateMaxBorrowingPower({
        grossAnnualIncome,
        otherMonthlyDebts,
        creditScore,
        downPaymentAvailable: purchasePrice * (downPaymentPercent / 100)
    });

    const canAfford = purchasePrice <= maxBorrowing.maxPurchasePrice;
    const shortfall = Math.max(0, purchasePrice - maxBorrowing.maxPurchasePrice);

    let message = '';
    if (canAfford) {
        const buffer = maxBorrowing.maxPurchasePrice - purchasePrice;
        if (buffer > 50000) {
            message = `You're well within budget. You could afford up to $${maxBorrowing.maxPurchasePrice.toLocaleString()}.`;
        } else {
            message = `This property is at the top of your budget. Consider negotiating.`;
        }
    } else {
        message = `This property exceeds your qualification by $${shortfall.toLocaleString()}. You'd need to increase income, reduce debt, or find a less expensive property.`;
    }

    return {
        canAfford,
        message,
        maxAffordable: maxBorrowing.maxPurchasePrice,
        shortfall
    };
}
