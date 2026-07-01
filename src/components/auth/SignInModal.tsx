import { useEffect } from 'react';
import { useAuth } from '../../state/AuthContext';
import AuthForm from './AuthForm';

/** Soft sign-in gate. Opens over the current screen for personal actions
 *  (save, compare, itinerary). Dismissible — never a hard wall. */
export default function SignInModal() {
  const { authModalOpen, authModalReason, closeAuthModal } = useAuth();

  useEffect(() => {
    if (!authModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={closeAuthModal}
        className="absolute inset-0 cursor-default bg-surface-dim/50 backdrop-blur-sm"
      />
      <div className="relative flex w-full max-w-md flex-col items-center rounded-[10px] border border-outline-variant bg-surface p-8 text-center shadow-[0px_4px_20px_rgba(23,22,15,0.06)] md:p-12">
        <div className="mb-6 font-display text-3xl tracking-tight text-primary">TailorTrip</div>
        <h2 className="mb-8 font-display text-headline-md leading-tight text-primary">
          {authModalReason ?? 'Keep your trips in one place'}
        </h2>
        <AuthForm onSuccess={closeAuthModal} />
        <button
          type="button"
          onClick={closeAuthModal}
          className="mt-8 text-label-caps uppercase tracking-widest text-on-surface-variant transition-all hover:text-primary hover:underline"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
