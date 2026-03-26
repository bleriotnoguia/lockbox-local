import React from 'react';
import { Lock, Unlock, Clock, Tag, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import type { Lockbox } from '../types';
import { parseTags } from '../types';
import { useCountdown, formatTimeRemaining } from '../hooks/useCountdown';
import { useLockboxStatus, getStatusColor, getStatusKey } from '../hooks/useLockboxStatus';
import { useTranslation } from '../i18n';

interface LockboxCardProps {
  lockbox: Lockbox;
  onClick: () => void;
  isSelected?: boolean;
}

export const LockboxCard: React.FC<LockboxCardProps> = ({ lockbox, onClick, isSelected = false }) => {
  const status = useLockboxStatus(lockbox);
  const { t } = useTranslation();

  const targetTimestamp =
    status === 'unlocking'
      ? lockbox.unlock_timestamp
      : status === 'scheduled'
        ? lockbox.scheduled_unlock_at
        : status === 'unlocked'
          ? lockbox.relock_timestamp
          : null;

  const timeRemaining = useCountdown(targetTimestamp);
  const isUnlocked = status === 'unlocked';
  const isScheduled = status === 'scheduled';

  const getTimerLabel = () => {
    if (status === 'unlocking') return t('lockboxCard.unlockIn');
    if (status === 'scheduled') return t('lockboxCard.scheduledIn');
    return t('lockboxCard.relockIn');
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:scale-[1.01]',
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'p-2 rounded-lg',
            isUnlocked
              ? 'bg-green-100 dark:bg-green-900/30'
              : isScheduled
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
          )}>
            {isUnlocked ? (
              <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : isScheduled ? (
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{lockbox.name}</h3>
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

        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0', getStatusColor(status))}>
          {t(getStatusKey(status))}
        </span>
      </div>

      {/* Tags */}
      {parseTags(lockbox.tags).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {parseTags(lockbox.tags).slice(0, 4).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
              #{tag}
            </span>
          ))}
          {parseTags(lockbox.tags).length > 4 && (
            <span className="px-1.5 py-0.5 text-gray-400 dark:text-gray-500 text-xs">
              +{parseTags(lockbox.tags).length - 4}
            </span>
          )}
        </div>
      )}

      {timeRemaining && timeRemaining.total > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400 animate-pulse shrink-0" />
          <span className="font-mono text-gray-600 dark:text-gray-300">
            {getTimerLabel()}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};
