'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { 
  REAL_PORT_COLBORNE_DEALS, 
  DEAL_ANALYSIS_SUMMARY, 
  FUNDING_OPPORTUNITIES,
  RealPropertyDeal 
} from '@/lib/real-port-colborne-deals';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  Zap,
  Award
} from 'lucide-react';

export default function RealDealAnalysis() {
  const [selectedDeal, setSelectedDeal] = useState<RealPropertyDeal>(REAL_PORT_COLBORNE_DEALS[0]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Zap className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">🔥 REAL DEALS AVAILABLE NOW</AlertTitle>
        <AlertDescription className="text-green-700">
          These are actual MLS listings in Port Colborne analyzed for 4-unit ADU conversion potential. 
          All properties qualify for the new zoning laws and government funding programs.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="deals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deals">Live Deals</TabsTrigger>
          <TabsTrigger value="analysis">Deal Analysis</TabsTrigger>
          <TabsTrigger value="funding">Funding Stack</TabsTrigger>
          <TabsTrigger value="strategy">Investment Plan</TabsTrigger>
        </TabsList>

        {/* Live Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deal List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-semibold text-lg">Available Properties</h3>
              {REAL_PORT_COLBORNE_DEALS.map((deal, index) => (
                <Card 
                  key={deal.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDeal.id === deal.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedDeal(deal)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{deal.address}</div>
                        <div className="text-sm text-muted-foreground">MLS: {deal.mls}</div>
                      </div>
                      <Badge className={getScoreColor(deal.conversionPotential.score)}>
                        {deal.conversionPotential.score}/100
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>List Price:</span>
                        <span className="font-medium">{formatCurrency(deal.listPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cash Flow:</span>
                        <span className="font-medium text-green-600">
                          ${deal.financials.netCashFlow.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ROI:</span>
                        <span className="font-medium">{deal.financials.cashOnCashReturn}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Deal Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {selectedDeal.address}
                    {DEAL_ANALYSIS_SUMMARY.topPicks.find(p => p.address === selectedDeal.address) && (
                      <Badge variant="default" className="ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Property Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(selectedDeal.listPrice)}</div>
                      <div className="text-sm text-muted-foreground">List Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedDeal.bedrooms}/{selectedDeal.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bed/Bath</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedDeal.sqft.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Sq Ft</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedDeal.daysOnMarket}</div>
                      <div className="text-sm text-muted-foreground">Days on Market</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Property Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedDeal.description}</p>
                  </div>

                  {/* Conversion Potential */}
                  <div>
                    <h4 className="font-medium mb-3">ADU Conversion Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Conversion Score</span>
                          <span className={`font-bold ${getScoreColor(selectedDeal.conversionPotential.score)}`}>
                            {selectedDeal.conversionPotential.score}/100
                          </span>
                        </div>
                        <Progress value={selectedDeal.conversionPotential.score} className="mb-3" />
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Max Units:</span>
                            <span className="font-medium">{selectedDeal.conversionPotential.maxUnits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Cost:</span>
                            <span className="font-medium">{formatCurrency(selectedDeal.conversionPotential.conversionCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span className="font-medium">{selectedDeal.conversionPotential.timeToComplete} months</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-green-600 mb-1">Opportunities</h5>
                          <ul className="text-xs space-y-1">
                            {selectedDeal.conversionPotential.opportunities.map((opp, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-yellow-600 mb-1">Challenges</h5>
                          <ul className="text-xs space-y-1">
                            {selectedDeal.conversionPotential.challenges.map((challenge, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Projections */}
                  <div>
                    <h4 className="font-medium mb-3">Financial Projections</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(selectedDeal.financials.totalInvestment)}
                        </div>
                        <div className="text-sm text-blue-700">Total Investment</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-lg font-bold text-green-600">
                          ${selectedDeal.financials.netCashFlow.toLocaleString()}/mo
                        </div>
                        <div className="text-sm text-green-700">Net Cash Flow</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {selectedDeal.financials.cashOnCashReturn}%
                        </div>
                        <div className="text-sm text-purple-700">Cash-on-Cash ROI</div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Strategy */}
                  <div>
                    <h4 className="font-medium mb-3">Investment Strategy</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{selectedDeal.strategy.investmentType}</Badge>
                      <Badge className={getRiskColor(selectedDeal.strategy.riskLevel)}>
                        {selectedDeal.strategy.riskLevel} Risk
                      </Badge>
                      <Badge variant="secondary">{selectedDeal.strategy.timeHorizon}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Exit Strategies:</strong> {selectedDeal.strategy.exitStrategy.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Deal Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{DEAL_ANALYSIS_SUMMARY.totalDealsAnalyzed}</div>
                <div className="text-sm text-muted-foreground">Properties Analyzed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{formatCurrency(DEAL_ANALYSIS_SUMMARY.averageListPrice)}</div>
                <div className="text-sm text-muted-foreground">Average List Price</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{DEAL_ANALYSIS_SUMMARY.averageCashOnCashReturn}%</div>
                <div className="text-sm text-muted-foreground">Average ROI</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{DEAL_ANALYSIS_SUMMARY.averageCapRate}%</div>
                <div className="text-sm text-muted-foreground">Average Cap Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Picks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Top Investment Picks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEAL_ANALYSIS_SUMMARY.topPicks.map((pick, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-600 text-white rounded-full font-bold">
                      {pick.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{pick.address}</div>
                      <div className="text-sm text-muted-foreground">{pick.reason}</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Score: {pick.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Price/Sq Ft:</span>
                    <span className="font-medium">${DEAL_ANALYSIS_SUMMARY.marketInsights.averagePricePerSqft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Below Market Opportunity:</span>
                    <span className="font-medium text-green-600">
                      {DEAL_ANALYSIS_SUMMARY.marketInsights.belowMarketOpportunity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Yield Potential:</span>
                    <span className="font-medium text-blue-600">
                      {DEAL_ANALYSIS_SUMMARY.marketInsights.rentalYieldPotential}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Conversion Timeframe:</span>
                    <span className="font-medium">{DEAL_ANALYSIS_SUMMARY.marketInsights.conversionTimeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Range:</span>
                    <span className="font-medium">{DEAL_ANALYSIS_SUMMARY.marketInsights.totalInvestmentRange}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funding Stack Tab */}
        <TabsContent value="funding" className="space-y-4">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Government Funding Available</AlertTitle>
            <AlertDescription>
              Stack multiple funding sources to reduce your investment by 35-45% per property.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Federal ADU Loan Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Loan Amount:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(FUNDING_OPPORTUNITIES.federalADULoan.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium">{FUNDING_OPPORTUNITIES.federalADULoan.interestRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Term:</span>
                    <span className="font-medium">{FUNDING_OPPORTUNITIES.federalADULoan.term}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Available for all analyzed properties
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Port Colborne HAF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Fund:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(FUNDING_OPPORTUNITIES.portColborneHAF.totalFunding)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Property:</span>
                    <span className="font-medium">
                      {formatCurrency(FUNDING_OPPORTUNITIES.portColborneHAF.perPropertyPotential)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Apply Q1 2025 for 4-unit conversions
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ontario Renovation Tax Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Max Credit:</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(FUNDING_OPPORTUNITIES.ontarioRenovationTaxCredit.maxCredit)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    For senior or disability accommodation units
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Funding Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Per Property:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(FUNDING_OPPORTUNITIES.totalFundingPotential.perProperty)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portfolio (5 properties):</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(FUNDING_OPPORTUNITIES.totalFundingPotential.portfolioTotal)}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {FUNDING_OPPORTUNITIES.totalFundingPotential.netInvestmentReduction} investment reduction
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Investment Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Phase 1: Start with Best Deal</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {DEAL_ANALYSIS_SUMMARY.investmentStrategy.recommendedApproach}
                  </p>
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium">48 Johnston Street - Immediate Cash Flow</div>
                    <div className="text-sm text-muted-foreground">
                      Already triplex, add 4th unit, start generating income immediately
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Portfolio Targets</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{DEAL_ANALYSIS_SUMMARY.investmentStrategy.portfolioTarget}</div>
                      <div className="text-sm text-muted-foreground">Properties</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{DEAL_ANALYSIS_SUMMARY.investmentStrategy.expectedPortfolioValue}</div>
                      <div className="text-sm text-muted-foreground">Portfolio Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{DEAL_ANALYSIS_SUMMARY.investmentStrategy.projectedCashFlow}</div>
                      <div className="text-sm text-muted-foreground">Monthly Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{DEAL_ANALYSIS_SUMMARY.investmentStrategy.totalEquityRequired}</div>
                      <div className="text-sm text-muted-foreground">Equity Required</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Implementation Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <div className="font-medium">Months 1-2: Secure Funding & Purchase First Property</div>
                        <div className="text-sm text-muted-foreground">48 Johnston Street - immediate income</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <div className="font-medium">Months 3-8: Convert & Optimize First Property</div>
                        <div className="text-sm text-muted-foreground">Add 4th unit, maximize cash flow</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <div className="font-medium">Months 6-12: Scale with Second Property</div>
                        <div className="text-sm text-muted-foreground">103 Main Street E - highest potential</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <div className="font-medium">Months 12-18: Build Portfolio</div>
                        <div className="text-sm text-muted-foreground">Add 3rd and 4th properties using BRRRR strategy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Ready to Execute</AlertTitle>
            <AlertDescription className="text-green-700">
              All properties are currently available, government programs are active, and market conditions are optimal. 
              This is the perfect time to start building your Port Colborne real estate portfolio.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}