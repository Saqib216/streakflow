/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Check, Flame, Trophy, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoodHabit } from '../types';
import { 
  getLocalDateString, 
  calculateGoodHabitStreak, 
  getPast7Days, 
  getWeekdayAbbreviation,
  subtractDays
} from '../utils';

interface GoodHabitCardProps {
  habit: GoodHabit;
  onToggleToday: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GoodHabitCard: React.FC<GoodHabitCardProps> = ({
  habit,
  onToggleToday,
  onDelete,
}) => {
  const todayStr = useMemo(() => getLocalDateString(), []);
  const isCompletedToday = habit.history.includes(todayStr);

  const { currentStreak, bestStreak } = useMemo(() => {
    return calculateGoodHabitStreak(habit.history, habit.bestStreak);
  }, [habit.history, habit.bestStreak]);

  // Past 7 days tracking
  const past7Days = useMemo(() => getPast7Days(), []);
  const completedPast7DaysCount = useMemo(() => {
    return past7Days.filter(day => habit.history.includes(day)).length;
  }, [habit.history, past7Days]);

  const completionRate = (completedPast7DaysCount / 7) * 100;

  // Circular progress ring dimensions
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      id={`good-habit-${habit.id}`}
      className="relative overflow-hidden bg-[#0F0F0F] border border-white/5 hover:border-white/15 rounded-2xl p-5 shadow-xl transition-all duration-300 group"
    >
      {/* Decorative subtle background overlay on complete */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${
          isCompletedToday ? 'opacity-100' : 'group-hover:opacity-40'
        }`} 
      />

      {/* Card Header Info */}
      <div className="flex items-start justify-between gap-4 z-10 relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sans font-medium text-base text-zinc-100 tracking-tight truncate group-hover:text-white transition-colors duration-200">
              {habit.name}
            </h3>
            {habit.target && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-zinc-400 border border-white/10">
                {habit.target}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-sans">
            Registered: {new Date(habit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Delete Habit Button */}
        <button
          onClick={() => onDelete(habit.id)}
          className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
          id={`delete-btn-${habit.id}`}
          title="Delete habit"
          aria-label="Delete habit"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Main Checklist Row */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 z-10 relative">
        <div className="flex items-center gap-4">
          {/* Main Completion Checkbox */}
          <button
            onClick={() => onToggleToday(habit.id)}
            id={`toggle-btn-${habit.id}`}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border cursor-pointer relative overflow-hidden group/check ${
              isCompletedToday
                ? 'bg-zinc-100 border-white text-zinc-950 shadow-md scale-102'
                : 'bg-[#050505] border-white/10 text-zinc-650 hover:border-white/30 hover:text-white hover:scale-105'
            }`}
          >
            {isCompletedToday ? (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check size={22} className="stroke-[3]" />
              </motion.div>
            ) : (
              <Check size={18} className="translate-y-0 group-hover/check:-translate-y-0.5 transition-transform duration-200" />
            )}
          </button>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Today's Practice</span>
            <p className={`text-xs font-medium transition-colors duration-200 ${isCompletedToday ? 'text-zinc-400 font-normal line-through decoration-white/20' : 'text-zinc-300'}`}>
              {isCompletedToday ? 'Amazing work! Checked in' : 'Mark as completed'}
            </p>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="flex items-center gap-2 group/ring" title="Weekly Completion Rate">
          <div className="relative w-[48px] h-[48px] flex items-center justify-center">
            <svg width="48" height="48" className="rotate-[-90deg]">
              {/* Background Ring */}
              <circle
                stroke="rgba(255, 255, 255, 0.05)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="24"
                cy="24"
              />
              {/* Active Ring */}
              <motion.circle
                stroke="#10b981"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="24"
                cy="24"
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-sans text-zinc-300">
              {completedPast7DaysCount}/7
            </span>
          </div>
        </div>
      </div>

      {/* Streaks and Weekly Dots */}
      <div className="mt-5 space-y-4 pt-4 border-t border-white/5 z-10 relative">
        {/* Streak counters */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current streak */}
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg flex items-center justify-center ${
              currentStreak > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-zinc-600'
            }`}>
              <Flame size={16} fill={currentStreak > 0 ? 'currentColor' : 'none'} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Current Streak</p>
              <p className="text-xs font-semibold text-zinc-300">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* Best streak */}
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg flex items-center justify-center ${
              bestStreak > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-zinc-600'
            }`}>
              <Trophy size={16} fill={bestStreak > 0 ? 'currentColor' : 'none'} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Best Streak</p>
              <p className="text-xs font-semibold text-zinc-300">
                {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly view (Last 7 days including today) */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans mb-2">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={10} /> Weekly Highlight
            </span>
            <span>{Math.round(completionRate)}% complete</span>
          </div>

          {/* Past 7 days status strip */}
          <div className="flex justify-between items-center bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
            {past7Days.map((dayStr) => {
              const isChecked = habit.history.includes(dayStr);
              const label = getWeekdayAbbreviation(dayStr);
              const isToday = dayStr === todayStr;

              return (
                <div key={dayStr} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] uppercase font-sans ${
                    isToday ? 'text-zinc-200 font-bold' : 'text-zinc-500'
                  }`}>
                    {label}
                  </span>
                  
                  <div
                    title={dayStr}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-300 relative ${
                      isChecked
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : isToday
                          ? 'border-white/30 bg-[#050505] text-zinc-600'
                          : 'border-white/5 bg-[#050505] text-transparent'
                    }`}
                  >
                    {isChecked && <Check size={10} className="stroke-[3.5]" />}
                    {isToday && !isChecked && <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
