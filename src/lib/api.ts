import type {
  TripRecommendation,
  TradeOffMode,
  Destination,
  CostBreakdown,
  TimingInsight,
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
export async function streamCompareVerdict(
  payload: { destinations: CompareDestInput[]; mood: string | null },
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}/compare/verdict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error('Verdict request failed');

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
        const msg = JSON.parse(line) as { delta?: string; done?: boolean };
        if (msg.delta) onDelta(msg.delta);
      } catch {
        /* ignore malformed line */
      }
    }
  }
}
