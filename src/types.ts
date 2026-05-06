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
  notificationSettings?: {
    motivations: boolean;
    reminders: boolean;
    milestones: boolean;
    morningTime: string;  // "HH:MM"
    eveningTime: string;  // "HH:MM"
  };
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
  activity: string;
  duration?: number;
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

export type Screen =
  | 'home' | 'progress' | 'emergency' | 'journal' | 'buddy'
  | 'heatmap' | 'settings' | 'backup' | 'milestone'
  | 'recovery' | 'insights' | 'puzzle' | 'cbt' | 'history';
