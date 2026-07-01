import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Profile() {
  const { user, isMock, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <p className="mb-4 text-label-caps text-on-surface-variant">Your profile</p>
      <h1 className="mb-10 font-display text-display-lg-mobile text-primary md:text-display-lg">
        {user?.name ?? 'Traveller'}
      </h1>

      <Card className="max-w-xl p-8">
        <div className="flex items-center gap-4 border-b border-hairline pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-headline-sm text-on-primary">
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-body-md text-on-surface">{user?.name ?? 'Traveller'}</p>
            <p className="text-body-sm text-on-surface-variant">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <p className="text-body-sm text-on-surface-variant">
            Saved trips, preferences, and connected accounts arrive in a later phase.
            {isMock ? ' You are signed in with a local demo session.' : ''}
          </p>
          <div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
