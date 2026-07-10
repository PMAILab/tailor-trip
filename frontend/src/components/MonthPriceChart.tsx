import { MONTH_LABELS } from '../data/constants';
import { formatINR } from '../lib/format';

/** Minimal 12-month price bar chart. Highlights the selected month (ink) and
 *  the cheapest month (outline); months with no access render as a stub. */
export default function MonthPriceChart({
  prices,
  selectedMonth,
  cheapestMonth,
}: {
  prices: number[];
  selectedMonth: number;
  cheapestMonth: number;
}) {
  const max = Math.max(...prices, 1);

  return (
    <div className="flex h-48 items-end justify-between gap-1.5">
      {prices.map((price, i) => {
        const month = i + 1;
        const closed = price === 0;
        const height = closed ? 6 : Math.round(24 + (price / max) * 150);
        const isSelected = month === selectedMonth;
        const isCheapest = month === cheapestMonth;
        return (
          <div key={month} className="flex w-full flex-col items-center gap-2">
            <div
              className={`w-2 rounded-t-sm transition-colors ${
                isSelected ? 'bg-primary' : isCheapest ? 'bg-outline' : 'bg-surface-variant'
              } ${closed ? 'opacity-50' : ''}`}
              style={{ height: `${height}px` }}
              title={closed ? `${MONTH_LABELS[i]}: limited access` : `${MONTH_LABELS[i]}: ${formatINR(price)}`}
            />
            <span
              className={`text-[10px] uppercase tracking-wider ${
                isSelected ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {MONTH_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
