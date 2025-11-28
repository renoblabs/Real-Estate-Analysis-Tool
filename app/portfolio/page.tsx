'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Deal, PropertyInputs } from '@/types';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { ArrowLeft, TrendingUp, DollarSign, Home, BarChart3, AlertTriangle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function PortfolioPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
    } else {
      setDeals(data || []);
    }

    setLoading(false);
  }

  // Calculate portfolio metrics
  const portfolioAnalyses = deals.map((deal) => ({
    deal,
    analysis: analyzeDeal(deal as unknown as PropertyInputs),
  }));

  const portfolioMetrics = {
    totalDeals: deals.length,
    totalValue: portfolioAnalyses.reduce((sum, item) => sum + item.analysis.acquisition.purchase_price, 0),
    totalEquity: portfolioAnalyses.reduce((sum, item) => sum + item.analysis.acquisition.down_payment, 0),
    totalMonthlyRent: portfolioAnalyses.reduce((sum, item) => sum + item.analysis.revenue.gross_monthly_rent, 0),
    totalMonthlyCashFlow: portfolioAnalyses.reduce((sum, item) => sum + item.analysis.cash_flow.monthly_net, 0),
    totalAnnualCashFlow: portfolioAnalyses.reduce((sum, item) => sum + item.analysis.cash_flow.annual_net, 0),
    averageCapRate: portfolioAnalyses.length > 0
      ? portfolioAnalyses.reduce((sum, item) => sum + item.analysis.metrics.cap_rate, 0) / portfolioAnalyses.length
      : 0,
    averageCoCReturn: portfolioAnalyses.length > 0
      ? portfolioAnalyses.reduce((sum, item) => sum + item.analysis.metrics.cash_on_cash_return, 0) / portfolioAnalyses.length
      : 0,
    averageDSCR: portfolioAnalyses.length > 0
      ? portfolioAnalyses.reduce((sum, item) => sum + item.analysis.metrics.dscr, 0) / portfolioAnalyses.length
      : 0,
    positiveCashFlowDeals: portfolioAnalyses.filter((item) => item.analysis.cash_flow.monthly_net > 0).length,
    negativeCashFlowDeals: portfolioAnalyses.filter((item) => item.analysis.cash_flow.monthly_net < 0).length,
  };

  // Property type distribution
  const propertyTypeData = portfolioAnalyses.reduce((acc, item) => {
    const type = item.analysis.property.property_type;
    const existing = acc.find((d) => d.name === type);
    if (existing) {
      existing.value += 1;
      existing.totalValue += item.analysis.acquisition.purchase_price;
    } else {
      acc.push({
        name: type,
        value: 1,
        totalValue: item.analysis.acquisition.purchase_price,
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; totalValue: number }>);

  // Strategy distribution
  const strategyData = portfolioAnalyses.reduce((acc, item) => {
    const strategy = item.deal.strategy;
    const strategyName = strategy === 'buy_hold' ? 'Buy & Hold' :
                        strategy === 'brrrr' ? 'BRRRR' :
                        'Fix & Flip';
    const existing = acc.find((d) => d.name === strategyName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: strategyName, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Deal grades distribution
  const gradeData = portfolioAnalyses.reduce((acc, item) => {
    const grade = item.analysis.scoring.grade;
    const existing = acc.find((d) => d.name === grade);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: grade, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Top performers
  const topPerformers = [...portfolioAnalyses]
    .sort((a, b) => b.analysis.scoring.total_score - a.analysis.scoring.total_score)
    .slice(0, 5);

  // Bottom performers
  const bottomPerformers = [...portfolioAnalyses]
    .sort((a, b) => a.analysis.scoring.total_score - b.analysis.scoring.total_score)
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Deals Yet</h2>
            <p className="text-gray-600 mb-6">
              Start analyzing deals to see your portfolio analytics
            </p>
            <button
              onClick={() => router.push('/analyze')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Analyze Your First Deal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
              <p className="text-gray-600 mt-1">
                Aggregate insights across your {portfolioMetrics.totalDeals} deal{portfolioMetrics.totalDeals !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {portfolioMetrics.totalDeals}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Deals</p>
            <p className="text-xs text-gray-500 mt-1">
              ${(portfolioMetrics.totalValue / 1000000).toFixed(1)}M portfolio value
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className={`text-2xl font-bold ${portfolioMetrics.totalMonthlyCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${portfolioMetrics.totalMonthlyCashFlow.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Monthly Cash Flow</p>
            <p className="text-xs text-gray-500 mt-1">
              ${portfolioMetrics.totalAnnualCashFlow.toLocaleString()}/year
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {portfolioMetrics.averageCapRate.toFixed(2)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Avg Cap Rate</p>
            <p className="text-xs text-gray-500 mt-1">
              {portfolioMetrics.averageCoCReturn.toFixed(2)}% CoC Return
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {portfolioMetrics.averageDSCR.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Avg DSCR</p>
            <p className="text-xs text-gray-500 mt-1">
              {portfolioMetrics.positiveCashFlowDeals}/{portfolioMetrics.totalDeals} positive CF
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Type Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Property Type Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {propertyTypeData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-600">
                    {item.value} deal{item.value !== 1 ? 's' : ''} • ${(item.totalValue / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Grades Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Deal Grades Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {gradeData.map((entry, index) => {
                      const color = entry.name === 'A' ? '#10b981' :
                                   entry.name === 'B' ? '#3b82f6' :
                                   entry.name === 'C' ? '#f59e0b' :
                                   entry.name === 'D' ? '#f97316' :
                                   '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Average grade across portfolio:{' '}
              <span className="font-semibold">
                {(portfolioAnalyses.reduce((sum, item) => sum + item.analysis.scoring.total_score, 0) / portfolioAnalyses.length).toFixed(0)}/100
              </span>
            </p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 5 Performers
            </h2>
            <div className="space-y-3">
              {topPerformers.map((item, idx) => (
                <div
                  key={item.deal.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/deals/${item.deal.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      #{idx + 1} {item.deal.address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.deal.city}, {item.deal.province}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      item.analysis.scoring.grade === 'A' ? 'bg-green-100 text-green-800' :
                      item.analysis.scoring.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.analysis.scoring.grade}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.analysis.scoring.total_score}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Performers / Needs Attention */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Needs Attention
            </h2>
            <div className="space-y-3">
              {bottomPerformers.map((item, idx) => (
                <div
                  key={item.deal.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/deals/${item.deal.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {item.deal.address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.deal.city}, {item.deal.province}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      item.analysis.scoring.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                      item.analysis.scoring.grade === 'F' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.analysis.scoring.grade}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.analysis.scoring.total_score}/100
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
