/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useMood } from '../state/MoodContext';
import DestinationCard from '../components/DestinationCard';
import UndoToast from '../components/UndoToast';

interface PendingRemoval {
  id: string;
  name: string;
}

export default function Shortlist() {
  const { recommendations, savedDestinationIds, toggleSaveDestination } = useMood();
  const navigate = useNavigate();
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);

  const savedDestinations = recommendations.filter(d => savedDestinationIds.has(d.id));

  const handleToggleSave = useCallback((id: string) => {
    const destination = recommendations.find(d => d.id === id);
    if (!destination) return;

    // Remove the destination
    toggleSaveDestination(id);
    // Show undo toast
    setPendingRemoval({ id, name: destination.name });
  }, [recommendations, toggleSaveDestination]);

  const handleUndo = useCallback(() => {
    if (pendingRemoval) {
      toggleSaveDestination(pendingRemoval.id);
      setPendingRemoval(null);
    }
  }, [pendingRemoval, toggleSaveDestination]);

  const handleDismissToast = useCallback(() => {
    setPendingRemoval(null);
  }, []);

  if (savedDestinations.length === 0 && !pendingRemoval) {
    return (
      <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Your Shortlist</h1>
        <p className="text-slate-500 text-lg mb-16">Trips you're considering for your next escape.</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center py-20 gap-6 text-center"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Nothing saved yet</h2>
          <p className="text-slate-500 max-w-md">
            Tap the heart icon on any destination card to save it here for later.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Explore Destinations
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Your Shortlist</h1>
          <p className="text-slate-500 text-lg">
            {savedDestinations.length} trip{savedDestinations.length !== 1 ? 's' : ''} saved for your
            next escape.
          </p>
        </div>

        <Link
          to="/compare"
          className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          Compare Selected
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <AnimatePresence mode="popLayout">
          {savedDestinations.map((destination, i) => (
            <motion.div
              key={destination.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <DestinationCard
                destination={destination}
                index={i}
                onToggleSave={handleToggleSave}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {savedDestinations.length > 0 && (
        <div className="mt-12 text-center sm:hidden">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 w-full justify-center"
          >
            Compare Selected ({savedDestinations.length})
          </Link>
        </div>
      )}

      <UndoToast
        message={pendingRemoval ? `Removed ${pendingRemoval.name}` : ''}
        visible={pendingRemoval !== null}
        onUndo={handleUndo}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
