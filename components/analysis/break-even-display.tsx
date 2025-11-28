'use client';

import { formatCurrency as formatCurrencyUtil, formatPercent } from '@/lib/utils';

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
  ReferenceLine,
} from 'recharts';
import type { DealAnalysis, PropertyInputs } from '@/types';
import {
  calculateBreakEven,
  type BreakEvenAnalysis,
} from '@/lib/break-even-calculator';
import { AlertCircle, TrendingUp, DollarSign, Calendar, Lightbulb } from 'lucide-react';

interface BreakEvenDisplayProps {
  analysis: DealAnalysis;
  inputs: PropertyInputs;
}

export function BreakEvenDisplay({ analysis, inputs }: BreakEvenDisplayProps) {
  const breakEven = calculateBreakEven(analysis, inputs);
  const isPositive = analysis.cash_flow.monthly_net >= 0;


  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Prepare data for comparison chart
  const comparisonData = [
    {
      category: 'Monthly Rent',
      current: analysis.revenue.gross_monthly_rent,
      breakEven: breakEven.break_even_rent,
      difference: breakEven.rent_increase_needed_dollars,
    },
    {
      category: 'Purchase Price',
      current: analysis.acquisition.purchase_price,
      breakEven: breakEven.max_purchase_price_for_positive_cf,
      difference: breakEven.purchase_price_reduction_needed,
    },
    {
      category: 'Monthly Expenses',
      current: analysis.expenses.monthly.total - analysis.expenses.monthly.mortgage,
      breakEven: breakEven.max_affordable_expenses,
      difference: breakEven.expense_reduction_needed,
    },
  ];

  // Prepare data for timeline chart
  const timelineData = Array.from({ length: Math.min(breakEven.years_to_positive_cf || 10, 10) + 1 }, (_, i) => {
    const year = i;
    const rent = analysis.revenue.gross_monthly_rent * Math.pow(1.025, year);
    const expenses = analysis.expenses.monthly.total;
    const cashFlow = rent - expenses;

    return {
      year: `Year ${year}`,
      rent: rent,
      cashFlow: cashFlow,
    };
  });

  // Get severity color based on how far from break-even
  const getSeverityColor = (percentChange: number) => {
    const abs = Math.abs(percentChange);
    if (abs <= 5) return 'text-green-600';
    if (abs <= 15) return 'text-yellow-600';
    if (abs <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (percentChange: number) => {
    const abs = Math.abs(percentChange);
    if (abs <= 5) return 'bg-green-100 text-green-800 border-green-300';
    if (abs <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (abs <= 30) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`rounded-lg p-6 ${isPositive ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`mt-1 ${isPositive ? 'text-green-600' : 'text-orange-600'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">
              {isPositive ? '✅ Deal is Cash Flow Positive!' : '⚠️ Deal Needs Adjustments to Break Even'}
            </h3>
            <p className="text-sm text-gray-700">
              {isPositive
                ? `This deal generates positive cash flow of ${formatCurrencyUtil(analysis.cash_flow.monthly_net)}/month. The analysis below shows how much buffer you have.`
                : `Current monthly shortfall: ${formatCurrencyUtil(Math.abs(analysis.cash_flow.monthly_net))}. This analysis shows what needs to change to reach break-even.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Primary Issue */}
      {!isPositive && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-lg">Primary Issue</h4>
          </div>
          <p className="text-gray-700 mb-4">
            {breakEven.primary_issue}
          </p>
          <div className="bg-white rounded-md p-4 border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">Quickest Path to Positive Cash Flow:</p>
            <p className="text-sm text-gray-700">{breakEven.quickest_path_to_positive}</p>
          </div>
        </div>
      )}

      {/* Break-Even Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rent Scenario */}
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Rent Adjustment</h4>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrencyUtil(breakEven.break_even_rent)}
            </div>
            <div className="text-xs text-gray-500">Required monthly rent</div>
          </div>
          <div className={`text-sm font-semibold ${getSeverityColor(breakEven.rent_increase_needed_percent)}`}>
            {formatPercent(breakEven.rent_increase_needed_percent)} increase
          </div>
          <div className="text-xs text-gray-600 mt-1">
            +{formatCurrencyUtil(breakEven.rent_increase_needed_dollars)}/mo
          </div>
        </div>

        {/* Price Scenario */}
        <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Price Adjustment</h4>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyUtil(breakEven.max_purchase_price_for_positive_cf)}
            </div>
            <div className="text-xs text-gray-500">Max affordable price</div>
          </div>
          <div className={`text-sm font-semibold ${getSeverityColor(breakEven.purchase_price_reduction_percent)}`}>
            {formatPercent(breakEven.purchase_price_reduction_percent)} reduction
          </div>
          <div className="text-xs text-gray-600 mt-1">
            -{formatCurrencyUtil(Math.abs(breakEven.purchase_price_reduction_needed))}
          </div>
        </div>

        {/* Expense Scenario */}
        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Expense Reduction</h4>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrencyUtil(breakEven.max_affordable_expenses)}
            </div>
            <div className="text-xs text-gray-500">Max monthly expenses</div>
          </div>
          <div className={`text-sm font-semibold ${getSeverityColor(breakEven.expense_reduction_percent)}`}>
            {formatPercent(breakEven.expense_reduction_percent)} reduction
          </div>
          <div className="text-xs text-gray-600 mt-1">
            -{formatCurrencyUtil(Math.abs(breakEven.expense_reduction_needed))}
          </div>
        </div>

        {/* Timeline Scenario */}
        <div className="bg-white rounded-lg p-6 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Wait for Growth</h4>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-orange-600">
              {breakEven.years_to_positive_cf ? `${breakEven.years_to_positive_cf} yrs` : 'Never'}
            </div>
            <div className="text-xs text-gray-500">Time to break-even</div>
          </div>
          <div className="text-sm font-medium text-gray-700">
            @ 2.5% rent growth
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {breakEven.years_to_positive_cf && breakEven.years_to_positive_cf <= 5
              ? 'Reasonable timeline'
              : breakEven.years_to_positive_cf && breakEven.years_to_positive_cf <= 10
              ? 'Long wait'
              : 'Not recommended'
            }
          </div>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Current vs Break-Even Comparison</h4>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrencyUtil(value)} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={120} />
              <Tooltip
                formatter={(value: number) => formatCurrencyUtil(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[0, 4, 4, 0]} />
              <Bar dataKey="breakEven" fill="#10b981" name="Break-Even Target" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          This chart shows the gap between your current deal parameters and what they need to be for break-even cash flow.
        </p>
      </div>

      {/* Timeline Projection */}
      {breakEven.years_to_positive_cf && breakEven.years_to_positive_cf <= 10 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Cash Flow Over Time (2.5% Annual Rent Growth)</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#666" />
                <YAxis tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(value) => formatCurrencyUtil(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrencyUtil(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Break-Even" />
                <Line
                  type="monotone"
                  dataKey="cashFlow"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Monthly Cash Flow"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Assuming rent increases by 2.5% annually and expenses remain constant, you'll reach positive cash flow in{' '}
            <span className="font-semibold">{breakEven.years_to_positive_cf} year{breakEven.years_to_positive_cf > 1 ? 's' : ''}</span>.
          </p>
        </div>
      )}



      {/* Recommendations */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Strategic Recommendations
        </h4>
        <div className="space-y-3">
          {/* Feasibility Assessment */}
          <div>
            <h5 className="font-semibold text-sm mb-2">Feasibility Assessment:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-md border ${getSeverityBadge(breakEven.rent_increase_needed_percent)}`}>
                <div className="text-xs font-medium mb-1">Rent Increase</div>
                <div className="text-sm">
                  {Math.abs(breakEven.rent_increase_needed_percent) <= 10
                    ? '✅ Feasible - negotiate with tenant or wait for lease renewal'
                    : Math.abs(breakEven.rent_increase_needed_percent) <= 20
                    ? '⚠️ Challenging - may require unit improvements to justify'
                    : '❌ Unrealistic - market won\'t support this increase'
                  }
                </div>
              </div>
              <div className={`p-3 rounded-md border ${getSeverityBadge(breakEven.purchase_price_reduction_percent)}`}>
                <div className="text-xs font-medium mb-1">Price Negotiation</div>
                <div className="text-sm">
                  {Math.abs(breakEven.purchase_price_reduction_percent) <= 5
                    ? '✅ Reasonable - try negotiating this discount'
                    : Math.abs(breakEven.purchase_price_reduction_percent) <= 15
                    ? '⚠️ Aggressive - but possible in buyer\'s market'
                    : '❌ Unlikely - seller won\'t accept this discount'
                  }
                </div>
              </div>
              <div className={`p-3 rounded-md border ${getSeverityBadge(breakEven.expense_reduction_percent)}`}>
                <div className="text-xs font-medium mb-1">Expense Cuts</div>
                <div className="text-sm">
                  {Math.abs(breakEven.expense_reduction_percent) <= 15
                    ? '✅ Achievable - review expense optimization above'
                    : Math.abs(breakEven.expense_reduction_percent) <= 30
                    ? '⚠️ Difficult - requires multiple optimizations'
                    : '❌ Unrealistic - expenses are already lean'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-4">
            <h5 className="font-semibold text-sm mb-2">Recommended Actions:</h5>
            <ul className="space-y-2 text-sm">
              {Math.abs(breakEven.purchase_price_reduction_percent) <= 10 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">1.</span>
                  <span>Negotiate purchase price down by {formatPercent(Math.abs(breakEven.purchase_price_reduction_percent))} ({formatCurrencyUtil(Math.abs(breakEven.purchase_price_reduction_needed))}) - this is your best option</span>
                </li>
              )}
              {Math.abs(breakEven.rent_increase_needed_percent) <= 15 && (
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">3.</span>
                  <span>Plan for rent increase of {formatPercent(Math.abs(breakEven.rent_increase_needed_percent))} at next lease renewal or make improvements to justify higher rent</span>
                </li>
              )}
              {breakEven.years_to_positive_cf && breakEven.years_to_positive_cf <= 5 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">4.</span>
                  <span>Consider a "buy and hold" strategy - you'll reach positive cash flow in {breakEven.years_to_positive_cf} years through rent growth</span>
                </li>
              )}
              {!isPositive && Math.abs(breakEven.purchase_price_reduction_percent) > 15 && Math.abs(breakEven.rent_increase_needed_percent) > 20 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-0.5">⚠️</span>
                  <span className="text-red-700 font-medium">This deal may not be salvageable at the current price. Consider walking away or combining multiple strategies (price reduction + rent increase + expense cuts).</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
