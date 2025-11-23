'use client';

import { formatCurrency as formatCurrencyUtil, formatPercent } from '@/lib/utils';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
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
import type { DealAnalysis } from '@/types';
import {
  analyzeExpenseRatio,
  projectExpenseRatio,
  type ExpenseRatioAnalysis,
} from '@/lib/expense-ratio-analyzer';
import { TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';

interface ExpenseRatioDisplayProps {
  analysis: DealAnalysis;
}

export function ExpenseRatioDisplay({ analysis }: ExpenseRatioDisplayProps) {
  const [revenueGrowth, setRevenueGrowth] = useState(2.5);
  const [expenseGrowth, setExpenseGrowth] = useState(2.5);

  const expenseAnalysis = analyzeExpenseRatio(analysis);
  const projections = projectExpenseRatio(analysis, 5, revenueGrowth, expenseGrowth);


  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare pie chart data
  const pieData = expenseAnalysis.expense_breakdown.map(item => ({
    name: item.category,
    value: item.annual_amount,
    percent: item.percent_of_total,
  }));

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Efficiency badge color
  const getEfficiencyColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Poor': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Expense Ratio */}
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Current Expense Ratio</h4>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatPercent(expenseAnalysis.expense_ratio)}
          </div>
          <div className="text-xs text-gray-600">
            {formatCurrencyUtil(expenseAnalysis.total_annual_expenses)}/yr
          </div>
        </div>

        {/* Market Benchmark */}
        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Market Benchmark</h4>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {formatPercent(expenseAnalysis.market_benchmark_ratio)}
          </div>
          <div className={`text-xs font-medium ${expenseAnalysis.variance_from_benchmark > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {expenseAnalysis.variance_from_benchmark > 0 ? '+' : ''}{formatPercent(expenseAnalysis.variance_from_benchmark)} vs benchmark
          </div>
        </div>

        {/* Potential Savings */}
        <div className="bg-white rounded-lg p-6 border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Potential Savings</h4>
            <TrendingDown className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {formatCurrencyUtil(expenseAnalysis.total_potential_savings)}
          </div>
          <div className="text-xs text-gray-600">
            {formatCurrencyUtil(expenseAnalysis.total_potential_savings / 12)}/mo
          </div>
        </div>

        {/* Efficiency Rating */}
        <div className="bg-white rounded-lg p-6 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Efficiency Rating</h4>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border-2 ${getEfficiencyColor(expenseAnalysis.efficiency_rating)}`}>
            {expenseAnalysis.efficiency_rating}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatPercent(expenseAnalysis.improvement_potential_percent)} improvement possible
          </div>
        </div>
      </div>

      {/* Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Expense Distribution</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent.toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrencyUtil(value)}
                  labelStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Current vs Optimized */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Current vs Optimized Expenses</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseAnalysis.expense_breakdown.map(item => ({
                  category: item.category,
                  current: item.annual_amount,
                  optimized: item.annual_amount - (item.potential_savings || 0),
                  savings: item.potential_savings || 0,
                }))}
                layout="horizontal"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip
                  formatter={(value: number) => formatCurrencyUtil(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[0, 4, 4, 0]} />
                <Bar dataKey="optimized" fill="#10b981" name="Optimized" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Detailed Expense Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2">Category</th>
                <th className="text-right py-3 px-2">Annual Amount</th>
                <th className="text-right py-3 px-2">% of Total</th>
                <th className="text-right py-3 px-2">% of Revenue</th>
                <th className="text-right py-3 px-2">Benchmark</th>
                <th className="text-right py-3 px-2">Optimizable</th>
                <th className="text-right py-3 px-2">Potential Savings</th>
              </tr>
            </thead>
            <tbody>
              {expenseAnalysis.expense_breakdown
                .sort((a, b) => b.annual_amount - a.annual_amount)
                .map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{item.category}</td>
                    <td className="py-3 px-2 text-right">{formatCurrencyUtil(item.annual_amount)}</td>
                    <td className="py-3 px-2 text-right">{formatPercent(item.percent_of_total)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={item.market_benchmark_percent && item.percent_of_revenue > item.market_benchmark_percent * 1.2 ? 'text-red-600 font-semibold' : ''}>
                        {formatPercent(item.percent_of_revenue)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600">
                      {item.market_benchmark_percent ? formatPercent(item.market_benchmark_percent) : '-'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {item.is_optimizable ? (
                        <span className="text-green-600 font-medium">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400">✗ Fixed</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {item.potential_savings ? (
                        <span className="text-green-600 font-semibold">
                          {formatCurrencyUtil(item.potential_savings)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              <tr className="border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-2">TOTAL</td>
                <td className="py-3 px-2 text-right">{formatCurrencyUtil(expenseAnalysis.total_annual_expenses)}</td>
                <td className="py-3 px-2 text-right">100%</td>
                <td className="py-3 px-2 text-right">{formatPercent(expenseAnalysis.expense_ratio)}</td>
                <td className="py-3 px-2 text-right text-purple-600">{formatPercent(expenseAnalysis.market_benchmark_ratio)}</td>
                <td className="py-3 px-2 text-right">-</td>
                <td className="py-3 px-2 text-right text-green-600">{formatCurrencyUtil(expenseAnalysis.total_potential_savings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Year Projection */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">5-Year Expense Ratio Projection</h4>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-gray-600">Revenue Growth:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={revenueGrowth}
                onChange={(e) => setRevenueGrowth(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded"
              />
              <span>%</span>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-600">Expense Growth:</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={expenseGrowth}
                onChange={(e) => setExpenseGrowth(Number(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded"
              />
              <span>%</span>
            </label>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(value) => `Year ${value}`} />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'Expense Ratio') return `${value.toFixed(1)}%`;
                  return formatCurrencyUtil(value);
                }}
                labelFormatter={(value) => `Year ${value}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <ReferenceLine y={expenseAnalysis.market_benchmark_ratio} stroke="#8b5cf6" strokeDasharray="3 3" label="Market Benchmark" />
              <ReferenceLine y={expenseAnalysis.target_ratio} stroke="#10b981" strokeDasharray="3 3" label="Target" />
              <Line
                type="monotone"
                dataKey="expense_ratio"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Expense Ratio"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Projected expense ratio over 5 years assuming {revenueGrowth}% annual revenue growth and {expenseGrowth}% expense growth, with gradual implementation of optimization strategies.
        </p>
      </div>

      {/* Top Opportunities */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Top Optimization Opportunities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {expenseAnalysis.most_optimizable_categories.map((category, index) => {
            const item = expenseAnalysis.expense_breakdown.find(i => i.category === category);
            if (!item || !item.potential_savings) return null;

            return (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">#{index + 1} {category}</h5>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Rank {index + 1}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrencyUtil(item.potential_savings)}
                </div>
                <div className="text-xs text-gray-600">
                  Reduce from {formatPercent(item.percent_of_revenue)} to ~{formatPercent(item.percent_of_revenue - ((item.potential_savings / expenseAnalysis.total_annual_revenue) * 100))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Recommendations
        </h4>
        <div className="space-y-3">
          {expenseAnalysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-yellow-200">
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700 flex-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-semibold mb-3">📊 Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Current Performance:</span> Your expense ratio of{' '}
              <span className="font-bold">{formatPercent(expenseAnalysis.expense_ratio)}</span> is{' '}
              <span className={expenseAnalysis.variance_from_benchmark > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                {expenseAnalysis.variance_from_benchmark > 0 ? 'above' : 'below'}
              </span>{' '}
              the market benchmark of {formatPercent(expenseAnalysis.market_benchmark_ratio)}.
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Efficiency Rating:</span>{' '}
              <span className={`font-bold ${expenseAnalysis.efficiency_rating === 'Excellent' || expenseAnalysis.efficiency_rating === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
                {expenseAnalysis.efficiency_rating}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Optimization Potential:</span> By implementing the recommendations above, you could save{' '}
              <span className="font-bold text-green-600">{formatCurrencyUtil(expenseAnalysis.total_potential_savings)}</span> annually
              ({formatCurrencyUtil(expenseAnalysis.total_potential_savings / 12)}/month).
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Optimized Ratio:</span> This would reduce your expense ratio to{' '}
              <span className="font-bold text-blue-600">{formatPercent(expenseAnalysis.optimized_expense_ratio)}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
