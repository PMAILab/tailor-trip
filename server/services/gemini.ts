import { GoogleGenAI } from '@google/genai';
import type { Destination, MonthlyData } from '../../src/types/types';

const MODEL = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (ai) return ai;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_API_KEY') return null;
  ai = new GoogleGenAI({ apiKey: key });
  return ai;
}

export async function generateWhyThisFits(
  destination: Destination,
  moodLabel: string,
  currentMonthData: MonthlyData
): Promise<string> {
  const client = getAI();
  if (!client) return fallbackReason(destination, moodLabel, currentMonthData);

  const prompt = `You are a friendly travel advisor. In 1-2 concise sentences, explain why "${destination.name}, ${destination.state}" is a great fit for someone in a "${moodLabel}" mood right now.

Context:
- Destination vibes: ${destination.sentiment.join(', ')}
- Current cost: ₹${currentMonthData.estimatedCost.toLocaleString('en-IN')}
- Crowd: ${currentMonthData.crowdLevel}
- Weather: ${currentMonthData.weather}
- Duration: ${destination.durationDays} days
- Description: ${destination.description}

Be specific, warm, and mention cost or weather if relevant. Do NOT start with the destination name.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = response.text?.trim();
    return text || fallbackReason(destination, moodLabel, currentMonthData);
  } catch (err) {
    console.error('Gemini API error:', err);
    return fallbackReason(destination, moodLabel, currentMonthData);
  }
}

function fallbackReason(
  destination: Destination,
  moodLabel: string,
  monthData: MonthlyData
): string {
  const crowd = monthData.crowdLevel === 'Low' ? 'with fewer crowds' : 
                monthData.crowdLevel === 'Medium' ? 'with moderate crowds' : 'though it can be crowded';
  return `Great for your ${moodLabel.toLowerCase()} mood — ${destination.description.split('—')[0].trim().toLowerCase()} ${crowd}, at around ₹${monthData.estimatedCost.toLocaleString('en-IN')} for ${destination.durationDays} days.`;
}
