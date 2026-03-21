const DB_NAME = 'NeuralForgeDB';
const DB_VERSION = 1;
const MODELS_STORE = 'models';
const FORGED_STORE = 'forged_models';
const SETTINGS_STORE = 'settings';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  parameters: string;
  size: string;
  sizeBytes: number;
  capabilities: string[];
  logoUrl: string;
  customIcon?: string;
  downloaded: boolean;
  downloadProgress: number;
  downloadedAt?: number;
  version: string;
  quantization: string;
  contextWindow: string;
  architecture: string;
}

export interface ForgedModel {
  id: string;
  name: string;
  description: string;
  sourceModels: string[];
  sourceModelNames: string[];
  customIcon?: string;
  createdAt: number;
  size: string;
  sizeBytes: number;
  status: 'forging' | 'ready' | 'error';
  forgeProgress: number;
  config: {
    mergeStrategy: string;
    weightDistribution: Record<string, number>;
    quantization: string;
    contextWindow: string;
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MODELS_STORE)) {
        db.createObjectStore(MODELS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FORGED_STORE)) {
        db.createObjectStore(FORGED_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Models
export const getAllModels = () => getAll<AIModel>(MODELS_STORE);
export const getModel = (id: string) => getById<AIModel>(MODELS_STORE, id);
export const saveModel = (model: AIModel) => put(MODELS_STORE, model);
export const deleteModel = (id: string) => remove(MODELS_STORE, id);

// Forged Models
export const getAllForgedModels = () => getAll<ForgedModel>(FORGED_STORE);
export const getForgedModel = (id: string) => getById<ForgedModel>(FORGED_STORE, id);
export const saveForgedModel = (model: ForgedModel) => put(FORGED_STORE, model);
export const deleteForgedModel = (id: string) => remove(FORGED_STORE, id);

// Settings
export const getSetting = async (key: string): Promise<any> => {
  const result = await getById<{ key: string; value: any }>(SETTINGS_STORE, key);
  return result?.value;
};
export const saveSetting = (key: string, value: any) =>
  put(SETTINGS_STORE, { key, value });
