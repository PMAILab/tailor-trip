import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, RefreshCw, SlidersHorizontal, Map } from 'lucide-react';

export default function NoResults() {
  return (
    <div className="flex-grow w-full flex items-center justify-center py-20 px-6 bg-background-light">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <SearchX className="w-10 h-10 text-primary" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
            <span className="text-xl">🤔</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Exact Matches</h1>
        <p className="text-slate-500 text-lg mb-8 leading-relaxed">
          We couldn't find a trip that perfectly matches <strong className="text-slate-800">"Skiing in the Sahara for under $50"</strong>. 
        </p>

        <div className="space-y-4 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Try adjusting your filters
            </h3>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Increase your budget slightly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Change the destination region
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Be more flexible with dates
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Reset Filters
          </button>
          <Link to="/explore" className="bg-white hover:bg-gray-50 text-slate-700 font-bold py-3.5 px-8 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2">
            <Map className="w-5 h-5" />
            Browse All
          </Link>
        </div>
      </div>
    </div>
  );
}
