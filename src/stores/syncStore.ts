import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as syncService from '@/services/syncService';
import { useForgeStore } from './forgeStore';
import { useChatStore } from './chatStore';
import { useSettingsStore } from './settingsStore';

// ── Helper to get API base URL ───────────────────────────────
function getApiBase(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3001/api';
}

interface SyncState {
  lastChecksum: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncError: string | null;
  autoSyncEnabled: boolean;
  syncInterval: number;
  deviceCount: number;
  devices: Array<{ id: string; name: string; platform: string; lastSeen: string }>;

  pushSync: () => Promise<void>;
  pullSync: () => Promise<void>;
  fullSync: () => Promise<void>;
  loadStatus: () => Promise<void>;
  setAutoSync: (enabled: boolean) => void;
  clearError: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      lastChecksum: null,
      lastSyncedAt: null,
      isSyncing: false,
      syncError: null,
      autoSyncEnabled: true,
      syncInterval: 60,
      deviceCount: 0,
      devices: [],

      pushSync: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const forgeStore = useForgeStore.getState();
          const chatStore = useChatStore.getState();
          const settingsStore = useSettingsStore.getState();

          const result = await syncService.pushSync({
            forgedModels: forgeStore.forgedModels,
            chatSessions: chatStore.sessions,
            settings: settingsStore.settings as unknown as Record<string, unknown>,
          });

          if (result.success) {
            set({
              lastChecksum: result.checksum || null,
              lastSyncedAt: new Date().toISOString(),
              isSyncing: false,
            });
          } else {
            set({ syncError: result.error || 'Push failed', isSyncing: false });
          }
        } catch (err: unknown) {
          set({
            syncError: err instanceof Error ? err.message : 'Push failed',
            isSyncing: false,
          });
        }
      },

      pullSync: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const { lastChecksum } = get();
          const result = await syncService.pullSync(lastChecksum);

          if (result.success && result.data) {
            if (result.hasChanges) {
              const forgeStore = useForgeStore.getState();
              const chatStore = useChatStore.getState();

              if (result.data.forgedModels.length > 0) {
                await forgeStore.loadForgedModels();
              }

              if (result.data.chatSessions.length > 0) {
                await chatStore.loadSessions();
              }
            }

            set({
              lastChecksum: result.data.checksum,
              lastSyncedAt: new Date().toISOString(),
              isSyncing: false,
            });
          } else {
            set({
              syncError: result.error || 'Pull failed',
              isSyncing: false,
            });
          }
        } catch (err: unknown) {
          set({
            syncError: err instanceof Error ? err.message : 'Pull failed',
            isSyncing: false,
          });
        }
      },

      fullSync: async () => {
        const { pushSync, pullSync } = get();
        await pushSync();
        await pullSync();
      },

      loadStatus: async () => {
        const status = await syncService.getSyncStatus();
        if (status) {
          set({
            deviceCount: status.deviceCount,
            devices: status.devices,
          });
        }
      },

      setAutoSync: (enabled) => set({ autoSyncEnabled: enabled }),

      clearError: () => set({ syncError: null }),
    }),
    {
      name: 'modelforge-sync',
      partialize: (state) => ({
        lastChecksum: state.lastChecksum,
        lastSyncedAt: state.lastSyncedAt,
        autoSyncEnabled: state.autoSyncEnabled,
      }),
    }
  )
);

// ── Auto-sync on app load and periodically ───────────────────
if (typeof window !== 'undefined') {
  // Register device on load
  syncService.registerDevice();

  // Initial sync after 3 seconds
  setTimeout(() => {
    const store = useSyncStore.getState();
    if (store.autoSyncEnabled && navigator.onLine) {
      store.pullSync();
    }
  }, 3000);

  // Periodic sync
  setInterval(() => {
    const store = useSyncStore.getState();
    if (store.autoSyncEnabled && navigator.onLine && !store.isSyncing) {
      store.fullSync();
    }
  }, 60000);

  // Sync when coming back online
  window.addEventListener('online', () => {
    const store = useSyncStore.getState();
    if (store.autoSyncEnabled) {
      setTimeout(() => store.fullSync(), 2000);
    }
  });

  // Push before leaving
  window.addEventListener('beforeunload', () => {
    const store = useSyncStore.getState();
    if (store.autoSyncEnabled) {
      const data = {
        deviceId: localStorage.getItem('modelforge-device-id'),
        forgedModels: useForgeStore.getState().forgedModels,
        chatSessions: useChatStore.getState().sessions,
        settings: useSettingsStore.getState().settings,
      };

      const beaconUrl = getApiBase();

      navigator.sendBeacon(
        `${beaconUrl}/sync/push`,
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );
    }
  });
}