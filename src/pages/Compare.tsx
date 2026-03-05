import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, MapPin, Calendar, DollarSign, CloudSun, Users, Activity, Coffee, Hotel } from 'lucide-react';

export default function Compare() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/shortlist" className="bg-white hover:bg-gray-50 text-slate-700 p-2.5 rounded-full transition-colors border border-gray-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Compare Escapes</h1>
          <p className="text-slate-500 font-medium">Deciding between Bali and Kyoto.</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-8 hide-scroll">
        <div className="min-w-[800px] grid grid-cols-3 gap-6">
          {/* Features Column */}
          <div className="pt-64 space-y-4">
            <FeatureRow icon={<MapPin />} title="Location Vibe" />
            <FeatureRow icon={<DollarSign />} title="Est. Total Cost" />
            <FeatureRow icon={<Calendar />} title="Ideal Duration" />
            <FeatureRow icon={<CloudSun />} title="Weather (Nov)" />
            <FeatureRow icon={<Users />} title="Crowd Level" />
            <FeatureRow icon={<Activity />} title="Top Activity" />
            <FeatureRow icon={<Hotel />} title="Accommodation" />
            <FeatureRow icon={<Coffee />} title="Food Scene" />
          </div>

          {/* Option 1: Bali */}
          <div className="bg-white rounded-3xl border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
            <div className="p-6 border-b border-gray-100">
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2038&ixlib=rb-4.0.3" alt="Bali" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  94% Match
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Bali Escape</h2>
              <p className="text-slate-500 text-sm font-medium mb-4">Ubud & Seminyak</p>
              <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-200">
                Choose This
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <CompareCell value="Tropical, Relaxed, Spiritual" />
              <CompareCell value="$1,000" highlight />
              <CompareCell value="5-7 Days" />
              <CompareCell value="28°C, Sunny/Humid" />
              <CompareCell value="Moderate" />
              <CompareCell value="Surfing & Temples" />
              <CompareCell value="Villas & Resorts" />
              <CompareCell value="Cafes & Seafood" />
            </div>
          </div>

          {/* Option 2: Kyoto */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:border-primary/30 transition-colors">
            <div className="p-6 border-b border-gray-100">
              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3" alt="Kyoto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  88% Match
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Kyoto Zen</h2>
              <p className="text-slate-500 text-sm font-medium mb-4">Kyoto, Japan</p>
              <button className="w-full bg-white hover:bg-gray-50 text-slate-700 font-bold py-3 rounded-xl transition-colors border border-gray-200 shadow-sm">
                Choose This
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <CompareCell value="Cultural, Historic, Calm" />
              <CompareCell value="$1,800" />
              <CompareCell value="7-10 Days" />
              <CompareCell value="15°C, Crisp Autumn" />
              <CompareCell value="High (Foliage Season)" />
              <CompareCell value="Shrines & Gardens" />
              <CompareCell value="Ryokans & Hotels" />
              <CompareCell value="Kaiseki & Matcha" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title }: any) {
  return (
    <div className="h-14 flex items-center gap-3 text-slate-600 px-4">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary shrink-0">
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
      </div>
      <span className="font-bold text-sm uppercase tracking-wider">{title}</span>
    </div>
  );
}

function CompareCell({ value, highlight }: any) {
  return (
    <div className={`h-14 flex items-center px-4 rounded-xl ${highlight ? 'bg-blue-50/50 border border-primary/10' : 'bg-slate-50 border border-transparent'}`}>
      <span className={`font-semibold text-sm ${highlight ? 'text-primary' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}
