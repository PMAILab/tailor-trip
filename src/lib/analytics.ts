import { logAnalyticsEvent } from './api';

/**
 * Tracks a user event and sends it to the analytics backend.
 * This is a fire-and-forget helper that suppresses errors to prevent breaking UX.
 * 
 * @param eventName The name of the event (e.g., 'mood_selected', 'card_viewed')
 * @param properties Optional metadata associated with the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // We use the existing logAnalyticsEvent which already handles the fetch and catches errors.
  logAnalyticsEvent(eventName, properties);
};
