'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  DealSourcingEngine, 
  DealSourcingCriteria, 
  CANADIAN_MARKET_OPPORTUNITIES,
  SAMPLE_DEAL_CRITERIA 
} from '@/lib/deal-sourcing-engine';
import { 
  DIYConstructionCalculator, 
  DIYCapabilities, 
  RenovationScope 
} from '@/lib/diy-construction-calculator';
import { 
  FinancingOptimizer, 
  FinancingProfile 
} from '@/lib/financing-optimizer';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Home, Wrench, DollarSign, Target, AlertTriangle, MapPin } from 'lucide-react';
import NiagaraMarketAnalysis from './NiagaraMarketAnalysis';

interface DealSourcingDashboardProps {
  onAnalyzeProperty?: (criteria: DealSourcingCriteria) => void;
}

export default function DealSourcingDashboard({ onAnalyzeProperty }: DealSourcingDashboardProps) {
  const [criteria, setCriteria] = useState<DealSourcingCriteria>(SAMPLE_DEAL_CRITERIA);
  const [financingProfile, setFinancingProfile] = useState<FinancingProfile>({
    currentIncome: 80000,
    currentAssets: 150000,
    currentDebt: 50000,
    creditScore: 720,
    downPaymentAvailable: 100000,
    monthlyBudget: 2500,
    riskTolerance: 'Moderate',
    investmentGoals: 'Balanced',
    timeHorizon: 5
  });

  const [diyCapabilities, setDiyCapabilities] = useState<DIYCapabilities>({
    electrical: false,
    plumbing: false,
    drywall: true,
    flooring: true,
    painting: true,
    landscaping: true,
    generalLabor: true,
    roofing: false,
    framing: false,
    insulation: true,
    tiling: false,
    cabinetry: false
  });

  const [samplePropertyPrice, setSamplePropertyPrice] = useState(550000);

  // Generate recommendations based on current criteria
  const recommendations = useMemo(() => {
    return DealSourcingEngine.generateInvestmentRecommendations(criteria);
  }, [criteria]);

  // Calculate DIY renovation potential
  const renovationAnalysis = useMemo(() => {
    const sampleScope: RenovationScope = {
      kitchenReno: true,
      bathroomReno: true,
      flooringReplacement: true,
      paintingInterior: true,
      paintingExterior: false,
      electricalUpgrade: false,
      plumbingUpgrade: false,
      roofRepair: false,
      windowReplacement: false,
      insulationUpgrade: true,
      basementFinishing: false,
      deckConstruction: false,
      landscaping: true,
      hvacUpgrade: false
    };

    const costs = DIYConstructionCalculator.calculateRenovationCosts(
      sampleScope,
      diyCapabilities,
      1200,
      'mid'
    );

    const valueAdd = DIYConstructionCalculator.calculateValueAdd(
      costs,
      samplePropertyPrice,
      'balanced'
    );

    return { costs, valueAdd };
  }, [diyCapabilities, samplePropertyPrice]);

  // Calculate financing options
  const financingOptions = useMemo(() => {
    return FinancingOptimizer.generateFinancingRecommendation(
      samplePropertyPrice,
      financingProfile,
      'balanced'
    );
  }, [samplePropertyPrice, financingProfile]);

  const updateCriteria = (field: keyof DealSourcingCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }));
  };

  const updateDIYCapability = (skill: keyof DIYCapabilities, value: boolean) => {
    setDiyCapabilities(prev => ({ ...prev, [skill]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🏗️ Deal Sourcing & Investment Engine</h1>
        <p className="text-muted-foreground">
          Find your next home run real estate investment with AI-powered analysis
        </p>
      </div>

      <Tabs defaultValue="niagara" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="niagara">Niagara Market</TabsTrigger>
          <TabsTrigger value="opportunities">Market Opportunities</TabsTrigger>
          <TabsTrigger value="criteria">Investment Criteria</TabsTrigger>
          <TabsTrigger value="diy">DIY Analysis</TabsTrigger>
          <TabsTrigger value="financing">Financing Options</TabsTrigger>
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
        </TabsList>

        {/* Niagara Market Tab */}
        <TabsContent value="niagara" className="space-y-4">
          <NiagaraMarketAnalysis />
        </TabsContent>

        {/* Market Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Opportunity Markets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  High Opportunity Markets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {CANADIAN_MARKET_OPPORTUNITIES.highOpportunity.map((market, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{market.city}, {market.province}</h3>
                      <Badge variant="secondary">{market.riskLevel} Risk</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Avg Price: {formatCurrency(market.averagePrice)}</div>
                      <div>Rent Yield: {market.rentYield}%</div>
                      <div>Price Growth: +{market.priceGrowth}%</div>
                      <div>Timeline: {market.timeHorizon}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{market.opportunity}</p>
                    <div className="flex flex-wrap gap-1">
                      {market.bestStrategies.map((strategy, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {strategy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Investment Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertDescription className="text-sm">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investment Criteria Tab */}
        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Your Investment Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Maximum Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={criteria.maxPrice}
                    onChange={(e) => updateCriteria('maxPrice', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minCashFlow">Minimum Monthly Cash Flow</Label>
                  <Input
                    id="minCashFlow"
                    type="number"
                    value={criteria.minCashFlow}
                    onChange={(e) => updateCriteria('minCashFlow', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minROI">Minimum ROI (%)</Label>
                  <Input
                    id="minROI"
                    type="number"
                    value={criteria.minROI}
                    onChange={(e) => updateCriteria('minROI', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select 
                    value={criteria.riskTolerance} 
                    onValueChange={(value) => updateCriteria('riskTolerance', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeHorizon">Time Horizon</Label>
                  <Input
                    id="timeHorizon"
                    value={criteria.timeHorizon}
                    onChange={(e) => updateCriteria('timeHorizon', e.target.value)}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxRenovationBudget">Max Renovation Budget</Label>
                  <Input
                    id="maxRenovationBudget"
                    type="number"
                    value={criteria.maxRenovationBudget}
                    onChange={(e) => updateCriteria('maxRenovationBudget', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIY Analysis Tab */}
        <TabsContent value="diy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* DIY Skills Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Your DIY Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(diyCapabilities).map(([skill, capable]) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={skill}
                        checked={capable}
                        onChange={(e) => updateDIYCapability(skill as keyof DIYCapabilities, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={skill} className="text-sm capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Renovation Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Renovation Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="samplePrice">Sample Property Price</Label>
                  <Input
                    id="samplePrice"
                    type="number"
                    value={samplePropertyPrice}
                    onChange={(e) => setSamplePropertyPrice(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Renovation Cost:</span>
                    <span className="font-semibold">{formatCurrency(renovationAnalysis.costs.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>DIY Labor Savings:</span>
                    <span className="font-semibold">{formatCurrency(renovationAnalysis.costs.laborSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Value Increase:</span>
                    <span className="font-semibold">{formatCurrency(renovationAnalysis.valueAdd.estimatedValueIncrease)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renovation ROI:</span>
                    <span className={`font-semibold ${renovationAnalysis.valueAdd.roi > 70 ? 'text-green-600' : 'text-orange-600'}`}>
                      {renovationAnalysis.valueAdd.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span>{renovationAnalysis.costs.timeline.totalWeeks} weeks</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  {renovationAnalysis.valueAdd.recommendations.map((rec, index) => (
                    <p key={index} className="text-sm text-muted-foreground">{rec}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financing Options Tab */}
        <TabsContent value="financing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Financing Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Your Financial Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income</Label>
                    <Input
                      id="income"
                      type="number"
                      value={financingProfile.currentIncome}
                      onChange={(e) => setFinancingProfile(prev => ({ 
                        ...prev, 
                        currentIncome: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assets">Current Assets</Label>
                    <Input
                      id="assets"
                      type="number"
                      value={financingProfile.currentAssets}
                      onChange={(e) => setFinancingProfile(prev => ({ 
                        ...prev, 
                        currentAssets: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment Available</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={financingProfile.downPaymentAvailable}
                      onChange={(e) => setFinancingProfile(prev => ({ 
                        ...prev, 
                        downPaymentAvailable: Number(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      value={financingProfile.monthlyBudget}
                      onChange={(e) => setFinancingProfile(prev => ({ 
                        ...prev, 
                        monthlyBudget: Number(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Financing Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Financing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{financingOptions.recommendedStrategy.name}</h3>
                    <Badge variant={
                      financingOptions.recommendedStrategy.riskLevel === 'Low' ? 'default' :
                      financingOptions.recommendedStrategy.riskLevel === 'Medium' ? 'secondary' : 'destructive'
                    }>
                      {financingOptions.recommendedStrategy.riskLevel} Risk
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {financingOptions.recommendedStrategy.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Down Payment: {formatCurrency(financingOptions.recommendedStrategy.downPaymentRequired)}</div>
                    <div>Monthly Payment: {formatCurrency(financingOptions.recommendedStrategy.monthlyPayment)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Suitability Score:</span>
                      <Progress value={financingOptions.recommendedStrategy.suitability} className="flex-1" />
                      <span className="text-sm">{financingOptions.recommendedStrategy.suitability}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Next Steps:</h4>
                  {financingOptions.actionPlan.slice(0, 4).map((step, index) => (
                    <p key={index} className="text-sm text-muted-foreground">{step}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Immediate Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Immediate Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {financingOptions.actionPlan.map((action, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Risk Mitigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {financingOptions.riskMitigation.map((risk, index) => (
                  <Alert key={index}>
                    <AlertDescription className="text-sm">
                      {risk}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Find Your Next Deal?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Based on your criteria and capabilities, you're well-positioned to find profitable real estate investments. 
                Your DIY skills could save you {formatCurrency(renovationAnalysis.costs.laborSavings)} on renovations, 
                and the recommended financing strategy gives you a {financingOptions.recommendedStrategy.suitability}% suitability match.
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => onAnalyzeProperty?.(criteria)}
                  className="flex-1"
                >
                  Start Property Search
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Criteria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}