import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useTranslation } from '../i18n';

interface ExtendDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (additionalSeconds: number) => Promise<void>;
  currentDelaySeconds: number;
}

type TimeUnit = 'minutes' | 'hours' | 'days';

export const ExtendDelayModal: React.FC<ExtendDelayModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentDelaySeconds,
}) => {
  const { t, formatDelay } = useTranslation();
  const [value, setValue] = useState(30);
  const [unit, setUnit] = useState<TimeUnit>('minutes');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertToSeconds = (v: number, u: TimeUnit): number => {
    switch (u) {
      case 'minutes': return v * 60;
      case 'hours': return v * 3600;
      case 'days': return v * 86400;
    }
  };

  const additionalSeconds = convertToSeconds(value, unit);

  const handleConfirm = async () => {
    if (additionalSeconds <= 0) return;
    setIsSubmitting(true);
    try {
      await onConfirm(additionalSeconds);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitOptions = [
    { value: 'minutes', label: t('timeUnits.minutes') },
    { value: 'hours', label: t('timeUnits.hours') },
    { value: 'days', label: t('timeUnits.days') },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('extendDelay.title')} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('extendDelay.description')}
        </p>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('extendDelay.currentDelay', { delay: formatDelay(currentDelaySeconds) })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('extendDelay.addTime')}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(Math.max(1, Number(e.target.value)))}
              className="w-24"
            />
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as TimeUnit)}
              options={unitOptions}
            />
          </div>
          {additionalSeconds > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              +{formatDelay(additionalSeconds)} → {formatDelay(currentDelaySeconds + additionalSeconds)}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t('extendDelay.warning')}
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} isLoading={isSubmitting}>
            {t('extendDelay.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
