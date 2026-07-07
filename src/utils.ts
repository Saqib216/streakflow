/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to format Date target to YYYY-MM-DD
export function getLocalDateString(dateStrOrObj: Date | string | number = new Date()): string {
  const date = typeof dateStrOrObj === 'string' || typeof dateStrOrObj === 'number' 
    ? new Date(dateStrOrObj) 
    : dateStrOrObj;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses local date string safely to prevent timezone issues
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to subtract days from local date string
export function subtractDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() - days);
  return getLocalDateString(date);
}

// Generates previous 7 local dates (including today)
export function getPast7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

// Calculates current streak and best streak from history
export function calculateGoodHabitStreak(history: string[], storedBest: number = 0): { currentStreak: number; bestStreak: number } {
  if (!history || history.length === 0) {
    return { currentStreak: 0, bestStreak: storedBest };
  }

  // Deduplicate and sort history ascending
  const uniqueDates = Array.from(new Set(history)).sort();
  
  // Calculate best overall steak from history
  let bestStreak = storedBest;
  let currentAccumulator = 0;
  let previousDateStr: string | null = null;

  for (const dateStr of uniqueDates) {
    if (previousDateStr === null) {
      currentAccumulator = 1;
    } else {
      const pDate = parseLocalDate(previousDateStr);
      const cDate = parseLocalDate(dateStr);
      const diffTime = Math.abs(cDate.getTime() - pDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentAccumulator += 1;
      } else if (diffDays > 1) {
        currentAccumulator = 1;
      } // ignore diffDays === 0 (should not happen with unique sorted list)
    }
    bestStreak = Math.max(bestStreak, currentAccumulator);
    previousDateStr = dateStr;
  }

  // Calculate current active streak
  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = subtractDays(todayStr, 1);
  const historySet = new Set(history);

  let currentStreak = 0;
  let checkStr = "";

  if (historySet.has(todayStr)) {
    currentStreak = 1;
    checkStr = yesterdayStr;
    while (historySet.has(checkStr)) {
      currentStreak++;
      checkStr = subtractDays(checkStr, 1);
    }
  } else if (historySet.has(yesterdayStr)) {
    currentStreak = 1;
    checkStr = subtractDays(yesterdayStr, 1);
    while (historySet.has(checkStr)) {
      currentStreak++;
      checkStr = subtractDays(checkStr, 1);
    }
  } else {
    currentStreak = 0;
  }

  // Double check best streak is at least current streak
  bestStreak = Math.max(bestStreak, currentStreak);

  return { currentStreak, bestStreak };
}

// Get motivational message based on streak days for Bad Habits
export function getBadHabitMotivationalMessage(days: number): string {
  if (days <= 2) {
    return "Every streak starts at day 1. Keep going.";
  } else if (days <= 6) {
    return "You're building momentum!";
  } else if (days <= 13) {
    return "One week strong — this is real progress.";
  } else {
    return "You're rewiring your brain. Incredible.";
  }
}

// Text or background color map for days of the week in good habits
export const WEEK_DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday to Saturday or similar
export function getWeekdayAbbreviation(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  // returns M, T, W, T, F, S, S
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return days[day];
}
