import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Search, Plus, User, Bell } from 'lucide-react';
import { useApp } from '../state/AppContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { shortlist } = useApp();
  const isHome = location.pathname === '/';
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path === '/explore' && location.pathname.startsWith('/trip/'));
    return `text-sm font-medium transition-colors relative ${
      isActive ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light text-text-main font-sans antialiased">
      <header className={`sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-colors ${isHome ? 'bg-white' : 'bg-surface-light'}`}>
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 min-w-fit">
            <div className="text-primary p-2 bg-blue-50 rounded-lg">
              <Plane className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">TailorTrip</h1>
          </Link>

          {!isHome && (
            <div className="flex-1 max-w-xl hidden md:block">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 placeholder-gray-500 font-medium outline-none"
                  placeholder="Where do you want to go? (e.g. 'Kyoto', 'Bali')"
                />
              </form>
            </div>
          )}

          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/explore" className={navLinkClass('/explore')}>
                Explore
                {location.pathname === '/explore' && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
              <Link to="/shortlist" className={navLinkClass('/shortlist')}>
                My Trips
                {shortlist.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center justify-center">
                    {shortlist.length}
                  </span>
                )}
                {location.pathname === '/shortlist' && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
              <Link to="/compare" className={navLinkClass('/compare')}>
                Compare
                {location.pathname === '/compare' && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
              <Link to="/profile" className={navLinkClass('/profile')}>
                Profile
                {location.pathname === '/profile' && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
            </nav>
            <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>
            <div className="flex items-center gap-4">
              <button className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Plan a Trip</span>
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to="/profile" className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer flex items-center justify-center text-slate-500">
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto py-8">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2026 TailorTrip. AI-Powered Travel Decisions.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
