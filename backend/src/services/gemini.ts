import { GoogleGenAI } from '@google/genai';
import type {
  Destination,
  MonthlyData,
  ItineraryDay,
  ActivitySlot,
  SlotKey,
} from '../types/types.js';
import { peek, cacheSet } from '../lib/cache.js';
import { env } from '../config/env.js';

export const MODEL = 'gemini-3.1-pro-preview';

let client: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  const key = env.geminiApiKey;
  return Boolean(key && key !== 'your-gemini-api-key' && key !== 'YOUR_API_KEY');
}

/** Shared client singleton — reused by sibling AI services (e.g.
 *  geminiDestinations.ts) so there's one GoogleGenAI instance per process. */
export function getClient(): GoogleGenAI | null {
  if (client) return client;
  if (!isGeminiConfigured()) return null;
  client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}

/** One-line "why this fits your mood" for a destination card. Falls back to a
 *  warm template when Gemini is unavailable, so cards never look broken. */
export async function generateWhyThisFits(
  destination: Destination,
  moodLabel: string,
  monthData: MonthlyData,
): Promise<string> {
  const ai = getClient();
  if (!ai) return fallbackReason(destination, moodLabel, monthData);

  const prompt = `You are a warm, plain-spoken travel advisor. In one or two short sentences, say why "${destination.name}, ${destination.state}" fits someone in a "${moodLabel}" mood right now.

Context:
- Vibe: ${destination.sentiment.join(', ')}
- Estimated cost: ₹${monthData.estimatedCost.toLocaleString('en-IN')}
- Crowd: ${monthData.crowdLevel}
- Weather: ${monthData.weather}
- Trip length: ${destination.durationDays} days
- About: ${destination.description}

Rules: be specific and human. Mention cost, crowd, or weather if it helps. Do not start with the destination name. Do not use dashes of any kind; use commas or short sentences instead.`;

  try {
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = response.text?.trim();
    return text ? stripDashes(text) : fallbackReason(destination, moodLabel, monthData);
  } catch (err) {
    console.error('Gemini generateWhyThisFits error:', err);
    return fallbackReason(destination, moodLabel, monthData);
  }
}

const AI_REASON_TTL_MS = 60 * 60 * 1000; // 1h — a card's blurb isn't time-critical, safe to reuse
const AI_REASON_FALLBACK_TTL_MS = 10 * 60 * 1000; // a quota-exhausted/failed batch shouldn't stay "stuck on template text" for a full hour once the quota recovers

function reasonCacheKey(destinationId: string, moodLabel: string): string {
  return `whyFits:${destinationId}:${moodLabel}`;
}

interface ReasonResult {
  reason: string;
  fallback: boolean;
}

/** One Gemini call covering every destination at once, instead of one call
 *  per card — free-tier quota (~20 requests/day) can't sustain a page of 10
 *  cards each spending their own call. Falls back to the same per-item
 *  template as the single-item version for any id the model dropped. */
async function generateWhyThisFitsBatch(
  items: { id: string; destination: Destination; monthData: MonthlyData }[],
  moodLabel: string,
): Promise<Record<string, ReasonResult>> {
  const ai = getClient();
  const allFallback = () =>
    Object.fromEntries(
      items.map((it) => [it.id, { reason: fallbackReason(it.destination, moodLabel, it.monthData), fallback: true }]),
    );
  if (!ai || items.length === 0) return allFallback();

  const lines = items
    .map(
      (it, i) =>
        `${i + 1}. id="${it.id}" name="${it.destination.name}, ${it.destination.state}" vibe=${it.destination.sentiment.join(', ')} cost=₹${it.monthData.estimatedCost.toLocaleString('en-IN')} crowd=${it.monthData.crowdLevel} weather=${it.monthData.weather} days=${it.destination.durationDays} about="${it.destination.description}"`,
    )
    .join('\n');
  const prompt = `You are a warm, plain-spoken travel advisor. For EACH destination below, write one or two short sentences on why it fits someone in a "${moodLabel}" mood right now.

${lines}

Return ONLY a JSON array, one object per destination, in exactly this shape: [{"id": string, "reason": string}, ...]
Rules: use the exact id given for each destination. Be specific and human, mention cost, crowd, or weather if it helps. Do not start a reason with the destination name. Do not use dashes of any kind; use commas or short sentences instead.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJsonArray(response.text ?? '[]')) as Array<{ id?: unknown; reason?: unknown }>;
    const byId = new Map(
      parsed
        .filter((p): p is { id: string; reason: string } => typeof p.id === 'string' && typeof p.reason === 'string')
        .map((p) => [p.id, stripDashes(p.reason.trim())]),
    );
    return Object.fromEntries(
      items.map((it) => {
        const reason = byId.get(it.id);
        return reason
          ? [it.id, { reason, fallback: false }]
          : [it.id, { reason: fallbackReason(it.destination, moodLabel, it.monthData), fallback: true }];
      }),
    );
  } catch (err) {
    console.error('Gemini generateWhyThisFitsBatch error:', err);
    return allFallback();
  }
}

/** Cache-aware entry point recommendations.ts should use instead of calling
 *  generateWhyThisFits per card: checks each destination's cached blurb
 *  first, and spends exactly one Gemini call (not N) covering only the
 *  cache misses. A fully-cached page costs zero AI calls. Fallback text
 *  gets a short TTL so a quota blip doesn't keep serving template copy for
 *  a full hour after the quota recovers. */
export async function getWhyThisFitsBatch(
  items: { id: string; destination: Destination; monthData: MonthlyData }[],
  moodLabel: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const misses: typeof items = [];

  for (const it of items) {
    const cached = peek<string>(reasonCacheKey(it.id, moodLabel));
    if (cached) result[it.id] = cached;
    else misses.push(it);
  }

  if (misses.length > 0) {
    const fresh = await generateWhyThisFitsBatch(misses, moodLabel);
    for (const it of misses) {
      const { reason, fallback } = fresh[it.id];
      result[it.id] = reason;
      cacheSet(reasonCacheKey(it.id, moodLabel), reason, fallback ? AI_REASON_FALLBACK_TTL_MS : AI_REASON_TTL_MS);
    }
  }

  return result;
}

/** Neutral one-liner for the trip detail page (no mood framing). */
export async function generateTripSummary(
  destination: Destination,
  monthData: MonthlyData,
): Promise<string> {
  const ai = getClient();
  if (!ai) return tripSummaryFallback(destination, monthData);

  const prompt = `You are a warm, plain-spoken travel advisor. In one or two short sentences, say why "${destination.name}, ${destination.state}" is worth visiting and what to expect. Mention the crowd or weather if useful.

Context:
- Vibe: ${destination.sentiment.join(', ')}
- Crowd: ${monthData.crowdLevel}
- Weather: ${monthData.weather}
- About: ${destination.description}

Rules: human and specific. Do not use dashes of any kind; use commas or short sentences instead.`;

  try {
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = response.text?.trim();
    return text ? stripDashes(text) : tripSummaryFallback(destination, monthData);
  } catch (err) {
    console.error('Gemini generateTripSummary error:', err);
    return tripSummaryFallback(destination, monthData);
  }
}

function summaryCacheKey(destinationId: string, month: number): string {
  return `tripSummary:${destinationId}:${month}`;
}

async function generateTripSummaryBatch(
  items: { id: string; destination: Destination; monthData: MonthlyData }[],
): Promise<Record<string, ReasonResult>> {
  const ai = getClient();
  const allFallback = () =>
    Object.fromEntries(
      items.map((it) => [it.id, { reason: tripSummaryFallback(it.destination, it.monthData), fallback: true }]),
    );
  if (!ai || items.length === 0) return allFallback();

  const lines = items
    .map(
      (it, i) =>
        `${i + 1}. id="${it.id}" name="${it.destination.name}, ${it.destination.state}" vibe=${it.destination.sentiment.join(', ')} crowd=${it.monthData.crowdLevel} weather=${it.monthData.weather} about="${it.destination.description}"`,
    )
    .join('\n');
  const prompt = `You are a warm, plain-spoken travel advisor. For EACH destination below, write one or two short sentences on why it's worth visiting and what to expect. Mention the crowd or weather if useful.

${lines}

Return ONLY a JSON array, one object per destination, in exactly this shape: [{"id": string, "reason": string}, ...]
Rules: use the exact id given for each destination. Human and specific. Do not use dashes of any kind; use commas or short sentences instead.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJsonArray(response.text ?? '[]')) as Array<{ id?: unknown; reason?: unknown }>;
    const byId = new Map(
      parsed
        .filter((p): p is { id: string; reason: string } => typeof p.id === 'string' && typeof p.reason === 'string')
        .map((p) => [p.id, stripDashes(p.reason.trim())]),
    );
    return Object.fromEntries(
      items.map((it) => {
        const reason = byId.get(it.id);
        return reason
          ? [it.id, { reason, fallback: false }]
          : [it.id, { reason: tripSummaryFallback(it.destination, it.monthData), fallback: true }];
      }),
    );
  } catch (err) {
    console.error('Gemini generateTripSummaryBatch error:', err);
    return allFallback();
  }
}

/** Cache-aware entry point trips.ts should use instead of calling
 *  generateTripSummary directly — shared cache namespace between the single
 *  trip-details view and the shortlist/compare summary list, so viewing one
 *  then the other doesn't spend a second call on the same destination+month.
 *  Fallback text gets a short TTL so a quota blip doesn't keep serving
 *  template copy for a full hour after the quota recovers. */
export async function getTripSummaryBatch(
  items: { id: string; destination: Destination; monthData: MonthlyData }[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const misses: typeof items = [];

  for (const it of items) {
    const cached = peek<string>(summaryCacheKey(it.id, it.monthData.month));
    if (cached) result[it.id] = cached;
    else misses.push(it);
  }

  if (misses.length > 0) {
    const fresh = await generateTripSummaryBatch(misses);
    for (const it of misses) {
      const { reason, fallback } = fresh[it.id];
      result[it.id] = reason;
      cacheSet(summaryCacheKey(it.id, it.monthData.month), reason, fallback ? AI_REASON_FALLBACK_TTL_MS : AI_REASON_TTL_MS);
    }
  }

  return result;
}

// ─── Compare verdict (streaming) ──────────────────────────────────────

export interface CompareDest {
  name: string;
  state?: string;
  total: number;
  crowd: string;
  weather: string;
  matchScore?: number;
}

const COMPARE_TTL_MS = 30 * 60 * 1000; // repeat visits to the same comparison (very common — back-and-forth while deciding) cost zero extra calls

function compareCacheKey(input: { destinations: CompareDest[]; mood?: string | null }): string {
  const parts = [...input.destinations]
    .map((d) => `${d.name}|${d.state ?? ''}|${d.total}|${d.crowd}|${d.weather}`)
    .sort()
    .join(';');
  return `compareVerdict:${input.mood ?? ''}:${parts}`;
}

/** Streams a 2–3 sentence recommendation choosing between compared trips.
 *  Falls back to a computed verdict, streamed word by word, with no keys.
 *  A cache hit also streams word by word (from the cached full text) rather
 *  than spending a second Gemini call on an identical comparison. */
export async function streamCompareVerdict(
  input: { destinations: CompareDest[]; mood?: string | null },
  onDelta: (text: string) => void,
): Promise<void> {
  const ai = getClient();
  if (!ai || input.destinations.length < 2) {
    await streamWords(compareFallback(input.destinations), onDelta);
    return;
  }

  const key = compareCacheKey(input);
  const cached = peek<string>(key);
  if (cached) {
    await streamWords(cached, onDelta);
    return;
  }

  try {
    let full = '';
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: buildComparePrompt(input),
    });
    for await (const chunk of stream) {
      const t = chunk.text;
      if (t) {
        const clean = stripDashes(t);
        full += clean;
        onDelta(clean);
      }
    }
    if (full.trim()) cacheSet(key, full, COMPARE_TTL_MS);
  } catch (err) {
    console.error('Gemini compare verdict error:', err);
    await streamWords(compareFallback(input.destinations), onDelta);
  }
}

function buildComparePrompt(input: { destinations: CompareDest[]; mood?: string | null }): string {
  const lines = input.destinations
    .map(
      (d) =>
        `- ${d.name}${d.state ? `, ${d.state}` : ''}: about ₹${d.total.toLocaleString('en-IN')}, ${d.crowd.toLowerCase()} crowds, ${d.weather.toLowerCase()} weather${
          d.matchScore ? `, match ${d.matchScore}%` : ''
        }`,
    )
    .join('\n');
  return `You are a warm, plain-spoken travel advisor helping someone choose between these trips${
    input.mood ? ` for a ${input.mood} mood` : ''
  }:
${lines}

In 2 to 3 short sentences, recommend which one to pick and why, and name a clear trade-off. Rules: be decisive but honest. Prices are estimates, never guarantee prices or bookings. Do not use dashes of any kind; use commas or short sentences.`;
}

function crowdRank(c: string): number {
  return c === 'Low' ? 0 : c === 'Medium' ? 1 : 2;
}

function compareFallback(ds: CompareDest[]): string {
  if (ds.length < 2) return 'Add at least two trips to compare them.';
  const sorted = [...ds].sort(
    (a, b) => a.total + crowdRank(a.crowd) * 1500 - (b.total + crowdRank(b.crowd) * 1500),
  );
  const win = sorted[0];
  const alt = sorted[1];
  const parts = [
    `For the best balance of cost and calm, ${win.name} looks like the pick, at around ₹${win.total.toLocaleString(
      'en-IN',
    )} with ${win.crowd.toLowerCase()} crowds and ${win.weather.toLowerCase()} weather.`,
  ];
  if (alt) {
    parts.push(
      `${alt.name} is worth it if you want a change of scene, though it runs a little ${
        alt.total > win.total ? 'pricier' : 'busier'
      }.`,
    );
  }
  parts.push('These prices are estimates, so double check before you book.');
  return parts.join(' ');
}

async function streamWords(text: string, onDelta: (t: string) => void): Promise<void> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 1) {
    onDelta(words[i] + (i < words.length - 1 ? ' ' : ''));
    await new Promise((r) => setTimeout(r, 16));
  }
}

// ─── Itinerary generation (per day) ───────────────────────────────────

export interface ItineraryDayInput {
  destination: string;
  partyType: string;
  budgetLabel: string;
  interests: string[];
  dietary: string;
  pace: string;
}

export async function generateItineraryDay(
  input: ItineraryDayInput,
  dayNumber: number,
  dateLabel: string | undefined,
  priorTitles: string[],
): Promise<ItineraryDay> {
  const ai = getClient();
  if (!ai) return fallbackDay(input, dayNumber, dateLabel);

  const prompt = `You are a warm, plain-spoken local travel planner. Plan day ${dayNumber} of a trip to ${input.destination}.
Traveller: ${input.partyType}. Budget: ${input.budgetLabel} per person. Pace: ${input.pace}. Diet: ${input.dietary}. Interests: ${
    input.interests.join(', ') || 'a bit of everything'
  }.
${priorTitles.length ? `Earlier days already covered: ${priorTitles.join('; ')}. Do not repeat them.` : ''}
Return ONLY JSON in exactly this shape:
{"title": string, "slots": {"morning": {"activity": string, "venue": string, "duration": string, "cost": string, "reason": string}, "afternoon": {...}, "evening": {...}}, "estimatedDayCost": string}
Rules: use real, specific places in ${input.destination} where you can. Costs in rupees like "₹400 to ₹600". Each reason is one short sentence. Do not use dashes of any kind; use commas or short sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJson(response.text ?? '{}')) as Partial<ItineraryDay> & {
      title?: string;
    };
    return normalizeDay(parsed, input, dayNumber, dateLabel);
  } catch (err) {
    console.error('Gemini generateItineraryDay error:', err);
    return fallbackDay(input, dayNumber, dateLabel);
  }
}

/** Plans every requested day in one Gemini call instead of one call per day
 *  — a 7-day itinerary used to cost 7 calls, more than a third of the
 *  free-tier's entire daily quota for a single generation. The route fakes
 *  the progressive day-by-day reveal client sees today by writing these
 *  results to the stream with a small delay between them, so the UX is
 *  unchanged even though the generation itself is no longer incremental. */
export async function generateItineraryBatch(
  input: ItineraryDayInput,
  days: { dayNumber: number; dateLabel: string | undefined }[],
): Promise<ItineraryDay[]> {
  const ai = getClient();
  if (!ai) return days.map((d) => fallbackDay(input, d.dayNumber, d.dateLabel));

  const dayNumbers = days.map((d) => d.dayNumber).join(', ');
  const prompt = `You are a warm, plain-spoken local travel planner. Plan a ${days.length}-day trip to ${input.destination}.
Traveller: ${input.partyType}. Budget: ${input.budgetLabel} per person. Pace: ${input.pace}. Diet: ${input.dietary}. Interests: ${
    input.interests.join(', ') || 'a bit of everything'
  }.
Plan exactly these day numbers: ${dayNumbers}. Make each day feel different from the others, do not repeat activities or venues across days.

Return ONLY JSON in exactly this shape:
{"days": [{"day": number, "title": string, "slots": {"morning": {"activity": string, "venue": string, "duration": string, "cost": string, "reason": string}, "afternoon": {...}, "evening": {...}}, "estimatedDayCost": string}, ...]}
Rules: use real, specific places in ${input.destination} where you can. Costs in rupees like "₹400 to ₹600". Each reason is one short sentence. Do not use dashes of any kind; use commas or short sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJson(response.text ?? '{}')) as { days?: unknown };
    const rawDays = Array.isArray(parsed.days) ? parsed.days : [];
    const byDayNumber = new Map<number, Partial<ItineraryDay> & { title?: string }>();
    for (const rd of rawDays) {
      if (rd && typeof rd === 'object' && typeof (rd as { day?: unknown }).day === 'number') {
        byDayNumber.set((rd as { day: number }).day, rd as Partial<ItineraryDay> & { title?: string });
      }
    }
    return days.map((d) => normalizeDay(byDayNumber.get(d.dayNumber) ?? null, input, d.dayNumber, d.dateLabel));
  } catch (err) {
    console.error('Gemini generateItineraryBatch error:', err);
    return days.map((d) => fallbackDay(input, d.dayNumber, d.dateLabel));
  }
}

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : '{}';
}

function extractJsonArray(text: string): string {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  return start >= 0 && end > start ? text.slice(start, end + 1) : '[]';
}

function cleanSlot(raw: Partial<ActivitySlot> | undefined, fallback: ActivitySlot): ActivitySlot {
  if (!raw) return fallback;
  return {
    activity: raw.activity ? stripDashes(raw.activity) : fallback.activity,
    venue: raw.venue ? stripDashes(raw.venue) : fallback.venue,
    duration: raw.duration || fallback.duration,
    cost: raw.cost || fallback.cost,
    reason: raw.reason ? stripDashes(raw.reason) : fallback.reason,
  };
}

function normalizeDay(
  parsed: (Partial<ItineraryDay> & { title?: string }) | null,
  input: ItineraryDayInput,
  dayNumber: number,
  dateLabel: string | undefined,
): ItineraryDay {
  const fb = fallbackDay(input, dayNumber, dateLabel);
  const slots = (parsed?.slots ?? {}) as Partial<Record<SlotKey, Partial<ActivitySlot>>>;
  return {
    day: dayNumber,
    date: dateLabel,
    title: parsed?.title ? stripDashes(parsed.title) : fb.title,
    slots: {
      morning: cleanSlot(slots.morning, fb.slots.morning),
      afternoon: cleanSlot(slots.afternoon, fb.slots.afternoon),
      evening: cleanSlot(slots.evening, fb.slots.evening),
    },
    estimatedDayCost: parsed?.estimatedDayCost || fb.estimatedDayCost,
  };
}

function fallbackDay(
  input: ItineraryDayInput,
  dayNumber: number,
  dateLabel: string | undefined,
): ItineraryDay {
  const dest = input.destination || 'your destination';
  const pick = (arr: string[], offset: number) => arr[(dayNumber - 1 + offset) % arr.length];

  const morning: ActivitySlot = {
    activity: pick(
      ['Slow start and a viewpoint walk', 'Morning heritage stroll', 'Quiet nature trail', 'Local market breakfast'],
      0,
    ),
    venue: `Central ${dest}`,
    duration: '2 to 3 hours',
    cost: '₹200 to ₹500',
    reason: 'Mornings are cool and quiet, so you get ahead of the crowds.',
  };
  const afternoon: ActivitySlot = {
    activity: pick(
      ['Local thali lunch and cafe time', 'Old town and museum wander', 'Lakeside or riverside afternoon', 'Cafe hopping and a slow browse'],
      1,
    ),
    venue: `${dest} old quarter`,
    duration: '2 to 3 hours',
    cost: '₹400 to ₹800',
    reason: 'An easy midday keeps the pace comfortable.',
  };
  const evening: ActivitySlot = {
    activity: pick(
      ['Sunset point and dinner', 'Riverside dinner and a walk', 'Live music at a local cafe', 'Night market stroll'],
      2,
    ),
    venue: dest,
    duration: '2 hours',
    cost: '₹500 to ₹900',
    reason: 'A gentle evening to round off the day.',
  };

  // Interest bias, still rotated by day so consecutive days differ.
  if (input.interests.includes('nature'))
    morning.activity = pick(['Nature trail before the crowds', 'Waterfall walk and a viewpoint', 'Plantation or forest walk'], 0);
  if (input.interests.includes('spiritual'))
    morning.activity = pick(['Morning temple visit and quiet time', 'Sunrise aarti or meditation', 'A calm walk to a local shrine'], 1);
  if (input.interests.includes('history'))
    afternoon.activity = pick(['Heritage sites and a museum wander', 'Fort and old town walk', 'Guided history trail'], 0);
  if (input.interests.includes('food_cafes'))
    afternoon.activity = pick(['Food trail through local cafes', 'Street food and a thali lunch', 'Bakeries and specialty coffee'], 1);
  if (input.interests.includes('shopping'))
    afternoon.activity = pick(['Local markets and a slow browse', 'Artisan shops and souvenirs', 'Bazaar wander and bargaining'], 2);
  if (input.interests.includes('adventure'))
    afternoon.activity = pick(['An afternoon adventure activity', 'Trek or water sport session', 'Cycling or a guided climb'], 0);
  if (input.interests.includes('nightlife'))
    evening.activity = pick(['Evening out with bars and live music', 'Rooftop drinks and city lights', 'Late night cafe and music'], 1);

  const titles = [
    'Settle in and explore',
    'Highlights and hidden corners',
    'Nature and slow moments',
    'Culture and local flavour',
    'A day at your own pace',
    'Off the beaten path',
    'Savour and unwind',
  ];

  return {
    day: dayNumber,
    date: dateLabel,
    title: titles[(dayNumber - 1) % titles.length],
    slots: { morning, afternoon, evening },
    estimatedDayCost: '₹1,100 to ₹2,200',
  };
}

function firstClause(description: string): string {
  return description
    .split(/\s+[—–]\s+/)[0] // em/en dash pause, keep hyphenated words intact
    .split(/\.\s/)[0]
    .trim()
    .replace(/\.$/, '');
}

function tripSummaryFallback(destination: Destination, monthData: MonthlyData): string {
  const gist = firstClause(destination.description);
  return `${gist}. Around this time expect ${monthData.crowdLevel.toLowerCase()} crowds and ${monthData.weather.toLowerCase()} weather, at roughly ₹${monthData.estimatedCost.toLocaleString(
    'en-IN',
  )} for ${destination.durationDays} days.`;
}

function stripDashes(text: string): string {
  // Keep UI copy free of em/en dashes and dash-as-pause.
  return text.replace(/\s*[—–]\s*/g, ', ').replace(/\s+-\s+/g, ', ');
}

function fallbackReason(destination: Destination, moodLabel: string, monthData: MonthlyData): string {
  const crowd =
    monthData.crowdLevel === 'Low'
      ? 'with room to breathe'
      : monthData.crowdLevel === 'Medium'
        ? 'without heavy crowds'
        : 'though it does get busy';
  const gist = firstClause(destination.description).toLowerCase();
  return `A good match for your ${moodLabel.toLowerCase()} mood: ${gist}, ${crowd}, at around ₹${monthData.estimatedCost.toLocaleString(
    'en-IN',
  )} for ${destination.durationDays} days.`;
}
