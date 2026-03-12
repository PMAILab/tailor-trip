import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Heart, Sun, Users, Droplets, Snowflake, Clock, Brain, CloudRain } from 'lucide-react';
import { getRecommendations } from '../lib/api';
import { useApp } from '../state/AppContext';
import { BUDGET_RANGES, MOODS } from '../data/constants';
import type { TripRecommendation, BudgetRange } from '../types/types';

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

interface TripCardProps {
  rec: TripRecommendation;
  index: number;
  isSaved: boolean;
  onSave: () => void;
  onUnsave: () => void;
  weatherIcon: (w: string) => React.JSX.Element;
  weatherColor: (w: string) => string;
  crowdColor: (l: string) => string;
}

const TripCard: React.FC<TripCardProps> = ({
  rec,
  index,
  isSaved,
  onSave,
  onUnsave,
  weatherIcon,
  weatherColor,
  crowdColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dest = rec.destination;
  const cost = rec.costBreakdown;
  const timing = rec.timingInsight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden flex flex-col group h-full border border-gray-100 relative"
    >
      {/* Save Button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={(e) => { e.preventDefault(); isSaved ? onUnsave() : onSave(); }}
          className={`backdrop-blur-sm p-2 rounded-full shadow-sm transition-colors cursor-pointer ${
            isSaved
              ? 'bg-red-50 text-red-500'
              : 'bg-white/90 text-gray-400 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Image + Badges */}
      <Link to={`/trip/${dest.id}`} className="relative h-64 overflow-hidden block">
        {rec.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
            {rec.badges.slice(0, 2).map((badge, i) => (
              <span key={i} className="bg-accent-green/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {badge}
              </span>
            ))}
          </div>
        )}

        <img
          src={dest.heroImages[0]}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4 text-white">
          <h3 className="text-xl font-bold leading-tight">{dest.name}, {dest.state}</h3>
          <p className="text-white/90 text-sm font-medium">{rec.matchScore}% Match</p>
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Est. Cost</p>
            <p className="text-lg font-bold text-slate-800">₹{cost.total.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Duration</p>
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-[18px] h-[18px] text-slate-500" />
              <p className="text-sm font-medium text-slate-700">{dest.durationDays} Days</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${weatherColor(timing.weather)}`}>
            {weatherIcon(timing.weather)} {timing.weather}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${crowdColor(timing.crowdLevel)}`}>
            <Users className="w-3.5 h-3.5" /> {timing.crowdLevel} Crowd
          </span>
        </div>

        {/* AI Reason */}
        <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 cursor-pointer select-none"
          >
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Why this fits you
            </span>
            <ChevronDown className={`w-[18px] h-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 pt-0">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.aiReason}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
