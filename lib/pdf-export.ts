import { jsPDF } from 'jspdf';
import type { DealAnalysis } from '@/types';

export function generateDealPDF(analysis: DealAnalysis): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Helper functions
  const addTitle = (text: string, size: number = 16) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, yPos);
    yPos += size / 2 + 5;
  };

  const addText = (label: string, value: string, bold: boolean = false) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(`${label}: ${value}`, margin, yPos);
    yPos += 6;
  };

  const addSection = (title: string) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    yPos += 8;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REI OPS™ - Deal Analysis Report', margin, 20);
  doc.setTextColor(0, 0, 0);
  yPos = 45;

  // Property Information
  addSection('Property Information');
  addText('Address', analysis.property.address);
  addText('City', `${analysis.property.city}, ${analysis.property.province}`);
  addText('Property Type', analysis.property.property_type.replace(/_/g, ' '));
  addText('Size', `${analysis.property.bedrooms} bed, ${analysis.property.bathrooms} bath, ${analysis.property.square_feet} sqft`);
  addText('Strategy', analysis.property.strategy.toUpperCase());

  // Deal Grade
  yPos += 5;
  doc.setFillColor(
    analysis.scoring.grade === 'A' ? 34 :
    analysis.scoring.grade === 'B' ? 59 :
    analysis.scoring.grade === 'C' ? 250 :
    analysis.scoring.grade === 'D' ? 249 : 239,
    analysis.scoring.grade === 'A' ? 197 :
    analysis.scoring.grade === 'B' ? 130 :
    analysis.scoring.grade === 'C' ? 204 :
    analysis.scoring.grade === 'D' ? 115 : 68,
    analysis.scoring.grade === 'A' ? 94 :
    analysis.scoring.grade === 'B' ? 246 :
    analysis.scoring.grade === 'C' ? 50 :
    analysis.scoring.grade === 'D' ? 22 : 68
  );
  doc.rect(margin, yPos, 60, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Grade: ${analysis.scoring.grade}`, margin + 5, yPos + 10);
  doc.text(`${analysis.scoring.total_score}/100`, margin + 35, yPos + 10);
  doc.setTextColor(0, 0, 0);
  yPos += 20;

  // Key Metrics
  addSection('Key Metrics');
  addText('Monthly Cash Flow', formatCurrency(analysis.cash_flow.monthly_cash_flow), true);
  addText('Annual Cash Flow', formatCurrency(analysis.cash_flow.annual_cash_flow));
  addText('Cash-on-Cash Return', `${analysis.metrics.cash_on_cash_return.toFixed(2)}%`, true);
  addText('Cap Rate', `${analysis.metrics.cap_rate.toFixed(2)}%`, true);
  addText('DSCR', analysis.metrics.dscr.toFixed(2));
  addText('GRM', analysis.metrics.grm.toFixed(2));

  // Acquisition Costs
  addSection('Acquisition Costs');
  addText('Purchase Price', formatCurrency(analysis.acquisition.purchase_price));
  addText('Down Payment', formatCurrency(analysis.acquisition.down_payment));
  addText('Land Transfer Tax', formatCurrency(analysis.acquisition.land_transfer_tax));
  addText('Legal Fees', formatCurrency(analysis.acquisition.legal_fees));
  addText('Closing Costs', formatCurrency(
    analysis.acquisition.inspection + analysis.acquisition.appraisal + analysis.acquisition.other_closing_costs
  ));
  addText('Total Acquisition Cost', formatCurrency(analysis.acquisition.total_acquisition_cost), true);

  // Check if new page needed
  if (yPos > 230) {
    doc.addPage();
    yPos = margin;
  }

  // Financing
  addSection('Financing Details');
  addText('Mortgage Amount', formatCurrency(analysis.financing.mortgage_amount));
  addText('CMHC Premium', formatCurrency(analysis.financing.cmhc_premium));
  addText('Interest Rate', `${analysis.property.interest_rate}%`);
  addText('Monthly Payment', formatCurrency(analysis.financing.monthly_payment), true);
  addText('Stress Test Rate', `${analysis.financing.stress_test_rate.toFixed(2)}%`);
  addText('Stress Test Payment', formatCurrency(analysis.financing.stress_test_payment));

  // Revenue
  addSection('Revenue');
  addText('Gross Monthly Rent', formatCurrency(analysis.revenue.gross_monthly_rent));
  addText('Other Income', formatCurrency(analysis.revenue.other_monthly_income));
  addText('Vacancy Loss', formatCurrency(analysis.revenue.vacancy_loss_monthly));
  addText('Effective Monthly Income', formatCurrency(analysis.revenue.effective_monthly_income), true);

  // Expenses
  addSection('Monthly Operating Expenses');
  addText('Mortgage', formatCurrency(analysis.expenses.monthly.mortgage));
  addText('Property Tax', formatCurrency(analysis.expenses.monthly.property_tax));
  addText('Insurance', formatCurrency(analysis.expenses.monthly.insurance));
  addText('Property Management', formatCurrency(analysis.expenses.monthly.property_management));
  addText('Maintenance', formatCurrency(analysis.expenses.monthly.maintenance));
  addText('Utilities', formatCurrency(analysis.expenses.monthly.utilities));
  addText('HOA/Condo Fees', formatCurrency(analysis.expenses.monthly.hoa_fees));
  addText('Total Expenses', formatCurrency(analysis.expenses.monthly.total), true);

  // Market Comparison
  if (yPos > 220) {
    doc.addPage();
    yPos = margin;
  }

  addSection('Market Comparison');
  addText('Market Avg Cap Rate', `${analysis.market_comparison.market_avg_cap_rate.toFixed(2)}%`);
  addText('Your Cap Rate', `${analysis.metrics.cap_rate.toFixed(2)}% (${analysis.market_comparison.cap_rate_vs_market})`);
  addText('Market Rent-to-Price', `${analysis.market_comparison.market_avg_rent_to_price.toFixed(2)}%`);
  addText('Your Rent-to-Price', `${analysis.market_comparison.deal_rent_to_price.toFixed(2)}% (${analysis.market_comparison.rent_to_price_vs_market})`);

  // Deal Scoring
  addSection('Deal Score Breakdown');
  analysis.scoring.reasons.forEach(reason => {
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(9);
    doc.text(reason, margin, yPos, { maxWidth: pageWidth - 2 * margin });
    yPos += 5;
  });

  // Warnings
  if (analysis.warnings.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    addSection('Warnings');
    analysis.warnings.forEach(warning => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(9);
      doc.setTextColor(239, 68, 68);
      doc.text(warning, margin, yPos, { maxWidth: pageWidth - 2 * margin });
      doc.setTextColor(0, 0, 0);
      yPos += 5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by REI OPS™ - Canadian Real Estate Analysis | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const filename = `REI_OPS_${analysis.property.address.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
