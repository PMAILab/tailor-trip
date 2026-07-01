/** Material Symbols Outlined icon, matching the Stitch design set. */
export default function Icon({
  name,
  className = '',
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span className={`material-symbols-outlined ${className}`} data-fill={filled ? '1' : '0'} aria-hidden="true">
      {name}
    </span>
  );
}
