/**
 * Phase 0 scaffold: a single on-brand hero so the Quiet Luxury design
 * tokens are visible and the app boots clean. Real routing, layout, and
 * pages land in Phase 1.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5">
          <span className="font-serif text-xl">TailorTrip</span>
          <nav className="flex items-center gap-8 text-sm">
            <a className="text-muted transition-colors hover:text-ink" href="#">
              Explore
            </a>
            <a className="text-muted transition-colors hover:text-ink" href="#">
              Log in
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6">
        <section className="py-24">
          <p className="label-caps mb-5 text-muted">Smart travel optimizer</p>
          <h1 className="max-w-3xl text-6xl leading-[1.05]">Don't just book. Optimize.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Start with a mood, see where your money goes furthest, and travel when it is calm and
            cheap.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-btn bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
              Start with a mood
            </button>
            <button className="rounded-btn border border-ink px-6 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-canvas">
              Log in
            </button>
          </div>

          <p className="mt-16 max-w-md border-t border-hairline pt-6 text-sm text-muted tabular">
            Example: Coorg, 3 days, from ₹5,000 per person.
          </p>
        </section>
      </main>
    </div>
  );
}
