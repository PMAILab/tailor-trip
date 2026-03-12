import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Mood, BudgetRange, TripRecommendation } from '../types/types';
import * as api from '../lib/api';

// ─── Context Shape ────────────────────────────────────────────────────

interface AppState {
  // Selection state
  selectedMood: Mood | null;
  selectedBudget: BudgetRange | null;

  // Shortlist
  shortlist: string[]; // destination IDs
  shortlistLoading: boolean;

  // Profile
  profileName: string;
  profileMoods: string[];
  profileBudget: BudgetRange | null;

  // Actions
  setMood: (mood: Mood | null) => void;
  setBudgetRange: (budget: BudgetRange | null) => void;
  saveTripToShortlist: (destinationId: string) => Promise<void>;
  removeTripFromShortlist: (destinationId: string) => Promise<void>;
  isInShortlist: (destinationId: string) => boolean;
  updateProfile: (prefs: { name?: string; moods?: string[]; preferredBudgetRange?: BudgetRange | null }) => Promise<void>;
  refreshShortlist: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileMoods, setProfileMoods] = useState<string[]>([]);
  const [profileBudget, setProfileBudget] = useState<BudgetRange | null>(null);

  // Load shortlist and profile on mount
  useEffect(() => {
    refreshShortlist();
    loadProfile();
  }, []);

  const refreshShortlist = useCallback(async () => {
    try {
      setShortlistLoading(true);
      const data = await api.getShortlist();
      setShortlist(data.trips.map(t => t.destinationId));
    } catch (err) {
      console.error('Failed to load shortlist:', err);
    } finally {
      setShortlistLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      setProfileName(data.name || '');
      setProfileMoods(data.moods || []);
      setProfileBudget(data.preferredBudgetRange || null);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  const saveTripToShortlist = useCallback(async (destinationId: string) => {
    try {
      await api.saveToShortlist(destinationId);
      setShortlist(prev => [...new Set([...prev, destinationId])]);
    } catch (err) {
      console.error('Failed to save to shortlist:', err);
    }
  }, []);

  const removeTripFromShortlist = useCallback(async (destinationId: string) => {
    try {
      await api.removeFromShortlist(destinationId);
      setShortlist(prev => prev.filter(id => id !== destinationId));
    } catch (err) {
      console.error('Failed to remove from shortlist:', err);
    }
  }, []);

  const isInShortlist = useCallback((destinationId: string) => {
    return shortlist.includes(destinationId);
  }, [shortlist]);

  const handleUpdateProfile = useCallback(async (prefs: {
    name?: string;
    moods?: string[];
    preferredBudgetRange?: BudgetRange | null;
  }) => {
    try {
      await api.updateProfile(prefs);
      if (prefs.name !== undefined) setProfileName(prefs.name);
      if (prefs.moods !== undefined) setProfileMoods(prefs.moods);
      if (prefs.preferredBudgetRange !== undefined) setProfileBudget(prefs.preferredBudgetRange);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }, []);

  const value: AppState = {
    selectedMood,
    selectedBudget,
    shortlist,
    shortlistLoading,
    profileName,
    profileMoods,
    profileBudget,
    setMood: setSelectedMood,
    setBudgetRange: setSelectedBudget,
    saveTripToShortlist,
    removeTripFromShortlist,
    isInShortlist,
    updateProfile: handleUpdateProfile,
    refreshShortlist,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
