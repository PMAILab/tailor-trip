import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useItinerary } from '../state/ItineraryContext';
import { openBooking } from '../lib/booking';
import { PARTY_TYPES } from '../data/itineraryOptions';
import type { ItineraryDay, ItineraryInputs, SlotKey } from '../types/types';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const SLOT_LABELS: Record<SlotKey, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function bookOut(destination: string, id?: string) {
  openBooking(destination, id);
}

export default function ItineraryView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { current, getSaved, savedLoading, regenerateDay, editSlot, saveCurrent, shareCurrent, regeneratingDay } =
    useItinerary();

  const isDraft = id === 'draft';
  const savedEntry = isDraft ? null : getSaved(id);

  const inputs: ItineraryInputs | null = isDraft ? current.inputs : (savedEntry?.inputs ?? null);
  const days: ItineraryDay[] = isDraft ? current.days : (savedEntry?.days ?? []);
  const generating = isDraft && current.status === 'generating';
  const editable = isDraft;

  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  // A direct reload/deep-link on a real saved itinerary shouldn't flash
  // "not found" before the saved-itineraries list has finished loading.
  const stillLoadingSaved = !isDraft && savedLoading;
  if (stillLoadingSaved) {
    return <DaySkeleton index={1} />;
  }
  if (!inputs && !generating) {
    return (
      <EmptyState
        icon="map"
        title="No itinerary here yet"
        description="Start from a trip and generate a plan, or pick one you saved earlier."
        action={
          <Link to="/explore">
            <Button variant="accent">Explore destinations</Button>
          </Link>
        }
      />
    );
  }

  const partyLabel = PARTY_TYPES.find((p) => p.id === inputs?.partyType)?.label ?? '';

  async function handleSave() {
    const newId = await saveCurrent();
    if (newId) {
      flash('Saved to your profile');
      navigate(`/itinerary/${newId}`, { replace: true });
    } else {
      flash('Could not save — sign in and try again');
    }
  }

  async function handleShare() {
    const ok = await shareCurrent();
    flash(ok ? 'Itinerary copied to clipboard' : 'Could not copy, try again');
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-12 pb-28 md:px-margin-desktop">
      <header className="mb-12 border-b border-outline-variant pb-8 text-center md:text-left">
        <h1 className="mb-3 font-display text-display-lg-mobile text-primary md:text-display-lg">
          {inputs?.destination ?? 'Planning your trip'}
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          {generating && days.length === 0
            ? 'Curating your itinerary…'
            : days.length > 0
              ? `${days.length} day${days.length > 1 ? 's' : ''}`
              : 'Planning'}
          {partyLabel && !generating ? `, ${partyLabel.toLowerCase()}` : ''}
        </p>
      </header>

      <div className="max-w-3xl">
        {days.map((day) => (
          <DayBlock
            key={day.day}
            day={day}
            editable={editable}
            regenerating={regeneratingDay === day.day}
            onRegenerate={() => regenerateDay(day.day)}
            onEdit={(slot, activity) => editSlot(day.day, slot, { activity })}
          />
        ))}

        {generating && <DaySkeleton index={days.length + 1} />}

        {isDraft && current.status === 'error' && (
          <p className={`text-body-md text-error ${days.length > 0 ? 'mt-8 rounded-xl border border-error/30 bg-error/10 p-4' : ''}`}>
            {days.length > 0
              ? 'Planning was interrupted — some days may be missing. You can regenerate individual days above.'
              : 'Something interrupted the planning. Please head back and try again.'}
          </p>
        )}
      </div>

      {/* Actions */}
      {days.length > 0 && (
        <div className="fixed bottom-16 left-0 z-40 flex w-full items-center justify-center gap-4 border-t border-outline-variant bg-surface/95 p-4 shadow-lg backdrop-blur-md md:bottom-8 md:left-1/2 md:w-auto md:-translate-x-1/2 md:rounded-full md:border md:px-6 md:py-3">
          {editable && (
            <button
              type="button"
              onClick={() => void handleSave()}
              className="flex items-center gap-2 text-label-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon name="bookmark" className="text-[18px]" />
              Save
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 text-label-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name="share" className="text-[18px]" />
            Share
          </button>
          <button
            type="button"
            onClick={() => bookOut(inputs?.destination ?? '', inputs?.destinationId)}
            className="rounded-[4px] bg-primary px-6 py-2 text-body-sm text-on-primary transition-colors hover:bg-accent"
          >
            Book this trip
          </button>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-32 left-1/2 z-50 -translate-x-1/2 rounded-full bg-inverse-surface px-5 py-2 text-body-sm text-inverse-on-surface shadow-lg md:bottom-24"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayBlock({
  day,
  editable,
  regenerating,
  onRegenerate,
  onEdit,
}: {
  day: ItineraryDay;
  editable: boolean;
  regenerating: boolean;
  onRegenerate: () => void;
  onEdit: (slot: SlotKey, activity: string) => void;
}) {
  return (
    <section className="relative mb-16 border-l border-outline-variant pl-8 md:pl-12">
      <div className="absolute -left-3 top-0 bg-surface py-1 text-label-caps uppercase text-on-surface">
        Day {day.day}
      </div>
      <div className="flex items-start justify-between gap-4 pt-6">
        <h2 className="mb-8 font-display text-headline-md text-primary">{day.title ?? `Day ${day.day}`}</h2>
        {editable && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex shrink-0 items-center gap-1 text-label-caps uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary disabled:opacity-50"
          >
            <Icon name="refresh" className={`text-[18px] ${regenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{regenerating ? 'Refreshing' : 'Refresh day'}</span>
          </button>
        )}
      </div>

      {regenerating ? (
        <div className="space-y-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {(['morning', 'afternoon', 'evening'] as SlotKey[]).map((slot) => {
            const s = day.slots[slot];
            return (
              <article key={slot} className="flex flex-col gap-2 md:flex-row md:gap-8">
                <div className="w-full shrink-0 text-label-caps uppercase text-on-surface-variant md:w-28 md:pt-1">
                  {SLOT_LABELS[slot]}
                </div>
                <div className="flex-grow">
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                    <EditableText
                      value={s.activity}
                      editable={editable}
                      onCommit={(v) => onEdit(slot, v)}
                      className="font-display text-headline-sm text-primary"
                    />
                    <span className="tabular text-body-sm text-on-surface-variant">{s.cost}</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {s.venue} • {s.duration}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-body-md text-on-surface-variant">
                    <Icon name="auto_awesome" className="mt-0.5 text-[16px]" />
                    <span>{s.reason}</span>
                  </p>
                </div>
              </article>
            );
          })}
          <p className="border-t border-outline-variant pt-4 text-label-caps uppercase text-on-surface-variant">
            Day cost, around {day.estimatedDayCost}
          </p>
        </div>
      )}
    </section>
  );
}

function EditableText({
  value,
  editable,
  onCommit,
  className,
}: {
  value: string;
  editable: boolean;
  onCommit: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editable) return <span className={className}>{value}</span>;

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft.trim() && draft !== value) onCommit(draft.trim());
          else setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`${className} w-full max-w-md border-b border-primary bg-transparent focus:outline-none`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`${className} group text-left`}
      title="Tap to edit"
    >
      {value}
      <Icon name="edit" className="ml-2 align-middle text-[14px] text-outline opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function DaySkeleton({ index }: { index: number }) {
  return (
    <section className="relative mb-16 border-l border-outline-variant pl-8 md:pl-12">
      <div className="absolute -left-3 top-0 bg-surface py-1 text-label-caps uppercase text-on-surface-variant">
        Day {index}
      </div>
      <div className="pt-6">
        <div className="mb-8 h-8 w-2/3 animate-pulse rounded bg-surface-container-high" />
        <div className="space-y-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
        <p className="mt-6 text-body-sm text-on-surface-variant">Curating day {index}…</p>
      </div>
    </section>
  );
}
