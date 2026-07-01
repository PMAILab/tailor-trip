import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTripDetails, type TripDetailResponse } from '../lib/api';
import { useApp } from '../state/AppContext';
import { openBooking } from '../lib/booking';
import { formatINR, monthLabel } from '../lib/format';
import type { TradeOffMode } from '../types/types';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import MonthPriceChart from '../components/MonthPriceChart';

type Status = 'loading' | 'error' | 'notfound' | 'done';

export default function TripDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { selectedBudget, isSaved, toggleSave } = useApp();
  const [data, setData] = useState<TripDetailResponse | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [timing, setTiming] = useState<Exclude<TradeOffMode, 'balanced'>>('cheapest');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getTripDetails(id);
      setData(res);
      setStatus('done');
    } catch (err) {
      setStatus(err instanceof Error && err.message.includes('not found') ? 'notfound' : 'error');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === 'loading') return <TripSkeleton />;
  if (status === 'error') return <ErrorState onRetry={() => void load()} />;
  if (status === 'notfound' || !data) {
    return (
      <EmptyState
        icon="explore_off"
        title="We could not find that trip"
        description="It may have moved. Head back to explore and pick another escape."
        action={
          <Link to="/explore">
            <Button variant="accent">Back to explore</Button>
          </Link>
        }
      />
    );
  }

  const d = data.destination;
  const opt = data.options[timing];
  const { costBreakdown: cb, timingInsight: ti } = opt;
  const saved = isSaved(d.id);

  const breakdown = [
    { label: 'Stay', value: cb.stay, color: 'bg-primary' },
    { label: 'Travel', value: cb.travel, color: 'bg-on-surface-variant' },
    { label: 'Food and experiences', value: cb.foodAndExperiences, color: 'bg-outline' },
  ];

  const target = selectedBudget?.max ?? null;
  const over = target !== null ? cb.total - target : 0;
  const fits = over <= 0;
  const fitPct = target !== null ? Math.min(100, Math.round((cb.total / target) * 100)) : 0;

  function handleBook() {
    openBooking(`${d.name} ${d.state}`, d.id);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12 lg:gap-16">
        {/* Left: hero + total */}
        <div className="space-y-8 lg:sticky lg:top-28 lg:col-span-5">
          <div>
            <h1 className="mb-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
              {d.name}
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              {d.state} • {d.durationDays} days
            </p>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-outline-variant">
            <img src={d.heroImages[0]} alt={`${d.name}, ${d.state}`} className="h-full w-full object-cover" />
          </div>
          <div className="border-t border-outline-variant pt-6">
            <p className="mb-1 text-label-caps uppercase text-on-surface-variant">Total estimated cost</p>
            <p className="tabular font-display text-display-lg-mobile text-primary">{formatINR(cb.total)}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Whole trip, around {formatINR(cb.perPerson)} per person
            </p>
          </div>
          <p className="flex items-start gap-2 border-t border-outline-variant pt-6 text-body-sm text-secondary">
            <Icon name="auto_awesome" className="mt-0.5 text-[16px]" />
            <span>{data.aiReason}</span>
          </p>
        </div>

        {/* Right: data + actions */}
        <div className="mt-4 space-y-16 lg:col-span-7 lg:mt-0">
          {/* Cost breakdown */}
          <section>
            <h2 className="mb-8 border-b border-outline-variant pb-4 font-display text-headline-sm text-primary">
              Cost breakdown
            </h2>
            <div className="space-y-6">
              {breakdown.map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-body-md text-on-surface">{row.label}</span>
                    <span className="tabular text-body-md text-primary">{formatINR(row.value)}</span>
                  </div>
                  <div className="h-[2px] w-full overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className={`h-full ${row.color}`}
                      style={{ width: `${cb.total ? Math.round((row.value / cb.total) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* When to go */}
          <section>
            <div className="mb-8 flex items-end justify-between border-b border-outline-variant pb-4">
              <h2 className="font-display text-headline-sm text-primary">When to go</h2>
              <div className="flex gap-4">
                {(
                  [
                    ['cheapest', 'Cheapest'],
                    ['least_crowded', 'Least crowded'],
                  ] as [Exclude<TradeOffMode, 'balanced'>, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTiming(mode)}
                    className={`pb-1 text-label-caps uppercase tracking-widest transition-colors ${
                      timing === mode
                        ? 'border-b border-primary text-primary'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 md:p-8">
              <MonthPriceChart
                prices={ti.monthlyPrices}
                selectedMonth={opt.month}
                cheapestMonth={ti.cheapestMonth}
              />
              <p className="mt-6 text-center text-body-sm text-on-surface-variant">
                {timing === 'cheapest'
                  ? `Cheapest around ${monthLabel(ti.cheapestMonth)}, at ${formatINR(cb.total)}.`
                  : `Quietest around ${monthLabel(opt.month)}, ${ti.crowdLevel.toLowerCase()} crowds and ${ti.weather.toLowerCase()} weather.`}
              </p>
            </div>
          </section>

          {/* Budget fit */}
          <section>
            <h2 className="mb-8 border-b border-outline-variant pb-4 font-display text-headline-sm text-primary">
              Budget fit
            </h2>
            {target !== null ? (
              <div className="rounded-xl border border-outline-variant bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-body-sm text-on-surface">Your target budget</span>
                  <span className="tabular text-body-md text-primary">{formatINR(target)}</span>
                </div>
                <div className="relative mt-4 h-[2px] w-full bg-surface-variant">
                  <div
                    className={`absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full ${fits ? 'bg-accent' : 'bg-on-surface-variant'}`}
                    style={{ width: `${fitPct}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-surface"
                    style={{ left: `calc(${fitPct}% - 4px)` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Current estimate {formatINR(cb.total)}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider ${fits ? 'text-accent' : 'text-error'}`}
                  >
                    {fits ? `${formatINR(target - cb.total)} to spare` : `${formatINR(over)} over`}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                Set a budget on the{' '}
                <Link to="/discover" className="text-primary underline underline-offset-4">
                  discover
                </Link>{' '}
                screen to see how this trip fits.
              </p>
            )}
          </section>

          {/* Actions */}
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => navigate(`/itinerary/new?dest=${d.id}`)}
              className="w-full rounded-[4px] bg-accent px-6 py-4 text-body-md text-on-accent transition-colors hover:bg-accent-hover"
            >
              Generate a day by day itinerary
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => toggleSave(d.id, d.name)}>
                <Icon name={saved ? 'bookmark' : 'bookmark_border'} filled={saved} className="text-[18px]" />
                {saved ? 'Saved' : 'Save to shortlist'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate('/compare')}>
                <Icon name="balance" className="text-[18px]" />
                Compare
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleBook}>
                Book this trip
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TripSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-16">
        <div className="space-y-6 lg:col-span-5">
          <div className="h-10 w-2/3 animate-pulse rounded bg-surface-container-high" />
          <div className="aspect-[4/5] w-full animate-pulse rounded-xl bg-surface-container-high" />
        </div>
        <div className="space-y-6 lg:col-span-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
          ))}
          <div className="h-48 w-full animate-pulse rounded-xl bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}
