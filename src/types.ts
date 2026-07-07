/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoodHabit {
  id: string;
  name: string;
  target?: string; // e.g. "Read – 30 mins"
  history: string[]; // array of local date strings "YYYY-MM-DD"
  bestStreak: number; // Stored best streak
  createdAt: string;
}

export interface BadHabit {
  id: string;
  name: string;
  lastRelapse: string; // ISO string when the streak started (or since last slip)
  bestStreakSeconds: number; // Previous best streak in seconds (to match exact live timer counters!)
  createdAt: string;
}
