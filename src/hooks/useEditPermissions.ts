import { useMemo } from 'react';
import type { Lockbox } from '../types';
import { useLockboxStatus } from './useLockboxStatus';

export interface EditPermissions {
  /** Name, category, tags, reflection settings, penalty settings — always editable */
  canEditMetadata: boolean;
  /** Secret content — only when unlocked (decrypted content is available) */
  canEditContent: boolean;
  /** Reduce unlock_delay_seconds or relock_delay_seconds — only when unlocked */
  canReduceDelay: boolean;
  /** Increase unlock_delay_seconds or relock_delay_seconds — always */
  canIncreaseDelay: boolean;
  /**
   * Modify scheduled_unlock_at:
   * - Add/remove schedule: only when unlocked
   * - Push to a later date: also allowed when in "scheduled" state
   * - Move to earlier date: only when unlocked
   */
  canAddOrRemoveSchedule: boolean;
  canPostponeSchedule: boolean;
  /** Set or change the emergency (panic) code — only when unlocked */
  canEditPanicCode: boolean;
}

export function useEditPermissions(lockbox: Lockbox): EditPermissions {
  const status = useLockboxStatus(lockbox);

  return useMemo((): EditPermissions => {
    const isUnlocked = status === 'unlocked';
    const isScheduled = status === 'scheduled';

    return {
      canEditMetadata: true,
      canEditContent: isUnlocked,
      canReduceDelay: isUnlocked,
      canIncreaseDelay: true,
      canAddOrRemoveSchedule: isUnlocked,
      canPostponeSchedule: isUnlocked || isScheduled,
      canEditPanicCode: isUnlocked,
    };
  }, [status]);
}
