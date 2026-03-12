import React, { useState, useEffect } from 'react';
import { User, Settings, Shield, CreditCard, Bell, LogOut, Camera, MapPin, Edit2, Check, Loader2 } from 'lucide-react';
import { getProfile, updateProfile } from '../lib/api';
import { BUDGET_RANGES, MOODS } from '../data/constants';
import type { BudgetRange } from '../types/types';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('Alex Rivera');
  const [budget, setBudget] = useState<BudgetRange | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      if (data.name) setName(data.name);
      if (data.preferredBudgetRange) setBudget(data.preferredBudgetRange);
      if (data.moods) setSelectedMoods(data.moods);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        name,
        preferredBudgetRange: budget,
        moods: selectedMoods,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleMood = (moodId: string) => {
    if (!isEditing) return;
    setSelectedMoods(prev =>
      prev.includes(moodId)
        ? prev.filter(m => m !== moodId)
        : [...prev, moodId]
    );
  };

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
          
          {isEditing ? (
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="text-xl font-bold text-slate-900 mb-1 text-center w-full border-b-2 border-primary outline-none focus:bg-blue-50 bg-transparent rounded"
            />
          ) : (
            <h2 className="text-xl font-bold text-slate-900 mb-1">{name}</h2>
          )}
          <p className="text-slate-500 text-sm mb-4">hello@{name.toLowerCase().replace(/\s+/g, '')}.com</p>
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
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">Travel Preferences</h1>
              <p className="text-slate-500">Customize your AI recommendations.</p>
            </div>
            {isEditing ? (
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 text-white font-semibold text-sm transition-colors bg-primary hover:bg-primary-hover px-6 py-2 rounded-lg shadow-sm shadow-blue-200 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm transition-colors bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Core Vibe</h3>
              <div className="flex flex-wrap gap-3">
                {MOODS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => toggleMood(m.id)}
                    disabled={!isEditing}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium text-center transition-all disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer ${
                      selectedMoods.includes(m.id) 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-white border border-gray-200 text-slate-600 hover:border-primary/50 hover:bg-blue-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Typical Budget</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {BUDGET_RANGES.map(b => (
                  <button 
                    key={b.id}
                    onClick={() => isEditing && setBudget(b)}
                    disabled={!isEditing}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors text-center disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer ${
                      budget?.id === b.id 
                        ? 'border-primary bg-blue-50 text-primary font-bold' 
                        : 'border-gray-200 text-slate-600 font-medium hover:border-gray-300'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactElement, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${active ? 'bg-primary text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      {label}
    </button>
  );
}
