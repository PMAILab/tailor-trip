/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { useMood } from '../state/MoodContext';
import { getDestinationRecommendations } from '../lib/geminiService';
import DestinationCard from '../components/DestinationCard';
import DestinationCardSkeleton from '../components/DestinationCardSkeleton';

export default function Explore() {
  const {
    selectedMood,
    recommendations,
    isLoading,
    error,
    setError,
    setIsLoading,
    setRecommendations,
  } = useMood();
  const navigate = useNavigate();

  const handleRetry = async () => {
    if (!selectedMood || isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await getDestinationRecommendations(selectedMood);
      setRecommendations(result.destinations);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Empty state: no mood selected and no recommendations ──
  if (!selectedMood && recommendations.length === 0 && !isLoading) {
    return (
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <Compass className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">No destinations yet</h2>
          <p className="text-slate-500 max-w-md">
            Pick a mood from the home page and our AI will instantly find the perfect Indian destinations
            for you.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Select a Mood
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
      {/* Header + Back button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/')}
              aria-label="Go back to mood selection"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            AI Recommendations For You
          </h2>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-slate-500 text-sm">
              Based on your mood:{' '}
              <span className="font-semibold text-primary">{selectedMood}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Loading state: skeleton shimmer cards ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Something went wrong</h3>
          <p className="text-slate-500 max-w-md text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* ── Destination Cards Grid ── */}
      {!isLoading && !error && recommendations.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {recommendations.map((destination, i) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={i}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
