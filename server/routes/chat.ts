import { Router } from 'express';
import { generateChatReply, type ChatMessage } from '../services/geminiChat';

const router = Router();

// Caps the transcript sent to Gemini each turn — keeps prompts small and
// bounds cost as a conversation grows long.
const MAX_MESSAGES = 20;

function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== 'object') return false;
  const { role, content } = m as Record<string, unknown>;
  return (role === 'user' || role === 'assistant') && typeof content === 'string' && content.trim().length > 0;
}

router.post('/', async (req, res) => {
  try {
    const raw: unknown[] = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages = raw.filter(isChatMessage).slice(-MAX_MESSAGES);

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      res.status(400).json({ error: 'Expected a non-empty message list ending with a user message' });
      return;
    }

    const result = await generateChatReply(messages);
    res.json(result);
  } catch (err) {
    console.error('POST /api/chat failed:', err);
    res.status(500).json({ error: 'Failed to get a reply' });
  }
});

export default router;
