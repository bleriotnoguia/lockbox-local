import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { invoke } from '@tauri-apps/api/core';
import { useMemo } from 'react';
import type { Lockbox, CreateLockboxInput } from '../types';

interface LockboxState {
  lockboxes: Lockbox[];
  selectedLockbox: Lockbox | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  
  // Actions
  fetchLockboxes: () => Promise<void>;
  fetchLockboxDecrypted: (id: number) => Promise<Lockbox | null>;
  createLockbox: (input: CreateLockboxInput) => Promise<Lockbox>;
  updateLockbox: (id: number, updates: Partial<CreateLockboxInput>) => Promise<Lockbox>;
  deleteLockbox: (id: number) => Promise<void>;
  unlockLockbox: (id: number) => Promise<Lockbox>;
  relockLockbox: (id: number) => Promise<Lockbox>;
  selectLockbox: (lockbox: Lockbox | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
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

// Selector for filtered lockboxes - uses shallow comparison to prevent infinite loops
export const useFilteredLockboxes = () => {
  const { lockboxes, searchQuery, selectedCategory } = useLockboxStore(
    useShallow((state) => ({
      lockboxes: state.lockboxes,
      searchQuery: state.searchQuery,
      selectedCategory: state.selectedCategory,
    }))
  );

  return useMemo(() => {
    let filtered = lockboxes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lb) =>
          lb.name.toLowerCase().includes(query) ||
          lb.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((lb) => lb.category === selectedCategory);
    }

    return filtered;
  }, [lockboxes, searchQuery, selectedCategory]);
};
