import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getTripSummaries, streamCompareVerdict } from '../lib/api';
import type { TripRecommendation } from '../types/types';
import { track } from '../lib/analytics';
import { openBooking } from '../lib/booking';
import { formatINR, monthLabel } from '../lib/format';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

type Status = 'loading' | 'error' | 'done';

const crowdRank = (c: string) => (c === 'Low' ? 0 : c === 'Medium' ? 1 : 2);
const HL = 'bg-tertiary-fixed border border-tertiary-fixed-dim rounded-lg';

function bookOut(name: string, state: string, id: string) {
  openBooking(`${name} ${state}`, id);
}

export default function Compare() {
  const { shortlist, selectedMood, tradeOff } = useApp();
  const [recs, setRecs] = useState<TripRecommendation[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [selected, setSelected] = useState<string[]>([]);
  const [verdict, setVerdict] = useState('');
  const [verdictLoading, setVerdictLoading] = useState(false);
  const openedFired = useRef(false);

  const load = useCallback(async () => {
    if (shortlist.length < 2) {
      setStatus('done');
      return;
    }
    setStatus('loading');
    try {
      const res = await getTripSummaries({ ids: shortlist, mood: selectedMood, tradeOff });
      setRecs(res.recommendations);
      setSelected(res.recommendations.slice(0, 3).map((r) => r.destination.id));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [shortlist, selectedMood, tradeOff]);

  useEffect(() => {
    void load();
  }, [load]);

  const byId = useMemo(() => Object.fromEntries(recs.map((r) => [r.destination.id, r])), [recs]);
  const selectedRecs = selected.map((id) => byId[id]).filter(Boolean) as TripRecommendation[];
  const selectedKey = selected.join(',');

  // Best value per row.
  const bestCostId = selectedRecs.reduce<string | null>(
    (best, r) => (best === null || r.costBreakdown.total < byId[best].costBreakdown.total ? r.destination.id : best),
    null,
  );
  const bestCrowdId = selectedRecs.reduce<string | null>(
    (best, r) =>
      best === null || crowdRank(r.timingInsight.crowdLevel) < crowdRank(byId[best].timingInsight.crowdLevel)
        ? r.destination.id
        : best,
    null,
  );
  const bestMatchId = selectedRecs.reduce<string | null>(
    (best, r) => (best === null || r.matchScore > byId[best].matchScore ? r.destination.id : best),
    null,
  );

  // Real loss-aversion framing: surface the actual price gap between the
  // cheapest selected trip and the next-cheapest, computed from real
  // costBreakdown totals (no fabricated figures).
  const byCost = [...selectedRecs].sort((a, b) => a.costBreakdown.total - b.costBreakdown.total);
  const costDelta =
    byCost.length >= 2 ? byCost[1].costBreakdown.total - byCost[0].costBreakdown.total : 0;

  // Stream the AI verdict whenever the selection changes.
  useEffect(() => {
    if (selectedRecs.length < 2) {
      setVerdict('');
      return;
    }
    if (!openedFired.current) {
      track('compare_opened', { count: selectedRecs.length });
      openedFired.current = true;
    }
    const ctrl = new AbortController();
    setVerdict('');
    setVerdictLoading(true);
    streamCompareVerdict(
      {
        destinations: selectedRecs.map((r) => ({
          name: r.destination.name,
          state: r.destination.state,
          total: r.costBreakdown.total,
          crowd: r.timingInsight.crowdLevel,
          weather: r.timingInsight.weather,
          matchScore: r.matchScore,
        })),
        mood: selectedMood,
      },
      (t) => setVerdict((prev) => prev + t),
      ctrl.signal,
    )
      .catch(() => {
        if (!ctrl.signal.aborted) setVerdict('We could not generate a recommendation right now.');
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setVerdictLoading(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, selectedMood]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.length <= 2 ? prev : prev.filter((x) => x !== id);
      return prev.length >= 3 ? prev : [...prev, id];
    });
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
        <div className="mb-8 h-8 w-56 animate-pulse rounded bg-surface-container-high" />
        <div className="h-96 w-full animate-pulse rounded-xl bg-surface-container-high" />
      </div>
    );
  }
  if (status === 'error') return <ErrorState onRetry={() => void load()} />;

  if (shortlist.length < 2) {
    return (
      <EmptyState
        icon="balance"
        title="Save two trips to compare"
        description="Compare needs at least two saved destinations. Add a couple from explore and come back."
        action={
          <Link to="/explore">
            <Button variant="accent">Explore destinations</Button>
          </Link>
        }
      />
    );
  }

  const cell = 'border-b border-outline-variant p-4 align-top md:p-6';

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-headline-md text-primary">Compare shortlist</h1>
        <p className="text-body-md text-on-surface-variant">
          Pick two or three saved trips to line up side by side.
        </p>
      </div>

      {/* Selection chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {recs.map((r) => {
          const on = selected.includes(r.destination.id);
          return (
            <button
              key={r.destination.id}
              type="button"
              onClick={() => toggle(r.destination.id)}
              aria-pressed={on}
              className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${
                on
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary'
              }`}
            >
              {r.destination.name}
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              <th className={`${cell} sticky left-0 z-10 w-40 bg-surface align-bottom text-label-caps uppercase text-on-surface-variant`}>
                Dimension
              </th>
              {selectedRecs.map((r) => (
                <th key={r.destination.id} className={`${cell} align-bottom`}>
                  <img
                    src={r.destination.heroImages[0]}
                    alt={r.destination.name}
                    className="mb-4 h-40 w-full rounded-lg object-cover"
                  />
                  <h2 className="mb-1 font-display text-headline-sm text-primary">{r.destination.name}</h2>
                  <p className="mb-4 text-body-sm text-on-surface-variant">{r.destination.state}</p>
                  <button
                    type="button"
                    onClick={() => bookOut(r.destination.name, r.destination.state, r.destination.id)}
                    className="w-full rounded-lg bg-primary py-3 text-label-caps uppercase text-on-primary transition-opacity hover:opacity-90"
                  >
                    Book this trip
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-body-md">
            <Row label="Total cost">
              {selectedRecs.map((r) => {
                const isBest = r.destination.id === bestCostId;
                return (
                  <td key={r.destination.id} className={`${cell} ${isBest ? HL : ''}`}>
                    <span className="tabular text-primary">{formatINR(r.costBreakdown.total)}</span>
                    {isBest && costDelta > 0 && (
                      <span className="mt-1 block text-[10px] uppercase tracking-wider text-accent">
                        {formatINR(costDelta)} cheaper than {byCost[1].destination.name}
                      </span>
                    )}
                  </td>
                );
              })}
            </Row>
            <Row label="Breakdown">
              {selectedRecs.map((r) => (
                <td key={r.destination.id} className={cell}>
                  <ul className="space-y-1 text-body-sm text-on-surface-variant">
                    <li>Stay: {formatINR(r.costBreakdown.stay)}</li>
                    <li>Travel: {formatINR(r.costBreakdown.travel)}</li>
                    <li>Food: {formatINR(r.costBreakdown.foodAndExperiences)}</li>
                  </ul>
                </td>
              ))}
            </Row>
            <Row label="Best time">
              {selectedRecs.map((r) => (
                <td key={r.destination.id} className={cell}>
                  {monthLabel(r.timingInsight.cheapestMonth)}
                </td>
              ))}
            </Row>
            <Row label="Crowd">
              {selectedRecs.map((r) => (
                <td key={r.destination.id} className={`${cell} ${r.destination.id === bestCrowdId ? HL : ''}`}>
                  {r.timingInsight.crowdLevel}
                </td>
              ))}
            </Row>
            <Row label="Weather">
              {selectedRecs.map((r) => (
                <td
                  key={r.destination.id}
                  className={`${cell} ${r.timingInsight.weather === 'Pleasant' ? HL : ''}`}
                >
                  {r.timingInsight.weather}
                </td>
              ))}
            </Row>
            <Row label="Duration">
              {selectedRecs.map((r) => (
                <td key={r.destination.id} className={cell}>
                  {r.destination.durationDays} days
                </td>
              ))}
            </Row>
            <Row label="Match">
              {selectedRecs.map((r) => (
                <td key={r.destination.id} className={`${cell} ${r.destination.id === bestMatchId ? HL : ''}`}>
                  <span className="tabular">{r.matchScore}%</span>
                </td>
              ))}
            </Row>
          </tbody>
        </table>
      </div>

      {/* AI recommendation */}
      {selectedRecs.length >= 2 && (
        <div className="mt-12 max-w-3xl rounded-xl border border-outline-variant bg-surface-container-low p-8">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="auto_awesome" className="text-on-surface-variant" />
            <span className="text-label-caps uppercase text-on-surface-variant">AI recommendation</span>
          </div>
          <p className="font-display text-headline-sm leading-relaxed text-primary">
            {verdict}
            {verdictLoading && (
              <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-primary align-middle" aria-hidden="true" />
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="sticky left-0 z-10 border-b border-outline-variant bg-surface p-4 font-medium text-on-surface-variant md:p-6">
        {label}
      </td>
      {children}
    </tr>
  );
}
