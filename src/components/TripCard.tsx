import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { TripRecommendation } from '../types/types';
import { useApp } from '../state/AppContext';
import { track } from '../lib/analytics';
import { formatINR } from '../lib/format';
import Icon from './Icon';

/** Smart Destination Card: total cost, timing badges, and an AI reason it fits. */
export default function TripCard({ rec }: { rec: TripRecommendation }) {
  const { isSaved, toggleSave } = useApp();
  const d = rec.destination;
  const saved = isSaved(d.id);

  useEffect(() => {
    track('card_viewed', { id: d.id });
  }, [d.id]);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface transition-colors hover:border-primary">
      <Link to={`/trip/${d.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img
            src={d.heroImages[0]}
            alt={`${d.name}, ${d.state}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-1 font-display text-headline-sm text-primary">
                {d.name}, {d.state}
              </h2>
              <p className="text-body-sm text-on-surface-variant">{d.durationDays} days</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="block tabular text-body-lg font-medium text-primary">
                {formatINR(rec.costBreakdown.total)}
              </span>
              <span className="text-[12px] text-on-surface-variant">est. total</span>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {rec.badges.map((b) => (
              <span
                key={b}
                className="rounded border border-outline-variant px-2 py-1 text-[10px] uppercase tracking-wider text-on-surface-variant"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="border-t border-outline-variant pt-4">
            <p className="flex items-start gap-2 text-body-sm text-secondary">
              <Icon name="auto_awesome" className="mt-0.5 text-[16px]" />
              <span>{rec.aiReason}</span>
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}
        aria-pressed={saved}
        onClick={() => toggleSave(d.id, d.name)}
        className="absolute right-4 top-4 rounded-full bg-surface/90 p-2 backdrop-blur-sm transition-colors hover:bg-surface"
      >
        <Icon name={saved ? 'bookmark' : 'bookmark_border'} filled={saved} className="text-on-surface" />
      </button>
    </article>
  );
}
