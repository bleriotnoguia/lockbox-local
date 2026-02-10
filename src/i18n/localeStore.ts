import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from './translations';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const getDefaultLocale = (): Locale => {
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('fr')) return 'fr';
  return 'en';
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: getDefaultLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'lockbox-locale' }
  )
);
