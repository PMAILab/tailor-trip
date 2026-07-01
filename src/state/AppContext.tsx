import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { BudgetRange, TradeOffMode } from '../types/types';
import { useAuth } from './AuthContext';
import { track } from '../lib/analytics';

const SHORTLIST_KEY = 'tailortrip.shortlist';

interface AppState {
  selectedMood: string | null;
  selectedBudget: BudgetRange | null;
  tradeOff: TradeOffMode;
  shortlist: string[]; // destination ids
  setMood: (moodId: string | null) => void;
  setBudget: (budget: BudgetRange | null) => void;
  setTradeOff: (mode: TradeOffMode) => void;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string, name?: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { requireAuth } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null);
  const [tradeOff, setTradeOff] = useState<TradeOffMode>('balanced');
  const [shortlist, setShortlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  const isSaved = useCallback((id: string) => shortlist.includes(id), [shortlist]);

  const toggleSave = useCallback(
    (id: string, name?: string) => {
      // Saving requires sign in; the soft modal resumes this action after auth.
      requireAuth(() => {
        setShortlist((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          track('trip_saved', { id, name });
          return [...prev, id];
        });
      }, 'Sign in to save this trip');
    },
    [requireAuth],
  );

  const value: AppState = {
    selectedMood,
    selectedBudget,
    tradeOff,
    shortlist,
    setMood: setSelectedMood,
    setBudget: setSelectedBudget,
    setTradeOff,
    isSaved,
    toggleSave,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
