/**
 * ADU Signal Detector
 * Identifies properties with hidden ADU (Additional Dwelling Unit) potential
 * This is a key differentiator for Canadian real estate investing
 */

import type { PropertyInputs, Province } from '@/types';

export type AduType = 'basement_suite' | 'garden_suite' | 'garage_conversion' | 'attic_conversion' | 'laneway_house';
export type SignalStrength = 'strong' | 'moderate' | 'weak';

export interface AduSignal {
    type: 'keyword' | 'structural' | 'zoning' | 'market_timing' | 'lot_characteristic';
    description: string;
    strength: SignalStrength;
    aduTypes: AduType[];
    source: string;
}

export interface AduPotentialResult {
    hasAduPotential: boolean;
    overallScore: number; // 0-100
    confidence: 'high' | 'medium' | 'low';
    signals: AduSignal[];
    recommendedAduTypes: AduType[];
    estimatedAddedValue: number;
    estimatedMonthlyRent: number;
    riskFactors: string[];
    opportunities: string[];
}

export interface PropertyDescription {
    description?: string;
    features?: string[];
    basement?: 'finished' | 'unfinished' | 'partial' | 'none' | 'walkout';
    garage?: 'attached' | 'detached' | 'none';
    garageSize?: number; // square feet
    lotSize?: number; // square feet
    zoning?: string;
    daysOnMarket?: number;
    priceHistory?: { date: string; price: number }[];
    hasSeperateEntrance?: boolean;
}

// Keywords that indicate ADU potential
const ADU_KEYWORDS: Record<string, { strength: SignalStrength; aduTypes: AduType[] }> = {
    'separate entrance': { strength: 'strong', aduTypes: ['basement_suite'] },
    'private entrance': { strength: 'strong', aduTypes: ['basement_suite', 'garden_suite'] },
    'in-law suite': { strength: 'strong', aduTypes: ['basement_suite'] },
    'granny suite': { strength: 'strong', aduTypes: ['basement_suite', 'garden_suite'] },
    'nanny suite': { strength: 'strong', aduTypes: ['basement_suite'] },
    'secondary suite': { strength: 'strong', aduTypes: ['basement_suite'] },
    'legal suite': { strength: 'strong', aduTypes: ['basement_suite'] },
    'income potential': { strength: 'moderate', aduTypes: ['basement_suite', 'garden_suite'] },
    'rental income': { strength: 'moderate', aduTypes: ['basement_suite', 'garden_suite'] },
    'walk-out basement': { strength: 'strong', aduTypes: ['basement_suite'] },
    'walkout basement': { strength: 'strong', aduTypes: ['basement_suite'] },
    'daylight basement': { strength: 'moderate', aduTypes: ['basement_suite'] },
    'high ceilings': { strength: 'weak', aduTypes: ['basement_suite', 'attic_conversion'] },
    '9 foot ceilings': { strength: 'moderate', aduTypes: ['basement_suite'] },
    '10 foot ceilings': { strength: 'moderate', aduTypes: ['basement_suite'] },
    'large lot': { strength: 'moderate', aduTypes: ['garden_suite', 'laneway_house'] },
    'oversized lot': { strength: 'moderate', aduTypes: ['garden_suite', 'laneway_house'] },
    'detached garage': { strength: 'moderate', aduTypes: ['garage_conversion', 'garden_suite'] },
    'double garage': { strength: 'weak', aduTypes: ['garage_conversion'] },
    'laneway access': { strength: 'strong', aduTypes: ['laneway_house', 'garden_suite'] },
    'lane access': { strength: 'strong', aduTypes: ['laneway_house', 'garden_suite'] },
    'rear lane': { strength: 'strong', aduTypes: ['laneway_house', 'garden_suite'] },
    'roughed-in': { strength: 'moderate', aduTypes: ['basement_suite'] },
    'rough-in': { strength: 'moderate', aduTypes: ['basement_suite'] },
    'plumbing rough-in': { strength: 'moderate', aduTypes: ['basement_suite'] },
    'development potential': { strength: 'moderate', aduTypes: ['garden_suite', 'laneway_house'] },
    'investor': { strength: 'weak', aduTypes: ['basement_suite'] },
    'handyman special': { strength: 'weak', aduTypes: ['basement_suite', 'garage_conversion'] },
    'bring your ideas': { strength: 'weak', aduTypes: ['basement_suite', 'garden_suite'] },
};

// Provincial ADU regulations and opportunities
const PROVINCIAL_ADU_INFO: Record<Province, {
    basementSuiteAllowed: boolean;
    gardenSuiteAllowed: boolean;
    maxUnits: number;
    incentives: string[];
    requirements: string[];
}> = {
    'ON': {
        basementSuiteAllowed: true,
        gardenSuiteAllowed: true, // Bill 23 made this easier
        maxUnits: 3, // Main + 2 additional (as of 2023)
        incentives: [
            'Canada Secondary Suite Loan: Up to $80,000 at 2%',
            'Ontario Renovates Program: Up to $25,000 forgivable',
            'Some municipalities offer development charge waivers'
        ],
        requirements: [
            'Minimum ceiling height: 6\'5" (1.95m)',
            'Separate entrance required',
            'Egress window in bedrooms',
            'Smoke and CO detectors required',
            'Building permit required'
        ]
    },
    'BC': {
        basementSuiteAllowed: true,
        gardenSuiteAllowed: true,
        maxUnits: 3,
        incentives: [
            'BC Housing Secondary Suite Incentive Program',
            'Some municipalities offer grants up to $40,000'
        ],
        requirements: [
            'Minimum ceiling height: 6\'8" (2.03m)',
            'Fire separation required',
            'Separate entrance recommended',
            'Building permit required'
        ]
    },
    'AB': {
        basementSuiteAllowed: true,
        gardenSuiteAllowed: true,
        maxUnits: 2,
        incentives: [
            'Secondary Suite Grant Program (select municipalities)',
            'Development permit fee waivers available'
        ],
        requirements: [
            'Minimum ceiling height: 6\'8" (2.03m)',
            'Separate entrance required',
            'Building permit required'
        ]
    },
    'NS': {
        basementSuiteAllowed: true,
        gardenSuiteAllowed: true,
        maxUnits: 2,
        incentives: [
            'Nova Scotia Affordable Housing Grant'
        ],
        requirements: [
            'Development permit required',
            'Fire separation required'
        ]
    },
    'QC': {
        basementSuiteAllowed: true,
        gardenSuiteAllowed: false, // Varies by municipality
        maxUnits: 2,
        incentives: [
            'Accès Logis Québec (rental housing program)'
        ],
        requirements: [
            'Building permit required',
            'Must comply with municipal bylaws'
        ]
    }
};

// Municipal hotspots for ADU opportunities (cities with favorable bylaws)
const ADU_HOTSPOTS: Record<string, { 
    aduFriendly: boolean; 
    recentByLawChanges: boolean;
    notes: string;
}> = {
    'toronto': { aduFriendly: true, recentByLawChanges: true, notes: 'Garden suites now allowed city-wide' },
    'ottawa': { aduFriendly: true, recentByLawChanges: true, notes: 'Up to 3 units on most residential lots' },
    'hamilton': { aduFriendly: true, recentByLawChanges: true, notes: 'ADU-friendly since 2022' },
    'st. catharines': { aduFriendly: true, recentByLawChanges: true, notes: 'Secondary suites allowed in all zones' },
    'port colborne': { aduFriendly: true, recentByLawChanges: true, notes: 'Recent zoning changes favor ADUs' },
    'niagara falls': { aduFriendly: true, recentByLawChanges: false, notes: 'Secondary suites permitted' },
    'welland': { aduFriendly: true, recentByLawChanges: true, notes: 'Part of Niagara ADU initiative' },
    'vancouver': { aduFriendly: true, recentByLawChanges: true, notes: 'Laneway houses allowed since 2009' },
    'calgary': { aduFriendly: true, recentByLawChanges: true, notes: 'Backyard suites allowed since 2018' },
    'edmonton': { aduFriendly: true, recentByLawChanges: true, notes: 'Garden suites permitted city-wide' },
};

/**
 * Detect ADU potential from property listing
 */
export function detectAduPotential(
    property: PropertyInputs,
    details: PropertyDescription = {}
): AduPotentialResult {
    const signals: AduSignal[] = [];
    const riskFactors: string[] = [];
    const opportunities: string[] = [];
    const recommendedAduTypes: Set<AduType> = new Set();

    // 1. Keyword Detection
    if (details.description) {
        const descLower = details.description.toLowerCase();
        for (const [keyword, info] of Object.entries(ADU_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                signals.push({
                    type: 'keyword',
                    description: `Listing mentions "${keyword}"`,
                    strength: info.strength,
                    aduTypes: info.aduTypes,
                    source: 'listing_description'
                });
                info.aduTypes.forEach(t => recommendedAduTypes.add(t));
            }
        }
    }

    // 2. Structural Signals
    if (details.basement === 'walkout' || details.basement === 'finished') {
        signals.push({
            type: 'structural',
            description: details.basement === 'walkout' 
                ? 'Walk-out basement provides ideal separate entrance'
                : 'Finished basement reduces conversion costs',
            strength: details.basement === 'walkout' ? 'strong' : 'moderate',
            aduTypes: ['basement_suite'],
            source: 'property_features'
        });
        recommendedAduTypes.add('basement_suite');
    }

    if (details.garage === 'detached' && details.garageSize && details.garageSize >= 400) {
        signals.push({
            type: 'structural',
            description: `Detached garage (${details.garageSize} sqft) could be converted`,
            strength: details.garageSize >= 600 ? 'strong' : 'moderate',
            aduTypes: ['garage_conversion', 'garden_suite'],
            source: 'property_features'
        });
        recommendedAduTypes.add('garage_conversion');
    }

    // 3. Lot Characteristics
    if (details.lotSize) {
        if (details.lotSize >= 6000) { // About 550 sqm
            signals.push({
                type: 'lot_characteristic',
                description: `Large lot (${details.lotSize} sqft) allows garden suite`,
                strength: details.lotSize >= 8000 ? 'strong' : 'moderate',
                aduTypes: ['garden_suite', 'laneway_house'],
                source: 'property_features'
            });
            recommendedAduTypes.add('garden_suite');
        }
    } else if (property.lot_size && property.lot_size >= 0.15) { // Acres
        const sqft = property.lot_size * 43560;
        if (sqft >= 6000) {
            signals.push({
                type: 'lot_characteristic',
                description: `Large lot (${property.lot_size.toFixed(2)} acres) may support ADU`,
                strength: sqft >= 8000 ? 'strong' : 'moderate',
                aduTypes: ['garden_suite', 'laneway_house'],
                source: 'property_features'
            });
            recommendedAduTypes.add('garden_suite');
        }
    }

    // 4. Zoning Signals
    const cityLower = property.city.toLowerCase();
    const hotspotInfo = ADU_HOTSPOTS[cityLower];
    
    if (hotspotInfo?.aduFriendly) {
        signals.push({
            type: 'zoning',
            description: `${property.city} has favorable ADU bylaws`,
            strength: hotspotInfo.recentByLawChanges ? 'strong' : 'moderate',
            aduTypes: ['basement_suite', 'garden_suite'],
            source: 'municipal_data'
        });
        opportunities.push(hotspotInfo.notes);
    }

    // 5. Market Timing Signals
    if (details.daysOnMarket && details.daysOnMarket > 60) {
        signals.push({
            type: 'market_timing',
            description: `${details.daysOnMarket} days on market - motivated seller`,
            strength: details.daysOnMarket > 90 ? 'strong' : 'moderate',
            aduTypes: ['basement_suite', 'garden_suite', 'garage_conversion'],
            source: 'market_data'
        });
        opportunities.push('Longer DOM suggests room for negotiation');
    }

    if (details.priceHistory && details.priceHistory.length >= 2) {
        const firstPrice = details.priceHistory[0].price;
        const lastPrice = details.priceHistory[details.priceHistory.length - 1].price;
        const priceDropPercent = ((firstPrice - lastPrice) / firstPrice) * 100;
        
        if (priceDropPercent >= 5) {
            signals.push({
                type: 'market_timing',
                description: `Price reduced ${priceDropPercent.toFixed(1)}% from original`,
                strength: priceDropPercent >= 10 ? 'strong' : 'moderate',
                aduTypes: ['basement_suite', 'garden_suite', 'garage_conversion'],
                source: 'market_data'
            });
            opportunities.push('Price reduction indicates negotiation opportunity');
        }
    }

    // 6. Provincial Info
    const provincialInfo = PROVINCIAL_ADU_INFO[property.province];
    if (provincialInfo) {
        provincialInfo.incentives.forEach(incentive => {
            opportunities.push(incentive);
        });

        provincialInfo.requirements.forEach(req => {
            riskFactors.push(`Requirement: ${req}`);
        });
    }

    // Calculate overall score
    let score = 0;
    for (const signal of signals) {
        if (signal.strength === 'strong') score += 25;
        else if (signal.strength === 'moderate') score += 15;
        else score += 5;
    }
    score = Math.min(score, 100);

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';
    const strongSignals = signals.filter(s => s.strength === 'strong').length;
    if (strongSignals >= 2 && signals.length >= 4) confidence = 'high';
    else if (strongSignals >= 1 && signals.length >= 2) confidence = 'medium';

    // Estimate added value and rent
    const estimatedMonthlyRent = estimateAduRent(property.city, property.province, recommendedAduTypes);
    const estimatedAddedValue = estimatedMonthlyRent * 12 * 15; // 15x annual rent as rough cap rate conversion

    return {
        hasAduPotential: score >= 30,
        overallScore: score,
        confidence,
        signals,
        recommendedAduTypes: Array.from(recommendedAduTypes),
        estimatedAddedValue,
        estimatedMonthlyRent,
        riskFactors,
        opportunities
    };
}

/**
 * Estimate potential ADU rental income
 */
function estimateAduRent(city: string, province: Province, aduTypes: Set<AduType>): number {
    // Base rents by province (1BR equivalent)
    const baseRents: Record<Province, number> = {
        'ON': 1400,
        'BC': 1600,
        'AB': 1200,
        'NS': 1100,
        'QC': 1000
    };

    // City adjustments
    const cityAdjustments: Record<string, number> = {
        'toronto': 1.4,
        'vancouver': 1.5,
        'calgary': 1.1,
        'edmonton': 1.0,
        'ottawa': 1.2,
        'hamilton': 1.1,
        'st. catharines': 0.95,
        'port colborne': 0.85,
        'niagara falls': 0.9,
        'welland': 0.85,
    };

    // ADU type adjustments
    const typeAdjustments: Record<AduType, number> = {
        'basement_suite': 1.0,
        'garden_suite': 1.15,
        'garage_conversion': 0.9,
        'attic_conversion': 0.85,
        'laneway_house': 1.25
    };

    const baseRent = baseRents[province] || 1200;
    const cityAdj = cityAdjustments[city.toLowerCase()] || 1.0;
    
    // Use highest value ADU type
    let maxTypeAdj = 1.0;
    for (const aduType of aduTypes) {
        const adj = typeAdjustments[aduType] || 1.0;
        if (adj > maxTypeAdj) maxTypeAdj = adj;
    }

    return Math.round(baseRent * cityAdj * maxTypeAdj);
}

/**
 * Quick check if property has high ADU potential
 */
export function quickAduCheck(property: PropertyInputs): {
    hasHighPotential: boolean;
    summary: string;
} {
    const hotspot = ADU_HOTSPOTS[property.city.toLowerCase()];
    const hasLargeLot = property.lot_size && property.lot_size >= 0.15;
    
    if (hotspot?.aduFriendly && hasLargeLot) {
        return {
            hasHighPotential: true,
            summary: `${property.city} is ADU-friendly with a large lot - strong ADU potential`
        };
    }
    
    if (hotspot?.aduFriendly) {
        return {
            hasHighPotential: true,
            summary: `${property.city} has favorable ADU bylaws - check for structural potential`
        };
    }

    return {
        hasHighPotential: false,
        summary: 'Standard property - analyze listing details for ADU signals'
    };
}

/**
 * Get provincial ADU information
 */
export function getProvincialAduInfo(province: Province) {
    return PROVINCIAL_ADU_INFO[province] || null;
}

/**
 * Get municipal ADU information
 */
export function getMunicipalAduInfo(city: string) {
    return ADU_HOTSPOTS[city.toLowerCase()] || null;
}
