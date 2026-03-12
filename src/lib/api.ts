import type {
  TripRecommendation,
  BudgetRange,
  TradeOffMode,
  Destination,
  CostBreakdown,
  TimingInsight,
  MonthlyData,
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
  return res.json();
}

// ─── Recommendations ──────────────────────────────────────────────────

export async function getRecommendations(
  mood: string,
  budgetRange?: BudgetRange,
  tradeOff?: TradeOffMode
): Promise<{ recommendations: TripRecommendation[]; fallback?: boolean }> {
  return fetchJSON('/recommendations', {
    method: 'POST',
    body: JSON.stringify({ mood, budgetRange, tradeOff }),
  });
}

// ─── Trip Details ─────────────────────────────────────────────────────

export interface TripDetailResponse {
  destination: Destination;
  costBreakdown: CostBreakdown;
  timingInsight: TimingInsight;
  recommendedMonth: number;
  recommendedMonthData: MonthlyData;
}

export async function getTripDetails(
  id: string,
  tradeOff?: TradeOffMode
): Promise<TripDetailResponse> {
  const qs = tradeOff ? `?tradeOff=${tradeOff}` : '';
  return fetchJSON(`/trips/${id}${qs}`);
}

// ─── Shortlist ────────────────────────────────────────────────────────

interface ShortlistItem {
  destinationId: string;
  savedAt: string;
  destination: Destination;
}

export async function getShortlist(): Promise<{ trips: ShortlistItem[] }> {
  return fetchJSON('/shortlist');
}

export async function saveToShortlist(destinationId: string): Promise<{ success: boolean }> {
  return fetchJSON('/shortlist', {
    method: 'POST',
    body: JSON.stringify({ destinationId }),
  });
}

export async function removeFromShortlist(destinationId: string): Promise<{ success: boolean }> {
  return fetchJSON(`/shortlist/${destinationId}`, { method: 'DELETE' });
}

// ─── Profile ──────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  preferredBudgetRange: BudgetRange | null;
  moods: string[];
}

export async function getProfile(): Promise<ProfileData> {
  return fetchJSON('/profile');
}

export async function updateProfile(prefs: Partial<ProfileData>): Promise<{ success: boolean }> {
  return fetchJSON('/profile', {
    method: 'POST',
    body: JSON.stringify(prefs),
  });
}
