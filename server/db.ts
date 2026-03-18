import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { DESTINATIONS } from '../src/data/constants';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Call once at server startup.
 * Seeds the `destinations` and `monthly_data` tables if they are empty.
 */
export async function seedIfEmpty(): Promise<void> {
  const { count, error } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Supabase seed check error:', error.message);
    return;
  }

  if ((count ?? 0) > 0) {
    console.log(`Destinations already seeded (${count} rows). Skipping.`);
    return;
  }

  console.log('Seeding destinations…');

  // Insert destinations
  const destRows = DESTINATIONS.map((d) => ({
    id: d.id,
    name: d.name,
    state: d.state,
    hero_images: JSON.stringify(d.heroImages),
    sentiment: JSON.stringify(d.sentiment),
    description: d.description,
    moods: JSON.stringify(d.moods),
    duration_days: d.durationDays,
  }));

  const { error: destErr } = await supabase.from('destinations').insert(destRows);
  if (destErr) {
    console.error('Failed to seed destinations:', destErr.message);
    return;
  }

  // Insert monthly data
  const monthlyRows = DESTINATIONS.flatMap((d) =>
    d.monthlyData.map((m) => ({
      destination_id: d.id,
      month: m.month,
      estimated_cost: m.estimatedCost,
      crowd_level: m.crowdLevel,
      weather: m.weather,
    }))
  );

  const { error: monthErr } = await supabase.from('monthly_data').insert(monthlyRows);
  if (monthErr) {
    console.error('Failed to seed monthly_data:', monthErr.message);
    return;
  }

  console.log(`Seeded ${DESTINATIONS.length} destinations with monthly data.`);
}
