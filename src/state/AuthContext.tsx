import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { track } from '../lib/analytics';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  isAuthed: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // Soft auth gate
  authModalOpen: boolean;
  authModalReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  /** Runs `action` if signed in; otherwise opens the soft sign-in modal and
   *  runs it once the user authenticates. Returns true if already signed in. */
  requireAuth: (action?: () => void, reason?: string) => boolean;
}

const MOCK_KEY = 'tailortrip.mockUser';
const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(u: User): AuthUser {
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? '',
    name: (meta.full_name as string) ?? (meta.name as string) ?? undefined,
    avatarUrl: (meta.avatar_url as string) ?? (meta.picture as string) ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMock = !isSupabaseConfigured;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const pendingAction = useRef<(() => void) | null>(null);

  // Bootstrap the session.
  useEffect(() => {
    if (isMock) {
      try {
        const raw = localStorage.getItem(MOCK_KEY);
        if (raw) setUser(JSON.parse(raw) as AuthUser);
      } catch {
        /* ignore corrupt mock session */
      }
      setLoading(false);
      return;
    }

    let active = true;
    supabase!.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session ? mapUser(data.session.user) : null);
      setLoading(false);
    });
    const { data: sub } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapUser(session.user) : null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [isMock]);

  const finishAuth = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
    const fn = pendingAction.current;
    pendingAction.current = null;
    if (fn) fn();
  }, []);

  const setMockUser = useCallback((u: AuthUser) => {
    localStorage.setItem(MOCK_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      if (isMock) {
        setMockUser({ id: `mock-${email}`, email, name: email.split('@')[0] });
        finishAuth();
        return {};
      }
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      finishAuth();
      return {};
    },
    [isMock, setMockUser, finishAuth],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
      if (isMock) {
        setMockUser({ id: `mock-${email}`, email, name: name || email.split('@')[0] });
        track('signup', { method: 'email', mock: true });
        finishAuth();
        return {};
      }
      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return { error: error.message };
      track('signup', { method: 'email' });
      finishAuth();
      return {};
    },
    [isMock, setMockUser, finishAuth],
  );

  const signInWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    if (isMock) {
      setMockUser({ id: 'mock-google', email: 'traveller@gmail.com', name: 'Guest Traveller' });
      finishAuth();
      return {};
    }
    const { error } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return {}; // browser redirects to Google
  }, [isMock, setMockUser, finishAuth]);

  const signOut = useCallback(async () => {
    if (isMock) {
      localStorage.removeItem(MOCK_KEY);
      setUser(null);
      return;
    }
    await supabase!.auth.signOut();
  }, [isMock]);

  const openAuthModal = useCallback((reason?: string) => {
    setAuthModalReason(reason ?? null);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    pendingAction.current = null;
    setAuthModalOpen(false);
    setAuthModalReason(null);
  }, []);

  const requireAuth = useCallback(
    (action?: () => void, reason?: string): boolean => {
      if (user) {
        action?.();
        return true;
      }
      pendingAction.current = action ?? null;
      openAuthModal(reason);
      return false;
    },
    [user, openAuthModal],
  );

  const value: AuthContextValue = {
    user,
    loading,
    isMock,
    isAuthed: Boolean(user),
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    authModalOpen,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
