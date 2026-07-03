import type { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from './Icon';
import ChatWidget from './ChatWidget';
import { useAuth } from '../state/AuthContext';

const NAV = [
  { to: '/discover', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/shortlist', label: 'Shortlist', icon: 'bookmark' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthed, user, openAuthModal } = useAuth();
  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col pt-20 pb-16 md:pb-0">
      {/* ─── Desktop top nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 z-50 hidden w-full border-b border-outline-variant bg-surface/80 backdrop-blur-md md:block">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-margin-desktop">
          <Link to="/" className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight text-primary">
            <img src="/icon.svg" alt="" className="h-8 w-8" />
            TailorTrip
          </Link>
          <div className="flex h-full items-center gap-8 text-body-md">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex h-full items-center transition-colors ${
                    isActive
                      ? 'border-b-2 border-primary font-bold text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          {isAuthed ? (
            <NavLink
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-on-primary transition-opacity hover:opacity-80"
              aria-label="Profile"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                initial
              )}
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="flex items-center gap-2 text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon name="person" />
              Log in
            </button>
          )}
        </div>
      </nav>

      <main className="flex w-full flex-grow flex-col">{children}</main>

      {/* ─── Desktop footer ──────────────────────────────────────────── */}
      <footer className="mt-auto hidden w-full border-t border-outline-variant bg-surface md:block">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-margin-desktop py-6 md:flex-row">
          <div className="flex items-center gap-2 font-display text-lg text-primary">
            <img src="/icon.svg" alt="" className="h-5 w-5" />
            TailorTrip
          </div>
          <div className="flex gap-6 text-body-sm">
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">Made With Passion For Travel, Made In India, Made For India</a>
          </div>
          <div className="text-body-sm text-on-surface-variant">© 2026 TailorTrip. All rights reserved.</div>
        </div>
      </footer>

      {/* ─── Mobile bottom nav ───────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant bg-surface px-margin-mobile py-3 md:hidden">
        {[...NAV, { to: '/profile', label: 'Profile', icon: 'person' }].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 text-label-caps ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} filled={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <ChatWidget />
    </div>
  );
}
