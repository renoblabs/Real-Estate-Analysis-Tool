'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { getDeal } from '@/lib/database';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { toast } from 'sonner';
import type { Deal, DealAnalysis, PropertyInputs } from '@/types';
import { SensitivityAnalysis } from '@/components/analysis/sensitivity-analysis';
import { AdvancedMetricsDisplay } from '@/components/analysis/advanced-metrics-display';
import { TaxImpactDisplay } from '@/components/analysis/tax-impact-display';
import { AirbnbAnalysisDisplay } from '@/components/analysis/airbnb-analysis-display';
import { BreakEvenDisplay } from '@/components/analysis/break-even-display';
import { ExpenseRatioDisplay } from '@/components/analysis/expense-ratio-display';
import { RiskDashboard } from '@/components/analysis/risk-dashboard';
import { ArrowLeft, BarChart3, Calculator, DollarSign, Home, TrendingUp, Target, PieChart, Shield } from 'lucide-react';

type AnalysisTab = 'sensitivity' | 'advanced-metrics' | 'break-even' | 'expense-ratio' | 'risk' | 'tax' | 'airbnb';

export default function AdvancedAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [inputs, setInputs] = useState<PropertyInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('sensitivity');

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await getDeal(dealId);
      if (error) throw error;
      if (!data) throw new Error('Deal not found');

      setDeal(data);

      // Reconstruct the analysis from saved deal data
      const propertyInputs: PropertyInputs = {
        address: data.address,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code,
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.square_feet,
        year_built: data.year_built,
        lot_size: data.lot_size,
        purchase_price: data.purchase_price,
        down_payment_percent: data.down_payment_percent,
        down_payment_amount: data.down_payment_amount,
        interest_rate: data.interest_rate,
        amortization_years: data.amortization_years,
        strategy: data.strategy,
        property_condition: data.property_condition,
        renovation_cost: data.renovation_cost,
        after_repair_value: data.after_repair_value,
        monthly_rent: data.monthly_rent,
        other_income: data.other_income,
        vacancy_rate: data.vacancy_rate,
        property_tax_annual: data.property_tax_annual,
        insurance_annual: data.insurance_annual,
        property_management_percent: data.property_management_percent,
        maintenance_percent: data.maintenance_percent,
        utilities_monthly: data.utilities_monthly,
        hoa_condo_fees_monthly: data.hoa_fees_monthly,
        other_expenses_monthly: data.other_expenses_monthly,
      };

      setInputs(propertyInputs);

      const analysisResult = await analyzeDeal(propertyInputs);
      setAnalysis(analysisResult);
    } catch (error: any) {
      toast.error('Failed to load deal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analysis || !inputs || !deal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'sensitivity' as const,
      label: 'Sensitivity Analysis',
      icon: BarChart3,
      description: 'What-if scenarios',
    },
    {
      id: 'advanced-metrics' as const,
      label: 'IRR & NPV',
      icon: TrendingUp,
      description: 'Advanced metrics',
    },
    {
      id: 'break-even' as const,
      label: 'Break-Even Analysis',
      icon: Target,
      description: 'Path to positive CF',
    },
    {
      id: 'expense-ratio' as const,
      label: 'Expense Optimizer',
      icon: PieChart,
      description: 'Cost reduction',
    },
    {
      id: 'risk' as const,
      label: 'Risk Analysis',
      icon: Shield,
      description: 'Risk assessment',
    },
    {
      id: 'tax' as const,
      label: 'Tax Impact',
      icon: Calculator,
      description: 'Canadian taxes',
    },
    {
      id: 'airbnb' as const,
      label: 'Airbnb Analysis',
      icon: Home,
      description: 'STR vs LTR',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/deals/${dealId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Analysis</h1>
                <p className="text-sm text-gray-600 mt-1">{deal.address}</p>
              </div>
            </div>
            <Badge className="text-lg px-4 py-2">
              Score: {analysis.scoring.total_score}/100
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'sensitivity' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📊 Sensitivity Analysis
              </h2>
              <p className="text-gray-600">
                Test how changes in key variables impact your deal performance. Interactive
                what-if scenarios help you understand risks and opportunities.
              </p>
            </div>
            <SensitivityAnalysis baseInputs={inputs} baseAnalysis={analysis} />
          </div>
        )}

        {activeTab === 'advanced-metrics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                💰 Advanced Financial Metrics
              </h2>
              <p className="text-gray-600">
                Institutional-grade investment analysis with IRR, NPV, Payback Period, and
                multi-year projections. Customize assumptions to match your investment strategy.
              </p>
            </div>
            <AdvancedMetricsDisplay inputs={inputs} analysis={analysis} />
          </div>
        )}

        {activeTab === 'break-even' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 Break-Even Analysis
              </h2>
              <p className="text-gray-600">
                Find out what needs to change for this deal to reach positive cash flow. Get actionable
                insights on rent adjustments, price negotiations, expense reductions, and timeline projections.
              </p>
            </div>
            <BreakEvenDisplay analysis={analysis} inputs={inputs} />
          </div>
        )}

        {activeTab === 'expense-ratio' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                💸 Expense Ratio Optimizer
              </h2>
              <p className="text-gray-600">
                Analyze your operating expenses vs market benchmarks. Identify specific cost reduction
                opportunities and see how optimizing expenses impacts your bottom line.
              </p>
            </div>
            <ExpenseRatioDisplay analysis={analysis} />
          </div>
        )}

        {activeTab === 'risk' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🛡️ Investment Risk Analysis
              </h2>
              <p className="text-gray-600">
                Comprehensive risk assessment covering financial, market, operational, and liquidity risks.
                Understand the downsides and get actionable mitigation strategies.
              </p>
            </div>
            <RiskDashboard inputs={inputs} analysis={analysis} />
          </div>
        )}

        {activeTab === 'tax' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🏦 Canadian Tax Impact
              </h2>
              <p className="text-gray-600">
                Comprehensive tax analysis including federal + provincial income tax, rental
                deductions, CCA depreciation, and capital gains. See your real after-tax returns.
              </p>
            </div>
            <TaxImpactDisplay analysis={analysis} inputs={inputs} />
          </div>
        )}

        {activeTab === 'airbnb' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🏠 Airbnb/STR Analysis
              </h2>
              <p className="text-gray-600">
                Compare short-term rental potential vs long-term rental. Model occupancy, ADR,
                seasonal variations, and see if Airbnb makes sense for this property.
              </p>
            </div>
            <AirbnbAnalysisDisplay inputs={inputs} analysis={analysis} />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/deals/${dealId}`}>
            <Button variant="outline">
              Back to Deal
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Analyzing: {deal.address}
            </span>
            <Link href="/analyze">
              <Button>
                Analyze New Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
