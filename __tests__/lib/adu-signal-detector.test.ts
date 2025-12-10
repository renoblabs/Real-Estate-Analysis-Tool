import { 
    detectAduPotential, 
    quickAduCheck, 
    getProvincialAduInfo,
    getMunicipalAduInfo 
} from '@/lib/adu-signal-detector';
import type { Province } from '@/types';

const createMockProperty = (overrides = {}) => ({
    address: '123 Test St',
    city: 'Toronto',
    province: 'ON' as Province,
    property_type: 'single_family' as const,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    purchase_price: 600000,
    down_payment_percent: 20,
    down_payment_amount: 120000,
    interest_rate: 5.5,
    amortization_years: 25,
    strategy: 'buy_hold' as const,
    property_condition: 'move_in_ready' as const,
    renovation_cost: 0,
    monthly_rent: 2500,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: 5000,
    insurance_annual: 1500,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0,
    lot_size: 0.15,
    ...overrides
});

describe('ADU Signal Detector', () => {
    describe('detectAduPotential', () => {
        it('should detect keyword signals in listing description', () => {
            const property = createMockProperty();
            const details = {
                description: 'Beautiful home with separate entrance, perfect for in-law suite. Walk-out basement with high ceilings.'
            };

            const result = detectAduPotential(property, details);

            expect(result.signals.length).toBeGreaterThan(0);
            expect(result.signals.some(s => s.type === 'keyword')).toBe(true);
            expect(result.recommendedAduTypes).toContain('basement_suite');
        });

        it('should detect structural signals', () => {
            const property = createMockProperty();
            const details = {
                basement: 'walkout' as const
            };

            const result = detectAduPotential(property, details);

            expect(result.signals.some(s => s.type === 'structural')).toBe(true);
            expect(result.signals.some(s => s.description.includes('Walk-out basement'))).toBe(true);
        });

        it('should detect large lot for garden suite potential', () => {
            const property = createMockProperty({ lot_size: 0.2 }); // ~8700 sqft
            const details = {
                lotSize: 8700
            };

            const result = detectAduPotential(property, details);

            expect(result.signals.some(s => s.type === 'lot_characteristic')).toBe(true);
            expect(result.recommendedAduTypes).toContain('garden_suite');
        });

        it('should detect zoning signals for ADU-friendly cities', () => {
            const property = createMockProperty({ city: 'Toronto' });
            
            const result = detectAduPotential(property, {});

            expect(result.signals.some(s => s.type === 'zoning')).toBe(true);
            expect(result.opportunities.length).toBeGreaterThan(0);
        });

        it('should detect market timing signals', () => {
            const property = createMockProperty();
            const details = {
                daysOnMarket: 95,
                priceHistory: [
                    { date: '2024-01-01', price: 650000 },
                    { date: '2024-02-01', price: 600000 }
                ]
            };

            const result = detectAduPotential(property, details);

            expect(result.signals.some(s => s.type === 'market_timing')).toBe(true);
            expect(result.opportunities.some(o => o.includes('negotiation'))).toBe(true);
        });

        it('should calculate overall score based on signals', () => {
            const property = createMockProperty({ city: 'Hamilton' });
            const details = {
                description: 'Separate entrance, in-law suite ready, walkout basement',
                basement: 'walkout' as const,
                lotSize: 7000
            };

            const result = detectAduPotential(property, details);

            expect(result.overallScore).toBeGreaterThan(50);
            expect(result.hasAduPotential).toBe(true);
            expect(result.confidence).toBe('high');
        });

        it('should estimate rental income', () => {
            const property = createMockProperty({ city: 'Toronto' });
            const details = {
                description: 'Perfect for basement suite'
            };

            const result = detectAduPotential(property, details);

            expect(result.estimatedMonthlyRent).toBeGreaterThan(1000);
            expect(result.estimatedAddedValue).toBeGreaterThan(0);
        });

        it('should include provincial requirements as risk factors', () => {
            const property = createMockProperty({ province: 'ON' });
            
            const result = detectAduPotential(property, {});

            expect(result.riskFactors.some(r => r.includes('Requirement'))).toBe(true);
        });
    });

    describe('quickAduCheck', () => {
        it('should identify high potential in ADU-friendly city with large lot', () => {
            const property = createMockProperty({ 
                city: 'Toronto',
                lot_size: 0.2
            });

            const result = quickAduCheck(property);

            expect(result.hasHighPotential).toBe(true);
            expect(result.summary).toContain('ADU-friendly');
        });

        it('should identify potential in ADU-friendly city', () => {
            const property = createMockProperty({ city: 'Hamilton' });

            const result = quickAduCheck(property);

            expect(result.hasHighPotential).toBe(true);
        });

        it('should return standard assessment for unknown cities', () => {
            const property = createMockProperty({ city: 'Unknown City' });

            const result = quickAduCheck(property);

            expect(result.hasHighPotential).toBe(false);
            expect(result.summary).toContain('Standard property');
        });
    });

    describe('getProvincialAduInfo', () => {
        it('should return Ontario ADU regulations', () => {
            const info = getProvincialAduInfo('ON');

            expect(info).toBeDefined();
            expect(info?.basementSuiteAllowed).toBe(true);
            expect(info?.gardenSuiteAllowed).toBe(true);
            expect(info?.maxUnits).toBe(3);
            expect(info?.incentives.length).toBeGreaterThan(0);
            expect(info?.requirements.length).toBeGreaterThan(0);
        });

        it('should return BC ADU regulations', () => {
            const info = getProvincialAduInfo('BC');

            expect(info).toBeDefined();
            expect(info?.basementSuiteAllowed).toBe(true);
        });

        it('should return null for unsupported provinces', () => {
            const info = getProvincialAduInfo('XX' as Province);

            expect(info).toBeNull();
        });
    });

    describe('getMunicipalAduInfo', () => {
        it('should return Toronto municipal info', () => {
            const info = getMunicipalAduInfo('Toronto');

            expect(info).toBeDefined();
            expect(info?.aduFriendly).toBe(true);
            expect(info?.notes).toBeDefined();
        });

        it('should return Hamilton municipal info', () => {
            const info = getMunicipalAduInfo('Hamilton');

            expect(info).toBeDefined();
            expect(info?.aduFriendly).toBe(true);
        });

        it('should return null for unknown cities', () => {
            const info = getMunicipalAduInfo('Unknown City');

            expect(info).toBeNull();
        });

        it('should be case-insensitive', () => {
            const info1 = getMunicipalAduInfo('TORONTO');
            const info2 = getMunicipalAduInfo('toronto');
            const info3 = getMunicipalAduInfo('Toronto');

            expect(info1).toEqual(info2);
            expect(info2).toEqual(info3);
        });
    });
});
