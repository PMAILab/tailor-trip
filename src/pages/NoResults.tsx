import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal, Map, Flame } from 'lucide-react';
import { MOODS } from '../data/constants';

export default function NoResults() {
  const [searchParams] = useSearchParams();
  const moodId = searchParams.get('mood');
  const moodObj = MOODS.find(m => m.id === moodId);
  const moodName = moodObj ? moodObj.label : 'your criteria';

  return (
    <div className="flex-grow w-full flex items-center justify-center py-20 px-6 bg-background-light">
      <div className="max-w-xl w-full text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <SearchX className="w-10 h-10 text-primary" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <span className="text-xl">🤔</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Perfect Matches</h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          We couldn't track down a trip specifically tailored for <strong className="text-slate-800">"{moodName}"</strong> under these parameters right now.
        </p>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm text-left mb-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Trending Fallbacks Instead
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/trip/bali" className="group flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=200" alt="Bali" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">Bali, Indonesia</p>
                <p className="text-xs text-slate-500">Perfect for escaping</p>
              </div>
            </Link>
            
            <Link to="/trip/kyoto" className="group flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=200" alt="Kyoto" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">Kyoto, Japan</p>
                <p className="text-xs text-slate-500">Culture & Zen</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/explore?mood=reset" className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Clear Mood Filters
          </Link>
          <Link to="/" className="bg-white hover:bg-gray-50 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2">
            <Map className="w-5 h-5" />
            Home Wizard
          </Link>
        </div>
      </div>
    </div>
  );
}
