import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { BudgetRange, TradeOffMode } from '../types/types';
import { useAuth } from './AuthContext';
import { track } from '../lib/analytics';
import { addToShortlist, getShortlist, removeFromShortlist, reverseGeocode } from '../lib/api';

const SHORTLIST_KEY = 'tailortrip.shortlist';

function loadLocalShortlist(): string[] {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export type LocationScope = 'near' | 'country';
// 'denied' is a real permission refusal; 'error' covers everything else
// (timeout, position unavailable) — collapsing them used to show the same
// "not available" message for a user who tapped Allow but whose device
// just took too long to resolve, with no way to tell the two apart.
export type LocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable' | 'error';

interface AppState {
  selectedMood: string | null;
  selectedBudget: BudgetRange | null;
  tradeOff: TradeOffMode;
  shortlist: string[]; // destination ids
  shortlistLoading: boolean;
  setMood: (moodId: string | null) => void;
  setBudget: (budget: BudgetRange | null) => void;
  setTradeOff: (mode: TradeOffMode) => void;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string, name?: string) => void;
  // Location — defaults to 'country' so the initial paint never blocks on a
  // permission prompt; "near me" only activates once the browser grants it.
  locationScope: LocationScope;
  locationStatus: LocationStatus;
  coords: { lat: number; lng: number } | null;
  /** Human-readable place name for `coords` (e.g. "Mumbai, Maharashtra"), so
   *  the user can see on screen where "near me" actually resolved to. Null
   *  while resolving or if it couldn't be resolved. */
  locationLabel: string | null;
  requestLocation: () => void;
  browseAllOfIndia: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isMock, loading: authLoading, requireAuth } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null);
  const [tradeOff, setTradeOff] = useState<TradeOffMode>('balanced');
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(true);
  const [locationScope, setLocationScope] = useState<LocationScope>('country');
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  // Mirrors `shortlist` synchronously (state updates aren't visible to closures
  // until the next render), and a promise `toggleSave` can await instead of
  // dropping clicks that land while the initial fetch is still in flight.
  const shortlistRef = useRef<string[]>([]);
  const shortlistReadyRef = useRef<Promise<void>>(Promise.resolve());

  const applyShortlist = useCallback((ids: string[]) => {
    shortlistRef.current = ids;
    setShortlist(ids);
  }, []);

  // Populate the shortlist once auth state is known: mock mode reads
  // localStorage (unchanged from before real auth existed); a real signed-in
  // user gets their server-persisted shortlist; signed-out is empty.
  useEffect(() => {
    if (authLoading) return;
    if (isMock) {
      applyShortlist(loadLocalShortlist());
      setShortlistLoading(false);
      shortlistReadyRef.current = Promise.resolve();
      return;
    }
    if (!user) {
      applyShortlist([]);
      setShortlistLoading(false);
      shortlistReadyRef.current = Promise.resolve();
      return;
    }
    let active = true;
    setShortlistLoading(true);
    shortlistReadyRef.current = getShortlist()
      .then(({ ids }) => {
        if (active) applyShortlist(ids);
      })
      .catch(() => {
        if (active) applyShortlist([]);
      })
      .finally(() => {
        if (active) setShortlistLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, isMock, user, applyShortlist]);

  // Mock mode only — real mode persists via the API on every toggle instead.
  useEffect(() => {
    if (isMock) localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
  }, [isMock, shortlist]);

  const isSaved = useCallback((id: string) => shortlist.includes(id), [shortlist]);

  const toggleSave = useCallback(
    (id: string, name?: string) => {
      // Saving requires sign in; the soft modal resumes this action after auth.
      requireAuth(() => {
        if (isMock) {
          const prev = shortlistRef.current;
          const adding = !prev.includes(id);
          if (adding) track('trip_saved', { id, name });
          applyShortlist(adding ? [...prev, id] : prev.filter((x) => x !== id));
          return;
        }
        // Wait out the initial GET /api/shortlist fetch (if still in flight)
        // instead of dropping the click, then read the freshest known state.
        void shortlistReadyRef.current.then(() => {
          const current = shortlistRef.current;
          const adding = !current.includes(id);
          const request = adding ? addToShortlist(id) : removeFromShortlist(id);
          if (adding) track('trip_saved', { id, name });
          request.then((res) => applyShortlist(res.ids)).catch(() => {
            console.error('Failed to sync shortlist change');
          });
        });
      }, 'Sign in to save this trip');
    },
    [requireAuth, isMock, applyShortlist],
  );

  // Never blocks the UI: a denial, timeout, or missing API all just fall back
  // to 'country' scope rather than leaving the user stuck waiting.
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('unavailable');
      setLocationScope('country');
      return;
    }
    setLocationStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
        setLocationScope('near');
      },
      (err) => {
        // code 1 = PERMISSION_DENIED (a real refusal); codes 2/3 (POSITION_
        // UNAVAILABLE / TIMEOUT) are transient — desktop Wi-Fi-based
        // positioning routinely takes longer than the old 8s budget on the
        // first request, so treat those as retryable, not a hard denial.
        setLocationStatus(err.code === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'error');
        setLocationScope('country');
      },
      { timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  }, []);

  const browseAllOfIndia = useCallback(() => setLocationScope('country'), []);

  // Resolves to a human-readable place name once coordinates are known, so
  // the user can see on screen exactly where "near me" locked onto — pure
  // confirmation, never blocks or affects which destinations load.
  useEffect(() => {
    if (!coords) {
      setLocationLabel(null);
      return;
    }
    let active = true;
    reverseGeocode(coords.lat, coords.lng).then((label) => {
      if (active) setLocationLabel(label);
    });
    return () => {
      active = false;
    };
  }, [coords]);

  const value: AppState = {
    selectedMood,
    selectedBudget,
    tradeOff,
    shortlist,
    shortlistLoading,
    setMood: setSelectedMood,
    setBudget: setSelectedBudget,
    setTradeOff,
    isSaved,
    toggleSave,
    locationScope,
    locationStatus,
    coords,
    locationLabel,
    requestLocation,
    browseAllOfIndia,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
