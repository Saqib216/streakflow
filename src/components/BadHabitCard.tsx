/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Trash2, ShieldAlert, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BadHabit } from '../types';
import { getBadHabitMotivationalMessage } from '../utils';

interface BadHabitCardProps {
  habit: BadHabit;
  onRelapse: (id: string) => void;
  onDelete: (id: string) => void;
}

export const BadHabitCard: React.FC<BadHabitCardProps> = ({
  habit,
  onRelapse,
  onDelete,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [showSlipConfirm, setShowSlipConfirm] = useState(false);
  const [sadEmojis, setSadEmojis] = useState<{ id: number; x: number; emoji: string }[]>([]);

  // Set up live ticking clock updating every 1 sec
  useEffect(() => {
    function updateElapsed() {
      const start = new Date(habit.lastRelapse).getTime();
      const now = Date.now();
      setElapsedMs(Math.max(0, now - start));
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [habit.lastRelapse]);

  // Convert ms to detailed values (days, hours, minutes, seconds)
  const duration = useMemo(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, totalSeconds };
  }, [elapsedMs]);

  // Previous best streak calculations
  const bestStreakStr = useMemo(() => {
    const bestSeconds = habit.bestStreakSeconds;
    if (bestSeconds <= 0) return 'No previous record';
    
    const days = Math.floor(bestSeconds / (3600 * 24));
    const hours = Math.floor((bestSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((bestSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${bestSeconds % 60}s`;
  }, [habit.bestStreakSeconds]);

  // Current counter representation for best streak in days (for motivational message check)
  const currentStreakDays = duration.days;

  const motivationMessage = useMemo(() => {
    return getBadHabitMotivationalMessage(currentStreakDays);
  }, [currentStreakDays]);

  // Motivational message badge backgrounds
  const badgeTheme = useMemo(() => {
    if (currentStreakDays <= 2) {
      return {
        bg: 'bg-white/[0.02] border-white/10 text-zinc-300',
        quote: 'text-zinc-400'
      };
    } else if (currentStreakDays <= 6) {
      return {
        bg: 'bg-white/5 border-white/10 text-zinc-200',
        quote: 'text-zinc-300'
      };
    } else if (currentStreakDays <= 13) {
      return {
        bg: 'bg-white/10 border-white/15 text-white',
        quote: 'text-zinc-100'
      };
    } else {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        quote: 'text-emerald-400'
      };
    }
  }, [currentStreakDays]);

  const triggerSadEmoji = (count: number) => {
    const emojis = ['😢', '😞', '💔', '😔', '😭', '🥀', '📉'];
    const newEmojis = Array.from({ length: count }).map((_, i) => ({
      id: Math.random() + Date.now() + i,
      x: (Math.random() - 0.5) * 60, // random distance left or right
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setSadEmojis((prev) => [...prev, ...newEmojis]);
    setTimeout(() => {
      setSadEmojis((prev) => prev.filter((item) => !newEmojis.find((ne) => ne.id === item.id)));
    }, 1500);
  };

  const handleRelapseClick = () => {
    if (!showSlipConfirm) {
      setShowSlipConfirm(true);
      triggerSadEmoji(1);
    } else {
      onRelapse(habit.id);
      setShowSlipConfirm(false);
      triggerSadEmoji(6);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showSlipConfirm) {
      timeout = setTimeout(() => {
        setShowSlipConfirm(false);
      }, 4000); // Reset confirmation state after 4 seconds of inactivity
    }
    return () => clearTimeout(timeout);
  }, [showSlipConfirm]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      id={`bad-habit-${habit.id}`}
      className="relative overflow-hidden bg-[#0F0F0F] border border-white/5 hover:border-white/15 rounded-2xl p-5 shadow-xl transition-all duration-300 group"
    >
      {/* Decorative subtle background overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
      />

      {/* Card Header Info */}
      <div className="flex items-start justify-between gap-4 z-10 relative">
        <div className="flex-1 min-w-0 font-sans">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-base text-zinc-100 tracking-tight truncate group-hover:text-white transition-colors duration-200">
              Quitting: {habit.name}
            </h3>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-sans">
            Registered: {new Date(habit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Delete Habit Button */}
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
          id={`delete-bad-btn-${habit.id}`}
          title="Delete bad habit tracker"
          aria-label="Delete bad habit tracker"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Dynamic Counter Display */}
      <div className="mt-5 py-4 bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col items-center justify-center relative z-10 overflow-hidden">
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-[9px] text-zinc-500 tracking-wider font-sans uppercase">
          <Clock size={10} className="text-zinc-400" /> Live Tracker
        </div>

        <div className="flex items-baseline gap-2.5 mt-3">
          {/* Days */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-medium font-sans text-white tracking-tight">
              {String(duration.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-sans font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">Days</span>
          </div>
          <span className="text-xl font-medium font-sans text-zinc-700 -translate-y-1">:</span>
          
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-medium font-sans text-zinc-350 tracking-tight">
              {String(duration.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-sans font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">Hrs</span>
          </div>
          <span className="text-xl font-medium font-sans text-zinc-700 -translate-y-1">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-3xl font-medium font-sans text-zinc-350 tracking-tight">
              {String(duration.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-sans font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">Mins</span>
          </div>
          <span className="text-xl font-medium font-sans text-zinc-700 -translate-y-1">:</span>
          
          {/* Seconds */}
          <div className="flex flex-col items-center w-10">
            <span className="text-3xl font-medium font-sans text-zinc-300 tracking-tight">
              {String(duration.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-sans font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">Secs</span>
          </div>
        </div>

        <div className="w-full px-4 mt-3">
          <div className="text-[10px] text-center text-zinc-500 font-sans flex items-center justify-center gap-1.5 pt-2.5 border-t border-white/5">
            <ShieldAlert size={10} className="text-zinc-650" />
            <span>Time elapsed since last check-in</span>
          </div>
        </div>
      </div>

      {/* Motivational & Reset Section */}
      <div className="mt-5 space-y-4 pt-4 border-t border-white/5 z-10 relative">
        
        {/* Quote Block */}
        <div className={`p-3 rounded-xl border transition-colors duration-300 flex items-center gap-2.5 ${badgeTheme.bg}`}>
          <div className="relative flex-1">
            <span className="text-[9px] uppercase tracking-wider block font-sans text-zinc-500 mb-0.5 font-bold">Motivation</span>
            <p className={`text-xs font-semibold leading-relaxed ${badgeTheme.quote}`}>
              "{motivationMessage}"
            </p>
          </div>
        </div>

        {/* Best Streak / Reset Action Row */}
        <div className="flex items-center gap-3">
          {/* Best Streak ever */}
          <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5 font-sans overflow-hidden">
            <Award size={14} className="text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-550 uppercase tracking-widest block font-sans">Best Streak</span>
              <p className="text-xs font-semibold text-zinc-300 truncate font-mono">
                {bestStreakStr}
              </p>
            </div>
          </div>

          {/* Reset button "I slipped today" */}
          <button
            onClick={handleRelapseClick}
            id={`relapse-btn-${habit.id}`}
            className={`px-4 h-10 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-300 relative cursor-pointer ${
              showSlipConfirm
                ? 'bg-rose-500 hover:bg-rose-600 text-black font-semibold active:scale-95 shadow-lg shadow-rose-500/20'
                : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 active:scale-95'
            }`}
          >
            {showSlipConfirm ? (
              <>
                <ShieldAlert size={14} />
                <span>Confirm Reset?</span>
              </>
            ) : (
              <>
                <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>I slipped today</span>
              </>
            )}

            {/* Sad emojis animation container */}
            <AnimatePresence>
              {sadEmojis.map((item) => (
                <motion.span
                  key={item.id}
                  initial={{ opacity: 0, y: 0, scale: 0.5, x: item.x }}
                  animate={{ opacity: [0, 1, 1, 0], y: -70, scale: [0.5, 1.2, 1, 0.8], rotate: item.x }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute pointer-events-none text-base z-50 select-none"
                  style={{ bottom: '30px', left: '50%' }}
                >
                  {item.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
