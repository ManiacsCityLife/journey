export interface UserProfile {
  username: string;
  soberDate: string;
  dailySpend: number;
  currency: string;
  timezone: string;
  pledgeStreak: number;
  lastPledgeDate: string;
  lastPledgeText?: string;
  emergencyContact?: { name: string; phone: string };
  savingsGoal?: number;
  savingsGoalName?: string;
  weeklyGoals?: string[];
  /** @deprecated kept for migration — use lockMethod */
  biometricEnabled?: boolean;
  /** Authentication required to open the app */
  lockMethod?: 'none' | 'biometric' | 'pin';
  notificationSettings?: {
    motivations: boolean;
    reminders: boolean;
    milestones: boolean;
    morningTime: string;  // "HH:MM"
    eveningTime: string;  // "HH:MM"
    /** How often to send daily nudges. We auto-decay from 'gentle' → 'light' →
     *  'minimal' as the user's sober days grow, on the principle that the
     *  earliest weeks need the most support. */
    frequency?: 'gentle' | 'light' | 'minimal' | 'auto';
  };
  /** Milestone notification IDs (days) we've already fired. Prevents the
   *  "you've saved R50!" notification firing on every cold-launch. */
  firedMilestoneDays?: number[];
  /** Savings-tier amounts (e.g. 50, 100, 250…) we've already fired. */
  firedSavingsTiers?: number[];
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface CravingLog {
  id: string;
  timestamp: string;
  intensity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  duration: number;
  trigger?: string;
  toolUsed?: string;
  overcome: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface ThoughtLog {
  id: string;
  timestamp: string;
  type: 'craving' | 'negative' | 'positive' | 'trigger';
  text: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  /** Pure activity name (e.g. "Running") — no duration concatenated in. */
  activity: string;
  /** Minutes */
  duration?: number;
  /** Optional distance reading */
  distance?: number;
  /** Distance unit */
  unit?: 'km' | 'miles';
  /** Free-text notes */
  notes?: string;
}

export interface DailyHeatmapEntry {
  date: string;
  cravings: number;
  thoughts: number;
  mood?: number;
}

export interface GratitudeEntry {
  id: string;
  date: string;   // YYYY-MM-DD
  text: string;
}

export interface VisionItem {
  id: string;
  /** JPEG data URL (from canvas.toDataURL) */
  image: string;
  caption?: string;
  createdAt: number;
}

export interface VisionSection {
  id: string;
  title: string;
  /** Tailwind background class for the section header */
  color: string;
  items: VisionItem[];
}

export interface VisionBoard {
  id: string;
  name: string;
  createdAt: number;
  sections: VisionSection[];
}

/**
 * A "slip" — a drinking event recorded after a sober streak.
 *
 * Critically, recording a slip does NOT erase the user's data. It captures
 * the date, what triggered it, and what they learned, then resets only the
 * sober-date counter. Previous streaks become part of the user's recovery
 * story (best-streak, lifetime sober days), not a deletion.
 */
export interface Slip {
  id: string;
  /** ISO timestamp of when the slip happened */
  timestamp: string;
  /** Sober date that was active before this slip */
  previousSoberDate: string;
  /** Length of the streak that ended */
  previousStreakDays: number;
  /** Free-text trigger description */
  trigger?: string;
  /** Tag selections (Stress, Alone, Social, HALT, etc.) */
  triggerTags?: string[];
  /** What the user was feeling */
  feeling?: string;
  /** Reflection: what they'd do differently next time */
  reflection?: string;
}

export interface AffirmationFavorite {
  id: string;        // matches the curated affirmation id, or 'custom_xxx' for user-added
  text: string;
  category?: string;
  custom?: boolean;
  addedAt: number;
}

export type Screen =
  | 'home' | 'progress' | 'emergency' | 'journal'
  | 'heatmap' | 'settings' | 'backup' | 'milestone'
  | 'recovery' | 'insights' | 'puzzle' | 'cbt' | 'history' | 'groups'
  | 'slip' | 'sliplog' | 'crisis' | 'privacy';
