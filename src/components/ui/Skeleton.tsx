/** Loading placeholder block. Compose these to match a card's real shape. */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[4px] bg-surface-container-high ${className}`} />;
}
