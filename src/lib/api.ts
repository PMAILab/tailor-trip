import type {
  TripRecommendation,
  TradeOffMode,
  Destination,
  CostBreakdown,
  TimingInsight,
  ItineraryDay,
  ItineraryInputs,
  SavedItinerary,
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

// ─── Geocoding ────────────────────────────────────────────────────────

/** Resolves a coordinate pair to a human-readable place name (e.g. "Mumbai,
 *  Maharashtra"), so the user can see the location "near me" actually
 *  resolved to. Returns null if it couldn't be resolved — never throws. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetchJSON<{ label: string | null }>(`/geocode/reverse?lat=${lat}&lng=${lng}`);
    return res.label;
  } catch {
    return null;
  }
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
  hasMore?: boolean;
  poolKey?: string;
}

export function getRecommendations(params: {
  mood: string | null;
  budgetId: string | null;
  tradeOff: TradeOffMode;
  scope?: 'near' | 'country';
  lat?: number;
  lng?: number;
  page?: number;
  poolKey?: string;
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

// ─── Chat concierge ───────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  mood: string | null;
  budgetId: string | null;
}

/** One request per turn — the client holds the transcript (no server-side
 *  chat session) and resends it each time, same statelessness as the rest
 *  of this API. */
export function sendChatMessage(messages: ChatMessage[]): Promise<ChatReply> {
  return fetchJSON<ChatReply>('/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
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

// ─── Auth ─────────────────────────────────────────────────────────────
// All Supabase Auth calls happen server-side; the browser only ever talks to
// these endpoints and never holds a Supabase key. Session identity is an
// httpOnly cookie set by the server, sent automatically by the browser's
// default same-origin fetch credentials mode.

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

export function getSession(): Promise<{ user: AuthUser | null; mock: boolean }> {
  return fetchJSON<{ user: AuthUser | null; mock: boolean }>('/auth/session');
}

export function signIn(email: string, password: string): Promise<AuthResult> {
  return fetchJSON<AuthResult>('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
  return fetchJSON<AuthResult>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function signOutRequest(): Promise<{ success: boolean }> {
  return fetchJSON<{ success: boolean }>('/auth/signout', { method: 'POST' });
}

// ─── Shortlist ────────────────────────────────────────────────────────
// Real, server-persisted for signed-in users (see server/routes/shortlist.ts).
// Only ever called when not in mock mode — mock mode keeps using localStorage.

export function getShortlist(): Promise<{ ids: string[] }> {
  return fetchJSON<{ ids: string[] }>('/shortlist');
}

export function addToShortlist(destinationId: string): Promise<{ ids: string[] }> {
  return fetchJSON<{ ids: string[] }>(`/shortlist/${destinationId}`, { method: 'PUT' });
}

export function removeFromShortlist(destinationId: string): Promise<{ ids: string[] }> {
  return fetchJSON<{ ids: string[] }>(`/shortlist/${destinationId}`, { method: 'DELETE' });
}

// ─── Profile ──────────────────────────────────────────────────────────
// Real, server-persisted for signed-in users (see server/routes/profile.ts).
// Display name lives in Supabase Auth; everything else in user_profiles.

export interface UserProfile {
  name: string | null;
  homeCity: string | null;
  homeState: string | null;
  preferredMoods: string[];
  defaultBudgetId: string | null;
}

export function getProfile(): Promise<UserProfile> {
  return fetchJSON<UserProfile>('/profile');
}

export function updateProfile(patch: {
  name?: string;
  homeCity?: string | null;
  homeState?: string | null;
  preferredMoods?: string[];
  defaultBudgetId?: string | null;
}): Promise<UserProfile> {
  return fetchJSON<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(patch) });
}

// ─── Saved itineraries ────────────────────────────────────────────────

export function getSavedItineraries(): Promise<{ itineraries: SavedItinerary[] }> {
  return fetchJSON<{ itineraries: SavedItinerary[] }>('/itineraries');
}

export function saveItinerary(inputs: ItineraryInputs, days: ItineraryDay[]): Promise<{ itinerary: SavedItinerary }> {
  return fetchJSON<{ itinerary: SavedItinerary }>('/itineraries', {
    method: 'POST',
    body: JSON.stringify({ inputs, days }),
  });
}
