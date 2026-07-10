import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'sage' | 'accent' | 'outline';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-container text-on-surface-variant',
  sage: 'bg-[#d4d9d2] text-accent', // muted sage wash
  accent: 'bg-accent text-on-accent',
  outline: 'hairline-all text-on-surface-variant',
};

export default function Badge({
  tone = 'neutral',
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] px-2.5 py-1 text-label-caps ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
