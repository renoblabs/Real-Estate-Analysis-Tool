import { DealAnalysis, PropertyInputs } from '@/types';

// Market opportunity data based on 2024-2025 research
export const CANADIAN_MARKET_OPPORTUNITIES = {
  // High opportunity markets - undervalued with growth potential
  highOpportunity: [
    {
      city: 'St. Catharines',
      province: 'ON',
      averagePrice: 670103,
      rentYield: 6.8,
      priceGrowth: -4.2, // YoY % - correction creating opportunity
      opportunity: 'Deep market correction, high inventory, motivated sellers, strong rental demand',
      bestStrategies: ['BRRRR', 'Buy & Hold', 'Multi-family conversion'],
      targetProperties: ['Detached homes', 'Semi-detached', 'Multi-unit properties'],
      riskLevel: 'Low-Medium',
      timeHorizon: '1-3 years',
      marketConditions: 'Strong buyers market - 3:1 listing to sales ratio',
      keyInsights: [
        'Average days on market: 45 days (+12.5% YoY)',
        'Active listings: 3,383 (+6.2% YoY)',
        'Condo prices down 21.7% - excellent entry point',
        'Well-priced homes still selling quickly'
      ]
    },
    {
      city: 'Niagara Falls',
      province: 'ON',
      averagePrice: 650000,
      rentYield: 7.2,
      priceGrowth: -3.8,
      opportunity: 'Tourism recovery driving rental demand, price correction creating value',
      bestStrategies: ['Short-term rental', 'Buy & Hold', 'BRRRR'],
      targetProperties: ['Near tourist areas', 'Multi-unit properties', 'Condos'],
      riskLevel: 'Medium',
      timeHorizon: '2-4 years',
      marketConditions: 'Balanced market with seasonal variations',
      keyInsights: [
        'Strong tourism recovery post-COVID',
        'High demand for short-term rentals',
        'Border proximity benefits',
        'Infrastructure investments ongoing'
      ]
    },
    {
      city: 'Welland',
      province: 'ON',
      averagePrice: 580000,
      rentYield: 8.1,
      priceGrowth: -2.5,
      opportunity: 'Most affordable Niagara market, strong cash flow potential, government investment',
      bestStrategies: ['Cash flow focus', 'BRRRR', 'Multi-family'],
      targetProperties: ['Detached homes', 'Multi-family', 'Fixer-uppers'],
      riskLevel: 'Medium',
      timeHorizon: '2-5 years',
      marketConditions: 'Emerging market with growth potential',
      keyInsights: [
        '$6.8M government investment in housing infrastructure',
        'Achieving 80%+ of housing targets',
        'Strong rental demand from local workforce',
        'Most affordable entry point in Niagara'
      ]
    },
    {
      city: 'Fort Erie',
      province: 'ON',
      averagePrice: 520000,
      rentYield: 7.8,
      priceGrowth: -1.8,
      opportunity: 'Border town benefits, affordable prices, cross-border appeal',
      bestStrategies: ['Buy & Hold', 'BRRRR', 'Cross-border rental'],
      targetProperties: ['Lakefront properties', 'Detached homes', 'Condos'],
      riskLevel: 'Medium',
      timeHorizon: '3-7 years',
      marketConditions: 'Stable market with unique advantages',
      keyInsights: [
        'Peace Bridge proximity benefits',
        'Lakefront and canal access',
        'Cross-border worker demand',
        'Improved selection for buyers'
      ]
    },
    {
      city: 'Calgary',
      province: 'AB',
      averagePrice: 550000,
      rentYield: 6.2,
      priceGrowth: 14.2, // YoY %
      opportunity: 'Strong economic recovery, affordable entry point, high rental demand',
      bestStrategies: ['BRRRR', 'Buy & Hold', 'Multi-family conversion'],
      targetProperties: ['Detached homes', 'Downtown condos', 'Duplexes'],
      riskLevel: 'Medium',
      timeHorizon: '2-5 years'
    },
    {
      city: 'Edmonton',
      province: 'AB',
      averagePrice: 420000,
      rentYield: 7.1,
      priceGrowth: 8.5,
      opportunity: 'Most affordable major market, tight supply, strong rental demand',
      bestStrategies: ['BRRRR', 'Multi-family development', 'Student housing'],
      targetProperties: ['Detached homes', 'Small multi-family', 'Near universities'],
      riskLevel: 'Low-Medium',
      timeHorizon: '3-7 years'
    },
    {
      city: 'London',
      province: 'ON',
      averagePrice: 650000,
      rentYield: 5.8,
      priceGrowth: 6.2,
      opportunity: 'GTA spillover, university town, balanced market',
      bestStrategies: ['Student housing', 'BRRRR', 'Multi-family'],
      targetProperties: ['Near Western/Fanshawe', 'Multi-unit properties', 'Fixer-uppers'],
      riskLevel: 'Medium',
      timeHorizon: '2-4 years'
    },
    {
      city: 'Halifax',
      province: 'NS',
      averagePrice: 480000,
      rentYield: 6.8,
      priceGrowth: 12.1,
      opportunity: 'Highest rental returns in Canada, growing tech scene, international students',
      bestStrategies: ['Buy & Hold', 'Student housing', 'Tech worker housing'],
      targetProperties: ['South/Southeast areas', 'Near universities', 'Downtown condos'],
      riskLevel: 'Medium',
      timeHorizon: '2-5 years'
    }
  ],
  
  // Emerging markets - early stage opportunities
  emerging: [
    {
      city: 'Winnipeg',
      province: 'MB',
      averagePrice: 350000,
      rentYield: 8.2,
      priceGrowth: 4.1,
      opportunity: 'Ultra-affordable, high cash flow potential',
      bestStrategies: ['Cash flow focus', 'Multi-family', 'BRRRR'],
      targetProperties: ['Multi-family', 'Older homes for renovation'],
      riskLevel: 'Medium-High',
      timeHorizon: '5-10 years'
    },
    {
      city: 'Saskatoon',
      province: 'SK',
      averagePrice: 380000,
      rentYield: 7.5,
      priceGrowth: 2.8,
      opportunity: 'Resource sector recovery, affordable prices',
      bestStrategies: ['Buy & Hold', 'BRRRR'],
      targetProperties: ['Detached homes', 'Condos'],
      riskLevel: 'High',
      timeHorizon: '5-10 years'
    }
  ]
};

export interface DealOpportunity {
  score: number; // 0-100
  category: 'Home Run' | 'Strong' | 'Good' | 'Fair' | 'Poor';
  reasons: string[];
  redFlags: string[];
  recommendations: string[];
  estimatedROI: number;
  cashFlow: number;
  equityGain: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface DealSourcingCriteria {
  maxPrice: number;
  minCashFlow: number;
  minROI: number;
  preferredCities: string[];
  strategies: string[];
  riskTolerance: 'Low' | 'Medium' | 'High';
  timeHorizon: string;
  diyCapabilities: {
    electrical: boolean;
    plumbing: boolean;
    drywall: boolean;
    flooring: boolean;
    painting: boolean;
    landscaping: boolean;
    generalLabor: boolean;
  };
  maxRenovationBudget: number;
}

export class DealSourcingEngine {
  
  /**
   * Analyze a property for investment potential
   */
  static analyzeDealOpportunity(
    analysis: DealAnalysis,
    criteria: DealSourcingCriteria
  ): DealOpportunity {
    const scores: number[] = [];
    const reasons: string[] = [];
    const redFlags: string[] = [];
    const recommendations: string[] = [];

    // 1. Cash Flow Analysis (25 points)
    const monthlyCashFlow = analysis.cashFlow.monthly;
    if (monthlyCashFlow >= criteria.minCashFlow) {
      const cashFlowScore = Math.min(25, (monthlyCashFlow / criteria.minCashFlow) * 15);
      scores.push(cashFlowScore);
      reasons.push(`Strong cash flow: $${monthlyCashFlow.toLocaleString()}/month`);
    } else {
      scores.push(0);
      redFlags.push(`Negative cash flow: $${monthlyCashFlow.toLocaleString()}/month`);
    }

    // 2. ROI Analysis (20 points)
    const roi = analysis.returns.cash_on_cash_return;
    if (roi >= criteria.minROI) {
      const roiScore = Math.min(20, (roi / criteria.minROI) * 15);
      scores.push(roiScore);
      reasons.push(`Excellent ROI: ${roi.toFixed(1)}%`);
    } else {
      scores.push(Math.max(0, (roi / criteria.minROI) * 10));
      if (roi < 5) redFlags.push(`Low ROI: ${roi.toFixed(1)}%`);
    }

    // 3. Market Opportunity (20 points)
    const marketScore = this.analyzeMarketOpportunity(analysis, criteria);
    scores.push(marketScore.score);
    reasons.push(...marketScore.reasons);
    redFlags.push(...marketScore.redFlags);

    // 4. Renovation Potential (15 points)
    const renovationScore = this.analyzeRenovationPotential(analysis, criteria);
    scores.push(renovationScore.score);
    reasons.push(...renovationScore.reasons);
    recommendations.push(...renovationScore.recommendations);

    // 5. Financial Structure (10 points)
    const financialScore = this.analyzeFinancialStructure(analysis);
    scores.push(financialScore.score);
    reasons.push(...financialScore.reasons);
    redFlags.push(...financialScore.redFlags);

    // 6. Risk Assessment (10 points)
    const riskScore = this.analyzeRiskFactors(analysis, criteria);
    scores.push(riskScore.score);
    reasons.push(...riskScore.reasons);
    redFlags.push(...riskScore.redFlags);

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    return {
      score: Math.round(totalScore),
      category: this.categorizeScore(totalScore),
      reasons,
      redFlags,
      recommendations,
      estimatedROI: roi,
      cashFlow: monthlyCashFlow,
      equityGain: this.estimateEquityGain(analysis),
      riskLevel: this.assessOverallRisk(analysis, criteria)
    };
  }

  private static analyzeMarketOpportunity(
    analysis: DealAnalysis,
    criteria: DealSourcingCriteria
  ) {
    const reasons: string[] = [];
    const redFlags: string[] = [];
    let score = 0;

    // Find market data for the property location
    const allMarkets = [...CANADIAN_MARKET_OPPORTUNITIES.highOpportunity, ...CANADIAN_MARKET_OPPORTUNITIES.emerging];
    const marketData = allMarkets.find(market => 
      analysis.property.city?.toLowerCase().includes(market.city.toLowerCase()) ||
      criteria.preferredCities.some(city => city.toLowerCase().includes(market.city.toLowerCase()))
    );

    if (marketData) {
      // High opportunity markets get higher scores
      if (CANADIAN_MARKET_OPPORTUNITIES.highOpportunity.includes(marketData)) {
        score += 15;
        reasons.push(`Located in high-opportunity market: ${marketData.city}`);
        reasons.push(`Market opportunity: ${marketData.opportunity}`);
      } else {
        score += 10;
        reasons.push(`Located in emerging market: ${marketData.city}`);
      }

      // Price growth bonus
      if (marketData.priceGrowth > 10) {
        score += 5;
        reasons.push(`Strong price growth: ${marketData.priceGrowth}% YoY`);
      } else if (marketData.priceGrowth > 5) {
        score += 3;
      }

      // Rent yield bonus
      if (marketData.rentYield > 7) {
        score += 3;
        reasons.push(`High rental yield market: ${marketData.rentYield}%`);
      }
    } else {
      score += 5; // Neutral score for unknown markets
      redFlags.push('Market data not available for detailed analysis');
    }

    return { score: Math.min(20, score), reasons, redFlags };
  }

  private static analyzeRenovationPotential(
    analysis: DealAnalysis,
    criteria: DealSourcingCriteria
  ) {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Property age analysis
    const currentYear = new Date().getFullYear();
    const propertyAge = analysis.property.year_built ? currentYear - analysis.property.year_built : 0;

    if (propertyAge > 30) {
      score += 8;
      reasons.push('Older property with renovation potential');
      recommendations.push('Consider major renovation for value-add opportunity');
    } else if (propertyAge > 15) {
      score += 5;
      reasons.push('Mid-age property with update potential');
    } else {
      score += 2;
      reasons.push('Newer property - limited renovation upside');
    }

    // DIY capabilities bonus
    const diySkills = Object.values(criteria.diyCapabilities).filter(Boolean).length;
    const diyBonus = Math.min(7, diySkills);
    score += diyBonus;
    
    if (diyBonus > 4) {
      reasons.push('Strong DIY capabilities will reduce renovation costs');
      recommendations.push('Focus on properties needing cosmetic/moderate renovations');
    }

    return { score: Math.min(15, score), reasons, recommendations };
  }

  private static analyzeFinancialStructure(analysis: DealAnalysis) {
    const reasons: string[] = [];
    const redFlags: string[] = [];
    let score = 0;

    // Down payment analysis
    const downPaymentPercent = (analysis.acquisition.down_payment / analysis.acquisition.purchase_price) * 100;
    
    if (downPaymentPercent >= 25) {
      score += 4;
      reasons.push('Strong down payment reduces financing risk');
    } else if (downPaymentPercent >= 20) {
      score += 3;
    } else {
      score += 1;
      redFlags.push('Low down payment increases financing risk');
    }

    // Debt service coverage
    const annualCashFlow = analysis.cashFlow.monthly * 12;
    const annualDebtService = analysis.financing.monthly_payment * 12;
    const dscr = (annualCashFlow + annualDebtService) / annualDebtService;

    if (dscr > 1.25) {
      score += 4;
      reasons.push(`Strong debt coverage ratio: ${dscr.toFixed(2)}`);
    } else if (dscr > 1.1) {
      score += 2;
    } else {
      redFlags.push(`Tight debt coverage: ${dscr.toFixed(2)}`);
    }

    // Interest rate risk
    if (analysis.financing.interest_rate > 7) {
      redFlags.push('High interest rate increases refinancing risk');
    } else if (analysis.financing.interest_rate < 5) {
      score += 2;
      reasons.push('Favorable interest rate');
    }

    return { score: Math.min(10, score), reasons, redFlags };
  }

  private static analyzeRiskFactors(
    analysis: DealAnalysis,
    criteria: DealSourcingCriteria
  ) {
    const reasons: string[] = [];
    const redFlags: string[] = [];
    let score = 10; // Start with full points, deduct for risks

    // Market concentration risk
    if (analysis.property.city && ['Toronto', 'Vancouver'].includes(analysis.property.city)) {
      score -= 3;
      redFlags.push('High-priced market with affordability concerns');
    }

    // Property type risk
    if (analysis.property.property_type === 'condo') {
      score -= 2;
      redFlags.push('Condo market showing weakness in major cities');
    }

    // Vacancy risk
    const vacancyRate = analysis.expenses.vacancy_rate || 5;
    if (vacancyRate > 8) {
      score -= 3;
      redFlags.push(`High vacancy rate: ${vacancyRate}%`);
    } else if (vacancyRate < 3) {
      reasons.push(`Low vacancy risk: ${vacancyRate}%`);
    }

    // Risk tolerance alignment
    const riskLevel = this.assessOverallRisk(analysis, criteria);
    if (riskLevel === criteria.riskTolerance || 
        (criteria.riskTolerance === 'Medium' && riskLevel !== 'High')) {
      reasons.push('Risk level aligns with investor tolerance');
    } else {
      score -= 2;
      redFlags.push(`Risk level (${riskLevel}) doesn't match tolerance (${criteria.riskTolerance})`);
    }

    return { score: Math.max(0, score), reasons, redFlags };
  }

  private static categorizeScore(score: number): DealOpportunity['category'] {
    if (score >= 85) return 'Home Run';
    if (score >= 70) return 'Strong';
    if (score >= 55) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  private static estimateEquityGain(analysis: DealAnalysis): number {
    // Estimate 5-year equity gain based on market appreciation
    const currentValue = analysis.acquisition.purchase_price;
    const appreciationRate = 0.04; // Conservative 4% annual
    return currentValue * Math.pow(1 + appreciationRate, 5) - currentValue;
  }

  private static assessOverallRisk(
    analysis: DealAnalysis,
    criteria: DealSourcingCriteria
  ): 'Low' | 'Medium' | 'High' {
    let riskFactors = 0;

    // High-priced markets
    if (analysis.acquisition.purchase_price > 800000) riskFactors++;
    
    // High leverage
    const ltv = (analysis.financing.loan_amount / analysis.acquisition.purchase_price) * 100;
    if (ltv > 80) riskFactors++;
    
    // Negative cash flow
    if (analysis.cashFlow.monthly < 0) riskFactors += 2;
    
    // High interest rates
    if (analysis.financing.interest_rate > 6.5) riskFactors++;

    if (riskFactors >= 3) return 'High';
    if (riskFactors >= 1) return 'Medium';
    return 'Low';
  }

  /**
   * Generate investment recommendations based on market opportunities
   */
  static generateInvestmentRecommendations(criteria: DealSourcingCriteria): string[] {
    const recommendations: string[] = [];

    // Market-specific recommendations
    const targetMarkets = CANADIAN_MARKET_OPPORTUNITIES.highOpportunity.filter(market =>
      criteria.preferredCities.length === 0 || 
      criteria.preferredCities.some(city => city.toLowerCase().includes(market.city.toLowerCase()))
    );

    if (targetMarkets.length > 0) {
      recommendations.push(`🎯 Focus on these high-opportunity markets: ${targetMarkets.map(m => m.city).join(', ')}`);
      
      targetMarkets.forEach(market => {
        recommendations.push(`📍 ${market.city}: ${market.opportunity}`);
        recommendations.push(`   Best strategies: ${market.bestStrategies.join(', ')}`);
        recommendations.push(`   Target properties: ${market.targetProperties.join(', ')}`);
      });
    }

    // Strategy recommendations based on criteria
    if (criteria.diyCapabilities.electrical && criteria.diyCapabilities.plumbing) {
      recommendations.push('💪 Your strong DIY skills make BRRRR strategy highly profitable');
      recommendations.push('🔧 Target properties needing major renovations for maximum value-add');
    }

    if (criteria.maxPrice < 500000) {
      recommendations.push('💰 Consider Edmonton and Calgary for affordable entry points');
      recommendations.push('🏠 Focus on detached homes and small multi-family properties');
    }

    if (criteria.minCashFlow > 500) {
      recommendations.push('💵 Halifax and Edmonton offer the highest rental yields');
      recommendations.push('🎓 Consider student housing near universities for stable cash flow');
    }

    return recommendations;
  }
}

/**
 * Sample deal sourcing criteria for Niagara region
 */
export const SAMPLE_DEAL_CRITERIA: DealSourcingCriteria = {
  maxPrice: 650000,
  minCashFlow: 300,
  minROI: 15,
  preferredCities: ['St. Catharines', 'Welland', 'Fort Erie', 'Niagara Falls'],
  strategies: ['BRRRR', 'Buy & Hold', 'Multi-family'],
  riskTolerance: 'Medium',
  timeHorizon: '2-4 years',
  diyCapabilities: {
    electrical: false,
    plumbing: false,
    drywall: true,
    flooring: true,
    painting: true,
    landscaping: true,
    generalLabor: true
  },
  maxRenovationBudget: 75000
};