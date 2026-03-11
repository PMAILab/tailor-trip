// ─── Enums & Literal Types ────────────────────────────────────────────

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

// ─── Core Domain Types ────────────────────────────────────────────────

export interface Mood {
  id: string;
  label: string;
  emoji: string;
  description: string;
  imageUrl: string;
}

export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface MonthlyData {
  month: number; // 1–12
  estimatedCost: number; // total estimated cost in ₹
  crowdLevel: CrowdLevel;
  weather: WeatherType;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  heroImages: string[]; // 2–3 sentiment-aware image URLs
  sentiment: Sentiment[];
  description: string;
  moods: string[]; // mood IDs this destination matches
  durationDays: number;
  monthlyData: MonthlyData[]; // 12 entries, one per month
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
  crowdLevel: CrowdLevel;
  weather: WeatherType;
  monthlyPrices: number[]; // 12-element array (index 0 = Jan)
}

export interface TripRecommendation {
  destination: Destination;
  costBreakdown: CostBreakdown;
  timingInsight: TimingInsight;
  matchScore: number; // 0–100
  aiReason: string;
  badges: string[];
}

export interface UserPreferences {
  name?: string;
  preferredBudgetRange?: BudgetRange;
  moods?: string[]; // mood IDs
  savedTrips: string[]; // destination IDs
}
