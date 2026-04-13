import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, ChevronDown, ChevronUp, Info, Lock, Wand2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { Tooltip } from './ui/Tooltip';
import { TagInput } from './ui/TagInput';
import { DateTimePicker } from './ui/DateTimePicker';
import { PasswordGeneratorModal } from './PasswordGeneratorModal';
import { useLockboxStore } from '../store';
import { useTranslation } from '../i18n';
import { CATEGORIES, parseTags, serializeTags } from '../types';
import { useEditPermissions } from '../hooks/useEditPermissions';
import type { Lockbox } from '../types';

interface EditLockboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockbox: Lockbox;
}

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

const convertToSeconds = (value: number, unit: TimeUnit): number => {
  switch (unit) {
    case 'seconds': return value;
    case 'minutes': return value * 60;
    case 'hours': return value * 3600;
    case 'days': return value * 86400;
  }
};

const secondsToUnit = (totalSeconds: number): { value: number; unit: TimeUnit } => {
  if (totalSeconds % 86400 === 0 && totalSeconds >= 86400) return { value: totalSeconds / 86400, unit: 'days' };
  if (totalSeconds % 3600 === 0 && totalSeconds >= 3600) return { value: totalSeconds / 3600, unit: 'hours' };
  if (totalSeconds % 60 === 0 && totalSeconds >= 60) return { value: totalSeconds / 60, unit: 'minutes' };
  return { value: totalSeconds, unit: 'seconds' };
};

interface CollapsibleSectionProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  locked?: boolean;
  lockedMessage?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, hint, children, defaultOpen = false, locked = false, lockedMessage,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => !locked && setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
          locked
            ? 'bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed opacity-60'
            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
            {locked && <Lock className="h-3 w-3 text-gray-400" />}
          </div>
          {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>}
          {locked && lockedMessage && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{lockedMessage}</p>
          )}
        </div>
        {!locked && (open
          ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        )}
      </button>
      {open && !locked && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

interface FieldWithTooltipProps {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}

const FieldWithTooltip: React.FC<FieldWithTooltipProps> = ({ label, tooltip, children }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
        </Tooltip>
      )}
    </div>
    {children}
  </div>
);

export const EditLockboxModal: React.FC<EditLockboxModalProps> = ({ isOpen, onClose, lockbox }) => {
  const { t } = useTranslation();
  const updateLockbox = useLockboxStore((state) => state.updateLockbox);
  const perms = useEditPermissions(lockbox);

  // Basic fields
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Delay fields
  const [unlockDelay, setUnlockDelay] = useState(5);
  const [unlockUnit, setUnlockUnit] = useState<TimeUnit>('minutes');
  const [relockDelay, setRelockDelay] = useState(1);
  const [relockUnit, setRelockUnit] = useState<TimeUnit>('hours');

  // Reflection
  const [reflectionEnabled, setReflectionEnabled] = useState(false);
  const [reflectionMessage, setReflectionMessage] = useState('');
  const [reflectionChecklistRaw, setReflectionChecklistRaw] = useState('');

  // Penalty
  const [penaltyEnabled, setPenaltyEnabled] = useState(false);
  const [penaltyDelay, setPenaltyDelay] = useState(30);
  const [penaltyUnit, setPenaltyUnit] = useState<TimeUnit>('minutes');

  // Scheduled unlock
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Panic code (only editable when unlocked)
  const [panicCode, setPanicCode] = useState('');
  const [changePanic, setChangePanic] = useState(false);

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Populate form from lockbox whenever it opens
  useEffect(() => {
    if (!isOpen) return;

    setName(lockbox.name);
    setContent(''); // content only filled when unlocked via fetchLockboxDecrypted
    setCategory(lockbox.category ?? '');
    setTags(parseTags(lockbox.tags));

    const ul = secondsToUnit(lockbox.unlock_delay_seconds);
    setUnlockDelay(ul.value);
    setUnlockUnit(ul.unit);

    const rl = secondsToUnit(lockbox.relock_delay_seconds);
    setRelockDelay(rl.value);
    setRelockUnit(rl.unit);

    setReflectionEnabled(lockbox.reflection_enabled);
    setReflectionMessage(lockbox.reflection_message ?? '');
    const checklist = lockbox.reflection_checklist
      ? (JSON.parse(lockbox.reflection_checklist) as string[]).join('\n')
      : '';
    setReflectionChecklistRaw(checklist);

    setPenaltyEnabled(lockbox.penalty_enabled);
    const pl = secondsToUnit(lockbox.penalty_seconds || 300);
    setPenaltyDelay(pl.value);
    setPenaltyUnit(pl.unit);

    if (lockbox.scheduled_unlock_at) {
      setScheduledEnabled(true);
      const d = new Date(lockbox.scheduled_unlock_at);
      setScheduledDateTime(d.toISOString().slice(0, 16));
    } else {
      setScheduledEnabled(false);
      setScheduledDateTime('');
    }

    setPanicCode('');
    setChangePanic(false);
    setValidationError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lockbox.id]);

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError(t('createLockbox.nameRequired'));
      return;
    }

    const newUnlockSeconds = convertToSeconds(unlockDelay, unlockUnit);
    const newRelockSeconds = convertToSeconds(relockDelay, relockUnit);

    // Frontend guard: cannot reduce delay while locked
    if (!perms.canReduceDelay) {
      if (newUnlockSeconds < lockbox.unlock_delay_seconds) {
        setValidationError(t('editLockbox.cannotReduceDelay'));
        return;
      }
      if (newRelockSeconds < lockbox.relock_delay_seconds) {
        setValidationError(t('editLockbox.cannotReduceRelockDelay'));
        return;
      }
    }

    let scheduledUnlockAt: number | undefined;
    if (perms.canAddOrRemoveSchedule || perms.canPostponeSchedule) {
      if (scheduledEnabled && scheduledDateTime) {
        scheduledUnlockAt = new Date(scheduledDateTime).getTime();
        if (isNaN(scheduledUnlockAt) || scheduledUnlockAt <= Date.now()) {
          setValidationError(t('editLockbox.scheduledMustBeFuture'));
          return;
        }
        // When only postpone is allowed, prevent moving earlier
        if (!perms.canAddOrRemoveSchedule && lockbox.scheduled_unlock_at) {
          if (scheduledUnlockAt < lockbox.scheduled_unlock_at) {
            setValidationError(t('editLockbox.cannotMoveScheduleEarlier'));
            return;
          }
        }
      }
    }

    const reflectionChecklist = reflectionEnabled && reflectionChecklistRaw.trim()
      ? JSON.stringify(reflectionChecklistRaw.split('\n').map((l) => l.trim()).filter(Boolean))
      : undefined;

    const updates: Record<string, unknown> = {
      name: name.trim(),
      category: category || undefined,
      clear_category: !category,
      tags: serializeTags(tags),
      clear_tags: tags.length === 0,
      unlock_delay_seconds: newUnlockSeconds,
      relock_delay_seconds: newRelockSeconds,
      reflection_enabled: reflectionEnabled,
      reflection_message: reflectionEnabled && reflectionMessage.trim() ? reflectionMessage.trim() : undefined,
      clear_reflection_message: !(reflectionEnabled && reflectionMessage.trim()),
      reflection_checklist: reflectionChecklist,
      clear_reflection_checklist: !reflectionChecklist,
      penalty_enabled: penaltyEnabled,
      penalty_seconds: penaltyEnabled ? convertToSeconds(penaltyDelay, penaltyUnit) : 0,
      scheduled_unlock_at: scheduledEnabled && scheduledDateTime ? scheduledUnlockAt : undefined,
    };

    if (perms.canEditContent && content.trim()) {
      updates.content = content.trim();
    }

    if (perms.canEditPanicCode && (changePanic || !lockbox.panic_code_hash)) {
      updates.panic_code = panicCode.trim() || undefined;
    }

    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateLockbox(lockbox.id, updates as any);
      toast.success(t('editLockbox.saveSuccess'));
      onClose();
    } catch (err) {
      const msg = String(err);
      if (msg.includes('while locked')) {
        setValidationError(t('editLockbox.blockedByLockState'));
      } else {
        toast.error(t('editLockbox.saveError'));
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeUnitOptions = [
    { value: 'seconds', label: t('timeUnits.seconds') },
    { value: 'minutes', label: t('timeUnits.minutes') },
    { value: 'hours', label: t('timeUnits.hours') },
    { value: 'days', label: t('timeUnits.days') },
  ];

  const categoryOptions = [
    { value: '', label: t('createLockbox.noCategory') },
    ...CATEGORIES.map((cat) => ({ value: cat, label: t(`category.${cat}` as 'category.Passwords') })),
  ];

  const lockedFieldMessage = t('editLockbox.availableAfterUnlock');
  const minScheduledDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('editLockbox.title')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {validationError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {validationError}
          </div>
        )}

        {/* Name — always editable */}
        <Input
          label={t('createLockbox.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('createLockbox.namePlaceholder')}
          required
        />

        {/* Content — only when unlocked */}
        {perms.canEditContent && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createLockbox.content')}
              </label>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(true)}
                className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {t('createLockbox.generatePassword')}
              </button>
            </div>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('editLockbox.contentPlaceholder')}
              rows={3}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('editLockbox.contentHint')}
            </p>
          </div>
        )}

        {/* Category & Tags — always editable */}
        <Select
          label={t('createLockbox.category')}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />

        <TagInput
          label={t('tags.label')}
          tags={tags}
          onChange={setTags}
          placeholder={t('tags.placeholder')}
          helperText={t('tags.hint')}
        />

        {/* Delays */}
        <div className="grid grid-cols-2 gap-4">
          <FieldWithTooltip label={t('createLockbox.unlockDelay')} tooltip={t('createLockbox.unlockDelayHint')}>
            <div className="flex gap-2">
              <Input
                type="number"
                min={perms.canReduceDelay ? 1 : Math.ceil(lockbox.unlock_delay_seconds / (unlockUnit === 'days' ? 86400 : unlockUnit === 'hours' ? 3600 : unlockUnit === 'minutes' ? 60 : 1))}
                value={unlockDelay}
                onChange={(e) => setUnlockDelay(Number(e.target.value))}
                className="w-20"
              />
              <Select
                value={unlockUnit}
                onChange={(e) => setUnlockUnit(e.target.value as TimeUnit)}
                options={timeUnitOptions}
              />
            </div>
            {!perms.canReduceDelay && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {t('editLockbox.canOnlyIncrease')}
              </p>
            )}
          </FieldWithTooltip>

          <FieldWithTooltip label={t('createLockbox.relockDelay')} tooltip={t('createLockbox.relockDelayHint')}>
            <div className="flex gap-2">
              <Input
                type="number"
                min={perms.canReduceDelay ? 1 : Math.ceil(lockbox.relock_delay_seconds / (relockUnit === 'days' ? 86400 : relockUnit === 'hours' ? 3600 : relockUnit === 'minutes' ? 60 : 1))}
                value={relockDelay}
                onChange={(e) => setRelockDelay(Number(e.target.value))}
                className="w-20"
              />
              <Select
                value={relockUnit}
                onChange={(e) => setRelockUnit(e.target.value as TimeUnit)}
                options={timeUnitOptions}
              />
            </div>
            {!perms.canReduceDelay && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {t('editLockbox.canOnlyIncrease')}
              </p>
            )}
          </FieldWithTooltip>
        </div>

        {/* Advanced options */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('createLockbox.advancedOptions')}
          </p>

          {/* Reflection */}
          <CollapsibleSection
            title={t('createLockbox.reflectionSection')}
            hint={t('createLockbox.reflectionSectionHint')}
            defaultOpen={lockbox.reflection_enabled}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reflectionEnabled}
                onChange={(e) => setReflectionEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('createLockbox.reflectionEnabled')}</span>
            </label>
            {reflectionEnabled && (
              <>
                <Input
                  label={t('createLockbox.reflectionMessage')}
                  value={reflectionMessage}
                  onChange={(e) => setReflectionMessage(e.target.value)}
                  placeholder={t('createLockbox.reflectionMessagePlaceholder')}
                  helperText={t('createLockbox.reflectionMessageHint')}
                />
                <FieldWithTooltip label={t('createLockbox.reflectionChecklist')} tooltip={t('createLockbox.reflectionChecklistHint')}>
                  <TextArea
                    value={reflectionChecklistRaw}
                    onChange={(e) => setReflectionChecklistRaw(e.target.value)}
                    placeholder={t('createLockbox.reflectionChecklistPlaceholder')}
                    rows={3}
                  />
                </FieldWithTooltip>
              </>
            )}
          </CollapsibleSection>

          {/* Penalty */}
          <CollapsibleSection
            title={t('createLockbox.penaltySection')}
            hint={t('createLockbox.penaltySectionHint')}
            defaultOpen={lockbox.penalty_enabled}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={penaltyEnabled}
                onChange={(e) => setPenaltyEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('createLockbox.penaltyEnabled')}</span>
            </label>
            {penaltyEnabled && (
              <FieldWithTooltip label={t('createLockbox.penaltyDelay')} tooltip={t('createLockbox.penaltyDelayHint')}>
                <div className="flex gap-2">
                  <Input type="number" min={1} value={penaltyDelay} onChange={(e) => setPenaltyDelay(Number(e.target.value))} className="w-20" />
                  <Select value={penaltyUnit} onChange={(e) => setPenaltyUnit(e.target.value as TimeUnit)} options={timeUnitOptions} />
                </div>
              </FieldWithTooltip>
            )}
          </CollapsibleSection>

          {/* Scheduled unlock */}
          <CollapsibleSection
            title={t('createLockbox.scheduledSection')}
            hint={t('createLockbox.scheduledSectionHint')}
            defaultOpen={!!lockbox.scheduled_unlock_at}
            locked={!perms.canPostponeSchedule}
            lockedMessage={lockedFieldMessage}
          >
            {perms.canAddOrRemoveSchedule && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduledEnabled}
                  onChange={(e) => setScheduledEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('createLockbox.scheduledEnabled')}</span>
              </label>
            )}
            {/* In scheduled state: can only postpone, not remove */}
            {!perms.canAddOrRemoveSchedule && perms.canPostponeSchedule && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t('editLockbox.scheduledPostponeOnly')}
              </p>
            )}
            {(scheduledEnabled || (!perms.canAddOrRemoveSchedule && perms.canPostponeSchedule)) && (
              <FieldWithTooltip label={t('createLockbox.scheduledAt')} tooltip={t('createLockbox.scheduledAtHint')}>
                <DateTimePicker
                  value={scheduledDateTime}
                  onChange={setScheduledDateTime}
                  min={
                    !perms.canAddOrRemoveSchedule && lockbox.scheduled_unlock_at
                      ? new Date(lockbox.scheduled_unlock_at + 60000).toISOString().slice(0, 16)
                      : minScheduledDate
                  }
                />
              </FieldWithTooltip>
            )}
          </CollapsibleSection>

          {/* Panic code */}
          <CollapsibleSection
            title={t('createLockbox.panicSection')}
            hint={t('createLockbox.panicSectionHint')}
            locked={!perms.canEditPanicCode}
            lockedMessage={lockedFieldMessage}
          >
            {lockbox.panic_code_hash && (
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={changePanic}
                  onChange={(e) => setChangePanic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('editLockbox.changePanicCode')}</span>
              </label>
            )}
            {(changePanic || !lockbox.panic_code_hash) && (
              <FieldWithTooltip label={t('createLockbox.panicCode')} tooltip={t('createLockbox.panicCodeHint')}>
                <Input
                  type="password"
                  value={panicCode}
                  onChange={(e) => setPanicCode(e.target.value)}
                  placeholder={t('createLockbox.panicCodePlaceholder')}
                  helperText={t('createLockbox.panicCodeHint')}
                />
              </FieldWithTooltip>
            )}
          </CollapsibleSection>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {t('common.save')}
          </Button>
        </div>
      </form>

      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onUse={(pw) => setContent(pw)}
        layer="high"
      />
    </Modal>
  );
};
