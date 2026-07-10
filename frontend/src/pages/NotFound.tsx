import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center px-margin-mobile py-32 text-center md:px-margin-desktop">
      <p className="mb-4 text-label-caps text-on-surface-variant">Page not found</p>
      <h1 className="mb-4 font-display text-display-lg-mobile text-primary md:text-display-lg">
        This trail leads nowhere.
      </h1>
      <p className="mb-10 max-w-md text-body-lg text-on-surface-variant">
        The page you were looking for is not here. Let us get you back to somewhere useful.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
