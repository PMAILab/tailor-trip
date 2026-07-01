import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { getRecommendations } from '../lib/api';
import type { TripRecommendation } from '../types/types';
import { MOODS } from '../data/constants';
import TripCard from '../components/TripCard';
import SkeletonCard from '../components/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

type Status = 'loading' | 'error' | 'done';

export default function Explore() {
  const { selectedMood, selectedBudget, tradeOff, setBudget } = useApp();
  const [recs, setRecs] = useState<TripRecommendation[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await getRecommendations({
        mood: selectedMood,
        budgetId: selectedBudget?.id ?? null,
        tradeOff,
      });
      setRecs(res.recommendations);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, [selectedMood, selectedBudget, tradeOff]);

  useEffect(() => {
    void load();
  }, [load]);

  const moodLabel = selectedMood ? MOODS.find((m) => m.id === selectedMood)?.label : null;
  const subtitle = moodLabel
    ? `Because you are in a ${moodLabel.toLowerCase()} mood`
    : 'A handpicked mix to get you started';

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-10">
        <h1 className="mb-2 font-display text-headline-md text-primary">Curated escapes</h1>
        <p className="text-body-md text-on-surface-variant">
          {subtitle}
          {selectedBudget ? `, within ${selectedBudget.label.toLowerCase()}` : ''}.
        </p>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState onRetry={() => void load()} />}

      {status === 'done' && recs.length === 0 && (
        <EmptyState
          icon="travel_explore"
          title="Nothing matched just yet"
          description="Try a different mood or widen your budget to see more escapes."
          action={
            selectedBudget ? (
              <Button variant="outline" onClick={() => setBudget(null)}>
                Clear budget
              </Button>
            ) : (
              <Link to="/discover">
                <Button variant="accent">Pick a mood</Button>
              </Link>
            )
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
