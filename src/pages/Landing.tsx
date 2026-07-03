import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../state/AuthContext';

const HERO_IMG =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2400';

const STEPS = [
  {
    n: '01',
    title: 'Start with a feeling',
    body: 'Describe the vibe you are chasing. We turn a mood into a shortlist, skipping the overwhelming grids of generic results.',
  },
  {
    n: '02',
    title: 'See the real cost',
    body: 'Transparent pricing. Understand the total expected spend, not just the flight and hotel, based on how you like to travel.',
  },
  {
    n: '03',
    title: 'Decide with confidence',
    body: 'Curated options presented with clarity. Compare alternatives quickly, then book without the second guessing.',
  },
];

export default function Landing() {
  const { isAuthed } = useAuth();

  return (
    <div className="w-full">
      <section className="mx-auto flex min-h-[58vh] max-w-[1280px] flex-col items-center justify-center px-margin-mobile py-24 text-center md:px-margin-desktop">
        <div className="max-w-3xl">
          <h1 className="mb-6 font-display text-display-lg-mobile text-primary md:text-display-lg">
            Don't just book. Optimize.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-body-lg text-on-surface-variant">
            TailorTrip takes you from a mood to a confident trip in five minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link to="/discover">
              <Button variant="primary" size="lg">
                Start with a mood
              </Button>
            </Link>
            {!isAuthed && (
              <Link
                to="/login"
                className="text-label-caps text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
              >
                Log in
              </Link>
            )}
          </div>
          <p className="mt-10 text-label-caps uppercase tracking-widest text-on-surface-variant">
            Transparent pricing · AI-curated picks · Always free to explore
          </p>
        </div>
      </section>

      <section className="w-full">
        <div
          className="h-[420px] w-full bg-cover bg-center md:h-[560px]"
          style={{ backgroundImage: `url('${HERO_IMG}')` }}
          role="img"
          aria-label="A misty mountain valley at dawn."
        />
      </section>

      <section className="mx-auto max-w-[1280px] px-margin-mobile py-24 md:px-margin-desktop">
        <div className="flex flex-col border-t border-outline-variant">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex flex-col items-start gap-6 border-b border-outline-variant py-8 md:flex-row md:items-center md:gap-12"
            >
              <span className="w-12 font-display text-headline-sm text-secondary">{s.n}</span>
              <div className="flex-1">
                <h3 className="mb-2 font-display text-headline-md text-primary">{s.title}</h3>
                <p className="text-body-md text-on-surface-variant">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
