import React, { useMemo, useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface DateTimePickerProps {
  value: string; // "YYYY-MM-DDTHH:MM" or ""
  onChange: (value: string) => void;
  min?: string; // "YYYY-MM-DDTHH:MM"
  className?: string;
}

interface Fields {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parseValue(value: string): Fields {
  if (!value) return { year: '', month: '', day: '', hour: '12', minute: '00' };
  const [datePart, timePart = '12:00'] = value.split('T');
  const [year = '', month = '', day = ''] = datePart.split('-');
  const [hour = '12', minute = '00'] = timePart.split(':');
  return { year, month, day, hour, minute };
}

function buildValue({ year, month, day, hour, minute }: Fields): string {
  if (!year || !month || !day) return '';
  return `${year}-${pad(Number(month))}-${pad(Number(day))}T${pad(Number(hour))}:${pad(Number(minute))}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const SelectWrapper: React.FC<{ width?: string; children: React.ReactNode }> = ({ width = 'w-16', children }) => (
  <div className={clsx('relative flex-shrink-0', width)}>
    {children}
    <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
      <svg className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
);

const selectClass =
  'w-full appearance-none pl-2 pr-6 py-2 ' +
  'border border-gray-300 dark:border-gray-600 rounded-lg ' +
  'bg-white dark:bg-gray-700 ' +
  'text-gray-900 dark:text-gray-100 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer';

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, min, className }) => {
  // Internal fields are decoupled from the parent value to avoid resetting on
  // incomplete selections (e.g. picking day before year/month are set).
  const [fields, setFields] = useState<Fields>(() => parseValue(value));

  // Track last value we emitted so we can sync in only on external changes.
  const lastEmitted = useRef(value);

  useEffect(() => {
    // Sync inward only when the parent sets a new value from outside
    // (e.g. form reset), not from our own onChange calls.
    if (value !== lastEmitted.current) {
      setFields(parseValue(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const minParsed = min ? parseValue(min) : null;
  const minYear = minParsed ? Number(minParsed.year) : new Date().getFullYear();

  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => minYear + i),
    [minYear]
  );

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad(i + 1)),
    []
  );

  const maxDay = fields.year && fields.month
    ? daysInMonth(Number(fields.year), Number(fields.month))
    : 31;

  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => pad(i + 1)),
    [maxDay]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad(i)), []);

  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const update = (field: keyof Fields, val: string) => {
    setFields((prev) => {
      const next = { ...prev, [field]: val };
      // Clamp day if it exceeds the new month/year
      if (next.year && next.month) {
        const max = daysInMonth(Number(next.year), Number(next.month));
        if (Number(next.day) > max) next.day = pad(max);
      }
      const built = buildValue(next);
      lastEmitted.current = built;
      onChange(built); // '' when incomplete → parent knows no date is selected
      return next;
    });
  };

  const sep = (char: string) => (
    <span className="text-gray-400 dark:text-gray-500 select-none">{char}</span>
  );

  return (
    <div className={clsx('flex flex-wrap gap-1.5 items-center', className)}>
      <SelectWrapper width="w-16">
        <select value={fields.day} onChange={(e) => update('day', e.target.value)} className={selectClass} aria-label="Day">
          <option value="">DD</option>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </SelectWrapper>

      {sep('/')}

      <SelectWrapper width="w-16">
        <select value={fields.month} onChange={(e) => update('month', e.target.value)} className={selectClass} aria-label="Month">
          <option value="">MM</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </SelectWrapper>

      {sep('/')}

      <SelectWrapper width="w-24">
        <select value={fields.year} onChange={(e) => update('year', e.target.value)} className={selectClass} aria-label="Year">
          <option value="">YYYY</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </SelectWrapper>

      {sep('—')}

      <SelectWrapper width="w-16">
        <select value={fields.hour} onChange={(e) => update('hour', e.target.value)} className={selectClass} aria-label="Hour">
          {hours.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </SelectWrapper>

      {sep(':')}

      <SelectWrapper width="w-16">
        <select value={fields.minute} onChange={(e) => update('minute', e.target.value)} className={selectClass} aria-label="Minute">
          {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </SelectWrapper>
    </div>
  );
};
