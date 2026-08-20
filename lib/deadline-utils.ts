import { Season } from './types';
import { DEFAULT_SEASON } from './mock-data';

/**
 * Deadline Locking Utilities
 * 
 * Handles prediction deadline calculations and locking mechanisms
 * Used across both admin and user interfaces
 */

export interface DeadlineInfo {
  deadline: Date;
  isLocked: boolean;
  timeRemaining: number; // milliseconds
  hoursRemaining: number;
  minutesRemaining: number;
  message: string;
}

/**
 * Calculate the deadline for a given week
 * Default: Tuesday 8 PM ET (configurable via season settings)
 */
export function calculateWeekDeadline(week: number, season: Season = DEFAULT_SEASON): Date {
  // Find the Tuesday of the week that includes the current date
  const now = new Date();
  
  // Day of week: 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  const targetDay = season.predictionDeadlineDay; // Usually 1 for Tuesday
  const currentDay = now.getDay();
  
  // Calculate days until next target day
  let daysUntil = (targetDay - currentDay + 7) % 7;
  
  // If we've already passed the deadline this week, aim for next week
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + (daysUntil || 7));
  deadline.setHours(season.predictionDeadlineHour, 0, 0, 0);
  
  return deadline;
}

/**
 * Get deadline information for current or specific week
 */
export function getDeadlineInfo(week?: number, season: Season = DEFAULT_SEASON): DeadlineInfo {
  const currentWeek = week || season.currentWeek;
  const deadline = calculateWeekDeadline(currentWeek, season);
  const now = new Date();
  
  const timeRemaining = deadline.getTime() - now.getTime();
  const isLocked = timeRemaining <= 0;
  
  const hours = Math.floor(Math.abs(timeRemaining) / (1000 * 60 * 60));
  const minutes = Math.floor((Math.abs(timeRemaining) % (1000 * 60 * 60)) / (1000 * 60));
  
  let message: string;
  if (isLocked) {
    message = 'Predictions locked. Results will be uploaded by admins.';
  } else if (hours === 0) {
    message = `Deadline in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    message = `Deadline in ${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const days = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    message = `Deadline in ${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return {
    deadline,
    isLocked,
    timeRemaining: Math.max(0, timeRemaining),
    hoursRemaining: Math.floor(Math.max(0, timeRemaining) / (1000 * 60 * 60)),
    minutesRemaining: Math.floor((Math.max(0, timeRemaining) % (1000 * 60 * 60)) / (1000 * 60)),
    message,
  };
}

/**
 * Check if predictions are still open for a week
 */
export function arePredictionsOpen(week?: number, season: Season = DEFAULT_SEASON): boolean {
  const info = getDeadlineInfo(week, season);
  return !info.isLocked;
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: Date, style: 'long' | 'short' = 'short'): string {
  const options = style === 'long'
    ? { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }
    : { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  
  return deadline.toLocaleDateString('en-US', options as Intl.DateTimeFormatOptions);
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0:00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Hook-style deadline checker (for real-time updates)
 * Returns function to get fresh deadline info
 */
export function createDeadlineChecker(week?: number, season: Season = DEFAULT_SEASON) {
  return {
    check: () => getDeadlineInfo(week, season),
    isOpen: () => arePredictionsOpen(week, season),
    getDeadline: () => calculateWeekDeadline(week || season.currentWeek, season),
  };
}

/**
 * Calculate grace period (5 minutes after official deadline)
 * Used for late submissions in admin panel
 */
export function hasGracePeriodExpired(deadlineTime: Date, gracePeriodMinutes = 5): boolean {
  const gracePeriodEnd = new Date(deadlineTime.getTime() + gracePeriodMinutes * 60 * 1000);
  return new Date() > gracePeriodEnd;
}

/**
 * Get all upcoming deadlines for the season
 */
export function getUpcomingDeadlines(season: Season = DEFAULT_SEASON): Array<{ week: number; deadline: Date }> {
  const deadlines = [];
  for (let week = season.currentWeek; week <= season.totalWeeks; week++) {
    deadlines.push({
      week,
      deadline: calculateWeekDeadline(week, season),
    });
  }
  return deadlines;
}
