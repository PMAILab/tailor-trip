import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Heart, Sun, Users, Droplets, Snowflake, Clock, Brain, CloudRain } from 'lucide-react';
import { getRecommendations } from '../lib/api';
import { useApp } from '../state/AppContext';
import { BUDGET_RANGES, MOODS } from '../data/constants';
import type { TripRecommendation, BudgetRange } from '../types/types';
import { TripCard } from '../components/TripCard';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isInShortlist, saveTripToShortlist, removeTripFromShortlist } = useApp();

  const moodId = searchParams.get('mood') || 'reset';
  const moodObj = MOODS.find(m => m.id === moodId);

  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [moodId, selectedBudget]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendations(
        moodId,
        selectedBudget || undefined,
      );
      if (data.recommendations.length === 0) {
        navigate('/no-results');
        return;
      }
      setRecommendations(data.recommendations);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetClick = (budget: BudgetRange) => {
    setSelectedBudget(prev => prev?.id === budget.id ? null : budget);
  };

  const weatherIcon = (weather: string) => {
    switch (weather) {
      case 'Hot': return <Sun className="w-3.5 h-3.5" />;
      case 'Rainy': return <CloudRain className="w-3.5 h-3.5" />;
      case 'Cold': return <Snowflake className="w-3.5 h-3.5" />;
      default: return <Droplets className="w-3.5 h-3.5" />;
    }
  };

  const weatherColor = (weather: string) => {
    switch (weather) {
      case 'Hot': return 'bg-orange-50 text-orange-700';
      case 'Rainy': return 'bg-blue-50 text-blue-700';
      case 'Cold': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  };

  const crowdColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-50 text-green-700';
      case 'High': return 'bg-red-50 text-red-700';
      default: return 'bg-yellow-50 text-yellow-700';
    }
  };

  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Recommended For You</h2>
          <p className="text-slate-500 text-sm">
            Based on your <span className="font-semibold text-primary">{moodObj?.label || 'selected'}</span> mood
            {selectedBudget && <> · <span className="font-semibold text-primary">{selectedBudget.label}</span></>}
          </p>
        </div>
      </div>

      {/* Budget Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scroll">
        {BUDGET_RANGES.map(budget => (
          <button
            key={budget.id}
            onClick={() => handleBudgetClick(budget)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm whitespace-nowrap transition-colors cursor-pointer ${
              selectedBudget?.id === budget.id
                ? 'bg-blue-50 border border-primary/20 text-primary font-medium'
                : 'bg-white border border-gray-200 text-slate-700 hover:border-primary/50 hover:bg-blue-50'
            }`}
          >
            <span className="text-sm font-medium">{budget.label}</span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-hover transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded-md w-20" />
                  <div className="h-6 bg-gray-100 rounded-md w-20" />
                </div>
                <div className="h-10 bg-gray-50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <TripCard
                key={rec.destination.id}
                rec={rec}
                index={index}
                isSaved={isInShortlist(rec.destination.id)}
                onSave={() => saveTripToShortlist(rec.destination.id)}
                onUnsave={() => removeTripFromShortlist(rec.destination.id)}
                weatherIcon={weatherIcon}
                weatherColor={weatherColor}
                crowdColor={crowdColor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
