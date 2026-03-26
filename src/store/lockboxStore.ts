import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { invoke } from '@tauri-apps/api/core';
import { useMemo } from 'react';
import type { Lockbox, CreateLockboxInput, AccessLogEntry } from '../types';
import { parseTags } from '../types';

interface LockboxState {
  lockboxes: Lockbox[];
  selectedLockbox: Lockbox | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedTag: string | null;

  // Actions
  fetchLockboxes: () => Promise<void>;
  fetchLockboxDecrypted: (id: number) => Promise<Lockbox | null>;
  createLockbox: (input: CreateLockboxInput) => Promise<Lockbox>;
  updateLockbox: (id: number, updates: Partial<CreateLockboxInput>) => Promise<Lockbox>;
  deleteLockbox: (id: number) => Promise<void>;
  unlockLockbox: (id: number) => Promise<Lockbox>;
  cancelUnlock: (id: number) => Promise<Lockbox>;
  extendUnlockDelay: (id: number, additionalSeconds: number) => Promise<Lockbox>;
  usePanicCode: (id: number, code: string) => Promise<Lockbox | null>;
  resetPanicCode: (id: number, newCode?: string) => Promise<Lockbox>;
  getAccessLog: (lockboxId: number) => Promise<AccessLogEntry[]>;
  getGlobalAccessLog: () => Promise<AccessLogEntry[]>;
  relockLockbox: (id: number) => Promise<Lockbox>;
  selectLockbox: (lockbox: Lockbox | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  checkAndUpdateStates: () => Promise<void>;
  clearError: () => void;
}

export const useLockboxStore = create<LockboxState>((set, get) => ({
  lockboxes: [],
  selectedLockbox: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedTag: null,

  fetchLockboxes: async () => {
    set({ isLoading: true, error: null });
    try {
      const lockboxes = await invoke<Lockbox[]>('get_all_lockboxes');
      set({ lockboxes, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  fetchLockboxDecrypted: async (id: number) => {
    try {
      const lockbox = await invoke<Lockbox | null>('get_lockbox', { id });
      return lockbox;
    } catch (error) {
      console.error('Failed to fetch decrypted lockbox:', error);
      return null;
    }
  },

  createLockbox: async (input: CreateLockboxInput) => {
    set({ isLoading: true, error: null });
    try {
      const lockbox = await invoke<Lockbox>('create_lockbox', {
        name: input.name,
        content: input.content,
        category: input.category || null,
        unlockDelaySeconds: input.unlock_delay_seconds,
        relockDelaySeconds: input.relock_delay_seconds,
        reflectionEnabled: input.reflection_enabled ?? false,
        reflectionMessage: input.reflection_message ?? null,
        reflectionChecklist: input.reflection_checklist ?? null,
        penaltyEnabled: input.penalty_enabled ?? false,
        penaltySeconds: input.penalty_seconds ?? 0,
        panicCode: input.panic_code ?? null,
        scheduledUnlockAt: input.scheduled_unlock_at ?? null,
        tags: input.tags ?? null,
      });
      set((state) => ({
        lockboxes: [...state.lockboxes, lockbox].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  updateLockbox: async (id: number, updates: Partial<CreateLockboxInput>) => {
    set({ isLoading: true, error: null });
    try {
      const lockbox = await invoke<Lockbox>('update_lockbox', {
        id,
        name: updates.name,
        content: updates.content,
        category: updates.category,
        unlockDelaySeconds: updates.unlock_delay_seconds,
        relockDelaySeconds: updates.relock_delay_seconds,
        reflectionEnabled: updates.reflection_enabled,
        reflectionMessage: updates.reflection_message,
        reflectionChecklist: updates.reflection_checklist,
        penaltyEnabled: updates.penalty_enabled,
        penaltySeconds: updates.penalty_seconds,
        panicCode: updates.panic_code,
        scheduledUnlockAt: updates.scheduled_unlock_at,
        tags: updates.tags,
      });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
        isLoading: false,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  deleteLockbox: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_lockbox', { id });
      set((state) => ({
        lockboxes: state.lockboxes.filter((lb) => lb.id !== id),
        selectedLockbox: state.selectedLockbox?.id === id ? null : state.selectedLockbox,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  unlockLockbox: async (id: number) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox>('unlock_lockbox', { id });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  cancelUnlock: async (id: number) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox>('cancel_unlock', { id });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  extendUnlockDelay: async (id: number, additionalSeconds: number) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox>('extend_unlock_delay', { id, additionalSeconds });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  usePanicCode: async (id: number, code: string) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox | null>('use_panic_code', { id, code });
      if (lockbox) {
        set((state) => ({
          lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
          selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
        }));
      }
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  resetPanicCode: async (id: number, newCode?: string) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox>('reset_panic_code', { id, newCode: newCode ?? null });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  getAccessLog: async (lockboxId: number) => {
    try {
      return await invoke<AccessLogEntry[]>('get_access_log', { lockboxId });
    } catch (error) {
      console.error('Failed to get access log:', error);
      return [];
    }
  },

  getGlobalAccessLog: async () => {
    try {
      return await invoke<AccessLogEntry[]>('get_global_access_log');
    } catch (error) {
      console.error('Failed to get global access log:', error);
      return [];
    }
  },

  relockLockbox: async (id: number) => {
    set({ error: null });
    try {
      const lockbox = await invoke<Lockbox>('relock_lockbox', { id });
      set((state) => ({
        lockboxes: state.lockboxes.map((lb) => (lb.id === id ? lockbox : lb)),
        selectedLockbox: state.selectedLockbox?.id === id ? lockbox : state.selectedLockbox,
      }));
      return lockbox;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  selectLockbox: (lockbox: Lockbox | null) => {
    set({ selectedLockbox: lockbox });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  setSelectedTag: (tag: string | null) => {
    set({ selectedTag: tag });
  },

  checkAndUpdateStates: async () => {
    try {
      const lockboxes = await invoke<Lockbox[]>('check_and_update_lockboxes');
      const { selectedLockbox } = get();
      set({
        lockboxes,
        selectedLockbox: selectedLockbox
          ? lockboxes.find((lb: Lockbox) => lb.id === selectedLockbox.id) || null
          : null,
      });
    } catch (error) {
      console.error('Failed to update states:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useFilteredLockboxes = () => {
  const { lockboxes, searchQuery, selectedCategory, selectedTag } = useLockboxStore(
    useShallow((state) => ({
      lockboxes: state.lockboxes,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
      selectedTag: state.selectedTag,
    }))
  );

  return useMemo(() => {
    let filtered = lockboxes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lb) =>
          lb.name.toLowerCase().includes(query) ||
          lb.category?.toLowerCase().includes(query) ||
          parseTags(lb.tags).some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedCategory === '__uncategorized__') {
      filtered = filtered.filter((lb) => !lb.category);
    } else if (selectedCategory) {
      filtered = filtered.filter((lb) => lb.category === selectedCategory);
    }

    if (selectedTag) {
      filtered = filtered.filter((lb) => parseTags(lb.tags).includes(selectedTag));
    }

    return filtered;
  }, [lockboxes, searchQuery, selectedCategory, selectedTag]);
};
