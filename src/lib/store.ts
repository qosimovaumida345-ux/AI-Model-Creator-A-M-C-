/* ── Types ─────────────────────────────────────── */

export type ModelCategory = 'text' | 'image' | 'audio' | 'code' | 'multimodal' | 'vision';
export type ModelStatus = 'idle' | 'running' | 'downloading' | 'building' | 'ready' | 'error';
export type MergeStrategy = 'slerp' | 'ties' | 'dare-ties' | 'linear' | 'passthrough';
export type Quantization = 'Q4_K_M' | 'Q5_K_M' | 'Q8_0' | 'F16' | 'F32';

export interface AIModel {
  id: string;
  name: string;
  company: string;
  logo: string;
  description: string;
  parameters: string;
  size: string;
  category: ModelCategory;
  capabilities: string[];
  architecture: string;
  contextWindow: string;
  license: string;
  color: string;
}

export interface ForgedModel {
  id: string;
  name: string;
  baseModel: string;
  baseModelId: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  taskType: string;
  quantization: Quantization;
  mergeStrategy: MergeStrategy;
  mergedWith: string[];
  createdAt: string;
  status: ModelStatus;
  size: string;
  customIcon?: string;
  color: string;
  downloaded: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface DeviceInfo {
  os: string;
  osVersion: string;
  browser: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  architecture: string;
  cores: number;
  memory: number;
  gpu: string;
  isElectron: boolean;
  isCapacitor: boolean;
  isPWA: boolean;
  isOnline: boolean;
  installerType: string;
  installerExt: string;
}

/* ── Unique ID Generator ──────────────────────── */

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* ── Device Detection ─────────────────────────── */

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const p = navigator.platform || '';

  let os = 'Unknown';
  let osVersion = '';
  let installerType = 'Web App';
  let installerExt = '.html';

  if (/Windows/.test(ua)) {
    os = 'Windows';
    const m = ua.match(/Windows NT (\d+\.\d+)/);
    osVersion = m ? m[1] : '';
    installerType = 'Desktop Installer';
    installerExt = '.exe';
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS';
    const m = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = m ? m[1].replace(/_/g, '.') : '';
    installerType = 'Desktop Installer';
    installerExt = '.dmg';
  } else if (/Android/.test(ua)) {
    os = 'Android';
    const m = ua.match(/Android (\d+(\.\d+)?)/);
    osVersion = m ? m[1] : '';
    installerType = 'Mobile Package';
    installerExt = '.apk';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    const m = ua.match(/OS (\d+_\d+)/);
    osVersion = m ? m[1].replace(/_/g, '.') : '';
    installerType = 'Mobile Package';
    installerExt = '.ipa';
  } else if (/Linux/.test(ua) || /Linux/.test(p)) {
    os = 'Linux';
    installerType = 'Desktop Installer';
    installerExt = '.AppImage';
  } else if (/CrOS/.test(ua)) {
    os = 'ChromeOS';
    installerType = 'Web App';
    installerExt = '.pwa';
  }

  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/.test(ua)) browser = 'Opera';

  let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad|Android(?!.*Mobile)/.test(ua)) deviceType = 'tablet';

  let gpu = 'Unknown';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    }
  } catch { /* ignore */ }

  const isElectron = typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).process;
  const isCapacitor = typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).Capacitor;
  const isPWA = window.matchMedia?.('(display-mode: standalone)')?.matches || false;

  return {
    os,
    osVersion,
    browser,
    deviceType,
    architecture: /arm|aarch64/i.test(ua) ? 'ARM' : /x86_64|x64|amd64/i.test(ua) ? 'x64' : p.includes('64') ? 'x64' : 'x86',
    cores: navigator.hardwareConcurrency || 4,
    memory: (navigator as unknown as Record<string, unknown>).deviceMemory as number || 8,
    gpu,
    isElectron,
    isCapacitor,
    isPWA,
    isOnline: navigator.onLine,
    installerType,
    installerExt,
  };
}

/* ── IndexedDB + localStorage Persistence ─────── */

const DB_NAME = 'neuralforge';
const DB_VERSION = 1;
const STORE_NAME = 'models';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveForgedModel(model: ForgedModel): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(model);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch {
    /* fallback to localStorage */
  }
  const models = loadModelsFromLS();
  models[model.id] = model;
  localStorage.setItem('nf_models', JSON.stringify(models));
}

export async function loadAllForgedModels(): Promise<ForgedModel[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return Object.values(loadModelsFromLS());
  }
}

export async function deleteForgedModel(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch { /* ignore */ }
  const models = loadModelsFromLS();
  delete models[id];
  localStorage.setItem('nf_models', JSON.stringify(models));
}

function loadModelsFromLS(): Record<string, ForgedModel> {
  try {
    return JSON.parse(localStorage.getItem('nf_models') || '{}');
  } catch {
    return {};
  }
}

/* ── AI Model Catalog ─────────────────────────── */

export const MODEL_CATALOG: AIModel[] = [
  {
    id: 'claude-opus',
    name: 'Claude Opus 4',
    company: 'Anthropic',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpFdyVpVeiHpaCdE4FL2M9YJZRPU-wbWgqRQ&s',
    description: 'Anthropic\'s most powerful model with extended thinking, superior reasoning and unmatched safety alignment. Best-in-class for complex analysis.',
    parameters: '2T',
    size: '8.2 GB',
    category: 'text',
    capabilities: ['Reasoning', 'Code Generation', 'Analysis', 'Creative Writing', 'Math'],
    architecture: 'Transformer (Constitutional AI)',
    contextWindow: '200K tokens',
    license: 'Proprietary',
    color: '#d4a574',
  },
  {
    id: 'chatgpt-5',
    name: 'ChatGPT-5 (GPT-5)',
    company: 'OpenAI',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl4ME17pNVHlQNwiw3IrqL6f-4tE2X05UjUw&s',
    description: 'OpenAI\'s flagship model with breakthrough multimodal capabilities, native tool use, and unprecedented reasoning depth.',
    parameters: '1.8T',
    size: '7.5 GB',
    category: 'multimodal',
    capabilities: ['Multimodal', 'Reasoning', 'Vision', 'Code', 'Tool Use'],
    architecture: 'Mixture of Experts (MoE)',
    contextWindow: '128K tokens',
    license: 'Proprietary',
    color: '#10a37f',
  },
  {
    id: 'gemini-25-pro',
    name: 'Gemini 2.5 Pro',
    company: 'Google DeepMind',
    logo: 'https://www.dztecs.com/ai/wp-content/uploads/sites/2/2025/09/gHfBJ6FBHKnLbW36hEDvgV.png',
    description: 'Google\'s most capable model with 1M token context, native multimodal understanding, and state-of-the-art benchmark performance.',
    parameters: '1.5T',
    size: '6.8 GB',
    category: 'multimodal',
    capabilities: ['Long Context', 'Multimodal', 'Code', 'Reasoning', 'Search'],
    architecture: 'Transformer (Multimodal)',
    contextWindow: '1M tokens',
    license: 'Proprietary',
    color: '#4285f4',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    company: 'DeepSeek',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ09ekt850mXs23iTiP82moDbKzJdECTnmv-g&s',
    description: 'Open-source reasoning model rivaling frontier models at 1/50th the cost. Excels at math, code, and chain-of-thought reasoning.',
    parameters: '671B',
    size: '4.2 GB',
    category: 'code',
    capabilities: ['Reasoning', 'Mathematics', 'Code', 'Chain-of-Thought', 'Open Source'],
    architecture: 'Mixture of Experts (MoE)',
    contextWindow: '128K tokens',
    license: 'MIT',
    color: '#4f6ef7',
  },
  {
    id: 'llama-4',
    name: 'LLaMA 4 Maverick',
    company: 'Meta AI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/250px-Meta-Logo.png',
    description: 'Meta\'s open-weight powerhouse. 128 experts MoE architecture with only 17B active parameters for blazing-fast inference.',
    parameters: '400B',
    size: '3.8 GB',
    category: 'text',
    capabilities: ['Open Source', 'Fine-tuning', 'Multilingual', 'Reasoning', 'Code'],
    architecture: 'Mixture of Experts (MoE)',
    contextWindow: '1M tokens',
    license: 'LLaMA License',
    color: '#0668E1',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large 2',
    company: 'Mistral AI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mistral_AI_logo_%282025%29.svg/120px-Mistral_AI_logo_%282025%29.svg.png',
    description: 'European AI champion with 128K context, native function calling, and best-in-class multilingual performance across 12 languages.',
    parameters: '123B',
    size: '2.8 GB',
    category: 'text',
    capabilities: ['Multilingual', 'Function Calling', 'Code', 'Reasoning', 'JSON Mode'],
    architecture: 'Transformer (Dense)',
    contextWindow: '128K tokens',
    license: 'Apache 2.0',
    color: '#ff7000',
  },
  {
    id: 'mixtral-8x22b',
    name: 'Mixtral 8x22B',
    company: 'Mistral AI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mistral_AI_logo_%282025%29.svg/120px-Mistral_AI_logo_%282025%29.svg.png',
    description: 'Sparse MoE model with 8 expert networks. Efficient, fast, and powerful. Only 39B active parameters from 176B total.',
    parameters: '176B',
    size: '3.1 GB',
    category: 'code',
    capabilities: ['MoE', 'Efficient', 'Code', 'Math', 'Multilingual'],
    architecture: 'Sparse Mixture of Experts',
    contextWindow: '64K tokens',
    license: 'Apache 2.0',
    color: '#ff7000',
  },
  {
    id: 'phi-4',
    name: 'Phi-4',
    company: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
    description: 'Small but mighty. Microsoft\'s compact model punches far above its weight in reasoning, math, and code generation.',
    parameters: '14B',
    size: '1.2 GB',
    category: 'code',
    capabilities: ['Compact', 'Reasoning', 'Code', 'Math', 'Edge Deploy'],
    architecture: 'Transformer (Dense)',
    contextWindow: '16K tokens',
    license: 'MIT',
    color: '#00a4ef',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    company: 'xAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/XAI-Logo.svg/200px-XAI-Logo.svg.png',
    description: 'xAI\'s unfiltered powerhouse trained on the Colossus supercluster. Real-time internet access and maximum helpfulness.',
    parameters: '314B',
    size: '3.5 GB',
    category: 'multimodal',
    capabilities: ['Real-time Data', 'Unfiltered', 'Reasoning', 'Code', 'Vision'],
    architecture: 'Transformer (Dense)',
    contextWindow: '128K tokens',
    license: 'Proprietary',
    color: '#1da1f2',
  },
  {
    id: 'qwen-3',
    name: 'Qwen 3',
    company: 'Alibaba Cloud',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Alibaba_Cloud_logo.svg/200px-Alibaba_Cloud_logo.svg.png',
    description: 'Alibaba\'s hybrid thinking model with seamless mode switching. Top-tier multilingual support across 119 languages.',
    parameters: '235B',
    size: '3.2 GB',
    category: 'text',
    capabilities: ['Multilingual', 'Hybrid Thinking', 'Code', 'Agentic', '119 Languages'],
    architecture: 'Mixture of Experts (MoE)',
    contextWindow: '128K tokens',
    license: 'Apache 2.0',
    color: '#ff6a00',
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    company: 'Stability AI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Stability_AI_logo.svg/200px-Stability_AI_logo.svg.png',
    description: 'Open-source image generation powerhouse. Create stunning visuals from text with unmatched customization and LoRA support.',
    parameters: '6.6B',
    size: '5.1 GB',
    category: 'image',
    capabilities: ['Text-to-Image', 'Inpainting', 'LoRA', 'ControlNet', 'Open Source'],
    architecture: 'Latent Diffusion (UNet)',
    contextWindow: 'N/A',
    license: 'Open RAIL-M',
    color: '#a855f7',
  },
  {
    id: 'whisper-large',
    name: 'Whisper Large v3',
    company: 'OpenAI',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl4ME17pNVHlQNwiw3IrqL6f-4tE2X05UjUw&s',
    description: 'Best-in-class speech recognition across 100+ languages. Handles accents, background noise, and technical language with ease.',
    parameters: '1.5B',
    size: '2.9 GB',
    category: 'audio',
    capabilities: ['Speech-to-Text', 'Translation', '100+ Languages', 'Timestamps', 'Open Source'],
    architecture: 'Encoder-Decoder Transformer',
    contextWindow: '30s segments',
    license: 'MIT',
    color: '#10a37f',
  },
  {
    id: 'cohere-command-r',
    name: 'Command R+',
    company: 'Cohere',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Cohere_logo_2023.svg/200px-Cohere_logo_2023.svg.png',
    description: 'Enterprise-grade RAG model. Built for retrieval-augmented generation with citation support and multilingual capabilities.',
    parameters: '104B',
    size: '2.4 GB',
    category: 'text',
    capabilities: ['RAG', 'Citations', 'Enterprise', 'Multilingual', 'Tool Use'],
    architecture: 'Transformer (Dense)',
    contextWindow: '128K tokens',
    license: 'CC-BY-NC',
    color: '#39594d',
  },
  {
    id: 'yi-large',
    name: 'Yi-Large',
    company: '01.AI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/01.AI_logo.svg/200px-01.AI_logo.svg.png',
    description: 'Top Chinese bilingual model excelling in both English and Chinese. Strong reasoning and knowledge capabilities.',
    parameters: '102B',
    size: '2.3 GB',
    category: 'text',
    capabilities: ['Bilingual', 'Reasoning', 'Knowledge', 'Long Context', 'Code'],
    architecture: 'Transformer (Dense)',
    contextWindow: '200K tokens',
    license: 'Apache 2.0',
    color: '#6d28d9',
  },
  {
    id: 'dalle-3',
    name: 'DALL-E 3',
    company: 'OpenAI',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl4ME17pNVHlQNwiw3IrqL6f-4tE2X05UjUw&s',
    description: 'OpenAI\'s most advanced image model with unprecedented text rendering and prompt adherence for photorealistic outputs.',
    parameters: '12B',
    size: '4.8 GB',
    category: 'image',
    capabilities: ['Text-to-Image', 'Text Rendering', 'Photorealistic', 'Artistic', 'Editing'],
    architecture: 'Diffusion Transformer',
    contextWindow: 'N/A',
    license: 'Proprietary',
    color: '#10a37f',
  },
  {
    id: 'falcon-180b',
    name: 'Falcon 180B',
    company: 'TII',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Falcon_LLM_logo.png/200px-Falcon_LLM_logo.png',
    description: 'One of the largest open models from the Technology Innovation Institute. Massive scale with strong multilingual support.',
    parameters: '180B',
    size: '3.6 GB',
    category: 'text',
    capabilities: ['Open Source', 'Multilingual', 'Large Scale', 'Research', 'Fine-tuning'],
    architecture: 'Transformer (Dense)',
    contextWindow: '8K tokens',
    license: 'Apache 2.0',
    color: '#ef4444',
  },
];

/* ── AI Response Generator ────────────────────── */

const KNOWLEDGE: Record<string, string[]> = {
  greeting: [
    "Hello! I'm ready to assist you with any questions or tasks you might have.",
    "Greetings. How can I help you today? I'm equipped to handle a wide range of topics.",
    "Hi there. I'm your AI assistant, ready to provide detailed and thoughtful responses.",
  ],
  code: [
    "Here's my approach to that coding problem:\n\nFirst, we should consider the algorithmic complexity. For optimal performance, I'd recommend using a hash map-based solution which gives us O(n) time complexity.\n\n```\nfunction solve(data) {\n  const map = new Map();\n  for (const item of data) {\n    map.set(item.key, item.value);\n  }\n  return map;\n}\n```\n\nThis approach ensures efficient lookups while maintaining clean, readable code.",
    "Let me break down the solution step by step:\n\n1. Parse the input data structure\n2. Apply the transformation logic\n3. Handle edge cases (null, empty, overflow)\n4. Return the optimized result\n\nThe key insight here is to use dynamic programming to avoid redundant calculations.",
  ],
  reasoning: [
    "Let me think through this systematically.\n\nFirst, let's identify the core problem: we need to balance efficiency with accuracy.\n\nConsider the following approach:\n- Step 1: Decompose the problem into subproblems\n- Step 2: Solve each subproblem independently\n- Step 3: Combine the solutions using a merge strategy\n- Step 4: Validate the combined result\n\nThis divide-and-conquer approach ensures we handle complexity gracefully while maintaining correctness.",
    "Interesting question. Let me analyze this from multiple angles.\n\nFrom a theoretical perspective, the answer involves considering trade-offs between computational resources and output quality. The optimal solution lies at the intersection of these constraints.\n\nPractically speaking, I would recommend starting with a baseline approach and iteratively refining based on measured results.",
  ],
  general: [
    "That's a great question. Let me provide a comprehensive answer.\n\nThe topic you're asking about involves several interconnected concepts. At its core, it's about understanding how systems interact and produce emergent behavior.\n\nKey points to consider:\n- The fundamental principles that govern this domain\n- How recent advancements have changed our understanding\n- Practical applications and their implications\n\nI'd be happy to dive deeper into any specific aspect.",
    "Here's what I know about that topic.\n\nIt's a fascinating area that has seen significant progress in recent years. The main developments include improved methodologies, better tools, and a deeper theoretical understanding.\n\nThe current consensus in the field suggests that a hybrid approach, combining traditional methods with modern techniques, yields the best results. However, the optimal strategy depends heavily on the specific context and requirements.",
  ],
};

export function generateResponse(input: string, _modelName: string): string {
  const lower = input.toLowerCase();
  if (/^(hi|hello|hey|greetings|good morning|good evening)/.test(lower)) {
    return pick(KNOWLEDGE.greeting);
  }
  if (/code|program|function|algorithm|debug|javascript|python|typescript|react|api/.test(lower)) {
    return pick(KNOWLEDGE.code);
  }
  if (/why|how|explain|reason|think|analyze|compare|difference/.test(lower)) {
    return pick(KNOWLEDGE.reasoning);
  }
  return pick(KNOWLEDGE.general);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
