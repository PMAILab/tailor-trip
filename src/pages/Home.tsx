import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MOODS } from '../data/constants';
import { useApp } from '../state/AppContext';
import { trackEvent } from '../lib/analytics';
import type { Mood } from '../types/types';

export default function Home() {
  const navigate = useNavigate();
  const { setMood } = useApp();

  const handleMoodClick = (mood: Mood) => {
    trackEvent('mood_selected', { moodId: mood.id, moodLabel: mood.label });
    setMood(mood);
    navigate(`/explore?mood=${mood.id}`);
  };

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073&ixlib=rb-4.0.3" 
            alt="Ocean waves" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2"></span>
            AI-Powered Travel Engine
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-lg"
          >
            TailorTrip
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-medium text-white mb-4 drop-shadow-md"
          >
            Don't just book. <span className="font-bold">Optimize.</span>
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-white/90 mb-10 max-w-xl drop-shadow-sm"
          >
            Discover mood-based journeys tailored for you.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('mood-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group cursor-pointer"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/70 animate-bounce">
          <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </section>

      {/* Mood Selection */}
      <section id="mood-section" className="max-w-[1200px] mx-auto px-6 py-20 w-full">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">How do you want to feel?</h2>
          <p className="text-lg text-slate-500 max-w-2xl">Start with a vibe. We'll handle the rest, finding the perfect spots for your mood and budget.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOODS.map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleMoodClick(mood)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={mood.imageUrl}
                alt={mood.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {mood.label} {mood.emoji}
                </h3>
                <p className="text-white/80 text-sm font-medium">{mood.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
