'use client';

import { useState, useEffect } from 'react';
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
import type { DealAnalysis, PropertyInputs } from '@/types';
import { analyzeDeal } from '@/lib/deal-analyzer';

interface SensitivityAnalysisProps {
  baseInputs: PropertyInputs;
  baseAnalysis: DealAnalysis;
}

type SensitivityVariable =
  | 'rent'
  | 'vacancy'
  | 'interest_rate'
  | 'purchase_price'
  | 'expenses'
  | 'appreciation';

export function SensitivityAnalysis({ baseInputs, baseAnalysis }: SensitivityAnalysisProps) {
  const [selectedVariable, setSelectedVariable] = useState<SensitivityVariable>('rent');
  const [rangePercent, setRangePercent] = useState(20); // -20% to +20%
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);

  // Generate sensitivity data
  const generateSensitivityData = async () => {
    const dataPoints = 11; // -20%, -16%, -12%, ..., 0%, ..., +20%
    const step = (rangePercent * 2) / (dataPoints - 1);
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const percentChange = -rangePercent + (step * i);
      const multiplier = 1 + (percentChange / 100);

      let modifiedInputs = { ...baseInputs };

      switch (selectedVariable) {
        case 'rent':
          modifiedInputs.monthly_rent = baseInputs.monthly_rent * multiplier;
          break;
        case 'vacancy':
          modifiedInputs.vacancy_rate = baseInputs.vacancy_rate * multiplier;
          break;
        case 'interest_rate':
          modifiedInputs.interest_rate = baseInputs.interest_rate * multiplier;
          break;
        case 'purchase_price':
          modifiedInputs.purchase_price = baseInputs.purchase_price * multiplier;
          break;
        case 'expenses':
          modifiedInputs.maintenance_percent = baseInputs.maintenance_percent * multiplier;
          modifiedInputs.property_management_percent = baseInputs.property_management_percent * multiplier;
          break;
        case 'appreciation':
          // For appreciation, we'll show impact on equity over 5 years
          break;
      }

      const analysis = await analyzeDeal(modifiedInputs);

      data.push({
        change: percentChange,
        label: `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%`,
        monthlyCashFlow: (analysis as DealAnalysis).cash_flow.monthly_net,
        annualCashFlow: (analysis as DealAnalysis).cash_flow.annual_net,
        capRate: (analysis as DealAnalysis).metrics.cap_rate,
        cocReturn: (analysis as DealAnalysis).metrics.cash_on_cash_return,
        dscr: (analysis as DealAnalysis).metrics.dscr,
        score: (analysis as DealAnalysis).scoring.total_score,
      });
    }

    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await generateSensitivityData();
      setSensitivityData(data);
    };
    loadData();
  }, [selectedVariable, rangePercent]);

  const variables = [
    { key: 'rent', label: 'Monthly Rent', description: 'Impact of rent changes on deal performance' },
    { key: 'vacancy', label: 'Vacancy Rate', description: 'How vacancy affects cash flow' },
    { key: 'interest_rate', label: 'Interest Rate', description: 'Mortgage rate sensitivity' },
    { key: 'purchase_price', label: 'Purchase Price', description: 'Price negotiation impact' },
    { key: 'expenses', label: 'Operating Expenses', description: 'Expense management importance' },
  ] as const;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.label} Change</p>
          <div className="space-y-1 text-xs">
            <p className="text-green-600 dark:text-green-400">
              Monthly CF: ${data.monthlyCashFlow.toLocaleString()}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Annual CF: ${data.annualCashFlow.toLocaleString()}
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Cap Rate: {data.capRate.toFixed(2)}%
            </p>
            <p className="text-orange-600 dark:text-orange-400">
              CoC Return: {data.cocReturn.toFixed(2)}%
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              DSCR: {data.dscr.toFixed(2)}
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Score: {data.score}/100
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Variable Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Variable to Analyze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {variables.map((variable) => (
            <button
              key={variable.key}
              onClick={() => setSelectedVariable(variable.key as SensitivityVariable)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedVariable === variable.key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-sm">{variable.label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {variable.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Range Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Analysis Range:</label>
          <span className="text-sm text-gray-600">
            ±{rangePercent}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={rangePercent}
          onChange={(e) => setRangePercent(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>±10%</span>
          <span>±50%</span>
        </div>
      </div>

      {/* Current Value Display */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
            <p className="text-lg font-semibold">
              {selectedVariable === 'rent' && `$${baseInputs.monthly_rent.toLocaleString()}/month`}
              {selectedVariable === 'vacancy' && `${baseInputs.vacancy_rate}%`}
              {selectedVariable === 'interest_rate' && `${baseInputs.interest_rate}%`}
              {selectedVariable === 'purchase_price' && `$${baseInputs.purchase_price.toLocaleString()}`}
              {selectedVariable === 'expenses' && `${baseInputs.maintenance_percent}% maintenance, ${baseInputs.property_management_percent}% PM`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Monthly CF</p>
            <p className={`text-lg font-semibold ${baseAnalysis.cash_flow.monthly_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${baseAnalysis.cash_flow.monthly_net.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sensitivity Charts */}
      <div className="space-y-6">
        {/* Monthly Cash Flow Sensitivity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold mb-4">Monthly Cash Flow Sensitivity</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine x="0%" stroke="#3b82f6" strokeDasharray="3 3" label="Current" />
                <Line
                  type="monotone"
                  dataKey="monthlyCashFlow"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Monthly Cash Flow"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cap Rate & CoC Return Sensitivity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold mb-4">Returns Sensitivity</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine x="0%" stroke="#3b82f6" strokeDasharray="3 3" label="Current" />
                <Line
                  type="monotone"
                  dataKey="capRate"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Cap Rate"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="cocReturn"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="CoC Return"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deal Score Sensitivity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold mb-4">Deal Score Sensitivity</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" label="A Grade" />
                <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" label="B Grade" />
                <ReferenceLine y={55} stroke="#f59e0b" strokeDasharray="3 3" label="C Grade" />
                <ReferenceLine x="0%" stroke="#3b82f6" strokeDasharray="3 3" label="Current" />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Deal Score"
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h4 className="font-semibold mb-2">💡 Key Insights</h4>
        <ul className="space-y-2 text-sm">
          {sensitivityData[0].monthlyCashFlow < 0 && (
            <li className="text-red-600 dark:text-red-400">
              ⚠️ At {rangePercent}% decrease, monthly cash flow becomes negative: ${sensitivityData[0].monthlyCashFlow.toLocaleString()}
            </li>
          )}
          {sensitivityData[sensitivityData.length - 1].monthlyCashFlow > baseAnalysis.cash_flow.monthly_net * 1.5 && (
            <li className="text-green-600 dark:text-green-400">
              ✅ At {rangePercent}% increase, monthly cash flow improves significantly: ${sensitivityData[sensitivityData.length - 1].monthlyCashFlow.toLocaleString()}
            </li>
          )}
          <li className="text-gray-700 dark:text-gray-300">
            📊 This variable shows {Math.abs(sensitivityData[sensitivityData.length - 1].monthlyCashFlow - sensitivityData[0].monthlyCashFlow) > 1000 ? 'HIGH' : 'MODERATE'} sensitivity - small changes have {Math.abs(sensitivityData[sensitivityData.length - 1].monthlyCashFlow - sensitivityData[0].monthlyCashFlow) > 1000 ? 'significant' : 'moderate'} impact
          </li>
          <li className="text-blue-600 dark:text-blue-400">
            🎯 Focus on {selectedVariable === 'rent' ? 'maximizing rent while staying competitive' : selectedVariable === 'vacancy' ? 'minimizing vacancy through good tenant selection' : selectedVariable === 'interest_rate' ? 'locking in favorable rates' : selectedVariable === 'purchase_price' ? 'negotiating the best purchase price' : 'controlling operating expenses'}
          </li>
        </ul>
      </div>
    </div>
  );
}
