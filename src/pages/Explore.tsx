import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Check, Calendar, Heart, TrendingDown, Sun, Users, Droplets, Snowflake, Diamond, Clock, Brain } from 'lucide-react';

export default function Explore() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Recommended For You</h2>
          <p className="text-slate-500 text-sm">Based on your preference for <span className="font-semibold text-primary">Budget</span> & <span className="font-semibold text-primary">Nature</span></p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scroll">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary/50 hover:bg-blue-50 transition-colors whitespace-nowrap group">
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary">Weekend Getaway</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-primary/20 rounded-full shadow-sm whitespace-nowrap">
            <span className="text-sm font-medium text-primary">Budget Friendly</span>
            <Check className="w-4 h-4 text-primary" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-primary/20 rounded-full shadow-sm whitespace-nowrap">
            <span className="text-sm font-medium text-primary">Nature</span>
            <Check className="w-4 h-4 text-primary" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary/50 hover:bg-blue-50 transition-colors whitespace-nowrap group">
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary">Adventure</span>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary/50 hover:bg-blue-50 transition-colors whitespace-nowrap group">
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary">Dates: Nov</span>
            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-primary" />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        <TripCard 
          id="gokarna"
          title="Gokarna, Karnataka"
          subtitle="Chill beach vibes • 94% Match"
          img="https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=1935&ixlib=rb-4.0.3"
          cost="₹5,000 - ₹8,000"
          duration="2-3 Days"
          tags={[
            { icon: <Sun className="w-3.5 h-3.5" />, text: "Sunny 28°C", color: "orange" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "Low Crowd", color: "green" }
          ]}
          badge={{ icon: <TrendingDown className="w-3.5 h-3.5" />, text: "Cheapest in Nov", color: "bg-accent-green" }}
          reason="Perfect for your solo travel preference. It's affordable, offers the nature disconnect you wanted, and November is the start of the season before peak crowds arrive."
        />
        
        <TripCard 
          id="varkala"
          title="Varkala, Kerala"
          subtitle="Cliffside Views • 88% Match"
          img="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3"
          cost="₹7,000 - ₹10,000"
          duration="3-4 Days"
          tags={[
            { icon: <Droplets className="w-3.5 h-3.5" />, text: "Humidity 70%", color: "blue" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "Moderate Crowd", color: "yellow" }
          ]}
          reason="Great alternative to Goa. Matches your interest in scenic cafes and calm waters. Slightly higher cost but worth it for the views."
        />
        
        <TripCard 
          id="mcleodganj"
          title="McLeod Ganj, HP"
          subtitle="Mountain Peace • 91% Match"
          img="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3"
          cost="₹6,000 - ₹9,000"
          duration="3-4 Days"
          tags={[
            { icon: <Snowflake className="w-3.5 h-3.5" />, text: "Chilly 12°C", color: "blue" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "Low Crowd", color: "green" }
          ]}
          reason="You mentioned needing 'peace'. The Tibetan influence and mountain air are perfect for mental resets. Costs are low if you stay in hostels."
        />
        
        <TripCard 
          id="rishikesh"
          title="Rishikesh, UK"
          subtitle="Adventure & Yoga • 85% Match"
          img="https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3"
          cost="₹4,500 - ₹7,000"
          duration="2 Days"
          tags={[
            { icon: <Sun className="w-3.5 h-3.5" />, text: "Mild 22°C", color: "orange" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "High Crowd", color: "red" }
          ]}
          reason="Fits your budget perfectly. While crowded, it offers the rafting adventure you bookmarked last week."
        />
        
        <TripCard 
          id="udaipur"
          title="Udaipur, Rajasthan"
          subtitle="Royal Heritage • 82% Match"
          img="https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&q=80&w=2067&ixlib=rb-4.0.3"
          cost="₹8,000 - ₹12,000"
          duration="3 Days"
          tags={[
            { icon: <Sun className="w-3.5 h-3.5" />, text: "Warm 30°C", color: "orange" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "Moderate Crowd", color: "yellow" }
          ]}
          badge={{ icon: <Diamond className="w-3.5 h-3.5" />, text: "Best Value", color: "bg-primary" }}
          reason="A bit pricier, but hits your 'aesthetic photos' goal perfectly. Hostels are available to offset travel costs."
        />
        
        <TripCard 
          id="pondicherry"
          title="Pondicherry"
          subtitle="French Vibes • 80% Match"
          img="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3"
          cost="₹6,000 - ₹9,000"
          duration="2-3 Days"
          tags={[
            { icon: <Droplets className="w-3.5 h-3.5" />, text: "Rain Likely", color: "blue" },
            { icon: <Users className="w-3.5 h-3.5" />, text: "Low Crowd", color: "green" }
          ]}
          reason="Great for cycling and food. Weather is a bit unpredictable this week, but that keeps the crowd low and prices cheap."
        />
      </div>
    </div>
  );
}

function TripCard({ id, title, subtitle, img, cost, duration, tags, badge, reason }: any) {
  const [isOpen, setIsOpen] = useState(false);
  
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50 text-orange-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <article className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden flex flex-col group h-full border border-gray-100 relative">
      <div className="absolute top-3 right-3 z-20">
        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5 fill-current" />
        </button>
      </div>
      
      <Link to={`/trip/${id}`} className="relative h-64 overflow-hidden block">
        {badge && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
            <span className={`${badge.color}/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1`}>
              {badge.icon} {badge.text}
            </span>
          </div>
        )}
        
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-4 text-white">
          <h3 className="text-xl font-bold leading-tight">{title}</h3>
          <p className="text-white/90 text-sm font-medium">{subtitle}</p>
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Est. Cost</p>
            <p className="text-lg font-bold text-slate-800">{cost}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-0.5">Duration</p>
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-[18px] h-[18px] text-slate-500" />
              <p className="text-sm font-medium text-slate-700">{duration}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {tags.map((tag: any, i: number) => (
            <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${colorMap[tag.color]}`}>
              {tag.icon} {tag.text}
            </span>
          ))}
        </div>
        
        <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 cursor-pointer select-none"
          >
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Why this fits you
            </span>
            <ChevronDown className={`w-[18px] h-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="px-3 pb-3 pt-0">
              <p className="text-xs text-slate-600 leading-relaxed">
                {reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
