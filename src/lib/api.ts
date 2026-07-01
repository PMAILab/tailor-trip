import type { TripRecommendation, TradeOffMode } from '../types/types';

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
