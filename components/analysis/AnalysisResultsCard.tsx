import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle2, Target, Home, ArrowRight } from 'lucide-react';
import type { DealAnalysis } from '@/types';
import { quickAduCheck } from '@/lib/adu-signal-detector';

interface AnalysisResultsCardProps {
  analysis: DealAnalysis;
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A+':
    case 'A': return 'bg-green-500';
    case 'B+':
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-orange-500';
    case 'F': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function getAcreRecommendationStyle(recommendation: string) {
  if (recommendation.startsWith('STRONG BUY')) {
    return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle2 };
  } else if (recommendation.startsWith('CONSIDER')) {
    return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: TrendingUp };
  } else if (recommendation.startsWith('CAUTION')) {
    return { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle };
  } else {
    return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertTriangle };
  }
}

export function AnalysisResultsCard({ analysis }: AnalysisResultsCardProps) {
  const router = useRouter();
  
  // Check for ADU potential
  const aduCheck = quickAduCheck({
    address: analysis.property.address,
    city: analysis.property.city,
    province: analysis.property.province,
    property_type: analysis.property.property_type,
    bedrooms: analysis.property.bedrooms,
    bathrooms: analysis.property.bathrooms,
    square_feet: analysis.property.square_feet,
    purchase_price: analysis.property.purchase_price,
    down_payment_percent: 20,
    down_payment_amount: analysis.property.purchase_price * 0.2,
    interest_rate: 5.5,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'move_in_ready',
    renovation_cost: 0,
    monthly_rent: analysis.revenue.monthly_rent,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: analysis.expenses.property_tax,
    insurance_annual: analysis.expenses.insurance,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0,
    lot_size: analysis.property.lot_size
  });

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>{analysis.property.address}</CardDescription>
          </div>
          <Badge className={`text-lg px-4 py-2 ${getGradeColor(analysis.scoring.grade)}`}>
            Grade: {analysis.scoring.grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</h3>
            <p className={`text-2xl font-bold mt-2 ${analysis.cash_flow.monthly_cash_flow < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${analysis.cash_flow.monthly_cash_flow.toFixed(2)}
            </p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="text-sm font-medium text-muted-foreground">Cash-on-Cash Return</h3>
            <p className="text-2xl font-bold mt-2">
              {analysis.metrics.cash_on_cash_return.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="text-sm font-medium text-muted-foreground">Cap Rate</h3>
            <p className="text-2xl font-bold mt-2">
              {analysis.metrics.cap_rate.toFixed(1)}%
            </p>
          </div>
          {analysis.acre_score && (
            <div className="p-4 border rounded bg-gradient-to-br from-purple-50 to-indigo-50">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-4 w-4" /> ACRE™ Score
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold">{analysis.acre_score.totalScore}</p>
                <Badge className={getGradeColor(analysis.acre_score.grade)}>
                  {analysis.acre_score.grade}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* ACRE Score Details */}
        {analysis.acre_score && (
          <div className={`p-4 rounded-lg border mb-6 ${getAcreRecommendationStyle(analysis.acre_score.recommendation).bg}`}>
            <div className="flex items-start gap-3">
              {(() => {
                const style = getAcreRecommendationStyle(analysis.acre_score.recommendation);
                const Icon = style.icon;
                return <Icon className={`h-5 w-5 mt-0.5 ${style.text}`} />;
              })()}
              <div className="flex-1">
                <h4 className={`font-semibold ${getAcreRecommendationStyle(analysis.acre_score.recommendation).text}`}>
                  {analysis.acre_score.recommendation.split(' - ')[0]}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.acre_score.recommendation.split(' - ')[1]}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cash Flow:</span>
                    <span className="font-medium ml-1">{analysis.acre_score.breakdown.cashFlowScore}/40</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium ml-1">{analysis.acre_score.breakdown.locationScore}/30</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Appreciation:</span>
                    <span className="font-medium ml-1">{analysis.acre_score.breakdown.appreciationScore}/20</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk:</span>
                    <span className="font-medium ml-1">{analysis.acre_score.breakdown.riskScore}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADU Potential Indicator */}
        {aduCheck.hasHighPotential && (
          <div className="p-4 rounded-lg border mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 mt-0.5 text-orange-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-orange-700">ADU Opportunity Detected</h4>
                  <Link href="/analyze/adu">
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-100">
                      Analyze ADU <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {aduCheck.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Deal Score: {analysis.scoring.total_score}/100</h3>
            <ul className="space-y-1 text-sm">
              {analysis.scoring.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {analysis.warnings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-orange-600">Warnings:</h3>
              <ul className="space-y-1 text-sm">
                {analysis.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">CMHC Premium:</span> ${analysis.financing.cmhc_premium.toFixed(2)}</p>
              <p><span className="font-medium">Land Transfer Tax:</span> ${analysis.acquisition.land_transfer_tax.toFixed(2)}</p>
              <p><span className="font-medium">Total Acquisition Cost:</span> ${analysis.acquisition.total_acquisition_cost.toFixed(2)}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Monthly Mortgage:</span> ${analysis.financing.monthly_payment.toFixed(2)}</p>
              <p><span className="font-medium">DSCR:</span> {analysis.metrics.dscr.toFixed(2)}</p>
              <p><span className="font-medium">Stress Test Rate:</span> {analysis.financing.stress_test_rate.toFixed(2)}%</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
