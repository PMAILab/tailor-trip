import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import AuthForm from '../components/auth/AuthForm';

export default function Login() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/discover';

  useEffect(() => {
    if (isAuthed) navigate(from, { replace: true });
  }, [isAuthed, from, navigate]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-margin-mobile py-20 text-center md:py-24">
      <div className="mb-6 font-display text-3xl tracking-tight text-primary">TailorTrip</div>
      <h1 className="mb-8 font-display text-headline-md leading-tight text-primary">
        Keep your trips in one place
      </h1>
      <div className="w-full rounded-[10px] border border-outline-variant bg-surface p-8">
        <AuthForm returnTo={from} onSuccess={() => navigate(from, { replace: true })} />
      </div>
      <Link
        to="/discover"
        className="mt-8 text-label-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
      >
        Maybe later
      </Link>
    </div>
  );
}
