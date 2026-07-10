import { useEffect, useState } from 'react';
import Icon from './Icon';

const LINES = [
  'Curating trips that actually fit your mood…',
  'Checking real prices, not placeholder numbers…',
  'No fake urgency, just picks worth your time…',
];

/** A short, honest rotating line shown while AI-backed content loads —
 *  gives the wait a bit of personality and something to read instead of a
 *  bare spinner, without resorting to fabricated stats or social proof. */
export default function TrustLoadingLine() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % LINES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="mb-8 flex items-center gap-2 text-body-sm text-on-surface-variant" role="status">
      <Icon name="auto_awesome" className="text-[16px] text-secondary" />
      {LINES[index]}
    </p>
  );
}
