import {
  calculateCMHCInsurance,
  calculateLandTransferTax,
  calculateStressTest,
  OSFI_STRESS_TEST_BUFFER,
  OSFI_STRESS_TEST_FLOOR,
} from '@/lib/canadian-calculations';

describe('Canadian Calculations', () => {
  describe('calculateCMHCInsurance', () => {
    it('should calculate CMHC insurance for 5% down payment', () => {
      const result = calculateCMHCInsurance(500000, 5);

      expect(result.down_payment_percent).toBe(5);
      expect(result.down_payment_amount).toBe(25000);
      expect(result.mortgage_amount).toBe(475000);
      expect(result.premium_rate).toBe(4.00);
      expect(result.premium_amount).toBe(19000); // 475000 * 0.04
      expect(result.total_mortgage_with_premium).toBe(494000); // 475000 + 19000
      expect(result.requires_cmhc).toBe(true);
    });

    it('should calculate CMHC insurance for 10% down payment', () => {
      const result = calculateCMHCInsurance(600000, 10);

      expect(result.down_payment_percent).toBe(10);
      expect(result.down_payment_amount).toBe(60000);
      expect(result.mortgage_amount).toBe(540000);
      expect(result.premium_rate).toBe(3.10);
      expect(result.premium_amount).toBe(16740); // 540000 * 0.031
      expect(result.total_mortgage_with_premium).toBe(556740);
      expect(result.requires_cmhc).toBe(true);
    });

    it('should calculate CMHC insurance for 15% down payment', () => {
      const result = calculateCMHCInsurance(700000, 15);

      expect(result.down_payment_percent).toBe(15);
      expect(result.down_payment_amount).toBe(105000);
      expect(result.mortgage_amount).toBe(595000);
      expect(result.premium_rate).toBe(2.80);
      expect(result.premium_amount).toBe(16660); // 595000 * 0.028
      expect(result.total_mortgage_with_premium).toBe(611660);
      expect(result.requires_cmhc).toBe(true);
    });

    it('should not require CMHC insurance for 20% down payment', () => {
      const result = calculateCMHCInsurance(500000, 20);

      expect(result.down_payment_percent).toBe(20);
      expect(result.down_payment_amount).toBe(100000);
      expect(result.mortgage_amount).toBe(400000);
      expect(result.premium_rate).toBe(0);
      expect(result.premium_amount).toBe(0);
      expect(result.total_mortgage_with_premium).toBe(400000);
      expect(result.requires_cmhc).toBe(false);
    });

    it('should not require CMHC insurance for 25% down payment', () => {
      const result = calculateCMHCInsurance(800000, 25);

      expect(result.requires_cmhc).toBe(false);
      expect(result.premium_rate).toBe(0);
      expect(result.premium_amount).toBe(0);
    });

    it('should handle minimum down payment scenarios', () => {
      const result = calculateCMHCInsurance(500000, 5);

      expect(result.down_payment_amount).toBeGreaterThanOrEqual(25000);
      expect(result.requires_cmhc).toBe(true);
    });
  });

  describe('calculateLandTransferTax', () => {
    describe('Ontario', () => {
      it('should calculate Ontario LTT for property under $55,000', () => {
        const result = calculateLandTransferTax(50000, 'ON', undefined, false);

        expect(result.provincial_tax).toBe(250); // 50000 * 0.005
        expect(result.municipal_tax).toBe(0);
        expect(result.first_time_buyer_rebate).toBe(0);
        expect(result.total_tax).toBe(250);
      });

      it('should calculate Ontario LTT for property $55,000 - $250,000', () => {
        const result = calculateLandTransferTax(200000, 'ON', undefined, false);

        // First $55,000: 55000 * 0.005 = 275
        // Next $145,000: 145000 * 0.01 = 1450
        // Total: 275 + 1450 = 1725
        expect(result.provincial_tax).toBe(1725);
        expect(result.total_tax).toBe(1725);
      });

      it('should calculate Ontario LTT for property $250,000 - $400,000', () => {
        const result = calculateLandTransferTax(350000, 'ON', undefined, false);

        // First $55,000: 275
        // Next $195,000 ($55k-$250k): 1950
        // Next $100,000 ($250k-$350k): 1500
        // Total: 3725
        expect(result.provincial_tax).toBe(3725);
      });

      it('should calculate Ontario LTT for property over $2,000,000', () => {
        const result = calculateLandTransferTax(2500000, 'ON', undefined, false);

        // Complex calculation with all tiers
        expect(result.provincial_tax).toBeGreaterThan(30000);
        expect(result.total_tax).toBeGreaterThan(30000);
      });

      it('should apply first-time buyer rebate in Ontario', () => {
        const result = calculateLandTransferTax(400000, 'ON', undefined, true);

        const resultNoRebate = calculateLandTransferTax(400000, 'ON', undefined, false);
        expect(result.first_time_buyer_rebate).toBe(4000); // Max rebate
        expect(result.total_tax).toBe(resultNoRebate.total_tax - 4000);
      });

      it('should calculate Toronto municipal LTT', () => {
        const result = calculateLandTransferTax(500000, 'ON', 'Toronto', false);

        expect(result.municipal_tax).toBeGreaterThan(0);
        expect(result.total_tax).toBe(result.provincial_tax + result.municipal_tax);
      });

      it('should apply Toronto first-time buyer rebate', () => {
        const result = calculateLandTransferTax(400000, 'ON', 'Toronto', true);

        // Should have both provincial and municipal rebates
        expect(result.first_time_buyer_rebate).toBeGreaterThan(4000);
      });
    });

    describe('British Columbia', () => {
      it('should calculate BC LTT for property under $200,000', () => {
        const result = calculateLandTransferTax(150000, 'BC', undefined, false);

        expect(result.provincial_tax).toBe(1500); // 150000 * 0.01
        expect(result.total_tax).toBe(1500);
      });

      it('should calculate BC LTT for property $200,000 - $2,000,000', () => {
        const result = calculateLandTransferTax(500000, 'BC', undefined, false);

        // First $200,000: 2000
        // Next $300,000: 6000
        // Total: 8000
        expect(result.provincial_tax).toBe(8000);
      });

      it('should calculate BC LTT for property over $3,000,000', () => {
        const result = calculateLandTransferTax(3500000, 'BC', undefined, false);

        // Includes 3% rate on portion over $3M
        expect(result.provincial_tax).toBeGreaterThan(60000);
      });

      it('should apply BC first-time buyer exemption', () => {
        const result = calculateLandTransferTax(500000, 'BC', undefined, true);

        expect(result.first_time_buyer_rebate).toBeGreaterThan(0);
        expect(result.total_tax).toBeLessThan(8000);
      });
    });

    describe('Alberta', () => {
      it('should calculate Alberta LTT (minimal)', () => {
        const result = calculateLandTransferTax(500000, 'AB', undefined, false);

        // Alberta has minimal land transfer fees
        expect(result.provincial_tax).toBeLessThan(1000);
        expect(result.total_tax).toBeLessThan(1000);
      });
    });

    describe('Quebec', () => {
      it('should calculate Quebec LTT', () => {
        const result = calculateLandTransferTax(500000, 'QC', undefined, false);

        // Quebec uses welcome tax calculation
        expect(result.provincial_tax).toBeGreaterThan(0);
        expect(result.total_tax).toBeGreaterThan(0);
      });

      it('should calculate Montreal municipal LTT', () => {
        const result = calculateLandTransferTax(500000, 'QC', 'Montreal', false);

        expect(result.municipal_tax).toBeGreaterThan(0);
      });
    });

    describe('Nova Scotia', () => {
      it('should calculate Nova Scotia LTT', () => {
        const result = calculateLandTransferTax(300000, 'NS', undefined, false);

        expect(result.provincial_tax).toBe(4500); // 300000 * 0.015
        expect(result.total_tax).toBe(4500);
      });

      it('should apply NS first-time buyer rebate', () => {
        const result = calculateLandTransferTax(200000, 'NS', undefined, true);

        expect(result.first_time_buyer_rebate).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateStressTest', () => {
    it('should apply OSFI stress test at contract rate + 2%', () => {
      const result = calculateStressTest(400000, 3.5, 25);

      expect(result.contract_rate).toBe(3.5);
      expect(result.stress_test_rate).toBe(5.5); // 3.5 + 2.0
      expect(result.contract_payment).toBeGreaterThan(0);
      expect(result.stress_test_payment).toBeGreaterThan(result.contract_payment);
      expect(result.payment_difference).toBe(
        result.stress_test_payment - result.contract_payment
      );
    });

    it('should apply minimum 5.25% stress test floor', () => {
      const result = calculateStressTest(400000, 2.5, 25);

      expect(result.contract_rate).toBe(2.5);
      expect(result.stress_test_rate).toBe(5.25); // Floor of 5.25% vs 4.5%
      expect(result.stress_test_payment).toBeGreaterThan(result.contract_payment);
    });

    it('should use contract + 2% when higher than floor', () => {
      const result = calculateStressTest(400000, 4.0, 25);

      expect(result.stress_test_rate).toBe(6.0); // 4.0 + 2.0 > 5.25
    });

    it('should calculate payments for 30-year amortization', () => {
      const result = calculateStressTest(500000, 3.0, 30);

      expect(result.contract_payment).toBeGreaterThan(0);
      expect(result.stress_test_payment).toBeGreaterThan(result.contract_payment);
    });

    it('should calculate payments for 20-year amortization', () => {
      const result = calculateStressTest(300000, 3.5, 20);

      expect(result.contract_payment).toBeGreaterThan(0);
      expect(result.stress_test_payment).toBeGreaterThan(result.contract_payment);
    });

    it('should handle large mortgage amounts', () => {
      const result = calculateStressTest(1000000, 4.5, 25);

      expect(result.contract_payment).toBeGreaterThan(5000);
      expect(result.stress_test_payment).toBeGreaterThan(result.contract_payment);
      expect(result.stress_test_rate).toBe(6.5); // 4.5 + 2.0
    });

    it('should verify OSFI constants', () => {
      expect(OSFI_STRESS_TEST_BUFFER).toBe(2.0);
      expect(OSFI_STRESS_TEST_FLOOR).toBe(5.25);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero down payment (CMHC)', () => {
      const result = calculateCMHCInsurance(500000, 0);

      expect(result.down_payment_amount).toBe(0);
      expect(result.mortgage_amount).toBe(500000);
      expect(result.requires_cmhc).toBe(true);
    });

    it('should handle very high purchase prices (LTT)', () => {
      const result = calculateLandTransferTax(10000000, 'ON', undefined, false);

      expect(result.total_tax).toBeGreaterThan(100000);
    });

    it('should handle very low interest rates (Stress Test)', () => {
      const result = calculateStressTest(400000, 1.0, 25);

      expect(result.stress_test_rate).toBe(5.25); // Floor applies
    });

    it('should handle very high interest rates (Stress Test)', () => {
      const result = calculateStressTest(400000, 10.0, 25);

      expect(result.stress_test_rate).toBe(12.0); // 10 + 2
    });
  });
});
