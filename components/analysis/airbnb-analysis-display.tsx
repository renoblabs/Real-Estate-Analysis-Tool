'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DealAnalysis, PropertyInputs } from '@/types';
import {
  analyzeAirbnb,
  calculateSeasonalProjections,
  STR_MARKET_BENCHMARKS,
  type AirbnbInputs,
  type AirbnbAnalysis,
} from '@/lib/airbnb-analyzer';
import { Home, TrendingUp, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface AirbnbAnalysisDisplayProps {
  inputs: PropertyInputs;
  analysis: DealAnalysis;
}

export function AirbnbAnalysisDisplay({ inputs, analysis }: AirbnbAnalysisDisplayProps) {
  const [airbnbInputs, setAirbnbInputs] = useState<AirbnbInputs>({
    average_daily_rate: 150,
    occupancy_rate: 65,
    cleaning_fee_per_booking: 100,
    average_length_of_stay: 3,
    bookings_per_month: 10,
    cleaning_cost_per_booking: 75,
    utilities_included: true,
    furnishing_cost: 15000,
    monthly_utilities: 300,
    platform_fees_percent: 3,
    extra_insurance_annual: 1500,
    supplies_monthly: 150,
    management_percent: 25,
  });

  const [marketType, setMarketType] = useState<'urban' | 'resort' | 'suburban'>('urban');

  const airbnbAnalysis = analyzeAirbnb(inputs, airbnbInputs, analysis);
  const seasonalProjections = calculateSeasonalProjections(
    airbnbInputs.average_daily_rate,
    airbnbInputs.occupancy_rate,
    marketType
  );

  // Get market benchmark for the city
  const cityBenchmark = STR_MARKET_BENCHMARKS[inputs.city] || null;

  const updateInput = (key: keyof AirbnbInputs, value: number | boolean) => {
    setAirbnbInputs({ ...airbnbInputs, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Market Benchmark Alert */}
      {cityBenchmark && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {cityBenchmark.city} Market Benchmark
              </h4>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg ADR:</span>{' '}
                  <span className="font-semibold">${cityBenchmark.average_adr}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Occupancy:</span>{' '}
                  <span className="font-semibold">{cityBenchmark.average_occupancy}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Revenue:</span>{' '}
                  <span className="font-semibold">${cityBenchmark.average_revenue_per_month}/mo</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Competition:</span>{' '}
                  <span className={`font-semibold ${
                    cityBenchmark.competition_level === 'High' ? 'text-red-600' :
                    cityBenchmark.competition_level === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {cityBenchmark.competition_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STR Inputs */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🏠 Short-Term Rental Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Average Daily Rate (ADR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.average_daily_rate}
                onChange={(e) => updateInput('average_daily_rate', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Occupancy Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={airbnbInputs.occupancy_rate}
              onChange={(e) => updateInput('occupancy_rate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bookings per Month</label>
            <input
              type="number"
              value={airbnbInputs.bookings_per_month}
              onChange={(e) => updateInput('bookings_per_month', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cleaning Fee (per booking)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.cleaning_fee_per_booking}
                onChange={(e) => updateInput('cleaning_fee_per_booking', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cleaning Cost (per booking)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.cleaning_cost_per_booking}
                onChange={(e) => updateInput('cleaning_cost_per_booking', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Management Fee (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={airbnbInputs.management_percent}
              onChange={(e) => updateInput('management_percent', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Utilities</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.monthly_utilities}
                onChange={(e) => updateInput('monthly_utilities', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supplies per Month</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.supplies_monthly}
                onChange={(e) => updateInput('supplies_monthly', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">One-Time Furnishing</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={airbnbInputs.furnishing_cost}
                onChange={(e) => updateInput('furnishing_cost', Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Market Type</label>
          <div className="flex gap-2">
            {(['urban', 'resort', 'suburban'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMarketType(type)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  marketType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Comparison Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">STR Monthly Revenue</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${(airbnbAnalysis.total_gross_revenue / 12).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            ${airbnbAnalysis.total_gross_revenue.toLocaleString()}/year
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">STR Cash Flow</h4>
          </div>
          <div className={`text-2xl font-bold mb-1 ${airbnbAnalysis.monthly_average_cash_flow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${airbnbAnalysis.monthly_average_cash_flow.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            ${airbnbAnalysis.net_cash_flow.toLocaleString()}/year
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Home className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">LTR Cash Flow</h4>
          </div>
          <div className={`text-2xl font-bold mb-1 ${analysis.cash_flow.monthly_net >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            ${analysis.cash_flow.monthly_net.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            ${analysis.cash_flow.annual_net.toLocaleString()}/year
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">STR Advantage</h4>
          </div>
          <div className={`text-2xl font-bold mb-1 ${airbnbAnalysis.str_vs_ltr_cash_flow_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {airbnbAnalysis.str_vs_ltr_percentage_increase >= 0 ? '+' : ''}
            {airbnbAnalysis.str_vs_ltr_percentage_increase.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">
            ${(airbnbAnalysis.str_vs_ltr_cash_flow_difference / 12).toLocaleString()}/mo
          </div>
        </div>
      </div>

      {/* STR vs LTR Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">📊 Short-Term vs Long-Term Comparison</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-3 text-blue-600">Short-Term Rental (Airbnb)</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Revenue:</span>
                <span className="font-medium">${airbnbAnalysis.total_gross_revenue.toLocaleString()}/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fees:</span>
                <span className="font-medium">-${airbnbAnalysis.platform_fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cleaning Costs:</span>
                <span className="font-medium">-${airbnbAnalysis.cleaning_costs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Management:</span>
                <span className="font-medium">-${airbnbAnalysis.management_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Expenses:</span>
                <span className="font-medium">
                  -${(airbnbAnalysis.utilities_cost + airbnbAnalysis.supplies_cost + airbnbAnalysis.extra_insurance).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Net Operating Income:</span>
                <span className="font-semibold text-blue-600">
                  ${airbnbAnalysis.net_revenue_before_mortgage.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mortgage:</span>
                <span className="font-medium">-${airbnbAnalysis.annual_mortgage_payment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                <span className="font-bold">Annual Cash Flow:</span>
                <span className={`font-bold ${airbnbAnalysis.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${airbnbAnalysis.net_cash_flow.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold">CoC Return:</span>
                <span className="font-semibold text-blue-600">
                  {airbnbAnalysis.first_year_coc_return.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-3 text-purple-600">Long-Term Rental</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Rent:</span>
                <span className="font-medium">${analysis.revenue.annual_rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operating Expenses:</span>
                <span className="font-medium">
                  -${(analysis.expenses.total_annual_expenses - analysis.expenses.annual_mortgage).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Net Operating Income:</span>
                <span className="font-semibold text-purple-600">
                  ${analysis.cash_flow.annual_noi.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mortgage:</span>
                <span className="font-medium">-${analysis.expenses.annual_mortgage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                <span className="font-bold">Annual Cash Flow:</span>
                <span className={`font-bold ${analysis.cash_flow.annual_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analysis.cash_flow.annual_net.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-semibold">CoC Return:</span>
                <span className="font-semibold text-purple-600">
                  {analysis.metrics.cash_on_cash_return.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Break-Even Analysis */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h5 className="font-semibold mb-2">🎯 Break-Even Analysis</h5>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            To match your long-term rental cash flow of <span className="font-semibold">${analysis.cash_flow.monthly_net.toLocaleString()}/month</span>,
            you would need an occupancy rate of <span className="font-semibold text-blue-600">{airbnbAnalysis.break_even_occupancy.toFixed(1)}%</span> with your current ADR of ${airbnbInputs.average_daily_rate}.
          </p>
          {airbnbInputs.occupancy_rate >= airbnbAnalysis.break_even_occupancy ? (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✅ Your projected {airbnbInputs.occupancy_rate}% occupancy exceeds break-even - STR is financially superior!
            </p>
          ) : (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠️ Your projected {airbnbInputs.occupancy_rate}% occupancy is below break-even - consider adjusting ADR or occupancy expectations.
            </p>
          )}
        </div>
      </div>

      {/* Seasonal Revenue Projections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-semibold">📅 Seasonal Revenue Projections ({marketType})</h4>
        </div>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonalProjections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Monthly Revenue" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-right">ADR</th>
                <th className="px-3 py-2 text-right">Occupancy</th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {seasonalProjections.map((month) => (
                <tr key={month.month}>
                  <td className="px-3 py-2">{month.month}</td>
                  <td className="px-3 py-2 text-right">${month.adr.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">{month.occupancy.toFixed(0)}%</td>
                  <td className="px-3 py-2 text-right font-medium">${month.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right">
                  {(seasonalProjections.reduce((sum, m) => sum + m.occupancy, 0) / 12).toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-right text-green-600">
                  ${seasonalProjections.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${
              airbnbAnalysis.seasonal_variance_risk === 'High' ? 'text-red-600' :
              airbnbAnalysis.seasonal_variance_risk === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            <h5 className="font-semibold">Seasonal Risk</h5>
          </div>
          <div className={`text-2xl font-bold mb-2 ${
            airbnbAnalysis.seasonal_variance_risk === 'High' ? 'text-red-600' :
            airbnbAnalysis.seasonal_variance_risk === 'Medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {airbnbAnalysis.seasonal_variance_risk}
          </div>
          <p className="text-sm text-gray-600">
            {airbnbAnalysis.occupancy_rate}% occupancy indicates{' '}
            {airbnbAnalysis.seasonal_variance_risk === 'Low' ? 'consistent year-round demand' :
             airbnbAnalysis.seasonal_variance_risk === 'Medium' ? 'moderate seasonal variation' :
             'high seasonal volatility'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${
              airbnbAnalysis.regulatory_risk === 'High' ? 'text-red-600' :
              airbnbAnalysis.regulatory_risk === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            <h5 className="font-semibold">Regulatory Risk</h5>
          </div>
          <div className={`text-2xl font-bold mb-2 ${
            airbnbAnalysis.regulatory_risk === 'High' ? 'text-red-600' :
            airbnbAnalysis.regulatory_risk === 'Medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {airbnbAnalysis.regulatory_risk}
          </div>
          <p className="text-sm text-gray-600">
            {inputs.city} has {airbnbAnalysis.regulatory_risk === 'Low' ? 'minimal' :
             airbnbAnalysis.regulatory_risk === 'Medium' ? 'moderate' :
             'strict'} STR regulations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 ${
              airbnbAnalysis.management_intensity === 'High' ? 'text-red-600' :
              airbnbAnalysis.management_intensity === 'Medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            <h5 className="font-semibold">Management Intensity</h5>
          </div>
          <div className={`text-2xl font-bold mb-2 ${
            airbnbAnalysis.management_intensity === 'High' ? 'text-red-600' :
            airbnbAnalysis.management_intensity === 'Medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {airbnbAnalysis.management_intensity}
          </div>
          <p className="text-sm text-gray-600">
            {airbnbInputs.average_length_of_stay} day average stay = {
              airbnbAnalysis.management_intensity === 'Low' ? 'low turnover, easier management' :
              airbnbAnalysis.management_intensity === 'Medium' ? 'moderate turnover' :
              'high turnover, intensive management'
            }
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-3">💡 Recommendations</h4>
        <ul className="space-y-2 text-sm">
          {airbnbAnalysis.str_vs_ltr_cash_flow_difference > 5000 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>
                <span className="font-semibold">Strong STR Opportunity:</span> ${(airbnbAnalysis.str_vs_ltr_cash_flow_difference / 12).toLocaleString()}/month more than long-term rental - highly recommended!
              </span>
            </li>
          )}
          {airbnbInputs.average_daily_rate < (cityBenchmark?.average_adr || 0) && cityBenchmark && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">💡</span>
              <span>
                <span className="font-semibold">Increase ADR:</span> Market average is ${cityBenchmark.average_adr} - you could charge more.
              </span>
            </li>
          )}
          {airbnbInputs.management_percent > 20 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">⚠</span>
              <span>
                <span className="font-semibold">High Management Fees:</span> {airbnbInputs.management_percent}% is above average - consider self-managing or negotiating.
              </span>
            </li>
          )}
          {airbnbAnalysis.regulatory_risk === 'High' && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">!</span>
              <span>
                <span className="font-semibold">Regulatory Caution:</span> {inputs.city} has strict STR laws - verify zoning, permits, and restrictions before proceeding.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">💡</span>
            <span>
              <span className="font-semibold">Track Performance:</span> Monitor actual occupancy and ADR monthly - adjust pricing and strategy based on data.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
