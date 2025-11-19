// REI OPS™ - Canadian Financial Calculations Engine

import type { CMHCResult, LandTransferTaxResult, StressTestResult, Province } from '@/types';
import { OSFI_STRESS_TEST_FLOOR, OSFI_STRESS_TEST_BUFFER } from '@/constants/market-data';

/**
 * Calculate CMHC insurance premium
 * CMHC insurance is required for down payments < 20%
 */
export function calculateCMHCInsurance(
  purchasePrice: number,
  downPaymentPercent: number
): CMHCResult {
  // CMHC not available above $1M purchase price
  if (purchasePrice > 1000000 && downPaymentPercent < 20) {
    return {
      premium: 0,
      premiumRate: 0,
      insuranceRequired: false,
      totalMortgageWithInsurance: 0,
      message: "Properties over $1M require 20% down - CMHC insurance not available"
    };
  }

  if (downPaymentPercent >= 20) {
    const mortgageAmount = purchasePrice * (1 - downPaymentPercent / 100);
    return {
      premium: 0,
      premiumRate: 0,
      insuranceRequired: false,
      totalMortgageWithInsurance: mortgageAmount,
      message: "No CMHC insurance required with 20%+ down payment"
    };
  }

  // CMHC Premium Rates (as of 2024)
  let premiumRate: number;
  if (downPaymentPercent >= 15 && downPaymentPercent < 20) {
    premiumRate = 2.80;
  } else if (downPaymentPercent >= 10 && downPaymentPercent < 15) {
    premiumRate = 3.10;
  } else if (downPaymentPercent >= 5 && downPaymentPercent < 10) {
    premiumRate = 4.00;
  } else {
    throw new Error("Minimum 5% down payment required");
  }

  const mortgageAmount = purchasePrice * (1 - downPaymentPercent / 100);
  const premium = mortgageAmount * (premiumRate / 100);
  const totalMortgageWithInsurance = mortgageAmount + premium;

  return {
    premium,
    premiumRate,
    insuranceRequired: true,
    totalMortgageWithInsurance,
    message: `CMHC insurance premium: ${premiumRate}% of mortgage amount`
  };
}

/**
 * Calculate Land Transfer Tax based on province and municipality
 */
export function calculateLandTransferTax(
  purchasePrice: number,
  province: Province,
  city?: string,
  isFirstTimeBuyer: boolean = false
): LandTransferTaxResult {
  let provincialTax = 0;
  let municipalTax = 0;
  let rebate = 0;
  const breakdown: string[] = [];

  switch (province) {
    case 'ON':
      // Ontario Provincial LTT
      if (purchasePrice <= 55000) {
        provincialTax = purchasePrice * 0.005;
      } else if (purchasePrice <= 250000) {
        provincialTax = 275 + ((purchasePrice - 55000) * 0.01);
      } else if (purchasePrice <= 400000) {
        provincialTax = 2225 + ((purchasePrice - 250000) * 0.015);
      } else {
        provincialTax = 4475 + ((purchasePrice - 400000) * 0.02);
      }

      breakdown.push(`Ontario Provincial LTT: $${provincialTax.toFixed(2)}`);

      // Toronto Municipal LTT (if applicable)
      if (city?.toLowerCase().includes('toronto')) {
        if (purchasePrice <= 55000) {
          municipalTax = purchasePrice * 0.005;
        } else if (purchasePrice <= 250000) {
          municipalTax = 275 + ((purchasePrice - 55000) * 0.01);
        } else if (purchasePrice <= 400000) {
          municipalTax = 2225 + ((purchasePrice - 250000) * 0.015);
        } else {
          municipalTax = 4475 + ((purchasePrice - 400000) * 0.02);
        }
        breakdown.push(`Toronto Municipal LTT: $${municipalTax.toFixed(2)}`);
      }

      // First-time buyer rebate
      if (isFirstTimeBuyer) {
        rebate = Math.min(4000, provincialTax); // Provincial rebate
        if (city?.toLowerCase().includes('toronto')) {
          rebate += Math.min(4475, municipalTax); // Toronto rebate
        }
        breakdown.push(`First-time buyer rebate: -$${rebate.toFixed(2)}`);
      }
      break;

    case 'BC':
      // BC Property Transfer Tax
      if (purchasePrice <= 200000) {
        provincialTax = purchasePrice * 0.01;
      } else if (purchasePrice <= 2000000) {
        provincialTax = 2000 + ((purchasePrice - 200000) * 0.02);
      } else if (purchasePrice <= 3000000) {
        provincialTax = 38000 + ((purchasePrice - 2000000) * 0.03);
      } else {
        provincialTax = 68000 + ((purchasePrice - 3000000) * 0.05);
      }

      breakdown.push(`BC Property Transfer Tax: $${provincialTax.toFixed(2)}`);

      // First-time buyer exemption (properties up to $500K)
      if (isFirstTimeBuyer && purchasePrice <= 500000) {
        rebate = provincialTax;
        breakdown.push(`First-time buyer exemption: -$${rebate.toFixed(2)}`);
      } else if (isFirstTimeBuyer && purchasePrice <= 525000) {
        // Partial exemption for $500K-$525K
        const exemptionAmount = 500000;
        const exemptionTax = (exemptionAmount <= 200000)
          ? exemptionAmount * 0.01
          : 2000 + ((exemptionAmount - 200000) * 0.02);
        rebate = exemptionTax;
        breakdown.push(`First-time buyer partial exemption: -$${rebate.toFixed(2)}`);
      }
      break;

    case 'AB':
      // Alberta - No land transfer tax, just registration fee
      provincialTax = 0;
      municipalTax = 0;
      breakdown.push("Alberta has no land transfer tax");
      breakdown.push("Title registration fee: ~$300 (not included in LTT calculation)");
      break;

    case 'NS':
      // Nova Scotia Deed Transfer Tax
      if (purchasePrice <= 30000) {
        provincialTax = purchasePrice * 0.005;
      } else if (purchasePrice <= 60000) {
        provincialTax = 150 + ((purchasePrice - 30000) * 0.01);
      } else {
        provincialTax = 450 + ((purchasePrice - 60000) * 0.015);
      }

      breakdown.push(`Nova Scotia Deed Transfer Tax: $${provincialTax.toFixed(2)}`);

      // First-time buyer rebate (up to $1,500)
      if (isFirstTimeBuyer) {
        rebate = Math.min(1500, provincialTax);
        breakdown.push(`First-time buyer rebate: -$${rebate.toFixed(2)}`);
      }
      break;

    case 'QC':
      // Quebec Welcome Tax (varies by municipality - use Montreal rates as default)
      if (purchasePrice <= 54900) {
        provincialTax = purchasePrice * 0.005;
      } else if (purchasePrice <= 274900) {
        provincialTax = 274.50 + ((purchasePrice - 54900) * 0.01);
      } else {
        provincialTax = 2474.50 + ((purchasePrice - 274900) * 0.015);
      }

      breakdown.push(`Quebec Welcome Tax (Montreal rates): $${provincialTax.toFixed(2)}`);
      breakdown.push("Note: Welcome tax varies by municipality");
      break;
  }

  const totalTax = provincialTax + municipalTax;
  const netTax = totalTax - rebate;

  return {
    provincialTax,
    municipalTax,
    totalTax,
    rebate,
    netTax,
    breakdown
  };
}

/**
 * Calculate OSFI B-20 Stress Test
 * Must qualify at higher of contract rate + 2% or 5.25%
 */
export function calculateStressTest(
  mortgageAmount: number,
  contractRate: number,
  amortizationYears: number
): StressTestResult {
  // OSFI B-20: Must qualify at higher of contract + 2% or 5.25%
  const stressTestRate = Math.max(
    contractRate + OSFI_STRESS_TEST_BUFFER,
    OSFI_STRESS_TEST_FLOOR
  );

  // Calculate monthly payments
  const contractPayment = calculateMortgagePayment(
    mortgageAmount,
    contractRate,
    amortizationYears
  );
  const qualificationPayment = calculateMortgagePayment(
    mortgageAmount,
    stressTestRate,
    amortizationYears
  );

  return {
    stressTestRate,
    qualificationPayment,
    contractPayment,
    passes: true, // We don't have income info, so just show the requirement
    message: `Must qualify at ${stressTestRate.toFixed(2)}% (payment: $${qualificationPayment.toFixed(2)}/mo)`
  };
}

/**
 * Calculate monthly mortgage payment using standard amortization formula
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (principal <= 0 || years <= 0) return 0;

  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return payment;
}

/**
 * Calculate remaining mortgage balance after a number of payments
 */
export function calculateMortgageBalance(
  principal: number,
  annualRate: number,
  totalYears: number,
  yearsElapsed: number
): number {
  const monthlyRate = (annualRate / 100) / 12;
  const totalPayments = totalYears * 12;
  const paymentsMade = yearsElapsed * 12;

  if (monthlyRate === 0) {
    return principal * (1 - paymentsMade / totalPayments);
  }

  const monthlyPayment = calculateMortgagePayment(principal, annualRate, totalYears);

  const balance = principal * Math.pow(1 + monthlyRate, paymentsMade) -
    monthlyPayment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate);

  return Math.max(0, balance);
}

/**
 * Estimate renovation costs based on property condition and square footage
 */
export function estimateRenovationCost(
  condition: 'move_in_ready' | 'cosmetic' | 'moderate_reno' | 'heavy_reno' | 'gut_job',
  squareFeet: number
): { low: number; mid: number; high: number } {
  const rates = {
    move_in_ready: { low: 0, mid: 0, high: 0 },
    cosmetic: { low: 15, mid: 25, high: 40 },
    moderate_reno: { low: 40, mid: 65, high: 90 },
    heavy_reno: { low: 100, mid: 150, high: 200 },
    gut_job: { low: 150, mid: 200, high: 300 }
  };

  const rate = rates[condition];

  return {
    low: rate.low * squareFeet,
    mid: rate.mid * squareFeet,
    high: rate.high * squareFeet
  };
}

/**
 * Calculate breakeven occupancy rate
 */
export function calculateBreakevenOccupancy(
  totalExpenses: number,
  grossIncome: number
): number {
  if (grossIncome === 0) return 100;
  return (totalExpenses / grossIncome) * 100;
}

/**
 * Validate minimum down payment requirements
 */
export function validateDownPayment(
  purchasePrice: number,
  downPaymentPercent: number
): { valid: boolean; message: string; minimumRequired: number } {
  let minimumRequired = 5;

  if (purchasePrice <= 500000) {
    minimumRequired = 5;
  } else if (purchasePrice <= 1000000) {
    // For properties $500K-$1M, need 5% on first $500K and 10% on remainder
    const firstPortion = 500000 * 0.05;
    const secondPortion = (purchasePrice - 500000) * 0.10;
    minimumRequired = ((firstPortion + secondPortion) / purchasePrice) * 100;
  } else {
    minimumRequired = 20;
  }

  const valid = downPaymentPercent >= minimumRequired;
  const message = valid
    ? "Down payment meets requirements"
    : `Minimum ${minimumRequired.toFixed(1)}% down payment required`;

  return { valid, message, minimumRequired };
}
