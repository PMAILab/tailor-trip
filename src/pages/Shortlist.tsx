import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Calendar, Users, MapPin, Clock } from 'lucide-react';

export default function Shortlist() {
  return (
    <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Your Shortlist</h1>
          <p className="text-slate-500 text-lg">Trips you're considering for your next escape.</p>
        </div>
        
        <Link to="/compare" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm shadow-blue-200">
          Compare Selected
        </Link>
      </div>

      <div className="space-y-6">
        <ShortlistCard 
          id="bali"
          title="Bali Escape"
          location="Ubud & Seminyak, Indonesia"
          img="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2038&ixlib=rb-4.0.3"
          cost="$1,000"
          duration="5 Days"
          match="94%"
          tags={["Chill beach vibe", "Under $1000", "Nature"]}
          selected={true}
        />
        
        <ShortlistCard 
          id="kyoto"
          title="Kyoto Zen"
          location="Kyoto, Japan"
          img="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          cost="$1,800"
          duration="7 Days"
          match="88%"
          tags={["Culture", "Temples", "Food"]}
          selected={true}
        />
        
        <ShortlistCard 
          id="tulum"
          title="Tulum Wellness"
          location="Quintana Roo, Mexico"
          img="https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&q=80&w=2067&ixlib=rb-4.0.3"
          cost="$1,200"
          duration="4 Days"
          match="82%"
          tags={["Yoga", "Beaches", "Nightlife"]}
          selected={false}
        />
      </div>

      <div className="mt-12 text-center sm:hidden">
        <Link to="/compare" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md shadow-blue-200 w-full justify-center">
          Compare Selected (2)
        </Link>
      </div>
    </div>
  );
}

function ShortlistCard({ id, title, location, img, cost, duration, match, tags, selected }: any) {
  return (
    <div className={`bg-white rounded-2xl p-4 sm:p-6 border transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative group ${selected ? 'border-primary shadow-[0_8px_30px_rgb(0,0,0,0.08)]' : 'border-gray-200 shadow-sm hover:border-primary/50'}`}>
      
      <div className="absolute top-4 left-4 z-10 sm:static">
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
          {selected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </div>
      </div>

      <Link to={`/trip/${id}`} className="w-full sm:w-48 h-48 sm:h-32 rounded-xl overflow-hidden shrink-0 relative block">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
          {match} Match
        </div>
      </Link>

      <div className="flex-1 flex flex-col justify-between h-full w-full">
        <div className="mb-4 sm:mb-0">
          <div className="flex justify-between items-start mb-1">
            <Link to={`/trip/${id}`} className="hover:text-primary transition-colors">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
            </Link>
            <div className="flex items-center gap-2">
              <button className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5" /> {location}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 shrink-0">
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Est. Total</p>
          <p className="text-2xl font-black text-slate-900">{cost}</p>
        </div>
        
        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">{duration}</span>
        </div>
      </div>
    </div>
  );
}
