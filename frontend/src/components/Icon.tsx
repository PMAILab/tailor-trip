import type { CSSProperties } from 'react';

/** Material Symbols Outlined icon, matching the Stitch design set. */
export default function Icon({
  name,
  className = '',
  filled = false,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={style}
      data-fill={filled ? '1' : '0'}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
