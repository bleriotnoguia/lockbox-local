import React, { useState, useEffect } from 'react';
import { Brain, CheckSquare, Square, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useTranslation } from '../i18n';

interface ReflectionModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string | null;
  checklist?: string | null; // JSON array as string
  countdownSeconds?: number;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  checklist,
  countdownSeconds = 10,
}) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

  const checklistItems: string[] = React.useMemo(() => {
    if (!checklist) return [];
    try {
      const parsed = JSON.parse(checklist);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [checklist]);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(countdownSeconds);
      setCheckedItems(checklistItems.map(() => false));
      return;
    }
    setSecondsLeft(countdownSeconds);
    setCheckedItems(checklistItems.map(() => false));
  }, [isOpen, countdownSeconds, checklistItems]);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  const allChecked = checkedItems.length === 0 || checkedItems.every(Boolean);
  const canConfirm = secondsLeft === 0 && allChecked;

  const displayMessage = message || t('reflection.defaultMessage');
  const progress = ((countdownSeconds - secondsLeft) / countdownSeconds) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('reflection.title')} size="md">
      <div className="space-y-5">
        {/* Brain icon + message */}
        <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{displayMessage}</p>
        </div>

        {/* Countdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              {secondsLeft > 0
                ? t('reflection.countdown', { seconds: secondsLeft })
                : t('reflection.countdownDone')}
            </div>
            <span
              className={clsx(
                'text-2xl font-mono font-bold transition-colors',
                secondsLeft > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              )}
            >
              {secondsLeft}s
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-1000',
                secondsLeft > 0
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        {checklistItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('reflection.checklistTitle')}
            </p>
            <div className="space-y-2">
              {checklistItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const next = [...checkedItems];
                    next[idx] = !next[idx];
                    setCheckedItems(next);
                  }}
                  disabled={secondsLeft > 0}
                  className={clsx(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                    checkedItems[idx]
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600',
                    secondsLeft > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'
                  )}
                >
                  {checkedItems[idx] ? (
                    <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <span className={clsx(
                    'text-sm',
                    checkedItems[idx]
                      ? 'text-green-800 dark:text-green-200 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
            {!allChecked && secondsLeft === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('reflection.checklistRequired')}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {t('reflection.cancelUnlock')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex-1"
          >
            {t('reflection.confirmUnlock')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
