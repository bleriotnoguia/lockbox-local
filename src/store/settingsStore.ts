import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  unlockedSoundEnabled: boolean;
  relockedSoundEnabled: boolean;
  setUnlockedSoundEnabled: (enabled: boolean) => void;
  setRelockedSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      unlockedSoundEnabled: true,
      relockedSoundEnabled: true,
      setUnlockedSoundEnabled: (enabled) => set({ unlockedSoundEnabled: enabled }),
      setRelockedSoundEnabled: (enabled) => set({ relockedSoundEnabled: enabled }),
    }),
    {
      name: 'lockbox-settings',
    }
  )
);
