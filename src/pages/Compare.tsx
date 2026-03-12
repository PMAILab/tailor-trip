import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare } from 'lucide-react';

export default function Compare() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/shortlist" className="bg-white hover:bg-gray-50 text-slate-700 p-2.5 rounded-full transition-colors border border-gray-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compare Escapes</h1>
        </div>
      </div>

      <div className="flex-grow w-full flex items-center justify-center py-20 px-6 bg-background-light">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <GitCompare className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Coming Soon</h2>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            Side-by-side comparison of destinations, weather, and costs is actively being developed. Stay tuned!
          </p>

          <Link to="/explore" className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 inline-flex items-center justify-center">
            Continue Exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
