import { getClient, MODEL, extractJsonArray } from './gemini.js';
import { MOODS } from '../data/constants.js';
import type { Destination, MonthlyData, Sentiment, CrowdLevel, WeatherType } from '../types/types.js';

const MOOD_IDS = MOODS.map((m) => m.id);
const SENTIMENT_VALUES: Sentiment[] = [
  'spiritual',
  'adventure',
  'romantic',
  'cultural',
  'nature',
  'urban',
  'offbeat',
  'wellness',
];

// Rough India bounding box — used to sanity-check AI-estimated coordinates,
// not for precision (this powers "near me" sort order and a display badge,
// not navigation).
const INDIA_LAT_RANGE: [number, number] = [6, 38];
const INDIA_LNG_RANGE: [number, number] = [68, 98];

export interface RawAiDestination {
  id: string;
  name: string;
  state: string;
  description: string;
  sentiment: Sentiment[];
  moods: string[];
  durationDays: number;
  baseCostPerDay: number;
  imageQuery: string;
  lat?: number;
  lng?: number;
}

export interface GenerateDestinationSetInput {
  scope: 'near' | 'country';
  lat?: number;
  lng?: number;
  excludeIds: string[];
  count: number;
  signal?: AbortSignal;
}

function buildPrompt(input: GenerateDestinationSetInput): string {
  const locationClause =
    input.scope === 'near' && input.lat !== undefined && input.lng !== undefined
      ? `within a comfortable trip's reach of these coordinates: ${input.lat}, ${input.lng} (figure out the nearest Indian city or region yourself, then suggest realistic getaways from there)`
      : 'spread across different Indian states, showing a variety of experiences (coast, hills, heritage, cities, offbeat)';

  return `You are a travel data assistant for an India-only trip planner. Return ONLY a JSON array of exactly ${input.count} real, distinct travel destinations in India, ${locationClause}.

${input.excludeIds.length ? `Do not repeat any of these already-shown ids: ${input.excludeIds.join(', ')}.` : ''}

Each array item must be exactly this shape, with no extra fields:
{"id": string (lowercase kebab-case slug of the place name, e.g. "coorg"), "name": string, "state": string (Indian state or union territory), "description": string (one plain-spoken sentence, no dashes), "sentiment": array of 1 to 3 values from exactly this set: ${JSON.stringify(SENTIMENT_VALUES)}, "moods": array of 1 to 3 values from exactly this set: ${JSON.stringify(MOOD_IDS)}, "durationDays": integer from 2 to 5, "baseCostPerDay": integer, typical mid-range per-person cost per day in INR, "imageQuery": string (2 to 4 word photo search phrase for this place), "lat": number (approximate latitude of the destination itself, decimal degrees), "lng": number (approximate longitude of the destination itself, decimal degrees)}

Rules: real places only, no duplicates, "moods" and "sentiment" values must be copied exactly as spelled from the sets given, "lat"/"lng" must be your best real estimate for that specific place (not the reference coordinates above), valid JSON array only, no markdown code fences, no commentary before or after the array.`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'destination';
}

/** Validates and repairs one raw AI destination candidate; returns null if
 *  it can't be salvaged (e.g. no valid moods left after filtering — a
 *  destination with invented mood ids would silently vanish from every
 *  mood-filtered pool downstream, which is worse than dropping it here). */
function normalizeCandidate(raw: Partial<RawAiDestination>, takenIds: Set<string>): RawAiDestination | null {
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;

  const moods = Array.isArray(raw.moods) ? raw.moods.filter((m) => MOOD_IDS.includes(m)) : [];
  if (moods.length === 0) return null;

  const sentiment = Array.isArray(raw.sentiment)
    ? (raw.sentiment.filter((s) => SENTIMENT_VALUES.includes(s as Sentiment)) as Sentiment[])
    : [];

  const durationDays = Number(raw.durationDays);
  const baseCostPerDay = Number(raw.baseCostPerDay);
  if (!Number.isFinite(baseCostPerDay) || baseCostPerDay <= 0) return null;

  let id = typeof raw.id === 'string' && raw.id.trim() ? slugify(raw.id) : slugify(name);
  let suffix = 2;
  while (takenIds.has(id)) {
    id = `${slugify(raw.id || name)}-${suffix}`;
    suffix += 1;
  }
  takenIds.add(id);

  // Coordinates are optional (a destination without them just falls out of
  // distance sorting, not out of the whole pool) but must be plausibly
  // inside India if present — a wildly wrong AI guess would otherwise sort
  // as either impossibly close or impossibly far.
  const rawLat = Number(raw.lat);
  const rawLng = Number(raw.lng);
  const lat =
    Number.isFinite(rawLat) && rawLat >= INDIA_LAT_RANGE[0] && rawLat <= INDIA_LAT_RANGE[1] ? rawLat : undefined;
  const lng =
    Number.isFinite(rawLng) && rawLng >= INDIA_LNG_RANGE[0] && rawLng <= INDIA_LNG_RANGE[1] ? rawLng : undefined;

  return {
    id,
    name,
    state: typeof raw.state === 'string' && raw.state.trim() ? raw.state.trim() : 'India',
    description: typeof raw.description === 'string' && raw.description.trim() ? raw.description.trim() : `A getaway in ${name}.`,
    sentiment: sentiment.length > 0 ? sentiment : ['nature'],
    moods,
    durationDays: Number.isFinite(durationDays) && durationDays >= 2 && durationDays <= 7 ? Math.round(durationDays) : 3,
    baseCostPerDay: Math.round(baseCostPerDay),
    imageQuery: typeof raw.imageQuery === 'string' && raw.imageQuery.trim() ? raw.imageQuery.trim() : `${name} India travel`,
    lat: lat !== undefined && lng !== undefined ? lat : undefined,
    lng: lat !== undefined && lng !== undefined ? lng : undefined,
  };
}

/** One JSON-mode Gemini call for a batch of India-only destination
 *  candidates. Returns [] (never throws) if Gemini is unconfigured or the
 *  call/parse fails — callers fall back to the static catalog. */
export async function generateDestinationSet(input: GenerateDestinationSetInput): Promise<RawAiDestination[]> {
  const ai = getClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(input),
      config: { responseMimeType: 'application/json', abortSignal: input.signal },
    });
    const parsed = JSON.parse(extractJsonArray(response.text ?? '[]'));
    if (!Array.isArray(parsed)) return [];

    const takenIds = new Set(input.excludeIds);
    const out: RawAiDestination[] = [];
    for (const raw of parsed) {
      const normalized = normalizeCandidate(raw, takenIds);
      if (normalized) out.push(normalized);
    }
    return out;
  } catch (err) {
    console.error('Gemini generateDestinationSet error:', err);
    return [];
  }
}

// ─── Deterministic seasonal synthesis ──────────────────────────────────
// Generates a realistic-looking 12-month cost/crowd/weather curve from a
// single AI-estimated baseline, instead of asking the model for 12 numbers
// per destination (slower, costlier, and no more reliable). Mirrors the
// hand-authored seasonal shape already used in src/data/constants.ts.

const SEASON_CURVE: Record<number, { costMult: number; crowd: CrowdLevel; weather: WeatherType }> = {
  1: { costMult: 1.05, crowd: 'Medium', weather: 'Pleasant' },
  2: { costMult: 1.0, crowd: 'Medium', weather: 'Pleasant' },
  3: { costMult: 0.95, crowd: 'Medium', weather: 'Hot' },
  4: { costMult: 0.85, crowd: 'Low', weather: 'Hot' },
  5: { costMult: 0.8, crowd: 'Low', weather: 'Hot' },
  6: { costMult: 0.75, crowd: 'Low', weather: 'Rainy' },
  7: { costMult: 0.7, crowd: 'Low', weather: 'Rainy' },
  8: { costMult: 0.72, crowd: 'Low', weather: 'Rainy' },
  9: { costMult: 0.8, crowd: 'Low', weather: 'Rainy' },
  10: { costMult: 0.95, crowd: 'Medium', weather: 'Pleasant' },
  11: { costMult: 1.05, crowd: 'Medium', weather: 'Pleasant' },
  12: { costMult: 1.2, crowd: 'High', weather: 'Pleasant' },
};

/** Deterministic pseudo-random in [0.92, 1.08] from a string seed, so
 *  different destinations don't all carry the identical seasonal shape. */
function jitter(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000; // [0, 1)
  return 0.92 + normalized * 0.16;
}

export function synthesizeMonthlyData(id: string, baseCostPerDay: number, durationDays: number): MonthlyData[] {
  const baseTotal = baseCostPerDay * durationDays;
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const season = SEASON_CURVE[month];
    const estimatedCost = Math.round(baseTotal * season.costMult * jitter(`${id}:${month}`));
    return { month, estimatedCost, crowdLevel: season.crowd, weather: season.weather };
  });
}

export function toDestination(raw: RawAiDestination, heroImages: string[]): Destination {
  return {
    id: raw.id,
    name: raw.name,
    state: raw.state,
    heroImages,
    sentiment: raw.sentiment,
    description: raw.description,
    moods: raw.moods,
    durationDays: raw.durationDays,
    monthlyData: synthesizeMonthlyData(raw.id, raw.baseCostPerDay, raw.durationDays),
    lat: raw.lat,
    lng: raw.lng,
  };
}
