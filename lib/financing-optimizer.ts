// Creative Financing Strategy Optimizer for Canadian Real Estate

export interface FinancingProfile {
  currentIncome: number;
  currentAssets: number;
  currentDebt: number;
  creditScore: number;
  downPaymentAvailable: number;
  monthlyBudget: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  investmentGoals: 'Cash Flow' | 'Appreciation' | 'Balanced';
  timeHorizon: number; // years
}

export interface FinancingStrategy {
  name: string;
  description: string;
  downPaymentRequired: number;
  monthlyPayment: number;
  totalCost: number;
  pros: string[];
  cons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  suitability: number; // 0-100 score
  requirements: string[];
  nextSteps: string[];
}

export interface CreativeFinancingOption {
  strategy: string;
  description: string;
  minimumEquity: number;
  typicalTerms: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  bestFor: string[];
  legalConsiderations: string[];
}

// Canadian-specific financing options
export const CREATIVE_FINANCING_OPTIONS: CreativeFinancingOption[] = [
  {
    strategy: 'Vendor Take-Back (VTB) Mortgage',
    description: 'Seller acts as the bank, providing financing to the buyer',
    minimumEquity: 20,
    typicalTerms: '1-5 years, 6-8% interest, balloon payment',
    riskLevel: 'Medium',
    bestFor: ['Motivated sellers', 'Properties hard to finance', 'Quick closings'],
    legalConsiderations: ['Proper legal documentation required', 'Title insurance recommended', 'Clear exit strategy needed']
  },
  {
    strategy: 'Joint Venture Partnership',
    description: 'Partner with someone who has capital or credit',
    minimumEquity: 0,
    typicalTerms: '50/50 or 60/40 split, defined roles and responsibilities',
    riskLevel: 'Medium',
    bestFor: ['Limited capital', 'Strong deal-finding skills', 'Sweat equity contribution'],
    legalConsiderations: ['Partnership agreement essential', 'Clear exit clauses', 'Liability considerations']
  },
  {
    strategy: 'Private Lending',
    description: 'Borrow from private individuals or companies',
    minimumEquity: 25,
    typicalTerms: '8-12% interest, 1-2 year terms, interest-only payments',
    riskLevel: 'High',
    bestFor: ['Quick closings', 'Unique properties', 'Bridge financing'],
    legalConsiderations: ['Higher interest rates', 'Shorter terms', 'Personal guarantees often required']
  },
  {
    strategy: 'Lease-to-Own',
    description: 'Rent with option to purchase, building equity over time',
    minimumEquity: 5,
    typicalTerms: '2-5 year lease, portion of rent goes to down payment',
    riskLevel: 'Medium',
    bestFor: ['Poor credit', 'Limited down payment', 'Stable income'],
    legalConsiderations: ['Option fee required', 'Clear purchase terms', 'Maintenance responsibilities']
  },
  {
    strategy: 'Assumable Mortgage',
    description: 'Take over the existing mortgage from the seller',
    minimumEquity: 10,
    typicalTerms: 'Existing rate and terms, subject to lender approval',
    riskLevel: 'Low',
    bestFor: ['Low interest rate mortgages', 'Good credit buyers', 'Stable properties'],
    legalConsiderations: ['Lender approval required', 'Due-on-sale clauses', 'Liability for existing debt']
  },
  {
    strategy: 'HELOC for Investment',
    description: 'Use home equity line of credit for down payment',
    minimumEquity: 20,
    typicalTerms: 'Prime + 0.5-1%, interest-only payments, revolving credit',
    riskLevel: 'High',
    bestFor: ['Existing homeowners', 'Multiple property strategy', 'Experienced investors'],
    legalConsiderations: ['Primary residence at risk', 'Variable interest rates', 'Debt service ratio limits']
  },
  {
    strategy: 'Rent-to-Rent Subletting',
    description: 'Rent property and sublet for profit without ownership',
    minimumEquity: 0,
    typicalTerms: 'Master lease agreement, 3-5 year terms, guaranteed rent',
    riskLevel: 'Medium',
    bestFor: ['No capital required', 'Management skills', 'Market knowledge'],
    legalConsiderations: ['Landlord permission required', 'Local bylaws compliance', 'Insurance considerations']
  }
];

export class FinancingOptimizer {
  
  /**
   * Analyze traditional financing options
   */
  static analyzeTraditionalFinancing(
    propertyPrice: number,
    profile: FinancingProfile
  ): FinancingStrategy[] {
    const strategies: FinancingStrategy[] = [];

    // Conventional Mortgage (20% down)
    if (profile.downPaymentAvailable >= propertyPrice * 0.2) {
      const downPayment = propertyPrice * 0.2;
      const loanAmount = propertyPrice - downPayment;
      const monthlyPayment = this.calculateMortgagePayment(loanAmount, 6.5, 25);
      
      strategies.push({
        name: 'Conventional Mortgage (20% Down)',
        description: 'Standard mortgage with 20% down payment, no CMHC insurance required',
        downPaymentRequired: downPayment,
        monthlyPayment,
        totalCost: monthlyPayment * 12 * 25 + downPayment,
        pros: [
          'No mortgage insurance required',
          'Best interest rates',
          'Lower monthly payments',
          'Build equity faster'
        ],
        cons: [
          'Large down payment required',
          'Ties up significant capital',
          'Opportunity cost of capital'
        ],
        riskLevel: 'Low',
        suitability: this.calculateSuitability(profile, downPayment, monthlyPayment),
        requirements: [
          'Good credit score (680+)',
          'Stable income',
          'Debt service ratios under 44%'
        ],
        nextSteps: [
          'Get pre-approved with multiple lenders',
          'Shop for best rates',
          'Consider mortgage broker'
        ]
      });
    }

    // High-Ratio Mortgage (5-19% down)
    if (profile.downPaymentAvailable >= propertyPrice * 0.05) {
      const downPaymentPercent = Math.min(19, (profile.downPaymentAvailable / propertyPrice) * 100);
      const downPayment = propertyPrice * (downPaymentPercent / 100);
      const loanAmount = propertyPrice - downPayment;
      
      // CMHC insurance calculation
      const cmhcRate = this.getCMHCRate(downPaymentPercent);
      const cmhcPremium = loanAmount * (cmhcRate / 100);
      const totalLoanAmount = loanAmount + cmhcPremium;
      
      const monthlyPayment = this.calculateMortgagePayment(totalLoanAmount, 6.8, 25);
      
      strategies.push({
        name: `High-Ratio Mortgage (${downPaymentPercent.toFixed(0)}% Down)`,
        description: 'Mortgage with CMHC insurance for down payments under 20%',
        downPaymentRequired: downPayment,
        monthlyPayment,
        totalCost: monthlyPayment * 12 * 25 + downPayment,
        pros: [
          'Lower down payment required',
          'Preserve capital for other investments',
          'Get into market sooner'
        ],
        cons: [
          'CMHC insurance premium required',
          'Higher monthly payments',
          'Higher total interest cost'
        ],
        riskLevel: 'Medium',
        suitability: this.calculateSuitability(profile, downPayment, monthlyPayment),
        requirements: [
          'Good credit score (680+)',
          'Stable income',
          'Property under $1M',
          'Owner-occupied or investment property'
        ],
        nextSteps: [
          'Calculate CMHC premium',
          'Compare with 20% down option',
          'Consider accelerated payments'
        ]
      });
    }

    return strategies.sort((a, b) => b.suitability - a.suitability);
  }

  /**
   * Analyze creative financing options
   */
  static analyzeCreativeFinancing(
    propertyPrice: number,
    profile: FinancingProfile,
    marketConditions: 'hot' | 'balanced' | 'cold' = 'balanced'
  ): FinancingStrategy[] {
    const strategies: FinancingStrategy[] = [];

    // Vendor Take-Back Mortgage
    if (marketConditions === 'cold' || marketConditions === 'balanced') {
      const downPayment = propertyPrice * 0.1; // 10% down
      const vtbAmount = propertyPrice * 0.2; // Seller finances 20%
      const bankMortgage = propertyPrice * 0.7; // Bank finances 70%
      
      const bankPayment = this.calculateMortgagePayment(bankMortgage, 6.5, 25);
      const vtbPayment = this.calculateMortgagePayment(vtbAmount, 7.5, 5); // 5-year term
      const totalMonthlyPayment = bankPayment + vtbPayment;

      strategies.push({
        name: 'Vendor Take-Back Mortgage',
        description: 'Seller provides secondary financing for portion of purchase price',
        downPaymentRequired: downPayment,
        monthlyPayment: totalMonthlyPayment,
        totalCost: (bankPayment * 12 * 25) + (vtbPayment * 12 * 5) + downPayment,
        pros: [
          'Lower down payment required',
          'Faster closing possible',
          'Flexible terms with seller',
          'May work when bank financing difficult'
        ],
        cons: [
          'Higher interest rate on VTB portion',
          'Balloon payment due at term end',
          'Seller must be willing and able',
          'More complex legal structure'
        ],
        riskLevel: 'Medium',
        suitability: this.calculateCreativeSuitability(profile, 'VTB'),
        requirements: [
          'Motivated seller with equity',
          'Good relationship with seller',
          'Clear exit strategy for balloon payment',
          'Legal documentation'
        ],
        nextSteps: [
          'Assess seller motivation',
          'Negotiate VTB terms',
          'Arrange legal documentation',
          'Plan refinancing strategy'
        ]
      });
    }

    // Joint Venture Partnership
    if (profile.downPaymentAvailable < propertyPrice * 0.2) {
      strategies.push({
        name: 'Joint Venture Partnership',
        description: 'Partner provides capital, you provide expertise and management',
        downPaymentRequired: 0,
        monthlyPayment: this.calculateMortgagePayment(propertyPrice * 0.8, 6.5, 25),
        totalCost: propertyPrice, // Shared with partner
        pros: [
          'No down payment required from you',
          'Leverage partner\'s capital and credit',
          'Share risks and rewards',
          'Learn from experienced partner'
        ],
        cons: [
          'Share profits with partner',
          'Less control over decisions',
          'Potential for conflicts',
          'Complex legal agreements needed'
        ],
        riskLevel: 'Medium',
        suitability: this.calculateCreativeSuitability(profile, 'JV'),
        requirements: [
          'Find suitable partner',
          'Bring value (expertise, time, deals)',
          'Clear partnership agreement',
          'Defined roles and responsibilities'
        ],
        nextSteps: [
          'Network to find partners',
          'Prepare partnership proposal',
          'Draft partnership agreement',
          'Define profit-sharing structure'
        ]
      });
    }

    // HELOC Strategy (if applicable)
    if (profile.currentAssets > 200000) { // Assuming some home equity
      const helocAmount = Math.min(propertyPrice * 0.2, profile.currentAssets * 0.8);
      const helocPayment = helocAmount * 0.07 / 12; // Interest-only at 7%
      const mortgageAmount = propertyPrice - helocAmount;
      const mortgagePayment = this.calculateMortgagePayment(mortgageAmount, 6.5, 25);

      strategies.push({
        name: 'HELOC Down Payment Strategy',
        description: 'Use home equity line of credit for down payment',
        downPaymentRequired: 0, // From HELOC
        monthlyPayment: helocPayment + mortgagePayment,
        totalCost: (mortgagePayment * 12 * 25) + (helocPayment * 12 * 10) + helocAmount,
        pros: [
          'Preserve cash for other investments',
          'Interest-only payments on HELOC',
          'Tax-deductible interest (if investment)',
          'Flexible repayment'
        ],
        cons: [
          'Primary residence at risk',
          'Variable interest rates',
          'Higher total debt service',
          'Market risk on both properties'
        ],
        riskLevel: 'High',
        suitability: this.calculateCreativeSuitability(profile, 'HELOC'),
        requirements: [
          'Existing home with equity',
          'Good credit and income',
          'Comfortable with leverage',
          'Strong cash flow from investment'
        ],
        nextSteps: [
          'Get HELOC pre-approval',
          'Calculate total debt service',
          'Ensure positive cash flow',
          'Consider interest rate protection'
        ]
      });
    }

    return strategies.sort((a, b) => b.suitability - a.suitability);
  }

  /**
   * Generate comprehensive financing recommendation
   */
  static generateFinancingRecommendation(
    propertyPrice: number,
    profile: FinancingProfile,
    marketConditions: 'hot' | 'balanced' | 'cold' = 'balanced'
  ): {
    recommendedStrategy: FinancingStrategy;
    alternativeStrategies: FinancingStrategy[];
    actionPlan: string[];
    riskMitigation: string[];
    timeline: string[];
  } {
    
    const traditionalStrategies = this.analyzeTraditionalFinancing(propertyPrice, profile);
    const creativeStrategies = this.analyzeCreativeFinancing(propertyPrice, profile, marketConditions);
    
    const allStrategies = [...traditionalStrategies, ...creativeStrategies]
      .sort((a, b) => b.suitability - a.suitability);

    const recommendedStrategy = allStrategies[0];
    const alternativeStrategies = allStrategies.slice(1, 4);

    const actionPlan: string[] = [
      '📊 Complete detailed financial analysis',
      '🏦 Get pre-approved with multiple lenders',
      '📋 Gather all required documentation',
      '🔍 Compare all financing options',
      '📝 Negotiate terms and conditions',
      '⚖️ Review all legal documentation',
      '✅ Finalize financing and close deal'
    ];

    const riskMitigation: string[] = [
      '💰 Maintain emergency fund (6 months expenses)',
      '📈 Ensure positive cash flow after all expenses',
      '🔒 Consider interest rate protection',
      '📊 Regular financial review and monitoring',
      '🏠 Diversify investment portfolio',
      '📋 Have exit strategy planned'
    ];

    const timeline: string[] = [
      'Week 1-2: Financial analysis and pre-approval',
      'Week 3-4: Property search and offers',
      'Week 5-6: Financing finalization',
      'Week 7-8: Legal review and closing'
    ];

    return {
      recommendedStrategy,
      alternativeStrategies,
      actionPlan,
      riskMitigation,
      timeline
    };
  }

  private static calculateMortgagePayment(
    principal: number,
    annualRate: number,
    years: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  private static getCMHCRate(downPaymentPercent: number): number {
    if (downPaymentPercent >= 15) return 2.8;
    if (downPaymentPercent >= 10) return 3.1;
    return 4.0;
  }

  private static calculateSuitability(
    profile: FinancingProfile,
    downPayment: number,
    monthlyPayment: number
  ): number {
    let score = 50; // Base score

    // Down payment affordability
    if (downPayment <= profile.downPaymentAvailable) {
      score += 20;
    } else {
      score -= 30;
    }

    // Monthly payment affordability
    if (monthlyPayment <= profile.monthlyBudget * 0.8) {
      score += 20;
    } else if (monthlyPayment <= profile.monthlyBudget) {
      score += 10;
    } else {
      score -= 20;
    }

    // Risk tolerance alignment
    if (profile.riskTolerance === 'Conservative') {
      score += 10;
    } else if (profile.riskTolerance === 'Aggressive') {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateCreativeSuitability(
    profile: FinancingProfile,
    strategy: 'VTB' | 'JV' | 'HELOC'
  ): number {
    let score = 40; // Lower base score for creative strategies

    if (profile.riskTolerance === 'Aggressive') {
      score += 20;
    } else if (profile.riskTolerance === 'Moderate') {
      score += 10;
    } else {
      score -= 10;
    }

    // Strategy-specific adjustments
    switch (strategy) {
      case 'VTB':
        if (profile.downPaymentAvailable < 100000) score += 15;
        break;
      case 'JV':
        if (profile.downPaymentAvailable < 50000) score += 20;
        break;
      case 'HELOC':
        if (profile.currentAssets > 300000) score += 15;
        break;
    }

    return Math.max(0, Math.min(100, score));
  }
}