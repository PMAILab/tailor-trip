import React, { useState } from 'react';
import { User, Settings, Shield, CreditCard, Bell, LogOut, Camera, MapPin, Calendar, Edit2 } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('preferences');

  return (
    <div className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3" 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-sm hover:bg-primary-hover transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Alex Rivera</h2>
          <p className="text-slate-500 text-sm mb-4">alex.rivera@example.com</p>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 py-1.5 px-3 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-primary" /> San Francisco, CA
          </div>
        </div>

        <nav className="space-y-1">
          <NavButton icon={<User />} label="Travel Preferences" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
          <NavButton icon={<Settings />} label="Account Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <NavButton icon={<CreditCard />} label="Payment Methods" active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
          <NavButton icon={<Bell />} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <NavButton icon={<Shield />} label="Privacy & Security" active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">Travel Preferences</h1>
              <p className="text-slate-500">Customize your AI recommendations.</p>
            </div>
            <button className="flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Core Vibe</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PreferenceTag label="Nature" active />
                <PreferenceTag label="Adventure" />
                <PreferenceTag label="Culture" active />
                <PreferenceTag label="Relaxation" active />
                <PreferenceTag label="Nightlife" />
                <PreferenceTag label="Foodie" active />
                <PreferenceTag label="Luxury" />
                <PreferenceTag label="Budget" active />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Typical Budget</h3>
              <div className="flex gap-4">
                <button className="flex-1 py-3 px-4 rounded-xl border-2 border-primary bg-blue-50 text-primary font-bold transition-colors text-center">
                  $ (&lt; $1000)
                </button>
                <button className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-600 font-medium hover:border-gray-300 transition-colors text-center">
                  $$ ($1k-$3k)
                </button>
                <button className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-slate-600 font-medium hover:border-gray-300 transition-colors text-center">
                  $$$ ($3k+)
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pace</h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-sm font-medium text-slate-600 mb-4">
                  <span>Slow & Chill</span>
                  <span className="text-primary font-bold">Balanced</span>
                  <span>Action-Packed</span>
                </div>
                <input type="range" min="1" max="3" defaultValue="2" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            </section>
            
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-3">
                <PreferenceTag label="Vegetarian" active />
                <PreferenceTag label="Vegan" />
                <PreferenceTag label="Gluten-Free" />
                <PreferenceTag label="Halal" />
                <PreferenceTag label="None" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${active ? 'bg-primary text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      {label}
    </button>
  );
}

function PreferenceTag({ label, active }: { label: string, active?: boolean }) {
  return (
    <div className={`px-4 py-2.5 rounded-xl text-sm font-medium text-center cursor-pointer transition-all ${active ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-slate-600 hover:border-primary/50 hover:bg-blue-50'}`}>
      {label}
    </div>
  );
}
