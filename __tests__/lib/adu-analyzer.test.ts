import { 
    analyzeAduConversion, 
    compareAduOptions, 
    quickAduEstimate 
} from '@/lib/adu-analyzer';
import type { Province } from '@/types';

describe('ADU Analyzer', () => {
    describe('analyzeAduConversion', () => {
        it('should calculate basement suite conversion costs', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                existingBasement: 'unfinished'
            });

            expect(result.aduType).toBe('basement_suite');
            expect(result.aduTypeName).toBe('Basement Suite');
            expect(result.estimatedCosts.total).toBeGreaterThan(40000);
            expect(result.estimatedCosts.total).toBeLessThan(100000);
        });

        it('should reduce costs for finished basement', () => {
            const unfinished = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                existingBasement: 'unfinished'
            });

            const finished = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                existingBasement: 'finished'
            });

            expect(finished.estimatedCosts.construction).toBeLessThan(unfinished.estimatedCosts.construction);
        });

        it('should apply provincial cost multipliers', () => {
            const ontario = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Toronto',
                aduType: 'basement_suite'
            });

            const bc = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'BC',
                city: 'Vancouver',
                aduType: 'basement_suite'
            });

            // BC should be more expensive
            expect(bc.estimatedCosts.construction).toBeGreaterThan(ontario.estimatedCosts.construction);
        });

        it('should calculate garden suite costs higher than basement', () => {
            const basement = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Toronto',
                aduType: 'basement_suite'
            });

            const garden = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Toronto',
                aduType: 'garden_suite'
            });

            expect(garden.estimatedCosts.total).toBeGreaterThan(basement.estimatedCosts.total);
        });

        it('should identify available funding options', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Toronto',
                aduType: 'basement_suite'
            });

            expect(result.availableFunding.length).toBeGreaterThan(0);
            expect(result.totalFundingAvailable).toBeGreaterThan(0);
            
            // Should include federal program
            expect(result.availableFunding.some(f => f.name.includes('Canada'))).toBe(true);
        });

        it('should calculate ROI metrics', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite'
            });

            expect(result.cashOnCashReturn).toBeGreaterThan(0);
            expect(result.paybackPeriodYears).toBeGreaterThan(0);
            expect(result.paybackPeriodYears).toBeLessThan(20);
            expect(result.valueAdd).toBeGreaterThan(0);
        });

        it('should estimate monthly rent based on city and ADU type', () => {
            const toronto = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Toronto',
                aduType: 'basement_suite'
            });

            const portColborne = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Port Colborne',
                aduType: 'basement_suite'
            });

            // Toronto rents should be higher
            expect(toronto.estimatedMonthlyRent).toBeGreaterThan(portColborne.estimatedMonthlyRent);
        });

        it('should apply DIY discount when specified', () => {
            const contractor = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                doItYourself: false
            });

            const diy = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                doItYourself: true
            });

            expect(diy.estimatedCosts.construction).toBeLessThan(contractor.estimatedCosts.construction);
        });

        it('should provide timeline estimates', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite'
            });

            expect(result.estimatedTimeline.permits).toBeDefined();
            expect(result.estimatedTimeline.construction).toBeDefined();
            expect(result.estimatedTimeline.total).toBeDefined();
        });

        it('should include risks and recommendations', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite'
            });

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(r => r.includes('quote'))).toBe(true);
        });

        it('should flag risk when basement type is none', () => {
            const result = analyzeAduConversion({
                purchasePrice: 500000,
                currentValue: 500000,
                province: 'ON',
                city: 'Hamilton',
                aduType: 'basement_suite',
                existingBasement: 'none'
            });

            expect(result.risks.some(r => r.includes('No basement'))).toBe(true);
        });
    });

    describe('compareAduOptions', () => {
        it('should compare multiple ADU types', () => {
            const results = compareAduOptions(
                500000,
                500000,
                'ON',
                'Toronto',
                'unfinished',
                6000
            );

            expect(results.length).toBeGreaterThan(1);
            expect(results.some(r => r.aduType === 'basement_suite')).toBe(true);
            expect(results.some(r => r.aduType === 'garden_suite')).toBe(true);
        });

        it('should sort by ROI descending', () => {
            const results = compareAduOptions(
                500000,
                500000,
                'ON',
                'Toronto',
                'unfinished',
                6000
            );

            for (let i = 1; i < results.length; i++) {
                expect(results[i - 1].cashOnCashReturn).toBeGreaterThanOrEqual(results[i].cashOnCashReturn);
            }
        });

        it('should exclude basement suite when no basement exists', () => {
            const results = compareAduOptions(
                500000,
                500000,
                'ON',
                'Toronto',
                'none',
                6000
            );

            expect(results.some(r => r.aduType === 'basement_suite')).toBe(false);
        });

        it('should include laneway house for large lots', () => {
            const results = compareAduOptions(
                500000,
                500000,
                'ON',
                'Toronto',
                'unfinished',
                5000 // Large lot
            );

            expect(results.some(r => r.aduType === 'laneway_house')).toBe(true);
        });
    });

    describe('quickAduEstimate', () => {
        it('should return quick estimate for any property', () => {
            const result = quickAduEstimate(500000, 'ON', 'Toronto');

            expect(result.bestOption).toBe('basement_suite');
            expect(result.estimatedCost).toBeGreaterThan(0);
            expect(result.estimatedRent).toBeGreaterThan(0);
            expect(result.estimatedRoi).toBeGreaterThan(0);
        });

        it('should adjust rent estimates by city', () => {
            const toronto = quickAduEstimate(500000, 'ON', 'Toronto');
            const portColborne = quickAduEstimate(500000, 'ON', 'Port Colborne');

            expect(toronto.estimatedRent).toBeGreaterThan(portColborne.estimatedRent);
        });
    });
});
