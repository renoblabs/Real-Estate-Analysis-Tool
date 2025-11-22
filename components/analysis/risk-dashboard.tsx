'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DealAnalysis, PropertyInputs } from '@/types';
import { analyzeRisks, type RiskLevel } from '@/lib/risk-analyzer';
import { Shield, AlertTriangle, AlertCircle, CheckCircle, TrendingDown, Users } from 'lucide-react';

interface RiskDashboardProps {
  inputs: PropertyInputs;
  analysis: DealAnalysis;
}

export function RiskDashboard({ inputs, analysis }: RiskDashboardProps) {
  const riskAnalysis = analyzeRisks(inputs, analysis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Risk level colors
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Low': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: 'text-green-600' };
      case 'Medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: 'text-yellow-600' };
      case 'High': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: 'text-orange-600' };
      case 'Critical': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: 'text-red-600' };
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'Low': return <CheckCircle className="w-6 h-6" />;
      case 'Medium': return <Shield className="w-6 h-6" />;
      case 'High': return <AlertTriangle className="w-6 h-6" />;
      case 'Critical': return <AlertCircle className="w-6 h-6" />;
    }
  };

  // Prepare radar chart data
  const radarData = [
    {
      category: 'Financial',
      score: 100 - riskAnalysis.financial_risk_score, // Invert so higher is better
      fullMark: 100,
    },
    {
      category: 'Market',
      score: 100 - riskAnalysis.market_risk_score,
      fullMark: 100,
    },
    {
      category: 'Operational',
      score: 100 - riskAnalysis.operational_risk_score,
      fullMark: 100,
    },
    {
      category: 'Liquidity',
      score: 100 - riskAnalysis.liquidity_risk_score,
      fullMark: 100,
    },
  ];

  // Prepare bar chart data for individual risks
  const barData = riskAnalysis.risk_factors.map(factor => ({
    name: factor.category.replace(' Risk', ''),
    score: factor.score,
    level: factor.risk_level,
  }));

  const RISK_COLORS: Record<RiskLevel, string> = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#f97316',
    'Critical': '#ef4444',
  };

  const colors = getRiskColor(riskAnalysis.overall_risk_level);

  return (
    <div className="space-y-6">
      {/* Overall Risk Summary */}
      <div className={`rounded-lg p-6 border-2 ${colors.border} ${colors.bg}`}>
        <div className="flex items-start gap-4">
          <div className={colors.icon}>
            {getRiskIcon(riskAnalysis.overall_risk_level)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className={`text-2xl font-bold ${colors.text}`}>
                Overall Risk: {riskAnalysis.overall_risk_level}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                Risk Score: {riskAnalysis.overall_risk_score.toFixed(0)}/100
              </span>
            </div>
            <p className={`text-sm ${colors.text} font-medium`}>
              {riskAnalysis.overall_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Financial Risk</h4>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {riskAnalysis.financial_risk_score.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            Cash flow, leverage, debt coverage
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Market Risk</h4>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {riskAnalysis.market_risk_score.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            Vacancy, property age, valuation
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-orange-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Operational Risk</h4>
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {riskAnalysis.operational_risk_score.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            Management, maintenance
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Liquidity Risk</h4>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {riskAnalysis.liquidity_risk_score.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">
            Capital requirements
          </div>
        </div>
      </div>

      {/* Risk Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Risk Profile (Radar)</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Radar
                  name="Risk Profile"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(0)}/100 (Safety Score)`}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Higher scores indicate lower risk. This radar chart shows the safety profile across all risk categories.
          </p>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Individual Risk Factors</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(0)}/100`}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Higher scores indicate higher risk. Colors: Green=Low, Yellow=Medium, Orange=High, Red=Critical.
          </p>
        </div>
      </div>

      {/* Critical & High Risks */}
      {(riskAnalysis.critical_risks.length > 0 || riskAnalysis.high_risks.length > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Immediate Attention Required
          </h4>
          {riskAnalysis.critical_risks.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-red-900 mb-2">🚨 Critical Risks:</h5>
              <ul className="space-y-2">
                {riskAnalysis.critical_risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {riskAnalysis.high_risks.length > 0 && (
            <div>
              <h5 className="font-semibold text-orange-900 mb-2">⚠️ High Risks:</h5>
              <ul className="space-y-2">
                {riskAnalysis.high_risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed Risk Factors */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Detailed Risk Analysis</h4>
        <div className="space-y-4">
          {riskAnalysis.risk_factors
            .sort((a, b) => b.score - a.score)
            .map((factor, index) => {
              const factorColors = getRiskColor(factor.risk_level);
              return (
                <div
                  key={index}
                  className={`border-2 ${factorColors.border} rounded-lg p-4 ${factorColors.bg}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={factorColors.icon}>
                        {getRiskIcon(factor.risk_level)}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900">{factor.category}</h5>
                        <p className={`text-sm ${factorColors.text} font-medium mt-1`}>
                          {factor.description}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${factorColors.bg} ${factorColors.text} border ${factorColors.border}`}>
                      {factor.risk_level}
                    </div>
                  </div>

                  <div className="mb-3 pl-9">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Impact:</span> {factor.impact}
                    </p>
                  </div>

                  <div className="pl-9">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Mitigation Strategies:</p>
                    <ul className="space-y-1">
                      {factor.mitigation_strategies.map((strategy, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 font-bold mt-0.5">→</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Stress Test Scenarios */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          Stress Test Scenarios
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2">Scenario</th>
                <th className="text-right py-3 px-2">Monthly Impact</th>
                <th className="text-right py-3 px-2">Annual Impact</th>
                <th className="text-left py-3 px-2">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {riskAnalysis.stress_test.map((test, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{test.scenario}</td>
                  <td className={`py-3 px-2 text-right font-semibold ${test.monthly_cash_flow_impact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {test.monthly_cash_flow_impact !== 0 ? formatCurrency(test.monthly_cash_flow_impact) : '-'}
                  </td>
                  <td className={`py-3 px-2 text-right font-semibold ${test.annual_cash_flow_impact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {test.annual_cash_flow_impact !== 0 ? formatCurrency(test.annual_cash_flow_impact) : '-'}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-700">
                    {test.break_even_impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          These stress tests show how your deal would perform under adverse conditions. Build reserves to handle these scenarios.
        </p>
      </div>

      {/* Investor Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Tolerance */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Recommended Risk Tolerance
          </h4>
          <div className="text-2xl font-bold text-blue-600 mb-3">
            {riskAnalysis.risk_tolerance_recommendation}
          </div>
          <p className="text-sm text-gray-700">
            {riskAnalysis.risk_tolerance_recommendation === 'Conservative'
              ? 'This deal is suitable for investors seeking stable, predictable returns with minimal downside risk.'
              : riskAnalysis.risk_tolerance_recommendation === 'Moderate'
              ? 'This deal requires moderate risk tolerance and active management to achieve target returns.'
              : 'This is a high-risk, high-reward opportunity best suited for experienced investors with strong financial cushion.'
            }
          </p>
        </div>

        {/* Suitable Investors */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Suitable For
          </h4>
          <div className="space-y-2">
            {riskAnalysis.suitable_for_investor_types.map((type, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-800">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Recommendation */}
      <div className={`rounded-lg p-6 border-2 ${colors.border}`} style={{ backgroundColor: colors.bg.replace('100', '50') }}>
        <h4 className="text-lg font-semibold mb-3 text-gray-900">📋 Final Risk Assessment</h4>
        <p className="text-gray-800 mb-4">
          {riskAnalysis.overall_recommendation}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">Overall Risk Score</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {riskAnalysis.overall_risk_score.toFixed(0)}/100
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">Risk Level</p>
            <p className={`text-2xl font-bold ${colors.text}`}>
              {riskAnalysis.overall_risk_level}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold text-gray-800 mb-1">Action</p>
            <p className="text-xl font-bold text-gray-900">
              {riskAnalysis.overall_risk_level === 'Critical' ? '🚫 Pass'
                : riskAnalysis.overall_risk_level === 'High' ? '⚠️ Caution'
                : riskAnalysis.overall_risk_level === 'Medium' ? '✔️ Proceed with Due Diligence'
                : '✅ Good Deal'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
