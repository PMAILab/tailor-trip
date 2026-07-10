import { useNavigate } from 'react-router-dom';
import { MOODS, BUDGET_RANGES } from '../data/constants';
import { useApp } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { track } from '../lib/analytics';
import Icon from '../components/Icon';
import type { TradeOffMode } from '../types/types';

const PRIORITIES: [TradeOffMode, string][] = [
  ['balanced', 'Best overall'],
  ['least_crowded', 'Least crowded'],
  ['cheapest', 'Cheapest'],
];

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedMood, setMood, selectedBudget, setBudget, tradeOff, setTradeOff } = useApp();

  const firstName = user?.name?.split(' ')[0];

  function handleCurate() {
    if (!selectedMood) return;
    track('mood_selected', {
      mood: selectedMood,
      budget: selectedBudget?.id ?? null,
      tradeOff,
    });
    navigate('/explore');
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <header className="mb-12 text-center md:mb-16 md:text-left">
        {firstName && (
          <p className="mb-2 whitespace-nowrap text-body-lg text-on-surface-variant">Hi, {firstName}</p>
        )}
        <h1 className="mx-auto max-w-2xl font-display text-display-lg-mobile text-primary md:mx-0 md:text-display-lg">
          Where is your head at today?
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        {/* Mood grid */}
        <div className="md:col-span-8">
          <div className="grid grid-cols-2 hairline-t hairline-l md:grid-cols-3">
            {MOODS.map((m) => {
              const active = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(active ? null : m.id)}
                  aria-pressed={active}
                  className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden p-6 text-center hairline-b hairline-r"
                >
                  <img
                    src={m.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {active && <div className="pointer-events-none absolute inset-0 z-10 border-2 border-white" />}
                  <Icon
                    name={m.icon}
                    filled={active}
                    className="relative z-10 mb-3 text-4xl text-white"
                  />
                  <span className="relative z-10 font-display text-headline-sm text-white">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex flex-col gap-10 md:col-span-4 md:mt-0 md:pl-12 md:hairline-l">
          <div className="flex flex-col gap-4">
            <h3 className="text-label-caps uppercase tracking-widest text-on-surface-variant">Budget</h3>
            <div className="flex flex-wrap gap-2">
              {BUDGET_RANGES.map((b) => {
                const active = selectedBudget?.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudget(active ? null : b)}
                    className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${
                      active
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full hairline-t" />

          <div className="flex flex-col gap-4">
            <h3 className="text-label-caps uppercase tracking-widest text-on-surface-variant">Priority</h3>
            <div className="flex gap-3">
              {PRIORITIES.map(([mode, label]) => {
                const active = tradeOff === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTradeOff(mode)}
                    className={`flex-1 rounded-[4px] border border-primary px-4 py-3 text-body-sm transition-colors ${
                      active ? 'bg-primary text-on-primary' : 'bg-transparent text-primary hover:bg-surface-container'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 md:mt-auto">
            <button
              type="button"
              onClick={handleCurate}
              disabled={!selectedMood}
              className="w-full rounded-[4px] bg-accent px-6 py-4 text-body-md text-on-accent transition-all hover:bg-accent-hover disabled:opacity-40"
            >
              Curate my escape
            </button>
            {!selectedMood && (
              <p className="mt-3 text-center text-body-sm text-on-surface-variant md:text-left">
                Pick a mood to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
