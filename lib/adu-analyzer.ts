/**
 * ADU Profit Calculator & Funding Stack Analyzer
 * Calculates ROI for ADU conversions and identifies applicable government programs
 */

import type { Province } from '@/types';
import { AduType, getProvincialAduInfo } from './adu-signal-detector';

export interface AduConversionInput {
    purchasePrice: number;
    currentValue: number; // Could be same as purchase or ARV
    province: Province;
    city: string;
    aduType: AduType;
    existingBasement?: 'finished' | 'unfinished' | 'partial' | 'walkout' | 'none';
    lotSizeSqft?: number;
    targetUnitSize?: number; // Square feet for the ADU
    estimatedMonthlyRent?: number;
    doItYourself?: boolean; // DIY vs full contractor
}

export interface AduCostBreakdown {
    construction: number;
    permits: number;
    design: number;
    utilities: number;
    contingency: number;
    total: number;
}

export interface FundingOption {
    name: string;
    amount: number;
    interestRate: number;
    term: string;
    eligibility: string[];
    url?: string;
    provincial: boolean;
    forgivable: boolean;
}

export interface AduAnalysisResult {
    aduType: AduType;
    aduTypeName: string;
    
    // Costs
    estimatedCosts: AduCostBreakdown;
    diyDiscount: number;
    netCost: number;
    
    // Funding
    availableFunding: FundingOption[];
    totalFundingAvailable: number;
    outOfPocketCost: number;
    
    // Returns
    estimatedMonthlyRent: number;
    annualRent: number;
    netOperatingIncome: number;
    
    // ROI Metrics
    cashOnCashReturn: number;
    capRateContribution: number;
    paybackPeriodYears: number;
    valueAdd: number;
    totalPropertyValueAfter: number;
    
    // Comparison
    roiVsBuying: number; // % better/worse than buying a duplex
    
    // Timeline
    estimatedTimeline: {
        permits: string;
        construction: string;
        total: string;
    };
    
    // Risks
    risks: string[];
    recommendations: string[];
}

// Base construction costs by ADU type (2024 Canadian market)
const BASE_COSTS: Record<AduType, { low: number; mid: number; high: number }> = {
    'basement_suite': { low: 35000, mid: 50000, high: 75000 },
    'garden_suite': { low: 80000, mid: 120000, high: 180000 },
    'garage_conversion': { low: 40000, mid: 65000, high: 95000 },
    'attic_conversion': { low: 45000, mid: 70000, high: 100000 },
    'laneway_house': { low: 150000, mid: 220000, high: 320000 },
};

// Basement condition adjustments
const BASEMENT_ADJUSTMENTS: Record<string, number> = {
    'finished': 0.5,    // 50% reduction if already finished
    'partial': 0.75,    // 25% reduction
    'walkout': 0.9,     // 10% reduction (easier access but still needs work)
    'unfinished': 1.0,  // Full cost
    'none': 999,        // Not applicable
};

// Provincial cost adjustments
const PROVINCIAL_COST_MULTIPLIER: Record<Province, number> = {
    'ON': 1.15, // Higher labor costs
    'BC': 1.25, // Highest costs
    'AB': 1.0,  // Baseline
    'NS': 0.9,  // Lower costs
    'QC': 1.05, // Slightly above average
};

// Available funding programs
const FUNDING_PROGRAMS: FundingOption[] = [
    {
        name: 'Canada Secondary Suite Loan',
        amount: 80000,
        interestRate: 2.0,
        term: '10 years',
        eligibility: [
            'Must create a new secondary suite',
            'Property must be your primary residence',
            'Suite must meet building codes',
            'Available through participating lenders'
        ],
        url: 'https://www.cmhc-schl.gc.ca/',
        provincial: false,
        forgivable: false
    },
    {
        name: 'Ontario Renovates Program',
        amount: 25000,
        interestRate: 0,
        term: 'Forgivable after 10 years',
        eligibility: [
            'Ontario residents only',
            'Income below provincial threshold',
            'Must create affordable rental unit',
            'Rent must be below market rate'
        ],
        provincial: true,
        forgivable: true
    },
    {
        name: 'BC Secondary Suite Incentive Program',
        amount: 40000,
        interestRate: 0,
        term: 'Forgivable',
        eligibility: [
            'BC residents only',
            'Must create new legal suite',
            'Suite must meet BC Building Code',
            'Landlord must commit to affordable rent'
        ],
        provincial: true,
        forgivable: true
    },
    {
        name: 'Alberta Secondary Suite Grant',
        amount: 20000,
        interestRate: 0,
        term: 'One-time grant',
        eligibility: [
            'Select Alberta municipalities only',
            'Must create code-compliant suite',
            'Varies by municipality'
        ],
        provincial: true,
        forgivable: true
    },
];

// Municipal grants (additional to provincial/federal)
const MUNICIPAL_GRANTS: Record<string, FundingOption> = {
    'toronto': {
        name: 'Toronto Garden Suite Grant',
        amount: 50000,
        interestRate: 0,
        term: 'Forgivable over 15 years',
        eligibility: [
            'Toronto properties only',
            'Must build garden suite',
            'Rent to eligible tenant',
            'Affordable rent covenant required'
        ],
        provincial: false,
        forgivable: true
    },
    'ottawa': {
        name: 'Ottawa ADU Incentive',
        amount: 25000,
        interestRate: 0,
        term: 'Forgivable',
        eligibility: [
            'Ottawa properties only',
            'Must create new rental unit',
            'Meet affordability requirements'
        ],
        provincial: false,
        forgivable: true
    },
};

/**
 * Calculate ADU conversion costs
 */
function calculateAduCosts(
    aduType: AduType,
    province: Province,
    basementCondition?: string,
    targetSize?: number,
    diy: boolean = false
): AduCostBreakdown {
    const baseCost = BASE_COSTS[aduType];
    const provincialMultiplier = PROVINCIAL_COST_MULTIPLIER[province];
    
    let constructionCost = baseCost.mid * provincialMultiplier;
    
    // Adjust for basement condition
    if (aduType === 'basement_suite' && basementCondition) {
        const adjustment = BASEMENT_ADJUSTMENTS[basementCondition] || 1.0;
        constructionCost *= adjustment;
    }
    
    // Adjust for size (if larger than 600 sqft standard)
    if (targetSize && targetSize > 600) {
        const sizeMultiplier = targetSize / 600;
        constructionCost *= Math.min(sizeMultiplier, 1.5); // Cap at 1.5x
    }
    
    // DIY discount (30% savings on labor-heavy tasks)
    const diyDiscount = diy ? 0.3 : 0;
    const netConstruction = constructionCost * (1 - diyDiscount);
    
    // Other costs
    const permits = aduType === 'laneway_house' ? 8000 : 
                   aduType === 'garden_suite' ? 5000 : 2500;
    const design = aduType === 'laneway_house' ? 15000 :
                   aduType === 'garden_suite' ? 8000 : 3000;
    const utilities = aduType === 'basement_suite' ? 5000 :
                      aduType === 'garden_suite' ? 15000 : 8000;
    const contingency = netConstruction * 0.15; // 15% contingency
    
    return {
        construction: Math.round(netConstruction),
        permits: Math.round(permits),
        design: Math.round(design),
        utilities: Math.round(utilities),
        contingency: Math.round(contingency),
        total: Math.round(netConstruction + permits + design + utilities + contingency)
    };
}

/**
 * Get applicable funding options
 */
function getApplicableFunding(
    province: Province,
    city: string,
    aduType: AduType
): FundingOption[] {
    const applicable: FundingOption[] = [];
    
    // Federal programs (always available)
    applicable.push(FUNDING_PROGRAMS[0]); // Canada Secondary Suite Loan
    
    // Provincial programs
    for (const program of FUNDING_PROGRAMS) {
        if (program.provincial) {
            if (program.name.toLowerCase().includes(province.toLowerCase()) ||
                (province === 'ON' && program.name.includes('Ontario')) ||
                (province === 'BC' && program.name.includes('BC')) ||
                (province === 'AB' && program.name.includes('Alberta'))) {
                applicable.push(program);
            }
        }
    }
    
    // Municipal grants
    const cityLower = city.toLowerCase();
    if (MUNICIPAL_GRANTS[cityLower]) {
        applicable.push(MUNICIPAL_GRANTS[cityLower]);
    }
    
    return applicable;
}

/**
 * Estimate monthly rent for ADU
 */
function estimateAduRent(
    province: Province,
    city: string,
    aduType: AduType,
    sizeSqft?: number
): number {
    // Base rents by province
    const baseRents: Record<Province, number> = {
        'ON': 1400,
        'BC': 1600,
        'AB': 1200,
        'NS': 1100,
        'QC': 1000
    };
    
    // City adjustments
    const cityAdjustments: Record<string, number> = {
        'toronto': 1.5,
        'vancouver': 1.6,
        'calgary': 1.1,
        'edmonton': 1.0,
        'ottawa': 1.3,
        'hamilton': 1.15,
        'st. catharines': 1.0,
        'port colborne': 0.85,
        'niagara falls': 0.95,
        'welland': 0.85,
    };
    
    // ADU type adjustments
    const typeAdjustments: Record<AduType, number> = {
        'basement_suite': 1.0,
        'garden_suite': 1.2,
        'garage_conversion': 0.9,
        'attic_conversion': 0.85,
        'laneway_house': 1.3
    };
    
    const baseRent = baseRents[province] || 1200;
    const cityAdj = cityAdjustments[city.toLowerCase()] || 1.0;
    const typeAdj = typeAdjustments[aduType] || 1.0;
    
    // Size adjustment
    let sizeAdj = 1.0;
    if (sizeSqft) {
        if (sizeSqft >= 800) sizeAdj = 1.15;
        else if (sizeSqft >= 600) sizeAdj = 1.0;
        else if (sizeSqft >= 400) sizeAdj = 0.85;
        else sizeAdj = 0.7;
    }
    
    return Math.round(baseRent * cityAdj * typeAdj * sizeAdj);
}

/**
 * Main ADU analysis function
 */
export function analyzeAduConversion(input: AduConversionInput): AduAnalysisResult {
    const {
        purchasePrice,
        currentValue,
        province,
        city,
        aduType,
        existingBasement,
        lotSizeSqft,
        targetUnitSize = 600,
        estimatedMonthlyRent,
        doItYourself = false
    } = input;
    
    // Calculate costs
    const costs = calculateAduCosts(
        aduType,
        province,
        existingBasement,
        targetUnitSize,
        doItYourself
    );
    
    const diyDiscount = doItYourself ? costs.total * 0.3 : 0;
    const netCost = costs.total;
    
    // Get funding options
    const funding = getApplicableFunding(province, city, aduType);
    const totalFunding = funding.reduce((sum, f) => sum + f.amount, 0);
    const outOfPocket = Math.max(0, netCost - Math.min(totalFunding, netCost * 0.8)); // Can't fund 100%
    
    // Calculate returns
    const monthlyRent = estimatedMonthlyRent || estimateAduRent(province, city, aduType, targetUnitSize);
    const annualRent = monthlyRent * 12;
    
    // Operating expenses (property management 8%, maintenance 5%, vacancy 5%)
    const operatingExpenses = annualRent * 0.18;
    const noi = annualRent - operatingExpenses;
    
    // ROI Metrics
    const cashOnCash = outOfPocket > 0 ? (noi / outOfPocket) * 100 : Infinity;
    const capRateContribution = (noi / currentValue) * 100;
    const paybackYears = outOfPocket > 0 ? outOfPocket / noi : 0;
    
    // Value add (15x annual rent as rough cap rate conversion)
    const valueAdd = annualRent * 15;
    const totalValueAfter = currentValue + valueAdd;
    
    // Compare to buying a duplex
    const duplexDownPayment = purchasePrice * 0.2;
    const duplexAnnualCashflow = annualRent * 0.8; // Assume similar
    const duplexRoi = (duplexAnnualCashflow / duplexDownPayment) * 100;
    const roiVsBuying = cashOnCash - duplexRoi;
    
    // Timeline estimates
    const timeline = {
        permits: aduType === 'laneway_house' ? '3-6 months' : 
                 aduType === 'garden_suite' ? '2-4 months' : '1-3 months',
        construction: aduType === 'laneway_house' ? '6-12 months' :
                      aduType === 'garden_suite' ? '4-8 months' :
                      aduType === 'basement_suite' ? '2-4 months' : '3-5 months',
        total: aduType === 'laneway_house' ? '12-18 months' :
               aduType === 'garden_suite' ? '6-12 months' : '3-7 months'
    };
    
    // Risks and recommendations
    const risks: string[] = [];
    const recommendations: string[] = [];
    
    if (aduType === 'basement_suite' && existingBasement === 'none') {
        risks.push('No basement - this ADU type is not feasible');
    }
    if (aduType === 'garden_suite' && (!lotSizeSqft || lotSizeSqft < 5000)) {
        risks.push('Lot may be too small for garden suite - verify with municipality');
    }
    if (cashOnCash < 10) {
        risks.push('ROI below 10% - consider if this is the best use of capital');
    }
    if (paybackYears > 10) {
        risks.push('Long payback period - consider alternative strategies');
    }
    
    // Provincial info
    const provincialInfo = getProvincialAduInfo(province);
    if (provincialInfo) {
        provincialInfo.requirements.forEach(req => {
            recommendations.push(`Check requirement: ${req}`);
        });
    }
    
    if (funding.some(f => f.forgivable)) {
        recommendations.push('Forgivable funding available - apply early, funds are limited');
    }
    if (doItYourself) {
        recommendations.push('DIY can save ~30% but ensure all work meets code');
    }
    recommendations.push('Get 3 contractor quotes before starting');
    recommendations.push('Budget 15-20% contingency for unexpected costs');
    
    // ADU type names
    const typeNames: Record<AduType, string> = {
        'basement_suite': 'Basement Suite',
        'garden_suite': 'Garden Suite',
        'garage_conversion': 'Garage Conversion',
        'attic_conversion': 'Attic Conversion',
        'laneway_house': 'Laneway House'
    };
    
    return {
        aduType,
        aduTypeName: typeNames[aduType],
        estimatedCosts: costs,
        diyDiscount: Math.round(diyDiscount),
        netCost,
        availableFunding: funding,
        totalFundingAvailable: totalFunding,
        outOfPocketCost: Math.round(outOfPocket),
        estimatedMonthlyRent: monthlyRent,
        annualRent,
        netOperatingIncome: Math.round(noi),
        cashOnCashReturn: parseFloat(cashOnCash.toFixed(1)),
        capRateContribution: parseFloat(capRateContribution.toFixed(2)),
        paybackPeriodYears: parseFloat(paybackYears.toFixed(1)),
        valueAdd: Math.round(valueAdd),
        totalPropertyValueAfter: Math.round(totalValueAfter),
        roiVsBuying: parseFloat(roiVsBuying.toFixed(1)),
        estimatedTimeline: timeline,
        risks,
        recommendations
    };
}

/**
 * Compare all ADU types for a property
 */
export function compareAduOptions(
    purchasePrice: number,
    currentValue: number,
    province: Province,
    city: string,
    existingBasement?: 'finished' | 'unfinished' | 'partial' | 'walkout' | 'none',
    lotSizeSqft?: number
): AduAnalysisResult[] {
    const aduTypes: AduType[] = ['basement_suite', 'garden_suite', 'garage_conversion'];
    
    // Add laneway if lot is large enough
    if (lotSizeSqft && lotSizeSqft >= 4000) {
        aduTypes.push('laneway_house');
    }
    
    // Filter out basement if none exists
    const applicableTypes = existingBasement === 'none' 
        ? aduTypes.filter(t => t !== 'basement_suite')
        : aduTypes;
    
    return applicableTypes.map(aduType => 
        analyzeAduConversion({
            purchasePrice,
            currentValue,
            province,
            city,
            aduType,
            existingBasement,
            lotSizeSqft
        })
    ).sort((a, b) => b.cashOnCashReturn - a.cashOnCashReturn);
}

/**
 * Quick ADU ROI estimate
 */
export function quickAduEstimate(
    purchasePrice: number,
    province: Province,
    city: string
): {
    bestOption: AduType;
    estimatedCost: number;
    estimatedRent: number;
    estimatedRoi: number;
} {
    // Default to basement suite as most common
    const aduType: AduType = 'basement_suite';
    const costs = calculateAduCosts(aduType, province);
    const rent = estimateAduRent(province, city, aduType);
    const noi = rent * 12 * 0.82; // After 18% expenses
    const roi = (noi / costs.total) * 100;
    
    return {
        bestOption: aduType,
        estimatedCost: costs.total,
        estimatedRent: rent,
        estimatedRoi: parseFloat(roi.toFixed(1))
    };
}
