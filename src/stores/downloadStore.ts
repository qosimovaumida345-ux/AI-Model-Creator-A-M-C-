import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { DownloadTask } from '@/types';

interface DownloadState {
  tasks: DownloadTask[];
  maxConcurrent: number;
  addDownload: (modelId: string, modelName: string, url: string, fileName: string, totalSize: number) => string;
  updateTask: (id: string, patch: Partial<DownloadTask>) => void;
  removeTask: (id: string) => void;
  pauseTask: (id: string) => void;
  resumeTask: (id: string) => void;
  clearCompleted: () => void;
  getActiveCount: () => number;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      tasks: [],
      maxConcurrent: 2,

      addDownload: (modelId, modelName, url, fileName, totalSize) => {
        const id = uuid();
        const task: DownloadTask = {
          id,
          modelId,
          modelName,
          url,
          fileName,
          totalSize,
          downloadedSize: 0,
          progress: 0,
          speed: 0,
          status: 'queued',
          error: null,
          startedAt: new Date().toISOString(),
          completedAt: null,
          localPath: null,
        };
        set((s) => ({ tasks: [...s.tasks, task] }));

        // Start download via backend
        startDownload(id, url, fileName, (update) => {
          get().updateTask(id, update);
        });

        return id;
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      pauseTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id && t.status === 'downloading' ? { ...t, status: 'paused' as const } : t
          ),
        })),

      resumeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task && task.status === 'paused') {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, status: 'downloading' as const } : t
            ),
          }));
          startDownload(id, task.url, task.fileName, (update) => {
            get().updateTask(id, update);
          });
        }
      },

      clearCompleted: () =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.status !== 'completed'),
        })),

      getActiveCount: () =>
        get().tasks.filter((t) => t.status === 'downloading').length,
    }),
    {
      name: 'modelforge-downloads',
      partialize: (state) => ({
        tasks: state.tasks.filter((t) =>
          ['completed', 'paused'].includes(t.status)
        ),
      }),
    }
  )
);

// Actual download logic — uses backend proxy for CORS
async function startDownload(
  taskId: string,
  url: string,
  fileName: string,
  onUpdate: (patch: Partial<DownloadTask>) => void
) {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  try {
    onUpdate({ status: 'downloading' });

    const response = await fetch(`${API_BASE}/install/proxy-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, fileName }),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    let downloaded = 0;
    const chunks: Uint8Array[] = [];
    let lastTime = Date.now();
    let lastBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      downloaded += value.length;

      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      if (elapsed >= 0.5) {
        const speed = (downloaded - lastBytes) / elapsed;
        const progress = contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0;
        onUpdate({
          downloadedSize: downloaded,
          progress,
          speed,
          totalSize: contentLength || downloaded,
        });
        lastTime = now;
        lastBytes = downloaded;
      }
    }

    // In Electron, we'd save to filesystem
    // In browser, trigger download
    if (typeof window !== 'undefined' && !(window as any).electron) {
      const blob = new Blob(chunks);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    onUpdate({
      status: 'completed',
      progress: 100,
      downloadedSize: downloaded,
      completedAt: new Date().toISOString(),
      localPath: `/models/${fileName}`,
    });
  } catch (err: unknown) {
    onUpdate({
      status: 'failed',
      error: err instanceof Error ? err.message : 'Download failed',
    });
  }
}