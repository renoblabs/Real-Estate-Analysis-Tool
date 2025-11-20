'use client';

import {
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

interface CashFlowProjectionChartProps {
  analysis: DealAnalysis;
  years?: number;
  appreciationRate?: number;
  rentGrowthRate?: number;
}

export function CashFlowProjectionChart({
  analysis,
  years = 10,
  appreciationRate = 3.0,
  rentGrowthRate = 2.5,
}: CashFlowProjectionChartProps) {
  // Calculate projected cash flow over time
  const projectionData = [];
  let cumulativeCashFlow = 0;

  for (let year = 0; year <= years; year++) {
    // Calculate rent with growth
    const annualRent = analysis.revenue.annual_rent * Math.pow(1 + rentGrowthRate / 100, year);

    // Calculate expenses with inflation (assume 2.5% inflation)
    const expenseGrowth = 1 + 2.5 / 100;
    const annualExpenses =
      (analysis.expenses.total_annual_expenses - analysis.expenses.annual_mortgage) *
        Math.pow(expenseGrowth, year) +
      analysis.expenses.annual_mortgage; // Mortgage stays constant

    // Net cash flow for the year
    const yearCashFlow = annualRent - annualExpenses;
    cumulativeCashFlow += yearCashFlow;

    // Calculate property value with appreciation
    const propertyValue =
      analysis.acquisition.purchase_price * Math.pow(1 + appreciationRate / 100, year);

    // Calculate equity (property value - remaining mortgage)
    // Simple amortization approximation
    const monthlyRate = analysis.financing.interest_rate / 100 / 12;
    const totalPayments = analysis.financing.amortization_years * 12;
    const paymentsRemaining = totalPayments - year * 12;
    const remainingMortgage =
      paymentsRemaining > 0
        ? (analysis.financing.total_mortgage *
            (Math.pow(1 + monthlyRate, paymentsRemaining) - 1)) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1)
        : 0;

    const equity = propertyValue - remainingMortgage;

    projectionData.push({
      year: year === 0 ? 'Now' : `Year ${year}`,
      yearNumber: year,
      cashFlow: Math.round(yearCashFlow),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
      equity: Math.round(equity),
      propertyValue: Math.round(propertyValue),
    });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.year}</p>
          <div className="space-y-1 text-xs">
            <p className="text-green-600 dark:text-green-400">
              Annual Cash Flow: ${data.cashFlow.toLocaleString()}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Cumulative: ${data.cumulativeCashFlow.toLocaleString()}
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Equity: ${data.equity.toLocaleString()}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Property Value: ${data.propertyValue.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="cashFlow"
            stroke="#10b981"
            strokeWidth={2}
            name="Annual Cash Flow"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeCashFlow"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Cumulative Cash Flow"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Equity"
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Projection Assumptions */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Projection Assumptions:
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Appreciation:</span> {appreciationRate}%/year
          </div>
          <div>
            <span className="font-medium">Rent Growth:</span> {rentGrowthRate}%/year
          </div>
          <div>
            <span className="font-medium">Expense Inflation:</span> 2.5%/year
          </div>
        </div>
      </div>
    </div>
  );
}
