'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Deal, PropertyInputs } from '@/types';
import { analyzeDeal } from '@/lib/deal-analyzer';
import { ChevronDown, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';

// Helper function to convert Deal to PropertyInputs
function dealToPropertyInputs(deal: Deal): PropertyInputs {
  return {
    address: deal.address,
    city: deal.city,
    province: deal.province,
    postal_code: deal.postal_code,
    property_type: deal.property_type,
    bedrooms: deal.bedrooms,
    bathrooms: deal.bathrooms,
    square_feet: deal.square_feet,
    year_built: deal.year_built,
    lot_size: deal.lot_size,
    purchase_price: deal.purchase_price,
    down_payment_percent: deal.down_payment_percent,
    down_payment_amount: deal.down_payment_amount,
    interest_rate: deal.interest_rate,
    amortization_years: deal.amortization_years,
    strategy: deal.strategy,
    property_condition: deal.property_condition,
    renovation_cost: deal.renovation_cost,
    after_repair_value: deal.after_repair_value,
    monthly_rent: deal.monthly_rent,
    other_income: deal.other_income,
    vacancy_rate: deal.vacancy_rate,
    property_tax_annual: deal.property_tax_annual,
    insurance_annual: deal.insurance_annual,
    property_management_percent: deal.property_management_percent,
    maintenance_percent: deal.maintenance_percent,
    utilities_monthly: deal.utilities_monthly,
    hoa_condo_fees_monthly: deal.hoa_fees_monthly,
    other_expenses_monthly: deal.other_expenses_monthly,
  };
}

export default function ComparePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [comparisonDeals, setComparisonDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    // Update comparison deals when selection changes
    const selected = deals.filter((deal) => selectedDealIds.includes(deal.id));
    setComparisonDeals(selected);
  }, [selectedDealIds, deals]);

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

  function toggleDeal(dealId: string) {
    setSelectedDealIds((prev) => {
      if (prev.includes(dealId)) {
        return prev.filter((id) => id !== dealId);
      } else if (prev.length < 3) {
        return [...prev, dealId];
      }
      return prev;
    });
  }

  // Comparison metrics
  const comparisonMetrics = comparisonDeals.map((deal) => {
    const propertyInputs = dealToPropertyInputs(deal);
    const analysis = analyzeDeal(propertyInputs);
    return {
      deal,
      analysis,
    };
  });

  const ComparisonIndicator = ({ value1, value2, higherIsBetter = true }: { value1: number; value2: number; higherIsBetter?: boolean }) => {
    if (Math.abs(value1 - value2) < 0.01) {
      return <Minus className="w-4 h-4 text-gray-400 inline-block ml-1" />;
    }

    const isBetter = higherIsBetter ? value1 > value2 : value1 < value2;
    return isBetter ? (
      <TrendingUp className="w-4 h-4 text-green-600 inline-block ml-1" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600 inline-block ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
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
              onClick={() => router.push('/deals')}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Deals</h1>
              <p className="text-gray-600 mt-1">
                Select up to 3 deals to compare side-by-side
              </p>
            </div>
          </div>
        </div>

        {/* Deal Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Select Deals to Compare ({selectedDealIds.length}/3)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => {
              const isSelected = selectedDealIds.includes(deal.id);
              return (
                <button
                  key={deal.id}
                  onClick={() => toggleDeal(deal.id)}
                  disabled={!isSelected && selectedDealIds.length >= 3}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : selectedDealIds.length >= 3
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {deal.address}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {deal.city}, {deal.province}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ${deal.purchase_price.toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        {comparisonDeals.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Metric
                    </th>
                    {comparisonMetrics.map((item, idx) => (
                      <th
                        key={item.deal.id}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                      >
                        <div className="flex flex-col">
                          <span className="text-blue-600">Deal {idx + 1}</span>
                          <span className="font-normal text-xs text-gray-600 mt-1">
                            {item.deal.address}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Property Info */}
                  <tr className="bg-blue-50">
                    <td colSpan={comparisonDeals.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50 z-10">
                      Property Information
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Purchase Price
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                        ${item.analysis.acquisition.purchase_price.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Property Type
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                        {item.analysis.property.property_type}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Location
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                        {item.analysis.property.city}, {item.analysis.property.province}
                      </td>
                    ))}
                  </tr>

                  {/* Financial Metrics */}
                  <tr className="bg-blue-50">
                    <td colSpan={comparisonDeals.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50 z-10">
                      Key Metrics
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Monthly Cash Flow
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.cash_flow.monthly_net;
                      const isPositive = value > 0;
                      return (
                        <td key={item.deal.id} className={`px-6 py-4 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          ${value.toLocaleString()}
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.cash_flow.monthly_net}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Cap Rate
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.metrics.cap_rate;
                      return (
                        <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                          {value.toFixed(2)}%
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.metrics.cap_rate}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Cash-on-Cash Return
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.metrics.cash_on_cash_return;
                      const isPositive = value > 0;
                      return (
                        <td key={item.deal.id} className={`px-6 py-4 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {value.toFixed(2)}%
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.metrics.cash_on_cash_return}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      DSCR
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.metrics.dscr;
                      const isHealthy = value >= 1.25;
                      return (
                        <td key={item.deal.id} className={`px-6 py-4 text-sm ${isHealthy ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                          {value.toFixed(2)}
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.metrics.dscr}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Deal Score
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const score = item.analysis.scoring;
                      return (
                        <td key={item.deal.id} className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            score.grade === 'A' ? 'bg-green-100 text-green-800' :
                            score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            score.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            score.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {score.grade} ({score.total_score}/100)
                          </span>
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={score.total_score}
                              value2={comparisonMetrics[0].analysis.scoring.total_score}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Investment Details */}
                  <tr className="bg-blue-50">
                    <td colSpan={comparisonDeals.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 sticky left-0 bg-blue-50 z-10">
                      Investment Details
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Down Payment
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                        ${item.analysis.acquisition.down_payment.toLocaleString()} ({item.deal.down_payment_percent}%)
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Total Cash Needed
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.acquisition.total_acquisition_cost;
                      return (
                        <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                          ${value.toLocaleString()}
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.acquisition.total_acquisition_cost}
                              higherIsBetter={false}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Monthly Rent
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                        ${item.analysis.revenue.gross_monthly_rent.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                      Mortgage Payment
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.financing.monthly_payment;
                      return (
                        <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                          ${value.toLocaleString()}
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.financing.monthly_payment}
                              higherIsBetter={false}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      Total Monthly Expenses
                    </td>
                    {comparisonMetrics.map((item, idx) => {
                      const value = item.analysis.expenses.total_annual_expenses / 12;
                      return (
                        <td key={item.deal.id} className="px-6 py-4 text-sm text-gray-700">
                          ${value.toLocaleString()}
                          {idx > 0 && (
                            <ComparisonIndicator
                              value1={value}
                              value2={comparisonMetrics[0].analysis.expenses.total_annual_expenses / 12}
                              higherIsBetter={false}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {comparisonDeals.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ChevronDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Select deals above to start comparing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
