import { useMemo } from 'react';
import type { Lockbox, LockboxStatus } from '../types';

export function useLockboxStatus(lockbox: Lockbox): LockboxStatus {
  return useMemo(() => {
    const now = Date.now();

    if (lockbox.is_locked) {
      if (lockbox.unlock_timestamp && lockbox.unlock_timestamp > now) {
        return 'unlocking';
      }
      return 'locked';
    }

    if (lockbox.relock_timestamp && lockbox.relock_timestamp > now) {
      return 'unlocked';
    }

    return 'locked'; // Should relock
  }, [lockbox.is_locked, lockbox.unlock_timestamp, lockbox.relock_timestamp]);
}

export function getStatusColor(status: LockboxStatus): string {
  switch (status) {
    case 'locked':
      return 'bg-red-500';
    case 'unlocking':
      return 'bg-yellow-500';
    case 'unlocked':
      return 'bg-green-500';
    case 'relocking':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusText(status: LockboxStatus): string {
  switch (status) {
    case 'locked':
      return 'Verrouillé';
    case 'unlocking':
      return 'Déverrouillage...';
    case 'unlocked':
      return 'Déverrouillé';
    case 'relocking':
      return 'Reverrouillage...';
    default:
      return 'Inconnu';
  }
}
