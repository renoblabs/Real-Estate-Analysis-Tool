'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { DealAnalysis } from '@/types';
import { MARKET_BENCHMARKS } from '@/constants/market-data';

interface DealMetricsChartProps {
  analysis: DealAnalysis;
  type?: 'bar' | 'radar';
}

export function DealMetricsChart({ analysis, type = 'bar' }: DealMetricsChartProps) {
  // Get market benchmarks for comparison
  const city = analysis.property.city;
  const propertyType = analysis.property.property_type;

  // Get market cap rate
  const cityKey = (city in MARKET_BENCHMARKS.cap_rates ? city : 'default') as keyof typeof MARKET_BENCHMARKS.cap_rates;
  const propertyTypeKey = propertyType === 'Single Family' ? 'single_family' : 'multi_unit';
  const marketCapRate = MARKET_BENCHMARKS.cap_rates[cityKey]?.[propertyTypeKey] ||
                       MARKET_BENCHMARKS.cap_rates.default[propertyTypeKey];

  // Prepare metrics data with market comparison
  const metricsData = [
    {
      name: 'Cap Rate',
      value: analysis.metrics.cap_rate,
      market: marketCapRate,
      unit: '%',
      color: analysis.metrics.cap_rate >= marketCapRate ? '#10b981' : '#ef4444',
    },
    {
      name: 'Cash-on-Cash',
      value: analysis.metrics.cash_on_cash_return,
      market: 8.0, // Target CoC return
      unit: '%',
      color: analysis.metrics.cash_on_cash_return >= 8.0 ? '#10b981' : '#ef4444',
    },
    {
      name: 'DSCR',
      value: analysis.metrics.dscr,
      market: 1.25, // Healthy DSCR threshold
      unit: '',
      color: analysis.metrics.dscr >= 1.25 ? '#10b981' : '#ef4444',
    },
    {
      name: 'Monthly CF',
      value: analysis.cash_flow.monthly_net,
      market: 200, // Target positive cash flow
      unit: '$',
      color: analysis.cash_flow.monthly_net >= 200 ? '#10b981' : '#ef4444',
    },
  ];

  // Normalize data for radar chart (0-100 scale)
  const radarData = metricsData.map((metric) => {
    let normalizedValue = 0;
    let normalizedMarket = 0;

    switch (metric.name) {
      case 'Cap Rate':
        normalizedValue = Math.min((metric.value / 10) * 100, 100);
        normalizedMarket = Math.min((metric.market / 10) * 100, 100);
        break;
      case 'Cash-on-Cash':
        normalizedValue = Math.min((metric.value / 20) * 100, 100);
        normalizedMarket = Math.min((metric.market / 20) * 100, 100);
        break;
      case 'DSCR':
        normalizedValue = Math.min((metric.value / 2) * 100, 100);
        normalizedMarket = Math.min((metric.market / 2) * 100, 100);
        break;
      case 'Monthly CF':
        normalizedValue = Math.min(((metric.value + 500) / 1500) * 100, 100);
        normalizedMarket = Math.min(((metric.market + 500) / 1500) * 100, 100);
        break;
    }

    return {
      metric: metric.name,
      'Your Deal': Math.max(0, normalizedValue),
      'Market/Target': normalizedMarket,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = metricsData.find((m) => m.name === payload[0].payload.name);
      if (!data) return null;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p className="text-blue-600 dark:text-blue-400">
              Your Deal: {data.unit === '$' ? '$' : ''}{data.value.toFixed(2)}{data.unit !== '$' ? data.unit : ''}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Market/Target: {data.unit === '$' ? '$' : ''}{data.market.toFixed(2)}{data.unit !== '$' ? data.unit : ''}
            </p>
            <p className={`font-medium ${data.value >= data.market ? 'text-green-600' : 'text-red-600'}`}>
              {data.value >= data.market ? '✓ Above Target' : '✗ Below Target'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (type === 'radar') {
    return (
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Your Deal"
              dataKey="Your Deal"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Radar
              name="Market/Target"
              dataKey="Market/Target"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Radar Chart:</span> Compare your deal metrics against market benchmarks and investment targets. Larger coverage = better performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="value" name="Your Deal" radius={[8, 8, 0, 0]}>
            {metricsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <Bar dataKey="market" name="Market/Target" fill="#94a3b8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Metrics Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {metricsData.map((metric) => (
          <div
            key={metric.name}
            className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">{metric.name}</p>
            <p className={`text-lg font-bold ${metric.color === '#10b981' ? 'text-green-600' : 'text-red-600'}`}>
              {metric.unit === '$' ? '$' : ''}{metric.value.toFixed(metric.unit === '$' ? 0 : 2)}{metric.unit !== '$' ? metric.unit : ''}
            </p>
            <p className="text-xs text-gray-500">
              vs {metric.unit === '$' ? '$' : ''}{metric.market.toFixed(metric.unit === '$' ? 0 : 2)}{metric.unit !== '$' ? metric.unit : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
