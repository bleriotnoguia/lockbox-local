import { useMemo } from 'react';
import type { Lockbox, LockboxStatus } from '../types';

export function useLockboxStatus(lockbox: Lockbox): LockboxStatus {
  return useMemo(() => {
    const now = Date.now();

    if (lockbox.is_locked) {
      if (lockbox.unlock_timestamp && lockbox.unlock_timestamp > now) {
        return 'unlocking';
      }
      if (lockbox.scheduled_unlock_at && lockbox.scheduled_unlock_at > now) {
        return 'scheduled';
      }
      return 'locked';
    }

    if (lockbox.relock_timestamp && lockbox.relock_timestamp > now) {
      return 'unlocked';
    }

    return 'locked';
  }, [lockbox.is_locked, lockbox.unlock_timestamp, lockbox.relock_timestamp, lockbox.scheduled_unlock_at]);
}

export function getStatusColor(status: LockboxStatus): string {
  switch (status) {
    case 'locked':
      return 'bg-red-500';
    case 'unlocking':
      return 'bg-yellow-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'unlocked':
      return 'bg-green-500';
    case 'relocking':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusKey(status: LockboxStatus): `status.${string}` {
  switch (status) {
    case 'locked':
      return 'status.locked';
    case 'unlocking':
      return 'status.unlocking';
    case 'scheduled':
      return 'status.scheduled';
    case 'unlocked':
      return 'status.unlocked';
    case 'relocking':
      return 'status.relocking';
    default:
      return 'status.unknown';
  }
}
