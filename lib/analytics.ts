import { createClient } from './supabase/client';

export type AnalyticsEvent =
  | 'deal_analyzed'
  | 'deal_saved'
  | 'deal_edited'
  | 'deal_deleted'
  | 'deal_exported_pdf'
  | 'settings_updated'
  | 'user_signed_up'
  | 'user_signed_in';

interface EventData {
  [key: string]: any;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: AnalyticsEvent,
  eventData?: EventData
): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.error('Analytics error:', error);
  }
}

/**
 * Track deal analyzed event
 */
export function trackDealAnalyzed(dealData: {
  province: string;
  property_type: string;
  strategy: string;
  deal_grade: string;
  deal_score: number;
}) {
  return trackEvent('deal_analyzed', dealData);
}

/**
 * Track deal saved
 */
export function trackDealSaved(dealId: string) {
  return trackEvent('deal_saved', { deal_id: dealId });
}

/**
 * Track deal edited
 */
export function trackDealEdited(dealId: string) {
  return trackEvent('deal_edited', { deal_id: dealId });
}

/**
 * Track deal deleted
 */
export function trackDealDeleted(dealId: string) {
  return trackEvent('deal_deleted', { deal_id: dealId });
}

/**
 * Track PDF export
 */
export function trackPDFExport(dealId: string) {
  return trackEvent('deal_exported_pdf', { deal_id: dealId });
}

/**
 * Track settings updated
 */
export function trackSettingsUpdated() {
  return trackEvent('settings_updated');
}

/**
 * Track user signup
 */
export function trackUserSignup() {
  return trackEvent('user_signed_up');
}

/**
 * Track user signin
 */
export function trackUserSignin() {
  return trackEvent('user_signed_in');
}
