// ─── Enums & literal types ────────────────────────────────────────────

export type CrowdLevel = 'Low' | 'Medium' | 'High';

export type WeatherType = 'Pleasant' | 'Hot' | 'Rainy' | 'Cold';

export type Sentiment =
  | 'spiritual'
  | 'adventure'
  | 'romantic'
  | 'cultural'
  | 'nature'
  | 'urban'
  | 'offbeat'
  | 'wellness';

export type TradeOffMode = 'cheapest' | 'least_crowded' | 'balanced';

// ─── Core domain types ────────────────────────────────────────────────

export interface Mood {
  id: string;
  label: string;
  icon: string; // Material Symbols name
  description: string;
  color: string; // muted accent hex — icon tint and selected-state wash, kept subtle to match the bone/ink palette
  tint: string; // pre-blended light background wash of `color` over the surface color
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface MonthlyData {
  month: number; // 1–12
  estimatedCost: number; // total estimated cost in ₹ (0 = effectively closed / inaccessible)
  crowdLevel: CrowdLevel;
  weather: WeatherType;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  heroImages: string[];
  sentiment: Sentiment[];
  description: string;
  moods: string[]; // mood ids this destination matches
  durationDays: number;
  monthlyData: MonthlyData[]; // 12 entries, one per month
  lat?: number; // approximate coordinates — powers "near me" distance sorting
  lng?: number;
}

export interface CostBreakdown {
  travel: number;
  stay: number;
  foodAndExperiences: number;
  total: number;
  perPerson: number;
}

export interface TimingInsight {
  cheapestMonth: number; // 1–12
  leastCrowdedMonth: number; // 1–12
  crowdLevel: CrowdLevel;
  weather: WeatherType;
  monthlyPrices: number[]; // 12-element array (index 0 = Jan)
}

export interface TripRecommendation {
  destination: Destination;
  month: number; // the month this recommendation is priced for
  costBreakdown: CostBreakdown;
  timingInsight: TimingInsight;
  matchScore: number; // 0–100
  aiReason: string;
  badges: string[];
  distanceKm?: number; // only set for "near me" requests where the user's coordinates are known
}

// ─── Itinerary ────────────────────────────────────────────────────────

export type Interest =
  | 'food_cafes'
  | 'nature'
  | 'history'
  | 'nightlife'
  | 'adventure'
  | 'spiritual'
  | 'shopping';

export type PartyType = 'single' | 'couple' | 'friends' | 'family';
export type Pace = 'relaxed' | 'moderate' | 'packed';
export type Dietary = 'veg' | 'non_veg' | 'both';
export type SlotKey = 'morning' | 'afternoon' | 'evening';

export interface ActivitySlot {
  activity: string;
  venue: string;
  duration: string;
  cost: string;
  reason: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  title?: string;
  slots: Record<SlotKey, ActivitySlot>;
  estimatedDayCost: string;
}

export interface ItineraryInputs {
  destination: string;
  destinationId?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  partyType: PartyType;
  budgetPerPerson: string; // budget range id
  interests: Interest[];
  dietaryPreference: Dietary;
  pace: Pace;
}

export interface SavedItinerary {
  id: string;
  inputs: ItineraryInputs;
  days: ItineraryDay[];
  generatedAt: string;
}
