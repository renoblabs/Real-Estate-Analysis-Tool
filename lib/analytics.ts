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
 * Note: Failures are logged but don't throw - analytics shouldn't break the app
 */
export async function trackEvent(
  eventType: AnalyticsEvent,
  eventData?: EventData
): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
      timestamp: new Date().toISOString(),
    });

    if (error) {
      // Log error details for debugging
      console.error('Analytics tracking failed:', {
        event: eventType,
        error: error.message,
        code: error.code,
      });

      // TODO: In production, send to error monitoring service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(error, { extra: { eventType, eventData } });
    }
  } catch (error: any) {
    // Network errors, auth failures, etc. - log but don't throw
    console.error('Analytics error:', {
      event: eventType,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // TODO: In production, send to error monitoring service
    // Example: Sentry.captureException(error, { extra: { eventType, eventData } });
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
