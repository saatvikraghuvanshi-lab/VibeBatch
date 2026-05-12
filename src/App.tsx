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
} from 'lucide-react';
import { UserProfile, AuthState, Trait, Friend, PREDEFINED_TRAITS, ChatMessage } from '../lib/types';
import { getStore, saveStore } from '../lib/store';
import { generateIdentityTitle } from '../lib/gemini';

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
    accent: "bg-accent/10 text-accent border border-accent/30",
    green: "bg-green-500/10 text-green-500 border border-green-500/30",
    amber: "bg-amber-500/10 text-amber-500 border border-amber-500/30",
    pink: "bg-pink-500/10 text-pink-500 border border-pink-500/30",
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

const isEligibleLength = (value?: string) => (
  FRIENDSHIP_LENGTH_OPTIONS.some(option => option.value === value && option.eligible)
);

const getFriendshipLengthLabel = (value?: string) => (
  FRIENDSHIP_LENGTH_OPTIONS.find(option => option.value === value)?.label || 'Choose duration'
);

const normalizeTraitName = (value: any) => String(value || '').trim().toLowerCase();

const mapSupabaseTraits = (rows: any[] = []) => {
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
  const traits = mapSupabaseTraits(profile.traits || []);
  const totalVotes = profile.total_votes || traits.reduce((sum, trait) => sum + (trait.votes || 0), 0);

  return ({
  id: profile.id,
  username: profile.username,
  displayName: profile.display_name || profile.username || 'New friend',
  avatar: profile.avatar_url || '',
  friendshipDate: link?.created_at || new Date().toISOString(),
  hasVoted: Boolean(link?.has_voted),
  relationshipLength,
  friendRelationshipLength,
  isVoteEligible,
  traits,
  totalVotes,
  messagesCount: 0,
  status: 'offline',
  messages: [],
  });
};

const mapProfileToUser = (profile: any, friends: Friend[] = []): UserProfile => {
  const traits = mapSupabaseTraits(profile.traits || []);
  const totalVotes = profile.total_votes || traits.reduce((sum, trait) => sum + (trait.votes || 0), 0);

  return ({
    ...profile,
    displayName: profile.display_name || profile.displayName || profile.username || 'VibeBatch user',
    username: profile.username || '',
    email: profile.email || '',
    contactNumber: profile.contact_number || profile.contactNumber || '',
    avatar: profile.avatar_url || profile.avatar || '',
    isPremium: Boolean(profile.is_premium || profile.isPremium),
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
    return () => {
      if (signupAvatarPreview) URL.revokeObjectURL(signupAvatarPreview);
    };
  }, [signupAvatarPreview]);

  const handleSignupAvatarChange = (file: File | null) => {
    if (signupAvatarPreview) URL.revokeObjectURL(signupAvatarPreview);
    setSignupAvatarFile(file);
    setSignupAvatarPreview(file ? URL.createObjectURL(file) : '');
  };

  const refreshFriends = async (userId: string) => {
    const { data: links, error: linksError } = await supabase
      .from('friendships')
      .select('friend_id, relationship_length, has_voted, created_at')
      .eq('user_id', userId);

    if (linksError) {
      console.warn('Could not load friends yet:', linksError.message);
      return [];
    }

    const friendIds = (links || []).map((link: any) => link.friend_id);
    if (friendIds.length === 0) return [];

    const { data: reverseLinks, error: reverseLinksError } = await supabase
      .from('friendships')
      .select('user_id, friend_id, relationship_length')
      .in('user_id', friendIds)
      .eq('friend_id', userId);

    if (reverseLinksError) throw reverseLinksError;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*, traits(*)')
      .in('id', friendIds);

    if (profilesError) throw profilesError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.warn('Could not load messages yet:', messagesError.message);
    }

    return (profiles || []).map((profile: any) => {
      const link = links?.find((item: any) => item.friend_id === profile.id);
      const reverseLink = reverseLinks?.find((item: any) => item.user_id === profile.id);
      const friend = mapProfileToFriend(profile, link, reverseLink);
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
        messagesCount: friendMessages.filter((message: ChatMessage) => !message.isRead && message.senderId !== 'me').length,
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

      setFriendDetails({
        ...friend,
        username: profile.username || friend.username,
        displayName: profile.display_name || friend.displayName,
        avatar: profile.avatar_url || friend.avatar,
        traits: mapSupabaseTraits(profile.traits || []),
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

    const friends = await refreshFriends(userId);
    return mapProfileToUser(profile, friends);
  };

  const refreshCurrentUserProfile = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) return;

    try {
      const user = await loadCurrentUserProfile(userId);
      if (!user) return;

      setAuthState(prev => ({
        ...prev,
        user: prev.user?.id === userId ? user : prev.user,
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
      const mappedTraits = mapSupabaseTraits(data.traits || []);
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
          user: mapProfileToUser(profile, friends),
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

    try {
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
      alert(err.message);
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

  const sendMessage = async (friendId: string, text: string) => {
    if (!authState.user) return;
    
    const { data: insertedMessage, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: authState.user.id,
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
        preview: text.slice(0, 140),
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

  const updateIdentity = async () => {
    if (!authState.user) return;
    setLoading(true);
    try {
      const title = await generateIdentityTitle(authState.user.traits);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, identityTitle: title } : null
      }));
    } catch (error) {
      console.error("Failed to generate title", error);
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

  const AuthScreen = ({ onLogin, onSignup, isLoginView, setIsLoginView, loading, avatarPreview, onAvatarChange }: any) => (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center gap-8 py-12">
        <div className="text-center space-y-2">
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
              <button type="button" className="text-accent text-sm font-medium hover:underline">Forgot password?</button>
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
              <input name="contact" type="tel" placeholder="Contact Number" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" />
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

    const topTraits = [...user.traits].sort((a, b) => b.votes - a.votes).slice(0, 3);
    const eligibleFriends = user.friends.filter(f => f.isVoteEligible && !f.hasVoted);
    const votedFriends = user.friends.filter(f => f.hasVoted);
    const lockedFriends = user.friends.filter(f => !f.isVoteEligible);

    return (
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col px-4 py-4 pb-28 lg:p-6 bg-background overflow-x-hidden">
        {/* Header - Desktop & Mobile */}
        <header className="flex justify-between items-start xl:items-center mb-5 lg:mb-8 max-w-7xl mx-auto w-full min-w-0 gap-4">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-display font-extrabold text-gradient leading-none truncate">VibeBatch</h1>
            <p className="mt-2 max-w-[220px] sm:max-w-none text-[11px] lg:text-xs text-accent font-bold tracking-[0.18em] uppercase leading-relaxed">Your persona in chrome, glow, and receipts.</p>
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
            <div className="lg:hidden flex flex-col items-center py-4 space-y-4">
                <div className="relative">
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
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap gradient-button text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                      {user.identityTitle}
                    </div>
                  ) : (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface text-white/40 text-[7px] font-bold px-3 py-1.5 border border-white/10 rounded-full uppercase tracking-tighter shadow-xl">
                      Vote on 3+ traits to unlock
                    </div>
                  )}
                </div>
               <div className="text-center pt-4">
                 <h2 className="text-xl font-bold font-display">{user.displayName}</h2>
                 <p className="text-accent text-xs">@{user.username}</p>
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
                {user.totalVotes > 0 ? topTraits.map((trait, i) => (
                  <div key={trait.id} className="stat-item border-accent/20">
                    <span className="text-2xl block mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <p className="text-xs font-extrabold uppercase mb-1 tracking-tight truncate w-full">{trait.name}</p>
                    <p className="text-lg font-display font-black text-accent">{Math.round((trait.votes / user.totalVotes) * 100 || 0)}%</p>
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
                  {[...user.traits].sort((a,b) => b.votes - a.votes).slice(0, 8).map(trait => (
                    <TraitRow key={trait.id} trait={trait} total={user.totalVotes} />
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
    const items = [
      { label: 'Friends', description: 'Manage friends, invite links, and chats', icon: <Users size={22} />, screen: 'friends' },
      { label: 'Traits', description: 'View your anonymous trait breakdown', icon: <Sparkles size={22} />, screen: 'traits' },
      { label: 'Eligibility', description: 'Check who can vote for your traits', icon: <Hourglass size={22} />, screen: 'hourglass' },
      { label: 'Vote Tracker', description: 'Track eligible, voted, and locked friends', icon: <BarChart3 size={22} />, screen: 'tracker' },
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
                    await Promise.all(traits.map(traitId => 
                      supabase.rpc('increment_trait_vote', { 
                        target_user_id: selectedFriend.id, 
                        trait_name: traitId 
                      })
                    ));

                    const { error: voteStateError } = await supabase
                      .from('friendships')
                      .update({ has_voted: true })
                      .eq('user_id', authState.user.id)
                      .eq('friend_id', selectedFriend.id);

                    if (voteStateError) throw voteStateError;

                    const updatedFriends = authState.user.friends.map(f => 
                      f.id === selectedFriend.id ? { ...f, hasVoted: true } : f
                    );
                    
                    setAuthState(prev => ({ 
                      ...prev, 
                      user: prev.user ? { ...prev.user, friends: updatedFriends } : null 
                    }));

                    setCurrentScreen('home');
                  } catch (err) {
                    console.error(err);
                    alert("Failed to send vibes.");
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
                className="bg-background/70 border border-white/10 rounded-xl p-4 text-center text-xs font-black uppercase tracking-wider hover:border-accent/40 hover:text-accent transition-colors"
              >
                {target.label}
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
  const top3 = sortedTraits.slice(0, 3);
  
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
        {user.totalVotes > 0 ? top3.map((trait, i) => (
          <div key={trait.id} className={`card-surface p-4 flex flex-col items-center justify-center text-center relative overflow-hidden ${i === 0 ? 'border-accent/40 shadow-lg shadow-accent/5' : ''} ${trait.category === 'sponsored' ? 'border-sponsored/40 bg-sponsored/5' : ''}`}>
             <span className={`text-2xl font-bold font-display mb-1 ${trait.category === 'sponsored' ? 'text-sponsored' : i === 0 ? 'text-accent' : i === 1 ? 'text-white/60' : 'text-white/40'}`}>#{i + 1}</span>
             <span className="text-xs font-bold block mb-1">{trait.name}</span>
             <Badge color={trait.category === 'sponsored' ? 'amber' : i === 0 ? 'accent' : 'pink'}>{Math.round((trait.votes / user.totalVotes) * 100)}%</Badge>
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
        <TraitCategory label="Predefined Traits" traits={sortedTraits.filter(t => t.category === 'predefined')} total={user.totalVotes} />
        <TraitCategory label="Sponsored Traits" traits={sortedTraits.filter(t => t.category === 'sponsored')} total={user.totalVotes} sponsored />
        <TraitCategory label="Custom Traits" traits={sortedTraits.filter(t => t.category === 'custom')} total={user.totalVotes} custom />
      </div>
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
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isCaptchadone, setIsCaptchaDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const traits = PREDEFINED_TRAITS.map(t => t.name!);

  const toggleTrait = (name: string) => {
    setSelectedTraits(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const submit = () => {
    if (!isCaptchadone) return;
    setSubmitted(true);
    setTimeout(() => {
      onVote(selectedTraits);
    }, 2000);
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
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Select their strongest traits</p>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto mb-8 pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {traits.map(trait => (
            <button 
              key={trait}
              onClick={() => toggleTrait(trait)}
              className={`p-4 card-surface font-bold text-sm transition-all text-center ${selectedTraits.includes(trait) ? 'bg-accent/20 border-accent text-accent glowing-accent' : 'hover:border-white/20'}`}
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

        <Button onClick={submit} disabled={selectedTraits.length === 0 || !isCaptchadone} variant="primary">
          Submit vote →
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

function ChatDetailScreen({ friend, onBack, onSendMessage }: any) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [friend.messages]);

  const send = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-background">
      <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button onClick={onBack}><ChevronLeft /></button>
        <div className="flex items-center gap-3">
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
              {friend.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
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
        {friend.messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.senderId === 'me' 
                ? 'bg-accent text-background font-medium rounded-tr-none shadow-lg shadow-accent/10' 
                : 'bg-surface border border-white/5 rounded-tl-none'
            }`}>
              {m.text}
              <p className={`text-[8px] mt-1 opacity-50 font-bold text-right ${m.senderId === 'me' ? 'text-black/60' : 'text-white/40'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-4 border-t border-white/5 bg-surface/30 shrink-0">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className="bg-accent text-background p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-accent/20"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileSheet({ user, onClose, onLogout, onUpdateTitle, onUpdatePhoto, onUpdateDisplayName, onDeleteAccount, onNavigate }: any) {
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
          <SheetOption icon={<Sparkles size={18} />} label="Manage custom traits" />
          <SheetOption icon={<Lock size={18} />} label="Reset password" />
          <SheetOption icon={<Download size={18} />} label="Download Story Card" onClick={() => onNavigate('storycard')} />
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

function PublicProfileScreen({ user, onBack, onVote }: any) {
  const topTraits = [...user.traits].sort((a, b) => b.votes - a.votes).slice(0, 3);
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
             <p className="text-xl font-bold font-display">{user.totalVotes}</p>
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
  const topTraits = [...user.traits].sort((a, b) => b.votes - a.votes).slice(0, 3);
  const hasVotes = Number(user.totalVotes || 0) > 0;

  const downloadStoryCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const background = '#09070F';
    const accent = '#E9C7FF';
    const violet = '#A875FF';
    const textMuted = 'rgba(255,255,255,0.48)';

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(540, 0, 80, 540, 0, 820);
    gradient.addColorStop(0, 'rgba(232,200,255,0.24)');
    gradient.addColorStop(0.55, 'rgba(168,117,255,0.12)');
    gradient.addColorStop(1, 'rgba(9,7,15,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px Inter, Arial';
    ctx.fillText(user.displayName || 'Your Name', canvas.width / 2, 680);

    const title = user.identityTitle || 'IDENTITY LOCKED';
    ctx.font = '900 24px Inter, Arial';
    const titleWidth = Math.min(ctx.measureText(title).width + 100, 520);
    const titleX = canvas.width / 2 - titleWidth / 2;
    const titleGradient = ctx.createLinearGradient(titleX, 724, titleX + titleWidth, 784);
    titleGradient.addColorStop(0, '#F5D7FF');
    titleGradient.addColorStop(1, '#A875FF');
    ctx.fillStyle = titleGradient;
    ctx.beginPath();
    ctx.roundRect(titleX, 718, titleWidth, 62, 31);
    ctx.fill();
    ctx.fillStyle = '#09070F';
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
      const x = 160 + index * 260;
      ctx.fillStyle = index === 0 ? 'rgba(232,200,255,0.14)' : 'rgba(255,255,255,0.06)';
      ctx.roundRect(x, 900, 220, 140, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = '900 30px Inter, Arial';
      ctx.fillText(`#${index + 1}`, x + 110, 950);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 24px Inter, Arial';
      ctx.fillText(trait.name || 'Trait', x + 110, 1008, 180);
    });

    if (!hasVotes) [0, 1, 2].forEach((index) => {
      const x = 160 + index * 260;
      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      ctx.roundRect(x, 900, 220, 140, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.font = '900 22px Inter, Arial';
      ctx.fillText(`#${index + 1}`, x + 110, 950);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.roundRect(x + 34, 982, 152, 10, 5);
      ctx.fill();
    });

    const brandGradient = ctx.createLinearGradient(360, 0, 720, 0);
    brandGradient.addColorStop(0, '#FFFFFF');
    brandGradient.addColorStop(0.55, '#F2D7FF');
    brandGradient.addColorStop(1, violet);
    ctx.fillStyle = brandGradient;
    ctx.font = '900 76px Inter, Arial';
    ctx.fillText('VibeBatch', canvas.width / 2, 1640);
    ctx.fillStyle = textMuted;
    ctx.font = '700 24px Inter, Arial';
    ctx.fillText('YOUR FRIENDS KNOW YOU BEST', canvas.width / 2, 1700);

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
        <div id="story-card" className="w-[340px] aspect-[9/16] bg-[#0B1020] rounded-[32px] overflow-hidden border border-white/10 relative p-6 flex flex-col items-center justify-between shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-none" />
           
           <div className="mt-16 flex flex-col items-center space-y-8 relative z-10 w-full">
             {user.avatar ? (
               <img src={user.avatar} className="w-28 h-28 rounded-full border-4 border-accent object-cover" alt="" />
             ) : (
               <div className="w-28 h-28 rounded-full border-4 border-white/10 flex items-center justify-center bg-surface text-white/20">
                 <Sparkles size={48} />
               </div>
             )}
             <div className="text-center space-y-3">
               <h3 className="text-2xl font-bold font-display tracking-tight">{user.displayName || "Your Name"}</h3>
               {user.identityTitle ? (
                 <div className="inline-block bg-accent text-background px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                   {user.identityTitle}
                 </div>
               ) : (
                 <div className="inline-block bg-white/5 border border-white/10 text-white/40 px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
                   Identity Locked
                 </div>
               )}
             </div>
             
             <div className="flex gap-2 w-full justify-center">
               {hasVotes ? topTraits.map((t, i) => (
                 <div key={t.id} className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px] font-black text-accent uppercase tracking-tighter truncate w-full text-center">#{i+1}</span>
                    <span className="text-[10px] font-bold text-white truncate w-full text-center">{t.name}</span>
                 </div>
               )) : (
                 [1,2,3].map(i => (
                    <div key={i} className="bg-surface/30 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 flex-1 min-w-0 opacity-40">
                       <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">#{i}</span>
                       <div className="w-full h-1 bg-white/10 rounded-full" />
                    </div>
                 ))
               )}
             </div>
           </div>

           <div className="mb-8 relative z-10 text-center space-y-2">
             <h1 className="text-2xl font-display font-bold text-gradient">VibeBatch</h1>
             <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-bold">Your friends know you best</p>
           </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button className="flex items-center justify-center gap-3" onClick={downloadStoryCard}>
           <Download size={20} /> Download (Free)
        </Button>
        <button className="w-full p-4 rounded-xl border border-accent/30 text-accent font-bold text-sm flex items-center justify-center gap-2 bg-accent/5">
           <Download size={18} /> Download Animated
           <Badge color="accent" className="ml-2 scale-75">Premium</Badge>
        </button>
      </div>
    </div>
  );
}

