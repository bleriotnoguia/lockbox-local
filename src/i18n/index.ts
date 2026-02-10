import { useCallback } from 'react';
import { useLocaleStore } from './localeStore';
import { translations } from './translations';

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`));
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const str = getNested(translations[locale] as Record<string, unknown>, key as string);
      const result = str ?? getNested(translations.en as Record<string, unknown>, key as string) ?? key;
      return vars ? interpolate(result, vars) : result;
    },
    [locale]
  );

  const formatDelay = useCallback(
    (seconds: number): string => {
      const tk = (k: string) => t(k);
      if (seconds < 60) {
        return `${seconds} ${seconds > 1 ? tk('time.seconds') : tk('time.second')}`;
      }
      if (seconds < 3600) {
        const m = Math.floor(seconds / 60);
        return `${m} ${m > 1 ? tk('time.minutes') : tk('time.minute')}`;
      }
      if (seconds < 86400) {
        const h = Math.floor(seconds / 3600);
        return `${h} ${h > 1 ? tk('time.hours') : tk('time.hour')}`;
      }
      const d = Math.floor(seconds / 86400);
      return `${d} ${d > 1 ? tk('time.days') : tk('time.day')}`;
    },
    [t]
  );

  return { t, formatDelay, locale, setLocale };
}
