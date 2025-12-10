import { calculateAcreScore, calculateAcreFromDeal, quickAcreAssessment } from '@/lib/acre-analyzer';
import type { DealAnalysis } from '@/types';

describe('ACRE Analyzer', () => {
    describe('calculateAcreScore', () => {
        it('should return high score for excellent investment', () => {
            const result = calculateAcreScore({
                purchasePrice: 400000,
                monthlyRent: 3500,
                province: 'ON',
                city: 'Hamilton',
                propertyTax: 4000,
                insurance: 1200,
                capRate: 7,
                cashOnCash: 12,
                dscr: 1.4
            });

            expect(result.totalScore).toBeGreaterThan(70);
            expect(result.grade).toMatch(/^[AB]/);
            expect(result.recommendation).toContain('BUY');
        });

        it('should return low score for poor investment', () => {
            const result = calculateAcreScore({
                purchasePrice: 800000,
                monthlyRent: 2000,
                province: 'ON',
                city: 'Toronto',
                propertyTax: 8000,
                insurance: 2000,
                capRate: 2,
                cashOnCash: -5,
                dscr: 0.7
            });

            expect(result.totalScore).toBeLessThan(50);
            expect(result.grade).toMatch(/^[DF]/);
            expect(result.recommendation).toContain('AVOID');
        });

        it('should weight cash flow at 40%', () => {
            const result = calculateAcreScore({
                purchasePrice: 500000,
                monthlyRent: 4500, // Very high rent-to-price ratio
                province: 'ON',
                city: 'Port Colborne',
                propertyTax: 4000,
                insurance: 1200,
                capRate: 5,
                cashOnCash: 8,
                dscr: 1.2
            });

            expect(result.breakdown.cashFlowScore).toBeGreaterThan(30);
        });

        it('should provide market insights for known cities', () => {
            const result = calculateAcreScore({
                purchasePrice: 500000,
                monthlyRent: 2500,
                province: 'ON',
                city: 'Hamilton',
                propertyTax: 4000,
                insurance: 1200,
                capRate: 5,
                cashOnCash: 8,
                dscr: 1.2
            });

            expect(result.marketInsights).toBeDefined();
            expect(result.marketInsights?.populationGrowth).toBeDefined();
        });
    });

    describe('quickAcreAssessment', () => {
        it('should return quick assessment for any property', () => {
            const result = quickAcreAssessment({
                purchasePrice: 500000,
                monthlyRent: 2500,
                province: 'ON',
                city: 'Toronto'
            });

            expect(result.estimatedScore).toBeGreaterThan(0);
            expect(result.estimatedScore).toBeLessThanOrEqual(100);
            expect(result.quickVerdict).toBeDefined();
            expect(['Worth Investigating', 'Needs Analysis', 'Likely Pass']).toContain(result.quickVerdict);
        });

        it('should flag high rent-to-price as worth investigating', () => {
            const result = quickAcreAssessment({
                purchasePrice: 300000,
                monthlyRent: 3000, // 1% rule met
                province: 'AB',
                city: 'Edmonton'
            });

            expect(result.quickVerdict).toBe('Worth Investigating');
        });
    });

    describe('calculateAcreFromDeal', () => {
        const mockDealAnalysis: DealAnalysis = {
            property: {
                address: '123 Test St',
                city: 'St. Catharines',
                province: 'ON',
                postal_code: 'L2M 1B1',
                property_type: 'Single Family',
                bedrooms: 3,
                bathrooms: 2,
                square_feet: 1500,
                purchase_price: 450000,
                lot_size: 0.2
            },
            acquisition: {
                purchase_price: 450000,
                down_payment: 90000,
                down_payment_percent: 20,
                land_transfer_tax: 5475,
                legal_fees: 1500,
                inspection_cost: 500,
                other_closing_costs: 2000,
                total_closing_costs: 9475,
                total_cash_needed: 99475,
                total_acquisition_cost: 459475
            },
            financing: {
                mortgage_amount: 360000,
                cmhc_required: false,
                cmhc_premium: 0,
                total_mortgage: 360000,
                interest_rate: 5.5,
                amortization_years: 25,
                monthly_payment: 2200,
                stress_test_rate: 7.5,
                stress_test_payment: 2600
            },
            revenue: {
                monthly_rent: 2800,
                annual_rent: 33600,
                other_monthly_income: 0,
                annual_other_income: 0,
                total_annual_revenue: 33600
            },
            expenses: {
                annual_mortgage: 26400,
                property_tax: 4500,
                insurance: 1400,
                annual_property_tax: 4500,
                annual_insurance: 1400,
                annual_utilities: 0,
                annual_maintenance: 3360,
                annual_property_management: 2688,
                vacancy_cost: 1680,
                total_annual_expenses: 40028,
                annual_hoa_condo: 0
            },
            cash_flow: {
                gross_annual_income: 33600,
                net_operating_income: 23972,
                annual_cash_flow: -2428,
                monthly_cash_flow: -202
            },
            metrics: {
                cap_rate: 5.33,
                cash_on_cash_return: -2.44,
                gross_rent_multiplier: 13.39,
                dscr: 0.91,
                break_even_ratio: 1.19,
                price_per_sqft: 300,
                rent_to_price_ratio: 0.62
            },
            scoring: {
                total_score: 55,
                grade: 'C',
                reasons: ['Negative cash flow', 'Below 1% rule']
            },
            warnings: ['Negative monthly cash flow'],
            recommendations: ['Consider negotiating lower price']
        };

        it('should calculate ACRE score from full deal analysis', () => {
            const result = calculateAcreFromDeal(mockDealAnalysis);

            expect(result).toBeDefined();
            expect(result.totalScore).toBeGreaterThan(0);
            expect(result.totalScore).toBeLessThanOrEqual(100);
            expect(result.grade).toMatch(/^[A-F]/);
            expect(result.breakdown).toBeDefined();
            expect(result.breakdown.cashFlowScore).toBeDefined();
            expect(result.breakdown.locationScore).toBeDefined();
            expect(result.breakdown.appreciationScore).toBeDefined();
            expect(result.breakdown.riskScore).toBeDefined();
        });

        it('should use actual metrics from deal analysis', () => {
            const result = calculateAcreFromDeal(mockDealAnalysis);
            
            // Since the deal has negative cash flow, should affect score
            expect(result.breakdown.cashFlowScore).toBeLessThan(30);
        });
    });
});
