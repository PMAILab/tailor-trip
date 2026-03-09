/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Mood, Destination } from '../types';

const SAVED_KEY = 'tailortrip_saved_destinations';
const COMPARE_KEY = 'tailortrip_compare_destinations';

interface MoodContextValue {
    selectedMood: Mood | null;
    setSelectedMood: (mood: Mood | null) => void;
    recommendations: Destination[];
    setRecommendations: (destinations: Destination[]) => void;
    isLoading: boolean;
    setIsLoading: (v: boolean) => void;
    error: string | null;
    setError: (v: string | null) => void;
    savedDestinationIds: Set<string>;
    toggleSaveDestination: (id: string) => void;
    isSaved: (id: string) => boolean;
    compareDestinationIds: Set<string>;
    toggleCompareDestination: (id: string) => void;
    isCompared: (id: string) => boolean;
}

const MoodContext = createContext<MoodContextValue | null>(null);

function loadIds(key: string): Set<string> {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            return new Set(JSON.parse(raw) as string[]);
        }
    } catch { /* ignore */ }
    return new Set();
}

function persistIds(key: string, ids: Set<string>) {
    localStorage.setItem(key, JSON.stringify([...ids]));
}

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [recommendations, setRecommendations] = useState<Destination[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedDestinationIds, setSavedDestinationIds] = useState<Set<string>>(() => loadIds(SAVED_KEY));
    const [compareDestinationIds, setCompareDestinationIds] = useState<Set<string>>(() => loadIds(COMPARE_KEY));

    useEffect(() => {
        persistIds(SAVED_KEY, savedDestinationIds);
    }, [savedDestinationIds]);

    useEffect(() => {
        persistIds(COMPARE_KEY, compareDestinationIds);
    }, [compareDestinationIds]);

    const toggleSaveDestination = useCallback((id: string) => {
        setSavedDestinationIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isSaved = useCallback((id: string) => savedDestinationIds.has(id), [savedDestinationIds]);

    const toggleCompareDestination = useCallback((id: string) => {
        setCompareDestinationIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isCompared = useCallback((id: string) => compareDestinationIds.has(id), [compareDestinationIds]);

    return (
        <MoodContext.Provider
            value={{
                selectedMood,
                setSelectedMood,
                recommendations,
                setRecommendations,
                isLoading,
                setIsLoading,
                error,
                setError,
                savedDestinationIds,
                toggleSaveDestination,
                isSaved,
                compareDestinationIds,
                toggleCompareDestination,
                isCompared,
            }}
        >
            {children}
        </MoodContext.Provider>
    );
}

export function useMood(): MoodContextValue {
    const ctx = useContext(MoodContext);
    if (!ctx) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return ctx;
}

