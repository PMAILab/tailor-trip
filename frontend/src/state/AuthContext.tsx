import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getSession, signIn, signOutRequest, signUp, type AuthUser } from '../lib/api';
import { track } from '../lib/analytics';

export type { AuthUser };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  isAuthed: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // Soft auth gate
  authModalOpen: boolean;
  authModalReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  /** Runs `action` if signed in; otherwise opens the soft sign-in modal and
   *  runs it once the user authenticates. Returns true if already signed in. */
  requireAuth: (action?: () => void, reason?: string) => boolean;
  /** Patches the locally-held user (e.g. after a profile name change) without
   *  a full session refetch — this app never exposes a Supabase client to
   *  the browser, so there's no `refreshSession()` to sync from. */
  updateLocalUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const pendingAction = useRef<(() => void) | null>(null);

  // Bootstrap the session from the server's httpOnly cookie.
  useEffect(() => {
    let active = true;
    getSession()
      .then(({ user: u, mock }) => {
        if (!active) return;
        setUser(u);
        setIsMock(mock);
      })
      .catch(() => {
        /* treat as signed out */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const finishAuth = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
    const fn = pendingAction.current;
    pendingAction.current = null;
    if (fn) fn();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const result = await signIn(email, password);
      if (result.error || !result.user) return { error: result.error ?? 'Sign in failed' };
      setUser(result.user);
      finishAuth();
      return {};
    },
    [finishAuth],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
      const result = await signUp(email, password, name);
      if (result.error) return { error: result.error };
      if (!result.user) return { error: 'Sign up failed' };
      track('signup', { method: 'email' });
      setUser(result.user);
      finishAuth();
      return {};
    },
    [finishAuth],
  );

  const signOut = useCallback(async () => {
    await signOutRequest().catch(() => {
      /* clear local state regardless of network outcome */
    });
    setUser(null);
  }, []);

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

  const updateLocalUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isMock,
    isAuthed: Boolean(user),
    signInWithEmail,
    signUpWithEmail,
    signOut,
    authModalOpen,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    requireAuth,
    updateLocalUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
