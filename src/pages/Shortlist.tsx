import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Calendar, MapPin, Clock, Compass } from 'lucide-react';
import { getShortlist, removeFromShortlist } from '../lib/api';
import { useApp } from '../state/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import type { Destination } from '../types/types';

interface ShortlistItemType {
  destinationId: string;
  savedAt: string;
  minCost: number;
  cheapestMonth: string;
  matchScore: number;
  destination: Destination;
}

export default function Shortlist() {
  const { shortlist, removeTripFromShortlist } = useApp();
  const [trips, setTrips] = useState<ShortlistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedTrips();
  }, []);

  const fetchSavedTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShortlist();
      setTrips(data.trips as unknown as ShortlistItemType[]);
    } catch (err) {
      setError('Failed to load your shortlist. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Optimistic locally
      setTrips(prev => prev.filter(t => t.destinationId !== id));
      removeTripFromShortlist(id); // updates context
      await removeFromShortlist(id); // syncs to server
    } catch (err) {
      console.error('Failed to remove trip', err);
      // Can revert state here if strict, but ignoring for now
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 invisible">Your Shortlist</h1>
        <div className="space-y-6 mt-16 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-48 border border-gray-100 shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchSavedTrips} className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold">Retry</button>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col items-center justify-center text-center mt-20">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Compass className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Your shortlist is empty</h2>
        <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">
          Start exploring tailored destinations to build your perfect travel wishlist.
        </p>
        <Link to="/explore" className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md shadow-blue-200">
          Explore Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Your Shortlist</h1>
          <p className="text-slate-500 text-lg">Trips you're considering for your next escape.</p>
        </div>
        
        <button disabled className="hidden sm:flex items-center gap-2 bg-slate-100 text-slate-400 font-bold py-3 px-6 rounded-xl transition-colors cursor-not-allowed border border-slate-200">
          Compare Selected (Coming Soon)
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {trips.map((item, index) => (
            <motion.div
              key={item.destinationId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.05 }}
            >
              <ShortlistCard 
                item={item} 
                onRemove={(e: React.MouseEvent) => handleRemove(item.destinationId, e)} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ShortlistCard({ item, onRemove }: { item: ShortlistItemType, onRemove: (e: React.MouseEvent) => void }) {
  const dest = item.destination;
  
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:border-primary/50 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center group relative">
      <Link to={`/trip/${dest.id}`} className="w-full sm:w-48 h-48 sm:h-36 rounded-xl overflow-hidden shrink-0 relative block">
        <img 
          src={dest.heroImages[0]} 
          alt={dest.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          {item.matchScore}% Match
        </div>
      </Link>

      <div className="flex-1 flex flex-col justify-between h-full w-full">
        <div className="mb-4 sm:mb-0">
          <div className="flex justify-between items-start mb-1">
            <Link to={`/trip/${dest.id}`} className="hover:text-primary transition-colors">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{dest.name}</h3>
            </Link>
            <button 
              onClick={onRemove}
              title="Remove from shortlist"
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5" /> {dest.state}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {dest.moods.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100/50 text-xs font-medium px-2.5 py-1 rounded-md capitalize">
                {tag.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0 min-w-[160px]">
        <div className="text-left sm:text-right w-full">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Starting From</p>
          <p className="text-2xl font-black text-slate-900">₹{item.minCost.toLocaleString()}</p>
        </div>
        
        <div className="flex flex-col sm:items-end gap-1 w-full text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm">
          <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-primary" /> {dest.durationDays} Days</span>
          <span className="flex items-center gap-1.5 font-medium text-xs text-slate-500"><Calendar className="w-3.5 h-3.5" /> {item.cheapestMonth}</span>
        </div>
      </div>
    </div>
  );
}
