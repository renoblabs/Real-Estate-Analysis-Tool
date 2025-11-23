import { calculateDealScore } from '@/lib/deal-scoring';
import type { DealAnalysis } from '@/types';

// Helper to create a mock deal analysis
const createMockAnalysis = (overrides?: Partial<DealAnalysis>): DealAnalysis => ({
  property: {
    address: '123 Test St',
    city: 'Toronto',
    province: 'ON',
    postal_code: 'M1M 1M1',
    property_type: 'Single Family',
  },
  acquisition: {
    purchase_price: 500000,
    down_payment: 100000,
    down_payment_percent: 20,
    land_transfer_tax: 6475,
    legal_fees: 1500,
    inspection_cost: 500,
    other_closing_costs: 2000,
    total_closing_costs: 10475,
    total_cash_needed: 110475,
  },
  financing: {
    mortgage_amount: 400000,
    cmhc_required: false,
    cmhc_premium: 0,
    total_mortgage: 400000,
    interest_rate: 4.5,
    amortization_years: 25,
    monthly_payment: 2224.55,
    stress_test_rate: 6.5,
    stress_test_payment: 2669.45,
  },
  revenue: {
    monthly_rent: 3000,
    annual_rent: 36000,
    other_monthly_income: 0,
    annual_other_income: 0,
    total_annual_revenue: 36000,
  },
  expenses: {
    annual_mortgage: 26694.6,
    annual_property_tax: 4000,
    annual_insurance: 1200,
    annual_utilities: 1200,
    annual_maintenance: 3000,
    annual_property_management: 2880,
    vacancy_cost: 1800,
    total_annual_expenses: 40774.6,
  },
  cash_flow: {
    monthly_cash_flow: -398.05,
    annual_cash_flow: -4774.6,
    monthly_noi: 1850,
    annual_noi: 22200,
  },
  metrics: {
    cap_rate: 4.44,
    cash_on_cash_return: -4.32,
    dscr: 0.82,
    grm: 166.67,
    debt_coverage: 0.82,
  },
  strategy: 'buy_and_hold',
  market_comparison: {
    cap_rate_vs_market: 'Below Average',
    rent_to_price_ratio: 0.6,
    market_context: 'Toronto',
  },
  warnings: [],
  flags: {
    negative_cash_flow: true,
    low_dscr: true,
    high_vacancy: false,
    overpriced: false,
  },
  ...overrides,
});

describe('Deal Scoring Algorithm', () => {
  describe('Excellent Deals (Grade A)', () => {
    it('should score A for exceptional deal with great metrics', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: 800,
          annual_cash_flow: 9600,
          monthly_noi: 2000,
          annual_noi: 24000,
        },
        metrics: {
          cap_rate: 6.5,
          cash_on_cash_return: 15.0,
          dscr: 1.8,
          grm: 150,
          debt_coverage: 1.8,
        },
        flags: {
          negative_cash_flow: false,
          low_dscr: false,
          high_vacancy: false,
          overpriced: false,
        },
        market_comparison: {
          cap_rate_vs_market: 'Above Average',
          rent_to_price_ratio: 0.8,
          market_context: 'Calgary',
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.total_score).toBeGreaterThanOrEqual(85);
      expect(scoring.grade).toBe('A');
      expect(scoring.cash_flow_score).toBeGreaterThan(25);
      expect(scoring.coc_score).toBeGreaterThan(20);
      expect(scoring.recommendation).toContain('Strong Buy');
    });
  });

  describe('Good Deals (Grade B)', () => {
    it('should score B for solid deal with good metrics', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: 400,
          annual_cash_flow: 4800,
          monthly_noi: 1800,
          annual_noi: 21600,
        },
        metrics: {
          cap_rate: 5.5,
          cash_on_cash_return: 10.0,
          dscr: 1.4,
          grm: 160,
          debt_coverage: 1.4,
        },
        flags: {
          negative_cash_flow: false,
          low_dscr: false,
          high_vacancy: false,
          overpriced: false,
        },
        market_comparison: {
          cap_rate_vs_market: 'Average',
          rent_to_price_ratio: 0.7,
          market_context: 'Toronto',
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.total_score).toBeGreaterThanOrEqual(70);
      expect(scoring.total_score).toBeLessThan(85);
      expect(scoring.grade).toBe('B');
      expect(scoring.recommendation).toContain('Buy');
    });
  });

  describe('Average Deals (Grade C)', () => {
    it('should score C for marginal deal with okay metrics', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: 100,
          annual_cash_flow: 1200,
          monthly_noi: 1500,
          annual_noi: 18000,
        },
        metrics: {
          cap_rate: 4.5,
          cash_on_cash_return: 5.0,
          dscr: 1.15,
          grm: 170,
          debt_coverage: 1.15,
        },
        flags: {
          negative_cash_flow: false,
          low_dscr: false,
          high_vacancy: false,
          overpriced: false,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.total_score).toBeGreaterThanOrEqual(55);
      expect(scoring.total_score).toBeLessThan(70);
      expect(scoring.grade).toBe('C');
      expect(scoring.recommendation).toContain('Consider Carefully');
    });
  });

  describe('Poor Deals (Grade D)', () => {
    it('should score D for weak deal with poor metrics', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: -200,
          annual_cash_flow: -2400,
          monthly_noi: 1200,
          annual_noi: 14400,
        },
        metrics: {
          cap_rate: 3.5,
          cash_on_cash_return: -2.0,
          dscr: 0.95,
          grm: 180,
          debt_coverage: 0.95,
        },
        flags: {
          negative_cash_flow: true,
          low_dscr: true,
          high_vacancy: false,
          overpriced: false,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.total_score).toBeGreaterThanOrEqual(40);
      expect(scoring.total_score).toBeLessThan(55);
      expect(scoring.grade).toBe('D');
      expect(scoring.recommendation).toContain('Not Recommended');
    });
  });

  describe('Failing Deals (Grade F)', () => {
    it('should score F for terrible deal with very poor metrics', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: -600,
          annual_cash_flow: -7200,
          monthly_noi: 800,
          annual_noi: 9600,
        },
        metrics: {
          cap_rate: 2.0,
          cash_on_cash_return: -10.0,
          dscr: 0.6,
          grm: 200,
          debt_coverage: 0.6,
        },
        flags: {
          negative_cash_flow: true,
          low_dscr: true,
          high_vacancy: true,
          overpriced: true,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.total_score).toBeLessThan(40);
      expect(scoring.grade).toBe('F');
      expect(scoring.recommendation).toContain('Avoid');
    });
  });

  describe('Scoring Breakdown', () => {
    it('should properly weight cash flow score (max 30 points)', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: 1000,
          annual_cash_flow: 12000,
          monthly_noi: 2000,
          annual_noi: 24000,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.cash_flow_score).toBeGreaterThan(0);
      expect(scoring.cash_flow_score).toBeLessThanOrEqual(30);
    });

    it('should properly weight CoC return score (max 25 points)', () => {
      const analysis = createMockAnalysis({
        metrics: {
          ...createMockAnalysis().metrics,
          cash_on_cash_return: 20.0,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.coc_score).toBeGreaterThan(0);
      expect(scoring.coc_score).toBeLessThanOrEqual(25);
    });

    it('should properly weight cap rate score (max 20 points)', () => {
      const analysis = createMockAnalysis({
        metrics: {
          ...createMockAnalysis().metrics,
          cap_rate: 7.0,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.cap_rate_score).toBeGreaterThan(0);
      expect(scoring.cap_rate_score).toBeLessThanOrEqual(20);
    });

    it('should properly weight DSCR score (max 15 points)', () => {
      const analysis = createMockAnalysis({
        metrics: {
          ...createMockAnalysis().metrics,
          dscr: 1.6,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.dscr_score).toBeGreaterThan(0);
      expect(scoring.dscr_score).toBeLessThanOrEqual(15);
    });

    it('should properly weight stress test score (max 10 points)', () => {
      const analysis = createMockAnalysis({
        financing: {
          ...createMockAnalysis().financing,
          monthly_payment: 2000,
          stress_test_payment: 2200,
        },
        cash_flow: {
          monthly_cash_flow: 500,
          annual_cash_flow: 6000,
          monthly_noi: 2500,
          annual_noi: 30000,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.stress_test_score).toBeGreaterThan(0);
      expect(scoring.stress_test_score).toBeLessThanOrEqual(10);
    });

    it('should sum all component scores correctly', () => {
      const analysis = createMockAnalysis();
      const scoring = calculateDealScore(analysis);

      const sum =
        scoring.cash_flow_score +
        scoring.coc_score +
        scoring.cap_rate_score +
        scoring.dscr_score +
        scoring.stress_test_score;

      expect(scoring.total_score).toBe(sum);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero cash flow', () => {
      const analysis = createMockAnalysis({
        cash_flow: {
          monthly_cash_flow: 0,
          annual_cash_flow: 0,
          monthly_noi: 1500,
          annual_noi: 18000,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.cash_flow_score).toBeGreaterThanOrEqual(0);
      expect(scoring.grade).toBeDefined();
    });

    it('should handle negative CoC return', () => {
      const analysis = createMockAnalysis({
        metrics: {
          ...createMockAnalysis().metrics,
          cash_on_cash_return: -15.0,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.coc_score).toBe(0);
    });

    it('should handle very high DSCR', () => {
      const analysis = createMockAnalysis({
        metrics: {
          ...createMockAnalysis().metrics,
          dscr: 3.0,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.dscr_score).toBeLessThanOrEqual(15);
    });

    it('should handle stress test with large payment increase', () => {
      const analysis = createMockAnalysis({
        financing: {
          ...createMockAnalysis().financing,
          monthly_payment: 2000,
          stress_test_payment: 3000,
        },
        cash_flow: {
          monthly_cash_flow: 100,
          annual_cash_flow: 1200,
          monthly_noi: 2100,
          annual_noi: 25200,
        },
      });

      const scoring = calculateDealScore(analysis);

      expect(scoring.stress_test_score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recommendations', () => {
    it('should provide appropriate recommendation for each grade', () => {
      const grades = ['A', 'B', 'C', 'D', 'F'];
      const scores = [90, 75, 60, 45, 30];

      scores.forEach((_, index) => {
        const analysis = createMockAnalysis({
          cash_flow: {
            monthly_cash_flow: 1000 - index * 400,
            annual_cash_flow: 12000 - index * 4800,
            monthly_noi: 2000,
            annual_noi: 24000,
          },
          metrics: {
            cap_rate: 7.0 - index * 1.5,
            cash_on_cash_return: 15.0 - index * 6,
            dscr: 1.8 - index * 0.4,
            grm: 150 + index * 15,
            debt_coverage: 1.8 - index * 0.4,
          },
        });

        const scoring = calculateDealScore(analysis);
        expect(scoring.recommendation).toBeDefined();
        expect(scoring.recommendation.length).toBeGreaterThan(0);
      });
    });
  });
});
