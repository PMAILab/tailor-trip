/** Temporary on-brand page stub used until each screen is built in its phase. */
export default function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-24 md:px-margin-desktop">
      <p className="mb-4 text-label-caps text-on-surface-variant">TailorTrip</p>
      <h1 className="mb-4 font-display text-display-lg-mobile text-primary md:text-display-lg">{title}</h1>
      <p className="max-w-xl text-body-lg text-on-surface-variant">
        {note ?? 'This screen arrives in a later build phase.'}
      </p>
    </div>
  );
}
