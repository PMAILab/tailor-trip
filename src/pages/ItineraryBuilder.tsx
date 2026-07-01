import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DESTINATIONS } from '../data/constants';
import { PARTY_TYPES, INTERESTS, PACES, DIETARY } from '../data/itineraryOptions';
import { BUDGET_RANGES } from '../data/constants';
import { useApp } from '../state/AppContext';
import { useItinerary } from '../state/ItineraryContext';
import Icon from '../components/Icon';
import type { Dietary, Interest, ItineraryInputs, PartyType, Pace } from '../types/types';

const inputClass =
  'w-full bg-transparent border-b border-primary text-on-surface text-body-md py-4 focus:outline-none focus:border-b-2 placeholder:text-outline transition-all';

export default function ItineraryBuilder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { selectedBudget } = useApp();
  const { generate } = useItinerary();

  const prefill = useMemo(() => {
    const dest = DESTINATIONS.find((d) => d.id === params.get('dest'));
    return dest ?? null;
  }, [params]);

  const [step, setStep] = useState<1 | 2>(1);
  const [destination, setDestination] = useState(prefill?.name ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [partyType, setPartyType] = useState<PartyType>('couple');
  const [budget, setBudget] = useState<string>(selectedBudget?.id ?? '5k-10k');
  const [interests, setInterests] = useState<Interest[]>(['nature', 'food_cafes']);
  const [dietary, setDietary] = useState<Dietary>('both');
  const [pace, setPace] = useState<Pace>('moderate');

  function toggleInterest(id: Interest) {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleGenerate() {
    const inputs: ItineraryInputs = {
      destination: destination.trim() || 'your destination',
      destinationId: prefill?.id,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      durationDays: prefill?.durationDays,
      partyType,
      budgetPerPerson: budget,
      interests,
      dietaryPreference: dietary,
      pace,
    };
    generate(inputs);
    navigate('/itinerary/draft');
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-margin-mobile py-12 md:px-margin-desktop">
      {/* Progress */}
      <div className="mb-12 h-[2px] w-full bg-outline-variant/40">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>

      {step === 1 ? (
        <div className="flex flex-col gap-10">
          <div className="text-center">
            <h1 className="mb-2 font-display text-headline-md text-primary md:text-display-lg">Where to?</h1>
            <p className="text-body-lg text-on-surface-variant">
              A few quick choices and we will plan your days.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">Destination</span>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Coorg, Udaipur, Rishikesh"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-6">
            <label className="block">
              <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">From</span>
              <input className={inputClass} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">To</span>
              <input className={inputClass} type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <div>
            <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Who is going</span>
            <div className="flex flex-wrap gap-3">
              {PARTY_TYPES.map((p) => (
                <Pill key={p.id} active={partyType === p.id} onClick={() => setPartyType(p.id)} icon={p.icon}>
                  {p.label}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Budget per person</span>
            <div className="flex flex-wrap gap-3">
              {BUDGET_RANGES.map((b) => (
                <Pill key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)}>
                  {b.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">Step 1 of 2</span>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!destination.trim()}
              className="rounded-[4px] bg-primary px-8 py-3 text-body-md text-on-primary transition-colors hover:bg-accent disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="text-center">
            <h1 className="mb-2 font-display text-headline-md text-primary md:text-display-lg">Your style</h1>
            <p className="text-body-lg text-on-surface-variant">Tune the plan to how you like to travel.</p>
          </div>

          <div>
            <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Interests</span>
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map((it) => (
                <Pill key={it.id} active={interests.includes(it.id)} onClick={() => toggleInterest(it.id)}>
                  {it.label}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Dietary preference</span>
            <div className="flex flex-wrap gap-3">
              {DIETARY.map((d) => (
                <Pill key={d.id} active={dietary === d.id} onClick={() => setDietary(d.id)}>
                  {d.label}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Pace</span>
            <div className="flex flex-wrap gap-3">
              {PACES.map((p) => (
                <Pill key={p.id} active={pace === p.id} onClick={() => setPace(p.id)}>
                  {p.label}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-label-caps uppercase tracking-widest text-on-surface-variant underline hover:text-primary">
              Back
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-[4px] bg-accent px-8 py-4 text-body-md text-on-accent transition-colors hover:bg-accent-hover"
            >
              Generate itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-body-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-outline-variant text-on-surface-variant hover:border-primary'
      }`}
    >
      {icon && <Icon name={icon} className="text-[18px]" />}
      {children}
    </button>
  );
}
