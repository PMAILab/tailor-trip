import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Heart, Download, Calendar, MapPin, Clock, Sun, CloudRain, Plane, Hotel, Coffee, Map, Users, Info, ExternalLink, Snowflake, Droplets, TrendingDown, Scale } from 'lucide-react';
import { getTripDetails, type TripDetailResponse } from '../lib/api';
import { useApp } from '../state/AppContext';
import type { TradeOffMode } from '../types/types';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const { isInShortlist, saveTripToShortlist, removeTripFromShortlist } = useApp();
  
  const [data, setData] = useState<TripDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState('insights');
  const [tradeOff, setTradeOff] = useState<TradeOffMode>('balanced');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (id) {
      fetchData(id, tradeOff);
    }
  }, [id, tradeOff]);

  const fetchData = async (tripId: string, mode: TradeOffMode) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTripDetails(tripId, mode);
      setData(result);
    } catch (err) {
      setError('Failed to load trip details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Image gallery hover flip
  useEffect(() => {
    if (!data?.destination?.heroImages || data.destination.heroImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIdx(prev => (prev + 1) % data.destination.heroImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex-grow w-full bg-background-light p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Crunching the best data for you...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-grow w-full bg-background-light p-8 flex flex-col justify-center items-center h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error || 'Trip not found.'}</p>
          <Link to="/explore" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-full transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const { destination: dest, costBreakdown: cost, timingInsight: timing, recommendedMonthData, recommendedMonth } = data;
  const isSaved = isInShortlist(dest.id);
  
  const handleSaveToggle = () => {
    if (isSaved) removeTripFromShortlist(dest.id);
    else saveTripToShortlist(dest.id);
  };

  const weatherIcon = (w: string) => {
    switch(w) {
      case 'Hot': return <Sun className="w-4 h-4" />;
      case 'Cold': return <Snowflake className="w-4 h-4" />;
      case 'Rainy': return <CloudRain className="w-4 h-4" />;
      default: return <Droplets className="w-4 h-4" />;
    }
  };

  const crowdColors: Record<string, string> = {
    'Low': 'text-green-600 bg-green-50 border-green-200',
    'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'High': 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="flex-grow w-full bg-background-light">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIdx}
            src={dest.heroImages[currentImageIdx] || dest.heroImages[0]}
            alt={dest.name} 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover absolute inset-0"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <Link to="/explore" className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors shadow-sm cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSaveToggle}
              className={`backdrop-blur-md p-2.5 rounded-full transition-colors shadow-sm cursor-pointer ${isSaved ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {dest.state}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {dest.durationDays} Days
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 capitalize">
              {dest.sentiment.split(' ')[0]} Vibe
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 drop-shadow-md tracking-tight">{dest.name}</h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-sm max-w-2xl leading-relaxed">{dest.description}</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trade-Off Toggle */}
          <div className="bg-white rounded-2xl p-2 border border-blue-100 shadow-sm inline-flex w-full md:w-auto overflow-hidden">
            <button 
              onClick={() => setTradeOff('cheapest')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${tradeOff === 'cheapest' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <TrendingDown className="w-4 h-4" /> Cheapest
            </button>
            <button 
              onClick={() => setTradeOff('balanced')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${tradeOff === 'balanced' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Scale className="w-4 h-4" /> Balanced
            </button>
            <button 
              onClick={() => setTradeOff('least_crowded')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${tradeOff === 'least_crowded' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users className="w-4 h-4" /> Quietest
            </button>
          </div>

          {loading && (
             <div className="text-sm text-slate-500 animate-pulse flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
               Recalculating optimal month based on your preference...
             </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-8">
            <button 
              onClick={() => setActiveTab('insights')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'insights' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Timing & Costs
              {activeTab === 'insights' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('itinerary')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'itinerary' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Itinerary
              {activeTab === 'itinerary' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
          </div>

          {/* Tab Content: Insights */}
          {activeTab === 'insights' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Cost Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-100"></div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 relative">Estimated Cost Breakdown (Per Person)</h3>
                
                <div className="space-y-6 relative">
                  {/* Visual Bar */}
                  <div className="w-full h-4 rounded-full flex overflow-hidden shadow-inner">
                    <div className="bg-blue-500 transition-all duration-1000" style={{ width: `${(cost.travel / cost.perPerson) * 100}%` }}></div>
                    <div className="bg-indigo-500 transition-all duration-1000" style={{ width: `${(cost.stay / cost.perPerson) * 100}%` }}></div>
                    <div className="bg-teal-500 transition-all duration-1000" style={{ width: `${(cost.foodAndExperiences / cost.perPerson) * 100}%` }}></div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-600 font-medium text-sm">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div> Travel
                      </div>
                      <p className="text-xl font-bold text-slate-900">₹{cost.travel.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-600 font-medium text-sm">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div> Stay
                      </div>
                      <p className="text-xl font-bold text-slate-900">₹{cost.stay.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-600 font-medium text-sm">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div> Food & Activities
                      </div>
                      <p className="text-xl font-bold text-slate-900">₹{cost.foodAndExperiences.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Insights / 12 Months */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-2">12-Month Price Trend</h3>
                <p className="text-sm text-slate-500 mb-6">Showing relative prices, weather, and crowds.</p>
                
                <div className="min-w-[600px] flex items-end justify-between h-48 mb-8 pb-4 border-b border-gray-100 gap-2">
                  {dest.monthlyData.map((m, idx) => {
                    // normalized height calculation
                    const prices = dest.monthlyData.map(d => d.costEstimate);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const isRecommended = recommendedMonth === idx;
                    
                    // minimum height of 20% to avoid invisible bars
                    const heightPercent = 20 + ((m.costEstimate - min) / (max - min)) * 80;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center justify-end h-full gap-2 relative group flex-1">
                        {isRecommended && (
                          <div className="absolute -top-8 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                            Recommended
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                          </div>
                        )}
                        
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded whitespace-nowrap z-20 pointer-events-none">
                          ₹{m.costEstimate.toLocaleString()}
                        </div>
                        
                        <div className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 ${isRecommended ? 'bg-primary' : 'bg-blue-100 group-hover:bg-blue-200'}`} style={{ height: `${heightPercent}%` }}></div>
                        <span className={`text-xs font-semibold ${isRecommended ? 'text-primary' : 'text-slate-500'}`}>{MONTH_NAMES[idx]}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend for 12 months (optional visual polish) */}
                <div className="flex gap-4 text-xs font-medium text-slate-500 justify-center">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm"></div> Optimal Month</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded-sm"></div> Average</span>
                </div>
              </div>

            </div>
          )}

          {/* Tab Content: Itinerary (Mocked as per spec, only visual) */}
          {activeTab === 'itinerary' && (
             <div className="space-y-6 animate-in fade-in duration-300 bg-white rounded-2xl p-8 border border-gray-100 text-center">
               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Map className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Detailed Itinerary Pipeline</h3>
               <p className="text-slate-500 max-w-sm mx-auto">Full day-by-day scheduling for {dest.name} is coming in the next update. For now, check out the optimized timing and costs!</p>
             </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                Optimal Trip Estimate
              </span>
              <p className="text-sm text-slate-500 font-medium mb-1">Starting from</p>
              <div className="flex items-end gap-2">
                <h2 className="text-4xl font-black text-slate-900">₹{cost.perPerson.toLocaleString()}</h2>
                <span className="text-slate-400 text-sm mb-1">/ person</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mb-6">For a {dest.durationDays}-day trip</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Recommended Month</p>
                  <p className="font-bold text-slate-900 text-sm">{MONTH_NAMES[recommendedMonth]} <span className="text-slate-400 font-normal">({tradeOff.replace('_', ' ')})</span></p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                   {weatherIcon(timing.weather)}
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 font-medium uppercase">Expected Weather</p>
                   <p className="font-bold text-slate-900 text-sm">{timing.weather}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 border ${crowdColors[timing.crowdLevel]}`}>
                   <Users className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 font-medium uppercase">Expected Crowd</p>
                   <p className="font-bold text-slate-900 text-sm">{timing.crowdLevel}</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={handleSaveToggle}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-md mb-3 flex justify-center items-center gap-2 cursor-pointer
                ${isSaved ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100' : 'bg-primary text-white hover:bg-primary-hover shadow-blue-200'}
              `}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current text-red-500' : ''}`} />
              {isSaved ? 'Saved to Shortlist' : 'Save Trip'}
            </button>
            
            <a 
              href={`https://www.makemytrip.com/holidays/india/search?dest=${dest.name}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => console.log('Analytics Event: Outbound booking click')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer mb-3"
            >
              View Booking Options <ExternalLink className="w-4 h-4 text-white/70" />
            </a>

            <button disabled className="w-full bg-white hover:bg-gray-50 text-slate-400 font-bold py-3 rounded-xl transition-colors border border-gray-200 text-sm flex justify-center items-center gap-2 cursor-not-allowed">
              Compare Later (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
