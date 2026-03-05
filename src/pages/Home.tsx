import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';

export default function Home() {
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
          <div className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-2"></span>
            AI-Powered Travel Engine
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
            TailorTrip
          </h1>
          
          <p className="text-2xl md:text-3xl font-medium text-white mb-4 drop-shadow-md">
            Don't just book. <span className="font-bold">Optimize.</span>
          </p>
          
          <p className="text-lg text-white/90 mb-10 max-w-xl drop-shadow-sm">
            Discover mood-based journeys tailored for you.
          </p>
          
          <Link to="/explore" className="bg-primary hover:bg-primary-hover text-white text-lg font-bold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group">
            Start Exploring
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/70 animate-bounce">
          <span className="text-xs uppercase tracking-widest mb-2 font-medium">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </section>

      {/* Mood Selection */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 w-full">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">How do you want to feel?</h2>
          <p className="text-lg text-slate-500 max-w-2xl">Start with a vibe. We'll handle the rest, finding the perfect spots for your mood and budget.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <MoodCard 
            title="Need a reset 🌿" 
            desc="Calm beaches, yoga retreats, and silence."
            img="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          />
          <MoodCard 
            title="Adventure mode 🧗" 
            desc="Treks, water sports, and adrenaline rushes."
            img="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=2003&ixlib=rb-4.0.3"
          />
          <MoodCard 
            title="Budget weekend 💸" 
            desc="Hidden gems that are easy on the wallet."
            img="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          />
          <MoodCard 
            title="Romantic escape ❤️" 
            desc="Scenic views, cozy stays, and intimate dining."
            img="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          />
          <MoodCard 
            title="Workation vibe 💻" 
            desc="Strong WiFi, good coffee, and inspiring views."
            img="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          />
          <MoodCard 
            title="Explore something new ✨" 
            desc="Underrated spots and cultural deep dives."
            img="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=2156&ixlib=rb-4.0.3"
          />
        </div>

        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center max-w-4xl mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Not sure what you're feeling?</h3>
          <p className="text-slate-500 mb-8 max-w-md">Take our 30-second quiz to find your perfect travel match based on your personality.</p>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
            Take the Quiz
          </button>
        </div>
      </section>
    </div>
  );
}

function MoodCard({ title, desc, img }: { title: string, desc: string, img: string }) {
  return (
    <Link to="/explore" className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm font-medium">{desc}</p>
      </div>
    </Link>
  );
}
