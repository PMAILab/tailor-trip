import { getClient, MODEL } from './gemini';
import { MOODS, BUDGET_RANGES } from '../../src/data/constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  mood: string | null;
  budgetId: string | null;
}

const MOOD_LIST = MOODS.map((m) => `${m.id} (${m.label}: ${m.description})`).join('; ');
const BUDGET_LIST = BUDGET_RANGES.map((b) => `${b.id} (${b.label})`).join('; ');

function buildPrompt(messages: ChatMessage[]): string {
  const transcript = messages.map((m) => `${m.role === 'user' ? 'Traveller' : 'You'}: ${m.content}`).join('\n');
  return `You are a warm, plain-spoken travel concierge for TailorTrip, an India-only trip planner. Chat naturally with the traveller to understand what kind of trip they want. Reply in 1 to 2 short sentences, and ask a follow-up question if you need more to go on.

Moods you can match to (use the id exactly as spelled): ${MOOD_LIST}
Budgets you can match to (use the id exactly as spelled): ${BUDGET_LIST}

Conversation so far:
${transcript}

Return ONLY JSON in exactly this shape: {"reply": string, "mood": string or null, "budgetId": string or null}
Rules: only set mood or budgetId once you are reasonably confident from what the traveller actually said; otherwise use null. Do not use dashes of any kind; use commas or short sentences instead.`;
}

/** Simple keyword match against mood/budget labels — used both as the
 *  no-key/error fallback and as a last-resort layer if the model's JSON
 *  omits a field it should have caught. Free, instant, no AI call. */
function heuristicExtract(text: string): { mood: string | null; budgetId: string | null } {
  const lower = text.toLowerCase();
  const mood = MOODS.find((m) => lower.includes(m.id.replace('_', ' ')) || lower.includes(m.label.toLowerCase()))?.id ?? null;
  const budgetId = BUDGET_RANGES.find((b) => lower.includes(b.label.toLowerCase()))?.id ?? null;
  return { mood, budgetId };
}

function fallbackReply(messages: ChatMessage[]): ChatReply {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const { mood, budgetId } = heuristicExtract(lastUser);
  const reply = mood
    ? `Got it, sounds like a ${MOODS.find((m) => m.id === mood)?.label.toLowerCase()} trip. Tap below to see matching escapes, or tell me more.`
    : 'Tell me the vibe you are going for, like a relaxing reset or an adventure, and your rough budget, and I will pull up matching escapes.';
  return { reply, mood, budgetId };
}

function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start >= 0 && end > start ? text.slice(start, end + 1) : '{}';
}

/** One JSON-mode Gemini call per turn — deliberately not real token
 *  streaming, so a reply and its extracted mood/budget arrive together in a
 *  single request. Keeps this to exactly one AI call per message (the free
 *  tier's daily quota is easy to exhaust) rather than a reply call plus a
 *  separate extraction call. */
export async function generateChatReply(messages: ChatMessage[]): Promise<ChatReply> {
  const ai = getClient();
  if (!ai) return fallbackReply(messages);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(messages),
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(extractJson(response.text ?? '{}')) as Partial<ChatReply>;
    const fb = fallbackReply(messages);
    const reply = typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : fb.reply;
    const mood = typeof parsed.mood === 'string' && MOODS.some((m) => m.id === parsed.mood) ? parsed.mood : fb.mood;
    const budgetId =
      typeof parsed.budgetId === 'string' && BUDGET_RANGES.some((b) => b.id === parsed.budgetId)
        ? parsed.budgetId
        : fb.budgetId;
    return { reply, mood, budgetId };
  } catch (err) {
    console.error('Gemini generateChatReply error:', err);
    return fallbackReply(messages);
  }
}
