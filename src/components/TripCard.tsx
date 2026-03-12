import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Heart, Clock, Brain, Users } from 'lucide-react';
import type { TripRecommendation } from '../types/types';

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

export const TripCard: React.FC<TripCardProps> = ({
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
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const dest = rec.destination;
  const cost = rec.costBreakdown;
  const timing = rec.timingInsight;

  // Filter images based on sentiment (optional extra logic, but we'll just use the heroImages array directly as they are assumed pre-filtered by the backend/DB)
  const images = dest.heroImages && dest.heroImages.length > 0 
    ? dest.heroImages 
    : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073&ixlib=rb-4.0.3']; // fallback

  // Image rotation on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % images.length);
      }, 1500);
    } else {
      setCurrentImageIdx(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden flex flex-col group h-full border border-gray-100 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImageIdx}
            src={images[currentImageIdx]}
            alt={dest.name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover absolute inset-0"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div className="absolute bottom-3 left-4 text-white z-10">
          <h3 className="text-xl font-bold leading-tight drop-shadow-md">{dest.name}, {dest.state}</h3>
          <p className="text-white/90 text-sm font-medium drop-shadow-md">{rec.matchScore}% Match</p>
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
            className="w-full flex items-center justify-between p-3 cursor-pointer select-none rounded-lg focus:outline-none"
          >
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Why this fits you
            </span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="w-[18px] h-[18px] text-slate-400" />
            </motion.div>
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
};
