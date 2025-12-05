'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Deal } from '@/types';
import { ArrowLeft, TrendingUp, DollarSign, Home, BarChart3, AlertTriangle, Briefcase, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// Helper function to calculate monthly expenses
function calculateMonthlyExpenses(deal: Deal) {
  const monthlyRent = deal.monthly_rent || 0;
  const propertyManagementMonthly = (monthlyRent * (deal.property_management_percent || 0)) / 100;
  const maintenanceMonthly = (monthlyRent * (deal.maintenance_percent || 0)) / 100;
  const vacancyMonthly = (monthlyRent * (deal.vacancy_rate || 0)) / 100;

  return (
    (deal.property_tax_annual || 0) / 12 +
    (deal.insurance_annual || 0) / 12 +
    propertyManagementMonthly +
    maintenanceMonthly +
    vacancyMonthly +
    (deal.utilities_monthly || 0) +
    (deal.hoa_fees_monthly || 0) +
    (deal.other_expenses_monthly || 0)
  );
}

export default function PortfolioPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'portfolio'>('pipeline');
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

  // Filter deals based on active tab
  const filteredDeals = deals.filter(deal => {
    if (activeTab === 'portfolio') {
      return deal.status === 'closed' || deal.status === 'under_contract';
    } else {
      return deal.status !== 'closed' && deal.status !== 'under_contract';
    }
  });

  // Calculate portfolio metrics using filtered deal data
  const portfolioMetrics = {
    totalDeals: filteredDeals.length,
    totalValue: filteredDeals.reduce((sum, deal) => sum + deal.purchase_price, 0),
    totalEquity: filteredDeals.reduce((sum, deal) => sum + deal.down_payment_amount, 0),
    totalMonthlyRent: filteredDeals.reduce((sum, deal) => sum + deal.monthly_rent, 0),
    totalMonthlyCashFlow: filteredDeals.reduce((sum, deal) => {
      const monthlyExpenses = calculateMonthlyExpenses(deal);
      return sum + (deal.monthly_rent - monthlyExpenses);
    }, 0),
    totalAnnualCashFlow: filteredDeals.reduce((sum, deal) => {
      const monthlyExpenses = calculateMonthlyExpenses(deal);
      return sum + ((deal.monthly_rent - monthlyExpenses) * 12);
    }, 0),
    averageCapRate: filteredDeals.length > 0
      ? filteredDeals.reduce((sum, deal) => {
        const monthlyExpenses = calculateMonthlyExpenses(deal);
        const capRate = ((deal.monthly_rent * 12) - (monthlyExpenses * 12)) / deal.purchase_price * 100;
        return sum + capRate;
      }, 0) / filteredDeals.length
      : 0,
    averageCoCReturn: filteredDeals.length > 0
      ? filteredDeals.reduce((sum, deal) => {
        const monthlyExpenses = calculateMonthlyExpenses(deal);
        const cashOnCash = ((deal.monthly_rent - monthlyExpenses) * 12) / (deal.down_payment_amount + (deal.purchase_price * 0.015)) * 100;
        return sum + cashOnCash;
      }, 0) / filteredDeals.length
      : 0,
    averageDSCR: filteredDeals.length > 0
      ? 1.2 // Default DSCR estimate
      : 0,
    positiveCashFlowDeals: filteredDeals.filter((deal) => {
      const monthlyExpenses = calculateMonthlyExpenses(deal);
      return (deal.monthly_rent - monthlyExpenses) > 0;
    }).length,
    negativeCashFlowDeals: filteredDeals.filter((deal) => {
      const monthlyExpenses = calculateMonthlyExpenses(deal);
      return (deal.monthly_rent - monthlyExpenses) < 0;
    }).length,
  };

  // Property type distribution
  const propertyTypeData = filteredDeals.reduce((acc, deal) => {
    const type = deal.property_type || 'Single Family';
    const existing = acc.find((d) => d.name === type);
    if (existing) {
      existing.value += 1;
      existing.totalValue += deal.purchase_price;
    } else {
      acc.push({
        name: type,
        value: 1,
        totalValue: deal.purchase_price,
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; totalValue: number }>);

  // Strategy distribution
  const strategyData = filteredDeals.reduce((acc, deal) => {
    const strategy = deal.strategy || 'buy_hold';
    const strategyName = strategy === 'buy_hold' ? 'Buy & Hold' :
      strategy === 'brrrr' ? 'BRRRR' :
        strategy === 'fix_flip' ? 'Fix & Flip' :
          'Multifamily Development';
    const existing = acc.find((d) => d.name === strategyName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: strategyName, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Deal grades distribution
  const gradeData = filteredDeals.reduce((acc, deal) => {
    // Calculate a simple grade based on cash flow
    const monthlyExpenses = calculateMonthlyExpenses(deal);
    const monthlyCashFlow = deal.monthly_rent - monthlyExpenses;
    const grade = monthlyCashFlow > 500 ? 'A' : monthlyCashFlow > 200 ? 'B' : monthlyCashFlow > 0 ? 'C' : 'D';
    const existing = acc.find((d) => d.name === grade);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: grade, value: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Top performers
  const topPerformers = [...filteredDeals]
    .sort((a, b) => {
      const aExpenses = calculateMonthlyExpenses(a);
      const bExpenses = calculateMonthlyExpenses(b);
      const aCashFlow = a.monthly_rent - aExpenses;
      const bCashFlow = b.monthly_rent - bExpenses;
      return bCashFlow - aCashFlow;
    })
    .slice(0, 5);

  // Bottom performers
  const bottomPerformers = [...filteredDeals]
    .sort((a, b) => {
      const aExpenses = calculateMonthlyExpenses(a);
      const bExpenses = calculateMonthlyExpenses(b);
      const aCashFlow = a.monthly_rent - aExpenses;
      const bCashFlow = b.monthly_rent - bExpenses;
      return aCashFlow - bCashFlow;
    })
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
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
                Aggregate insights across your {filteredDeals.length} {activeTab === 'portfolio' ? 'active' : 'analyzed'} deal{filteredDeals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'pipeline' | 'portfolio')} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-[300px] grid-cols-2">
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Portfolio
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'portfolio' ? (
                <Briefcase className="w-8 h-8 text-gray-400" />
              ) : (
                <Search className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No {activeTab === 'portfolio' ? 'Active Properties' : 'Analyzed Deals'} Found
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'portfolio'
                ? "You haven't marked any deals as 'Closed' or 'Under Contract' yet."
                : "You haven't analyzed any deals yet."}
            </p>
            {activeTab === 'pipeline' && (
              <button
                onClick={() => router.push('/analyze')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Analyze New Deal
              </button>
            )}
          </div>
        ) : (
          <>
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
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
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
                    {filteredDeals.length > 0 ? Math.round(filteredDeals.reduce((sum, deal) => {
                      const monthlyExpenses = calculateMonthlyExpenses(deal);
                      const monthlyCashFlow = deal.monthly_rent - monthlyExpenses;
                      const score = monthlyCashFlow > 500 ? 85 : monthlyCashFlow > 200 ? 75 : monthlyCashFlow > 0 ? 65 : 45;
                      return sum + score;
                    }, 0) / filteredDeals.length) : 0}/100
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
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => router.push(`/deals/${item.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          #{idx + 1} {item.address}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.city}, {item.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${item.deal_grade === 'A' ? 'bg-green-100 text-green-800' :
                          item.deal_grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item.deal_grade}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          ${item.monthly_cash_flow.toLocaleString()}/mo
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
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => router.push(`/deals/${item.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {item.address}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.city}, {item.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${item.deal_grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          item.deal_grade === 'F' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item.deal_grade}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          ${item.monthly_cash_flow.toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
