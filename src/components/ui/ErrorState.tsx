import Icon from '../Icon';
import Button from './Button';

export default function ErrorState({
  title = 'Hit a bit of turbulence',
  description = "That didn't load, but everything's still right where you left it. Mind trying again?",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Icon name="error" className="mb-4 text-4xl text-error" />
      <h3 className="mb-2 font-display text-headline-sm text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-body-md text-on-surface-variant">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
