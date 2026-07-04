import type { HTMLAttributes } from 'react';

/** Flat bone-white container with a hairline border and 10px radius — no shadow. */
export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card bg-surface-container-lowest hairline-all ${className}`} {...props} />;
}
