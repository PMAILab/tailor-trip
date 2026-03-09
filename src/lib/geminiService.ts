/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import type { Mood, Destination, RecommendationsResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

function getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'Spring (March-May)';
    if (month >= 6 && month <= 8) return 'Summer (June-August)';
    if (month >= 9 && month <= 11) return 'Autumn (September-November)';
    return 'Winter (December-February)';
}

function getCurrentMonthName(): string {
    return new Date().toLocaleString('en-IN', { month: 'long' });
}

function buildPrompt(mood: Mood): string {
    const season = getCurrentSeason();
    const month = getCurrentMonthName();

    return `You are TailorTrip's AI travel engine. A user has selected the mood: "${mood}".
The current season is ${season} (specifically ${month}).

Generate exactly 6 Indian destination recommendations that perfectly match this mood AND are ideal for this season/month.

Return ONLY a valid JSON object (no markdown, no code fences) with this exact structure:
{
  "destinations": [
    {
      "id": "unique-slug",
      "name": "City, State",
      "region": "Region Name",
      "subtitle": "Short tagline • Match%",
      "img": "https://images.unsplash.com/...(use a real, relevant Unsplash photo URL with ?auto=format&fit=crop&q=80&w=800)",
      "estimatedCost": "₹X,000 - ₹Y,000",
      "cheapestMonth": "Month name when this destination is cheapest to visit",
      "duration": "X-Y Days",
      "durationAssumption": "X Days, Y Nights",
      "matchPercent": 95,
      "tags": [
        { "text": "Pleasant 28°C", "type": "weather", "weatherType": "Pleasant" },
        { "text": "Low Crowd", "type": "crowd", "crowdLevel": "Low" }
      ],
      "whyItFitsYou": "2-3 sentence explanation of why this destination fits the selected mood and is great this season.",
      "badge": "optional string like 'Best in ${month}' or null",
      "costBreakdown": {
        "travel": 5000,
        "stay": 4000,
        "food": 2000,
        "experiences": 1500
      },
      "monthlyData": [
        { "month": "Jan", "cost": 10000, "crowdLevel": "Low", "weather": "Cold" },
        { "month": "Feb", "cost": 9500, "crowdLevel": "Low", "weather": "Pleasant" },
        { "month": "Mar", "cost": 11000, "crowdLevel": "Medium", "weather": "Pleasant" },
        { "month": "Apr", "cost": 12000, "crowdLevel": "Medium", "weather": "Hot" },
        { "month": "May", "cost": 13000, "crowdLevel": "High", "weather": "Hot" },
        { "month": "Jun", "cost": 9000, "crowdLevel": "Low", "weather": "Rainy" },
        { "month": "Jul", "cost": 8500, "crowdLevel": "Low", "weather": "Rainy" },
        { "month": "Aug", "cost": 8000, "crowdLevel": "Low", "weather": "Rainy" },
        { "month": "Sep", "cost": 9000, "crowdLevel": "Medium", "weather": "Pleasant" },
        { "month": "Oct", "cost": 10500, "crowdLevel": "Medium", "weather": "Pleasant" },
        { "month": "Nov", "cost": 11000, "crowdLevel": "High", "weather": "Pleasant" },
        { "month": "Dec", "cost": 14000, "crowdLevel": "High", "weather": "Cold" }
      ]
    }
  ]
}

Rules:
- All destinations must be in India.
- Match percent (matchPercent) must be between 75-98.
- Use only genuine Unsplash image URLs that realistically match the destination. Do NOT use placeholder images.
- Tags: include exactly 1 weather tag and 1 crowd tag per destination.
- Weather tags MUST include a "weatherType" field with one of: "Pleasant", "Hot", "Rainy", "Cold".
- Crowd tags MUST include a "crowdLevel" field with one of: "Low", "Medium", "High".
- cheapestMonth: include the month name when this destination is cheapest to visit.
- Ensure seasonal suitability — explain why the season makes it a great time to visit.
- Badge should be filled for the top 2 destinations, null for the rest.
- Sort destinations by matchPercent descending.
- costBreakdown: realistic INR amounts for travel (flights/trains), stay (hotels), food (daily budget), experiences (activities). They should roughly sum to the midpoint of estimatedCost.
- monthlyData: provide data for all 12 months (Jan-Dec). Use realistic, varied costs and crowd/weather values for each month. The cheapest month's cost should match the cheapestMonth field.
- durationAssumption: a human-readable string like "3 Days, 2 Nights".
`;
}

export async function getDestinationRecommendations(mood: Mood): Promise<RecommendationsResponse> {
    if (!API_KEY) {
        throw new Error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
        // model: 'gemini-2.5-flash',
        model: 'gemini-3.1-pro-preview',
        contents: buildPrompt(mood),
        config: {
            responseMimeType: 'application/json',
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error('Empty response from Gemini API');
    }

    try {
        const parsed = JSON.parse(text) as RecommendationsResponse;
        if (!parsed.destinations || !Array.isArray(parsed.destinations)) {
            throw new Error('Invalid response structure from Gemini API');
        }
        // Guarantee IDs are url-safe slugs
        parsed.destinations = parsed.destinations.map((d: Destination) => ({
            ...d,
            id: d.id || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }));
        return parsed;
    } catch {
        throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}`);
    }
}
