'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { getDeal } from '@/lib/database';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { toast } from 'sonner';
import type { Deal, DealAnalysis, PropertyInputs } from '@/types';
import { CashFlowProjectionChart } from '@/components/charts/cash-flow-projection-chart';
import { DealMetricsChart } from '@/components/charts/deal-metrics-chart';

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await getDeal(dealId);
      if (error) throw error;
      if (!data) throw new Error('Deal not found');

      setDeal(data);

      // Reconstruct the analysis from saved deal data
      const inputs: PropertyInputs = {
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

      const analysisResult = analyzeDeal(inputs);
      setAnalysis(analysisResult);
    } catch (error: any) {
      toast.error('Failed to load deal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-yellow-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading || !analysis || !deal) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <main className="container py-8">
          <Skeleton className="h-12 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">REI OPS™</span>
            <Badge variant="outline">🇨🇦</Badge>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/deals">
              <Button variant="ghost" size="sm">All Deals</Button>
            </Link>
            <Link href={`/analyze?edit=${dealId}`}>
              <Button size="sm" variant="outline">Edit</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{deal.address}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {deal.city}, {deal.province} • {deal.property_type.replace(/_/g, ' ')}
              </p>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getGradeColor(analysis.scoring.grade)}`}>
              Grade: {analysis.scoring.grade}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Cash Flow</CardDescription>
              <CardTitle className={`text-2xl ${analysis.cash_flow.monthly_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(analysis.cash_flow.monthly_net)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cash-on-Cash Return</CardDescription>
              <CardTitle className="text-2xl">
                {analysis.metrics.cash_on_cash_return.toFixed(2)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cap Rate</CardDescription>
              <CardTitle className="text-2xl">
                {analysis.metrics.cap_rate.toFixed(2)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Deal Score</CardDescription>
              <CardTitle className="text-2xl">
                {analysis.scoring.total_score}/100
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Deal Scoring */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deal Analysis</CardTitle>
            <CardDescription>Score breakdown and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.scoring.reasons.map((reason, idx) => (
                <p key={idx} className="text-sm">{reason}</p>
              ))}
            </div>
            {analysis.warnings.length > 0 && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
                <h3 className="font-semibold text-orange-800 mb-2">Warnings:</h3>
                <ul className="space-y-1 text-sm text-orange-700">
                  {analysis.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acquisition Costs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acquisition Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.purchase_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down Payment ({deal.down_payment_percent}%):</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.down_payment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Land Transfer Tax:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.land_transfer_tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legal Fees:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.legal_fees)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inspection:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.inspection)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appraisal:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.appraisal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Closing Costs:</span>
                  <span className="font-medium">{formatCurrency(analysis.acquisition.other_closing_costs)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total Acquisition Cost:</span>
                  <span className="font-bold">{formatCurrency(analysis.acquisition.total_acquisition_cost)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Financing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mortgage Amount:</span>
                  <span className="font-medium">{formatCurrency(analysis.financing.mortgage_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CMHC Premium:</span>
                  <span className="font-medium">{formatCurrency(analysis.financing.cmhc_premium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Mortgage:</span>
                  <span className="font-medium">{formatCurrency(analysis.financing.total_mortgage_with_insurance)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span className="font-medium">{formatCurrency(analysis.financing.monthly_payment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stress Test Rate:</span>
                  <span className="font-medium">{analysis.financing.stress_test_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stress Test Payment:</span>
                  <span className="font-medium">{formatCurrency(analysis.financing.stress_test_payment)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue & Expenses */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Rent:</span>
                <span className="font-medium">{formatCurrency(analysis.revenue.gross_monthly_rent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other Income:</span>
                <span className="font-medium">{formatCurrency(analysis.revenue.other_monthly_income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vacancy Loss ({deal.vacancy_rate}%):</span>
                <span className="font-medium text-red-600">-{formatCurrency(analysis.revenue.vacancy_loss_monthly)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Effective Monthly Income:</span>
                <span>{formatCurrency(analysis.revenue.effective_monthly_income)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mortgage:</span>
                <span className="font-medium">{formatCurrency(analysis.expenses.monthly.mortgage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Tax:</span>
                <span className="font-medium">{formatCurrency(analysis.expenses.monthly.property_tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance:</span>
                <span className="font-medium">{formatCurrency(analysis.expenses.monthly.insurance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Management:</span>
                <span className="font-medium">{formatCurrency(analysis.expenses.monthly.property_management)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance:</span>
                <span className="font-medium">{formatCurrency(analysis.expenses.monthly.maintenance)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total Expenses:</span>
                <span>{formatCurrency(analysis.expenses.monthly.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investment Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DSCR:</span>
                  <span className="font-medium">{analysis.metrics.dscr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GRM:</span>
                  <span className="font-medium">{analysis.metrics.grm.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expense Ratio:</span>
                  <span className="font-medium">{analysis.metrics.expense_ratio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Breakeven Occupancy:</span>
                  <span className="font-medium">{analysis.metrics.breakeven_occupancy.toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual NOI:</span>
                  <span className="font-medium">{formatCurrency(analysis.cash_flow.annual_noi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Cash Flow:</span>
                  <span className="font-medium">{formatCurrency(analysis.cash_flow.annual_net)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BRRRR Analysis if applicable */}
        {analysis.brrrr && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>BRRRR Strategy Analysis</CardTitle>
              <CardDescription>Buy, Rehab, Rent, Refinance, Repeat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Investment:</span>
                    <span className="font-medium">{formatCurrency(analysis.brrrr.total_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After Repair Value:</span>
                    <span className="font-medium">{formatCurrency(analysis.brrrr.after_repair_value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refinance Amount (75% LTV):</span>
                    <span className="font-medium">{formatCurrency(analysis.brrrr.refinance_amount)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Recovered:</span>
                    <span className="font-medium">{formatCurrency(analysis.brrrr.cash_recovered)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Left in Deal:</span>
                    <span className="font-medium">{formatCurrency(analysis.brrrr.cash_left_in_deal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Infinite Return:</span>
                    <Badge variant={analysis.brrrr.infinite_return ? 'success' : 'secondary'}>
                      {analysis.brrrr.infinite_return ? 'YES' : 'NO'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash Flow Projection Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>10-Year Cash Flow Projection</CardTitle>
            <CardDescription>
              Projected cash flow, equity growth, and property value over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowProjectionChart
              analysis={analysis}
              years={10}
              appreciationRate={3.0}
              rentGrowthRate={2.5}
            />
          </CardContent>
        </Card>

        {/* Deal Metrics Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deal Metrics Comparison</CardTitle>
            <CardDescription>
              Your deal metrics vs market benchmarks and targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DealMetricsChart analysis={analysis} type="bar" />
          </CardContent>
        </Card>

        {/* Radar Chart Alternative */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deal Performance Radar</CardTitle>
            <CardDescription>
              Visual comparison of key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DealMetricsChart analysis={analysis} type="radar" />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/deals">
            <Button variant="outline">Back to All Deals</Button>
          </Link>
          <Link href={`/analyze?edit=${dealId}`}>
            <Button>Edit Deal</Button>
          </Link>
          <Button variant="outline" onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </main>
    </div>
  );
}
