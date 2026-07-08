/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoodHabit: (name: string, target?: string) => void;
  onAddBadHabit: (name: string) => void;
}

type TabType = 'good' | 'bad';

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAddGoodHabit,
  onAddBadHabit,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('good');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a habit name.');
      return;
    }

    if (activeTab === 'good') {
      onAddGoodHabit(trimmedName, target.trim() ? target.trim() : undefined);
    } else {
      onAddBadHabit(trimmedName);
    }

    // Reset and close
    setName('');
    setTarget('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors duration-250 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Tab Selection */}
          <div className="flex border-b border-white/5 bg-black/50">
            {/* Good Habit Tab */}
            <button
              onClick={() => {
                setActiveTab('good');
                setError('');
              }}
              className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border-b-2 ${activeTab === 'good'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.04]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
            >
              <ShieldCheck size={14} />
              <span>Good Habit</span>
            </button>

            {/* Bad Habit Tab */}
            <button
              onClick={() => {
                setActiveTab('bad');
                setError('');
              }}
              className={`flex-1 py-4 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border-b-2 ${activeTab === 'bad'
                  ? 'border-rose-500 text-rose-400 bg-rose-500/[0.04]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
            >
              <Lock size={14} />
              <span>Bad Habit</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center pb-2">
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-sans font-semibold ${activeTab === 'good' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                <Sparkles size={11} /> {activeTab === 'good' ? 'Build Routine' : 'Quit Impulse'}
              </span>
              <h2 className="text-lg font-medium font-sans text-white mt-1">
                {activeTab === 'good' ? 'Create a productive goal' : 'Start your sobriety timer'}
              </h2>
            </div>

            {/* Input Name */}
            <div className="space-y-1.5">
              <label htmlFor="habit-name" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-sans">
                Habit name
              </label>
              <input
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                maxLength={45}
                placeholder={activeTab === 'good' ? 'e.g. Read – 30 mins, Morning meditate' : 'e.g. Late night scrolling, Sugar drinks'}
                className="w-full text-white text-sm bg-[#050505] border border-white/10 hover:border-white/20 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-450 rounded-xl px-4 py-3 outline-none transition-all duration-200 placeholder-zinc-700"
                autoFocus
              />
            </div>

            {/* Input Target (Conditional for Good Habit) */}
            {activeTab === 'good' && (
              <div className="space-y-1.5">
                <label htmlFor="habit-target" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-sans">
                  Daily target <span className="text-zinc-600 font-normal italic">(Optional)</span>
                </label>
                <input
                  id="habit-target"
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  maxLength={35}
                  placeholder="e.g. 30 mins, 3L water, 10k steps"
                  className="w-full text-white text-sm bg-[#050505] border border-white/10 hover:border-white/20 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-450 rounded-xl px-4 py-3 outline-none transition-all duration-200 placeholder-zinc-700"
                />
              </div>
            )}

            {/* Bad Habit informational banner */}
            {activeTab === 'bad' && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Your live stopwatch will construct timestamps from <strong className="text-zinc-200">Now</strong>. Relentlessly tracking exact days, hours, and seconds clean.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div id="add-error" className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 justify-end">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 active:bg-white/10 active:scale-90 transition-all duration-200 cursor-pointer z-20 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              <button
                type="submit"
                id="btn-add-submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer active:scale-98"
              >
                <Check size={14} className="stroke-[3]" />
                <span>Save habit</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
