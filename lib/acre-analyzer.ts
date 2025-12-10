import type { DealAnalysis, Province } from '@/types';

export type LocationGrade = 'A' | 'B' | 'C' | 'D';
export type AppreciationPotential = 'High' | 'Medium' | 'Low';
export type AcreGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';

export interface AcreInput {
    purchasePrice: number;
    monthlyRent: number;
    monthlyCashFlow: number;
    vacancyRate: number; // Percentage (e.g., 5 for 5%)
    locationGrade: LocationGrade; // User input or derived
    appreciationPotential: AppreciationPotential;
    riskScore: number; // 0-10, lower is better. From existing risk analyzer
}

export interface AcreResult {
    totalScore: number; // 0-100
    grade: AcreGrade;
    recommendation: string;
    breakdown: {
        cashFlowScore: number; // out of 40
        locationScore: number; // out of 30
        appreciationScore: number; // out of 20
        riskScore: number; // out of 10
    };
    details: {
        rentToPriceRatio: number;
        cashFlowCategory: string;
        locationRationale: string;
        appreciationRationale: string;
        riskRationale: string;
    };
}

/**
 * Calculates the ACRE Score based on Don R. Campbell's system.
 * Weights:
 * - Cash Flow: 40%
 * - Location: 30%
 * - Appreciation: 20%
 * - Risk Assessment: 10%
 */
export function calculateAcreScore(input: AcreInput): AcreResult {
    let cashFlowScore = 0;
    let locationScore = 0;
    let appreciationScore = 0;
    let riskScore = 0;
    let cashFlowCategory = '';
    let locationRationale = '';
    let appreciationRationale = '';
    let riskRationale = '';

    // 1. Cash Flow Score (Max 40)
    const rentToPriceRatio = (input.monthlyRent / input.purchasePrice) * 100;

    // Base score from Cash Flow positivity
    if (input.monthlyCashFlow > 500) {
        cashFlowScore += 25;
        cashFlowCategory = 'Excellent - Strong positive cash flow';
    } else if (input.monthlyCashFlow > 200) {
        cashFlowScore += 20;
        cashFlowCategory = 'Good - Healthy positive cash flow';
    } else if (input.monthlyCashFlow > 0) {
        cashFlowScore += 15;
        cashFlowCategory = 'Marginal - Barely positive';
    } else if (input.monthlyCashFlow > -200) {
        cashFlowScore += 5;
        cashFlowCategory = 'Warning - Negative but manageable';
    } else {
        cashFlowScore += 0;
        cashFlowCategory = 'Poor - Significant negative cash flow';
    }

    // Bonus from Rent-to-Price Ratio
    if (rentToPriceRatio >= 1.0) cashFlowScore += 15;
    else if (rentToPriceRatio >= 0.8) cashFlowScore += 10;
    else if (rentToPriceRatio >= 0.6) cashFlowScore += 5;

    cashFlowScore = Math.min(cashFlowScore, 40);

    // 2. Location Score (Max 30)
    switch (input.locationGrade) {
        case 'A': 
            locationScore = 30; 
            locationRationale = 'Prime location with strong fundamentals';
            break;
        case 'B': 
            locationScore = 20; 
            locationRationale = 'Good location with solid growth potential';
            break;
        case 'C': 
            locationScore = 10; 
            locationRationale = 'Average location, monitor for changes';
            break;
        case 'D': 
            locationScore = 0; 
            locationRationale = 'Challenging location, higher risk';
            break;
    }

    // 3. Appreciation Potential (Max 20)
    switch (input.appreciationPotential) {
        case 'High': 
            appreciationScore = 20; 
            appreciationRationale = 'Strong appreciation expected based on market trends';
            break;
        case 'Medium': 
            appreciationScore = 10; 
            appreciationRationale = 'Moderate appreciation inline with inflation';
            break;
        case 'Low': 
            appreciationScore = 0; 
            appreciationRationale = 'Limited appreciation potential, focus on cash flow';
            break;
    }

    // 4. Risk Assessment (Max 10)
    riskScore = Math.max(0, 10 - input.riskScore);
    if (input.riskScore <= 3) {
        riskRationale = 'Low risk profile - well-positioned investment';
    } else if (input.riskScore <= 6) {
        riskRationale = 'Moderate risk - some factors to monitor';
    } else {
        riskRationale = 'Higher risk - requires careful management';
    }

    // Total
    const totalScore = cashFlowScore + locationScore + appreciationScore + riskScore;

    // Grade
    let grade: AcreGrade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 75) grade = 'B+';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else if (totalScore >= 50) grade = 'D';

    // Recommendation
    let recommendation = "";
    if (totalScore >= 75) {
        recommendation = "STRONG BUY - This property meets all key investment criteria.";
    } else if (totalScore >= 60) {
        recommendation = "CONSIDER - Good potential, but review the weak points.";
    } else if (totalScore >= 50) {
        recommendation = "CAUTION - Marginal deal, requires negotiation or value-add strategy.";
    } else {
        recommendation = "PASS - This property does not meet investment criteria.";
    }

    return {
        totalScore,
        grade,
        recommendation,
        breakdown: {
            cashFlowScore,
            locationScore,
            appreciationScore,
            riskScore
        },
        details: {
            rentToPriceRatio: parseFloat(rentToPriceRatio.toFixed(3)),
            cashFlowCategory,
            locationRationale,
            appreciationRationale,
            riskRationale
        }
    };
}

/**
 * Market data for estimating location grade and appreciation by province/city
 */
const MARKET_INSIGHTS: Record<Province, { 
    defaultLocationGrade: LocationGrade; 
    appreciationPotential: AppreciationPotential;
    hotspots: string[];
}> = {
    'ON': {
        defaultLocationGrade: 'B',
        appreciationPotential: 'Medium',
        hotspots: ['Ottawa', 'Hamilton', 'Kitchener', 'London', 'St. Catharines', 'Niagara Falls', 'Welland', 'Port Colborne']
    },
    'BC': {
        defaultLocationGrade: 'B',
        appreciationPotential: 'Medium',
        hotspots: ['Victoria', 'Kelowna', 'Nanaimo', 'Kamloops']
    },
    'AB': {
        defaultLocationGrade: 'B',
        appreciationPotential: 'High',
        hotspots: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge']
    },
    'NS': {
        defaultLocationGrade: 'C',
        appreciationPotential: 'Medium',
        hotspots: ['Halifax', 'Dartmouth']
    },
    'QC': {
        defaultLocationGrade: 'B',
        appreciationPotential: 'Medium',
        hotspots: ['Montreal', 'Quebec City', 'Gatineau', 'Sherbrooke']
    }
};

/**
 * Auto-calculate ACRE score from a completed DealAnalysis
 * Uses deal metrics to estimate location/appreciation when not provided
 */
export function calculateAcreFromDeal(
    analysis: DealAnalysis,
    overrides?: {
        locationGrade?: LocationGrade;
        appreciationPotential?: AppreciationPotential;
    }
): AcreResult {
    const { property, cash_flow, metrics, flags, warnings } = analysis;
    
    // Calculate risk score from deal flags and warnings (0-10, higher = more risky)
    let riskScore = 0;
    if (flags.negative_cash_flow) riskScore += 3;
    if (flags.low_dscr) riskScore += 2;
    if (flags.below_market_cap_rate) riskScore += 1;
    if (flags.high_ltv) riskScore += 2;
    if (flags.fails_stress_test) riskScore += 2;
    riskScore += Math.min(warnings.length, 3); // Add 1 per warning, max 3
    riskScore = Math.min(riskScore, 10);
    
    // Determine location grade
    let locationGrade: LocationGrade = overrides?.locationGrade || 'B';
    if (!overrides?.locationGrade) {
        const marketData = MARKET_INSIGHTS[property.province];
        locationGrade = marketData?.defaultLocationGrade || 'B';
        
        // Boost if in a hotspot city
        const cityLower = property.city.toLowerCase();
        if (marketData?.hotspots.some(h => cityLower.includes(h.toLowerCase()))) {
            locationGrade = locationGrade === 'C' ? 'B' : locationGrade === 'B' ? 'A' : locationGrade;
        }
        
        // Adjust based on metrics
        if (metrics.cap_rate > 7) locationGrade = 'A'; // High cap rate markets
        if (metrics.cap_rate < 4) locationGrade = locationGrade === 'A' ? 'B' : 'C'; // Expensive markets
    }
    
    // Determine appreciation potential
    let appreciationPotential: AppreciationPotential = overrides?.appreciationPotential || 'Medium';
    if (!overrides?.appreciationPotential) {
        const marketData = MARKET_INSIGHTS[property.province];
        appreciationPotential = marketData?.appreciationPotential || 'Medium';
        
        // Adjust based on property condition (value-add potential)
        if (property.property_condition === 'heavy_reno' || property.property_condition === 'gut_job') {
            appreciationPotential = 'High'; // Forced appreciation potential
        }
        if (property.strategy === 'brrrr') {
            appreciationPotential = 'High'; // BRRRR implies value-add
        }
    }
    
    const input: AcreInput = {
        purchasePrice: property.purchase_price,
        monthlyRent: property.monthly_rent,
        monthlyCashFlow: cash_flow.monthly_cash_flow,
        vacancyRate: property.vacancy_rate,
        locationGrade,
        appreciationPotential,
        riskScore
    };
    
    return calculateAcreScore(input);
}

/**
 * Get a quick ACRE assessment without full deal analysis
 */
export function quickAcreAssessment(
    purchasePrice: number,
    monthlyRent: number,
    province: Province,
    city: string
): { score: number; grade: AcreGrade; verdict: string } {
    const rentToPriceRatio = (monthlyRent / purchasePrice) * 100;
    const marketData = MARKET_INSIGHTS[province];
    
    // Quick estimation
    let score = 50; // Base score
    
    // Cash flow estimation (assume 60% of rent covers expenses)
    const estimatedCashFlow = monthlyRent * 0.4 - (purchasePrice * 0.005); // Rough mortgage estimate
    if (estimatedCashFlow > 300) score += 20;
    else if (estimatedCashFlow > 0) score += 10;
    else score -= 10;
    
    // Rent-to-price bonus
    if (rentToPriceRatio >= 0.8) score += 15;
    else if (rentToPriceRatio >= 0.6) score += 5;
    
    // Location bonus
    if (marketData?.hotspots.some(h => city.toLowerCase().includes(h.toLowerCase()))) {
        score += 10;
    }
    
    // Cap score
    score = Math.max(0, Math.min(100, score));
    
    // Grade
    let grade: AcreGrade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 75) grade = 'B+';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 50) grade = 'D';
    
    // Verdict
    let verdict = '';
    if (score >= 70) verdict = 'Worth analyzing in detail';
    else if (score >= 50) verdict = 'Marginal - needs negotiation';
    else verdict = 'Likely a pass';
    
    return { score, grade, verdict };
}
