import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'accent' | 'outline' | 'quiet';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-body rounded-[4px] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90', // deep ink
  accent: 'bg-accent text-on-accent hover:bg-accent-hover', // deep green — conversion CTA
  outline: 'border border-primary text-primary hover:bg-surface-container',
  quiet: 'text-on-surface-variant hover:text-primary underline underline-offset-4',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-3 text-body-sm',
  lg: 'px-8 py-4 text-body-md',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
