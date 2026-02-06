import { useState, useEffect, useCallback } from 'react';
import type { TimeRemaining } from '../types';

export function useCountdown(targetTimestamp: number | null): TimeRemaining | null {
  const calculateTimeRemaining = useCallback((): TimeRemaining | null => {
    if (!targetTimestamp) return null;

    const now = Date.now();
    const difference = targetTimestamp - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  }, [targetTimestamp]);

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    calculateTimeRemaining
  );

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining && remaining.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    return () => clearInterval(timer);
  }, [targetTimestamp, calculateTimeRemaining]);

  return timeRemaining;
}

export function formatTimeRemaining(time: TimeRemaining | null): string {
  if (!time || time.total <= 0) return '00:00:00';

  const parts: string[] = [];

  if (time.days > 0) {
    parts.push(`${time.days}j`);
  }

  const hours = String(time.hours).padStart(2, '0');
  const minutes = String(time.minutes).padStart(2, '0');
  const seconds = String(time.seconds).padStart(2, '0');

  if (time.days > 0) {
    parts.push(`${hours}:${minutes}:${seconds}`);
  } else {
    parts.push(`${hours}:${minutes}:${seconds}`);
  }

  return parts.join(' ');
}

export function formatDelay(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} jour${days > 1 ? 's' : ''}`;
}
