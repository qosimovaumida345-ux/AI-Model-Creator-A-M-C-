import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InferenceMode, AppSettings } from '@/types';
import { DEFAULT_APP_SETTINGS } from '@/types';

interface SettingsState {
  settings: AppSettings;
  inferenceMode: InferenceMode;
  isOnline: boolean;
  ollamaAvailable: boolean;
  ollamaModels: string[];

  // Actions
  setInferenceMode: (mode: InferenceMode) => void;
  setOnlineStatus: (online: boolean) => void;
  setOllamaStatus: (available: boolean, models?: string[]) => void;
  setOpenRouterKey: (key: string) => void;
  setOpenAIKey: (key: string) => void;
  setAnthropicKey: (key: string) => void;
  setGoogleKey: (key: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  getEffectiveProvider: () => 'openrouter' | 'ollama';
  hasApiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_APP_SETTINGS,
      inferenceMode: 'auto',
      isOnline: navigator.onLine,
      ollamaAvailable: false,
      ollamaModels: [],

      setInferenceMode: (mode) => set({ inferenceMode: mode }),

      setOnlineStatus: (online) => set({ isOnline: online }),

      setOllamaStatus: (available, models) =>
        set({ ollamaAvailable: available, ollamaModels: models || [] }),

      setOpenRouterKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            inference: { ...s.settings.inference, openRouterApiKey: key },
          },
        })),

      setOpenAIKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            inference: { ...s.settings.inference, openaiApiKey: key },
          },
        })),

      setAnthropicKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            inference: { ...s.settings.inference, anthropicApiKey: key },
          },
        })),

      setGoogleKey: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            inference: { ...s.settings.inference, googleApiKey: key },
          },
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      getEffectiveProvider: () => {
        const { inferenceMode, isOnline, ollamaAvailable } = get();
        if (inferenceMode === 'offline') return 'ollama';
        if (inferenceMode === 'online') return 'openrouter';
        // Auto mode
        if (isOnline) return 'openrouter';
        if (ollamaAvailable) return 'ollama';
        return 'openrouter'; // Will show error if offline & no ollama
      },

      hasApiKey: () => {
        const { settings } = get();
        return !!(settings.inference.openRouterApiKey);
      },
    }),
    {
      name: 'modelforge-settings',
      partialize: (state) => ({
        settings: state.settings,
        inferenceMode: state.inferenceMode,
      }),
    }
  )
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useSettingsStore.getState().setOnlineStatus(true));
  window.addEventListener('offline', () => useSettingsStore.getState().setOnlineStatus(false));
}