// src/types/index.ts
// ═══════════════════════════════════════════════════════════════
//  AI MODEL FORGE PLATFORM — Complete Type Definitions
//  Covers all 5 phases: Models, Chat, Fine-Tuning, Install, Sync
// ═══════════════════════════════════════════════════════════════

// ── Model Categories ─────────────────────────────────────────
export type ModelCategory =
  | 'text-generation'
  | 'code'
  | 'image-generation'
  | 'vision'
  | 'multimodal'
  | 'audio'
  | 'video'
  | 'embedding';

// ── Model Formats ────────────────────────────────────────────
export type ModelFormat =
  | 'safetensors'
  | 'gguf'
  | 'onnx'
  | 'pytorch'
  | 'ggml'
  | 'awq'
  | 'gptq'
  | 'exl2';

// ── AI Model ─────────────────────────────────────────────────
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  params: string;
  license: string;
  formats: string[];
  tasks: string[];
  architecture: string;
  contextLength: number;
  fineTunable: boolean;
  openSource: boolean;
  apiAvailable: boolean;
  freeOnOpenRouter: boolean;
  hardwareReq: string;
  trainingData: string;
  benchmarks: Record<string, number>;
  isVariant: boolean;
}

// ── Forged (Custom) Model ────────────────────────────────────
export interface ForgedModel {
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
  trainingStatus: TrainingStatus;
  localPath: string | null;
  huggingFaceRepo: string | null;
  format: string;
  quantization: string | null;
  fileSize: number | null;
  downloadUrl: string | null;
  isDownloaded: boolean;
  config: ForgeConfig;
  metrics: TrainingMetrics | null;
}

// ── Forge Configuration ──────────────────────────────────────
export interface ForgeConfig {
  learningRate: number;
  epochs: number;
  batchSize: number;
  loraRank: number;
  loraAlpha: number;
  loraDropout: number;
  maxSequenceLength: number;
  warmupSteps: number;
  weightDecay: number;
  gradientAccumulationSteps: number;
  optimizer: 'adamw' | 'adam' | 'sgd' | 'adafactor';
  scheduler: 'cosine' | 'linear' | 'constant' | 'cosine_with_restarts';
  fp16: boolean;
  bf16: boolean;
  gradientCheckpointing: boolean;
  targetModules: string[];
}

// ── Training ─────────────────────────────────────────────────
export type TrainingStatus =
  | 'idle'
  | 'preparing'
  | 'uploading-data'
  | 'queued'
  | 'training'
  | 'saving'
  | 'converting'
  | 'uploading-model'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TrainingJob {
  id: string;
  forgedModelId: string;
  status: TrainingStatus;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentStep: number;
  totalSteps: number;
  loss: number;
  learningRate: number;
  elapsed: number;
  estimatedRemaining: number;
  lossHistory: TrainingDataPoint[];
  lrHistory: TrainingDataPoint[];
  logs: TrainingLog[];
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  gpuProvider: 'local' | 'replicate' | 'runpod';
  gpuType: string | null;
  replicateTrainingId: string | null;
}

export interface TrainingDataPoint {
  step: number;
  value: number;
  epoch: number;
  timestamp: number;
}

export interface TrainingLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
}

export interface TrainingMetrics {
  finalLoss: number;
  bestLoss: number;
  totalSteps: number;
  totalEpochs: number;
  trainingDuration: number;
  tokensProcessed: number;
  samplesProcessed: number;
}

// ── Training Dataset ─────────────────────────────────────────
export interface TrainingDataset {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  format: 'jsonl' | 'csv' | 'txt' | 'parquet';
  sampleCount: number;
  uploadedAt: string;
  samples: DatasetSample[];
}

export interface DatasetSample {
  instruction?: string;
  input?: string;
  output?: string;
  text?: string;
  messages?: ChatMessage[];
}

// ── Chat System ──────────────────────────────────────────────
export interface ChatSession {
  id: string;
  modelId: string;
  modelName: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  settings: ChatSettings;
  isForgedModel: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  generationTime?: number;
  model?: string;
  error?: boolean;
}

export interface ChatSettings {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  systemPrompt: string;
  frequencyPenalty: number;
  presencePenalty: number;
  repeatPenalty: number;
  stop: string[];
  stream: boolean;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  repeat_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// ── Inference Mode ───────────────────────────────────────────
export type InferenceMode = 'online' | 'offline' | 'auto';

export interface InferenceConfig {
  mode: InferenceMode;
  onlineProvider: OnlineProvider;
  localEndpoint: string;
  openRouterApiKey: string | null;
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
  googleApiKey: string | null;
  customEndpoint: string | null;
  customApiKey: string | null;
}

export type OnlineProvider =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'ollama-remote'
  | 'custom';

// ── OpenRouter Model Mapping ─────────────────────────────────
export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  contextLength: number;
  isFree: boolean;
}

// ── Device Detection & Install ───────────────────────────────
export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown';
export type Architecture = 'x64' | 'arm64' | 'arm' | 'x86' | 'unknown';

export interface DeviceInfo {
  platform: Platform;
  architecture: Architecture;
  gpu: GPUInfo | null;
  ram: number;
  cores: number;
  isOnline: boolean;
  userAgent: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsWebGPU: boolean;
  supportsWASM: boolean;
}

export interface GPUInfo {
  vendor: string;
  renderer: string;
  vram: number | null;
  supportsCUDA: boolean;
  supportsROCm: boolean;
  supportsMetal: boolean;
  supportsVulkan: boolean;
}

export interface InstallerInfo {
  platform: Platform;
  architecture: Architecture;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  version: string;
  checksum: string;
  format: 'exe' | 'dmg' | 'appimage' | 'deb' | 'apk' | 'ipa';
  bundledModels: string[];
  requirements: string;
}

// ── Download Management ──────────────────────────────────────
export interface DownloadTask {
  id: string;
  modelId: string;
  modelName: string;
  url: string;
  fileName: string;
  totalSize: number;
  downloadedSize: number;
  progress: number;
  speed: number;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'verifying';
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  localPath: string | null;
}

// ── App Settings ─────────────────────────────────────────────
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  language: string;
  inference: InferenceConfig;
  defaultChatSettings: ChatSettings;
  modelStoragePath: string;
  maxConcurrentDownloads: number;
  autoUpdate: boolean;
  telemetry: boolean;
  animations: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showVariants: boolean;
  compactModelCards: boolean;
}

// ── Sync ─────────────────────────────────────────────────────
export interface SyncState {
  lastSyncedAt: string | null;
  isSyncing: boolean;
  pendingChanges: number;
  syncError: string | null;
  cloudConnected: boolean;
}

export interface SyncPayload {
  forgedModels: ForgedModel[];
  chatSessions: ChatSession[];
  settings: AppSettings;
  timestamp: string;
  deviceId: string;
}

// ── API Responses ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Search & Filter ──────────────────────────────────────────
export interface ModelFilter {
  search: string;
  categories: ModelCategory[];
  providers: string[];
  openSourceOnly: boolean;
  freeOnly: boolean;
  fineTunableOnly: boolean;
  showVariants: boolean;
  minParams: number | null;
  maxParams: number | null;
  sortBy: ModelSortField;
  sortOrder: 'asc' | 'desc';
}

export type ModelSortField =
  | 'name'
  | 'provider'
  | 'params'
  | 'contextLength'
  | 'category'
  | 'popularity';

// ── Navigation ───────────────────────────────────────────────
export type AppRoute =
  | '/'
  | '/models'
  | '/model/:id'
  | '/forge'
  | '/forge/:id'
  | '/chat'
  | '/chat/:sessionId'
  | '/my-models'
  | '/settings'
  | '/install'
  | '/downloads';

export interface BreadcrumbItem {
  label: string;
  path: string;
  active: boolean;
}

// ── Toast / Notifications ────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  createdAt: number;
}

// ── Hardware Detection Results ───────────────────────────────
export interface HardwareAssessment {
  canRunLocally: boolean;
  recommendedModels: string[];
  maxModelSize: string;
  inferenceSpeed: 'fast' | 'moderate' | 'slow' | 'unsupported';
  recommendation: string;
  availableBackends: ('cpu' | 'cuda' | 'rocm' | 'metal' | 'vulkan' | 'webgpu')[];
}

// ── Provider Logo Mapping ────────────────────────────────────
export interface ProviderInfo {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  color: string;
  description: string;
}

// ── Keyboard Shortcuts ───────────────────────────────────────
export interface KeyboardShortcut {
  key: string;
  modifier: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: string;
  description: string;
}

// ── Default Values ───────────────────────────────────────────
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful AI assistant.',
  frequencyPenalty: 0,
  presencePenalty: 0,
  repeatPenalty: 1.1,
  stop: [],
  stream: true,
};

export const DEFAULT_FORGE_CONFIG: ForgeConfig = {
  learningRate: 2e-4,
  epochs: 3,
  batchSize: 4,
  loraRank: 16,
  loraAlpha: 32,
  loraDropout: 0.05,
  maxSequenceLength: 2048,
  warmupSteps: 10,
  weightDecay: 0.01,
  gradientAccumulationSteps: 4,
  optimizer: 'adamw',
  scheduler: 'cosine',
  fp16: false,
  bf16: true,
  gradientCheckpointing: true,
  targetModules: ['q_proj', 'k_proj', 'v_proj', 'o_proj'],
};

export const DEFAULT_INFERENCE_CONFIG: InferenceConfig = {
  mode: 'auto',
  onlineProvider: 'openrouter',
  localEndpoint: 'http://localhost:11434',
  openRouterApiKey: null,
  openaiApiKey: null,
  anthropicApiKey: null,
  googleApiKey: null,
  customEndpoint: null,
  customApiKey: null,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#00D4FF',
  language: 'en',
  inference: DEFAULT_INFERENCE_CONFIG,
  defaultChatSettings: DEFAULT_CHAT_SETTINGS,
  modelStoragePath: './models',
  maxConcurrentDownloads: 2,
  autoUpdate: true,
  telemetry: false,
  animations: true,
  reducedMotion: false,
  fontSize: 'medium',
  showVariants: false,
  compactModelCards: false,
};

export const DEFAULT_MODEL_FILTER: ModelFilter = {
  search: '',
  categories: [],
  providers: [],
  openSourceOnly: false,
  freeOnly: false,
  fineTunableOnly: false,
  showVariants: false,
  minParams: null,
  maxParams: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

// ── Category Display Info ────────────────────────────────────
export const CATEGORY_INFO: Record<ModelCategory, { label: string; color: string; icon: string }> = {
  'text-generation': { label: 'Text Generation', color: '#00D4FF', icon: 'type' },
  'code':            { label: 'Code',            color: '#22C55E', icon: 'code' },
  'image-generation':{ label: 'Image Generation',color: '#F472B6', icon: 'image' },
  'vision':          { label: 'Vision',          color: '#A78BFA', icon: 'eye' },
  'multimodal':      { label: 'Multimodal',      color: '#FB923C', icon: 'layers' },
  'audio':           { label: 'Audio',           color: '#FACC15', icon: 'music' },
  'video':           { label: 'Video',           color: '#F87171', icon: 'film' },
  'embedding':       { label: 'Embedding',       color: '#2DD4BF', icon: 'database' },
};

// Add these at the very bottom of src/types/index.ts

export const CATEGORY_COLORS: Record<ModelCategory, string> = {
  'text-generation': '#00D4FF',
  'code': '#22C55E',
  'image-generation': '#F472B6',
  'vision': '#A78BFA',
  'multimodal': '#FB923C',
  'audio': '#FACC15',
  'video': '#F87171',
  'embedding': '#2DD4BF',
};

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  'text-generation': 'Text Generation',
  'code': 'Code',
  'image-generation': 'Image Generation',
  'vision': 'Vision',
  'multimodal': 'Multimodal',
  'audio': 'Audio',
  'video': 'Video',
  'embedding': 'Embedding',
};