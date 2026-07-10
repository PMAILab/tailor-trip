import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useItinerary } from '../state/ItineraryContext';
import { getProfile, updateProfile, type UserProfile } from '../lib/api';
import { MOODS, BUDGET_RANGES } from '../data/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/Icon';

const PROFILE_KEY = 'tailortrip.profile';
const EMPTY_PROFILE: UserProfile = {
  name: null,
  homeCity: null,
  homeState: null,
  preferredMoods: [],
  defaultBudgetId: null,
};

// Mock mode has no real Supabase session (requireUser 401s it), so profile
// prefs live on-device instead — same pattern AppContext already uses for
// the shortlist in mock mode.
function loadLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<UserProfile>) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

type Status = 'loading' | 'ready' | 'error';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function Profile() {
  const { user, isMock, signOut, updateLocalUser } = useAuth();
  const { saved, savedLoading } = useItinerary();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('loading');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [name, setName] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homeState, setHomeState] = useState('');
  const [preferredMoods, setPreferredMoods] = useState<string[]>([]);
  const [defaultBudgetId, setDefaultBudgetId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus('loading');
      try {
        const profile = isMock ? loadLocalProfile() : await getProfile();
        if (!active) return;
        setName(profile.name ?? user?.name ?? '');
        setHomeCity(profile.homeCity ?? '');
        setHomeState(profile.homeState ?? '');
        setPreferredMoods(profile.preferredMoods);
        setDefaultBudgetId(profile.defaultBudgetId);
        setStatus('ready');
      } catch {
        if (active) setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [isMock, user?.name]);

  function toggleMood(id: string) {
    setPreferredMoods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaveStatus('saving');
    const trimmedName = name.trim();
    const patch = {
      name: trimmedName || undefined,
      homeCity: homeCity.trim() || null,
      homeState: homeState.trim() || null,
      preferredMoods,
      defaultBudgetId,
    };
    try {
      if (isMock) {
        saveLocalProfile({
          name: trimmedName || user?.name || null,
          homeCity: patch.homeCity,
          homeState: patch.homeState,
          preferredMoods: patch.preferredMoods,
          defaultBudgetId: patch.defaultBudgetId,
        });
      } else {
        await updateProfile(patch);
      }
      if (patch.name) updateLocalUser({ name: patch.name });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  const initial = (name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <p className="mb-4 text-label-caps text-on-surface-variant">Your profile</p>
      <h1 className="mb-10 font-display text-display-lg-mobile text-primary md:text-display-lg">
        {user?.name ?? 'Traveller'}
      </h1>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <Card className="p-8 lg:col-span-5">
          <div className="flex items-center gap-4 border-b border-hairline pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-headline-sm text-on-primary">
              {initial}
            </div>
            <div>
              <p className="text-body-md text-on-surface">{user?.name ?? 'Traveller'}</p>
              <p className="text-body-sm text-on-surface-variant">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6">
            {isMock && (
              <p className="text-body-sm text-on-surface-variant">
                You are signed in with a local demo session — preferences below are saved on this device only.
              </p>
            )}
            <div>
              <Button variant="outline" onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-8 lg:col-span-7">
          <h2 className="mb-6 font-display text-headline-sm text-primary">Personalize your trips</h2>

          {status === 'loading' && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded bg-surface-container-high" />
              ))}
            </div>
          )}

          {status === 'error' && (
            <p className="text-body-sm text-error">Couldn&apos;t load your preferences. Try refreshing the page.</p>
          )}

          {status === 'ready' && (
            <div className="flex flex-col gap-8">
              <label className="block">
                <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">Name</span>
                <input
                  className="w-full rounded-[4px] border border-outline-variant bg-transparent px-4 py-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">Home city</span>
                  <input
                    className="w-full rounded-[4px] border border-outline-variant bg-transparent px-4 py-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-caps uppercase text-on-surface-variant">State</span>
                  <input
                    className="w-full rounded-[4px] border border-outline-variant bg-transparent px-4 py-3 text-body-md text-on-surface focus:border-primary focus:outline-none"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    placeholder="e.g. Karnataka"
                  />
                </label>
              </div>

              <div>
                <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">
                  Moods you keep coming back to
                </span>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => {
                    const active = preferredMoods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMood(m.id)}
                        aria-pressed={active}
                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-body-sm transition-colors ${
                          active
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        <Icon name={m.icon} filled={active} className="text-[16px]" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-3 block text-label-caps uppercase text-on-surface-variant">Usual budget</span>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_RANGES.map((b) => {
                    const active = defaultBudgetId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDefaultBudgetId(active ? null : b.id)}
                        aria-pressed={active}
                        className={`rounded-full border px-4 py-2 text-body-sm transition-colors ${
                          active
                            ? 'border-primary bg-primary text-on-primary'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-outline-variant pt-6">
                <Button onClick={() => void handleSave()} disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
                </Button>
                {saveStatus === 'saved' && <span className="text-body-sm text-accent">Saved</span>}
                {saveStatus === 'error' && (
                  <span className="text-body-sm text-error">Couldn&apos;t save, try again.</span>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-8 lg:col-span-12">
          <h2 className="mb-6 font-display text-headline-sm text-primary">Saved itineraries</h2>

          {savedLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded bg-surface-container-high" />
              ))}
            </div>
          )}

          {!savedLoading && saved.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">
              Nothing saved yet. Generate an itinerary and tap Save to keep it here.
            </p>
          )}

          {!savedLoading && saved.length > 0 && (
            <ul className="flex flex-col divide-y divide-outline-variant">
              {saved.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/itinerary/${s.id}`}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 hover:text-accent"
                  >
                    <div>
                      <p className="text-body-md text-on-surface">{s.inputs.destination}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {s.days.length} day{s.days.length === 1 ? '' : 's'} · saved{' '}
                        {new Date(s.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <Icon name="chevron_right" className="shrink-0 text-[20px] text-on-surface-variant" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
