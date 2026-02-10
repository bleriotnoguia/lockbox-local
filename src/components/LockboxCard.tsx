import React from 'react';
import { Lock, Unlock, Clock, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import type { Lockbox } from '../types';
import { useCountdown, formatTimeRemaining } from '../hooks/useCountdown';
import { useLockboxStatus, getStatusColor, getStatusKey } from '../hooks/useLockboxStatus';
import { useTranslation } from '../i18n';

interface LockboxCardProps {
  lockbox: Lockbox;
  onClick: () => void;
  isSelected?: boolean;
}

export const LockboxCard: React.FC<LockboxCardProps> = ({
  lockbox,
  onClick,
  isSelected = false,
}) => {
  const status = useLockboxStatus(lockbox);
  const { t } = useTranslation();

  const targetTimestamp = status === 'unlocking' 
    ? lockbox.unlock_timestamp 
    : status === 'unlocked' 
      ? lockbox.relock_timestamp 
      : null;
  
  const timeRemaining = useCountdown(targetTimestamp);

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-[1.01]',
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'p-2 rounded-lg',
              status === 'locked' || status === 'unlocking'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            )}
          >
            {status === 'locked' || status === 'unlocking' ? (
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {lockbox.name}
            </h3>
            {lockbox.category && (
              <div className="flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t(`category.${lockbox.category}` as 'category.Passwords')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium text-white',
              getStatusColor(status)
            )}
          >
            {t(getStatusKey(status))}
          </span>
        </div>
      </div>

      {/* Timer */}
      {timeRemaining && timeRemaining.total > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400 animate-pulse" />
          <span className="font-mono text-gray-600 dark:text-gray-300">
            {status === 'unlocking' ? t('lockboxCard.unlockIn') : t('lockboxCard.relockIn')}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
