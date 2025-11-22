import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { DealAnalysis } from '@/types';

interface AnalysisResultsCardProps {
  analysis: DealAnalysis;
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-orange-500';
    case 'F': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export function AnalysisResultsCard({ analysis }: AnalysisResultsCardProps) {
  const router = useRouter();

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
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 border rounded">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Cash Flow</h3>
            <p className="text-2xl font-bold mt-2">
              ${analysis.cash_flow.monthly_net.toFixed(2)}
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
        </div>

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
