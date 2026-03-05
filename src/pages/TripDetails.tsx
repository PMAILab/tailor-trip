import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Download, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, Sun, CloudRain, Plane, Hotel, Coffee, Camera, Map } from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('itinerary');

  return (
    <div className="flex-grow w-full bg-background-light">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px]">
        <img 
          src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2038&ixlib=rb-4.0.3" 
          alt="Bali" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <Link to="/explore" className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex gap-3">
            <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-full transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 md:left-12 right-6 md:right-12 z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">94% Match</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" /> 28°C Sunny
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Indonesia
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-md">Bali Escape</h1>
          <p className="text-xl text-white/90 font-medium drop-shadow-sm">Ubud & Seminyak • 5 Days</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Summary */}
          <div className="bg-blue-50/50 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded-md"><CheckCircle2 className="w-4 h-4" /></span>
              Why this trip is perfect for you
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Based on your desire for a <strong className="text-slate-800">"chill beach vibe under $1000"</strong>, Bali offers the best value. We've optimized this itinerary to skip the crowded Kuta area and focus on the serene rice terraces of Ubud and the upscale but relaxed beaches of Seminyak.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 flex gap-8">
            <button 
              onClick={() => setActiveTab('itinerary')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'itinerary' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Itinerary
              {activeTab === 'itinerary' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('costs')}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'costs' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Costs & Logistics
              {activeTab === 'costs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'itinerary' && (
            <div className="space-y-8">
              <DayCard 
                day={1} 
                title="Arrival & Ubud Chill" 
                desc="Settle into your jungle retreat and explore the local markets."
                activities={[
                  { time: '14:00', title: 'Check-in at Wapa di Ume Resort', icon: <Hotel className="w-4 h-4" /> },
                  { time: '16:00', title: 'Campuhan Ridge Walk (Sunset)', icon: <Map className="w-4 h-4" /> },
                  { time: '19:00', title: 'Dinner at Locavore (Pre-booked)', icon: <Coffee className="w-4 h-4" /> }
                ]}
              />
              <DayCard 
                day={2} 
                title="Culture & Waterfalls" 
                desc="Discover the spiritual side of Bali and its natural wonders."
                activities={[
                  { time: '08:00', title: 'Tegalalang Rice Terrace (Beat the crowds)', icon: <Camera className="w-4 h-4" /> },
                  { time: '11:00', title: 'Tirta Empul Water Temple', icon: <Map className="w-4 h-4" /> },
                  { time: '15:00', title: 'Tegenungan Waterfall', icon: <Camera className="w-4 h-4" /> }
                ]}
              />
              <DayCard 
                day={3} 
                title="Move to Seminyak" 
                desc="Transition from jungle to beach for the second half of your trip."
                activities={[
                  { time: '10:00', title: 'Transfer to Seminyak (1.5 hrs)', icon: <Plane className="w-4 h-4" /> },
                  { time: '14:00', title: 'Check-in at The Seminyak Beach Resort', icon: <Hotel className="w-4 h-4" /> },
                  { time: '17:00', title: 'Sunset at Potato Head Beach Club', icon: <Coffee className="w-4 h-4" /> }
                ]}
              />
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Estimated Breakdown</h3>
                
                <div className="space-y-4">
                  <CostRow icon={<Plane className="w-5 h-5" />} title="Flights (Roundtrip)" cost="$450" />
                  <CostRow icon={<Hotel className="w-5 h-5" />} title="Accommodation (4 nights)" cost="$320" />
                  <CostRow icon={<Coffee className="w-5 h-5" />} title="Food & Dining" cost="$150" />
                  <CostRow icon={<Map className="w-5 h-5" />} title="Activities & Transport" cost="$80" />
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Estimate</span>
                    <span className="text-2xl font-black text-primary">$1,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <h4 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Pro Tip
                </h4>
                <p className="text-orange-700 text-sm">
                  Booking flights on Tuesdays usually saves about 15% for this route. We recommend booking at least 3 weeks in advance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-24">
            <div className="mb-6">
              <p className="text-sm text-slate-500 font-medium mb-1">Total Estimated Cost</p>
              <div className="flex items-end gap-2">
                <h2 className="text-4xl font-black text-slate-900">$1,000</h2>
                <span className="text-slate-400 text-sm mb-1">/ person</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Duration</p>
                  <p className="font-semibold text-slate-900">5 Days, 4 Nights</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Best Time</p>
                  <p className="font-semibold text-slate-900">May - September</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors shadow-md shadow-blue-200 mb-3">
              Save to Shortlist
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-slate-700 font-bold py-4 rounded-xl transition-colors border border-gray-200 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, title, desc, activities }: any) {
  return (
    <div className="relative pl-8 md:pl-0">
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-[27px]"></div>
      
      <div className="md:flex gap-6 relative">
        <div className="hidden md:flex flex-col items-center z-10">
          <div className="w-14 h-14 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center shadow-sm">
            <span className="text-lg font-black text-primary">{day}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1 mb-6 md:mb-0">
          <div className="md:hidden absolute -left-4 top-6 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
            {day}
          </div>
          
          <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
          <p className="text-slate-500 mb-6">{desc}</p>
          
          <div className="space-y-4">
            {activities.map((act: any, i: number) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="text-slate-400 mt-0.5">{act.icon}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{act.time}</p>
                  <p className="text-sm text-slate-600">{act.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CostRow({ icon, title, cost }: any) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <span className="font-medium text-slate-700">{title}</span>
      </div>
      <span className="font-bold text-slate-900">{cost}</span>
    </div>
  );
}
