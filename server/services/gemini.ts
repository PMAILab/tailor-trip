import { GoogleGenAI } from '@google/genai';
import type { Destination, MonthlyData } from '../../src/types/types';

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
