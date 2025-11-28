'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Home, 
  Calculator,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';
import type { SmallMultifamilyAnalysis } from '@/types';

interface SmallMultifamilyResultsCardProps {
  analysis: SmallMultifamilyAnalysis;
}

export function SmallMultifamilyResultsCard({ analysis }: SmallMultifamilyResultsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analysis.profitability.net_annual_income)}
              </div>
              <div className="text-sm text-gray-600">Annual Net Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercent(analysis.profitability.cash_on_cash_return)}
              </div>
              <div className="text-sm text-gray-600">Cash-on-Cash Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercent(analysis.profitability.cap_rate)}
              </div>
              <div className="text-sm text-gray-600">Cap Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analysis.profitability.payback_period_years.toFixed(1)} yrs
              </div>
              <div className="text-sm text-gray-600">Payback Period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="development" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        {/* Development Costs Tab */}
        <TabsContent value="development" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Development Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Land Acquisition</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.land_acquisition)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Site Preparation</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.site_preparation)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Construction per Unit</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.construction_per_unit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Renovation per Unit</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.renovation_per_unit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Permits & Approvals</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.permits_and_approvals)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utility Connections</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.utility_connections)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contingency (10%)</span>
                  <span className="font-medium">{formatCurrency(analysis.development_costs.contingency)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Development Cost</span>
                  <span>{formatCurrency(analysis.development_costs.total_development_cost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Investment Required</span>
                  <span className="font-medium">{formatCurrency(analysis.profitability.total_investment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Annual Income</span>
                  <span className="font-medium text-green-600">{formatCurrency(analysis.profitability.total_annual_income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Annual Expenses</span>
                  <span className="font-medium text-red-600">{formatCurrency(analysis.profitability.total_annual_expenses)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Net Annual Cash Flow</span>
                  <span className={analysis.profitability.net_annual_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(analysis.profitability.net_annual_income)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unit Analysis Tab */}
        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Unit-by-Unit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.unit_analysis.map((unit, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{unit.unit_number}</h4>
                      <Badge variant={unit.roi_per_unit >= 10 ? 'default' : unit.roi_per_unit >= 5 ? 'secondary' : 'destructive'}>
                        {formatPercent(unit.roi_per_unit)} ROI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Projected Rent</span>
                        <div className="font-medium">{formatCurrency(unit.projected_rent)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cost to Create</span>
                        <div className="font-medium">{formatCurrency(unit.cost_to_create)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Net</span>
                        <div className={`font-medium ${unit.monthly_net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(unit.monthly_net_income)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Annual ROI</span>
                        <div className="font-medium">{formatPercent(unit.roi_per_unit)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Market Strength</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Market Score</span>
                      <span className="font-medium">{analysis.market_analysis.market_strength_score}/10</span>
                    </div>
                    <Progress value={analysis.market_analysis.market_strength_score * 10} className="h-2" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Market Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Vacancy Rate</span>
                      <span>{formatPercent(analysis.market_analysis.market_vacancy_rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent Growth Projection</span>
                      <span>{formatPercent(analysis.market_analysis.rent_growth_projection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comparables Count</span>
                      <span>{analysis.market_analysis.comparable_properties_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Average Rents by Unit Type</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(analysis.market_analysis.average_rent_per_unit_type).map(([unitType, rent]) => (
                    <div key={unitType} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 capitalize">{unitType.replace('br', ' BR')}</div>
                      <div className="font-medium">{rent > 0 ? formatCurrency(rent) : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysis.scenarios).map(([scenarioKey, scenario]) => (
              <Card key={scenarioKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {scenario.scenario_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Assumptions</h5>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Rent Achievement</span>
                          <span>{formatPercent(scenario.assumptions.rent_achievement)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vacancy Rate</span>
                          <span>{formatPercent(scenario.assumptions.vacancy_rate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Overrun</span>
                          <span>{formatPercent(scenario.assumptions.cost_overrun)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timeline Delay</span>
                          <span>{scenario.assumptions.timeline_delay_months} mo</span>
                        </div>
                      </div>
                    </div>
                    
                    <hr />
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Projected Returns</h5>
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(scenario.projected_returns.annual_cash_flow)}
                          </div>
                          <div className="text-xs text-gray-600">Annual Cash Flow</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {formatPercent(scenario.projected_returns.cash_on_cash_return)}
                          </div>
                          <div className="text-xs text-gray-600">Cash-on-Cash Return</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {formatPercent(scenario.projected_returns.total_roi_5_year)}
                          </div>
                          <div className="text-xs text-gray-600">5-Year Total ROI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Risk Score</span>
                  <Badge variant={analysis.risk_factors.overall_risk_score <= 3 ? 'default' : 
                                 analysis.risk_factors.overall_risk_score <= 6 ? 'secondary' : 'destructive'}>
                    {analysis.risk_factors.overall_risk_score}/10 - {getRiskLevel(analysis.risk_factors.overall_risk_score)}
                  </Badge>
                </div>
                <Progress value={analysis.risk_factors.overall_risk_score * 10} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Construction Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.risk_factors.construction_risk.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-1 text-red-500 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                    {analysis.risk_factors.construction_risk.length === 0 && (
                      <li className="text-gray-500">No significant construction risks identified</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-orange-600">Market Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.risk_factors.market_risk.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-1 text-orange-500 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                    {analysis.risk_factors.market_risk.length === 0 && (
                      <li className="text-gray-500">No significant market risks identified</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-yellow-600">Financial Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.risk_factors.financial_risk.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                    {analysis.risk_factors.financial_risk.length === 0 && (
                      <li className="text-gray-500">No significant financial risks identified</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-blue-600">Regulatory Risks</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.risk_factors.regulatory_risk.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                    {analysis.risk_factors.regulatory_risk.length === 0 && (
                      <li className="text-gray-500">No significant regulatory risks identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}