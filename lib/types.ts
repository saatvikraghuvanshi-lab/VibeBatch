/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Trait {
  id: string;
  name: string;
  category: 'predefined' | 'custom' | 'sponsored';
  votes: number;
  voters: string[]; // User IDs who voted for this trait
  sponsoredBy?: string;
}

export interface Friend {
  id: string;
  displayName: string;
  avatar: string;
  friendshipDate: string; // ISO string
  hasVoted: boolean;
  messagesCount: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  contactNumber: string;
  avatar: string;
  isPremium: boolean;
  traits: Trait[];
  identityTitle?: string;
  friends: Friend[];
  totalVotes: number;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export const PREDEFINED_TRAITS: Partial<Trait>[] = [
  { name: 'Witty', category: 'predefined' },
  { name: 'Magnetic', category: 'predefined' },
  { name: 'Empathetic', category: 'predefined' },
  { name: 'Stoic', category: 'predefined' },
  { name: 'Ambitious', category: 'predefined' },
  { name: 'Grounded', category: 'predefined' },
  { name: 'Charismatic', category: 'predefined' },
  { name: 'Resourceful', category: 'predefined' },
  { name: 'Zen', category: 'predefined' },
  { name: 'Vibrant', category: 'predefined' },
  { name: 'Articulate', category: 'predefined' },
  { name: 'Fearless', category: 'predefined' },
  { name: 'Meticulous', category: 'predefined' },
  { name: 'Radiant', category: 'predefined' },
  { name: 'Analytical', category: 'predefined' },
  { name: 'Playful', category: 'predefined' },
  { name: 'Unyielding', category: 'predefined' },
  { name: 'Harmonious', category: 'predefined' },
];

export const SPONSORED_TRAITS: Partial<Trait>[] = [
  { name: 'Trendsetter', category: 'sponsored', sponsoredBy: 'Vogue' },
  { name: 'Hustler', category: 'sponsored', sponsoredBy: 'Forbes' },
];
