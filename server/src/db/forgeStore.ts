import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const MODELS_FILE = path.join(DATA_DIR, 'forged-models.json');
const JOBS_FILE = path.join(DATA_DIR, 'training-jobs.json');
const DATASETS_FILE = path.join(DATA_DIR, 'datasets.json');

function ensureDirs() {
  for (const d of [DATA_DIR, UPLOADS_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

// ── Generic read/write ───────────────────────────────────────
function readJson<T>(file: string): T[] {
  ensureDirs();
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return []; }
}

function writeJson<T>(file: string, data: T[]) {
  ensureDirs();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── Types ────────────────────────────────────────────────────
export interface StoredForgedModel {
  id: string;
  name: string;
  baseModelId: string;
  baseModelName: string;
  avatar: string;
  systemPrompt: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  trainingJobId: string | null;
  trainingStatus: string;
  localPath: string | null;
  huggingFaceRepo: string | null;
  replicateModelUrl: string | null;
  format: string;
  quantization: string | null;
  fileSize: number | null;
  downloadUrl: string | null;
  isDownloaded: boolean;
  config: Record<string, unknown>;
  metrics: Record<string, unknown> | null;
}

export interface StoredTrainingJob {
  id: string;
  forgedModelId: string;
  status: string;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  loss: number;
  learningRate: number;
  elapsed: number;
  estimatedRemaining: number;
  lossHistory: Array<{ step: number; value: number; epoch: number; timestamp: number }>;
  lrHistory: Array<{ step: number; value: number; epoch: number; timestamp: number }>;
  logs: Array<{ timestamp: string; level: string; message: string }>;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  gpuProvider: string;
  gpuType: string | null;
  replicateTrainingId: string | null;
  datasetId: string | null;
  lastParsedLogIndex: number;
}

export interface StoredDataset {
  id: string;
  name: string;
  fileName: string;
  localPath: string;
  fileSize: number;
  format: string;
  sampleCount: number;
  uploadedAt: string;
  replicateFileUrl: string | null;
}

// ── Forged Models Store ──────────────────────────────────────
export const forgedModelStore = {
  getAll(): StoredForgedModel[] {
    return readJson<StoredForgedModel>(MODELS_FILE)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getById(id: string): StoredForgedModel | undefined {
    return readJson<StoredForgedModel>(MODELS_FILE).find((m) => m.id === id);
  },

  create(model: StoredForgedModel): StoredForgedModel {
    const all = readJson<StoredForgedModel>(MODELS_FILE);
    all.push(model);
    writeJson(MODELS_FILE, all);
    return model;
  },

  update(id: string, patch: Partial<StoredForgedModel>): StoredForgedModel | undefined {
    const all = readJson<StoredForgedModel>(MODELS_FILE);
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    writeJson(MODELS_FILE, all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = readJson<StoredForgedModel>(MODELS_FILE);
    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length === all.length) return false;
    writeJson(MODELS_FILE, filtered);
    return true;
  },
};

// ── Training Jobs Store ──────────────────────────────────────
export const trainingJobStore = {
  getAll(): StoredTrainingJob[] {
    return readJson<StoredTrainingJob>(JOBS_FILE);
  },

  getById(id: string): StoredTrainingJob | undefined {
    return readJson<StoredTrainingJob>(JOBS_FILE).find((j) => j.id === id);
  },

  create(job: StoredTrainingJob): StoredTrainingJob {
    const all = readJson<StoredTrainingJob>(JOBS_FILE);
    all.push(job);
    writeJson(JOBS_FILE, all);
    return job;
  },

  update(id: string, patch: Partial<StoredTrainingJob>): StoredTrainingJob | undefined {
    const all = readJson<StoredTrainingJob>(JOBS_FILE);
    const idx = all.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    writeJson(JOBS_FILE, all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = readJson<StoredTrainingJob>(JOBS_FILE);
    const filtered = all.filter((j) => j.id !== id);
    if (filtered.length === all.length) return false;
    writeJson(JOBS_FILE, filtered);
    return true;
  },
};

// ── Datasets Store ───────────────────────────────────────────
export const datasetStore = {
  getAll(): StoredDataset[] {
    return readJson<StoredDataset>(DATASETS_FILE);
  },

  getById(id: string): StoredDataset | undefined {
    return readJson<StoredDataset>(DATASETS_FILE).find((d) => d.id === id);
  },

  create(ds: StoredDataset): StoredDataset {
    const all = readJson<StoredDataset>(DATASETS_FILE);
    all.push(ds);
    writeJson(DATASETS_FILE, all);
    return ds;
  },

  update(id: string, patch: Partial<StoredDataset>): StoredDataset | undefined {
    const all = readJson<StoredDataset>(DATASETS_FILE);
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    writeJson(DATASETS_FILE, all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = readJson<StoredDataset>(DATASETS_FILE);
    const filtered = all.filter((d) => d.id !== id);
    if (filtered.length === all.length) return false;
    writeJson(DATASETS_FILE, filtered);
    return true;
  },

  getUploadDir(): string {
    ensureDirs();
    return UPLOADS_DIR;
  },
};