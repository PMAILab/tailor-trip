import { MONTH_LABELS } from '../data/constants';

/** Indian-format rupee amount with the ₹ symbol, no decimals. */
export function formatINR(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/** 1–12 → short month label. */
export function monthLabel(month: number): string {
  return MONTH_LABELS[Math.max(0, Math.min(11, month - 1))];
}
