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

export interface SponsoredSignal {
  id: string;
  companyName: string;
  companyLogo?: string;
  traitName: string;
  message?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Friend {
  id: string;
  username?: string;
  displayName: string;
  avatar: string;
  friendshipDate: string; // ISO string
  hasVoted: boolean;
  relationshipLength?: string;
  friendRelationshipLength?: string;
  isVoteEligible?: boolean;
  traits?: Trait[];
  totalVotes?: number;
  messagesCount: number;
  status: 'online' | 'offline';
  messages: ChatMessage[];
  isMuted?: boolean;
  blockedByMe?: boolean;
  blockedMe?: boolean;
  sponsoredSignals?: SponsoredSignal[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  createdAt?: string;
  contactNumber: string;
  avatar: string;
  isPremium: boolean;
  traits: Trait[];
  identityTitle?: string;
  sponsoredSignals?: SponsoredSignal[];
  friends: Friend[];
  totalVotes: number;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export const PREDEFINED_TRAITS: Partial<Trait>[] = [
  { name: 'Adaptive Ace', category: 'predefined' },
  { name: 'Adventurous Soul', category: 'predefined' },
  { name: 'Ambition Architect', category: 'predefined' },
  { name: 'Analytical Mind', category: 'predefined' },
  { name: 'Approachable Aura', category: 'predefined' },
  { name: 'Articulate Genius', category: 'predefined' },
  { name: 'Artistic Visionary', category: 'predefined' },
  { name: 'Assertive Leader', category: 'predefined' },
  { name: 'Attentive Observer', category: 'predefined' },
  { name: 'Authentic Spirit', category: 'predefined' },
  { name: 'Balanced Master', category: 'predefined' },
  { name: 'Bold Maverick', category: 'predefined' },
  { name: 'Brainy Wizard', category: 'predefined' },
  { name: 'Bright Spark', category: 'predefined' },
  { name: 'Calm Sage', category: 'predefined' },
  { name: 'Capable Commander', category: 'predefined' },
  { name: 'Carefree Wanderer', category: 'predefined' },
  { name: 'Caring Guardian', category: 'predefined' },
  { name: 'Casual Vibes', category: 'predefined' },
  { name: 'Charismatic Icon', category: 'predefined' },
  { name: 'Charming Star', category: 'predefined' },
  { name: 'Cheerful Beam', category: 'predefined' },
  { name: 'Clever Fox', category: 'predefined' },
  { name: 'Collaborative Captain', category: 'predefined' },
  { name: 'Collected Monk', category: 'predefined' },
  { name: 'Compassionate Heart', category: 'predefined' },
  { name: 'Confident Titan', category: 'predefined' },
  { name: 'Conscious Thinker', category: 'predefined' },
  { name: 'Consistent Force', category: 'predefined' },
  { name: 'Conversational Pro', category: 'predefined' },
  { name: 'Cool-headed Strategist', category: 'predefined' },
  { name: 'Courageous Warrior', category: 'predefined' },
  { name: 'Creative Genius', category: 'predefined' },
  { name: 'Curious Explorer', category: 'predefined' },
  { name: 'Daring Rebel', category: 'predefined' },
  { name: 'Decisive Commander', category: 'predefined' },
  { name: 'Deep Thinker', category: 'predefined' },
  { name: 'Detail Wizard', category: 'predefined' },
  { name: 'Determined Beast', category: 'predefined' },
  { name: 'Devoted Ally', category: 'predefined' },
  { name: 'Diplomatic Maestro', category: 'predefined' },
  { name: 'Disciplined Machine', category: 'predefined' },
  { name: 'Down-to-earth Legend', category: 'predefined' },
  { name: 'Driven Achiever', category: 'predefined' },
  { name: 'Dynamic Dynamo', category: 'predefined' },
  { name: 'Easygoing Soul', category: 'predefined' },
  { name: 'Efficient Operator', category: 'predefined' },
  { name: 'Eloquent Speaker', category: 'predefined' },
  { name: 'Emotionally Intelligent Guide', category: 'predefined' },
  { name: 'Empathetic Angel', category: 'predefined' },
  { name: 'Empowering Mentor', category: 'predefined' },
  { name: 'Energetic Pulse', category: 'predefined' },
  { name: 'Engaging Charmer', category: 'predefined' },
  { name: 'Enlightened Monk', category: 'predefined' },
  { name: 'Enthusiastic Spark', category: 'predefined' },
  { name: 'Ethical Mind', category: 'predefined' },
  { name: 'Expressive Artist', category: 'predefined' },
  { name: 'Fearless Knight', category: 'predefined' },
  { name: 'Flexible Flow', category: 'predefined' },
  { name: 'Focused Hunter', category: 'predefined' },
  { name: 'Formal Gentleman', category: 'predefined' },
  { name: 'Free-spirited Nomad', category: 'predefined' },
  { name: 'Friendly Buddy', category: 'predefined' },
  { name: 'Fun Creator', category: 'predefined' },
  { name: 'Futuristic Dreamer', category: 'predefined' },
  { name: 'Gentle Giant', category: 'predefined' },
  { name: 'Genuine Soul', category: 'predefined' },
  { name: 'Goal-oriented Hustler', category: 'predefined' },
  { name: 'Graceful Swan', category: 'predefined' },
  { name: 'Grounded Sage', category: 'predefined' },
  { name: 'Harmonious Spirit', category: 'predefined' },
  { name: 'Helpful Hero', category: 'predefined' },
  { name: 'Honest Voice', category: 'predefined' },
  { name: 'Hopeful Dreamer', category: 'predefined' },
  { name: 'Humble King', category: 'predefined' },
  { name: 'Humorous Legend', category: 'predefined' },
  { name: 'Idealistic Visionary', category: 'predefined' },
  { name: 'Imaginative Creator', category: 'predefined' },
  { name: 'Independent Wolf', category: 'predefined' },
  { name: 'Insightful Oracle', category: 'predefined' },
  { name: 'Inspirational Leader', category: 'predefined' },
  { name: 'Intellectual Titan', category: 'predefined' },
  { name: 'Intelligent Strategist', category: 'predefined' },
  { name: 'Intuitive Mystic', category: 'predefined' },
  { name: 'Inventive Mind', category: 'predefined' },
  { name: 'Joyful Spirit', category: 'predefined' },
  { name: 'Keen Observer', category: 'predefined' },
  { name: 'Kind Soul', category: 'predefined' },
  { name: 'Knowledgeable Guru', category: 'predefined' },
  { name: 'Laid-back Vibes', category: 'predefined' },
  { name: 'Level-headed Captain', category: 'predefined' },
  { name: 'Lighthearted Joker', category: 'predefined' },
  { name: 'Logical Architect', category: 'predefined' },
  { name: 'Loyal Companion', category: 'predefined' },
  { name: 'Magnetic Aura', category: 'predefined' },
  { name: 'Mature Mentor', category: 'predefined' },
  { name: 'Meaningful Presence', category: 'predefined' },
  { name: 'Methodical Planner', category: 'predefined' },
  { name: 'Meticulous Craftsman', category: 'predefined' },
  { name: 'Mindful Monk', category: 'predefined' },
  { name: 'Minimalist Creator', category: 'predefined' },
  { name: 'Motivated Grinder', category: 'predefined' },
  { name: 'Motivational Coach', category: 'predefined' },
  { name: 'Natural Leader', category: 'predefined' },
  { name: 'Neutral Observer', category: 'predefined' },
  { name: 'Noble Guardian', category: 'predefined' },
  { name: 'Objective Analyst', category: 'predefined' },
  { name: 'Observant Hawk', category: 'predefined' },
  { name: 'Open-minded Explorer', category: 'predefined' },
  { name: 'Optimistic Dreamer', category: 'predefined' },
  { name: 'Organized Genius', category: 'predefined' },
  { name: 'Original Maverick', category: 'predefined' },
  { name: 'Outgoing Star', category: 'predefined' },
  { name: 'Passionate Creator', category: 'predefined' },
  { name: 'Patient Guide', category: 'predefined' },
  { name: 'Peaceful Monk', category: 'predefined' },
  { name: 'Perceptive Visionary', category: 'predefined' },
  { name: 'Persistent Warrior', category: 'predefined' },
  { name: 'Philosophical Sage', category: 'predefined' },
  { name: 'Playful Trickster', category: 'predefined' },
  { name: 'Poised Royalty', category: 'predefined' },
  { name: 'Polished Professional', category: 'predefined' },
  { name: 'Positive Energy', category: 'predefined' },
  { name: 'Practical Thinker', category: 'predefined' },
  { name: 'Precise Sniper', category: 'predefined' },
  { name: 'Proactive Builder', category: 'predefined' },
  { name: 'Professional Expert', category: 'predefined' },
  { name: 'Progressive Innovator', category: 'predefined' },
  { name: 'Protective Shield', category: 'predefined' },
  { name: 'Quick-witted Wizard', category: 'predefined' },
  { name: 'Quiet Storm', category: 'predefined' },
  { name: 'Quirky Genius', category: 'predefined' },
  { name: 'Radiant Soul', category: 'predefined' },
  { name: 'Rational Thinker', category: 'predefined' },
  { name: 'Realistic Strategist', category: 'predefined' },
  { name: 'Reflective Philosopher', category: 'predefined' },
  { name: 'Relaxed Vibes', category: 'predefined' },
  { name: 'Reliable Anchor', category: 'predefined' },
  { name: 'Resilient Fighter', category: 'predefined' },
  { name: 'Resourceful Survivor', category: 'predefined' },
  { name: 'Respectful Gentleman', category: 'predefined' },
  { name: 'Scholarly Sage', category: 'predefined' },
  { name: 'Self-aware Master', category: 'predefined' },
  { name: 'Self-disciplined Warrior', category: 'predefined' },
  { name: 'Sensible Mind', category: 'predefined' },
  { name: 'Sharp Shooter', category: 'predefined' },
  { name: 'Simple Soul', category: 'predefined' },
  { name: 'Sincere Heart', category: 'predefined' },
  { name: 'Skillful Creator', category: 'predefined' },
  { name: 'Smart Maverick', category: 'predefined' },
  { name: 'Social Butterfly', category: 'predefined' },
  { name: 'Sophisticated Icon', category: 'predefined' },
  { name: 'Speedy Flash', category: 'predefined' },
  { name: 'Spirited Flame', category: 'predefined' },
  { name: 'Stable Force', category: 'predefined' },
  { name: 'Strategic Commander', category: 'predefined' },
  { name: 'Stoic Warrior', category: 'predefined' },
  { name: 'Strong-willed Titan', category: 'predefined' },
  { name: 'Structured Planner', category: 'predefined' },
  { name: 'Supportive Ally', category: 'predefined' },
  { name: 'Sympathetic Listener', category: 'predefined' },
  { name: 'Tactful Diplomat', category: 'predefined' },
  { name: 'Thoughtful Mind', category: 'predefined' },
  { name: 'Thriving Champion', category: 'predefined' },
  { name: 'Tranquil Spirit', category: 'predefined' },
  { name: 'Trustworthy Guardian', category: 'predefined' },
  { name: 'Unbiased Judge', category: 'predefined' },
  { name: 'Understanding Soul', category: 'predefined' },
  { name: 'Unique Visionary', category: 'predefined' },
  { name: 'Unstoppable Force', category: 'predefined' },
  { name: 'Unyielding Titan', category: 'predefined' },
  { name: 'Uplifting Energy', category: 'predefined' },
  { name: 'Versatile Genius', category: 'predefined' },
  { name: 'Vibrant Soul', category: 'predefined' },
  { name: 'Visionary Architect', category: 'predefined' },
  { name: 'Warm Presence', category: 'predefined' },
  { name: 'Welcoming Aura', category: 'predefined' },
  { name: 'Wise Owl', category: 'predefined' },
  { name: 'Witty Wizard', category: 'predefined' },
  { name: 'Zen Master', category: 'predefined' },
];

export const SPONSORED_TRAITS: Partial<Trait>[] = [];
