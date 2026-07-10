import type { PartyType, Interest, Pace, Dietary } from '../types/types';

export const PARTY_TYPES: { id: PartyType; label: string; icon: string }[] = [
  { id: 'single', label: 'Solo', icon: 'person' },
  { id: 'couple', label: 'Couple', icon: 'favorite' },
  { id: 'friends', label: 'Friends', icon: 'group' },
  { id: 'family', label: 'Family', icon: 'family_restroom' },
];

export const INTERESTS: { id: Interest; label: string }[] = [
  { id: 'food_cafes', label: 'Food and cafes' },
  { id: 'nature', label: 'Nature' },
  { id: 'history', label: 'History' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'shopping', label: 'Shopping' },
];

export const PACES: { id: Pace; label: string }[] = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'packed', label: 'Packed' },
];

export const DIETARY: { id: Dietary; label: string }[] = [
  { id: 'veg', label: 'Veg' },
  { id: 'non_veg', label: 'Non veg' },
  { id: 'both', label: 'Both' },
];
