'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { saveDeal } from '@/lib/database';
import { toast } from 'sonner';
import type { PropertyInputs, DealAnalysis } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { PropertyDetailsForm } from '@/components/forms/PropertyDetailsForm';
import { PurchaseFinancingForm } from '@/components/forms/PurchaseFinancingForm';
import { RevenueForm } from '@/components/forms/RevenueForm';
import { ExpensesForm } from '@/components/forms/ExpensesForm';
import { AnalysisResultsCard } from '@/components/analysis/AnalysisResultsCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);

  const [formData, setFormData] = useState<Partial<PropertyInputs>>({
    address: '',
    city: '',
    province: 'ON',
    property_type: 'single_family',
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1500,
    year_built: 2010,
    purchase_price: 500000,
    down_payment_percent: 20,
    down_payment_amount: 100000,
    interest_rate: 5.5,
    amortization_years: 25,
    strategy: 'buy_hold',
    property_condition: 'move_in_ready',
    renovation_cost: 0,
    monthly_rent: 2500,
    other_income: 0,
    vacancy_rate: 5,
    property_tax_annual: 4500,
    insurance_annual: 1200,
    property_management_percent: 8,
    maintenance_percent: 10,
    utilities_monthly: 0,
    hoa_condo_fees_monthly: 0,
    other_expenses_monthly: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PropertyInputs, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate down payment amount when percent changes
      if (field === 'down_payment_percent' && updated.purchase_price) {
        updated.down_payment_amount = (updated.purchase_price * (value / 100));
      }

      // Auto-calculate down payment percent when amount changes
      if (field === 'down_payment_amount' && updated.purchase_price) {
        updated.down_payment_percent = (value / updated.purchase_price) * 100;
      }

      return updated;
    });
  };

  const handleAnalyze = async () => {
    if (!formData.address || !formData.city) {
      toast.error('Please fill in property address and city');
      return;
    }

    setAnalyzing(true);
    try {
      const result = analyzeDeal(formData as PropertyInputs);
      setAnalysis(result);

      // Save to database
      if (user) {
        await saveDeal(user.id, result, 'analyzing');
        toast.success('Deal analyzed successfully!');
      }
    } catch (error: any) {
      toast.error('Error analyzing deal: ' + (error.message || 'Please try again'));
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader />
        <main className="container py-8">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analyze New Deal</h1>
            <p className="text-muted-foreground mt-2">
              Complete Canadian real estate analysis with CMHC, LTT, and stress tests
            </p>
          </div>

          <div className="grid gap-8">
            <PropertyDetailsForm formData={formData} onInputChange={handleInputChange} />
            <PurchaseFinancingForm formData={formData} onInputChange={handleInputChange} />
            <RevenueForm formData={formData} onInputChange={handleInputChange} />
            <ExpensesForm formData={formData} onInputChange={handleInputChange} />

            {/* Analyze Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                size="lg"
                className="flex-1"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Deal'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>

            {/* Analysis Results */}
            {analysis && <AnalysisResultsCard analysis={analysis} />}
          </div>
        </div>
      </main>
    </div>
  );
}
