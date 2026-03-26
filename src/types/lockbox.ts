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
  // Reflection modal
  reflection_enabled: boolean;
  reflection_message: string | null;
  reflection_checklist: string | null; // JSON array stored as string
  // Penalty mode
  penalty_enabled: boolean;
  penalty_seconds: number;
  // Panic code
  panic_code_hash: string | null;
  panic_code_used: boolean;
  // Scheduled unlock
  scheduled_unlock_at: number | null;
  // Free tags
  tags: string | null; // JSON array e.g. '["urgent","work"]'
}

export interface CreateLockboxInput {
  name: string;
  content: string;
  category?: string;
  unlock_delay_seconds: number;
  relock_delay_seconds: number;
  reflection_enabled?: boolean;
  reflection_message?: string;
  reflection_checklist?: string; // JSON array as string
  penalty_enabled?: boolean;
  penalty_seconds?: number;
  panic_code?: string; // raw code, hashed backend-side
  scheduled_unlock_at?: number;
  tags?: string; // JSON array
}

export interface UpdateLockboxInput {
  id: number;
  name?: string;
  content?: string;
  category?: string;
  unlock_delay_seconds?: number;
  relock_delay_seconds?: number;
  reflection_enabled?: boolean;
  reflection_message?: string;
  reflection_checklist?: string;
  penalty_enabled?: boolean;
  penalty_seconds?: number;
  panic_code?: string;
  scheduled_unlock_at?: number;
  tags?: string;
}

export interface AccessLogEntry {
  id: number;
  lockbox_id: number;
  event_type: 'unlock_requested' | 'unlock_completed' | 'unlock_cancelled' | 'panic_used' | 'extend_delay' | string;
  timestamp: number;
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
  reflection_enabled?: boolean;
  reflection_message?: string | null;
  reflection_checklist?: string | null;
  penalty_enabled?: boolean;
  penalty_seconds?: number;
  tags?: string | null;
}

export type LockboxStatus = 'locked' | 'unlocking' | 'scheduled' | 'unlocked' | 'relocking';

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

/** Parse a JSON tags string from the DB into a string array */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

/** Serialize a string array into a JSON tags string for the DB */
export function serializeTags(tags: string[]): string | undefined {
  return tags.length > 0 ? JSON.stringify(tags) : undefined;
}

export const CATEGORIES = [
  'Passwords',
  'Financial',
  'Personal',
  'Work',
  'Social',
  'Gaming',
  'Other',
] as const;
