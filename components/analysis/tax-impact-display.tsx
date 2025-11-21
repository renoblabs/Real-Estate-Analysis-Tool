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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { DealAnalysis } from '@/types';
import {
  calculateTaxImpact,
  calculateMultiYearTaxProjection,
  type TaxImpact,
} from '@/lib/tax-calculator';
import { DollarSign, TrendingDown, TrendingUp, Calculator } from 'lucide-react';

interface TaxImpactDisplayProps {
  analysis: DealAnalysis;
}

export function TaxImpactDisplay({ analysis }: TaxImpactDisplayProps) {
  const [employmentIncome, setEmploymentIncome] = useState(80000);
  const [yearsHeld, setYearsHeld] = useState(5);
  const [appreciationRate, setAppreciationRate] = useState(3.0);

  const taxImpact = calculateTaxImpact(analysis, employmentIncome, yearsHeld, appreciationRate);
  const multiYearProjection = calculateMultiYearTaxProjection(analysis, employmentIncome, yearsHeld);

  // Prepare data for deductions pie chart
  const deductionsData = [
    { name: 'Operating Expenses', value: taxImpact.deductible_expenses },
    { name: 'Mortgage Interest', value: taxImpact.mortgage_interest_deduction },
    { name: 'Depreciation (CCA)', value: taxImpact.depreciation_deduction },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Tax Assumptions */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Tax Calculation Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Employment Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                step="10000"
                min="0"
                max="500000"
                value={employmentIncome}
                onChange={(e) => setEmploymentIncome(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Your annual employment income</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Years Held (for CG calc)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={yearsHeld}
              onChange={(e) => setYearsHeld(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Hold period before sale</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Appreciation Rate (%)
            </label>
            <input
              type="number"
              step="0.5"
              min="-5"
              max="15"
              value={appreciationRate}
              onChange={(e) => setAppreciationRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-600 mt-1">Annual property appreciation</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="text-sm">
            <span className="font-semibold">Your Marginal Tax Rate:</span>{' '}
            <span className="text-blue-600 font-bold">{taxImpact.marginal_tax_rate.toFixed(2)}%</span>
            {' '}({analysis.property.province})
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Combined federal + provincial rate based on total income
          </p>
        </div>
      </div>

      {/* Key Tax Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">Tax Deductions</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${taxImpact.total_tax_deductions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            Saves ${taxImpact.tax_savings_from_deductions.toLocaleString()} in taxes
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">Rental Income Tax</h4>
          </div>
          <div className="text-2xl font-bold text-red-600 mb-1">
            ${taxImpact.rental_income_tax.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            {taxImpact.effective_tax_rate_rental.toFixed(1)}% effective rate
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">After-Tax Cash Flow</h4>
          </div>
          <div className={`text-2xl font-bold mb-1 ${taxImpact.after_tax_cash_flow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${taxImpact.after_tax_cash_flow.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            Annual after taxes
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-600">Capital Gains Tax</h4>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            ${taxImpact.capital_gains_tax.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">
            On ${taxImpact.capital_gain.toLocaleString()} gain
          </div>
        </div>
      </div>

      {/* Rental Income Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income & Deductions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">💰 Rental Income Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-medium">Gross Rental Income</span>
              <span className="text-green-600 font-semibold">
                ${taxImpact.gross_rental_income.toLocaleString()}
              </span>
            </div>
            <div className="pl-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Operating Expenses</span>
                <span>-${taxImpact.deductible_expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Mortgage Interest</span>
                <span>-${taxImpact.mortgage_interest_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Depreciation (CCA)</span>
                <span>-${taxImpact.depreciation_deduction.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t font-semibold">
              <span>Net Rental Income (Taxable)</span>
              <span className={taxImpact.net_rental_income >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${taxImpact.net_rental_income.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span>Income Tax @ {taxImpact.marginal_tax_rate.toFixed(1)}%</span>
              <span>-${taxImpact.rental_income_tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 font-bold text-lg">
              <span>After-Tax Cash Flow</span>
              <span className={taxImpact.after_tax_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${taxImpact.after_tax_cash_flow.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tax Deductions Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">📊 Tax Deductions Breakdown</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deductionsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deductionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deductionsData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">${item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t font-semibold">
              <span>Total Deductions</span>
              <span className="text-green-600">${taxImpact.total_tax_deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Year Projection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">📈 {yearsHeld}-Year Tax Projection</h4>
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiYearProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tax_owed"
                stroke="#ef4444"
                strokeWidth={2}
                name="Annual Tax"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="after_tax_cf"
                stroke="#10b981"
                strokeWidth={2}
                name="After-Tax Cash Flow"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Year</th>
                <th className="px-4 py-2 text-right">Rental Income</th>
                <th className="px-4 py-2 text-right">Deductions</th>
                <th className="px-4 py-2 text-right">Net Income</th>
                <th className="px-4 py-2 text-right">Tax Owed</th>
                <th className="px-4 py-2 text-right">After-Tax CF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {multiYearProjection.map((year) => (
                <tr key={year.year}>
                  <td className="px-4 py-2 font-medium">{year.year}</td>
                  <td className="px-4 py-2 text-right text-green-600">
                    ${year.rental_income.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-600">
                    ${year.deductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ${year.net_income.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-red-600">
                    ${year.tax_owed.toLocaleString()}
                  </td>
                  <td className={`px-4 py-2 text-right font-medium ${year.after_tax_cf >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${year.after_tax_cf.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
              <tr>
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right text-green-600">
                  ${multiYearProjection.reduce((sum, y) => sum + y.rental_income, 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right text-blue-600">
                  ${multiYearProjection.reduce((sum, y) => sum + y.deductions, 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  ${multiYearProjection.reduce((sum, y) => sum + y.net_income, 0).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right text-red-600">
                  ${multiYearProjection[multiYearProjection.length - 1].cumulative_tax.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right text-green-600">
                  ${multiYearProjection.reduce((sum, y) => sum + y.after_tax_cf, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Capital Gains on Sale */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">🏠 Capital Gains Tax (on Sale)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Price:</span>
              <span className="font-medium">${taxImpact.purchase_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Sale Price ({yearsHeld}yr @ {appreciationRate}%):</span>
              <span className="font-medium text-green-600">${taxImpact.estimated_sale_price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Capital Gain:</span>
              <span className="font-semibold text-green-600">${taxImpact.capital_gain.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Taxable Gain (50% inclusion):</span>
              <span className="font-medium">${taxImpact.taxable_capital_gain.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax @ {taxImpact.marginal_tax_rate.toFixed(1)}%:</span>
              <span className="font-medium text-red-600">${taxImpact.capital_gains_tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Net Proceeds After Tax:</span>
              <span className="font-semibold text-green-600">${taxImpact.net_proceeds_after_tax.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm">
          <p className="font-semibold mb-1">🇨🇦 Canadian Tax Advantage:</p>
          <p className="text-gray-700 dark:text-gray-300">
            Only 50% of capital gains are taxable, meaning your effective tax rate on gains is {taxImpact.effective_tax_rate_capital_gain.toFixed(1)}%
            instead of your full marginal rate of {taxImpact.marginal_tax_rate.toFixed(1)}%.
          </p>
        </div>
      </div>

      {/* Tax Strategies */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-3">💡 Tax Optimization Strategies</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>
              <span className="font-semibold">Maximize Deductions:</span> You're deducting ${taxImpact.total_tax_deductions.toLocaleString()}/year,
              saving ${taxImpact.tax_savings_from_deductions.toLocaleString()} in taxes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>
              <span className="font-semibold">Depreciation (CCA):</span> ${taxImpact.depreciation_deduction.toLocaleString()}/year reduces taxable income
              (but will be recaptured on sale).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">💡</span>
            <span>
              <span className="font-semibold">Hold Long-Term:</span> Capital gains enjoy 50% inclusion rate -
              only ${taxImpact.taxable_capital_gain.toLocaleString()} of ${taxImpact.capital_gain.toLocaleString()} gain is taxed.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">💡</span>
            <span>
              <span className="font-semibold">Track All Expenses:</span> Keep receipts for repairs, maintenance, insurance, property management, etc. -
              all are deductible against rental income.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">⚠</span>
            <span>
              <span className="font-semibold">Consult a Tax Professional:</span> Tax laws are complex. This is an estimate -
              work with a Canadian accountant familiar with rental property taxation.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
