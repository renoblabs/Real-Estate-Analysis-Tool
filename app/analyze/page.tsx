'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { saveDeal } from '@/lib/database';
import { checkAuthWithDemo, shouldSkipDatabaseOperations } from '@/lib/auth-utils';
import { toast } from 'sonner';
import type { PropertyInputs, DealAnalysis, MultiFamilyInputs, MultiFamilyAnalysis, SmallMultifamilyInputs, SmallMultifamilyAnalysis, AnalysisType } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { PropertyDetailsForm } from '@/components/forms/PropertyDetailsForm';
import { PurchaseFinancingForm } from '@/components/forms/PurchaseFinancingForm';
import { RevenueForm } from '@/components/forms/RevenueForm';
import { ExpensesForm } from '@/components/forms/ExpensesForm';
import { MultiFamilyDevelopmentForm } from '@/components/forms/MultiFamilyDevelopmentForm';
import { SmallMultifamilyForm } from '@/components/forms/SmallMultifamilyForm';
import { AnalysisResultsCard } from '@/components/analysis/AnalysisResultsCard';
import { MultiFamilyResultsCard } from '@/components/analysis/MultiFamilyResultsCard';
import { SmallMultifamilyResultsCard } from '@/components/analysis/SmallMultifamilyResultsCard';
import DealSourcingDashboard from '@/components/analysis/DealSourcingDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DealAnalysis | MultiFamilyAnalysis | SmallMultifamilyAnalysis | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('rental');
  const [mlsUrl, setMlsUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState<Partial<PropertyInputs | MultiFamilyInputs | SmallMultifamilyInputs>>({
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

  // Initialize form data based on analysis type
  useEffect(() => {
    if (analysisType === 'small_multifamily') {
      setFormData(prev => ({
        ...prev,
        analysis_type: 'small_multifamily',
        target_unit_count: 2,
        development_approach: 'raw_land',
        planned_units: [],
        local_rent_comparables: [],
        market_vacancy_rate: 5.0,
        estimated_completion_months: 12
      }));
    }
  }, [analysisType]);

  const checkAuth = async () => {
    try {
      const { user, isDemo } = await checkAuthWithDemo();

      if (!user && !isDemo) {
        router.push('/login');
      } else {
        setUser(user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMLSImport = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mlsUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import listing');
      }

      const data = await response.json();

      // Auto-fill form with scraped data
      setFormData(prev => ({
        ...prev,
        ...data,
        // Calculate down payment amount if we have price and percent
        down_payment_amount: data.purchase_price ? Math.round((data.purchase_price * 0.20) * 100) / 100 : prev.down_payment_amount
      }));

      toast.success('Property details imported successfully!');
      setMlsUrl(''); // Clear URL input
    } catch (error: any) {
      toast.error(error.message || 'Failed to import listing');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleInputChange = (field: keyof PropertyInputs, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate down payment amount when percent changes
      if (field === 'down_payment_percent' && updated.purchase_price) {
        updated.down_payment_amount = Math.round((updated.purchase_price * (value / 100)) * 100) / 100;
      }

      // Auto-calculate down payment percent when amount changes
      if (field === 'down_payment_amount' && updated.purchase_price) {
        updated.down_payment_percent = Math.round(((value / updated.purchase_price) * 100) * 100) / 100;
      }

      return updated;
    });
  };

  const handleAnalyze = async () => {
    if (!formData.address || !formData.city) {
      toast.error('Please fill in property address and city');
      return;
    }

    // Validate multi-family specific requirements
    if (analysisType === 'multifamily_development') {
      const mfData = formData as Partial<MultiFamilyInputs>;
      if (!mfData.target_units || mfData.target_units.length === 0) {
        toast.error('Please add at least one unit configuration');
        return;
      }
    }

    // Validate small multi-family specific requirements
    if (analysisType === 'small_multifamily') {
      const smfData = formData as Partial<SmallMultifamilyInputs>;
      if (!smfData.planned_units || smfData.planned_units.length === 0) {
        toast.error('Please add at least one unit configuration');
        return;
      }
      if (!smfData.development_approach) {
        toast.error('Please select a development approach');
        return;
      }
      if (!smfData.target_unit_count) {
        toast.error('Please select target unit count');
        return;
      }
    }

    setAnalyzing(true);
    try {
      const analysisData = {
        ...formData,
        analysis_type: analysisType
      } as PropertyInputs | MultiFamilyInputs | SmallMultifamilyInputs;

      const result = await analyzeDeal(analysisData);
      setAnalysis(result);

      // Save to database (skip in demo mode)
      if (user && !shouldSkipDatabaseOperations()) {
        await saveDeal(user.id, result, 'analyzing');
        toast.success('Deal analyzed and saved successfully!');
      } else if (user) {
        toast.success('Deal analyzed successfully! (Demo mode - not saved)');
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
            {/* MLS URL Auto-Fill */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start - Import from MLS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Paste Realtor.ca listing URL here..."
                    value={mlsUrl}
                    onChange={(e) => setMlsUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleMLSImport}
                    disabled={!mlsUrl || importing}
                  >
                    {importing ? 'Importing...' : 'Auto-Fill'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: Realtor.ca, Zillow, Redfin
                </p>
              </CardContent>
            </Card>

            {/* Analysis Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="analysis_type">Select Analysis Type</Label>
                    <Select
                      value={analysisType}
                      onValueChange={(value: AnalysisType) => {
                        setAnalysisType(value);
                        setAnalysis(null); // Clear previous analysis
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental">Rental Property Analysis</SelectItem>
                        <SelectItem value="small_multifamily">Small Multifamily (1-4 Units)</SelectItem>
                        <SelectItem value="multifamily_development">Multi-Family Development</SelectItem>
                        <SelectItem value="deal_sourcing">Deal Sourcing & Investment Engine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Content Based on Analysis Type */}
            {analysisType === 'deal_sourcing' ? (
              <DealSourcingDashboard
                onAnalyzeProperty={(criteria) => {
                  // Handle property analysis with criteria
                  console.log('Analyzing property with criteria:', criteria);
                }}
              />
            ) : (
              <>
                {/* Common Property Details */}
                <PropertyDetailsForm formData={formData} onInputChange={handleInputChange} />

                {/* Conditional Forms Based on Analysis Type */}
                {analysisType === 'rental' ? (
                  <>
                    <PurchaseFinancingForm formData={formData} onInputChange={handleInputChange} />
                    <RevenueForm formData={formData} onInputChange={handleInputChange} />
                    <ExpensesForm formData={formData} onInputChange={handleInputChange} />
                  </>
                ) : analysisType === 'small_multifamily' ? (
                  <SmallMultifamilyForm
                    formData={formData as Partial<SmallMultifamilyInputs>}
                    onChange={(data) => setFormData(data)}
                  />
                ) : (
                  <MultiFamilyDevelopmentForm
                    formData={formData as Partial<MultiFamilyInputs>}
                    onChange={(data) => setFormData(data)}
                  />
                )}

                {/* Analyze Button */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    size="lg"
                    className="flex-1"
                  >
                    {analyzing ? 'Analyzing...' : `Analyze ${analysisType === 'rental' ? 'Rental Property' :
                      analysisType === 'small_multifamily' ? 'Small Multifamily' :
                        'Development'
                      }`}
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">Cancel</Button>
                  </Link>
                </div>

                {/* Analysis Results */}
                {analysis && (
                  analysisType === 'rental' ? (
                    <AnalysisResultsCard analysis={analysis as DealAnalysis} />
                  ) : analysisType === 'small_multifamily' ? (
                    <SmallMultifamilyResultsCard analysis={analysis as SmallMultifamilyAnalysis} />
                  ) : (
                    <MultiFamilyResultsCard analysis={analysis as MultiFamilyAnalysis} />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
