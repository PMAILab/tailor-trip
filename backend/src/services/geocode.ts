import { getOrSet } from '../lib/cache.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const TIMEOUT_MS = 3000;
const LABEL_TTL_MS = 24 * 60 * 60 * 1000; // a coordinate's nearest place name doesn't change
const MISS_TTL_MS = 5 * 60 * 1000; // short retry window on failure/timeout

function bucket(n: number): number {
  return Math.round(n * 100) / 100; // ~1.1km grid — dedupes repeat clicks from the same spot without losing city-level accuracy
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  state?: string;
  county?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

async function fetchLabel(lat: number, lng: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      // Nominatim's usage policy requires an identifying User-Agent for
      // programmatic use — no API key needed, this is their free tier.
      headers: { 'User-Agent': 'TailorTrip/1.0 (travel planning app)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Nominatim request failed: ${res.status}`);
    const data = (await res.json()) as NominatimResponse;
    const addr = data.address ?? {};
    const place = addr.city || addr.town || addr.village || addr.suburb || addr.county;
    if (!place) return null;
    return addr.state ? `${place}, ${addr.state}` : place;
  } catch (err) {
    console.error('Reverse geocode failed:', err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Human-readable place name for a coordinate pair, via OpenStreetMap's free
 *  Nominatim reverse-geocoding API — no key required, unrelated to (and
 *  doesn't spend) the Gemini quota. Cached so repeat "near me" clicks from
 *  roughly the same spot don't re-hit the service; their usage policy caps
 *  requests at ~1/second, which a per-click, per-user feature comfortably
 *  respects. Resolves to null on any failure — callers treat that as "don't
 *  show a location label," never a hard error. */
export function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = `geocode:${bucket(lat)}:${bucket(lng)}`;
  return getOrSet(key, (value: string | null) => (value ? LABEL_TTL_MS : MISS_TTL_MS), () => fetchLabel(lat, lng));
}
