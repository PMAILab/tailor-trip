import { useState, type FormEvent } from 'react';
import { useAuth } from '../../state/AuthContext';
import Icon from '../Icon';

const inputClass =
  'w-full rounded-[4px] border border-hairline bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary';

/** Shared sign-in / sign-up form. Two stages: provider choice, then email.
 *  `returnTo` is where the browser should land after the Google OAuth round
 *  trip — a full-page navigation away from and back to the SPA, so it can't
 *  be threaded through as in-memory state the way the email flow can. */
export default function AuthForm({
  onSuccess,
  returnTo,
}: {
  onSuccess?: () => void;
  returnTo?: string;
}) {
  const { signInWithEmail, signUpWithEmail, isMock } = useAuth();
  const [stage, setStage] = useState<'choice' | 'email'>('choice');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleHref = `/api/auth/google?returnTo=${encodeURIComponent(
    returnTo ?? window.location.pathname + window.location.search,
  )}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res =
      mode === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, name);
    setLoading(false);
    if (res.error) setError(res.error);
    else onSuccess?.();
  }

  if (stage === 'choice') {
    return (
      <div className="flex w-full flex-col gap-4">
        <a
          href={googleHref}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-6 py-4 text-body-md text-on-primary transition-colors hover:bg-accent"
        >
          <Icon name="account_circle" filled />
          Continue with Google
        </a>
        <button
          type="button"
          onClick={() => setStage('email')}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-primary bg-transparent px-6 py-4 text-body-md text-primary transition-colors hover:bg-surface-dim"
        >
          <Icon name="mail" />
          Continue with email
        </button>
        {error && <p className="text-body-sm text-error">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
      {mode === 'signup' && (
        <input
          className={inputClass}
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      )}
      <input
        className={inputClass}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <input
        className={inputClass}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        required
      />
      {error && <p className="text-body-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full rounded-[4px] bg-accent px-6 py-4 text-body-md text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>

      <div className="flex items-center justify-between text-body-sm">
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-on-surface-variant underline underline-offset-4 hover:text-primary"
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
        <button
          type="button"
          onClick={() => setStage('choice')}
          className="text-on-surface-variant hover:text-primary"
        >
          Back
        </button>
      </div>

      {isMock && (
        <p className="mt-2 text-label-caps uppercase tracking-widest text-on-surface-variant">
          Demo mode: any email and password works
        </p>
      )}
    </form>
  );
}
