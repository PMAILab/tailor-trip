import { track } from './analytics';

const MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER;

/** A real, useful outbound target: a Booking.com stay search for the place. */
function bookingTarget(query: string): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
}

/**
 * Outbound "Book this trip" URL. When a Travelpayouts marker is configured we
 * wrap the target so the click is attributed; otherwise we send the traveller
 * straight to a live search. Finalise the exact affiliate template (campaign,
 * trs) with the Travelpayouts dashboard link generator.
 */
export function buildBookingUrl(query: string): string {
  const target = bookingTarget(query);
  if (MARKER) {
    return `https://tp.media/r?marker=${encodeURIComponent(MARKER)}&u=${encodeURIComponent(target)}`;
  }
  return target;
}

/** Fires the analytics event and opens the outbound booking link. */
export function openBooking(query: string, id?: string): void {
  track('outbound_booking_click', { id: id ?? query, affiliate: Boolean(MARKER) });
  window.open(buildBookingUrl(query), '_blank', 'noopener,noreferrer');
}
