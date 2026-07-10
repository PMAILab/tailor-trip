/**
 * Lightweight, fire-and-forget analytics. Posts named product events to the
 * BFF (which persists them in a later phase). Never throws, never blocks UI.
 *
 * PRD events: signup, mood_selected, card_viewed, trip_saved, compare_opened,
 * itinerary_generated, itinerary_saved, itinerary_shared, outbound_booking_click.
 */
export function track(event: string, data?: Record<string, unknown>): void {
  try {
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data: data ?? {}, ts: Date.now() }),
      keepalive: true,
    }).catch(() => {
      /* backend not ready or offline — analytics is best-effort */
    });
  } catch {
    /* ignore */
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[track]', event, data ?? '');
  }
}
