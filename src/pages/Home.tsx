/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Sparkles } from 'lucide-react';
import MoodCard from '../components/MoodCard';
import { useMood } from '../state/MoodContext';
import { getDestinationRecommendations } from '../lib/geminiService';
import type { Mood, MoodMeta } from '../types';

const MOODS: MoodMeta[] = [
  {
    mood: 'Need a reset',
    emoji: '🌿',
    desc: 'Calm beaches, yoga retreats, and tranquil silence.',
    img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-emerald-900 via-emerald-800/50 to-transparent',
  },
  {
    mood: 'Adventure mode',
    emoji: '🧗',
    desc: 'Treks, water sports, and adrenaline rushes.',
    img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-orange-900 via-orange-800/50 to-transparent',
  },
  {
    mood: 'Budget weekend',
    emoji: '💸',
    desc: 'Hidden gems that are easy on the wallet.',
    img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-yellow-900 via-yellow-800/50 to-transparent',
  },
  {
    mood: 'Romantic escape',
    emoji: '❤️',
    desc: 'Scenic views, cozy stays, and intimate dining.',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-rose-900 via-rose-800/50 to-transparent',
  },
  {
    mood: 'Workation vibe',
    emoji: '💻',
    desc: 'Strong WiFi, great coffee, and inspiring views.',
    img: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-sky-900 via-sky-800/50 to-transparent',
  },
  {
    mood: 'Explore something new',
    emoji: '✨',
    desc: 'Underrated spots and cultural deep dives.',
    img: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=800',
    gradient: 'bg-gradient-to-t from-purple-900 via-purple-800/50 to-transparent',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const {
    selectedMood,
    setSelectedMood,
    setRecommendations,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useMood();

  const handleMoodSelect = useCallback(
    async (mood: Mood) => {
      if (isLoading) return;

      setSelectedMood(mood);
      setError(null);
      setIsLoading(true);
      setRecommendations([]);

      try {
        const result = await getDestinationRecommendations(mood);
        setRecommendations(result.destinations);
        setIsLoading(false);
        navigate('/explore');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        setIsLoading(false);
      }
    },
    [isLoading, navigate, setError, setIsLoading, setRecommendations, setSelectedMood]
  );

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center text-center px-6 overflow-hidden"
        aria-label="TailorTrip hero"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073&ixlib=rb-4.0.3"
            alt="Ocean waves"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <div className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block animate-pulse" />
            AI-Powered Travel Engine
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            TailorTrip
          </h1>

          <p className="text-2xl md:text-3xl font-medium text-white mb-4 drop-shadow-md">
            Don't just book.{' '}
            <span className="font-bold">Optimize.</span>
          </p>

          <p className="text-lg text-white/90 mb-10 max-w-xl drop-shadow-sm">
            Discover mood-based journeys tailored for you.
          </p>

          <a
            href="#mood-section"
            className="bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
          >
            <Sparkles className="w-5 h-5" />
            Explore by Mood
          </a>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/70 animate-bounce">
          <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* Mood Selection - Task 1 & 2 & 3 */}
      <section
        id="mood-section"
        className="max-w-[1200px] mx-auto px-6 py-20 w-full"
        aria-label="Mood selection"
      >
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            How do you want to feel?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl">
            Pick a vibe — our AI will instantly find the perfect Indian destinations for this time of year.
            No login required.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <span className="text-red-500 mt-0.5 text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-red-800 text-sm">Couldn't fetch recommendations</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xs font-medium mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Mood Cards Grid */}
        <div
          role="radiogroup"
          aria-label="Travel mood options"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
        >
          {MOODS.map((meta) => (
            <MoodCard
              key={meta.mood}
              meta={meta}
              isSelected={selectedMood === meta.mood}
              isLoading={isLoading && selectedMood === meta.mood}
              onClick={() => handleMoodSelect(meta.mood)}
            />
          ))}
        </div>

        {/* Loading global hint */}
        {isLoading && (
          <div className="flex justify-center mb-10" aria-live="polite" aria-label="Loading recommendations">
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-full px-6 py-3 shadow-sm">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-primary rounded-full animate-spin" />
              <span className="text-primary font-semibold text-sm">
                Finding the best destinations for "{selectedMood}"…
              </span>
            </div>
          </div>
        )}

        {/* Quiz CTA */}
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center max-w-4xl mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Not sure what you're feeling?
          </h3>
          <p className="text-slate-500 mb-8 max-w-md">
            Take our 30-second quiz to find your perfect travel match based on your personality.
          </p>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
            Take the Quiz
          </button>
        </div>
      </section>
    </div>
  );
}
