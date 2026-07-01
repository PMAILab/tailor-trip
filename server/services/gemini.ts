import { GoogleGenAI } from '@google/genai';
import type {
  Destination,
  MonthlyData,
  ItineraryDay,
  ActivitySlot,
  SlotKey,
} from '../../src/types/types';

const MODEL = 'gemini-2.5-flash';

let client: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'your-gemini-api-key' && key !== 'YOUR_API_KEY');
}

function getClient(): GoogleGenAI | null {
  if (client) return client;
  if (!isGeminiConfigured()) return null;
  client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
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

// ─── Compare verdict (streaming) ──────────────────────────────────────

export interface CompareDest {
  name: string;
  state?: string;
  total: number;
  crowd: string;
  weather: string;
  matchScore?: number;
}

/** Streams a 2–3 sentence recommendation choosing between compared trips.
 *  Falls back to a computed verdict, streamed word by word, with no keys. */
export async function streamCompareVerdict(
  input: { destinations: CompareDest[]; mood?: string | null },
  onDelta: (text: string) => void,
): Promise<void> {
  const ai = getClient();
  if (!ai || input.destinations.length < 2) {
    await streamWords(compareFallback(input.destinations), onDelta);
    return;
  }
  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: buildComparePrompt(input),
    });
    for await (const chunk of stream) {
      const t = chunk.text;
      if (t) onDelta(stripDashes(t));
    }
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

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : '{}';
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
