import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Model management
  getModelsDir: () => ipcRenderer.invoke('get-models-dir'),
  listLocalModels: () => ipcRenderer.invoke('list-local-models'),
  loadModel: (fileName: string) => ipcRenderer.invoke('load-model', fileName),
  unloadModel: () => ipcRenderer.invoke('unload-model'),
  downloadModel: (url: string, fileName: string) => ipcRenderer.invoke('download-model', url, fileName),
  deleteModel: (fileName: string) => ipcRenderer.invoke('delete-model', fileName),
  openModelsFolder: () => ipcRenderer.invoke('open-models-folder'),
  selectModelFile: () => ipcRenderer.invoke('select-model-file'),

  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Events
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('download-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('download-progress');
  },

  onLlamaStatus: (callback: (data: any) => void) => {
    ipcRenderer.on('llama-status', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('llama-status');
  },

  // Platform
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
});