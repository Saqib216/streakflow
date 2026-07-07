/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ShieldCheck, Lock, Flame, Sparkles, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { GoodHabit, BadHabit } from '../types';
import { calculateGoodHabitStreak } from '../utils';

interface SummaryBarProps {
  goodHabits: GoodHabit[];
  badHabits: BadHabit[];
  onOpenAddHabit: () => void;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  goodHabits,
  badHabits,
  onOpenAddHabit,
}) => {
  // Compute statistical metrics
  const activeGoodCount = goodHabits.length;
  const activeBadCount = badHabits.length;

  const longestStreak = useMemo(() => {
    let maxStreak = 0;

    // Evaluate good habits
    goodHabits.forEach(habit => {
      const { currentStreak } = calculateGoodHabitStreak(habit.history, habit.bestStreak);
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    });

    // Evaluate bad habits
    badHabits.forEach(habit => {
      const elapsedMs = Date.now() - new Date(habit.lastRelapse).getTime();
      const currentStreakDays = Math.max(0, Math.floor(elapsedMs / (1000 * 3600 * 24)));
      if (currentStreakDays > maxStreak) {
        maxStreak = currentStreakDays;
      }
    });

    return maxStreak;
  }, [goodHabits, badHabits]);

  return (
    <div id="summary-bar" className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0F0F0F] rounded-2xl border border-white/5 p-4 shadow-xl relative overflow-hidden">
        
        {/* Good Habits Stat Box */}
        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-xl p-3.5 px-4 transition-all duration-300 hover:bg-white/[0.08] group">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg transition-transform duration-300">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8F8F8F] font-sans">Active Good</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-medium text-white">
                {String(activeGoodCount).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">rituals</span>
            </div>
          </div>
        </div>

        {/* Bad Habits Stat Box */}
        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-xl p-3.5 px-4 transition-all duration-300 hover:bg-white/[0.08] group">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg transition-transform duration-300">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8F8F8F] font-sans">Quitting Bad</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-medium text-white">
                {String(activeBadCount).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">impulses</span>
            </div>
          </div>
        </div>

        {/* Global Longest Streak Stat Box */}
        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-xl p-3.5 px-4 transition-all duration-300 hover:bg-white/[0.08] group">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg transition-transform duration-300">
            <Flame size={20} fill={longestStreak > 0 ? 'currentColor' : 'none'} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#8F8F8F] font-sans">Best Streak</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-medium text-emerald-400">
                {longestStreak}d
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">current</span>
            </div>
          </div>
        </div>

        {/* Action Button: Create Habit */}
        <button
          onClick={onOpenAddHabit}
          id="btn-trigger-add"
          className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm rounded-xl cursor-pointer transition-all duration-200 active:scale-98 shadow-md hover:shadow-lg group h-auto min-h-[46px] md:min-h-0 py-3"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>New Habit</span>
        </button>
      </div>
    </div>
  );
};
