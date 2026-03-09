/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Mood =
    | 'Need a reset'
    | 'Adventure mode'
    | 'Budget weekend'
    | 'Romantic escape'
    | 'Workation vibe'
    | 'Explore something new';

export interface MoodMeta {
    mood: Mood;
    emoji: string;
    desc: string;
    img: string;
    gradient: string;
}

export type CrowdLevel = 'Low' | 'Medium' | 'High';
export type WeatherType = 'Pleasant' | 'Hot' | 'Rainy' | 'Cold';

export interface DestinationTag {
    text: string;
    type: 'weather' | 'crowd' | 'activity' | 'info';
    crowdLevel?: CrowdLevel;
    weatherType?: WeatherType;
}

export interface CostBreakdownData {
    travel: number;
    stay: number;
    food: number;
    experiences: number;
}

export interface MonthlyData {
    month: string;
    cost: number;
    crowdLevel: CrowdLevel;
    weather: WeatherType;
}

export interface Destination {
    id: string;
    name: string;
    region: string;
    subtitle: string;
    img: string;
    estimatedCost: string;
    cheapestMonth: string;
    duration: string;
    durationAssumption: string;
    matchPercent: number;
    tags: DestinationTag[];
    whyItFitsYou: string;
    badge?: string;
    costBreakdown: CostBreakdownData;
    monthlyData: MonthlyData[];
}

export interface RecommendationsResponse {
    destinations: Destination[];
}
