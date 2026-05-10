/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, AuthState, PREDEFINED_TRAITS, SPONSORED_TRAITS, Trait } from '../lib/types';

const STORAGE_KEY = 'vibebatch_storage_v3';

const INITIAL_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const getStore = (): AuthState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : INITIAL_STATE;
};

export const saveStore = (state: AuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createMockUser = (data: Partial<UserProfile>): UserProfile => {
  const traits: Trait[] = [
    ...PREDEFINED_TRAITS.map((t: { name?: string; category?: string }, i: number) => ({
      id: `trait-${i}`,
      name: t.name!,
      category: t.category!,
      votes: 0,
      voters: [],
    })),
    ...SPONSORED_TRAITS.map((t: { name?: string; category?: string; sponsoredBy?: string }, i: number) => ({
      id: `sponsored-${i}`,
      name: t.name!,
      category: t.category!,
      sponsoredBy: t.sponsoredBy,
      votes: 0,
      voters: [],
    })),
  ] as Trait[];

  return {
    id: Math.random().toString(36).substr(2, 9),
    displayName: data.displayName || '',
    username: data.username || '',
    email: data.email || '',
    contactNumber: data.contactNumber || '',
    avatar: data.avatar || '',
    isPremium: false,
    identityTitle: "",
    traits: traits,
    friends: [],
    totalVotes: 0,
  };
};
