import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ItineraryDay, ItineraryInputs, SavedItinerary, SlotKey, ActivitySlot } from '../types/types';
import { streamItinerary, regenerateItineraryDay } from '../lib/api';
import { track } from '../lib/analytics';

const SAVED_KEY = 'tailortrip.itineraries';

type GenStatus = 'idle' | 'generating' | 'done' | 'error';

interface Current {
  inputs: ItineraryInputs | null;
  days: ItineraryDay[];
  status: GenStatus;
}

interface ItineraryState {
  current: Current;
  saved: SavedItinerary[];
  regeneratingDay: number | null;
  generate: (inputs: ItineraryInputs) => void;
  regenerateDay: (dayNumber: number) => Promise<void>;
  editSlot: (dayNumber: number, slot: SlotKey, patch: Partial<ActivitySlot>) => void;
  saveCurrent: () => string | null;
  getSaved: (id: string) => SavedItinerary | undefined;
  buildShareText: (days: ItineraryDay[], inputs: ItineraryInputs | null) => string;
  shareCurrent: () => Promise<boolean>;
}

const ItineraryContext = createContext<ItineraryState | null>(null);

function loadSaved(): SavedItinerary[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedItinerary[]) : [];
  } catch {
    return [];
  }
}

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current>({ inputs: null, days: [], status: 'idle' });
  const [saved, setSaved] = useState<SavedItinerary[]>(() => loadSaved());
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const generate = useCallback((inputs: ItineraryInputs) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setCurrent({ inputs, days: [], status: 'generating' });

    streamItinerary(
      inputs,
      (day) => setCurrent((prev) => ({ ...prev, days: [...prev.days, day] })),
      ctrl.signal,
    )
      .then(() => {
        if (ctrl.signal.aborted) return;
        setCurrent((prev) => ({ ...prev, status: 'done' }));
        track('itinerary_generated', {
          destination: inputs.destination,
          interests: inputs.interests,
        });
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setCurrent((prev) => ({ ...prev, status: 'error' }));
      });
  }, []);

  const regenerateDay = useCallback(
    async (dayNumber: number) => {
      if (!current.inputs) return;
      setRegeneratingDay(dayNumber);
      try {
        const priorTitles = current.days
          .filter((d) => d.day !== dayNumber)
          .map((d) => d.title ?? '')
          .filter(Boolean);
        const { day } = await regenerateItineraryDay({
          inputs: current.inputs,
          dayNumber,
          date: current.days.find((d) => d.day === dayNumber)?.date,
          priorTitles,
        });
        setCurrent((prev) => ({
          ...prev,
          days: prev.days.map((d) => (d.day === dayNumber ? day : d)),
        }));
      } catch {
        /* keep the existing day on failure */
      } finally {
        setRegeneratingDay(null);
      }
    },
    [current.inputs, current.days],
  );

  const editSlot = useCallback((dayNumber: number, slot: SlotKey, patch: Partial<ActivitySlot>) => {
    setCurrent((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.day === dayNumber ? { ...d, slots: { ...d.slots, [slot]: { ...d.slots[slot], ...patch } } } : d,
      ),
    }));
  }, []);

  const saveCurrent = useCallback((): string | null => {
    if (!current.inputs || current.days.length === 0) return null;
    const id = crypto.randomUUID();
    const entry: SavedItinerary = {
      id,
      inputs: current.inputs,
      days: current.days,
      generatedAt: new Date().toISOString(),
    };
    setSaved((prev) => [entry, ...prev]);
    track('itinerary_saved', { destination: current.inputs.destination, days: current.days.length });
    return id;
  }, [current]);

  const getSaved = useCallback((id: string) => saved.find((s) => s.id === id), [saved]);

  const buildShareText = useCallback((days: ItineraryDay[], inputs: ItineraryInputs | null): string => {
    const header = inputs ? `${inputs.destination} itinerary (${days.length} days)` : 'Itinerary';
    const body = days
      .map((d) => {
        const lines = (['morning', 'afternoon', 'evening'] as SlotKey[]).map((k) => {
          const s = d.slots[k];
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          return `  ${label}: ${s.activity} at ${s.venue} (${s.cost})`;
        });
        return `Day ${d.day}${d.title ? `: ${d.title}` : ''}\n${lines.join('\n')}\n  Day cost: ${d.estimatedDayCost}`;
      })
      .join('\n\n');
    return `${header}\n\n${body}\n\nPlanned with TailorTrip`;
  }, []);

  const shareCurrent = useCallback(async (): Promise<boolean> => {
    const text = buildShareText(current.days, current.inputs);
    try {
      await navigator.clipboard.writeText(text);
      track('itinerary_shared', { destination: current.inputs?.destination });
      return true;
    } catch {
      return false;
    }
  }, [buildShareText, current]);

  const value: ItineraryState = {
    current,
    saved,
    regeneratingDay,
    generate,
    regenerateDay,
    editSlot,
    saveCurrent,
    getSaved,
    buildShareText,
    shareCurrent,
  };

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
}

export function useItinerary(): ItineraryState {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItinerary must be used within ItineraryProvider');
  return ctx;
}
