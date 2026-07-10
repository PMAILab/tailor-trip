import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../state/AuthContext';
import AuthForm from './AuthForm';

/** Soft sign-in gate. Opens over the current screen for personal actions
 *  (save, compare, itinerary). Dismissible — never a hard wall. This is the
 *  app's most-seen "gate" moment, so its entrance is deliberately polished. */
export default function SignInModal() {
  const { authModalOpen, authModalReason, closeAuthModal } = useAuth();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!authModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [authModalOpen]);

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.button
            type="button"
            aria-label="Dismiss"
            onClick={closeAuthModal}
            className="absolute inset-0 cursor-default bg-surface-dim/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="relative flex w-full max-w-md flex-col items-center rounded-[10px] border border-outline-variant bg-surface p-8 text-center shadow-[0px_4px_20px_rgba(23,22,15,0.06)] md:p-12"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
