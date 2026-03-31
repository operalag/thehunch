import { toZonedTime, format } from 'date-fns-tz';
export type { Market, MarketCategory } from '../../hooks/useMarketsCache';

// Filter types
export type StatusFilter = 'all' | 'open' | 'waiting' | 'proposed' | 'challenged' | 'voting' | 'resolved';
export type CategoryFilter = 'all' | import('../../hooks/useMarketsCache').MarketCategory;
export type SortOption = 'newest' | 'oldest' | 'deadline-soon' | 'deadline-late' | 'alphabetical' | 'status';

// Countdown entry type used throughout market components
export type CountdownEntry = {
  vetoCountdown?: string;
  challengeCountdown?: string;
  proposalCountdown?: string;
  timeSince?: string;
  urgency?: 'safe' | 'warning' | 'urgent';
  vetoProgress?: number;
  challengeProgress?: number;
  proposalProgress?: number;
};

// Constants
export const VETO_THRESHOLD_HNCH = 2_000_000;
export const VETO_LOCK_PERIOD = 24 * 60 * 60; // 24 hours in seconds
export const INITIAL_CHALLENGE_PERIOD_SECONDS = 4 * 60 * 60; // 4 hours
export const VETO_PERIOD_SECONDS = 48 * 60 * 60; // 48 hours
export const BOND_SCHEDULE = [10000, 20000, 40000, 80000]; // HNCH
export const WINNER_BONUS = 2000; // HNCH

export const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
];

// Helper to normalize TON addresses for comparison
// Handles both bounceable (EQ...) and non-bounceable (UQ...) formats
export function normalizeTonAddress(address: string): string {
  try {
    const base64 = address.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const hashBytes = decoded.slice(2, 34);
    return Array.from(hashBytes).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').toLowerCase();
  } catch {
    return address.toLowerCase();
  }
}

// Format a duration in seconds to human-readable string
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Format time elapsed since a timestamp
export function formatTimeSince(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - timestamp;
  if (elapsed < 60) return 'Just now';
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
  return `${Math.floor(elapsed / 86400)}d ago`;
}

// Get urgency level based on remaining/total time
export function getUrgency(remaining: number, total: number): 'safe' | 'warning' | 'urgent' {
  const percentage = remaining / total;
  if (percentage > 0.5) return 'safe';
  if (percentage > 0.125) return 'warning';
  return 'urgent';
}

// Get status badge class and text for a market
export function getStatusBadge(status: import('../../hooks/useMarketsCache').Market['status']) {
  const badges = {
    open: { class: 'badge-pending', text: 'Open' },
    proposed: { class: 'badge-proposed', text: 'Proposed' },
    challenged: { class: 'badge-challenged', text: 'Challenged' },
    voting: { class: 'badge-challenged', text: 'DAO Voting' },
    resolved: { class: 'badge-resolved', text: 'Resolved' },
  };
  return badges[status];
}

// Calculate risk/reward for a challenge
export function calculateChallengeRiskReward(currentBond: number) {
  const requiredBond = currentBond * 2;
  const potentialWin = requiredBond + currentBond + WINNER_BONUS;
  const potentialLoss = requiredBond;
  const roi = ((potentialWin - requiredBond) / requiredBond) * 100;

  return {
    requiredBond,
    potentialWin,
    potentialLoss,
    roi: Math.round(roi),
  };
}

// Format a Unix timestamp for display in a specific timezone
export function formatTimestampInTimezone(timestamp: number, tz: string): string {
  try {
    const date = new Date(timestamp * 1000);
    const zonedDate = toZonedTime(date, tz);
    return format(zonedDate, 'MMM d, yyyy HH:mm zzz', { timeZone: tz });
  } catch {
    return new Date(timestamp * 1000).toLocaleString();
  }
}
