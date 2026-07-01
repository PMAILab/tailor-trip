import type { ReactNode } from 'react';
import { useAuth } from '../../state/AuthContext';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

/** Soft gate for personal pages. Signed-out users see a gentle prompt that
 *  opens the sign-in modal, not a hard redirect. */
export default function Gated({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { isAuthed, openAuthModal } = useAuth();
  if (isAuthed) return <>{children}</>;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile md:px-margin-desktop">
      <EmptyState
        icon="lock"
        title={title}
        description={description}
        action={
          <Button variant="accent" onClick={() => openAuthModal(title)}>
            Sign in to continue
          </Button>
        }
      />
    </div>
  );
}
