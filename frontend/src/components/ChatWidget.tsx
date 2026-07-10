import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '../state/AppContext';
import { sendChatMessage, type ChatMessage } from '../lib/api';
import { BUDGET_RANGES } from '../data/constants';
import { track } from '../lib/analytics';
import Icon from './Icon';

interface DisplayMessage extends ChatMessage {
  mood?: string | null;
  budgetId?: string | null;
}

const GREETING = "Hi, tell me what kind of trip you're after and I'll find some escapes.";

/** Floating chat concierge, mounted globally in Layout. A conversational
 *  front end to the same mood/budget filters Discover already sets — it
 *  doesn't run its own recommendation logic, it just hands off to
 *  /explore once it's confident about what the traveller wants. */
export default function ChatWidget() {
  const navigate = useNavigate();
  const { setMood, setBudget } = useApp();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, open]);

  function toggleOpen() {
    setOpen((prev) => {
      if (!prev) track('chat_opened');
      return !prev;
    });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    const next: DisplayMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);
    track('chat_message_sent');
    try {
      const res = await sendChatMessage(next.map(({ role, content }) => ({ role, content })));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply, mood: res.mood, budgetId: res.budgetId },
      ]);
      if (res.mood || res.budgetId) track('chat_preferences_extracted', { mood: res.mood, budgetId: res.budgetId });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Hmm, that one got away from me — mind asking again?' },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSeeEscapes(mood: string | null | undefined, budgetId: string | null | undefined) {
    setMood(mood ?? null);
    setBudget(budgetId ? (BUDGET_RANGES.find((b) => b.id === budgetId) ?? null) : null);
    track('chat_cta_clicked', { mood, budgetId });
    setOpen(false);
    navigate('/explore');
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={open ? 'Close chat' : 'Chat with TailorTrip'}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0px_4px_20px_rgba(23,22,15,0.16)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <Icon name={open ? 'close' : 'forum'} className="text-[26px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with TailorTrip"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-36 right-4 z-40 flex h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[10px] border border-outline-variant bg-surface shadow-[0px_4px_20px_rgba(23,22,15,0.16)] md:bottom-24 md:right-6"
          >
            <div className="border-b border-outline-variant px-5 py-4">
              <p className="font-display text-headline-sm text-primary">Trip concierge</p>
              <p className="text-body-sm text-on-surface-variant">Tell me what you&apos;re after.</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <ChatBubble role="assistant" content={GREETING} />
              {messages.map((m, i) => (
                <div key={i}>
                  <ChatBubble role={m.role} content={m.content} />
                  {m.role === 'assistant' && (m.mood || m.budgetId) && (
                    <button
                      type="button"
                      onClick={() => handleSeeEscapes(m.mood, m.budgetId)}
                      className="mt-2 rounded-full border border-primary px-4 py-2 text-body-sm text-primary transition-colors hover:bg-surface-container"
                    >
                      See matching escapes →
                    </button>
                  )}
                </div>
              ))}
              {sending && <ChatBubble role="assistant" content="…" />}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2 border-t border-outline-variant p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="A relaxing beach trip under 10k…"
                className="flex-1 rounded-full border border-outline-variant bg-transparent px-4 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40"
              >
                <Icon name="arrow_upward" className="text-[18px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[85%] rounded-[10px] px-4 py-2 text-body-sm ${
          role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
        }`}
      >
        {content}
      </p>
    </div>
  );
}
