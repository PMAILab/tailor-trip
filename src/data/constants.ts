import type { Mood, BudgetRange, Destination, MonthlyData } from '../types/types';

// ─── Moods ────────────────────────────────────────────────────────────

export const MOODS: Mood[] = [
  {
    id: 'reset',
    label: 'Need a Reset',
    emoji: '🌿',
    description: 'Calm beaches, yoga retreats, and silence.',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2070',
  },
  {
    id: 'adventure',
    label: 'Adventure Mode',
    emoji: '🧗',
    description: 'Treks, water sports, and adrenaline rushes.',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=2003',
  },
  {
    id: 'budget',
    label: 'Budget Weekend',
    emoji: '💸',
    description: 'Hidden gems that are easy on the wallet.',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=2070',
  },
  {
    id: 'romantic',
    label: 'Romantic Escape',
    emoji: '❤️',
    description: 'Scenic views, cozy stays, and intimate dining.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2070',
  },
  {
    id: 'workation',
    label: 'Workation Vibe',
    emoji: '💻',
    description: 'Strong WiFi, good coffee, and inspiring views.',
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=2070',
  },
  {
    id: 'explore',
    label: 'Explore Something New',
    emoji: '✨',
    description: 'Underrated spots and cultural deep dives.',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=2156',
  },
];

// ─── Budget Ranges ────────────────────────────────────────────────────

export const BUDGET_RANGES: BudgetRange[] = [
  { id: 'under-5k',   label: 'Under ₹5K',    min: 0,     max: 5000  },
  { id: '5k-10k',     label: '₹5K – ₹10K',   min: 5000,  max: 10000 },
  { id: '10k-20k',    label: '₹10K – ₹20K',  min: 10000, max: 20000 },
  { id: '20k-plus',   label: '₹20K+',         min: 20000, max: 100000 },
];

// ─── Helper to build 12-month data ───────────────────────────────────

type MD = [number, number, string, string]; // [month, cost, crowd, weather]

function buildMonthly(data: MD[]): MonthlyData[] {
  return data.map(([month, estimatedCost, crowdLevel, weather]) => ({
    month,
    estimatedCost,
    crowdLevel: crowdLevel as MonthlyData['crowdLevel'],
    weather: weather as MonthlyData['weather'],
  }));
}

// ─── Destinations ─────────────────────────────────────────────────────

export const DESTINATIONS: Destination[] = [
  {
    id: 'gokarna',
    name: 'Gokarna',
    state: 'Karnataka',
    heroImages: [
      'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&q=80&w=1935',
      'https://images.unsplash.com/photo-1590050751776-0cd1c0a12ce0?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'spiritual'],
    description: 'Pristine beaches, ancient temples, and a laid-back hippie vibe on Karnataka\'s coast.',
    moods: ['reset', 'budget'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,5500,'Low','Pleasant'],[2,5800,'Low','Pleasant'],[3,6500,'Medium','Hot'],
      [4,7000,'Medium','Hot'],[5,6000,'Low','Hot'],[6,4500,'Low','Rainy'],
      [7,4000,'Low','Rainy'],[8,4200,'Low','Rainy'],[9,4800,'Low','Rainy'],
      [10,5500,'Medium','Pleasant'],[11,5000,'Low','Pleasant'],[12,6000,'Medium','Pleasant'],
    ]),
  },
  {
    id: 'varkala',
    name: 'Varkala',
    state: 'Kerala',
    heroImages: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'wellness'],
    description: 'Dramatic cliffside views over the Arabian Sea with Ayurveda retreats and surf culture.',
    moods: ['reset', 'romantic'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,7500,'Medium','Pleasant'],[2,8000,'Medium','Pleasant'],[3,8500,'Medium','Hot'],
      [4,7000,'Low','Hot'],[5,6500,'Low','Rainy'],[6,5500,'Low','Rainy'],
      [7,5000,'Low','Rainy'],[8,5200,'Low','Rainy'],[9,5800,'Low','Rainy'],
      [10,7000,'Medium','Pleasant'],[11,7500,'Medium','Pleasant'],[12,9000,'High','Pleasant'],
    ]),
  },
  {
    id: 'mcleodganj',
    name: 'McLeod Ganj',
    state: 'Himachal Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1974',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['spiritual', 'cultural'],
    description: 'Home of the Dalai Lama — Tibetan monasteries, mountain trails, and cozy cafes.',
    moods: ['reset', 'budget', 'explore'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,6000,'Low','Cold'],[2,6200,'Low','Cold'],[3,6500,'Medium','Pleasant'],
      [4,7000,'Medium','Pleasant'],[5,7500,'High','Pleasant'],[6,6000,'Medium','Rainy'],
      [7,5000,'Low','Rainy'],[8,5200,'Low','Rainy'],[9,5800,'Medium','Pleasant'],
      [10,7000,'High','Pleasant'],[11,6500,'Medium','Cold'],[12,6000,'Low','Cold'],
    ]),
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    heroImages: [
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&q=80&w=2069',
      'https://images.unsplash.com/photo-1600240644455-3edc55c375fe?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['adventure', 'spiritual', 'wellness'],
    description: 'Yoga capital of the world with white-water rafting, bungee jumping, and Ganga aarti.',
    moods: ['adventure', 'reset'],
    durationDays: 2,
    monthlyData: buildMonthly([
      [1,5000,'Medium','Cold'],[2,5200,'Medium','Pleasant'],[3,5500,'High','Pleasant'],
      [4,6000,'High','Pleasant'],[5,6500,'High','Hot'],[6,5000,'Medium','Rainy'],
      [7,4500,'Low','Rainy'],[8,4500,'Low','Rainy'],[9,5000,'Medium','Pleasant'],
      [10,6000,'High','Pleasant'],[11,5500,'Medium','Pleasant'],[12,5000,'Medium','Cold'],
    ]),
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    heroImages: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&q=80&w=2067',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['romantic', 'cultural'],
    description: 'City of Lakes — royal palaces, sunset boat rides, and heritage hotels.',
    moods: ['romantic', 'explore'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,9000,'Medium','Pleasant'],[2,9500,'Medium','Pleasant'],[3,10000,'Medium','Hot'],
      [4,8500,'Low','Hot'],[5,8000,'Low','Hot'],[6,7000,'Low','Rainy'],
      [7,7500,'Low','Rainy'],[8,7500,'Medium','Rainy'],[9,8000,'Medium','Pleasant'],
      [10,9500,'High','Pleasant'],[11,10000,'High','Pleasant'],[12,11000,'High','Pleasant'],
    ]),
  },
  {
    id: 'pondicherry',
    name: 'Pondicherry',
    state: 'Tamil Nadu',
    heroImages: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1621425998519-09c54dc0c07e?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['cultural', 'romantic'],
    description: 'French-colonial charm with pastel streets, beachside cafes, and Auroville nearby.',
    moods: ['romantic', 'explore', 'workation'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,7000,'Medium','Pleasant'],[2,7200,'Medium','Pleasant'],[3,7500,'Medium','Hot'],
      [4,7000,'Low','Hot'],[5,6500,'Low','Hot'],[6,6000,'Low','Rainy'],
      [7,5500,'Low','Rainy'],[8,5800,'Low','Rainy'],[9,6000,'Low','Rainy'],
      [10,6500,'Medium','Rainy'],[11,7000,'Medium','Pleasant'],[12,8000,'High','Pleasant'],
    ]),
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=2076',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['spiritual', 'cultural'],
    description: 'The oldest living city — mesmerizing ghats, evening aarti, and deep spiritual energy.',
    moods: ['explore', 'reset'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,5500,'Medium','Cold'],[2,5800,'Medium','Pleasant'],[3,6000,'High','Pleasant'],
      [4,5500,'Medium','Hot'],[5,5000,'Low','Hot'],[6,4500,'Low','Rainy'],
      [7,4000,'Low','Rainy'],[8,4200,'Low','Rainy'],[9,4800,'Medium','Rainy'],
      [10,6000,'High','Pleasant'],[11,6500,'High','Pleasant'],[12,6000,'High','Cold'],
    ]),
  },
  {
    id: 'spiti-valley',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1974',
      'https://images.unsplash.com/photo-1585516482738-0b2a2e5d5f1f?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['adventure', 'offbeat'],
    description: 'Cold desert moonscape — ancient monasteries, stargazing, and extreme isolation.',
    moods: ['adventure', 'explore'],
    durationDays: 7,
    monthlyData: buildMonthly([
      [1,0,'Low','Cold'],[2,0,'Low','Cold'],[3,0,'Low','Cold'],
      [4,0,'Low','Cold'],[5,12000,'Low','Pleasant'],[6,14000,'Medium','Pleasant'],
      [7,15000,'High','Pleasant'],[8,14000,'Medium','Pleasant'],[9,13000,'Medium','Pleasant'],
      [10,12000,'Low','Cold'],[11,0,'Low','Cold'],[12,0,'Low','Cold'],
    ]),
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    heroImages: [
      'https://images.unsplash.com/photo-1590050751776-0cd1c0a12ce0?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?auto=format&fit=crop&q=80&w=2074',
    ],
    sentiment: ['cultural', 'offbeat'],
    description: 'UNESCO ruins scattered across boulder-strewn landscapes — a backpacker paradise.',
    moods: ['budget', 'explore'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,4500,'Medium','Pleasant'],[2,4800,'Medium','Pleasant'],[3,5000,'Medium','Hot'],
      [4,4500,'Low','Hot'],[5,4000,'Low','Hot'],[6,3500,'Low','Rainy'],
      [7,3500,'Low','Rainy'],[8,3500,'Low','Rainy'],[9,3800,'Low','Rainy'],
      [10,4500,'Medium','Pleasant'],[11,5000,'High','Pleasant'],[12,5500,'High','Pleasant'],
    ]),
  },
  {
    id: 'andaman',
    name: 'Andaman Islands',
    state: 'Andaman & Nicobar',
    heroImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'adventure'],
    description: 'Crystal-clear waters, coral reefs, and lush tropical forests far from the mainland.',
    moods: ['adventure', 'romantic'],
    durationDays: 5,
    monthlyData: buildMonthly([
      [1,18000,'High','Pleasant'],[2,17000,'Medium','Pleasant'],[3,16000,'Medium','Pleasant'],
      [4,15000,'Medium','Hot'],[5,13000,'Low','Rainy'],[6,11000,'Low','Rainy'],
      [7,11000,'Low','Rainy'],[8,11000,'Low','Rainy'],[9,12000,'Low','Rainy'],
      [10,14000,'Medium','Pleasant'],[11,16000,'High','Pleasant'],[12,19000,'High','Pleasant'],
    ]),
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1974',
      'https://images.unsplash.com/photo-1571401835393-8c5f35328320?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['adventure', 'nature'],
    description: 'Snow-capped peaks, river crossings, and the gateway to Rohtang and Solang.',
    moods: ['adventure', 'romantic'],
    durationDays: 4,
    monthlyData: buildMonthly([
      [1,8000,'Medium','Cold'],[2,8500,'Medium','Cold'],[3,8000,'Medium','Pleasant'],
      [4,7500,'Medium','Pleasant'],[5,9000,'High','Pleasant'],[6,8000,'High','Pleasant'],
      [7,6500,'Medium','Rainy'],[8,6500,'Medium','Rainy'],[9,7000,'Medium','Pleasant'],
      [10,8500,'High','Pleasant'],[11,7500,'Medium','Cold'],[12,9000,'High','Cold'],
    ]),
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    heroImages: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['cultural', 'romantic'],
    description: 'The Pink City — grand forts, bazaars, and a riot of color and history.',
    moods: ['explore', 'romantic'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,7500,'Medium','Pleasant'],[2,7800,'Medium','Pleasant'],[3,8000,'Medium','Hot'],
      [4,7500,'Low','Hot'],[5,7000,'Low','Hot'],[6,6500,'Low','Rainy'],
      [7,6000,'Low','Rainy'],[8,6200,'Low','Rainy'],[9,7000,'Medium','Pleasant'],
      [10,8000,'High','Pleasant'],[11,8500,'High','Pleasant'],[12,9000,'High','Pleasant'],
    ]),
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    heroImages: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&q=80&w=2074',
    ],
    sentiment: ['nature', 'urban'],
    description: 'Sun-soaked beaches, vibrant nightlife, Portuguese heritage, and seafood shacks.',
    moods: ['reset', 'budget', 'romantic'],
    durationDays: 4,
    monthlyData: buildMonthly([
      [1,9000,'High','Pleasant'],[2,8500,'High','Pleasant'],[3,7500,'Medium','Hot'],
      [4,6500,'Low','Hot'],[5,5500,'Low','Hot'],[6,4500,'Low','Rainy'],
      [7,4000,'Low','Rainy'],[8,4200,'Low','Rainy'],[9,5000,'Low','Rainy'],
      [10,6500,'Medium','Pleasant'],[11,8000,'High','Pleasant'],[12,10000,'High','Pleasant'],
    ]),
  },
  {
    id: 'coorg',
    name: 'Coorg',
    state: 'Karnataka',
    heroImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2074',
    ],
    sentiment: ['nature', 'wellness'],
    description: 'Coffee plantations, misty hills, and home-stays tucked into lush Western Ghats.',
    moods: ['reset', 'romantic', 'workation'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,7000,'Medium','Pleasant'],[2,7200,'Medium','Pleasant'],[3,7500,'Medium','Hot'],
      [4,7000,'Low','Hot'],[5,6500,'Low','Rainy'],[6,5500,'Low','Rainy'],
      [7,5000,'Low','Rainy'],[8,5200,'Low','Rainy'],[9,5500,'Low','Rainy'],
      [10,6500,'Medium','Pleasant'],[11,7000,'Medium','Pleasant'],[12,7500,'High','Pleasant'],
    ]),
  },
  {
    id: 'kasol',
    name: 'Kasol',
    state: 'Himachal Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'offbeat'],
    description: 'Mini Israel of India — riverside camping, Kheerganga trek, and backpacker culture.',
    moods: ['budget', 'adventure'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,4500,'Low','Cold'],[2,4800,'Low','Cold'],[3,5000,'Medium','Pleasant'],
      [4,5500,'Medium','Pleasant'],[5,6000,'High','Pleasant'],[6,5000,'Medium','Rainy'],
      [7,4000,'Low','Rainy'],[8,4200,'Low','Rainy'],[9,5000,'Medium','Pleasant'],
      [10,5500,'High','Pleasant'],[11,5000,'Medium','Cold'],[12,4500,'Low','Cold'],
    ]),
  },
  {
    id: 'alleppey',
    name: 'Alleppey',
    state: 'Kerala',
    heroImages: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=2069',
    ],
    sentiment: ['romantic', 'nature'],
    description: 'Houseboat cruises through palm-fringed backwaters — Kerala\'s most iconic experience.',
    moods: ['romantic', 'reset'],
    durationDays: 2,
    monthlyData: buildMonthly([
      [1,10000,'High','Pleasant'],[2,9500,'Medium','Pleasant'],[3,9000,'Medium','Hot'],
      [4,8000,'Low','Hot'],[5,7000,'Low','Rainy'],[6,6000,'Low','Rainy'],
      [7,6000,'Low','Rainy'],[8,6500,'Low','Rainy'],[9,7000,'Low','Rainy'],
      [10,8500,'Medium','Pleasant'],[11,9500,'High','Pleasant'],[12,11000,'High','Pleasant'],
    ]),
  },
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    heroImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2074',
    ],
    sentiment: ['nature', 'romantic'],
    description: 'Rolling tea gardens, misty peaks, and winding roads through the Western Ghats.',
    moods: ['romantic', 'reset'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,8000,'Medium','Pleasant'],[2,8200,'Medium','Pleasant'],[3,8500,'Medium','Hot'],
      [4,7500,'Low','Hot'],[5,7000,'Low','Rainy'],[6,6000,'Low','Rainy'],
      [7,5500,'Low','Rainy'],[8,5800,'Low','Rainy'],[9,6500,'Low','Pleasant'],
      [10,7500,'Medium','Pleasant'],[11,8000,'High','Pleasant'],[12,9000,'High','Pleasant'],
    ]),
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    heroImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'cultural'],
    description: 'Queen of the Hills — tea estates, toy train, and sunrise over Kanchenjunga.',
    moods: ['explore', 'romantic'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,7000,'Low','Cold'],[2,7200,'Low','Cold'],[3,7500,'Medium','Pleasant'],
      [4,8000,'Medium','Pleasant'],[5,8500,'High','Pleasant'],[6,7000,'Medium','Rainy'],
      [7,6000,'Low','Rainy'],[8,6200,'Low','Rainy'],[9,7000,'Medium','Pleasant'],
      [10,8000,'High','Pleasant'],[11,7500,'Medium','Cold'],[12,7000,'Low','Cold'],
    ]),
  },
  {
    id: 'leh-ladakh',
    name: 'Leh-Ladakh',
    state: 'Ladakh',
    heroImages: [
      'https://images.unsplash.com/photo-1585516482738-0b2a2e5d5f1f?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['adventure', 'offbeat'],
    description: 'High-altitude desert with pristine lakes, ancient monasteries, and epic road trips.',
    moods: ['adventure', 'explore'],
    durationDays: 7,
    monthlyData: buildMonthly([
      [1,0,'Low','Cold'],[2,0,'Low','Cold'],[3,0,'Low','Cold'],
      [4,0,'Low','Cold'],[5,15000,'Low','Pleasant'],[6,18000,'Medium','Pleasant'],
      [7,20000,'High','Pleasant'],[8,19000,'High','Pleasant'],[9,17000,'Medium','Pleasant'],
      [10,15000,'Low','Cold'],[11,0,'Low','Cold'],[12,0,'Low','Cold'],
    ]),
  },
  {
    id: 'ooty',
    name: 'Ooty',
    state: 'Tamil Nadu',
    heroImages: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'romantic'],
    description: 'Queen of the Nilgiris — botanical gardens, lake, and toy train through tea country.',
    moods: ['romantic', 'budget'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,6500,'Medium','Pleasant'],[2,6800,'Medium','Pleasant'],[3,7000,'Medium','Hot'],
      [4,7500,'High','Pleasant'],[5,8000,'High','Pleasant'],[6,6000,'Medium','Rainy'],
      [7,5500,'Low','Rainy'],[8,5500,'Low','Rainy'],[9,6000,'Low','Pleasant'],
      [10,7000,'Medium','Pleasant'],[11,7000,'Medium','Pleasant'],[12,7500,'High','Pleasant'],
    ]),
  },
  {
    id: 'pushkar',
    name: 'Pushkar',
    state: 'Rajasthan',
    heroImages: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['spiritual', 'cultural', 'offbeat'],
    description: 'Sacred lake town with Brahma temple, camel fair vibes, and rooftop cafes.',
    moods: ['budget', 'explore'],
    durationDays: 2,
    monthlyData: buildMonthly([
      [1,4000,'Medium','Pleasant'],[2,4200,'Medium','Pleasant'],[3,4500,'Medium','Hot'],
      [4,4000,'Low','Hot'],[5,3500,'Low','Hot'],[6,3000,'Low','Rainy'],
      [7,3000,'Low','Rainy'],[8,3200,'Low','Rainy'],[9,3500,'Low','Pleasant'],
      [10,4000,'Medium','Pleasant'],[11,5500,'High','Pleasant'],[12,5000,'High','Pleasant'],
    ]),
  },
  {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    heroImages: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2074',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['nature', 'offbeat'],
    description: 'Scotland of the East — living root bridges, waterfalls, and rolling green hills.',
    moods: ['explore', 'adventure'],
    durationDays: 4,
    monthlyData: buildMonthly([
      [1,8000,'Low','Cold'],[2,8200,'Low','Pleasant'],[3,8500,'Medium','Pleasant'],
      [4,9000,'Medium','Pleasant'],[5,8500,'Medium','Rainy'],[6,7500,'Medium','Rainy'],
      [7,7000,'Low','Rainy'],[8,7200,'Low','Rainy'],[9,7500,'Medium','Pleasant'],
      [10,8500,'High','Pleasant'],[11,8000,'Medium','Cold'],[12,8000,'Low','Cold'],
    ]),
  },
  {
    id: 'bir-billing',
    name: 'Bir Billing',
    state: 'Himachal Pradesh',
    heroImages: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
    ],
    sentiment: ['adventure', 'offbeat'],
    description: 'Paragliding capital of India — soar over Dhauladhar ranges and land in tea gardens.',
    moods: ['adventure', 'workation'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,5500,'Low','Cold'],[2,5800,'Low','Cold'],[3,6000,'Medium','Pleasant'],
      [4,6500,'Medium','Pleasant'],[5,7000,'High','Pleasant'],[6,5500,'Medium','Rainy'],
      [7,4500,'Low','Rainy'],[8,4800,'Low','Rainy'],[9,5500,'Medium','Pleasant'],
      [10,6500,'High','Pleasant'],[11,6000,'Medium','Cold'],[12,5500,'Low','Cold'],
    ]),
  },
  {
    id: 'kodaikanal',
    name: 'Kodaikanal',
    state: 'Tamil Nadu',
    heroImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2070',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2074',
    ],
    sentiment: ['nature', 'romantic'],
    description: 'Princess of Hill Stations — star-shaped lake, pine forests, and misty sunrise points.',
    moods: ['romantic', 'budget'],
    durationDays: 3,
    monthlyData: buildMonthly([
      [1,6000,'Medium','Pleasant'],[2,6200,'Medium','Pleasant'],[3,6500,'Medium','Hot'],
      [4,7000,'High','Pleasant'],[5,7500,'High','Pleasant'],[6,5500,'Medium','Rainy'],
      [7,5000,'Low','Rainy'],[8,5000,'Low','Rainy'],[9,5500,'Low','Pleasant'],
      [10,6500,'Medium','Pleasant'],[11,6500,'Medium','Pleasant'],[12,7000,'High','Pleasant'],
    ]),
  },
];

// ─── Month Labels ─────────────────────────────────────────────────────

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;
