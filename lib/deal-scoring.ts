// REI OPS™ - Deal Scoring Algorithm

import type { DealAnalysis, DealScoring, DealGrade } from '@/types';

/**
 * Calculate comprehensive deal score based on multiple factors
 * Scoring is out of 100 points, graded A-F
 */
export function calculateDealScore(analysis: DealAnalysis): DealScoring {
  let score = 0;
  const reasons: string[] = [];

  // Cash Flow (max 30 points)
  if (analysis.cash_flow.monthly_net > 500) {
    score += 30;
    reasons.push(`✅ Strong positive cash flow ($${analysis.cash_flow.monthly_net.toFixed(0)}/mo)`);
  } else if (analysis.cash_flow.monthly_net > 200) {
    score += 20;
    reasons.push(`✅ Moderate cash flow ($${analysis.cash_flow.monthly_net.toFixed(0)}/mo)`);
  } else if (analysis.cash_flow.monthly_net > 0) {
    score += 10;
    reasons.push(`⚠️ Marginal cash flow ($${analysis.cash_flow.monthly_net.toFixed(0)}/mo)`);
  } else {
    reasons.push(`❌ Negative cash flow ($${analysis.cash_flow.monthly_net.toFixed(0)}/mo)`);
  }

  // Cash-on-Cash Return (max 25 points)
  if (analysis.metrics.cash_on_cash_return > 15) {
    score += 25;
    reasons.push(`✅ Exceptional CoC return (${analysis.metrics.cash_on_cash_return.toFixed(1)}%)`);
  } else if (analysis.metrics.cash_on_cash_return > 10) {
    score += 20;
    reasons.push(`✅ Strong CoC return (${analysis.metrics.cash_on_cash_return.toFixed(1)}%)`);
  } else if (analysis.metrics.cash_on_cash_return > 6) {
    score += 15;
    reasons.push(`✅ Acceptable CoC return (${analysis.metrics.cash_on_cash_return.toFixed(1)}%)`);
  } else if (analysis.metrics.cash_on_cash_return > 0) {
    score += 5;
    reasons.push(`⚠️ Low CoC return (${analysis.metrics.cash_on_cash_return.toFixed(1)}%)`);
  } else {
    reasons.push(`❌ Negative returns (${analysis.metrics.cash_on_cash_return.toFixed(1)}%)`);
  }

  // Cap Rate vs Market (max 20 points)
  const capRateDiff = analysis.metrics.cap_rate - analysis.market_comparison.market_avg_cap_rate;
  if (capRateDiff > 1) {
    score += 20;
    reasons.push(`✅ Above market cap rate (+${capRateDiff.toFixed(1)}%)`);
  } else if (capRateDiff > 0) {
    score += 15;
    reasons.push(`✅ At market cap rate (+${capRateDiff.toFixed(1)}%)`);
  } else if (capRateDiff > -1) {
    score += 10;
    reasons.push(`⚠️ Slightly below market cap rate (${capRateDiff.toFixed(1)}%)`);
  } else {
    score += 5;
    reasons.push(`❌ Well below market cap rate (${capRateDiff.toFixed(1)}%)`);
  }

  // DSCR (max 15 points)
  if (analysis.metrics.dscr > 1.5) {
    score += 15;
    reasons.push(`✅ Excellent debt coverage (DSCR: ${analysis.metrics.dscr.toFixed(2)})`);
  } else if (analysis.metrics.dscr > 1.25) {
    score += 12;
    reasons.push(`✅ Strong debt coverage (DSCR: ${analysis.metrics.dscr.toFixed(2)})`);
  } else if (analysis.metrics.dscr > 1.0) {
    score += 8;
    reasons.push(`⚠️ Minimal debt coverage (DSCR: ${analysis.metrics.dscr.toFixed(2)})`);
  } else {
    reasons.push(`❌ Insufficient debt coverage (DSCR: ${analysis.metrics.dscr.toFixed(2)})`);
  }

  // Stress Test (max 10 points)
  if (!analysis.flags.fails_stress_test) {
    score += 10;
    reasons.push("✅ Passes OSFI stress test");
  } else {
    reasons.push("❌ Fails stress test - financing may be difficult");
  }

  // Assign grade and color
  let grade: DealGrade;
  let color: string;

  if (score >= 85) {
    grade = 'A';
    color = 'green';
  } else if (score >= 70) {
    grade = 'B';
    color = 'blue';
  } else if (score >= 55) {
    grade = 'C';
    color = 'yellow';
  } else if (score >= 40) {
    grade = 'D';
    color = 'orange';
  } else {
    grade = 'F';
    color = 'red';
  }

  return {
    total_score: score,
    grade,
    color,
    reasons
  };
}

/**
 * Determine if a deal is worth pursuing based on score
 */
export function isDealWorthPursuing(score: number): boolean {
  return score >= 55; // C grade or better
}

/**
 * Get textual description of deal quality
 */
export function getDealQualityDescription(grade: DealGrade): string {
  const descriptions: Record<DealGrade, string> = {
    'A': 'Excellent Deal - Pursue Aggressively',
    'B': 'Good Deal - Worth Considering',
    'C': 'Fair Deal - Analyze Carefully',
    'D': 'Below Average - Proceed with Caution',
    'F': 'Poor Deal - Pass Unless Special Circumstances'
  };

  return descriptions[grade];
}

/**
 * Get emoji for deal grade
 */
export function getDealGradeEmoji(grade: DealGrade): string {
  const emojis: Record<DealGrade, string> = {
    'A': '🎯',
    'B': '👍',
    'C': '🤔',
    'D': '⚠️',
    'F': '❌'
  };

  return emojis[grade];
}
