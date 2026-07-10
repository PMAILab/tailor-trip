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
import { getSavedItineraries, regenerateItineraryDay, saveItinerary, streamItinerary } from '../lib/api';
import { useAuth } from './AuthContext';
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
  savedLoading: boolean;
  regeneratingDay: number | null;
  generate: (inputs: ItineraryInputs) => void;
  regenerateDay: (dayNumber: number) => Promise<void>;
  editSlot: (dayNumber: number, slot: SlotKey, patch: Partial<ActivitySlot>) => void;
  saveCurrent: () => Promise<string | null>;
  getSaved: (id: string) => SavedItinerary | undefined;
  buildShareText: (days: ItineraryDay[], inputs: ItineraryInputs | null) => string;
  shareCurrent: () => Promise<boolean>;
}

const ItineraryContext = createContext<ItineraryState | null>(null);

function loadLocalSaved(): SavedItinerary[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedItinerary[]) : [];
  } catch {
    return [];
  }
}

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const { user, isMock, loading: authLoading } = useAuth();
  const [current, setCurrent] = useState<Current>({ inputs: null, days: [], status: 'idle' });
  const [saved, setSaved] = useState<SavedItinerary[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Mirrors AppContext's shortlist loading: mock mode reads localStorage
  // (unchanged from before real auth existed); a real signed-in user gets
  // their server-persisted itineraries; signed-out is empty.
  useEffect(() => {
    if (authLoading) return;
    if (isMock) {
      setSaved(loadLocalSaved());
      setSavedLoading(false);
      return;
    }
    if (!user) {
      setSaved([]);
      setSavedLoading(false);
      return;
    }
    let active = true;
    setSavedLoading(true);
    getSavedItineraries()
      .then(({ itineraries }) => {
        if (active) setSaved(itineraries);
      })
      .catch(() => {
        if (active) setSaved([]);
      })
      .finally(() => {
        if (active) setSavedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, isMock, user]);

  // Mock mode only — real mode persists via the API on save instead.
  useEffect(() => {
    if (isMock) localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [isMock, saved]);

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

  const saveCurrent = useCallback(async (): Promise<string | null> => {
    if (!current.inputs || current.days.length === 0) return null;

    if (isMock) {
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
    }

    try {
      const { itinerary } = await saveItinerary(current.inputs, current.days);
      setSaved((prev) => [itinerary, ...prev]);
      track('itinerary_saved', { destination: current.inputs.destination, days: current.days.length });
      return itinerary.id;
    } catch (err) {
      console.error('saveItinerary failed:', err);
      return null;
    }
  }, [current, isMock]);

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
    savedLoading,
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
