// Type declarations for Electron preload API
interface ElectronAPI {
  // Model management
  getModelsDir: () => Promise<string>;
  listLocalModels: () => Promise<Array<{ name: string; path: string; size: number }>>;
  loadModel: (fileName: string) => Promise<{ success: boolean }>;
  unloadModel: () => Promise<{ success: boolean }>;
  downloadModel: (url: string, fileName: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  deleteModel: (fileName: string) => Promise<{ success: boolean; error?: string }>;
  openModelsFolder: () => Promise<void>;
  selectModelFile: () => Promise<string | null>;

  // App info
  getAppInfo: () => Promise<{
    version: string;
    platform: string;
    arch: string;
    electronVersion: string;
    nodeVersion: string;
    modelsDir: string;
    isDev: boolean;
  }>;

  // Events
  onDownloadProgress: (callback: (data: {
    fileName: string;
    downloaded: number;
    totalSize: number;
    progress: number;
  }) => void) => () => void;

  onLlamaStatus: (callback: (data: {
    available: boolean;
    model?: string;
    port?: number;
    error?: string;
  }) => void) => () => void;

  // Platform
  isElectron: true;
  platform: string;
  arch: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};