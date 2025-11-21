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
  ReferenceLine,
} from 'recharts';
import type { DealAnalysis, PropertyInputs } from '@/types';
import {
  calculateAdvancedMetrics,
  interpretIRR,
  interpretNPV,
  interpretPaybackPeriod,
  type ProjectionAssumptions,
  type AdvancedMetrics,
} from '@/lib/advanced-metrics';
import { Info } from 'lucide-react';

interface AdvancedMetricsDisplayProps {
  inputs: PropertyInputs;
  analysis: DealAnalysis;
}

export function AdvancedMetricsDisplay({ inputs, analysis }: AdvancedMetricsDisplayProps) {
  const [assumptions, setAssumptions] = useState<ProjectionAssumptions>({
    hold_period_years: 5,
    appreciation_rate: 3.0,
    rent_growth_rate: 2.5,
    expense_growth_rate: 2.5,
    sale_costs_percent: 6.0,
    discount_rate: 8.0,
    reinvestment_rate: 8.0,
  });

  const [metrics, setMetrics] = useState<AdvancedMetrics>(() =>
    calculateAdvancedMetrics(inputs, analysis, assumptions)
  );

  const updateAssumption = (key: keyof ProjectionAssumptions, value: number) => {
    const newAssumptions = { ...assumptions, [key]: value };
    setAssumptions(newAssumptions);
    setMetrics(calculateAdvancedMetrics(inputs, analysis, newAssumptions));
  };

  // Prepare CoC progression data for chart
  const cocData = metrics.coc_progression.map((coc, index) => ({
    year: `Year ${index + 1}`,
    coc: coc,
  }));

  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
        {text}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Assumptions Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Hold Period (Years)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={assumptions.hold_period_years}
              onChange={(e) => updateAssumption('hold_period_years', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Annual Appreciation (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="-10"
              max="20"
              value={assumptions.appreciation_rate}
              onChange={(e) => updateAssumption('appreciation_rate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Rent Growth (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={assumptions.rent_growth_rate}
              onChange={(e) => updateAssumption('rent_growth_rate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Expense Growth (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={assumptions.expense_growth_rate}
              onChange={(e) => updateAssumption('expense_growth_rate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Sale Costs (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="15"
              value={assumptions.sale_costs_percent}
              onChange={(e) => updateAssumption('sale_costs_percent', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={assumptions.discount_rate}
              onChange={(e) => updateAssumption('discount_rate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IRR */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Internal Rate of Return
            </h4>
            <InfoTooltip text="The discount rate that makes NPV = 0. Measures the profitability of the investment." />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {metrics.irr.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-600">
            {interpretIRR(metrics.irr)}
          </div>
        </div>

        {/* NPV */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Net Present Value
            </h4>
            <InfoTooltip text="Present value of all future cash flows minus initial investment. Positive NPV = good investment." />
          </div>
          <div className={`text-3xl font-bold mb-1 ${metrics.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${metrics.npv.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            {interpretNPV(metrics.npv)}
          </div>
        </div>

        {/* Payback Period */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Payback Period
            </h4>
            <InfoTooltip text="Number of years to recover your initial investment from cash flows." />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.payback_period.toFixed(1)} yrs
          </div>
          <div className="text-xs text-gray-600">
            {interpretPaybackPeriod(metrics.payback_period, assumptions.hold_period_years)}
          </div>
        </div>

        {/* Equity Multiple */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Equity Multiple
            </h4>
            <InfoTooltip text="Total cash returned ÷ initial investment. 2.0x means you doubled your money." />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {metrics.equity_multiple.toFixed(2)}x
          </div>
          <div className="text-xs text-gray-600">
            {metrics.equity_multiple >= 2 ? 'Excellent multiple' : metrics.equity_multiple >= 1.5 ? 'Good multiple' : 'Below target'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Modified IRR
            </h4>
            <InfoTooltip text="More realistic than IRR - assumes cash flows are reinvested at your discount rate." />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.mirr.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Profit
            </h4>
            <InfoTooltip text="Total cash returned minus initial investment over the hold period." />
          </div>
          <div className={`text-2xl font-bold ${metrics.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${metrics.total_profit.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Annualized Return
            </h4>
            <InfoTooltip text="Average annual percentage return, accounting for compounding." />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.annualized_return.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Cash-on-Cash Progression Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Cash-on-Cash Return Over Time</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <ReferenceLine y={8} stroke="#10b981" strokeDasharray="3 3" label="Target 8%" />
              <Bar dataKey="coc" fill="#3b82f6" name="CoC Return %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Shows annual cash-on-cash return for each year based on rent growth and expense assumptions.
        </p>
      </div>

      {/* Investment Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">📊 Investment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-2">Initial Investment</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cash Needed:</span>
                <span className="font-medium">${analysis.acquisition.total_cash_needed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hold Period:</span>
                <span className="font-medium">{assumptions.hold_period_years} years</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Expected Returns</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cash Returned:</span>
                <span className="font-medium text-green-600">
                  ${(analysis.acquisition.total_cash_needed * metrics.equity_multiple).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Profit:</span>
                <span className={`font-medium ${metrics.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${metrics.total_profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-3">💡 Recommendations</h4>
        <ul className="space-y-2 text-sm">
          {metrics.irr > 15 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Excellent IRR of {metrics.irr.toFixed(1)}% exceeds most alternative investments</span>
            </li>
          )}
          {metrics.npv > 50000 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Strong positive NPV of ${metrics.npv.toLocaleString()} indicates good value</span>
            </li>
          )}
          {metrics.payback_period < assumptions.hold_period_years / 2 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Quick payback period of {metrics.payback_period.toFixed(1)} years provides early capital recovery</span>
            </li>
          )}
          {metrics.equity_multiple < 1.5 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">⚠</span>
              <span>Equity multiple of {metrics.equity_multiple.toFixed(2)}x is below the 1.5x target - consider negotiating price</span>
            </li>
          )}
          {metrics.irr < 10 && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✗</span>
              <span>IRR of {metrics.irr.toFixed(1)}% is low - explore ways to increase returns or consider alternative investments</span>
            </li>
          )}
          {metrics.npv < 0 && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✗</span>
              <span>Negative NPV suggests the deal destroys value at your {assumptions.discount_rate}% discount rate</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
