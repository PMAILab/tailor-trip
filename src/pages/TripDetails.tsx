import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, Share2, Heart, MapPin, Clock, Calendar, Sun, Flame,
  CloudRain, Snowflake, CheckCircle2, Compass,
} from 'lucide-react';
import { useMood } from '../state/MoodContext';
import CostBreakdown from '../components/CostBreakdown';
import TimingInsights from '../components/TimingInsights';
import TradeOffToggle from '../components/TradeOffToggle';
import type { TradeOffMode } from '../components/TradeOffToggle';
import BudgetFitMeter from '../components/BudgetFitMeter';
import ActionCTABar from '../components/ActionCTABar';
import type { WeatherType } from '../types';

const WEATHER_ICONS: Record<WeatherType, React.ElementType> = {
  Pleasant: Sun,
  Hot: Flame,
  Rainy: CloudRain,
  Cold: Snowflake,
};

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMood, recommendations, isSaved, toggleSaveDestination, isCompared, toggleCompareDestination } = useMood();
  const [tradeOffMode, setTradeOffMode] = useState<TradeOffMode>('balanced');

  // Find the destination from recommendations
  const destination = recommendations.find(d => d.id === id);

  // If destination not found (e.g. direct URL access), show fallback
  if (!destination) {
    return (
      <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
            <Compass className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Destination not found</h2>
          <p className="text-slate-500 max-w-md">
            We couldn't find this destination. Try selecting a mood first to get AI-powered recommendations.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Derive data
  const saved = isSaved(destination.id);
  const compared = isCompared(destination.id);
  const weatherTag = destination.tags.find(t => t.type === 'weather');
  const crowdTag = destination.tags.find(t => t.type === 'crowd');
  const WeatherIcon = weatherTag?.weatherType ? WEATHER_ICONS[weatherTag.weatherType] : Sun;
  const totalCost = destination.costBreakdown
    ? destination.costBreakdown.travel + destination.costBreakdown.stay + destination.costBreakdown.food + destination.costBreakdown.experiences
    : 0;

  return (
    <div className="flex-grow w-full bg-background-light pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[360px] md:h-[440px]"
      >
        <img
          src={destination.img}
          alt={destination.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Nav bar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => toggleSaveDestination(destination.id)}
              className={`backdrop-blur-md p-2.5 rounded-full transition-colors ${saved ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-10"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {destination.matchPercent}% Match
            </span>
            {weatherTag && (
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <WeatherIcon className="w-3.5 h-3.5" /> {weatherTag.text}
              </span>
            )}
            {crowdTag && (
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {crowdTag.text}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-md">{destination.name}</h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-sm">
            {destination.region} • {destination.duration}
          </p>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Dashboard Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-50/50 border border-primary/10 rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded-md"><CheckCircle2 className="w-4 h-4" /></span>
              Why this trip is perfect for you
            </h3>
            <p className="text-slate-600 leading-relaxed">{destination.whyItFitsYou}</p>
          </motion.div>

          {/* Trade-Off Toggle */}
          <TradeOffToggle activeMode={tradeOffMode} onModeChange={setTradeOffMode} />

          {/* Cost Breakdown */}
          {destination.costBreakdown && (
            <CostBreakdown
              costBreakdown={destination.costBreakdown}
              estimatedCost={destination.estimatedCost}
            />
          )}

          {/* Timing Insights */}
          {destination.monthlyData && destination.monthlyData.length > 0 && (
            <TimingInsights
              monthlyData={destination.monthlyData}
              cheapestMonth={destination.cheapestMonth}
              highlightMode={tradeOffMode}
            />
          )}

          {/* Budget Fit Meter */}
          {totalCost > 0 && <BudgetFitMeter totalCost={totalCost} />}
        </div>

        {/* Right Column - Trip Snapshot Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24"
          >
            <div className="mb-6">
              <p className="text-sm text-slate-500 font-medium mb-1">Total Estimated Cost</p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl font-black text-slate-900">{destination.estimatedCost}</h2>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Duration</p>
                  <p className="font-semibold text-slate-900">{destination.durationAssumption || destination.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Cheapest In</p>
                  <p className="font-semibold text-slate-900">{destination.cheapestMonth}</p>
                </div>
              </div>
              {weatherTag && (
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                    <WeatherIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Weather Now</p>
                    <p className="font-semibold text-slate-900">{weatherTag.text}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Match indicator */}
            <div className="p-4 bg-slate-50 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Mood Match</span>
                <span className="text-sm font-bold text-primary">{destination.matchPercent}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${destination.matchPercent}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            <button
              onClick={() => toggleSaveDestination(destination.id)}
              className={`w-full font-bold py-4 rounded-xl transition-colors mb-3 ${saved
                ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                : 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-blue-200'
                }`}
            >
              {saved ? '♥ Saved to Shortlist' : 'Save to Shortlist'}
            </button>
            <button
              onClick={() => toggleCompareDestination(destination.id)}
              className={`w-full font-bold py-4 rounded-xl transition-colors border flex items-center justify-center gap-2 ${compared
                ? 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                : 'bg-white hover:bg-gray-50 text-slate-700 border-gray-200'
                }`}
            >
              {compared ? '✓ Comparing' : '+ Compare Later'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <ActionCTABar
        destination={destination}
        selectedMood={selectedMood}
        isSaved={saved}
        isCompared={compared}
        onToggleSave={() => toggleSaveDestination(destination.id)}
        onToggleCompare={() => toggleCompareDestination(destination.id)}
      />
    </div>
  );
}
