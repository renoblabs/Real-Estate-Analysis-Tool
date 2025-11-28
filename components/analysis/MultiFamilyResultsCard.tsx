'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import type { MultiFamilyAnalysis } from '@/types';
import { generateExecutiveSummary } from '@/lib/multifamily-analyzer';

interface MultiFamilyResultsCardProps {
  analysis: MultiFamilyAnalysis;
}

export function MultiFamilyResultsCard({ analysis }: MultiFamilyResultsCardProps) {
  const summary = generateExecutiveSummary(analysis);
  const { development_analysis, market_analysis, profitability_gaps, construction_timeline, risk_assessment } = analysis;

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'proceed': return 'bg-green-100 text-green-800 border-green-200';
      case 'proceed_with_caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'do_not_proceed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'proceed': return <CheckCircle className="w-5 h-5" />;
      case 'proceed_with_caution': return <AlertTriangle className="w-5 h-5" />;
      case 'do_not_proceed': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Executive Summary
            <Badge className={getRecommendationColor(summary.recommendation)}>
              {getRecommendationIcon(summary.recommendation)}
              {summary.recommendation.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(summary.key_metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-sm text-gray-600">{key}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {summary.critical_factors.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Factors:</strong>
                <ul className="mt-2 space-y-1">
                  {summary.critical_factors.map((factor, index) => (
                    <li key={index} className="text-sm">• {factor}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
            <ul className="space-y-1">
              {summary.next_steps.map((step, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="development" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="development" className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Home className="w-5 h-5" />
                Development Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Construction Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Construction:</span>
                        <span>${development_analysis.construction_costs.base_construction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Site Preparation:</span>
                        <span>${development_analysis.construction_costs.site_preparation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Permits & Approvals:</span>
                        <span>${development_analysis.construction_costs.permits_approvals.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilities:</span>
                        <span>${development_analysis.construction_costs.utilities_connections.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Hard Costs:</span>
                        <span>${development_analysis.construction_costs.total_hard_costs.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Soft Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Architect/Engineer:</span>
                        <span>${development_analysis.soft_costs.architect_engineer.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Legal Fees:</span>
                        <span>${development_analysis.soft_costs.legal_fees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Development Mgmt:</span>
                        <span>${development_analysis.soft_costs.development_management.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contingency:</span>
                        <span>${development_analysis.soft_costs.contingency.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Soft Costs:</span>
                        <span>${development_analysis.soft_costs.total_soft_costs.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Development:</span>
                        <span className="font-semibold">${development_analysis.total_development_cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Unit:</span>
                        <span>${development_analysis.cost_per_unit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost per Sq Ft:</span>
                        <span>${development_analysis.cost_per_sqft.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span>{development_analysis.timeline_months} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equity Required:</span>
                        <span>${development_analysis.financing_needs.equity_required.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Market Score: {market_analysis.overall_market_score}/10</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={market_analysis.overall_market_score * 10} className="mb-4" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Vacancy Rate:</span>
                        <span>{(market_analysis.demand_indicators.vacancy_rate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rent Growth:</span>
                        <span>{(market_analysis.demand_indicators.rent_growth_trend * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Competition:</span>
                        <span className="capitalize">{market_analysis.demand_indicators.competition_level}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Rent Analysis by Unit Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(market_analysis.rent_analysis_by_unit).map(([unitType, analysis]) => (
                        <div key={unitType} className="border-b pb-2 last:border-b-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{unitType.toUpperCase()}</span>
                            <span className={`text-sm ${analysis.rent_premium_discount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {analysis.rent_premium_discount > 0 ? '+' : ''}{analysis.rent_premium_discount.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Target: ${analysis.target_rent} | Market: ${analysis.market_rent_range.average.toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Profitability Gap Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cash Flow Gap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Annual Cash Flow:</span>
                        <span className={profitability_gaps.cash_flow_gap.current_value >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${profitability_gaps.cash_flow_gap.current_value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target Annual Cash Flow:</span>
                        <span>${profitability_gaps.cash_flow_gap.target_value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Gap:</span>
                        <span className={profitability_gaps.cash_flow_gap.gap_amount <= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${profitability_gaps.cash_flow_gap.gap_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ROI Gap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current ROI:</span>
                        <span>{(profitability_gaps.roi_gap.current_value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target ROI:</span>
                        <span>{(profitability_gaps.roi_gap.target_value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Gap:</span>
                        <span className={profitability_gaps.roi_gap.gap_amount <= 0 ? 'text-green-600' : 'text-red-600'}>
                          {(profitability_gaps.roi_gap.gap_amount * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profitability_gaps.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Construction Timeline
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{construction_timeline.planning_phase_months}</div>
                      <div className="text-sm text-gray-600">Planning Phase (months)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{construction_timeline.construction_phase_months}</div>
                      <div className="text-sm text-gray-600">Construction Phase (months)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{construction_timeline.leasing_phase_months}</div>
                      <div className="text-sm text-gray-600">Leasing Phase (months)</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Key Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Permits Approved:</span>
                        <span>Month {construction_timeline.key_milestones.permits_approved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Construction Start:</span>
                        <span>Month {construction_timeline.key_milestones.construction_start}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Construction Complete:</span>
                        <span>Month {construction_timeline.key_milestones.construction_complete}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Tenant:</span>
                        <span>Month {construction_timeline.key_milestones.first_tenant}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Stabilized Occupancy:</span>
                        <span>Month {construction_timeline.key_milestones.stabilized_occupancy}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Overall Risk Score
                      <Badge className={getRiskColor(risk_assessment.risk_level)}>
                        {risk_assessment.risk_level.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">{risk_assessment.overall_risk_score.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">out of 10</div>
                    </div>
                    <Progress value={risk_assessment.overall_risk_score * 10} className="mb-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Risk Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Construction Risk:</span>
                          <span>{risk_assessment.construction_risk.score}/10</span>
                        </div>
                        <Progress value={risk_assessment.construction_risk.score * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Market Risk:</span>
                          <span>{risk_assessment.market_risk.score}/10</span>
                        </div>
                        <Progress value={risk_assessment.market_risk.score * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Financing Risk:</span>
                          <span>{risk_assessment.financing_risk.score}/10</span>
                        </div>
                        <Progress value={risk_assessment.financing_risk.score * 10} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Construction Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {risk_assessment.construction_risk.factors.map((factor, index) => (
                        <li key={index} className="text-xs flex items-start gap-1">
                          <span className="text-orange-600 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Market Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {risk_assessment.market_risk.factors.map((factor, index) => (
                        <li key={index} className="text-xs flex items-start gap-1">
                          <span className="text-blue-600 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Financing Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {risk_assessment.financing_risk.factors.map((factor, index) => (
                        <li key={index} className="text-xs flex items-start gap-1">
                          <span className="text-purple-600 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}