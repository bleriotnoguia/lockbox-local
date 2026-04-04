import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, ChevronDown, ChevronUp, Info, Wand2 } from 'lucide-react';
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
import { CATEGORIES, serializeTags } from '../types';

interface CreateLockboxModalProps {
  isOpen: boolean;
  onClose: () => void;
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

interface CollapsibleProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleProps> = ({ title, hint, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
      >
        <div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
          {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{hint}</p>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
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

export const CreateLockboxModal: React.FC<CreateLockboxModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const createLockbox = useLockboxStore((state) => state.createLockbox);

  // Basic fields
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
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

  // Tags
  const [tags, setTags] = useState<string[]>([]);

  // Panic code
  const [panicCode, setPanicCode] = useState('');

  // Scheduled unlock  — stored as "YYYY-MM-DDTHH:MM"
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setName(''); setContent(''); setCategory('');
    setUnlockDelay(5); setUnlockUnit('minutes');
    setRelockDelay(1); setRelockUnit('hours');
    setReflectionEnabled(false); setReflectionMessage(''); setReflectionChecklistRaw('');
    setPenaltyEnabled(false); setPenaltyDelay(30); setPenaltyUnit('minutes');
    setTags([]);
    setPanicCode('');
    setScheduledEnabled(false); setScheduledDateTime('');
    setIsGeneratorOpen(false);
    setValidationError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) { setValidationError(t('createLockbox.nameRequired')); return; }
    if (!content.trim()) { setValidationError(t('createLockbox.contentRequired')); return; }

    const reflectionChecklist = reflectionEnabled && reflectionChecklistRaw.trim()
      ? JSON.stringify(reflectionChecklistRaw.split('\n').map((l) => l.trim()).filter(Boolean))
      : undefined;

    let scheduledUnlockAt: number | undefined;
    if (scheduledEnabled && scheduledDateTime) {
      scheduledUnlockAt = new Date(scheduledDateTime).getTime();
      if (isNaN(scheduledUnlockAt) || scheduledUnlockAt <= Date.now()) {
        setValidationError('La date de déverrouillage planifié doit être dans le futur.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createLockbox({
        name: name.trim(),
        content: content.trim(),
        category: category || undefined,
        unlock_delay_seconds: convertToSeconds(unlockDelay, unlockUnit),
        relock_delay_seconds: convertToSeconds(relockDelay, relockUnit),
        reflection_enabled: reflectionEnabled,
        reflection_message: reflectionEnabled && reflectionMessage.trim() ? reflectionMessage.trim() : undefined,
        reflection_checklist: reflectionChecklist,
        penalty_enabled: penaltyEnabled,
        penalty_seconds: penaltyEnabled ? convertToSeconds(penaltyDelay, penaltyUnit) : 0,
        panic_code: panicCode.trim() || undefined,
        scheduled_unlock_at: scheduledUnlockAt,
        tags: serializeTags(tags),
      });
      toast.success(t('createLockbox.createSuccess'));
      resetForm();
      onClose();
    } catch (err) {
      toast.error(t('createLockbox.createError'));
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('createLockbox.title')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {validationError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {validationError}
          </div>
        )}

        {/* Basic fields */}
        <Input
          label={t('createLockbox.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('createLockbox.namePlaceholder')}
          required
        />

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
            placeholder={t('createLockbox.contentPlaceholder')}
            rows={3}
            required
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <FieldWithTooltip label={t('createLockbox.unlockDelay')} tooltip={t('createLockbox.unlockDelayHint')}>
            <div className="flex gap-2">
              <Input type="number" min={1} value={unlockDelay} onChange={(e) => setUnlockDelay(Number(e.target.value))} className="w-20" />
              <Select value={unlockUnit} onChange={(e) => setUnlockUnit(e.target.value as TimeUnit)} options={timeUnitOptions} />
            </div>
          </FieldWithTooltip>
          <FieldWithTooltip label={t('createLockbox.relockDelay')} tooltip={t('createLockbox.relockDelayHint')}>
            <div className="flex gap-2">
              <Input type="number" min={1} value={relockDelay} onChange={(e) => setRelockDelay(Number(e.target.value))} className="w-20" />
              <Select value={relockUnit} onChange={(e) => setRelockUnit(e.target.value as TimeUnit)} options={timeUnitOptions} />
            </div>
          </FieldWithTooltip>
        </div>

        {/* Advanced options */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('createLockbox.advancedOptions')}
          </p>

          {/* Reflection modal */}
          <CollapsibleSection
            title={t('createLockbox.reflectionSection')}
            hint={t('createLockbox.reflectionSectionHint')}
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
                    helperText={t('createLockbox.reflectionChecklistHint')}
                  />
                </FieldWithTooltip>
              </>
            )}
          </CollapsibleSection>

          {/* Penalty mode */}
          <CollapsibleSection
            title={t('createLockbox.penaltySection')}
            hint={t('createLockbox.penaltySectionHint')}
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
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduledEnabled}
                onChange={(e) => setScheduledEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('createLockbox.scheduledEnabled')}</span>
            </label>

            {scheduledEnabled && (
              <FieldWithTooltip label={t('createLockbox.scheduledAt')} tooltip={t('createLockbox.scheduledAtHint')}>
                <DateTimePicker
                  value={scheduledDateTime}
                  onChange={setScheduledDateTime}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                />
              </FieldWithTooltip>
            )}
          </CollapsibleSection>

          {/* Panic code */}
          <CollapsibleSection
            title={t('createLockbox.panicSection')}
            hint={t('createLockbox.panicSectionHint')}
          >
            <FieldWithTooltip label={t('createLockbox.panicCode')} tooltip={t('createLockbox.panicCodeHint')}>
              <Input
                type="password"
                value={panicCode}
                onChange={(e) => setPanicCode(e.target.value)}
                placeholder={t('createLockbox.panicCodePlaceholder')}
                helperText={t('createLockbox.panicCodeHint')}
              />
            </FieldWithTooltip>
          </CollapsibleSection>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('createLockbox.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createLockbox.create')}
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
