import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getTripSummaries } from '../lib/api';
import type { TripRecommendation } from '../types/types';
import TripCard from '../components/TripCard';
import SkeletonCard from '../components/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Icon from '../components/Icon';

type Status = 'loading' | 'error' | 'done';

export default function Shortlist() {
  const navigate = useNavigate();
  const { shortlist, selectedMood, tradeOff } = useApp();
  const [recs, setRecs] = useState<TripRecommendation[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    if (shortlist.length === 0) {
      setRecs([]);
      setStatus('done');
      return;
    }
    setStatus('loading');
    try {
      const res = await getTripSummaries({ ids: shortlist, mood: selectedMood, tradeOff });
      setRecs(res.recommendations);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [shortlist, selectedMood, tradeOff]);

  useEffect(() => {
    void load();
  }, [load]);

  const canCompare = shortlist.length >= 2;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="mb-4 font-display text-display-lg-mobile text-primary md:text-display-lg">
            Your shortlist
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            The trips you saved, ready for a closer look. Compare any two to decide.
          </p>
          {shortlist.length > 0 && (
            <p className="mt-2 text-label-caps uppercase tracking-widest text-accent">
              {shortlist.length} trip{shortlist.length === 1 ? '' : 's'} saved
            </p>
          )}
        </div>
        <div className="shrink-0">
          <Button
            variant="primary"
            disabled={!canCompare}
            onClick={() => navigate('/compare')}
            title={canCompare ? undefined : 'Save at least two trips to compare'}
          >
            <Icon name="compare_arrows" className="text-[18px]" />
            Compare selections
          </Button>
        </div>
      </header>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState onRetry={() => void load()} />}

      {status === 'done' && recs.length === 0 && (
        <EmptyState
          icon="bookmark_border"
          title="Nothing saved yet"
          description="Browse the escapes and tap the bookmark on any trip to keep it here."
          action={
            <Link to="/explore">
              <Button variant="accent">Explore destinations</Button>
            </Link>
          }
        />
      )}

      {status === 'done' && recs.length > 0 && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {recs.map((r) => (
            <TripCard key={r.destination.id} rec={r} />
          ))}
        </div>
      )}
    </div>
  );
}
