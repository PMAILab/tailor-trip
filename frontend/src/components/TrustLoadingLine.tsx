import { useEffect, useState } from 'react';
import Icon from './Icon';

/** Shared pool of rotating lines for any AI-backed wait — one honest/trust
 *  line, one playful line, repeat. Keeps the OTA-trust tone (real prices,
 *  no fake urgency) while still giving the wait some personality instead of
 *  reading like dead air. */
export const AI_LOADING_LINES = [
  'AI is cooking up your trip…',
  'Curating trips that actually fit your mood…',
  'Checking real prices, not placeholder numbers…',
  'Teaching the AI what a good sunset looks like…',
  'No fake urgency, just picks worth your time…',
  'Mapping out mornings, afternoons and evenings…',
  "Cross-checking crowd levels so you don't regret August…",
  'Picking spots that locals actually rate…',
  'Running the numbers so your budget holds…',
  'Almost there, just polishing the details…',
];

/** Rotates through `lines` on a fixed interval — the hook behind
 *  TrustLoadingLine, exposed separately so other loading states (e.g. the
 *  itinerary generator) can reuse the same rotation with their own markup. */
export function useRotatingLine(lines: string[], intervalMs = 1800): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % lines.length), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, intervalMs]);

  return lines[index];
}

/** A short, honest rotating line shown while AI-backed content loads —
 *  gives the wait a bit of personality and something to read instead of a
 *  bare spinner, without resorting to fabricated stats or social proof. */
export default function TrustLoadingLine() {
  const line = useRotatingLine(AI_LOADING_LINES);

  return (
    <p className="mb-8 flex items-center gap-2 text-body-sm text-on-surface-variant" role="status">
      <Icon name="auto_awesome" className="text-[16px] text-secondary" />
      {line}
    </p>
  );
}
