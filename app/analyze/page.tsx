'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { saveDeal } from '@/lib/database';
import { toast } from 'sonner';
import type { PropertyInputs, DealAnalysis } from '@/types';

export default function AnalyzePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analyze New Deal</h1>
            <p className="text-muted-foreground mt-2">
              Complete Canadian real estate analysis with CMHC, LTT, and stress tests
            </p>
          </div>

          <div className="grid gap-8">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Basic information about the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Toronto"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <select
                      id="province"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value as any)}
                    >
                      <option value="ON">Ontario</option>
                      <option value="BC">British Columbia</option>
                      <option value="AB">Alberta</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="QC">Quebec</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <select
                      id="property_type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.property_type}
                      onChange={(e) => handleInputChange('property_type', e.target.value as any)}
                    >
                      <option value="single_family">Single Family</option>
                      <option value="duplex">Duplex</option>
                      <option value="triplex">Triplex</option>
                      <option value="fourplex">Fourplex</option>
                      <option value="multi_unit_5plus">5+ Units</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="square_feet">Square Feet</Label>
                    <Input
                      id="square_feet"
                      type="number"
                      value={formData.square_feet}
                      onChange={(e) => handleInputChange('square_feet', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase & Financing</CardTitle>
                <CardDescription>Purchase price and mortgage details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase_price">Purchase Price ($)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="down_payment_percent">Down Payment (%)</Label>
                    <Input
                      id="down_payment_percent"
                      type="number"
                      step="0.1"
                      value={formData.down_payment_percent}
                      onChange={(e) => handleInputChange('down_payment_percent', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ${formData.down_payment_amount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate}
                      onChange={(e) => handleInputChange('interest_rate', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amortization_years">Amortization (years)</Label>
                    <Input
                      id="amortization_years"
                      type="number"
                      value={formData.amortization_years}
                      onChange={(e) => handleInputChange('amortization_years', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <select
                      id="strategy"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.strategy}
                      onChange={(e) => handleInputChange('strategy', e.target.value as any)}
                    >
                      <option value="buy_hold">Buy & Hold</option>
                      <option value="brrrr">BRRRR</option>
                      <option value="fix_flip">Fix & Flip</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="property_condition">Condition</Label>
                    <select
                      id="property_condition"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.property_condition}
                      onChange={(e) => handleInputChange('property_condition', e.target.value as any)}
                    >
                      <option value="move_in_ready">Move-in Ready</option>
                      <option value="cosmetic">Cosmetic</option>
                      <option value="moderate_reno">Moderate Reno</option>
                      <option value="heavy_reno">Heavy Reno</option>
                      <option value="gut_job">Gut Job</option>
                    </select>
                  </div>
                </div>

                {formData.strategy === 'brrrr' && (
                  <div>
                    <Label htmlFor="after_repair_value">After Repair Value ($)</Label>
                    <Input
                      id="after_repair_value"
                      type="number"
                      value={formData.after_repair_value || ''}
                      onChange={(e) => handleInputChange('after_repair_value', parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Monthly income projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="monthly_rent">Monthly Rent ($)</Label>
                    <Input
                      id="monthly_rent"
                      type="number"
                      value={formData.monthly_rent}
                      onChange={(e) => handleInputChange('monthly_rent', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="other_income">Other Income ($)</Label>
                    <Input
                      id="other_income"
                      type="number"
                      value={formData.other_income}
                      onChange={(e) => handleInputChange('other_income', parseFloat(e.target.value))}
                      placeholder="Parking, laundry, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="vacancy_rate">Vacancy Rate (%)</Label>
                    <Input
                      id="vacancy_rate"
                      type="number"
                      step="0.1"
                      value={formData.vacancy_rate}
                      onChange={(e) => handleInputChange('vacancy_rate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Expenses</CardTitle>
                <CardDescription>Annual and monthly costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_tax_annual">Property Tax (Annual $)</Label>
                    <Input
                      id="property_tax_annual"
                      type="number"
                      value={formData.property_tax_annual}
                      onChange={(e) => handleInputChange('property_tax_annual', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance_annual">Insurance (Annual $)</Label>
                    <Input
                      id="insurance_annual"
                      type="number"
                      value={formData.insurance_annual}
                      onChange={(e) => handleInputChange('insurance_annual', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_management_percent">Property Management (%)</Label>
                    <Input
                      id="property_management_percent"
                      type="number"
                      step="0.1"
                      value={formData.property_management_percent}
                      onChange={(e) => handleInputChange('property_management_percent', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance_percent">Maintenance Reserve (%)</Label>
                    <Input
                      id="maintenance_percent"
                      type="number"
                      step="0.1"
                      value={formData.maintenance_percent}
                      onChange={(e) => handleInputChange('maintenance_percent', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="utilities_monthly">Utilities (Monthly $)</Label>
                    <Input
                      id="utilities_monthly"
                      type="number"
                      value={formData.utilities_monthly}
                      onChange={(e) => handleInputChange('utilities_monthly', parseFloat(e.target.value))}
                      placeholder="If owner-paid"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoa_condo_fees_monthly">HOA/Condo Fees (Monthly $)</Label>
                    <Input
                      id="hoa_condo_fees_monthly"
                      type="number"
                      value={formData.hoa_condo_fees_monthly}
                      onChange={(e) => handleInputChange('hoa_condo_fees_monthly', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
            {analysis && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
