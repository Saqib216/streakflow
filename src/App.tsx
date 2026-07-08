/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Plus, 
  Sparkles, 
  Smile, 
  Info, 
  RotateCcw,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoodHabit, BadHabit } from './types';
import { getLocalDateString, subtractDays, calculateGoodHabitStreak } from './utils';
import { GoodHabitCard } from './components/GoodHabitCard';
import { BadHabitCard } from './components/BadHabitCard';
import { SummaryBar } from './components/SummaryBar';
import { AddHabitModal } from './components/AddHabitModal';

// Firebase imports
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from './firebase';

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage = "Timeout"): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

export default function App() {
  const [goodHabits, setGoodHabits] = useState<GoodHabit[]>([]);
  const [badHabits, setBadHabits] = useState<BadHabit[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load guest data (fallback or first-run)
  const loadGuestHabits = () => {
    setIsLoading(true);
    const cachedGood = localStorage.getItem('streakflow_good_habits');
    const cachedBad = localStorage.getItem('streakflow_bad_habits');

    const todayStr = getLocalDateString();
    const yesterdayStr = subtractDays(todayStr, 1);
    const twoDaysAgoStr = subtractDays(todayStr, 2);
    const threeDaysAgoStr = subtractDays(todayStr, 3);
    const fiveDaysAgoStr = subtractDays(todayStr, 5);

    if (cachedGood) {
      try {
        setGoodHabits(JSON.parse(cachedGood));
      } catch (e) {
        console.error("Error reading good habits", e);
      }
    } else {
      const defaultGood: GoodHabit[] = [
        {
          id: 'default-g-1',
          name: 'Read Daily',
          target: '30 mins',
          history: [yesterdayStr, twoDaysAgoStr],
          bestStreak: 2,
          createdAt: subtractDays(todayStr, 3) + 'T09:00:00Z',
        },
        {
          id: 'default-g-2',
          name: 'Drink Water',
          target: '3 Liters',
          history: [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr],
          bestStreak: 4,
          createdAt: subtractDays(todayStr, 5) + 'T08:00:00Z',
        }
      ];
      setGoodHabits(defaultGood);
    }

    if (cachedBad) {
      try {
        setBadHabits(JSON.parse(cachedBad));
      } catch (e) {
        console.error("Error reading bad habits", e);
      }
    } else {
      const date2DaysAgo = new Date(Date.now() - (2 * 24 * 3600000 + 3 * 3600000));
      const date5DaysAgo = new Date(Date.now() - (5 * 24 * 3600000 + 12 * 3600000));

      const defaultBad: BadHabit[] = [
        {
          id: 'default-b-1',
          name: 'Late Night Scrolling',
          lastRelapse: date2DaysAgo.toISOString(),
          bestStreakSeconds: 5 * 24 * 3600,
          createdAt: subtractDays(todayStr, 10) + 'T23:30:00Z',
        },
        {
          id: 'default-b-2',
          name: 'Processed Sugar Drinks',
          lastRelapse: date5DaysAgo.toISOString(),
          bestStreakSeconds: 12 * 24 * 3600,
          createdAt: subtractDays(todayStr, 20) + 'T12:00:00Z',
        }
      ];
      setBadHabits(defaultBad);
    }
    setIsLoading(false);
  };

  // Load from Firestore for logged in user
  const loadUserHabits = async (userId: string) => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const gQuery = query(collection(db, "good_habits"), where("userId", "==", userId));
      const gSnap = await withTimeout(getDocs(gQuery), 5000, "Firestore connection timed out");
      const fetchedGood: GoodHabit[] = [];
      gSnap.forEach((doc) => {
        const data = doc.data();
        fetchedGood.push({
          id: doc.id,
          name: data.name,
          target: data.target || "",
          history: data.history || [],
          bestStreak: data.bestStreak || 0,
          createdAt: data.createdAt,
        });
      });

      const bQuery = query(collection(db, "bad_habits"), where("userId", "==", userId));
      const bSnap = await withTimeout(getDocs(bQuery), 5000, "Firestore connection timed out");
      const fetchedBad: BadHabit[] = [];
      bSnap.forEach((doc) => {
        const data = doc.data();
        fetchedBad.push({
          id: doc.id,
          name: data.name,
          lastRelapse: data.lastRelapse,
          bestStreakSeconds: data.bestStreakSeconds || 0,
          createdAt: data.createdAt,
        });
      });

      // Sort by createdAt descending
      fetchedGood.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      fetchedBad.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setGoodHabits(fetchedGood);
      setBadHabits(fetchedBad);
    } catch (err: any) {
      console.error("Error loading habits from Firestore", err);
      setConnectionError(
        "Database connection timed out. If you have an Ad-Blocker, Brave Shields, or privacy extension active, it may be blocking Firebase (firestore.googleapis.com). Please disable it for this site and refresh."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserHabits(currentUser.uid);
        
        // Prompt import if local guest habits exist
        const cachedGood = localStorage.getItem('streakflow_good_habits');
        const cachedBad = localStorage.getItem('streakflow_bad_habits');
        if (cachedGood || cachedBad) {
          setShowImportPrompt(true);
        }
      } else {
        loadGuestHabits();
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Sign In handler
  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code !== 'auth/cancelled-popup-request') {
        console.error("Authentication error:", error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setGoodHabits([]);
      setBadHabits([]);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  // Import local data logic
  const handleImportLocalData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const cachedGood = localStorage.getItem('streakflow_good_habits');
      const cachedBad = localStorage.getItem('streakflow_bad_habits');

      let localGoods: GoodHabit[] = [];
      if (cachedGood) {
        try {
          localGoods = JSON.parse(cachedGood);
        } catch {}
      }
      let localBads: BadHabit[] = [];
      if (cachedBad) {
        try {
          localBads = JSON.parse(cachedBad);
        } catch {}
      }

      for (const habit of localGoods) {
        await setDoc(doc(db, "good_habits", habit.id), {
          ...habit,
          userId: user.uid
        });
      }

      for (const habit of localBads) {
        await setDoc(doc(db, "bad_habits", habit.id), {
          ...habit,
          userId: user.uid
        });
      }

      localStorage.removeItem('streakflow_good_habits');
      localStorage.removeItem('streakflow_bad_habits');

      await loadUserHabits(user.uid);
      setShowImportPrompt(false);
    } catch (err) {
      console.error("Error importing local data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissImport = () => {
    localStorage.removeItem('streakflow_good_habits');
    localStorage.removeItem('streakflow_bad_habits');
    setShowImportPrompt(false);
  };


  // Save/Update helper functions
  const saveGoodHabitItem = async (habit: GoodHabit, updatedList: GoodHabit[]) => {
    setGoodHabits(updatedList);
    if (user) {
      try {
        await setDoc(doc(db, "good_habits", habit.id), {
          ...habit,
          userId: user.uid
        });
      } catch (e) {
        console.error("Error saving good habit to Firestore:", e);
      }
    } else {
      localStorage.setItem('streakflow_good_habits', JSON.stringify(updatedList));
    }
  };

  const deleteGoodHabitItem = async (id: string, updatedList: GoodHabit[]) => {
    setGoodHabits(updatedList);
    if (user) {
      try {
        await deleteDoc(doc(db, "good_habits", id));
      } catch (e) {
        console.error("Error deleting good habit from Firestore:", e);
      }
    } else {
      localStorage.setItem('streakflow_good_habits', JSON.stringify(updatedList));
    }
  };

  const saveBadHabitItem = async (habit: BadHabit, updatedList: BadHabit[]) => {
    setBadHabits(updatedList);
    if (user) {
      try {
        await setDoc(doc(db, "bad_habits", habit.id), {
          ...habit,
          userId: user.uid
        });
      } catch (e) {
        console.error("Error saving bad habit to Firestore:", e);
      }
    } else {
      localStorage.setItem('streakflow_bad_habits', JSON.stringify(updatedList));
    }
  };

  const deleteBadHabitItem = async (id: string, updatedList: BadHabit[]) => {
    setBadHabits(updatedList);
    if (user) {
      try {
        await deleteDoc(doc(db, "bad_habits", id));
      } catch (e) {
        console.error("Error deleting bad habit from Firestore:", e);
      }
    } else {
      localStorage.setItem('streakflow_bad_habits', JSON.stringify(updatedList));
    }
  };

  // Add good habit
  const handleAddGoodHabit = (name: string, target?: string) => {
    const newHabit: GoodHabit = {
      id: 'g-' + Math.random().toString(36).substring(2, 9),
      name,
      target,
      history: [],
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...goodHabits];
    saveGoodHabitItem(newHabit, updated);
  };

  // Add bad habit to quit
  const handleAddBadHabit = (name: string) => {
    const newHabit: BadHabit = {
      id: 'b-' + Math.random().toString(36).substring(2, 9),
      name,
      lastRelapse: new Date().toISOString(),
      bestStreakSeconds: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newHabit, ...badHabits];
    saveBadHabitItem(newHabit, updated);
  };

  // Toggle checklist for good habits
  const handleToggleGoodHabit = (id: string) => {
    const todayStr = getLocalDateString();
    let updatedHabit: GoodHabit | null = null;
    const updated = goodHabits.map((habit) => {
      if (habit.id === id) {
        let newHistory = [...habit.history];
        if (newHistory.includes(todayStr)) {
          newHistory = newHistory.filter((date) => date !== todayStr);
        } else {
          newHistory.push(todayStr);
        }
        
        const { bestStreak } = calculateGoodHabitStreak(newHistory, habit.bestStreak);
        updatedHabit = {
          ...habit,
          history: newHistory,
          bestStreak: Math.max(habit.bestStreak, bestStreak),
        };
        return updatedHabit;
      }
      return habit;
    });
    if (updatedHabit) {
      saveGoodHabitItem(updatedHabit, updated);
    }
  };

  // Relapse handler for bad habits
  const handleBadHabitRelapse = (id: string) => {
    let updatedHabit: BadHabit | null = null;
    const updated = badHabits.map((habit) => {
      if (habit.id === id) {
        const lastRelapseMs = new Date(habit.lastRelapse).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastRelapseMs) / 1000));
        const newBestStreakSeconds = Math.max(habit.bestStreakSeconds, elapsedSeconds);
        updatedHabit = {
          ...habit,
          lastRelapse: new Date().toISOString(),
          bestStreakSeconds: newBestStreakSeconds,
        };
        return updatedHabit;
      }
      return habit;
    });
    if (updatedHabit) {
      saveBadHabitItem(updatedHabit, updated);
    }
  };

  // Delete good habit
  const handleDeleteGoodHabit = (id: string) => {
    const updated = goodHabits.filter((h) => h.id !== id);
    deleteGoodHabitItem(id, updated);
  };

  // Delete bad habit
  const handleDeleteBadHabit = (id: string) => {
    const updated = badHabits.filter((h) => h.id !== id);
    deleteBadHabitItem(id, updated);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white pb-12 antialiased">
      {/* Extremely subtle ambient sophisticated dark backlight */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      {/* Primary Header Section */}
      <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 w-full px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <Flame size={20} className="text-zinc-100" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                StreakFlow
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mt-0.5">
                Mastering Rituals • Defeating Impulses
              </p>
            </div>
          </div>

          {/* User Sign-In Actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 md:w-15">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      referrerPolicy="no-referrer" 
                      className="w-6.5 h-6.5 rounded-lg object-cover" 
                    />
                  ) : (
                    <div className="w-6.5 h-6.5 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-200">
                      {(user.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-zinc-300 hidden sm:inline max-w-[110px] truncate">
                    {user.displayName?.split(' ')[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 hover:text-white px-3 py-2 rounded-xl bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className={`flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 active:scale-98 shadow-sm hover:shadow ${isSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSigningIn ? (
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.12 1.352 15.397 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.79-.085-1.39-.188-1.925H12.24z"/>
                  </svg>
                )}
                <span className="hidden sm:inline">{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                <span className="inline sm:hidden">{isSigningIn ? '...' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-8 space-y-8 z-10 relative">
        
        {/* Import Local Habits Banner */}
        {showImportPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl mt-0.5">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Sync local habits to cloud</h4>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  We found habits on this browser created in guest mode. Sync them to your permanent account to avoid data loss.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={handleDismissImport}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 transition-colors duration-200 cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleImportLocalData}
                className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-xl shadow transition-colors duration-200 cursor-pointer"
              >
                Sync to Cloud
              </button>
            </div>
          </motion.div>
        )}

        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl shrink-0 mt-0.5">
                <BadgeAlert size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Database Connection Blocked</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {connectionError}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
              <button
                onClick={() => {
                  if (user) {
                    loadUserHabits(user.uid);
                  }
                }}
                className="text-xs font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors duration-200 cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2 rounded-xl shadow transition-colors duration-200 cursor-pointer"
              >
                Use Offline Mode
              </button>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Loading Rituals...</span>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase bg-white/5 text-zinc-300 border border-white/10">
                    Self Mastery Platform
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight mt-1">
                  Your Daily Habit Blueprint
                </h2>
              </div>
            </section>

            {/* Top Summary/Bento Panel */}
            <SummaryBar 
              goodHabits={goodHabits} 
              badHabits={badHabits} 
              onOpenAddHabit={() => setIsAddModalOpen(true)} 
            />

            {/* Both Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* SECTION 1 - BUILD GOOD HABITS */}
              <section id="good-habits-section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                    <div>
                      <h2 className="font-sans font-medium text-base text-zinc-100 tracking-tight">
                        Build Good Habits
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Construct atomic routines with weekly progress metrics
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold text-zinc-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {goodHabits.length}
                  </span>
                </div>

                {/* Habit Cards Container */}
                <AnimatePresence mode="popLayout">
                  {goodHabits.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {goodHabits.map((habit) => (
                        <GoodHabitCard
                          key={habit.id}
                          habit={habit}
                          onToggleToday={handleToggleGoodHabit}
                          onDelete={handleDeleteGoodHabit}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#0f0f0f] border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 mb-3 border border-white/10">
                        <Sparkles size={20} />
                      </div>
                      <h3 className="font-sans font-medium text-zinc-300">No positive habits yet</h3>
                      <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
                        Small wins build monumental momentum. Track your first dynamic positive habit by clicking "Create New Habit" above.
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
                      >
                        Add Good Habit <ArrowRight size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* SECTION 2 - QUIT BAD HABITS */}
              <section id="bad-habits-section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] block"></span>
                    <div>
                      <h2 className="font-sans font-medium text-base text-zinc-100 tracking-tight">
                        Quit Bad Habits
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Set up stopwatch metrics & honest accountability
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold text-zinc-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {badHabits.length}
                  </span>
                </div>

                {/* Bad Habit Columns Container */}
                <AnimatePresence mode="popLayout">
                  {badHabits.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {badHabits.map((habit) => (
                        <BadHabitCard
                          key={habit.id}
                          habit={habit}
                          onRelapse={handleBadHabitRelapse}
                          onDelete={handleDeleteBadHabit}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#0f0f0f] border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 mb-3 border border-white/10">
                        <Info size={20} />
                      </div>
                      <h3 className="font-sans font-medium text-zinc-300">Zero cravings listed</h3>
                      <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
                        Rewrite your brain chemistry. Setup a relentless ticking shield against late-night scroll sessions or unhealthy drinks.
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer transition-colors duration-200 flex items-center gap-1.5"
                      >
                        Add Bad Habit <ArrowRight size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

            </div>
          </>
        )}
      </main>

      {/* Footer in Sophisticated Dark Theme */}
      <footer className="max-w-7xl w-full mx-auto px-4 mt-16 pt-6 pb-2 border-t border-white/5 bg-transparent flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
        <span>{user ? "Cloud Database Synced via Firebase" : "Local Session Persistence Active"}</span>
        <span>{user ? "Real-time Backups Secured" : "No Cloud Sync Required"}</span>
        <span>StreakFlow • Made by Saqib</span>
      </footer>

      {/* Creation Modal System */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGoodHabit={handleAddGoodHabit}
        onAddBadHabit={handleAddBadHabit}
      />
    </div>
  );
}
