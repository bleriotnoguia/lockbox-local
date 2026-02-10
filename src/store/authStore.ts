import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface AuthState {
  isAuthenticated: boolean;
  isMasterPasswordSet: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkMasterPassword: () => Promise<void>;
  setMasterPassword: (password: string) => Promise<void>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isMasterPasswordSet: false,
  isLoading: true,
  error: null,

  checkMasterPassword: async () => {
    set({ isLoading: true, error: null });
    try {
      const isSet = await invoke<boolean>("is_master_password_set");
      set({ isMasterPasswordSet: isSet, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  setMasterPassword: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      await invoke("set_master_password", { password });
      set({
        isMasterPasswordSet: true,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  verifyMasterPassword: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const isValid = await invoke<boolean>("verify_master_password", {
        password,
      });
      if (isValid) {
        set({ isAuthenticated: true, isLoading: false });
      } else {
        set({ error: "login.wrongPassword", isLoading: false });
      }
      return isValid;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  clearError: () => {
    set({ error: null });
  },
}));
