import type {
  TripRecommendation,
  TradeOffMode,
  Destination,
  CostBreakdown,
  TimingInsight,
  ItineraryDay,
  ItineraryInputs,
} from '../types/types';

const BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Reads a newline-delimited JSON stream, invoking onMessage per parsed line. */
async function streamNDJSON<T>(
  url: string,
  body: unknown,
  onMessage: (msg: T) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Stream request failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        onMessage(JSON.parse(line) as T);
      } catch {
        /* ignore malformed line */
      }
    }
  }
}

// ─── Recommendations ──────────────────────────────────────────────────

export interface RecommendationsResponse {
  recommendations: TripRecommendation[];
  fallback?: boolean;
}

export function getRecommendations(params: {
  mood: string | null;
  budgetId: string | null;
  tradeOff: TradeOffMode;
}): Promise<RecommendationsResponse> {
  return fetchJSON<RecommendationsResponse>('/recommendations', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ─── Trip details ─────────────────────────────────────────────────────

export interface TripOption {
  month: number;
  costBreakdown: CostBreakdown;
  timingInsight: TimingInsight;
}

export interface TripDetailResponse {
  destination: Destination;
  options: { cheapest: TripOption; least_crowded: TripOption };
  aiReason: string;
  fallback?: boolean;
}

export function getTripDetails(id: string): Promise<TripDetailResponse> {
  return fetchJSON<TripDetailResponse>(`/trips/${id}`);
}

// ─── Shortlist / compare summaries ────────────────────────────────────

export function getTripSummaries(params: {
  ids: string[];
  mood: string | null;
  tradeOff: TradeOffMode;
}): Promise<{ recommendations: TripRecommendation[] }> {
  return fetchJSON<{ recommendations: TripRecommendation[] }>('/trips/summary', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export interface CompareDestInput {
  name: string;
  state?: string;
  total: number;
  crowd: string;
  weather: string;
  matchScore?: number;
}

/** Streams the AI compare verdict, calling onDelta for each text chunk. */
export function streamCompareVerdict(
  payload: { destinations: CompareDestInput[]; mood: string | null },
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamNDJSON<{ delta?: string; done?: boolean }>(
    '/compare/verdict',
    payload,
    (msg) => {
      if (msg.delta) onDelta(msg.delta);
    },
    signal,
  );
}

// ─── Itinerary ────────────────────────────────────────────────────────

/** Streams the generated itinerary one day at a time. */
export function streamItinerary(
  inputs: ItineraryInputs,
  onDay: (day: ItineraryDay) => void,
  signal?: AbortSignal,
): Promise<void> {
  return streamNDJSON<{ day?: ItineraryDay; done?: boolean }>(
    '/itinerary/generate',
    inputs,
    (msg) => {
      if (msg.day) onDay(msg.day);
    },
    signal,
  );
}

export function regenerateItineraryDay(payload: {
  inputs: ItineraryInputs;
  dayNumber: number;
  date?: string;
  priorTitles: string[];
}): Promise<{ day: ItineraryDay }> {
  return fetchJSON<{ day: ItineraryDay }>('/itinerary/regenerate-day', {
    method: 'POST',
    body: JSON.stringify({
      ...payload.inputs,
      dayNumber: payload.dayNumber,
      date: payload.date,
      priorTitles: payload.priorTitles,
    }),
  });
}
