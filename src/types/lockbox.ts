export interface Lockbox {
  id: number;
  name: string;
  content: string;
  category: string | null;
  is_locked: boolean;
  unlock_delay_seconds: number;
  relock_delay_seconds: number;
  unlock_timestamp: number | null;
  relock_timestamp: number | null;
  created_at: number;
  updated_at: number;
}

export interface CreateLockboxInput {
  name: string;
  content: string;
  category?: string;
  unlock_delay_seconds: number;
  relock_delay_seconds: number;
}

export interface UpdateLockboxInput {
  id: number;
  name?: string;
  content?: string;
  category?: string;
  unlock_delay_seconds?: number;
  relock_delay_seconds?: number;
}

export interface ExportData {
  version: string;
  exported_at: number;
  lockboxes: ExportLockbox[];
}

export interface ExportLockbox {
  name: string;
  content: string;
  category: string | null;
  unlock_delay_seconds: number;
  relock_delay_seconds: number;
}

export type LockboxStatus = 'locked' | 'unlocking' | 'unlocked' | 'relocking';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const DELAY_PRESETS = {
  seconds: [30, 60, 120, 300],
  minutes: [5, 10, 15, 30, 60],
  hours: [1, 2, 4, 8, 12, 24],
  days: [1, 2, 3, 7],
} as const;

export const CATEGORIES = [
  'Passwords',
  'Financial',
  'Personal',
  'Work',
  'Social',
  'Gaming',
  'Other',
] as const;
