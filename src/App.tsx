/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Sparkles, 
  Hourglass, 
  BarChart3, 
  Settings, 
  Share2, 
  ChevronLeft,
  Camera,
  LogOut,
  Copy,
  Info,
  ExternalLink,
  Lock,
  EyeOff,
  UserPlus,
  MessageCircle,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Share,
  Menu,
  Mic,
  Plus,
  Crown,
} from 'lucide-react';
import { UserProfile, AuthState, Trait, Friend, PREDEFINED_TRAITS, ChatMessage } from '../lib/types';
import { getStore, saveStore } from '../lib/store';
import { generateIdentityTitle, generatePersonalityDescription } from '../lib/gemini';
import vbLogo from './assets/vb-logo.png';
import premiumBg01 from './assets/premium-backgrounds/premium-bg-01.jpeg';
import premiumBg02 from './assets/premium-backgrounds/premium-bg-02.jpeg';
import premiumBg03 from './assets/premium-backgrounds/premium-bg-03.jpeg';
import premiumBg04 from './assets/premium-backgrounds/premium-bg-04.jpeg';
import premiumBg05 from './assets/premium-backgrounds/premium-bg-05.jpeg';
import premiumBg06 from './assets/premium-backgrounds/premium-bg-06.jpeg';
import premiumBg07 from './assets/premium-backgrounds/premium-bg-07.jpeg';
import premiumBg08 from './assets/premium-backgrounds/premium-bg-08.jpeg';
import premiumBg09 from './assets/premium-backgrounds/premium-bg-09.jpeg';
import premiumBg10 from './assets/premium-backgrounds/premium-bg-10.jpeg';
import premiumBg11 from './assets/premium-backgrounds/premium-bg-11.jpeg';
import premiumBg12 from './assets/premium-backgrounds/premium-bg-12.jpeg';
import premiumBg13 from './assets/premium-backgrounds/premium-bg-13.jpeg';
import premiumBg14 from './assets/premium-backgrounds/premium-bg-14.jpeg';
import premiumBg15 from './assets/premium-backgrounds/premium-bg-15.jpeg';
import achievementBronze from './assets/banners/achievement-bronze.jpg';
import achievementSilver from './assets/banners/achievement-silver.jpg';
import achievementGold from './assets/banners/achievement-gold.jpg';
import achievementPlatinum from './assets/banners/achievement-platinum.jpg';
import achievementDiamond from './assets/banners/achievement-diamond.jpg';
import achievementMaster from './assets/banners/achievement-master.jpg';
import achievementLegend from './assets/banners/achievement-legend.jpg';
import achievementMythic from './assets/banners/achievement-mythic.jpg';
import achievementImmortal from './assets/banners/achievement-immortal.jpg';
import vibeBannerOne from './assets/banners/vibe-banner-1.jpg';
import vibeBannerTwo from './assets/banners/vibe-banner-2.jpg';

// --- Components ---

const Button = ({ 
  children, 
  className = "", 
  variant = "primary", 
  ...props 
}: any) => {
  const variants: any = {
    primary: "gradient-button w-full",
    secondary: "bg-surface text-white border border-white/10 py-4 px-6 rounded-lg hover:bg-white/5 transition-colors w-full flex items-center justify-center gap-2 font-bold",
    ghost: "text-white hover:bg-white/5 p-2 rounded-lg transition-colors",
    accent: "bg-accent/10 text-accent border border-accent/20 py-2 px-4 rounded-lg font-bold text-xs",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 py-4 px-6 rounded-lg hover:bg-red-500/20 transition-colors w-full font-bold",
  };
  
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "", id }: any) => (
  <div id={id} className={`card-surface p-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "accent", className = "" }: any) => {
  const colors: any = {
    accent: "metallic-badge",
    green: "metallic-badge",
    amber: "metallic-badge",
    pink: "metallic-badge",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

const FRIENDSHIP_LENGTH_OPTIONS = [
  { value: 'lt_1_month', label: 'Less than one month', eligible: false },
  { value: '1_3_months', label: '1-3 months', eligible: false },
  { value: '3_5_months', label: '3-5 months', eligible: false },
  { value: '6_12_months', label: '6-12 months', eligible: true },
  { value: 'over_1_year', label: 'More than one year', eligible: true },
];

const PREMIUM_EMAILS = new Set([
  'saatvikraghuvanshi123@gmail.com',
  'shivankarraghuwanshi2506@gmail.com',
]);

const PREMIUM_IDENTIFIERS = new Set([
  'saatvikraghuvanshi123',
  'saatv1k',
  'saatvik raghuvanshi',
  'shivankar',
  'shivvv',
  'shivankar raghuwanshi',
]);

const isPremiumEmail = (email?: string) => PREMIUM_EMAILS.has(String(email || '').trim().toLowerCase());
const normalizePremiumIdentifier = (value?: string) => String(value || '').trim().replace(/^@/, '').toLowerCase();
const isPremiumIdentifier = (value?: string) => PREMIUM_IDENTIFIERS.has(normalizePremiumIdentifier(value));
const isPremiumProfile = (profile: any) => Boolean(
  profile?.is_premium ||
  profile?.isPremium ||
  isPremiumEmail(profile?.email) ||
  isPremiumIdentifier(profile?.username) ||
  isPremiumIdentifier(profile?.display_name) ||
  isPremiumIdentifier(profile?.displayName)
);
const isPremiumUser = (user?: UserProfile | null) => Boolean(user && isPremiumProfile(user));
const PREMIUM_STORY_BACKGROUNDS = [
  premiumBg01,
  premiumBg02,
  premiumBg03,
  premiumBg04,
  premiumBg05,
  premiumBg06,
  premiumBg07,
  premiumBg08,
  premiumBg09,
  premiumBg10,
  premiumBg11,
  premiumBg12,
  premiumBg13,
  premiumBg14,
  premiumBg15,
];
const PREMIUM_BACKGROUND_KEY = 'vibebatch_last_premium_background';
const ACHIEVEMENT_BANNERS = [
  { name: 'Bronze', requirement: '10K votes', threshold: 10000, image: achievementBronze },
  { name: 'Silver', requirement: '50K votes', threshold: 50000, image: achievementSilver },
  { name: 'Gold', requirement: '100K votes', threshold: 100000, image: achievementGold },
  { name: 'Platinum', requirement: '250K votes', threshold: 250000, image: achievementPlatinum },
  { name: 'Diamond', requirement: '500K votes', threshold: 500000, image: achievementDiamond },
  { name: 'Master', requirement: '1M votes', threshold: 1000000, image: achievementMaster },
  { name: 'Legend', requirement: '5M votes', threshold: 5000000, image: achievementLegend },
  { name: 'Mythic', requirement: '10M votes', threshold: 10000000, image: achievementMythic },
  { name: 'Immortal', requirement: '500M+ votes', threshold: 500000000, image: achievementImmortal },
];
const VIBE_BANNERS = [
  { name: 'Vibe Banner I', image: vibeBannerOne },
  { name: 'Vibe Banner II', image: vibeBannerTwo },
];

const getNextPremiumBackground = () => {
  const lastIndex = Number(window.localStorage.getItem(PREMIUM_BACKGROUND_KEY) || '-1');
  const availableIndexes = PREMIUM_STORY_BACKGROUNDS
    .map((_, index) => index)
    .filter(index => index !== lastIndex);
  const nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)] ?? 0;
  window.localStorage.setItem(PREMIUM_BACKGROUND_KEY, String(nextIndex));
  return PREMIUM_STORY_BACKGROUNDS[nextIndex];
};

const isEligibleLength = (value?: string) => (
  FRIENDSHIP_LENGTH_OPTIONS.some(option => option.value === value && option.eligible)
);

const getFriendshipLengthLabel = (value?: string) => (
  FRIENDSHIP_LENGTH_OPTIONS.find(option => option.value === value)?.label || 'Choose duration'
);

const normalizeTraitName = (value: any) => String(value || '').trim().toLowerCase();
const getTraitVoteCount = (trait: Partial<Trait>) => Number(trait.votes || 0);
const getPositiveTraits = (traits: Trait[] = []) => (
  [...traits]
    .filter(trait => getTraitVoteCount(trait) > 0)
    .sort((a, b) => getTraitVoteCount(b) - getTraitVoteCount(a))
);
const getTraitVoteTotal = (traits: Trait[] = [], fallbackTotal = 0) => {
  const traitTotal = traits.reduce((sum, trait) => sum + getTraitVoteCount(trait), 0);
  return traitTotal > 0 ? traitTotal : Number(fallbackTotal || 0);
};

const parseChatMessage = (text: string) => {
  try {
    const parsed = JSON.parse(text);
    if (parsed?.type === 'voice' && typeof parsed.url === 'string') {
      return {
        type: 'voice',
        url: parsed.url,
        duration: Number(parsed.duration || 0),
      };
    }
  } catch {
    // Plain text messages are stored as raw strings.
  }

  return { type: 'text', text };
};

const getChatMessagePreview = (text: string) => {
  const parsed = parseChatMessage(text);
  return parsed.type === 'voice' ? 'Voice message' : (parsed.text || '').slice(0, 140);
};

const buildIdentityTitleFromTraits = (traits: Trait[] = []) => {
  const topTraits = getPositiveTraits(traits).slice(0, 3);
  if (topTraits.length === 0) return 'The Emerging Soul';

  const first = topTraits[0]?.name?.split(/\s+/)[0] || 'Vivid';
  const second = topTraits[1]?.name?.split(/\s+/).slice(-1)[0] || 'Presence';
  return `The ${first} ${second}`;
};

const mergeStableUserState = (freshUser: UserProfile, previousUser?: UserProfile | null): UserProfile => {
  if (!previousUser) return freshUser;

  const freshHasVotes = getPositiveTraits(freshUser.traits).length > 0;
  const previousHasVotes = getPositiveTraits(previousUser.traits).length > 0;
  const freshFriends = freshUser.friends.length > 0 || previousUser.friends.length === 0
    ? freshUser.friends
    : previousUser.friends;

  return {
    ...freshUser,
    friends: freshFriends,
    traits: freshHasVotes || !previousHasVotes ? freshUser.traits : previousUser.traits,
    totalVotes: getTraitVoteTotal(freshUser.traits, freshUser.totalVotes) || previousUser.totalVotes,
  };
};

const hasRecordedTraitVotes = (profile?: { traits?: Trait[]; totalVotes?: number } | null) => (
  getTraitVoteTotal(profile?.traits || [], profile?.totalVotes || 0) > 0
);
const hasConfirmedTraitVote = (link: any, profile?: { traits?: Trait[]; totalVotes?: number } | null) => (
  Boolean(link?.has_voted && hasRecordedTraitVotes(profile))
);
const getConfirmedVoteKey = (userId?: string, friendId?: string) => (
  userId && friendId ? `vibebatch_confirmed_trait_vote_${userId}_${friendId}` : ''
);
const hasLocalConfirmedVote = (userId?: string, friendId?: string) => {
  const key = getConfirmedVoteKey(userId, friendId);
  return Boolean(key && window.localStorage.getItem(key));
};
const markLocalConfirmedVote = (userId: string, friendId: string) => {
  window.localStorage.setItem(getConfirmedVoteKey(userId, friendId), new Date().toISOString());
};

const getCustomTraitsKey = (userId?: string) => (
  userId ? `vibebatch_custom_traits_${userId}` : ''
);
const getLocalCustomTraits = (userId?: string) => {
  const key = getCustomTraitsKey(userId);
  if (!key) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
};
const saveLocalCustomTraits = (userId: string, traits: string[]) => {
  window.localStorage.setItem(getCustomTraitsKey(userId), JSON.stringify(traits));
};
const getFriendSettingKey = (userId: string, friendId: string, setting: 'muted' | 'blocked') => (
  `vibebatch_friend_${setting}_${userId}_${friendId}`
);
const getLocalFriendSetting = (userId?: string, friendId?: string, setting: 'muted' | 'blocked' = 'muted') => (
  Boolean(userId && friendId && window.localStorage.getItem(getFriendSettingKey(userId, friendId, setting)))
);
const setLocalFriendSetting = (userId: string, friendId: string, setting: 'muted' | 'blocked', enabled: boolean) => {
  const key = getFriendSettingKey(userId, friendId, setting);
  if (enabled) window.localStorage.setItem(key, new Date().toISOString());
  else window.localStorage.removeItem(key);
};
const parseIdList = (value: any): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};
const getProfileCustomTraits = (profile: any) => {
  const raw = profile?.custom_traits || profile?.customTraits || [];
  const profileTraits = Array.isArray(raw)
    ? raw
    : String(raw || '').split(',').map(item => item.trim()).filter(Boolean);

  return [...new Set([...profileTraits, ...getLocalCustomTraits(profile?.id)])];
};

const mapSupabaseTraits = (rows: any[] = [], customTraitNames: string[] = []) => {
  const mapped = PREDEFINED_TRAITS.map(pt => {
    const traitName = pt.name || '';
    const match = rows.find((row: any) => (
      normalizeTraitName(row.trait_name) === normalizeTraitName(traitName) ||
      normalizeTraitName(row.name) === normalizeTraitName(traitName) ||
      normalizeTraitName(row.trait_id) === normalizeTraitName(traitName) ||
      normalizeTraitName(row.id) === normalizeTraitName(traitName)
    ));

    return {
      ...pt,
      id: pt.id || traitName,
      votes: match?.votes_count || match?.votes || 0,
    } as Trait;
  });

  rows.forEach((row: any) => {
    const rowName = row.trait_name || row.name || row.trait_id;
    if (!rowName || mapped.some(trait => normalizeTraitName(trait.name) === normalizeTraitName(rowName))) return;
    mapped.push({
      id: row.id || rowName,
      name: rowName,
      category: 'custom',
      votes: row.votes_count || row.votes || 0,
      voters: [],
    });
  });

  customTraitNames.forEach((traitName: string) => {
    if (!traitName || mapped.some(trait => normalizeTraitName(trait.name) === normalizeTraitName(traitName))) return;
    mapped.push({
      id: `custom-${normalizeTraitName(traitName)}`,
      name: traitName,
      category: 'custom',
      votes: 0,
      voters: [],
    });
  });

  return mapped;
};

const askFriendshipLength = (friendName: string) => {
  const menu = FRIENDSHIP_LENGTH_OPTIONS
    .map((option, index) => `${index + 1}. ${option.label}`)
    .join('\n');
  const answer = window.prompt(`How long have you known ${friendName} in real life?\n\n${menu}\n\nEnter 1-5:`);
  const index = Number(answer) - 1;
  return FRIENDSHIP_LENGTH_OPTIONS[index]?.value || null;
};

const mapProfileToFriend = (profile: any, link?: any, reverseLink?: any): Friend => {
  const relationshipLength = link?.relationship_length || '';
  const friendRelationshipLength = reverseLink?.relationship_length || '';
  const isVoteEligible = isEligibleLength(relationshipLength) && isEligibleLength(friendRelationshipLength);
  const traits = mapSupabaseTraits(profile.traits || [], getProfileCustomTraits(profile));
  const totalVotes = profile.total_votes || traits.reduce((sum, trait) => sum + (trait.votes || 0), 0);
  const voteRecord = { traits, totalVotes };
  const myId = link?.user_id;
  const friendId = profile.id;
  const blockedByMe = Boolean(
    getLocalFriendSetting(myId, friendId, 'blocked') ||
    parseIdList(link?.blocked_by).includes(myId)
  );
  const blockedMe = Boolean(
    getLocalFriendSetting(friendId, myId, 'blocked') ||
    parseIdList(reverseLink?.blocked_by).includes(friendId)
  );
  const isMuted = Boolean(
    getLocalFriendSetting(myId, friendId, 'muted') ||
    parseIdList(link?.muted_by).includes(myId)
  );

  return ({
  id: profile.id,
  username: profile.username,
  displayName: profile.display_name || profile.username || 'New friend',
  avatar: profile.avatar_url || '',
  friendshipDate: link?.created_at || new Date().toISOString(),
  hasVoted: hasConfirmedTraitVote(link, voteRecord) || hasLocalConfirmedVote(link?.user_id, profile.id),
  relationshipLength,
  friendRelationshipLength,
  isVoteEligible,
  traits,
  totalVotes,
  messagesCount: 0,
  status: 'offline',
  messages: [],
  isMuted,
  blockedByMe,
  blockedMe,
  });
};

const mapProfileToUser = (profile: any, friends: Friend[] = []): UserProfile => {
  const traits = mapSupabaseTraits(profile.traits || [], getProfileCustomTraits(profile));
  const totalVotes = profile.total_votes || traits.reduce((sum, trait) => sum + (trait.votes || 0), 0);

  return ({
    ...profile,
    displayName: profile.display_name || profile.displayName || profile.username || 'VibeBatch user',
    username: profile.username || '',
    email: profile.email || '',
    contactNumber: profile.contact_number || profile.contactNumber || '',
    avatar: profile.avatar_url || profile.avatar || '',
    isPremium: isPremiumProfile(profile),
    traits,
    identityTitle: profile.identity_title || profile.identityTitle,
    friends,
    totalVotes,
  });
};

// --- App Root ---

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(getStore());
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendDetails, setFriendDetails] = useState<Friend | null>(null);
  const [votingBackScreen, setVotingBackScreen] = useState('home');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteBackScreen, setInviteBackScreen] = useState('friends');
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false);
  const [signupAvatarFile, setSignupAvatarFile] = useState<File | null>(null);
  const [signupAvatarPreview, setSignupAvatarPreview] = useState('');

  useEffect(() => {
    saveStore(authState);
  }, [authState]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event !== 'PASSWORD_RECOVERY') return;

      const newPassword = window.prompt('Enter your new VibeBatch password');
      if (!newPassword) return;

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        alert(error.message || 'Failed to update password.');
        return;
      }

      alert('New password set. Please log in again.');
      await supabase.auth.signOut();
      setAuthState({ user: null, isAuthenticated: false });
      setCurrentScreen('login');
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (signupAvatarPreview) URL.revokeObjectURL(signupAvatarPreview);
    };
  }, [signupAvatarPreview]);

  const handleSignupAvatarChange = (file: File | null) => {
    if (signupAvatarPreview) URL.revokeObjectURL(signupAvatarPreview);
    setSignupAvatarFile(file);
    setSignupAvatarPreview(file ? URL.createObjectURL(file) : '');
  };

  const loadTraitsForProfileIds = async (profileIds: string[]) => {
    if (profileIds.length === 0) return new Map<string, any[]>();

    const candidateColumns = ['user_id', 'profile_id', 'target_user_id'];
    for (const column of candidateColumns) {
      const { data, error } = await supabase
        .from('traits')
        .select('*')
        .in(column, profileIds);

      if (!error && data) {
        return data.reduce((map: Map<string, any[]>, row: any) => {
          const ownerId = row[column];
          if (!ownerId) return map;
          map.set(ownerId, [...(map.get(ownerId) || []), row]);
          return map;
        }, new Map<string, any[]>());
      }
    }

    return new Map<string, any[]>();
  };

  const incrementTraitDirectly = async (targetUserId: string, traitName: string) => {
    const candidateOwnerColumns = ['user_id', 'profile_id', 'target_user_id'];
    const candidateVoteColumns = ['votes_count', 'votes'];
    const candidateTraitColumns = ['trait_name', 'name', 'trait_id'];

    for (const ownerColumn of candidateOwnerColumns) {
      for (const voteColumn of candidateVoteColumns) {
        for (const traitColumn of candidateTraitColumns) {
          const { data: existingRows, error: readError } = await supabase
            .from('traits')
            .select('*')
            .eq(ownerColumn, targetUserId)
            .eq(traitColumn, traitName)
            .limit(1);

          if (readError) continue;

          const existing = existingRows?.[0];
          if (existing?.id) {
            const { error: updateError } = await supabase
              .from('traits')
              .update({ [voteColumn]: Number(existing[voteColumn] || 0) + 1 })
              .eq('id', existing.id);

            if (!updateError) return;
            continue;
          }

          const { error: insertError } = await supabase
            .from('traits')
            .insert([{
              [ownerColumn]: targetUserId,
              [traitColumn]: traitName,
              [voteColumn]: 1,
            }]);

          if (!insertError) return;
        }
      }
    }

    throw new Error('Trait vote could not be recorded. Please try again.');
  };

  const submitTraitVotes = async (targetUserId: string, traitNames: string[]) => {
    const uniqueTraitNames = [...new Set(traitNames)];
    const beforeRows = (await loadTraitsForProfileIds([targetUserId])).get(targetUserId) || [];
    const beforeVoteTotal = getTraitVoteTotal(mapSupabaseTraits(beforeRows));

    const rpcResults = await Promise.all(uniqueTraitNames.map(traitName =>
      supabase.rpc('increment_trait_vote', {
        target_user_id: targetUserId,
        trait_name: traitName,
      })
    ));

    const failedTraitWrites = rpcResults
      .map((result, index) => ({ traitName: uniqueTraitNames[index], error: result.error }))
      .filter(result => result.error);

    if (failedTraitWrites.length > 0) {
      console.warn('Trait vote RPC failed, trying direct trait write:', failedTraitWrites.map(result => result.error));
      try {
        await Promise.all(failedTraitWrites.map(result => incrementTraitDirectly(targetUserId, result.traitName)));
      } catch (fallbackError) {
        console.error('Direct trait write failed:', fallbackError);
        throw new Error(
          failedTraitWrites.map((result: any) => result.error?.message).filter(Boolean).join('\n') ||
          'Trait vote could not be recorded.'
        );
      }
    }

    const afterRows = (await loadTraitsForProfileIds([targetUserId])).get(targetUserId) || [];
    const afterVoteTotal = getTraitVoteTotal(mapSupabaseTraits(afterRows));
    if (afterVoteTotal <= beforeVoteTotal) {
      throw new Error('Trait vote could not be confirmed. Please try again.');
    }
  };

  const refreshFriends = async (userId: string) => {
    const { data: links, error: linksError } = await supabase
      .from('friendships')
      .select('user_id, friend_id, relationship_length, has_voted, created_at')
      .eq('user_id', userId);

    if (linksError) throw linksError;

    const friendIds = (links || []).map((link: any) => link.friend_id);
    if (friendIds.length === 0) return [];

    const { data: reverseLinks, error: reverseLinksError } = await supabase
      .from('friendships')
      .select('user_id, friend_id, relationship_length')
      .in('user_id', friendIds)
      .eq('friend_id', userId);

    if (reverseLinksError) throw reverseLinksError;

    let moderationLinks: any[] = [];
    try {
      const { data } = await supabase
        .from('friendships')
        .select('user_id, friend_id, muted_by, blocked_by')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      moderationLinks = data || [];
    } catch (error) {
      moderationLinks = [];
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*, traits(*)')
      .in('id', friendIds);

    if (profilesError) throw profilesError;
    const explicitTraits = await loadTraitsForProfileIds(friendIds);

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.warn('Could not load messages yet:', messagesError.message);
    }

    return (profiles || []).map((profile: any) => {
      const profileWithTraits = {
        ...profile,
        traits: profile.traits?.length ? profile.traits : (explicitTraits.get(profile.id) || []),
      };
      const link = {
        ...(links?.find((item: any) => item.friend_id === profile.id) || {}),
        ...(moderationLinks.find((item: any) => item.user_id === userId && item.friend_id === profile.id) || {}),
      };
      const reverseLink = {
        ...(reverseLinks?.find((item: any) => item.user_id === profile.id) || {}),
        ...(moderationLinks.find((item: any) => item.user_id === profile.id && item.friend_id === userId) || {}),
      };
      const friend = mapProfileToFriend(profileWithTraits, link, reverseLink);
      const friendMessages = (messages || [])
        .filter((message: any) => (
          (message.sender_id === userId && message.receiver_id === profile.id) ||
          (message.sender_id === profile.id && message.receiver_id === userId)
        ))
        .map((message: any) => ({
          id: message.id,
          senderId: message.sender_id === userId ? 'me' : profile.id,
          text: message.content,
          timestamp: message.created_at,
          isRead: message.sender_id === userId || Boolean(message.is_read),
        }));

      return {
        ...friend,
        messages: friendMessages,
        messagesCount: friend.isMuted ? 0 : friendMessages.filter((message: ChatMessage) => !message.isRead && message.senderId !== 'me').length,
      };
    });
  };

  const acceptInvite = async (inviterId: string, currentUserId: string, currentLength?: string | null, inviterLength?: string | null) => {
    if (!inviterId || inviterId === currentUserId) return;

    const rows = [
      { user_id: currentUserId, friend_id: inviterId, relationship_length: currentLength || null },
      { user_id: inviterId, friend_id: currentUserId, relationship_length: inviterLength || null },
    ];

    const { error } = await supabase
      .from('friendships')
      .upsert(rows, { onConflict: 'user_id,friend_id' });

    if (error) throw error;
    window.localStorage.removeItem('vibebatch_pending_invite');
    window.localStorage.removeItem('vibebatch_pending_invite_length');
  };

  const applyPendingInvite = async (userId: string) => {
    const pendingInvite = window.localStorage.getItem('vibebatch_pending_invite');
    if (!pendingInvite) return;

    try {
      const inviterLength = window.localStorage.getItem('vibebatch_pending_invite_length');
      const currentLength = askFriendshipLength('this friend');
      if (!currentLength) {
        window.localStorage.removeItem('vibebatch_pending_invite');
        window.localStorage.removeItem('vibebatch_pending_invite_length');
        return;
      }
      await acceptInvite(pendingInvite, userId, currentLength, inviterLength);
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  const buildInviteLink = (relationshipLength?: string) => {
    if (!authState.user) return '';
    const params = new URLSearchParams({ invite: authState.user.id });
    if (relationshipLength) params.set('known', relationshipLength);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const createInviteLink = () => {
    const relationshipLength = askFriendshipLength('the person receiving this link');
    if (!relationshipLength) return '';

    const link = buildInviteLink(relationshipLength);
    return link;
  };

  const copyInviteLink = async () => {
    const link = inviteLink || createInviteLink();
    if (!link) return;

    await navigator.clipboard.writeText(link);
    setInviteLink(link);
    alert('Friend invite link copied. Send it to someone you want to add.');
  };

  const openInviteScreen = (backScreen = 'friends') => {
    const link = inviteLink || createInviteLink();
    if (!link) return;

    setInviteLink(link);
    setInviteBackScreen(backScreen);
    setCurrentScreen('invite');
  };

  const openFriendDetails = async (friend: Friend) => {
    setFriendDetails(friend);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, traits(*)')
        .eq('id', friend.id)
        .single();

      if (error || !profile) return;
      const explicitTraits = await loadTraitsForProfileIds([friend.id]);
      const traits = profile.traits?.length ? profile.traits : (explicitTraits.get(friend.id) || []);

      setFriendDetails({
        ...friend,
        username: profile.username || friend.username,
        displayName: profile.display_name || friend.displayName,
        avatar: profile.avatar_url || friend.avatar,
        traits: mapSupabaseTraits(traits, getProfileCustomTraits(profile)),
      });
    } catch (error) {
      console.warn('Could not refresh friend details:', error);
    }
  };

  const openVotingScreen = (friend: Friend, backScreen: string) => {
    setSelectedFriend(friend);
    setVotingBackScreen(backScreen);
    setCurrentScreen('voting');
  };

  const loadCurrentUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, traits(*)')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return null;

    const explicitTraits = await loadTraitsForProfileIds([userId]);
    const friends = await refreshFriends(userId);
    const { data: authData } = await supabase.auth.getUser();
    return mapProfileToUser({
      ...profile,
      email: authData.user?.email || profile.email,
      isPremium: profile.is_premium || isPremiumEmail(authData.user?.email) || isPremiumProfile(profile),
      traits: profile.traits?.length ? profile.traits : (explicitTraits.get(userId) || []),
    }, friends);
  };

  const refreshCurrentUserProfile = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) return;

    try {
      const user = await loadCurrentUserProfile(userId);
      if (!user) return;

      setAuthState(prev => ({
        ...prev,
        user: prev.user?.id === userId ? mergeStableUserState(user, prev.user) : prev.user,
      }));
    } catch (error) {
      console.warn('Could not refresh current profile:', error);
    }
  }, [authState.user?.id]);

  const fetchUserProfile = async (username: string) => {
    setLoading(true);
    const cleanUsername = username.toLowerCase().replace('@', '');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*, traits(*)')
      .eq('username', cleanUsername)
      .single();

    if (data) {
      const explicitTraits = await loadTraitsForProfileIds([data.id]);
      const traits = data.traits?.length ? data.traits : (explicitTraits.get(data.id) || []);
      const mappedTraits = mapSupabaseTraits(traits || []);
      const totalVotes = data.total_votes || mappedTraits.reduce((sum, trait) => sum + (trait.votes || 0), 0);

      setSelectedFriend({ 
        ...data, 
        displayName: data.display_name, 
        avatar: data.avatar_url, 
        traits: mappedTraits,
        totalVotes,
        friends: [] 
      } as any);
      
      setCurrentScreen('public-profile');
    } else {
      alert("No vibe found for that username.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get('u');
    if (u) fetchUserProfile(u);
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;

      if (user) {
        const { data: existingProfile, error: pError } = await supabase
          .from('profiles')
          .select('*, traits(*)')
          .eq('id', user.id)
          .maybeSingle();
        
        if (pError) throw pError;

        let profile = existingProfile;

        if (!profile) {
          const fallbackUsername = user.user_metadata?.username || email.split('@')[0].toLowerCase();
          const fallbackDisplayName = user.user_metadata?.display_name || fallbackUsername;
          const fallbackAvatarUrl =
            user.user_metadata?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackUsername}`;

          const { data: createdProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: fallbackUsername,
                display_name: fallbackDisplayName,
                avatar_url: fallbackAvatarUrl,
              },
            ])
            .select('*, traits(*)')
            .single();

          if (createProfileError) throw createProfileError;
          profile = createdProfile;
        }

        const friends = await refreshFriends(user.id);

        setAuthState({
          user: mapProfileToUser({
            ...profile,
            email: user.email,
            isPremium: profile.is_premium || isPremiumEmail(user.email) || isPremiumProfile(profile),
          }, friends),
          isAuthenticated: true
        });
        setCurrentScreen('home');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = (formData.get('username') as string).toLowerCase().replace('@', '');
    const displayName = formData.get('displayName') as string;
    const contactNumber = String(formData.get('contact') || '').trim();

    try {
      const { data: usernameMatch, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (usernameError) throw usernameError;
      if (usernameMatch) {
        alert('That username is already taken. Try another one.');
        return;
      }

      let avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

      if (signupAvatarFile) {
        const fileExt = signupAvatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `pending/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, signupAvatarFile, {
            cacheControl: '3600',
            contentType: signupAvatarFile.type || 'image/jpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            contact_number: contactNumber || null,
            avatar_url: avatarUrl,
            invited_by: window.localStorage.getItem('vibebatch_pending_invite'),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        alert("Success! Check your email to verify, then log in.");
        handleSignupAvatarChange(null);
        setIsLoginView(true);
      }
    } catch (err: any) {
      const message = String(err.message || '');
      if (message.toLowerCase().includes('database error saving new user')) {
        alert('Signup could not finish because the account profile could not be saved. Try a different username, or log in if this email was already used.');
      } else {
        alert(message || 'Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (name: string) => {
    if (!authState.user) return;
    const cleanUsername = name.toLowerCase().replace('@', '').trim();
    if (!cleanUsername) return;

    setLoading(true);
    try {
      const existingFriend = authState.user.friends.find(friend => (
        friend.username?.toLowerCase() === cleanUsername ||
        friend.displayName.toLowerCase() === cleanUsername
      ));

      if (existingFriend) {
        setFriendDetails(existingFriend);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, traits(*)')
        .or(`username.eq.${cleanUsername},display_name.ilike.${cleanUsername}`)
        .maybeSingle();

      if (error || !profile) {
        alert('No VibeBatch user found with that username.');
        return;
      }

      if (profile.id === authState.user.id) {
        alert('That is your own profile.');
        return;
      }

      const relationshipLength = askFriendshipLength(profile.display_name || profile.username);
      if (!relationshipLength) return;

      const { error: friendshipError } = await supabase
          .from('friendships')
          .upsert([
            { user_id: authState.user.id, friend_id: profile.id, relationship_length: relationshipLength },
            { user_id: profile.id, friend_id: authState.user.id, relationship_length: null },
          ], { onConflict: 'user_id,friend_id' });

      if (friendshipError) throw friendshipError;

      const friends = await refreshFriends(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, friends } : null,
      }));
      alert(`${profile.display_name || profile.username} is now your friend. They still need to set how long they have known you before voting can unlock.`);
    } catch (err: any) {
      alert(err.message || 'Failed to add friend.');
    } finally {
      setLoading(false);
    }
  };

  const updateFriendshipLength = async (friend: Friend) => {
    if (!authState.user) return;

    const relationshipLength = askFriendshipLength(friend.displayName);
    if (!relationshipLength) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('friendships')
        .upsert([
          {
            user_id: authState.user.id,
            friend_id: friend.id,
            relationship_length: relationshipLength,
          },
        ], { onConflict: 'user_id,friend_id' });

      if (error) throw error;

      const friends = await refreshFriends(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, friends } : null,
      }));
      alert(`${getFriendshipLengthLabel(relationshipLength)} saved. Voting unlocks only after ${friend.displayName} also chooses 6-12 months or more than one year.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update friendship duration.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePhoto = async (file: File) => {
    if (!authState.user) return;
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${authState.user.id}/profile-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', authState.user.id);

      if (updateError) throw updateError;

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, avatar: avatarUrl, avatar_url: avatarUrl } as any : null,
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to update profile photo.');
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async () => {
    if (!authState.user) return;
    const displayName = window.prompt('Enter your new display name', authState.user.displayName);
    if (!displayName?.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', authState.user.id);

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, displayName: displayName.trim(), display_name: displayName.trim() } as any : null,
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to update display name.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!authState.user) return;
    const confirmed = window.confirm('Delete your VibeBatch account data? This removes your profile, friendships, and local session.');
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_current_user');
      if (error) throw error;
      await supabase.auth.signOut();
      logout();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  const updateFriendModeration = async (friendId: string, setting: 'muted' | 'blocked', enabled: boolean) => {
    if (!authState.user) return;

    const column = setting === 'muted' ? 'muted_by' : 'blocked_by';
    setLocalFriendSetting(authState.user.id, friendId, setting, enabled);

    try {
      const { data } = await supabase
        .from('friendships')
        .select(column)
        .eq('user_id', authState.user.id)
        .eq('friend_id', friendId)
        .maybeSingle();
      const moderationRow = data as Record<string, unknown> | null;
      const ids = new Set(parseIdList(moderationRow?.[column]));
      if (enabled) ids.add(authState.user.id);
      else ids.delete(authState.user.id);

      await supabase
        .from('friendships')
        .update({ [column]: [...ids] })
        .eq('user_id', authState.user.id)
        .eq('friend_id', friendId);
    } catch (error) {
      console.warn(`Friend ${setting} is using local fallback:`, error);
    }

    const friends = authState.user.friends.map(friend => (
      friend.id === friendId
        ? {
            ...friend,
            isMuted: setting === 'muted' ? enabled : friend.isMuted,
            blockedByMe: setting === 'blocked' ? enabled : friend.blockedByMe,
          }
        : friend
    ));

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, friends } : null,
    }));
    setSelectedFriend(prev => (
      prev?.id === friendId
        ? {
            ...prev,
            isMuted: setting === 'muted' ? enabled : prev.isMuted,
            blockedByMe: setting === 'blocked' ? enabled : prev.blockedByMe,
          }
        : prev
    ));
  };

  const sendMessage = async (friendId: string, text: string) => {
    if (!authState.user) return;
    const friend = authState.user.friends.find(item => item.id === friendId) || selectedFriend;
    if (friend?.blockedByMe || friend?.blockedMe || getLocalFriendSetting(authState.user.id, friendId, 'blocked')) {
      alert('Messages are blocked for this friend.');
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const senderId = authData.user?.id;
    if (authError || !senderId) {
      alert('Please log in again before sending messages.');
      return;
    }
    
    const { data: insertedMessage, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: friendId,
        content: text
      }])
      .select('id, content, created_at')
      .single();

    if (error) {
      console.error("Message failed:", error);
      alert(error.message || 'Message failed to send.');
      return;
    }

    supabase.functions.invoke('send-message-email', {
      body: {
        receiverId: friendId,
        senderName: authState.user.displayName,
        preview: getChatMessagePreview(text),
      },
    }).catch((notifyError) => {
      console.warn('Email notification function is not configured yet:', notifyError.message);
    });

    const newMessage: ChatMessage = {
      id: insertedMessage.id,
      senderId: 'me',
      text: insertedMessage.content,
      timestamp: insertedMessage.created_at,
      isRead: true
    };
    
    const updatedFriends = authState.user.friends.map(f => {
      if (f.id === friendId) {
        return {
          ...f,
          messages: [...(f.messages || []), newMessage],
        };
      }
      return f;
    });
    
    setAuthState({
      ...authState,
      user: { ...authState.user, friends: updatedFriends }
    });
    setSelectedFriend(prev => (
      prev?.id === friendId
        ? { ...prev, messages: [...(prev.messages || []), newMessage] }
        : prev
    ));
  };

  const uploadVoiceMessage = async (friendId: string, blob: Blob, duration: number) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const senderId = authData.user?.id;
    if (authError || !senderId) {
      throw new Error('Please log in again before sending voice messages.');
    }

    const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
    const filePath = `${senderId}/voice/${friendId}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        cacheControl: '3600',
        contentType: blob.type || 'audio/webm',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await sendMessage(friendId, JSON.stringify({
      type: 'voice',
      url: data.publicUrl,
      duration,
    }));
  };

  const openChatWithFriend = async (friend: Friend) => {
    setSelectedFriend({ ...friend, messagesCount: 0 });
    setCurrentScreen('chat');

    if (!authState.user) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', friend.id)
      .eq('receiver_id', authState.user.id);

    const friends = await refreshFriends(authState.user.id);
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, friends } : null,
    }));
  };
  const logout = () => {
    supabase.auth.signOut();
    setAuthState({ user: null, isAuthenticated: false });
    setCurrentScreen('login');
    setIsProfileSheetOpen(false);
  };

  const resetPassword = async (emailOverride?: string) => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();

      if (authState.isAuthenticated && authData.user) {
        const newPassword = window.prompt('Enter your new VibeBatch password');
        if (!newPassword) return;

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        alert('New password set. Please log in again.');
        await supabase.auth.signOut();
        setAuthState({ user: null, isAuthenticated: false });
        setCurrentScreen('login');
        setIsProfileSheetOpen(false);
        return;
      }

      const email = String(emailOverride || window.prompt('Enter your account email') || '').trim();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address before resetting your password.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;

      alert('Password reset link sent. Open it, set a new password, then log in again.');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const updateIdentity = async () => {
    if (!authState.user) return;
    setLoading(true);
    try {
      const freshUser = await loadCurrentUserProfile(authState.user.id);
      const traits = freshUser?.traits || authState.user.traits;
      const votedTraits = getPositiveTraits(traits);
      if (votedTraits.length === 0) {
        alert('You need at least one voted trait before generating an identity title.');
        return;
      }

      const titleTraits = votedTraits.slice(0, 3);
      const generatedTitle = await generateIdentityTitle(titleTraits);
      const title = generatedTitle === 'The Magnetic Storyteller'
        ? buildIdentityTitleFromTraits(traits)
        : generatedTitle;

      const { error } = await supabase
        .from('profiles')
        .update({ identity_title: title })
        .eq('id', authState.user.id);

      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...(freshUser || prev.user), identityTitle: title } : null
      }));
      alert(`Identity title updated: ${title}`);
    } catch (error) {
      console.error("Failed to generate title", error);
      alert('Failed to regenerate identity title.');
    } finally {
      setLoading(false);
    }
  };

  const manageCustomTraits = async () => {
    if (!authState.user) return;
    const customTraits = (authState.user.traits || [])
      .filter(trait => trait.category === 'custom')
      .map(trait => trait.name);
    const traitName = window.prompt(
      `Add a custom trait for your profile.${customTraits.length ? `\n\nCurrent custom traits:\n${customTraits.join('\n')}` : ''}\n\nEnter a new trait name:`
    );

    const cleanName = traitName?.trim();
    if (!cleanName) return;

    setLoading(true);
    try {
      const existingCustomTraits = getProfileCustomTraits(authState.user);
      const nextCustomTraits = [
        ...existingCustomTraits.filter(name => normalizeTraitName(name) !== normalizeTraitName(cleanName)),
        cleanName,
      ];

      saveLocalCustomTraits(authState.user.id, nextCustomTraits);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ custom_traits: nextCustomTraits })
        .eq('id', authState.user.id);

      if (profileError && !profileError.message.toLowerCase().includes('custom_traits')) {
        throw profileError;
      }

      const freshUser = await loadCurrentUserProfile(authState.user.id);
      const fallbackTraits = mapSupabaseTraits(freshUser?.traits || authState.user.traits, nextCustomTraits);
      setAuthState(prev => ({
        ...prev,
        user: prev.user
          ? mergeStableUserState(
              freshUser ? { ...freshUser, traits: fallbackTraits, custom_traits: nextCustomTraits } as any : { ...prev.user, traits: fallbackTraits, custom_traits: nextCustomTraits } as any,
              prev.user
            )
          : null,
      }));
      alert('Custom trait added.');
    } catch (err: any) {
      alert(err.message || 'Failed to save custom trait.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate identity title when user reaches 3 traits milestone
  useEffect(() => {
    if (authState.user && !authState.user.identityTitle && authState.user.traits.filter(t => t.votes > 0).length >= 3) {
      updateIdentity();
    }
  }, [authState.user?.traits]);

  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user?.id) return;

    refreshCurrentUserProfile();
    const interval = window.setInterval(refreshCurrentUserProfile, 15000);
    window.addEventListener('focus', refreshCurrentUserProfile);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshCurrentUserProfile);
    };
  }, [authState.isAuthenticated, authState.user?.id, refreshCurrentUserProfile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (!invite) return;

    window.localStorage.setItem('vibebatch_pending_invite', invite);
    const known = params.get('known');
    if (known) window.localStorage.setItem('vibebatch_pending_invite_length', known);

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);

    if (authState.user) {
      applyPendingInvite(authState.user.id).then(async () => {
        const friends = await refreshFriends(authState.user!.id);
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, friends } : null,
        }));
      });
    } else {
      setIsLoginView(false);
      setCurrentScreen('login');
    }
  }, [authState.user?.id]);

  // --- Screen Components ---

  const AuthScreen = ({ onLogin, onSignup, onResetPassword, isLoginView, setIsLoginView, loading, avatarPreview, onAvatarChange }: any) => (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center gap-8 py-12">
        <div className="text-center space-y-3">
          <img
            src={vbLogo}
            alt="VibeBatch logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto rounded-2xl shadow-2xl shadow-accent/10"
          />
          <h1 className="text-5xl font-display font-bold text-gradient tracking-tight">VibeBatch</h1>
          <p className="text-white/60 font-medium tracking-wide">Your Persona through a digital lens.</p>
        </div>

        {isLoginView ? (
          <form className="space-y-4" onSubmit={onLogin}>
            <div className="space-y-4">
              <input name="email" type="email" placeholder="Email" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input name="password" type="password" placeholder="Password" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={(event) => {
                  const form = event.currentTarget.closest('form');
                  const email = form ? String(new FormData(form).get('email') || '') : '';
                  onResetPassword(email);
                }}
                className="text-accent text-sm font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in →"}
            </Button>
            <div className="text-center pt-4">
              <button 
                type="button" 
                onClick={() => setIsLoginView(false)}
                className="text-white/60 text-sm hover:text-white transition-colors"
              >
                Don't have an account? <span className="text-accent">Sign up</span>
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onSignup}>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="w-24 h-24 rounded-full bg-surface border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent/50 transition-colors overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile preview" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-white/40" />
                    <span className="text-[10px] text-white/40 uppercase font-bold">Upload</span>
                  </>
                )}
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="space-y-4">
              <input name="displayName" type="text" placeholder="Display Name" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input name="username" type="text" placeholder="Username" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input name="email" type="email" placeholder="Email" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input name="password" type="password" placeholder="Password" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input name="contact" type="tel" placeholder="Contact Number (optional)" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up →"}
            </Button>
            <div className="text-center pt-4">
              <button 
                type="button" 
                onClick={() => setIsLoginView(true)}
                className="text-white/60 text-sm hover:text-white transition-colors"
              >
                Already have an account? <span className="text-accent">Log in</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const HomeScreen = () => {
    const user = authState.user;
    if (!user) return null;

    const votedTraits = getPositiveTraits(user.traits);
    const topTraits = votedTraits.slice(0, 3);
    const effectiveTotalVotes = getTraitVoteTotal(user.traits, user.totalVotes);
    const eligibleFriends = user.friends.filter(f => f.isVoteEligible && !f.hasVoted);
    const votedFriends = user.friends.filter(f => f.hasVoted);
    const lockedFriends = user.friends.filter(f => !f.isVoteEligible);

    return (
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col px-4 py-4 pb-28 lg:p-6 bg-background overflow-x-hidden">
        {/* Header - Desktop & Mobile */}
        <header className="flex justify-between items-start xl:items-center mb-5 lg:mb-8 max-w-7xl mx-auto w-full min-w-0 gap-4">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-[2.35rem] sm:text-5xl lg:text-4xl font-display font-extrabold text-gradient leading-none truncate">VibeBatch</h1>
            <p className="mt-2 max-w-[260px] sm:max-w-none text-[10px] sm:text-[11px] lg:text-xs text-accent font-bold tracking-[0.16em] uppercase leading-relaxed">Your Persona through a Digital Lens.</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div 
              className="shimmer-ring w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer overflow-hidden flex items-center justify-center"
              onClick={() => setIsProfileSheetOpen(true)}
            >
               <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" /> : <Sparkles className="text-accent/40" size={20} />}
               </div>
            </div>
            <button
              onClick={() => setCurrentScreen('mobile-menu')}
              className="xl:hidden w-11 h-11 sm:w-12 sm:h-12 rounded-full metallic-panel text-white/80 hover:text-accent hover:border-accent/40 transition-colors flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            
            <div className="desktop-nav-pill hidden xl:flex nav-pill">
              <NavItem icon={<Users size={20} />} active={currentScreen === 'friends'} onClick={() => setCurrentScreen('friends')} />
              <div className="w-px h-6 bg-white/10 mx-1" />
              <NavItem icon={<Sparkles size={20} />} active={currentScreen === 'traits'} onClick={() => setCurrentScreen('traits')} />
              <NavItem icon={<Hourglass size={20} />} active={currentScreen === 'hourglass'} onClick={() => setCurrentScreen('hourglass')} />
              <NavItem icon={<BarChart3 size={20} />} active={currentScreen === 'tracker'} onClick={() => setCurrentScreen('tracker')} />
              <NavItem icon={<Sparkles size={20} />} active={currentScreen === 'banners'} onClick={() => setCurrentScreen('banners')} />
              <NavItem icon={<Crown size={20} />} active={currentScreen === 'premium'} onClick={() => setCurrentScreen('premium')} />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 max-w-7xl mx-auto w-full min-w-0 grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-6 lg:overflow-hidden min-h-0">
          
          {/* Left Sidebar - Profile Summary */}
          <section className="hidden lg:flex card-surface p-6 flex-col items-center overflow-y-auto">
            <div className="relative mb-6">
              <div className="shimmer-ring w-32 h-32 rounded-full overflow-hidden flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-surface">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <Sparkles className="text-accent/30" size={48} />}
                </div>
              </div>
              {user.identityTitle ? (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                   <div className="px-5 py-2 text-[10px] whitespace-nowrap gradient-button text-white font-black rounded-full uppercase tracking-wider">
                     {user.identityTitle}
                   </div>
                </div>
              ) : (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                   <div className="px-4 py-2 text-[8px] whitespace-nowrap bg-surface text-white/40 font-bold rounded-full border border-white/10 uppercase tracking-tight">
                     Vote on 3+ traits to unlock your title
                   </div>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold font-display mt-2 mb-1">{user.displayName}</h2>
            <p className="text-accent text-sm font-medium mb-6">@{user.username}</p>

            <div className="grid grid-cols-2 gap-3 w-full mb-8">
              <StatItem label="Friends" value={user.friends.length} />
              <StatItem label="Eligible" value={eligibleFriends.length} />
              <StatItem label="Voted" value={votedFriends.length} />
              <StatItem label="Locked" value={lockedFriends.length} />
            </div>

            <div className="mt-auto w-full pt-6 space-y-3">
               <Button onClick={() => openInviteScreen('home')} variant="primary">Share Profile →</Button>
               <Button onClick={() => setCurrentScreen('storycard')} variant="secondary">View Story Card</Button>
            </div>
          </section>

          {/* Center Column - Main Dashboard Feed */}
          <section className="flex flex-col gap-5 lg:gap-6 lg:overflow-y-auto lg:pr-1 min-w-0">
            <div className="lg:hidden flex flex-col items-center pt-1 pb-3">
                <div className="flex flex-col items-center gap-3 w-full">
                  {user.avatar ? (
                    <span className="shimmer-ring block w-24 h-24 rounded-full overflow-hidden">
                      <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    </span>
                  ) : (
                    <div className="metallic-orb w-24 h-24 rounded-full flex items-center justify-center text-white">
                      <Sparkles size={32} />
                    </div>
                  )}
                  {user.identityTitle ? (
                    <div className="max-w-[min(22rem,calc(100vw-4rem))] text-center gradient-button text-white text-[9px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider truncate">
                      {user.identityTitle}
                    </div>
                  ) : (
                    <div className="max-w-[min(22rem,calc(100vw-4rem))] text-center bg-surface text-white/40 text-[7px] font-bold px-3 py-1.5 border border-white/10 rounded-lg uppercase tracking-tighter shadow-xl truncate">
                      Vote on 3+ traits to unlock
                    </div>
                  )}
                </div>
               <div className="text-center mt-4 min-w-0 max-w-full">
                 <h2 className="text-xl font-bold font-display truncate max-w-[calc(100vw-3rem)]">{user.displayName}</h2>
                 <p className="text-accent text-xs truncate max-w-[calc(100vw-3rem)]">@{user.username}</p>
               </div>
            </div>

            <div className="lg:hidden grid grid-cols-4 gap-2 w-full min-w-0">
              <StatItem label="Friends" value={user.friends.length} />
              <StatItem label="Eligible" value={eligibleFriends.length} />
              <StatItem label="Voted" value={votedFriends.length} />
              <StatItem label="Locked" value={lockedFriends.length} />
            </div>

            <div className="lg:hidden w-full space-y-3">
              <Button onClick={() => openInviteScreen('home')} variant="primary">Share Profile →</Button>
              <Button onClick={() => setCurrentScreen('storycard')} variant="secondary">View Story Card</Button>
            </div>

            <div className="card-surface p-4 sm:p-6 min-w-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold font-display text-lg text-gradient">Top Traits</h3>
                <span className="text-[10px] text-white/40 flex items-center gap-1.5 font-bold uppercase tracking-widest"><EyeOff size={14} /> Anonymous</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {topTraits.length > 0 ? topTraits.map((trait, i) => (
                  <div key={trait.id} className="stat-item border-accent/20">
                    <span className="text-2xl block mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <p className="text-xs font-extrabold uppercase mb-1 tracking-tight truncate w-full">{trait.name}</p>
                    <p className="text-lg font-display font-black text-accent">{Math.round((trait.votes / effectiveTotalVotes) * 100 || 0)}%</p>
                  </div>
                )) : (
                  [1,2,3].map(i => (
                    <div key={i} className="stat-item border-white/5 opacity-50">
                       <div className="w-8 h-8 rounded-full bg-white/5 mx-auto mb-2" />
                       <div className="w-12 h-2 bg-white/10 mx-auto rounded" />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card-surface p-4 sm:p-6 flex-1 min-h-0 flex flex-col min-w-0">
               <h3 className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-6">Trait Breakdown</h3>
               <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                  {(votedTraits.length > 0 ? votedTraits : [...user.traits].sort((a,b) => b.votes - a.votes)).slice(0, 8).map(trait => (
                    <TraitRow key={trait.id} trait={trait} total={effectiveTotalVotes} />
                  ))}
               </div>
            </div>
          </section>

          {/* Right Sidebar - Activity & Sharing */}
          <section className="hidden lg:flex flex-col gap-6 overflow-y-auto">
            <div className="card-surface p-6 flex-1 flex flex-col overflow-hidden">
               <h3 className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-6">Friend Activity</h3>
               <div className="space-y-3 overflow-y-auto">
                  {user.friends.length > 0 ? user.friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-3 metallic-panel p-3 rounded-xl">
                      {friend.avatar ? (
                        <img src={friend.avatar} className="w-10 h-10 rounded-full bg-surface object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/10 uppercase font-black text-[10px]">
                          {friend.displayName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <button
                          className="text-xs font-bold hover:text-accent transition-colors text-left"
                          onClick={() => openFriendDetails(friend)}
                        >
                          {friend.displayName}
                        </button>
                        <p className="text-[9px] opacity-50 font-medium">{getFriendshipLengthLabel(friend.relationshipLength)}</p>
                      </div>
                      {friend.hasVoted ? (
                         <div className="flex items-center gap-1 text-accent font-bold text-[9px]">
                           <CheckCircle2 size={10} /> VOTED
                         </div>
                      ) : !friend.isVoteEligible ? (
                        <button
                          className="bg-white/5 text-white/50 px-3 py-1 rounded-md text-[9px] font-black"
                          onClick={() => updateFriendshipLength(friend)}
                        >
                          {friend.relationshipLength ? 'WAITING' : 'SET TIME'}
                        </button>
                      ) : (
                        <button 
                          className="bg-accent text-background px-3 py-1 rounded-md text-[9px] font-black hover:scale-105 transition-transform"
                          onClick={() => openVotingScreen(friend, 'home')}
                        >VOTE</button>
                      )}
                    </div>
                  )) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-30">
                       <Users size={32} className="mb-2" />
                       <p className="text-xs font-bold uppercase tracking-widest">No friends yet</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="metallic-panel rounded-2xl p-6 text-center space-y-6">
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Share Story Card</p>
               <div className="card-surface p-6 border-white/5 flex flex-col items-center">
                  <div className="shimmer-ring w-12 h-12 rounded-full mb-3 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <Sparkles className="text-accent/30" size={24} />}
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-accent truncate w-full text-center">
                    {user.identityTitle || "Identity Locked"}
                  </p>
               </div>
               <button 
                onClick={() => setCurrentScreen('storycard')}
                className="gradient-button w-full py-3 rounded-lg text-xs font-black tracking-widest uppercase"
               >
                Download (Free)
               </button>
            </div>
          </section>
        </main>

        <footer className="mt-4 lg:mt-6 border-t border-white/5 py-4 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <button onClick={() => setCurrentScreen('about')} className="text-[11px] text-white/40 hover:text-white font-bold uppercase tracking-wider">About</button>
            <button onClick={() => setCurrentScreen('help')} className="text-[11px] text-white/40 hover:text-white font-bold uppercase tracking-wider">Help</button>
            <button onClick={() => setCurrentScreen('terms')} className="text-[11px] text-white/40 hover:text-white font-bold uppercase tracking-wider">Terms</button>
            <button onClick={() => setCurrentScreen('privacy')} className="text-[11px] text-white/40 hover:text-white font-bold uppercase tracking-wider">Privacy</button>
          </div>
          <p className="text-[11px] text-white/20 font-bold tracking-wider uppercase">© 2026 VibeBatch. All votes are anonymous.</p>
        </footer>
      </div>
    );
  };

  const NavItem = ({ icon, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`p-2.5 rounded-lg transition-all shrink-0 ${active ? 'text-accent bg-accent/10 glowing-accent' : 'text-white/40 hover:text-white'}`}
    >
      {icon}
    </button>
  );

  const Footer = () => (
    <footer className="p-8 text-center space-y-4 border-t border-white/5">
      <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
        <button onClick={() => setCurrentScreen('about')}>About</button>
        <button onClick={() => setCurrentScreen('help')}>Help</button>
        <button onClick={() => setCurrentScreen('terms')}>Terms</button>
        <button onClick={() => setCurrentScreen('privacy')}>Privacy</button>
      </div>
      <p className="text-[10px] text-white/10 font-bold tracking-widest">© 2026 VIBEBATCH</p>
    </footer>
  );

  const MobileMenuScreen = () => {
    const user = authState.user;
    const items = [
      { label: 'Friends', description: 'Manage friends, invite links, and chats', icon: <Users size={22} />, screen: 'friends' },
      { label: 'Traits', description: 'View your anonymous trait breakdown', icon: <Sparkles size={22} />, screen: 'traits' },
      { label: 'Eligibility', description: 'Check who can vote for your traits', icon: <Hourglass size={22} />, screen: 'hourglass' },
      { label: 'Vote Tracker', description: 'Track eligible, voted, and locked friends', icon: <BarChart3 size={22} />, screen: 'tracker' },
      { label: 'Banners', description: 'Achievement milestones and premium Vibe banners', icon: <Sparkles size={22} />, screen: 'banners' },
      { label: 'VibeBatch Premium', description: isPremiumUser(user) ? 'Premium insight cards and personality cards' : 'Plans, pricing, and premium features', icon: <Crown size={22} />, screen: 'premium' },
    ];

    return (
      <div className="min-h-screen p-4 pb-10 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setCurrentScreen('home')}><ChevronLeft /></button>
          <div>
            <h2 className="text-2xl font-bold font-display">Menu</h2>
            <p className="text-xs text-accent font-bold uppercase tracking-[0.18em] mt-1">VibeBatch navigation</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <button
              key={item.screen}
              onClick={() => setCurrentScreen(item.screen)}
              className="w-full card-surface p-4 flex items-center gap-4 text-left hover:border-accent/40 hover:bg-accent/5 transition-colors"
            >
              <span className="w-12 h-12 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-black text-sm uppercase tracking-wider">{item.label}</span>
                <span className="block text-xs text-white/45 mt-1 leading-relaxed">{item.description}</span>
              </span>
            </button>
          ))}
        </div>

        <Footer />
      </div>
    );
  };
// --- Sub-Screens placeholder (Voting, Friends, Traits, etc.) ---
  
  if (!authState.isAuthenticated) {
    return (
      <AuthScreen 
        onLogin={handleLogin} 
        onSignup={handleSignup} 
        onResetPassword={resetPassword}
        isLoginView={isLoginView} 
        setIsLoginView={setIsLoginView} 
        loading={loading} 
        avatarPreview={signupAvatarPreview}
        onAvatarChange={handleSignupAvatarChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {currentScreen === 'home' && authState.user && (
            <HomeScreen />
          )}

          {currentScreen === 'mobile-menu' && authState.user && (
            <MobileMenuScreen />
          )}

          {currentScreen === 'friends' && authState.user && (
            <FriendsScreen 
              onBack={() => setCurrentScreen('home')} 
              user={authState.user} 
              onChat={openChatWithFriend} 
              onAddFriend={addFriend}
              onOpenInvite={openInviteScreen}
              onUpdateFriendshipLength={updateFriendshipLength}
              onOpenDetails={openFriendDetails}
              onVote={(friend: Friend) => openVotingScreen(friend, 'friends')}
            />
          )}

          {currentScreen === 'invite' && authState.user && (
            <InviteFriendScreen
              link={inviteLink}
              onBack={() => setCurrentScreen(inviteBackScreen)}
              onCopy={copyInviteLink}
            />
          )}

          {currentScreen === 'traits' && authState.user && (
            <TraitsScreen onBack={() => setCurrentScreen('home')} user={authState.user} />
          )}
          
          {currentScreen === 'hourglass' && authState.user && (
            <HourglassScreen
              onBack={() => setCurrentScreen('home')}
              user={authState.user}
              onUpdateFriendshipLength={updateFriendshipLength}
              onVote={(friend: Friend) => openVotingScreen(friend, 'hourglass')}
            />
          )}
          
          {currentScreen === 'tracker' && authState.user && (
            <VoteTrackerScreen
              onBack={() => setCurrentScreen('home')}
              user={authState.user}
              onUpdateFriendshipLength={updateFriendshipLength}
              onVote={(friend: Friend) => openVotingScreen(friend, 'tracker')}
            />
          )}

          {currentScreen === 'banners' && authState.user && (
            <BannersScreen user={authState.user} onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'premium' && authState.user && (
            <PremiumScreen user={authState.user} onBack={() => setCurrentScreen('home')} />
          )}
          
          {currentScreen === 'public-profile' && selectedFriend && (
            <PublicProfileScreen 
              user={selectedFriend} 
              onBack={() => setCurrentScreen('home')} 
              onVote={() => {
                const friend = authState.user?.friends.find(f => f.id === selectedFriend.id);
                if (!friend?.isVoteEligible) {
                  alert('Voting unlocks after both friends confirm they have known each other for 6 months or more.');
                  return;
                }
                setCurrentScreen('voting');
              }}
            />
          )}

          {currentScreen === 'storycard' && authState.user && (
            <StoryCardGeneratorScreen user={authState.user} onBack={() => setCurrentScreen('home')} />
          )}
          
          {currentScreen === 'chat' && selectedFriend && (
            <ChatDetailScreen 
              friend={selectedFriend} 
              onBack={() => setCurrentScreen('friends')} 
              onSendMessage={(text: string) => sendMessage(selectedFriend.id, text)}
              onSendVoice={(blob: Blob, duration: number) => uploadVoiceMessage(selectedFriend.id, blob, duration)}
              onUpdateModeration={(setting: 'muted' | 'blocked', enabled: boolean) => updateFriendModeration(selectedFriend.id, setting, enabled)}
            />
          )}

          {currentScreen === 'voting' && selectedFriend && authState.user && (
            <VotingScreen 
              friend={selectedFriend} 
              onBack={() => setCurrentScreen(votingBackScreen)} 
              onVote={async (traits: string[]) => {
                if (selectedFriend && authState.user) {
                  setLoading(true);
                  try {
                    await submitTraitVotes(selectedFriend.id, traits);

                    const { error: voteStateError } = await supabase
                      .from('friendships')
                      .update({ has_voted: true })
                      .eq('user_id', authState.user.id)
                      .eq('friend_id', selectedFriend.id);

                    if (voteStateError) throw voteStateError;
                    markLocalConfirmedVote(authState.user.id, selectedFriend.id);

                    const updatedFriends = authState.user.friends.map(f => 
                      f.id === selectedFriend.id ? { ...f, hasVoted: true } : f
                    );
                    
                    const freshUser = await loadCurrentUserProfile(authState.user.id);
                    setAuthState(prev => ({ 
                      ...prev, 
                      user: prev.user
                        ? mergeStableUserState(
                            freshUser || { ...prev.user, friends: updatedFriends },
                            { ...prev.user, friends: updatedFriends }
                          )
                        : null 
                    }));

                    setCurrentScreen('home');
                  } catch (err: any) {
                    console.error(err);
                    throw err;
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />
          )}

          {['about', 'help', 'terms', 'privacy'].includes(currentScreen) && (
            <StaticScreen 
              title={currentScreen as any} 
              onBack={() => setCurrentScreen('home')} 
            />
          )}
        </motion.div>
      </AnimatePresence>

  {/* Profile Sheet */}
      <AnimatePresence>
        {isProfileSheetOpen && (
          <ProfileSheet 
            user={authState.user!} 
            onClose={() => setIsProfileSheetOpen(false)} 
            onLogout={logout} 
            onUpdateTitle={updateIdentity} 
            onUpdatePhoto={updateProfilePhoto}
            onUpdateDisplayName={updateDisplayName}
            onManageCustomTraits={manageCustomTraits}
            onResetPassword={resetPassword}
            onDeleteAccount={deleteAccount}
            onNavigate={(s: string) => { setIsProfileSheetOpen(false); setCurrentScreen(s); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {friendDetails && (
          <FriendDetailsModal friend={friendDetails} onClose={() => setFriendDetails(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}



// --- Screen Sub-components ---

function FriendDetailsModal({ friend, onClose }: any) {
  const topTraits = [...(friend.traits || [])]
    .sort((a: Trait, b: Trait) => (b.votes || 0) - (a.votes || 0))
    .filter((trait: Trait) => (trait.votes || 0) > 0)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 16, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        className="relative z-10 w-full max-w-sm card-surface p-6 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          {friend.avatar ? (
            <img src={friend.avatar} className="w-16 h-16 rounded-full border-2 border-accent object-cover" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-white/20 font-black">
              {friend.displayName?.[0] || '?'}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-bold font-display truncate">{friend.displayName}</h3>
            <p className="text-accent text-sm font-bold truncate">@{friend.username || friend.id}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-background/60 border border-white/5 rounded-lg p-4">
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Friendship duration</p>
            <p className="text-sm font-bold">{getFriendshipLengthLabel(friend.relationshipLength)}</p>
            <p className="text-[10px] text-white/40 mt-1">
              {friend.isVoteEligible ? 'Voting unlocked by both users.' : 'Voting unlocks when both users confirm 6 months or more.'}
            </p>
          </div>

          <div>
            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-3">Top traits</p>
            {topTraits.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topTraits.map((trait: Trait) => (
                  <Badge key={trait.id || trait.name} color="pink">{trait.name}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No voted traits yet.</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-white text-background py-3 rounded-lg text-xs font-black uppercase tracking-widest"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

function SocialLogo({ label }: { label: string }) {
  if (label === 'WhatsApp') {
    return (
      <span className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20">
        <svg viewBox="0 0 32 32" className="w-7 h-7 text-white" aria-hidden="true">
          <path fill="currentColor" d="M16 4.4c-6.2 0-11.2 4.8-11.2 10.8 0 2 .6 3.9 1.6 5.5L5.1 27l6.5-1.7c1.4.6 2.9.9 4.4.9 6.2 0 11.2-4.8 11.2-10.8S22.2 4.4 16 4.4Zm0 19.8c-1.4 0-2.8-.3-4-.9l-.4-.2-3.8 1 1-3.6-.3-.4c-1-1.4-1.5-3-1.5-4.8 0-4.8 4-8.7 9-8.7s9 3.9 9 8.7-4 8.9-9 8.9Zm5-6.5c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-1-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.5.7.3 1.3.5 1.8.6.8.2 1.4.2 2 .1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.2-.3-.4-.4-.7-.5Z" />
        </svg>
      </span>
    );
  }

  if (label === 'Facebook') {
    return (
      <span className="w-11 h-11 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-lg shadow-[#1877F2]/20">
        <span className="text-white text-3xl font-black font-sans leading-none">f</span>
      </span>
    );
  }

  if (label === 'Instagram') {
    return (
      <span className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 bg-[radial-gradient(circle_at_30%_110%,#FEDA75_0_18%,#FA7E1E_28%,#D62976_52%,#962FBF_74%,#4F5BD5_100%)]">
        <svg viewBox="0 0 32 32" className="w-7 h-7 text-white" aria-hidden="true">
          <rect x="8" y="8" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="21.2" cy="10.9" r="1.4" fill="currentColor" />
        </svg>
      </span>
    );
  }

  return (
    <span className="w-11 h-11 rounded-2xl bg-[#FFFC00] flex items-center justify-center shadow-lg shadow-[#FFFC00]/20">
      <svg viewBox="0 0 32 32" className="w-7 h-7 text-black" aria-hidden="true">
        <path fill="currentColor" d="M16 5.5c3.6 0 6 2.5 6 6.2v3.2c0 .7.4 1.2 1.1 1.5l2 .8c.5.2.6.9.1 1.2l-2.2 1.4c-.3.2-.5.4-.6.8-.3 1.4-1.2 2.2-2.9 2.5-.5.1-.9.4-1.2.8-.6.9-1.4 1.5-2.3 1.5s-1.7-.6-2.3-1.5c-.3-.4-.7-.7-1.2-.8-1.7-.3-2.6-1.1-2.9-2.5-.1-.4-.3-.6-.6-.8l-2.2-1.4c-.5-.3-.4-1 .1-1.2l2-.8c.7-.3 1.1-.8 1.1-1.5v-3.2c0-3.7 2.4-6.2 6-6.2Z" />
      </svg>
    </span>
  );
}

function InviteFriendScreen({ link, onBack, onCopy }: any) {
  const message = `Join me on VibeBatch: ${link}`;
  const encodedLink = encodeURIComponent(link);
  const encodedMessage = encodeURIComponent(message);
  const shareTargets = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodedMessage}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}` },
    { label: 'Instagram', href: `https://www.instagram.com/` },
    { label: 'Snapchat', href: `https://www.snapchat.com/` },
  ];

  const nativeShare = async () => {
    if (!navigator.share) {
      await navigator.clipboard.writeText(link);
      alert('Invite link copied. Open your preferred app and paste it.');
      return;
    }

    await navigator.share({
      title: 'Join me on VibeBatch',
      text: 'Add me as a friend on VibeBatch.',
      url: link,
    });
  };

  return (
    <div className="min-h-screen p-4 pb-24 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Invite Friend</h2>
      </div>

      <div className="space-y-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Copy className="text-accent shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold">Copy invite link</h3>
              <p className="text-xs text-white/50 mt-1 break-all">{link}</p>
            </div>
          </div>
          <Button onClick={onCopy} className="flex items-center justify-center gap-2">
            <Copy size={18} /> Copy Link
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Share className="text-accent shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold">Share to apps</h3>
              <p className="text-xs text-white/50 mt-1">Choose an app or use your device share menu.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shareTargets.map(target => (
              <a
                key={target.label}
                href={target.href}
                target="_blank"
                rel="noreferrer"
                className="bg-background/70 border border-white/10 rounded-xl p-4 text-center text-xs font-black uppercase tracking-wider hover:border-accent/40 hover:text-accent transition-colors flex flex-col items-center gap-3"
              >
                <SocialLogo label={target.label} />
                <span>{target.label}</span>
              </a>
            ))}
          </div>

          <button
            onClick={nativeShare}
            className="w-full bg-accent/10 border border-accent/20 text-accent py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> More share options
          </button>
        </Card>
      </div>
    </div>
  );
}

function FriendsScreen({ onBack, user, onChat, onAddFriend, onOpenInvite, onUpdateFriendshipLength, onOpenDetails, onVote }: any) {
  const [newName, setNewName] = useState('');

  const submit = (e: any) => {
    e.preventDefault();
    if (!newName.trim()) {
      onOpenInvite();
      return;
    }

    onAddFriend(newName);
    setNewName('');
  };

  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Friends</h2>
      </div>
      
      <form onSubmit={submit} className="flex gap-2 mb-6">
        <div className="flex-1 bg-surface rounded-xl px-4 py-3 flex items-center gap-3">
          <Users className="text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search username or copy invite link..." 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm" 
          />
        </div>
        <button type="submit" className="bg-accent/10 border border-accent/20 p-3 rounded-xl text-accent hover:bg-accent hover:text-background transition-all">
          <UserPlus size={20} />
        </button>
      </form>

      <div className="space-y-3">
        {user.friends.length > 0 ? user.friends.map((friend: Friend) => (
          <div key={friend.id} className="flex items-center justify-between p-3 card-surface">
            <div className="flex items-center gap-3">
              <button className="relative" onClick={() => onOpenDetails(friend)}>
                {friend.avatar ? (
                  <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-white/20 font-black">
                    {friend.displayName[0]}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${friend.status === 'online' ? 'bg-green-500' : 'bg-white/20'}`} />
              </button>
              <div>
                <button
                  className="font-bold flex items-center gap-2 hover:text-accent transition-colors text-left"
                  onClick={() => onOpenDetails(friend)}
                >
                  {friend.displayName}
                  {friend.messages.some(m => !m.isRead && m.senderId !== 'me') && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                </button>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  {friend.isVoteEligible ? 'Voting unlocked' : getFriendshipLengthLabel(friend.relationshipLength)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!friend.relationshipLength && (
                <button
                  onClick={() => onUpdateFriendshipLength(friend)}
                  className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20"
                >
                  Set time
                </button>
              )}
              {friend.relationshipLength && !friend.isVoteEligible && (
                <span className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-white/5 text-white/40 border border-white/10">
                  Waiting
                </span>
              )}
              {friend.isVoteEligible && !friend.hasVoted && (
                <button
                  onClick={() => onVote(friend)}
                  className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-accent text-background hover:scale-105 transition-transform"
                >
                  Vote
                </button>
              )}
              {friend.hasVoted && (
                <span className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-accent/10 text-accent border border-accent/20">
                  Voted
                </span>
              )}
              <button 
                onClick={() => onChat(friend)}
                className="p-2 text-white/40 hover:text-accent transition-colors relative"
              >
                <MessageCircle size={18} />
                {friend.messagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-accent text-background text-[9px] font-black flex items-center justify-center">
                    {friend.messagesCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Users size={48} className="mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">No friends yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TraitsScreen({ onBack, user }: any) {
  const sortedTraits = [...user.traits].sort((a, b) => b.votes - a.votes);
  const votedTraits = getPositiveTraits(user.traits);
  const customTraits = sortedTraits.filter(t => t.category === 'custom' && t.votes === 0);
  const unvotedPredefinedTraits = sortedTraits.filter(t => t.category === 'predefined' && t.votes === 0);
  const unvotedSponsoredTraits = sortedTraits.filter(t => t.category === 'sponsored' && t.votes === 0);
  const top3 = votedTraits.slice(0, 3);
  const effectiveTotalVotes = getTraitVoteTotal(user.traits, user.totalVotes);
  
  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Traits</h2>
      </div>

      <div className="flex items-center gap-2 mb-6 text-white/40 text-[10px] font-bold uppercase tracking-wider">
        <EyeOff size={14} />
        <span>All votes are anonymous</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {top3.length > 0 ? top3.map((trait, i) => (
          <div key={trait.id} className={`card-surface p-4 flex flex-col items-center justify-center text-center relative overflow-hidden ${i === 0 ? 'border-accent/40 shadow-lg shadow-accent/5' : ''} ${trait.category === 'sponsored' ? 'border-sponsored/40 bg-sponsored/5' : ''}`}>
             <span className={`text-2xl font-bold font-display mb-1 ${trait.category === 'sponsored' ? 'text-sponsored' : i === 0 ? 'text-accent' : i === 1 ? 'text-white/60' : 'text-white/40'}`}>#{i + 1}</span>
             <span className="text-xs font-bold block mb-1">{trait.name}</span>
             <Badge color={trait.category === 'sponsored' ? 'amber' : i === 0 ? 'accent' : 'pink'}>{Math.round((trait.votes / effectiveTotalVotes) * 100)}%</Badge>
             {trait.category === 'sponsored' && (
               <p className="text-[7px] text-sponsored font-black uppercase mt-3 tracking-widest border-t border-sponsored/20 pt-2 w-full">Sponsored by {trait.sponsoredBy}</p>
             )}
          </div>
        )) : (
          [1,2,3].map(i => (
             <div key={i} className="card-surface p-4 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                <span className="text-2xl font-bold font-display mb-1 text-white/20">#{i}</span>
                <div className="w-10 h-1 bg-white/10 rounded-full mb-2" />
                <div className="w-6 h-3 bg-white/5 rounded-full" />
             </div>
          ))
        )}
      </div>

      <div className="space-y-6">
        <TraitCategory label="Voted Traits" traits={votedTraits} total={effectiveTotalVotes} />
        <TraitCategory label="Custom Traits" traits={customTraits} total={effectiveTotalVotes} custom />
        <TraitCategory label="Predefined Traits" traits={unvotedPredefinedTraits} total={effectiveTotalVotes} />
        <TraitCategory label="Sponsored Traits" traits={unvotedSponsoredTraits} total={effectiveTotalVotes} sponsored />
      </div>
    </div>
  );
}

function BannersScreen({ user, onBack }: { user: UserProfile; onBack: () => void }) {
  const voteTotal = getTraitVoteTotal(user.traits, user.totalVotes);
  const premium = isPremiumUser(user);

  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <div>
          <h2 className="text-xl font-bold font-display">Banners</h2>
          <p className="text-xs text-accent font-bold uppercase tracking-[0.18em] mt-1">Achievements and Vibe visuals</p>
        </div>
      </div>

      <section className="mb-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Achievement Banners</h3>
      <div className="card-surface p-4 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-black">Current votes</p>
          <p className="text-2xl font-black font-display text-accent">{voteTotal.toLocaleString()}</p>
        </div>
        <Badge color="accent">All users</Badge>
      </div>

      <div className="grid gap-4">
        {ACHIEVEMENT_BANNERS.map(banner => {
          const unlocked = voteTotal >= banner.threshold;
          return (
            <div key={banner.name} className="card-surface overflow-hidden">
              <div className="relative aspect-[3/1] bg-background">
                <img src={banner.image} alt="" className={`w-full h-full object-cover ${unlocked ? '' : 'grayscale opacity-55'}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-background/78 via-background/22 to-transparent" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <p className="text-2xl font-black font-display">{banner.name}</p>
                  <p className="text-xs text-accent font-black uppercase tracking-widest mt-1">{banner.requirement}</p>
                </div>
                <div className="absolute right-4 top-4">
                  <Badge color={unlocked ? 'green' : 'pink'}>{unlocked ? 'Unlocked' : 'Locked'}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </section>

      <section>
      <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Vibe Banners</h3>
      {!premium && (
        <div className="card-surface p-5 mb-6 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-accent mb-2">Buy Premium To Unlock These</p>
          <p className="text-sm text-white/55 leading-relaxed">Vibe Banners are included with VibeBatch Premium.</p>
        </div>
      )}

      <div className="grid gap-4">
        {VIBE_BANNERS.map(banner => (
          <div key={banner.name} className="card-surface overflow-hidden">
            <div className="relative aspect-[3/1] bg-background">
              <img src={banner.image} alt="" className={`w-full h-full object-cover ${premium ? '' : 'grayscale opacity-60'}`} />
              {!premium && <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />}
              <div className="absolute left-4 bottom-4">
                <p className="text-lg font-black font-display">{banner.name}</p>
              </div>
              {!premium && (
                <div className="absolute right-4 top-4">
                  <Badge color="accent">Premium</Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </section>
    </div>
  );
}

function TraitCategory({ label, traits, total, sponsored, custom }: any) {
  if (traits.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1 border-l-2 border-accent/20 ml-1">{label}</h3>
      <div className="space-y-4">
        {traits.map((t: Trait) => {
          const percent = Math.round(((t.votes || 0) / Math.max(total || 0, 1)) * 100) || 0;
          return (
            <div key={t.id} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold px-1">
                <div className="flex items-center gap-2">
                   <span className={sponsored ? 'text-sponsored' : ''}>{t.name}</span>
                   {sponsored && <span className="text-[7px] bg-sponsored text-background px-1.5 py-0.5 rounded-sm font-black uppercase tracking-tighter shadow-lg shadow-sponsored/20">Sponsored</span>}
                </div>
                <span className={sponsored ? 'text-sponsored' : 'text-white/40'}>{percent}%</span>
              </div>
              <div className={`h-3 bg-surface rounded-full overflow-hidden ${custom ? 'border-2 border-dashed border-accent/40 bg-accent/5' : 'border border-white/5'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className={`h-full relative ${sponsored ? 'bg-sponsored' : 'bg-accent'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
              {sponsored && (
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-sponsored animate-pulse" />
                   <div className="text-[9px] font-black text-sponsored uppercase tracking-widest">
                      Partnered with <span className="underline decoration-sponsored/40 underline-offset-2">{t.sponsoredBy}</span>
                   </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

function HourglassScreen({ onBack, user, onUpdateFriendshipLength, onVote }: any) {
  const eligible = user.friends.filter((f: Friend) => f.isVoteEligible);
  const notEligible = user.friends.filter((f: Friend) => !f.isVoteEligible);

  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Eligibility</h2>
      </div>

      <div className="bg-accent/5 border border-accent/20 p-4 rounded-2xl mb-8 flex gap-4">
        <Info className="text-accent shrink-0" />
        <p className="text-xs text-white/70 leading-relaxed font-medium">To keep votes high-fidelity, both friends must confirm they have known each other for <span className="text-accent font-bold">6 months or more</span> before anonymous trait voting unlocks.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Eligible to Vote</h3>
          <div className="space-y-2">
            {eligible.map((f: Friend) => (
              <div key={f.id} className="flex items-center justify-between p-3 card-surface">
                <div className="flex items-center gap-3">
                  {f.avatar ? (
                    <img src={f.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/10 uppercase font-black text-[10px]">
                      {f.displayName[0]}
                    </div>
                  )}
                  <span className="font-bold text-sm">{f.displayName}</span>
                </div>
                {f.hasVoted ? (
                  <Badge color="green">Voted</Badge>
                ) : (
                  <button
                    onClick={() => onVote(f)}
                    className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-accent text-background hover:scale-105 transition-transform"
                  >
                    Vote
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Needs duration check</h3>
          <div className="space-y-2">
            {notEligible.map((f: Friend) => (
              <div key={f.id} className="flex items-center justify-between p-3 card-surface opacity-60">
                <div className="flex items-center gap-3">
                  {f.avatar ? (
                    <img src={f.avatar} className="w-10 h-10 rounded-full grayscale object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/10 uppercase font-black text-[10px]">
                      {f.displayName ? f.displayName[0] : '?'}
                    </div>
                  )}
                  <span className="font-bold text-sm">{f.displayName}</span>
                </div>
                <button onClick={() => onUpdateFriendshipLength(f)}>
                  <Badge color="amber">{f.relationshipLength ? 'Waiting for friend' : 'Set time'}</Badge>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function VoteTrackerScreen({ onBack, user, onUpdateFriendshipLength, onVote }: any) {
  const votedCount = user.friends.filter((f: Friend) => f.hasVoted).length;
  const votePoolCount = user.friends.filter((f: Friend) => f.isVoteEligible).length;
  const eligibleCount = user.friends.filter((f: Friend) => f.isVoteEligible && !f.hasVoted).length;
  const participation = Math.round((votedCount / votePoolCount) * 100) || 0;

  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Vote Tracker</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Eligible Friends" value={eligibleCount} />
        <StatCard label="Have Voted" value={votedCount} />
        <StatCard label="Locked" value={user.friends.filter((f: Friend) => !f.isVoteEligible).length} />
        <StatCard label="Participation %" value={`${participation}%`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Detailed Status</h3>
        <div className="space-y-2">
           {user.friends.map((friend: Friend) => (
             <div key={friend.id} className="flex items-center justify-between p-3 card-surface">
               <div className="flex items-center gap-3">
                 {friend.avatar ? (
                   <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/10 uppercase font-black text-[10px]">
                     {friend.displayName ? friend.displayName[0] : '?'}
                   </div>
                 )}
                 <span className="font-bold text-sm">{friend.displayName}</span>
               </div>
               {friend.isVoteEligible ? (
                 friend.hasVoted ? (
                   <Badge color="green">Voted</Badge>
                 ) : (
                   <button
                     onClick={() => onVote(friend)}
                     className="px-3 py-2 rounded-lg text-[9px] font-black uppercase bg-accent text-background hover:scale-105 transition-transform"
                   >
                     Vote
                   </button>
                 )
               ) : (
                 <button onClick={() => onUpdateFriendshipLength(friend)}>
                   <Badge color="amber">{friend.relationshipLength ? 'Waiting for friend' : 'Set time'}</Badge>
                 </button>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <Card className="flex flex-col items-center justify-center py-5 sm:py-6 min-h-[104px] sm:min-h-[128px]">
      <span className="text-2xl sm:text-3xl font-bold font-display mb-1">{value}</span>
      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</span>
    </Card>
  );
}

function VotingScreen({ friend, onBack, onVote }: any) {
  const [selectedTrait, setSelectedTrait] = useState('');
  const [isCaptchadone, setIsCaptchaDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const customTraitNames = (friend.traits || [])
    .filter((trait: Trait) => trait.category === 'custom')
    .map((trait: Trait) => trait.name)
    .filter(Boolean);
  const traits = [...new Set([...PREDEFINED_TRAITS.map(t => t.name!), ...customTraitNames])];

  const toggleTrait = (name: string) => {
    setSelectedTrait(prev => prev === name ? '' : name);
  };

  const submit = async () => {
    if (!isCaptchadone) return;
    setSubmitting(true);
    try {
      await onVote([selectedTrait]);
      setSubmitted(true);
    } catch (error: any) {
      alert(error.message || 'Failed to send vibes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center glowing-accent">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display">Vote Submitted!</h2>
          <p className="text-white/60 text-sm">Thank you for helping define {friend.displayName}'s vibe. All votes are anonymous.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden p-4">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <button onClick={onBack}><ChevronLeft /></button>
        <div className="text-center">
            <h2 className="text-lg font-bold font-display">Voting for {friend.displayName}</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Select their strongest trait</p>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto mb-8 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {traits.map(trait => (
            <button 
              key={trait}
              onClick={() => toggleTrait(trait)}
              className={`p-4 card-surface font-bold text-sm transition-all text-center ${selectedTrait === trait ? 'bg-accent/20 border-accent text-accent glowing-accent' : 'hover:border-white/20'}`}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 shrink-0 pb-8 border-t border-white/5 pt-6">
        <div className="p-4 card-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-white/20 bg-surface accent-accent" 
              checked={isCaptchadone}
              onChange={(e) => setIsCaptchaDone(e.target.checked)}
            />
            <span className="text-sm font-medium">I am a human friend</span>
          </div>
          <Lock size={18} className="text-white/20" />
        </div>

        <div className="bg-white/5 p-4 rounded-xl space-y-2">
           <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex items-center gap-2">
             <Info size={12} /> Anti-abuse note
           </h4>
           <p className="text-xs text-white/60 italic leading-relaxed">Each person can only vote once. Votes are intentional and non-reversible.</p>
        </div>

        <Button onClick={submit} disabled={!selectedTrait || !isCaptchadone || submitting} variant="primary">
          {submitting ? 'Sending vibes...' : 'Submit vote →'}
        </Button>
      </div>
    </div>
  );
}

function StaticScreen({ title, onBack }: any) {
  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-2xl font-bold font-display capitalize">{title}</h2>
      </div>
      <Card className="min-h-[60vh] p-6 text-white/80 leading-relaxed space-y-6 overflow-y-auto">
        <section className="space-y-3">
          <h3 className="text-white font-bold text-lg">Introduction</h3>
          <p className="text-sm opacity-80">Welcome to VibeBatch. This platform is designed to provide high-fidelity feedback on personality traits through an anonymous and time-gated social framework. Our goal is to provide a "vibe check" that actually means something.</p>
        </section>
        <section className="space-y-3">
          <h3 className="text-white font-bold text-lg">Core Philosophy</h3>
          <p className="text-sm opacity-80">We believe identity is reflective. By pulse-checking how those closest to us perceive our traits, we can better understand our impact on the world around us. We strictly enforce anonymity to ensure honesty and safety for all participants.</p>
        </section>
        <section className="space-y-3">
          <h1 className="text-accent font-bold">Standard Placeholder Content</h1>
          <p className="text-sm opacity-60">This section would typically contain the full legal text for the {title} page. This includes your rights, our responsibilities, and the mechanisms of data processing that power the VibeBatch AI identity engine.</p>
        </section>
        <div className="pt-12 text-center opacity-20 italic">
          <p>Last updated: May 2026</p>
        </div>
      </Card>
    </div>
  )
}

function ChatDetailScreen({ friend, onBack, onSendMessage, onSendVoice, onUpdateModeration }: any) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [friend.messages]);

  useEffect(() => (
    () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    }
  ), []);

  const send = async (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (friend.blockedByMe || friend.blockedMe) {
      alert('Messages are blocked for this friend.');
      return;
    }
    const nextMessage = message;
    setMessage('');
    await onSendMessage(nextMessage);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const toggleRecording = async () => {
    if (friend.blockedByMe || friend.blockedMe) {
      alert('Messages are blocked for this friend.');
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      audioChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const duration = Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000));
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);

        if (!blob.size) return;

        try {
          await onSendVoice(blob, duration);
        } catch (error: any) {
          console.error(error);
          alert(error.message || 'Voice message failed to send.');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      alert('Could not access the microphone.');
    }
  };

  const handleAttachments = (files: FileList | null) => {
    if (!files?.length) return;
    if (friend.blockedByMe || friend.blockedMe) {
      alert('Messages are blocked for this friend.');
      return;
    }
    const fileNames = Array.from(files).map(file => file.name).join(', ');
    onSendMessage(`Attachment${files.length > 1 ? 's' : ''}: ${fileNames}`);
  };

  const messagesBlocked = Boolean(friend.blockedByMe || friend.blockedMe);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-background">
      <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button onClick={onBack}><ChevronLeft /></button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            {friend.avatar ? (
              <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-accent/20" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/20 font-black text-xs">
                {friend.displayName[0]}
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${friend.status === 'online' ? 'bg-green-500' : 'bg-white/20'}`} />
          </div>
          <div>
            <p className="font-bold text-sm leading-none mb-1">{friend.displayName}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${friend.status === 'online' ? 'text-green-500' : 'text-white/20'}`}>
              {messagesBlocked ? 'Blocked' : friend.isMuted ? 'Muted' : friend.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen(open => !open)}
            className="w-10 h-10 rounded-xl bg-background/40 border border-white/10 text-white/60 hover:text-accent hover:border-accent/40 flex items-center justify-center"
            aria-label="Chat settings"
          >
            <Settings size={18} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-xl bg-surface border border-accent/20 shadow-2xl shadow-black/30 p-2 z-20">
              <button
                type="button"
                onClick={() => {
                  onUpdateModeration('muted', !friend.isMuted);
                  setSettingsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-white/75 hover:bg-accent/10"
              >
                {friend.isMuted ? 'Unmute messages' : 'Mute messages'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateModeration('blocked', !friend.blockedByMe);
                  setSettingsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-red-200 hover:bg-red-500/10"
              >
                {friend.blockedByMe ? 'Unblock friend' : 'Block friend'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {friend.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <MessageCircle size={48} className="mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
            <p className="text-[10px]">Start the conversation below</p>
          </div>
        )}
        {friend.messages.map((m: any) => {
          const parsedMessage = parseChatMessage(m.text);
          const mine = m.senderId === 'me';

          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                mine
                  ? 'bg-accent text-background font-medium rounded-tr-none shadow-lg shadow-accent/10'
                  : 'bg-surface border border-white/5 rounded-tl-none'
              }`}>
                {parsedMessage.type === 'voice' ? (
                  <div className="space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold">Voice message</span>
                      <span className={`text-[10px] font-black ${mine ? 'text-black/45' : 'text-white/35'}`}>
                        {parsedMessage.duration}s
                      </span>
                    </div>
                    <audio src={parsedMessage.url} controls className="w-full h-9" />
                  </div>
                ) : (
                  parsedMessage.text
                )}
                <p className={`text-[8px] mt-1 opacity-50 font-bold text-right ${mine ? 'text-black/60' : 'text-white/40'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {messagesBlocked && (
        <div className="px-4 py-3 border-t border-white/5 bg-red-500/10 text-red-100 text-xs font-bold text-center">
          {friend.blockedByMe ? 'You blocked this friend. Unblock them from chat settings to message again.' : 'This friend has blocked messages.'}
        </div>
      )}

      <form onSubmit={send} className="p-4 border-t border-white/5 bg-surface/30 shrink-0">
        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleAttachments(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => attachmentInputRef.current?.click()}
            disabled={messagesBlocked}
            className="bg-surface border border-white/10 text-white/60 p-3 rounded-xl hover:text-accent hover:border-accent/40 transition-colors"
            aria-label="Add photos, documents, or files"
          >
            <Plus size={20} />
          </button>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={messagesBlocked}
            placeholder={messagesBlocked ? "Messages are blocked" : isRecording ? "Recording voice..." : "Type a message..."} 
            className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent/50 transition-colors"
          />
          <button
            type="button"
            onClick={toggleRecording}
            disabled={messagesBlocked}
            className={`border p-3 rounded-xl transition-colors ${
              isRecording
                ? 'bg-red-500/15 border-red-400/40 text-red-300'
                : 'bg-surface border-white/10 text-white/60 hover:text-accent hover:border-accent/40'
            }`}
            aria-label={isRecording ? 'Stop recording voice message' : 'Record voice message'}
          >
            <Mic size={20} />
          </button>
          <button 
            type="submit"
            disabled={!message.trim() || messagesBlocked}
            className="bg-accent text-background p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-accent/20"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileSheet({ user, onClose, onLogout, onUpdateTitle, onUpdatePhoto, onUpdateDisplayName, onManageCustomTraits, onResetPassword, onDeleteAccount, onNavigate }: any) {
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-surface rounded-t-3xl border-t border-white/10 p-6 z-10 relative"
      >
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
        
        <div className="flex items-center gap-4 mb-8">
          {user.avatar ? (
            <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-accent object-cover" alt="" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-accent/20 flex items-center justify-center text-accent/20 font-black">
              {user.displayName ? user.displayName[0] : '?'}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold font-display">{user.displayName}</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs text-white/40">vibebatch.com/u/{user.username}</span>
               <button
                className="text-accent"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?u=${user.username}`);
                  alert('Profile link copied.');
                }}
               >
                <Copy size={14} />
               </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpdatePhoto(file);
              e.target.value = '';
            }}
          />
          <SheetOption icon={<Camera size={18} />} label="Update profile photo" onClick={() => profilePhotoInputRef.current?.click()} />
          <SheetOption icon={<Users size={18} />} label="Update display name" onClick={onUpdateDisplayName} />
          <SheetOption icon={<Sparkles size={18} />} label="Manage custom traits" onClick={onManageCustomTraits} />
          <SheetOption icon={<Lock size={18} />} label="Reset password" onClick={() => onResetPassword()} />
          <SheetOption icon={<Download size={18} />} label="Download Story Card" onClick={() => onNavigate('storycard')} />
          <SheetOption icon={<Sparkles size={18} />} label="Banners" onClick={() => onNavigate('banners')} />
          <SheetOption 
            icon={<Sparkles className="text-accent" size={18} />} 
            label="Regenerate Identity Title" 
            onClick={onUpdateTitle} 
          />
          <div className="pt-4 border-t border-white/5 space-y-3">
             <button onClick={onLogout} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-amber-500/10 text-amber-500 transition-colors">
                <span className="font-bold">Log out</span>
                <LogOut size={18} />
             </button>
             <button onClick={onDeleteAccount} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
                <span className="font-bold">Delete account</span>
                <Trash2 size={18} />
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const SheetOption = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm">
    <span className="text-white/40">{icon}</span>
    <span>{label}</span>
  </button>
);

const StatItem = ({ label, value }: any) => (
  <div className="stat-item">
    <span className="block text-lg font-black font-display text-accent leading-none mb-1">{value}</span>
    <span className="text-[8px] opacity-60 font-black uppercase tracking-wider">{label}</span>
  </div>
);

const TraitRow = ({ trait, total }: any) => {
  const percent = Math.round(((trait.votes || 0) / Math.max(total || 0, 1)) * 100) || 0;
  const isSponsored = trait.category === 'sponsored';
  const isCustom = trait.category === 'custom';

  return (
    <div className={`space-y-2 p-3 rounded-lg transition-colors ${isSponsored ? 'border border-sponsored/30 bg-sponsored/10 shadow-lg shadow-sponsored/5' : isCustom ? 'border-2 border-dashed border-accent/40 bg-accent/5' : 'bg-background/50 border border-white/5'}`}>
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wide">
        <div className="flex items-center gap-2">
          <span className={isSponsored ? 'text-sponsored' : ''}>{trait.name}</span>
          {isCustom && <span className="text-accent/60 text-[8px] font-bold tracking-tight">(Custom)</span>}
        </div>
        <span className={isSponsored ? 'text-sponsored' : 'text-accent'}>{percent}%</span>
      </div>
      <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full rounded-full relative ${isSponsored ? 'bg-sponsored' : 'bg-accent'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </motion.div>
      </div>
      {isSponsored && (
        <div className="flex justify-between items-center pt-2 mt-1 border-t border-sponsored/10">
           <span className="text-[7px] font-black text-sponsored uppercase tracking-widest flex items-center gap-1">
             <div className="w-1 h-1 rounded-full bg-sponsored" />
             BY {trait.sponsoredBy?.toUpperCase()}
           </span>
           <span className="text-[6px] text-sponsored/40 font-black tracking-tighter">OFFICIAL PARTNER</span>
        </div>
      )}
    </div>
  )
}

const loadCanvasImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(String(reader.result || ''));
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const loadCleanCanvasImage = async (src?: string) => {
  if (!src) return null;
  try {
    if (/^https?:\/\//i.test(src)) {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Image could not be fetched');
      const dataUrl = await blobToDataUrl(await response.blob());
      return await loadCanvasImage(dataUrl);
    }
    return await loadCanvasImage(src);
  } catch {
    return null;
  }
};

const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string) => {
  const clickLink = (href: string, revoke = false) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = href;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      if (revoke) URL.revokeObjectURL(href);
    }, 1000);
  };

  try {
    clickLink(canvas.toDataURL('image/png'));
  } catch {
    canvas.toBlob(blob => {
      if (!blob) return;
      clickLink(URL.createObjectURL(blob), true);
    }, 'image/png');
  }
};

const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
  let line = '';

  words.forEach(word => {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });

  if (line) lines.push(line);
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight, maxWidth));
  return y + lines.length * lineHeight;
};

const setFittedCanvasFont = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  minFontSize: number,
  weight = '900',
  family = 'Inter, Arial'
) => {
  let size = fontSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > minFontSize);
};

const buildLocalPersonalityDescription = (traits: Trait[] = []) => {
  const names = getPositiveTraits(traits).slice(0, 3).map(trait => trait.name);
  if (names.length === 0) {
    return 'Your premium personality card will sharpen as friends add more trait votes.';
  }

  const [first, second = 'memorable energy', third = 'intentional presence'] = names;
  return `Your strongest signal is ${first}, giving your personality a clear first impression. Paired with ${second} and ${third}, your vibe feels specific, recognizable, and shaped by the traits people most associate with you.`;
};

const drawCoverImage = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
};

const downloadPremiumStoryCardPng = async (user: UserProfile, description: string, background = getNextPremiumBackground()) => {
  const topTraits = getPositiveTraits(user.traits).slice(0, 3);
  const traitNames = topTraits.length
    ? topTraits.map(trait => trait.name)
    : ['Vibe still forming', 'More votes loading', 'Trait signals pending'];
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bgImage = await loadCleanCanvasImage(background);
  if (!bgImage) {
    throw new Error('Premium background could not be loaded.');
  }
  drawCoverImage(ctx, bgImage, 0, 0, canvas.width, canvas.height);

  const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
  overlay.addColorStop(0, 'rgba(16,8,28,0.14)');
  overlay.addColorStop(0.52, 'rgba(16,8,28,0.28)');
  overlay.addColorStop(1, 'rgba(16,8,28,0.52)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(220,199,255,0.26)';
  ctx.lineWidth = 3;
  ctx.roundRect(54, 54, 972, 1812, 72);
  ctx.stroke();

  const badgeGradient = ctx.createLinearGradient(400, 110, 680, 172);
  badgeGradient.addColorStop(0, '#F5D7FF');
  badgeGradient.addColorStop(1, '#7463D8');
  ctx.fillStyle = badgeGradient;
  ctx.beginPath();
  ctx.roundRect(398, 110, 284, 62, 31);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PREMIUM', 540, 150);

  const avatarX = canvas.width / 2;
  const avatar = await loadCleanCanvasImage(user.avatar);
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, 330, 122, 0, Math.PI * 2);
    ctx.clip();
    drawCoverImage(ctx, avatar, avatarX - 122, 208, 244, 244);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(avatarX, 330, 122, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#DCC7FF';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(avatarX, 330, 128, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  const displayHandle = user.username ? `@${user.username}` : user.displayName;
  setFittedCanvasFont(ctx, displayHandle, 900, 58, 36, '900');
  ctx.fillText(displayHandle, canvas.width / 2, 585, 900);

  const title = user.identityTitle || 'Identity Locked';
  setFittedCanvasFont(ctx, title.toUpperCase(), 500, 25, 18, '900');
  const titleWidth = Math.min(ctx.measureText(title).width + 96, 580);
  const titleX = canvas.width / 2 - titleWidth / 2;
  const titleGradient = ctx.createLinearGradient(titleX, 636, titleX + titleWidth, 696);
  titleGradient.addColorStop(0, '#F5D7FF');
  titleGradient.addColorStop(1, '#7463D8');
  ctx.fillStyle = titleGradient;
  ctx.beginPath();
  ctx.roundRect(titleX, 630, titleWidth, 62, 28);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title.toUpperCase(), canvas.width / 2, 670, titleWidth - 50);

  ctx.fillStyle = '#DCC7FF';
  ctx.font = '900 30px Inter, Arial';
  ctx.fillText('YOUR VIBE', canvas.width / 2, 820);

  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.font = '700 30px Inter, Arial';
  const afterDescriptionY = wrapCanvasText(ctx, description || buildLocalPersonalityDescription(user.traits), canvas.width / 2, 890, 830, 44);

  traitNames.slice(0, 3).forEach((traitName, index) => {
    const y = Math.max(1190, afterDescriptionY + 50) + index * 118;
    ctx.fillStyle = 'rgba(30,16,46,0.92)';
    ctx.beginPath();
    ctx.roundRect(110, y, 860, 94, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,199,255,0.58)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#DCC7FF';
    ctx.font = '900 26px Inter, Arial';
    ctx.fillText(`#${index + 1}`, 160, y + 58);
    ctx.fillStyle = '#FFFFFF';
    setFittedCanvasFont(ctx, traitName, 620, 31, 24, '900');
    ctx.fillText(traitName, 290, y + 60, 620);
    ctx.textAlign = 'center';
  });

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px Inter, Arial';
  ctx.fillText('VibeBatch', canvas.width / 2, 1728);
  ctx.fillStyle = 'rgba(220,199,255,0.78)';
  ctx.font = '900 20px Inter, Arial';
  ctx.fillText('YOUR PERSONA THROUGH A DIGITAL LENS.', canvas.width / 2, 1786);

  downloadCanvasAsPng(canvas, `vibebatch-premium-${user.username || 'personality-card'}.png`);
};

function PremiumScreen({ user, onBack }: { user: UserProfile; onBack: () => void }) {
  const premium = isPremiumUser(user);
  const topTraits = getPositiveTraits(user.traits).slice(0, 3);
  const [description, setDescription] = useState(buildLocalPersonalityDescription(user.traits));
  const [previewBackground, setPreviewBackground] = useState(() => PREMIUM_STORY_BACKGROUNDS[Math.floor(Math.random() * PREMIUM_STORY_BACKGROUNDS.length)] || PREMIUM_STORY_BACKGROUNDS[0]);
  const votedFriends = user.friends.filter(friend => friend.hasVoted);
  const hints = votedFriends.slice(0, 6).map((friend, index) => ({
    id: friend.id,
    duration: getFriendshipLengthLabel(friend.relationshipLength),
    trait: topTraits[index % Math.max(topTraits.length, 1)]?.name || 'Emerging trait',
    sharedTrait: getPositiveTraits(friend.traits || [])
      .slice(0, 3)
      .find(friendTrait => topTraits.some(userTrait => normalizeTraitName(userTrait.name) === normalizeTraitName(friendTrait.name)))?.name || '',
  }));

  useEffect(() => {
    let cancelled = false;
    generatePersonalityDescription(topTraits.length ? topTraits : user.traits)
      .then(text => {
        if (!cancelled) setDescription(text || buildLocalPersonalityDescription(user.traits));
      })
      .catch(() => {
        if (!cancelled) setDescription(buildLocalPersonalityDescription(user.traits));
      });

    return () => {
      cancelled = true;
    };
  }, [user.id, user.traits]);

  const downloadPremiumStoryCard = async () => {
    const background = getNextPremiumBackground();
    setPreviewBackground(background);
    try {
      await downloadPremiumStoryCardPng(user, description, background);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Could not download the personality card.');
    }
  };

  if (!premium) {
    return (
      <div className="min-h-screen p-4 pb-24 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack}><ChevronLeft /></button>
          <div>
            <h2 className="text-xl font-bold font-display flex items-center gap-2"><Crown size={20} /> VibeBatch Premium</h2>
            <p className="text-xs text-accent font-bold uppercase tracking-[0.18em] mt-1">Unlock private insight tools</p>
          </div>
        </div>

        <section className="card-surface p-6 mb-6">
          <p className="text-xs text-accent font-black uppercase tracking-[0.2em] mb-3">Monthly Pass</p>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-5xl font-black font-display">₹199</span>
            <span className="text-white/45 font-bold mb-2">/ month</span>
          </div>
          <Button onClick={() => alert('Payments are coming soon.')} className="flex items-center justify-center gap-2">
            <Crown size={18} /> Buy VibeBatch Premium
          </Button>
        </section>

        <section className="card-surface p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/55 mb-4">What Premium Includes</h3>
          <div className="space-y-3">
            {[
              'Anonymous hints about which friend signal connects to each trait.',
              'Shared top-trait clues when you and a friend have a top trait in common.',
              'AI-made personality insight based on your voted traits.',
              'Premium personality card with visual backgrounds and stacked top traits.',
              'Downloadable premium card for sharing outside VibeBatch.',
            ].map(feature => (
              <div key={feature} className="flex items-start gap-3 rounded-xl bg-background/40 border border-accent/15 p-3">
                <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-white/75 leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2"><Crown size={20} /> VibeBatch Premium</h2>
          <p className="text-xs text-accent font-bold uppercase tracking-[0.18em] mt-1">Private insight studio</p>
        </div>
      </div>

      <section className="card-surface p-5 mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Anonymous Trait Hints</h3>
        <div className="space-y-3">
          {hints.length > 0 ? hints.map((hint, index) => (
            <div key={`${hint.id}-${index}`} className="flex items-center justify-between gap-4 bg-background/40 border border-accent/15 rounded-xl p-3">
              <div className="min-w-0">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Anonymous friend signal</p>
                <p className="font-bold truncate">{hint.duration}</p>
                {hint.sharedTrait && (
                  <p className="text-xs text-accent/80 font-bold mt-1">Shared top trait: {hint.sharedTrait}</p>
                )}
              </div>
              <Badge color="accent">{hint.trait}</Badge>
            </div>
          )) : (
            <p className="text-sm text-white/45">Anonymous hints appear after eligible friends vote.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Personality Card</h3>
        <div
          className="mx-auto w-full max-w-[340px] aspect-[9/16] rounded-[28px] border border-accent/25 p-5 flex flex-col items-center shadow-2xl shadow-black/25 relative overflow-hidden"
        >
          <img src={previewBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/25 to-background/55 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0_24%,rgba(255,255,255,0.04)_31%,transparent_39%),repeating-linear-gradient(120deg,rgba(255,255,255,0.012)_0_1px,transparent_1px_16px)] pointer-events-none" />
          <div className="gradient-button !py-1 !px-5 text-[8px] font-black uppercase tracking-widest z-10 mt-6">Premium</div>
          {user.avatar ? (
            <img src={user.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-accent mt-4 relative z-10" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface border border-accent/30 flex items-center justify-center mt-4 relative z-10">
              <Crown size={24} />
            </div>
          )}
          <div className="text-center mt-4 relative z-10 w-full min-w-0">
            <p className="text-[clamp(1rem,4.8vw,1.35rem)] leading-tight font-black font-display truncate px-1">{user.username ? `@${user.username}` : user.displayName}</p>
            <div className="inline-block max-w-full gradient-button !py-1.5 !px-4 mt-2 text-[8px] font-black uppercase tracking-[0.12em] truncate">{user.identityTitle || 'Identity Locked'}</div>
          </div>
          <p className="relative z-10 mt-6 text-[10px] font-black tracking-widest uppercase text-accent">Your Vibe</p>
          <p className="relative z-10 text-[10px] sm:text-[11px] text-white/90 leading-relaxed text-center mt-2 px-1">{description}</p>
          <div className="relative z-10 w-full mt-3 space-y-2">
            {topTraits.map((trait, index) => (
              <div key={trait.id || trait.name} className="flex items-center gap-3 rounded-xl bg-surface/90 border border-accent/50 px-4 py-2.5">
                <span className="text-[10px] font-black text-accent w-8">#{index + 1}</span>
                <span className="text-[11px] font-black text-white truncate">{trait.name}</span>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-auto pt-3 text-center">
            <p className="text-xl font-black font-display">VibeBatch</p>
            <p className="text-[8px] text-white/40 uppercase tracking-[0.22em] font-bold mt-1">Your Persona through a Digital Lens.</p>
          </div>
        </div>
        <Button onClick={downloadPremiumStoryCard} variant="secondary" className="mt-4 max-w-sm mx-auto flex items-center justify-center gap-2">
          <Download size={18} /> Download Personality Card
        </Button>
      </section>
    </div>
  );
}

function PublicProfileScreen({ user, onBack, onVote }: any) {
  const topTraits = getPositiveTraits(user.traits || []).slice(0, 3);
  const effectiveTotalVotes = getTraitVoteTotal(user.traits || [], user.totalVotes);
  const friendsCount = Array.isArray(user.friends) ? user.friends.length : 0;

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full flex justify-start mb-4">
         <button onClick={onBack} className="p-2 bg-surface rounded-full"><ChevronLeft /></button>
      </div>
      
      <Card className="w-full max-w-sm mt-8 flex flex-col items-center p-8 space-y-6">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-accent shadow-2xl shadow-accent/20" alt="" />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center bg-surface text-white/20 shadow-2xl shadow-accent/5">
              <Sparkles size={48} />
            </div>
          )}
          {user.identityTitle && <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] glowing-accent font-bold">{user.identityTitle}</Badge>}
        </div>
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-display">{user.displayName}</h2>
          <p className="text-white/40 text-sm font-medium tracking-wide">@{user.username}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {topTraits.map(t => (
            <Badge key={t.id} color="pink" className="px-3 py-1 text-[10px]">{t.name}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-6 py-4 border-y border-white/5 w-full justify-center">
           <div className="text-center">
             <p className="text-xl font-bold font-display">{effectiveTotalVotes}</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Votes</p>
           </div>
           <div className="w-px h-8 bg-white/5" />
           <div className="text-center">
             <p className="text-xl font-bold font-display">{friendsCount}</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Friends</p>
           </div>
        </div>

        <Button className="py-4" onClick={onVote}>Vote for {user.displayName}'s traits →</Button>
        <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
           <Share2 size={14} /> Share profile
        </button>
      </Card>
      
      <div className="mt-auto py-8">
        <h1 className="text-xl font-display font-bold text-gradient opacity-40">VibeBatch</h1>
      </div>
    </div>
  );
}

function StoryCardGeneratorScreen({ user, onBack }: any) {
  const topTraits = getPositiveTraits(user.traits).slice(0, 3);
  const hasVotes = topTraits.length > 0;

  const downloadStoryCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const background = '#1E1231';
    const accent = '#DCC7FF';

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(540, 0, 80, 540, 0, 1100);
    gradient.addColorStop(0, 'rgba(233,137,208,0.32)');
    gradient.addColorStop(0.46, 'rgba(220,199,255,0.20)');
    gradient.addColorStop(1, 'rgba(30,18,49,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const lowerGlow = ctx.createRadialGradient(900, 1680, 40, 900, 1680, 720);
    lowerGlow.addColorStop(0, 'rgba(116,99,216,0.22)');
    lowerGlow.addColorStop(1, 'rgba(30,18,49,0)');
    ctx.fillStyle = lowerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = vbLogo;
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
      });
      ctx.drawImage(logo, 72, 72, 118, 118);
    } catch {
      // The story card still works if the decorative logo cannot be drawn.
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px Inter, Arial';
    ctx.fillText(user.username ? `@${user.username}` : (user.displayName || 'Your Name'), canvas.width / 2, 680);

    const title = user.identityTitle || 'IDENTITY LOCKED';
    ctx.font = '900 24px Inter, Arial';
    const titleWidth = Math.min(ctx.measureText(title).width + 100, 520);
    const titleX = canvas.width / 2 - titleWidth / 2;
    const titleGradient = ctx.createLinearGradient(titleX, 724, titleX + titleWidth, 784);
    titleGradient.addColorStop(0, '#F5D7FF');
    titleGradient.addColorStop(0.52, '#DCC7FF');
    titleGradient.addColorStop(1, '#E989D0');
    ctx.fillStyle = titleGradient;
    ctx.beginPath();
    ctx.roundRect(titleX, 718, titleWidth, 62, 31);
    ctx.fill();
    ctx.fillStyle = '#1E1231';
    ctx.fillText(title.toUpperCase(), canvas.width / 2, 758, titleWidth - 56);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 430, 150, 0, Math.PI * 2);
    ctx.stroke();

    if (user.avatar) {
      try {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = user.avatar;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 430, 138, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, canvas.width / 2 - 138, 292, 276, 276);
        ctx.restore();
      } catch {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 430, 138, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (hasVotes) topTraits.forEach((trait, index) => {
      const y = 890 + index * 154;
      const traitGradient = ctx.createLinearGradient(170, y, 910, y + 124);
      traitGradient.addColorStop(0, index === 0 ? 'rgba(233,137,208,0.22)' : 'rgba(220,199,255,0.13)');
      traitGradient.addColorStop(1, 'rgba(43,26,61,0.76)');
      ctx.fillStyle = traitGradient;
      ctx.roundRect(150, y, 780, 124, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,199,255,0.24)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = '900 28px Inter, Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`#${index + 1}`, 206, y + 74);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 34px Inter, Arial';
      ctx.fillText(trait.name || 'Trait', 300, y + 76, 560);
      ctx.textAlign = 'center';
    });

    if (!hasVotes) [0, 1, 2].forEach((index) => {
      const y = 890 + index * 154;
      ctx.fillStyle = 'rgba(220,199,255,0.08)';
      ctx.roundRect(150, y, 780, 124, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,199,255,0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(220,199,255,0.22)';
      ctx.font = '900 28px Inter, Arial';
      ctx.fillText(`#${index + 1}`, 230, y + 74);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.roundRect(320, y + 58, 360, 12, 6);
      ctx.fill();
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 72px Inter, Arial';
    ctx.fillText('VibeBatch', canvas.width / 2, 1608);
    ctx.fillStyle = 'rgba(220,199,255,0.86)';
    ctx.font = '900 24px Inter, Arial';
    ctx.fillText('YOUR PERSONA THROUGH A DIGITAL LENS.', canvas.width / 2, 1672);

    const link = document.createElement('a');
    link.download = `vibebatch-${user.username || 'story-card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
       <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Story Card</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Story Card Preview */}
        <div id="story-card" className="w-[340px] aspect-[9/16] bg-background rounded-[32px] overflow-hidden border border-accent/25 relative p-6 flex flex-col items-center justify-between shadow-2xl shadow-black/30">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(233,137,208,0.26),transparent_42%),radial-gradient(circle_at_95%_85%,rgba(116,99,216,0.22),transparent_38%),linear-gradient(180deg,#2A183C_0%,#1E1231_55%,#160B25_100%)] pointer-events-none" />
           <img src={vbLogo} alt="" className="absolute top-4 left-4 z-20 w-10 h-10 object-contain" />
           
           <div className="mt-16 flex flex-col items-center space-y-8 relative z-10 w-full">
             {user.avatar ? (
               <img src={user.avatar} className="w-28 h-28 rounded-full border-4 border-accent object-cover" alt="" />
             ) : (
               <div className="w-28 h-28 rounded-full border-4 border-white/10 flex items-center justify-center bg-surface text-white/20">
                 <Sparkles size={48} />
               </div>
             )}
             <div className="text-center space-y-3">
               <h3 className="text-2xl font-bold font-display tracking-tight">{user.username ? `@${user.username}` : (user.displayName || "Your Name")}</h3>
               {user.identityTitle ? (
                 <div className="inline-block gradient-button !py-1.5 !px-4 text-[9px] font-black uppercase tracking-[0.1em]">
                   {user.identityTitle}
                 </div>
               ) : (
                 <div className="inline-block bg-white/5 border border-white/10 text-white/40 px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                   Identity Locked
                 </div>
               )}
             </div>
             
             <div className="flex flex-col gap-2 w-full">
               {hasVotes ? topTraits.map((t, i) => (
                 <div key={t.id} className="bg-surface/70 backdrop-blur-md border border-accent/25 rounded-xl p-3 flex items-center gap-3 min-w-0 shadow-lg shadow-black/10">
                    <span className="text-[10px] font-black text-accent uppercase tracking-tighter w-8 shrink-0">#{i+1}</span>
                    <span className="text-[11px] font-bold text-white truncate flex-1">{t.name}</span>
                 </div>
               )) : (
                 [1,2,3].map(i => (
                    <div key={i} className="bg-surface/40 border border-accent/15 rounded-xl p-3 flex items-center gap-3 opacity-50">
                       <span className="text-[9px] font-black text-accent uppercase tracking-tighter w-8">#{i}</span>
                       <div className="h-1.5 bg-white/10 rounded-full flex-1" />
                    </div>
                 ))
               )}
             </div>
           </div>
           <div className="h-8 relative z-10" />
           <div className="absolute bottom-8 left-6 right-6 z-10 text-center">
             <h1 className="text-3xl font-display font-black text-white leading-none">VibeBatch</h1>
             <p className="text-[9px] text-accent/85 uppercase tracking-[0.24em] font-black mt-3">Your Persona through a Digital Lens.</p>
           </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button className="flex items-center justify-center gap-3" onClick={downloadStoryCard}>
           <Download size={20} /> Download (Free)
        </Button>
      </div>
    </div>
  );
}
