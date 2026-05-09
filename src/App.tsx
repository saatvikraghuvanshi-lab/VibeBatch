/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
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
  Clock
} from 'lucide-react';
import { UserProfile, AuthState, Trait, Friend } from '../lib/types';
import { getStore, saveStore, createMockUser } from '../lib/store';
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

// --- App Root ---

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(getStore());
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false);

  useEffect(() => {
    saveStore(authState);
  }, [authState]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockUser = createMockUser({ displayName: "", username: "" });
      setAuthState({ user: mockUser, isAuthenticated: true });
      setLoading(false);
      setCurrentScreen('home');
    }, 1500);
  };

  const handleSignup = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    setTimeout(() => {
      const mockUser = createMockUser({ 
        displayName: formData.get('displayName') as string, 
        username: (formData.get('displayName') as string).toLowerCase().replace(/\s/g, ''),
        email: formData.get('email') as string,
        contactNumber: formData.get('contact') as string
      });
      setAuthState({ user: mockUser, isAuthenticated: true });
      setLoading(false);
      setCurrentScreen('home');
    }, 1500);
  };

  const logout = () => {
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

  // --- Screen Components ---

  const AuthScreen = () => (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center gap-8 py-12">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-display font-bold text-gradient tracking-tight">VibeBatch</h1>
          <p className="text-white/60 font-medium tracking-wide">How your friends really see you</p>
        </div>

        {isLoginView ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
              <input type="password" placeholder="Password" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
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
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="w-24 h-24 rounded-full bg-surface border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent/50 transition-colors">
                <Camera className="w-6 h-6 text-white/40" />
                <span className="text-[10px] text-white/40 uppercase font-bold">Upload</span>
              </div>
            </div>
            <div className="space-y-4">
              <input name="displayName" type="text" placeholder="Display Name" className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent/50 transition-colors" required />
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
    const eligibleFriends = user.friends.filter(f => !f.hasVoted);

    return (
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col p-4 lg:p-6 bg-background">
        {/* Header - Desktop & Mobile */}
        <header className="flex justify-between items-center mb-6 lg:mb-8 px-2 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight">VibeBatch</h1>
            <p className="text-[10px] lg:text-xs text-accent font-bold tracking-[0.1em] uppercase">How your friends really see you</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-surface border-2 border-accent cursor-pointer glowing-accent overflow-hidden"
              onClick={() => setIsProfileSheetOpen(true)}
            >
               <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
            
            <div className="hidden md:flex nav-pill">
              <NavItem icon={<Users size={20} />} active={currentScreen === 'friends'} onClick={() => setCurrentScreen('friends')} />
              <div className="w-px h-6 bg-white/10 mx-1" />
              <NavItem icon={<Sparkles size={20} />} active={currentScreen === 'traits'} onClick={() => setCurrentScreen('traits')} />
              <NavItem icon={<Hourglass size={20} />} active={currentScreen === 'hourglass'} onClick={() => setCurrentScreen('hourglass')} />
              <NavItem icon={<BarChart3 size={20} />} active={currentScreen === 'tracker'} onClick={() => setCurrentScreen('tracker')} />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-6 overflow-hidden min-h-0">
          
          {/* Left Sidebar - Profile Summary */}
          <section className="hidden lg:flex card-surface p-6 flex-col items-center overflow-y-auto">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-accent overflow-hidden">
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              {user.identityTitle ? (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                   <div className="px-5 py-2 text-[10px] whitespace-nowrap bg-accent text-background font-black rounded-full shadow-[0_0_25px_rgba(0,229,255,0.6)] uppercase tracking-wider">
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
              <StatItem label="Total Votes" value={user.totalVotes} />
              <StatItem label="Friends" value={user.friends.length} />
              <StatItem label="Eligible" value={user.friends.filter(f => !f.hasVoted).length} />
              <StatItem label="Voted Back" value={user.totalVotes > 0 ? "92%" : "—"} />
            </div>

            <div className="mt-auto w-full pt-6 space-y-3">
               <Button onClick={() => setCurrentScreen('public-profile')} variant="primary">Share Profile →</Button>
               <Button onClick={() => setCurrentScreen('storycard')} variant="secondary">View Story Card</Button>
            </div>
          </section>

          {/* Center Column - Main Dashboard Feed */}
          <section className="flex flex-col gap-6 overflow-y-auto pr-1">
            <div className="lg:hidden flex flex-col items-center py-4 space-y-4">
                <div className="relative">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-accent glowing-accent object-cover" alt="" />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white/10 bg-surface flex items-center justify-center text-white/20">
                      <Sparkles size={32} />
                    </div>
                  )}
                  {user.identityTitle ? (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent text-background text-[9px] font-black px-4 py-1.5 shadow-[0_0_20px_rgba(0,229,255,0.6)] rounded-full uppercase tracking-wider">
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

            <div className="card-surface p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold font-display text-lg">Top Traits</h3>
                <span className="text-[10px] text-white/40 flex items-center gap-1.5 font-bold uppercase tracking-widest"><EyeOff size={14} /> Anonymous</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
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

            <div className="card-surface p-6 flex-1 min-h-0 flex flex-col">
               <h3 className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-6">Trait Breakdown</h3>
               <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                  {user.traits.sort((a,b) => b.votes - a.votes).slice(0, 8).map(trait => (
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
                    <div key={friend.id} className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-white/5">
                      {friend.avatar ? (
                        <img src={friend.avatar} className="w-10 h-10 rounded-full bg-surface object-cover" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-white/10 uppercase font-black text-[10px]">
                          {friend.displayName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-bold">{friend.displayName}</p>
                        <p className="text-[9px] opacity-50 font-medium">6 months friends</p>
                      </div>
                      {friend.hasVoted ? (
                         <div className="flex items-center gap-1 text-accent font-bold text-[9px]">
                           <CheckCircle2 size={10} /> VOTED
                         </div>
                      ) : (
                        <button 
                          className="bg-accent text-background px-3 py-1 rounded-md text-[9px] font-black hover:scale-105 transition-transform"
                          onClick={() => { setSelectedFriend(friend); setCurrentScreen('voting'); }}
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

            <div className="bg-gradient-to-b from-surface to-background border border-white/10 rounded-2xl p-6 text-center space-y-6">
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Share Story Card</p>
               <div className="card-surface p-6 border-white/5 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-accent mb-3 overflow-hidden flex items-center justify-center bg-surface">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <Sparkles className="text-accent/20" size={24} />}
                  </div>
                  <p className="text-[10px] font-black uppercase text-accent truncate w-full text-center">
                    {user.identityTitle || "Identity Locked"}
                  </p>
               </div>
               <button 
                onClick={() => setCurrentScreen('storycard')}
                className="w-full bg-white text-background py-3 rounded-lg text-xs font-black tracking-widest hover:bg-white/90 transition-colors uppercase"
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

        {/* Mobile Nav Bar */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 flex justify-center">
          <div className="nav-pill px-6 py-3 shadow-2xl shadow-accent/20 bg-surface/90 backdrop-blur-xl">
            <NavItem icon={<Users size={20} />} active={currentScreen === 'friends'} onClick={() => setCurrentScreen('friends')} />
            <div className="w-px h-6 bg-white/10 mx-2" />
            <NavItem icon={<Sparkles size={20} />} active={currentScreen === 'traits'} onClick={() => setCurrentScreen('traits')} />
            <NavItem icon={<Hourglass size={20} />} active={currentScreen === 'hourglass'} onClick={() => setCurrentScreen('hourglass')} />
            <NavItem icon={<BarChart3 size={20} />} active={currentScreen === 'tracker'} onClick={() => setCurrentScreen('tracker')} />
          </div>
        </div>
      </div>
    );
  };

  const NavItem = ({ icon, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${active ? 'text-accent bg-accent/10 glowing-accent' : 'text-white/40 hover:text-white'}`}
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

  // --- Sub-Screens placeholder (Voting, Friends, Traits, etc.) ---
  
  if (!authState.isAuthenticated) {
    return <AuthScreen />;
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
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'friends' && <FriendsScreen onBack={() => setCurrentScreen('home')} user={authState.user!} />}
          {currentScreen === 'traits' && <TraitsScreen onBack={() => setCurrentScreen('home')} user={authState.user!} />}
          {currentScreen === 'hourglass' && <HourglassScreen onBack={() => setCurrentScreen('home')} user={authState.user!} />}
          {currentScreen === 'tracker' && <VoteTrackerScreen onBack={() => setCurrentScreen('home')} user={authState.user!} />}
          {currentScreen === 'public-profile' && <PublicProfileScreen user={authState.user!} onBack={() => setCurrentScreen('home')} />}
          {currentScreen === 'storycard' && <StoryCardGeneratorScreen user={authState.user!} onBack={() => setCurrentScreen('home')} />}
          {currentScreen === 'voting' && <VotingScreen friend={selectedFriend!} onBack={() => setCurrentScreen('home')} onVote={(traits: string[]) => {
             // Mock vote update
             if (authState.user) {
               const updatedFriends = authState.user.friends.map(f => f.id === selectedFriend?.id ? { ...f, hasVoted: true } : f);
               setAuthState({ ...authState, user: { ...authState.user, friends: updatedFriends } });
               setCurrentScreen('home');
             }
          }}/>}
          {['about', 'help', 'terms', 'privacy'].includes(currentScreen) && (
            <StaticScreen title={currentScreen} onBack={() => setCurrentScreen('home')} />
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
            onNavigate={(s: string) => { setIsProfileSheetOpen(false); setCurrentScreen(s); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Screen Sub-components ---

function FriendsScreen({ onBack, user }: any) {
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Friends</h2>
      </div>
      
      <div className="flex gap-2 mb-6">
        <div className="flex-1 bg-surface rounded-xl px-4 py-3 flex items-center gap-3">
          <Users className="text-white/20" size={18} />
          <input type="text" placeholder="Search friends..." className="bg-transparent border-none outline-none w-full text-sm" />
        </div>
        <button className="bg-accent/10 border border-accent/20 p-3 rounded-xl text-accent"><UserPlus size={20} /></button>
      </div>

      <div className="space-y-3">
        {user.friends.map((friend: Friend) => (
          <div key={friend.id} className="flex items-center justify-between p-3 card-surface">
            <div className="flex items-center gap-3">
              <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <p className="font-bold">{friend.displayName}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">9 months friends</p>
              </div>
            </div>
            <button className="p-2 text-white/40 hover:text-accent transition-colors"><MessageCircle size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TraitsScreen({ onBack, user }: any) {
  const sortedTraits = [...user.traits].sort((a, b) => b.votes - a.votes);
  const top3 = sortedTraits.slice(0, 3);
  
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Traits</h2>
      </div>

      <div className="flex items-center gap-2 mb-6 text-white/40 text-[10px] font-bold uppercase tracking-wider">
        <EyeOff size={14} />
        <span>All votes are anonymous</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {top3.map((trait, i) => (
          <div key={trait.id} className={`card-surface p-4 flex flex-col items-center justify-center text-center relative overflow-hidden ${i === 0 ? 'border-accent/40 shadow-lg shadow-accent/5' : ''} ${trait.category === 'sponsored' ? 'border-sponsored/40 bg-sponsored/5' : ''}`}>
             <span className={`text-2xl font-bold font-display mb-1 ${trait.category === 'sponsored' ? 'text-sponsored' : i === 0 ? 'text-accent' : i === 1 ? 'text-white/60' : 'text-white/40'}`}>#{i + 1}</span>
             <span className="text-xs font-bold block mb-1">{trait.name}</span>
             <Badge color={trait.category === 'sponsored' ? 'amber' : i === 0 ? 'accent' : 'pink'}>{Math.round((trait.votes / user.totalVotes) * 100)}%</Badge>
             {trait.category === 'sponsored' && (
               <p className="text-[7px] text-sponsored font-black uppercase mt-3 tracking-widest border-t border-sponsored/20 pt-2 w-full">Sponsored by {trait.sponsoredBy}</p>
             )}
          </div>
        ))}
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
          const percent = Math.round((t.votes / total) * 100);
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

function HourglassScreen({ onBack, user }: any) {
  const eligible = user.friends.filter((f: Friend) => {
    const diff = Date.now() - new Date(f.friendshipDate).getTime();
    return diff > 1000 * 60 * 60 * 24 * 30 * 6; // 6 months
  });
  const pending = user.friends.filter((f: Friend) => {
    const diff = Date.now() - new Date(f.friendshipDate).getTime();
    return diff <= 1000 * 60 * 60 * 24 * 30 * 6;
  });

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Eligibility</h2>
      </div>

      <div className="bg-accent/5 border border-accent/20 p-4 rounded-2xl mb-8 flex gap-4">
        <Info className="text-accent shrink-0" />
        <p className="text-xs text-white/70 leading-relaxed font-medium">To keep votes high-fidelity, only friends who have known you for <span className="text-accent font-bold">6 months or more</span> are eligible to vote on your identity.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Eligible to Vote</h3>
          <div className="space-y-2">
            {eligible.map((f: Friend) => (
              <div key={f.id} className="flex items-center justify-between p-3 card-surface">
                <div className="flex items-center gap-3">
                  <img src={f.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <span className="font-bold text-sm">{f.displayName}</span>
                </div>
                <Badge color={f.hasVoted ? 'green' : 'accent'}>{f.hasVoted ? 'Voted' : 'Vote traits'}</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Not yet eligible</h3>
          <div className="space-y-2">
            {pending.map((f: Friend) => (
              <div key={f.id} className="flex items-center justify-between p-3 card-surface opacity-60">
                <div className="flex items-center gap-3">
                  <img src={f.avatar} className="w-10 h-10 rounded-full grayscale object-cover" alt="" />
                  <span className="font-bold text-sm">{f.displayName}</span>
                </div>
                <Badge color="amber">3mo left</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function VoteTrackerScreen({ onBack, user }: any) {
  const votedCount = user.friends.filter((f: Friend) => f.hasVoted).length;
  const total = user.friends.length;
  const participation = Math.round((votedCount / total) * 100);

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ChevronLeft /></button>
        <h2 className="text-xl font-bold font-display">Vote Tracker</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Eligible Friends" value={total} />
        <StatCard label="Have Voted" value={votedCount} />
        <StatCard label="Yet to vote" value={total - votedCount} />
        <StatCard label="Participation %" value={`${participation}%`} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-1">Detailed Status</h3>
        <div className="space-y-2">
           {user.friends.map((friend: Friend) => (
             <div key={friend.id} className="flex items-center justify-between p-3 card-surface">
               <div className="flex items-center gap-3">
                 <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                 <span className="font-bold text-sm">{friend.displayName}</span>
               </div>
               <Badge color={friend.hasVoted ? 'green' : 'amber'}>{friend.hasVoted ? 'Voted' : 'Pending'}</Badge>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <Card className="flex flex-col items-center justify-center py-6">
      <span className="text-2xl font-bold font-display mb-1">{value}</span>
      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</span>
    </Card>
  );
}

function VotingScreen({ friend, onBack, onVote }: any) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isCaptchadone, setIsCaptchaDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const traits = [
    'Witty', 'Magnetic', 'Stoic', 'Empathetic', 'Ambitious', 'Grounded', 
    'Charismatic', 'Resourceful', 'Zen', 'Fearless', 'Radiant', 'Analytical'
  ];

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
    <div className="min-h-screen p-4 pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack}><ChevronLeft /></button>
        <div className="text-center">
            <h2 className="text-lg font-bold font-display">Voting for {friend.displayName}</h2>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Select their strongest traits</p>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
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

      <div className="space-y-6">
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

        <div className="bg-white/5 p-4 rounded-xl space-y-2 mb-4">
           <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex items-center gap-2">
             <Info size={12} /> Anti-abuse note
           </h4>
           <p className="text-xs text-white/60 italic leading-relaxed">Each person can only vote once. Votes are intentional and non-reversible.</p>
        </div>

        <Button onClick={submit} disabled={selectedTraits.length === 0 || !isCaptchadone}>
          Submit vote →
        </Button>
      </div>
    </div>
  )
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

function ProfileSheet({ user, onClose, onLogout, onUpdateTitle, onNavigate }: any) {
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
          <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-accent object-cover" alt="" />
          <div className="flex-1">
            <h3 className="text-xl font-bold font-display">{user.displayName}</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs text-white/40">vibebatch.com/u/{user.username}</span>
               <button className="text-accent"><Copy size={14} /></button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <SheetOption icon={<Camera size={18} />} label="Update profile photo" />
          <SheetOption icon={<Users size={18} />} label="Update display name" />
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
             <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
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
  const percent = Math.round((trait.votes / total) * 100) || 0;
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

function PublicProfileScreen({ user, onBack }: any) {
  const topTraits = [...user.traits].sort((a, b) => b.votes - a.votes).slice(0, 3);
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full flex justify-start mb-4">
         <button onClick={onBack} className="p-2 bg-surface rounded-full"><ChevronLeft /></button>
      </div>
      
      <Card className="w-full max-w-sm mt-8 flex flex-col items-center p-8 space-y-6">
        <div className="relative">
          <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-accent shadow-2xl shadow-accent/20" alt="" />
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
             <p className="text-xl font-bold font-display">{user.friends.length}</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Friends</p>
           </div>
        </div>

        <Button className="py-4">Vote for {user.displayName}'s traits →</Button>
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
               {user.totalVotes > 0 ? topTraits.map((t, i) => (
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
        <Button className="flex items-center justify-center gap-3">
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
