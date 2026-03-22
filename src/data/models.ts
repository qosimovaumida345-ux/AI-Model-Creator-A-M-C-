// src/data/models.ts
import type { AIModel, ModelCategory } from '@/types';

function m(
  id: string,
  name: string,
  provider: string,
  category: ModelCategory,
  description: string,
  params: string,
  license: string,
  overrides: Partial<AIModel> = {}
): AIModel {
  return {
    id,
    name,
    provider,
    category,
    description,
    params,
    license,
    formats: overrides.formats || ['safetensors'],
    tasks: overrides.tasks || [category],
    architecture: overrides.architecture || 'Transformer',
    contextLength: overrides.contextLength || 4096,
    fineTunable: overrides.fineTunable ?? false,
    openSource: overrides.openSource ?? false,
    apiAvailable: overrides.apiAvailable ?? true,
    freeOnOpenRouter: overrides.freeOnOpenRouter ?? false,
    hardwareReq: overrides.hardwareReq || 'API access',
    trainingData: overrides.trainingData || 'Not disclosed',
    benchmarks: overrides.benchmarks || {},
    isVariant: overrides.isVariant ?? false,
    ...overrides,
  };
}

// ── Shorthand flags ──────────────────────────────────────────────
const F: Partial<AIModel> = { fineTunable: true };
const OS: Partial<AIModel> = { openSource: true };
const FR: Partial<AIModel> = { freeOnOpenRouter: true };
const ALL: Partial<AIModel> = { ...OS, ...F, ...FR };

// helper: open‑source + fine‑tunable but NOT free on OpenRouter
const OSF: Partial<AIModel> = { ...OS, ...F };

// ── GGUF convenience ────────────────────────────────────────────
const GGUF = ['safetensors', 'gguf'] as string[];
const GGUF3 = ['safetensors', 'gguf', 'onnx'] as string[];

// ═════════════════════════════════════════════════════════════════
//  CORE MODELS  (~270 hand‑written entries)
// ═════════════════════════════════════════════════════════════════
const coreModels: AIModel[] = [

  // ═══════════════════════════════════════
  // OPENAI  (16)
  // ═══════════════════════════════════════
  m('gpt-4o', 'GPT-4o', 'OpenAI', 'multimodal',
    'Most advanced multimodal model — text, vision, audio in one model with 128K context',
    '~1.8T', 'Proprietary',
    {
      contextLength: 128000, tasks: ['text-generation', 'vision', 'audio'], freeOnOpenRouter: true,
      benchmarks: { MMLU: 88.7, HumanEval: 90.2 }, hardwareReq: 'API only'
    }),

  m('gpt-4-turbo', 'GPT-4 Turbo', 'OpenAI', 'text-generation',
    'GPT-4 Turbo with 128K context, vision capabilities, and knowledge up to Apr 2024',
    '~1.8T', 'Proprietary',
    { contextLength: 128000, tasks: ['text-generation', 'vision'], benchmarks: { MMLU: 86.4 }, hardwareReq: 'API only' }),

  m('gpt-4', 'GPT-4', 'OpenAI', 'text-generation',
    'Original GPT-4 model with strong reasoning and 8K default context window',
    '~1.8T', 'Proprietary',
    { contextLength: 8192, benchmarks: { MMLU: 86.4, HumanEval: 67.0 }, hardwareReq: 'API only' }),

  m('gpt-35-turbo', 'GPT-3.5 Turbo', 'OpenAI', 'text-generation',
    'Fast and affordable model optimized for chat and instruction-following tasks',
    '~175B', 'Proprietary',
    { contextLength: 16385, freeOnOpenRouter: true, benchmarks: { MMLU: 70.0 }, hardwareReq: 'API only' }),

  m('o1', 'o1', 'OpenAI', 'text-generation',
    'Advanced reasoning model that thinks step-by-step before answering complex problems',
    'Unknown', 'Proprietary',
    { contextLength: 200000, benchmarks: { MMLU: 91.8, MATH: 96.4 }, hardwareReq: 'API only' }),

  m('o1-mini', 'o1-mini', 'OpenAI', 'text-generation',
    'Smaller and faster reasoning model optimized for STEM tasks',
    'Unknown', 'Proprietary',
    { contextLength: 128000, benchmarks: { MATH: 90.0 }, hardwareReq: 'API only' }),

  m('o3', 'o3', 'OpenAI', 'text-generation',
    'Next-generation reasoning model with unprecedented benchmark performance',
    'Unknown', 'Proprietary',
    { contextLength: 200000, hardwareReq: 'API only' }),

  m('codex', 'Codex', 'OpenAI', 'code',
    'Code generation model powering GitHub Copilot, trained on public code repositories',
    '~12B', 'Proprietary',
    { contextLength: 8001, tasks: ['code-generation'], benchmarks: { HumanEval: 72.0 }, hardwareReq: 'API only' }),

  m('whisper-openai', 'Whisper', 'OpenAI', 'audio',
    'Robust automatic speech recognition trained on 680K hours of multilingual audio',
    '1.55B', 'MIT',
    {
      contextLength: 0, tasks: ['speech-recognition', 'translation'], ...OS, ...F,
      formats: ['pytorch', 'onnx', 'ggml'], hardwareReq: '4GB VRAM'
    }),

  m('dall-e-3', 'DALL-E 3', 'OpenAI', 'image-generation',
    'State-of-the-art image generation with superior prompt understanding and text rendering',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('dall-e-2', 'DALL-E 2', 'OpenAI', 'image-generation',
    'Image generation and editing model capable of creating realistic images from text',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('sora', 'Sora', 'OpenAI', 'video',
    'Text-to-video generation model creating realistic videos up to 60 seconds long',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['video-generation'], hardwareReq: 'API only' }),

  m('text-embedding-3-large', 'text-embedding-3-large', 'OpenAI', 'embedding',
    'Best-in-class embedding model with 3072 dimensions for superior semantic search',
    'Unknown', 'Proprietary',
    { contextLength: 8191, tasks: ['embeddings'], hardwareReq: 'API only' }),

  m('text-embedding-3-small', 'text-embedding-3-small', 'OpenAI', 'embedding',
    'Efficient embedding model with 1536 dimensions, 5x cheaper than large variant',
    'Unknown', 'Proprietary',
    { contextLength: 8191, tasks: ['embeddings'], hardwareReq: 'API only' }),

  m('tts-1-hd', 'TTS-1 HD', 'OpenAI', 'audio',
    'High-quality text-to-speech model with natural sounding voices',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['text-to-speech'], hardwareReq: 'API only' }),

  m('tts-1', 'TTS-1', 'OpenAI', 'audio',
    'Fast text-to-speech model optimized for real-time applications',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['text-to-speech'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // ANTHROPIC  (5)
  // ═══════════════════════════════════════
  m('claude-35-sonnet', 'Claude 3.5 Sonnet', 'Anthropic', 'text-generation',
    'Most intelligent Claude model — excels at coding, analysis, and complex reasoning',
    'Unknown', 'Proprietary',
    {
      contextLength: 200000, benchmarks: { MMLU: 88.7, HumanEval: 92.0 },
      hardwareReq: 'API only', freeOnOpenRouter: true
    }),

  m('claude-3-opus', 'Claude 3 Opus', 'Anthropic', 'text-generation',
    'Most powerful Claude 3 model for highly complex tasks requiring deep analysis',
    'Unknown', 'Proprietary',
    { contextLength: 200000, benchmarks: { MMLU: 86.8, HumanEval: 84.9 }, hardwareReq: 'API only' }),

  m('claude-3-haiku', 'Claude 3 Haiku', 'Anthropic', 'text-generation',
    'Fastest Claude 3 model — instant responses for lightweight tasks at low cost',
    'Unknown', 'Proprietary',
    { contextLength: 200000, freeOnOpenRouter: true, benchmarks: { MMLU: 75.2 }, hardwareReq: 'API only' }),

  m('claude-21', 'Claude 2.1', 'Anthropic', 'text-generation',
    'Previous generation Claude with 200K context and reduced hallucination rates',
    'Unknown', 'Proprietary',
    { contextLength: 200000, hardwareReq: 'API only' }),

  m('claude-instant', 'Claude Instant', 'Anthropic', 'text-generation',
    'Lightweight Claude variant for fast, affordable text processing at scale',
    'Unknown', 'Proprietary',
    { contextLength: 100000, hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // GOOGLE  (15)
  // ═══════════════════════════════════════
  m('gemini-20-flash', 'Gemini 2.0 Flash', 'Google', 'multimodal',
    'Latest Gemini with native tool use, multimodal generation, and 1M token context',
    'Unknown', 'Proprietary',
    {
      contextLength: 1048576, tasks: ['text-generation', 'vision', 'audio'],
      freeOnOpenRouter: true, hardwareReq: 'API only'
    }),

  m('gemini-15-pro', 'Gemini 1.5 Pro', 'Google', 'multimodal',
    'Highly capable multimodal model with 2M token context window',
    'Unknown', 'Proprietary',
    {
      contextLength: 2097152, tasks: ['text-generation', 'vision'],
      freeOnOpenRouter: true, benchmarks: { MMLU: 85.9 }, hardwareReq: 'API only'
    }),

  m('gemini-15-flash', 'Gemini 1.5 Flash', 'Google', 'multimodal',
    'Fast and efficient Gemini model with 1M context for high-volume applications',
    'Unknown', 'Proprietary',
    { contextLength: 1048576, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  m('gemini-ultra', 'Gemini Ultra', 'Google', 'multimodal',
    'Most capable Gemini model designed for highly complex multi-step reasoning',
    'Unknown', 'Proprietary',
    { contextLength: 128000, benchmarks: { MMLU: 90.0 }, hardwareReq: 'API only' }),

  m('palm-2', 'PaLM 2', 'Google', 'text-generation',
    'Advanced language model with strong multilingual and reasoning capabilities',
    '340B', 'Proprietary',
    { contextLength: 32768, hardwareReq: 'API only' }),

  m('gemma-2-27b', 'Gemma 2 27B', 'Google', 'text-generation',
    'Largest Gemma 2 model delivering near-GPT-4 performance in an open-weights package',
    '27B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { MMLU: 75.2 }, hardwareReq: '16GB VRAM' }),

  m('gemma-2-9b', 'Gemma 2 9B', 'Google', 'text-generation',
    'Efficient Gemma 2 with excellent performance-to-size ratio for local deployment',
    '9B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { MMLU: 71.3 }, hardwareReq: '8GB VRAM' }),

  m('gemma-2-2b', 'Gemma 2 2B', 'Google', 'text-generation',
    'Smallest Gemma 2 — runs on mobile devices and edge hardware with strong results',
    '2B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '4GB RAM' }),

  m('gemma-7b', 'Gemma 7B', 'Google', 'text-generation',
    'Original Gemma model with 7B parameters built from Gemini research',
    '7B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('gemma-2b', 'Gemma 2B', 'Google', 'text-generation',
    'Compact Gemma model for resource-constrained environments',
    '2B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '4GB RAM' }),

  m('codegemma', 'CodeGemma', 'Google', 'code',
    'Code-specialized Gemma model for generation, completion, and understanding',
    '7B', 'Gemma License',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('recurrentgemma', 'RecurrentGemma', 'Google', 'text-generation',
    'Gemma variant using recurrent architecture for efficient long-sequence processing',
    '2B', 'Gemma License',
    { contextLength: 8192, ...OSF, formats: ['safetensors'], hardwareReq: '4GB VRAM' }),

  m('medgemini', 'MedGemini', 'Google DeepMind', 'text-generation',
    'Medical domain model built on Gemini for clinical reasoning and medical Q&A',
    'Unknown', 'Research',
    { contextLength: 32768, hardwareReq: 'API only' }),

  m('paligemma', 'PaliGemma', 'Google', 'vision',
    'Vision-language model combining SigLIP and Gemma for visual understanding',
    '3B', 'Gemma License',
    { contextLength: 8192, ...OSF, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '4GB VRAM' }),

  m('imagen-3', 'Imagen 3', 'Google', 'image-generation',
    'Google highest quality text-to-image model with photorealistic output',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // META  (15)
  // ═══════════════════════════════════════
  m('llama-31-405b', 'LLaMA 3.1 405B', 'Meta', 'text-generation',
    'Largest open-source model ever — matches GPT-4 class performance across benchmarks',
    '405B', 'Llama 3.1 License',
    {
      contextLength: 131072, ...ALL, formats: GGUF,
      benchmarks: { MMLU: 87.3, HumanEval: 89.0 }, hardwareReq: '400GB+ VRAM'
    }),

  m('llama-31-70b', 'LLaMA 3.1 70B', 'Meta', 'text-generation',
    'Strong 70B model with 128K context — competitive with Claude 3 Sonnet',
    '70B', 'Llama 3.1 License',
    {
      contextLength: 131072, ...ALL, formats: GGUF,
      benchmarks: { MMLU: 83.6, HumanEval: 80.5 }, hardwareReq: '48GB VRAM'
    }),

  m('llama-31-8b', 'LLaMA 3.1 8B', 'Meta', 'text-generation',
    'Efficient 8B model with 128K context — best open model in its size class',
    '8B', 'Llama 3.1 License',
    {
      contextLength: 131072, ...ALL, formats: GGUF,
      benchmarks: { MMLU: 73.0, HumanEval: 72.6 }, hardwareReq: '8GB VRAM'
    }),

  m('llama-32-90b-vision', 'LLaMA 3.2 90B Vision', 'Meta', 'vision',
    'Largest Llama vision model with 90B parameters for advanced multimodal tasks',
    '90B', 'Llama 3.2 License',
    { contextLength: 131072, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '64GB VRAM' }),

  m('llama-32-11b-vision', 'LLaMA 3.2 11B Vision', 'Meta', 'vision',
    'Efficient Llama vision model for image understanding and multimodal reasoning',
    '11B', 'Llama 3.2 License',
    { contextLength: 131072, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '12GB VRAM' }),

  m('llama-32-3b', 'LLaMA 3.2 3B', 'Meta', 'text-generation',
    'Compact Llama 3.2 for edge deployment and mobile devices',
    '3B', 'Llama 3.2 License',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '4GB VRAM' }),

  m('llama-32-1b', 'LLaMA 3.2 1B', 'Meta', 'text-generation',
    'Smallest Llama 3.2 for ultra-lightweight on-device inference',
    '1B', 'Llama 3.2 License',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('llama-3-70b', 'LLaMA 3 70B', 'Meta', 'text-generation',
    'Powerful 70B model with 8K context trained on 15T tokens',
    '70B', 'Llama 3 License',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { MMLU: 82.0 }, hardwareReq: '48GB VRAM' }),

  m('llama-3-8b', 'LLaMA 3 8B', 'Meta', 'text-generation',
    'Efficient 8B model — excellent for fine-tuning and local use',
    '8B', 'Llama 3 License',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { MMLU: 68.4 }, hardwareReq: '8GB VRAM' }),

  m('llama-2-70b', 'LLaMA 2 70B', 'Meta', 'text-generation',
    'Previous gen 70B model — widely deployed and fine-tuned by community',
    '70B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  m('llama-2-13b', 'LLaMA 2 13B', 'Meta', 'text-generation',
    'Mid-size LLaMA 2 balancing capability and efficiency',
    '13B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('llama-2-7b', 'LLaMA 2 7B', 'Meta', 'text-generation',
    'Smallest LLaMA 2 — ideal for fine-tuning experiments',
    '7B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('codellama-70b', 'Code LLaMA 70B', 'Meta', 'code',
    'Largest Code Llama for complex code generation and understanding',
    '70B', 'Llama 2 License',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 67.8 }, hardwareReq: '48GB VRAM' }),

  m('codellama-34b', 'Code LLaMA 34B', 'Meta', 'code',
    'Code-specialized LLaMA with infilling and strong benchmarks',
    '34B', 'Llama 2 License',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 62.0 }, hardwareReq: '24GB VRAM' }),

  m('codellama-7b', 'Code LLaMA 7B', 'Meta', 'code',
    'Compact code model for fast code completion on consumer hardware',
    '7B', 'Llama 2 License',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 33.5 }, hardwareReq: '8GB VRAM' }),

  m('llama-guard-3', 'Llama Guard 3', 'Meta', 'text-generation',
    'Safety classifier model for content moderation in LLM applications',
    '8B', 'Llama 3.1 License',
    { contextLength: 131072, ...OSF, formats: GGUF, hardwareReq: '8GB VRAM' }),

  // ═══════════════════════════════════════
  // MISTRAL AI  (7)
  // ═══════════════════════════════════════
  m('mistral-large-2', 'Mistral Large 2', 'Mistral AI', 'text-generation',
    'Flagship 123B model with 128K context — competitive with GPT-4 and Claude 3.5',
    '123B', 'Mistral License',
    {
      contextLength: 131072, openSource: true, freeOnOpenRouter: true,
      benchmarks: { MMLU: 84.0 }, hardwareReq: '80GB VRAM', formats: GGUF
    }),

  m('mistral-nemo', 'Mistral Nemo', 'Mistral AI', 'text-generation',
    '12B model built with NVIDIA — best in class for its size with 128K context',
    '12B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('mixtral-8x22b', 'Mixtral 8x22B', 'Mistral AI', 'text-generation',
    'Large MoE model with 176B total, 44B active — strong multilingual performance',
    '176B (44B active)', 'Apache 2.0',
    {
      contextLength: 65536, ...ALL, formats: GGUF, architecture: 'Mixture of Experts',
      benchmarks: { MMLU: 77.8 }, hardwareReq: '100GB+ VRAM'
    }),

  m('mixtral-8x7b', 'Mixtral 8x7B', 'Mistral AI', 'text-generation',
    'Efficient MoE model with 46B total, 13B active — matches LLaMA 2 70B',
    '46B (13B active)', 'Apache 2.0',
    {
      contextLength: 32768, ...ALL, formats: GGUF, architecture: 'Mixture of Experts',
      benchmarks: { MMLU: 70.6 }, hardwareReq: '32GB VRAM'
    }),

  m('mistral-7b-v03', 'Mistral 7B v0.3', 'Mistral AI', 'text-generation',
    'Updated 7B base model with extended vocabulary and improved instruction following',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, benchmarks: { MMLU: 62.5 }, hardwareReq: '8GB VRAM' }),

  m('codestral', 'Codestral', 'Mistral AI', 'code',
    'Specialized 22B code model supporting 80+ programming languages',
    '22B', 'MNPL',
    { contextLength: 32768, ...OSF, formats: GGUF, benchmarks: { HumanEval: 81.1 }, hardwareReq: '16GB VRAM' }),

  m('mistral-embed', 'Mistral Embed', 'Mistral AI', 'embedding',
    'High-performance embedding model for retrieval and semantic search tasks',
    'Unknown', 'Proprietary',
    { contextLength: 8192, tasks: ['embeddings'], hardwareReq: 'API only' }),

  m('mistral-small', 'Mistral Small', 'Mistral AI', 'text-generation',
    'Cost-efficient model for simple tasks that can be done in bulk',
    'Unknown', 'Proprietary',
    { contextLength: 32768, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // MICROSOFT  (10)
  // ═══════════════════════════════════════
  m('phi-35-moe', 'Phi-3.5 MoE', 'Microsoft', 'text-generation',
    'Mixture-of-experts Phi with 42B total, 6.6B active — remarkable efficiency',
    '42B (6.6B active)', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '24GB VRAM' }),

  m('phi-35-mini', 'Phi-3.5 Mini', 'Microsoft', 'text-generation',
    'Updated 3.8B model with 128K context and improved multilingual capabilities',
    '3.8B', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF3, hardwareReq: '4GB VRAM' }),

  m('phi-35-vision', 'Phi-3.5 Vision', 'Microsoft', 'vision',
    'Vision-language Phi model for image and video understanding tasks',
    '4.2B', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '6GB VRAM' }),

  m('phi-3-medium', 'Phi-3 Medium', 'Microsoft', 'text-generation',
    '14B parameter model with excellent reasoning across many benchmarks',
    '14B', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF3, hardwareReq: '12GB VRAM' }),

  m('phi-3-small', 'Phi-3 Small', 'Microsoft', 'text-generation',
    '7B parameter Phi-3 with strong performance and efficient architecture',
    '7B', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF3, hardwareReq: '8GB VRAM' }),

  m('phi-3-mini', 'Phi-3 Mini', 'Microsoft', 'text-generation',
    '3.8B model that punches above its weight — ideal for mobile and edge',
    '3.8B', 'MIT',
    { contextLength: 131072, ...ALL, formats: GGUF3, hardwareReq: '4GB VRAM' }),

  m('phi-2', 'Phi-2', 'Microsoft', 'text-generation',
    '2.7B model with state-of-the-art performance among sub-3B models',
    '2.7B', 'MIT',
    { contextLength: 2048, ...ALL, formats: GGUF3, hardwareReq: '4GB RAM' }),

  m('wizardlm-2', 'WizardLM-2', 'Microsoft', 'text-generation',
    'Next-gen instruction model with improved complex reasoning abilities',
    '8x22B', 'Llama 2 License',
    { contextLength: 65536, ...OSF, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '100GB+ VRAM' }),

  m('orca-2', 'Orca 2', 'Microsoft', 'text-generation',
    'Small model that learns to use different reasoning strategies for different tasks',
    '13B', 'Microsoft Research',
    { contextLength: 4096, ...OSF, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('biogpt', 'BioGPT', 'Microsoft', 'text-generation',
    'Domain-specific GPT model pre-trained on biomedical literature',
    '1.5B', 'MIT',
    { contextLength: 1024, ...OSF, hardwareReq: '4GB RAM' }),

  // ═══════════════════════════════════════
  // xAI  (4)
  // ═══════════════════════════════════════
  m('grok-2', 'Grok-2', 'xAI', 'text-generation',
    'xAI flagship model with real-time information access and strong reasoning',
    'Unknown', 'Proprietary',
    { contextLength: 131072, freeOnOpenRouter: true, benchmarks: { MMLU: 87.5 }, hardwareReq: 'API only' }),

  m('grok-2-mini', 'Grok-2 Mini', 'xAI', 'text-generation',
    'Smaller and faster Grok variant optimized for speed and efficiency',
    'Unknown', 'Proprietary',
    { contextLength: 131072, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  m('grok-15v', 'Grok-1.5V', 'xAI', 'multimodal',
    'Multimodal Grok with vision capabilities for image understanding',
    'Unknown', 'Proprietary',
    { contextLength: 128000, tasks: ['text-generation', 'vision'], hardwareReq: 'API only' }),

  m('grok-1', 'Grok-1', 'xAI', 'text-generation',
    'First-generation Grok model with 314B parameters, released open-source',
    '314B', 'Apache 2.0',
    { contextLength: 8192, ...OS, formats: ['safetensors'], hardwareReq: '300GB+ VRAM' }),

  // ═══════════════════════════════════════
  // ALIBABA / QWEN  (10)
  // ═══════════════════════════════════════
  m('qwen25-72b', 'Qwen2.5 72B', 'Alibaba', 'text-generation',
    'Flagship Qwen model with exceptional multilingual and coding capabilities',
    '72B', 'Qwen License',
    { contextLength: 131072, ...ALL, formats: GGUF, benchmarks: { MMLU: 85.3 }, hardwareReq: '48GB VRAM' }),

  m('qwen25-32b', 'Qwen2.5 32B', 'Alibaba', 'text-generation',
    'Strong 32B model balancing performance and deployment efficiency',
    '32B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('qwen25-14b', 'Qwen2.5 14B', 'Alibaba', 'text-generation',
    'Efficient 14B model with excellent multilingual understanding',
    '14B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('qwen25-7b', 'Qwen2.5 7B', 'Alibaba', 'text-generation',
    'Versatile 7B model excelling in code, math, and general reasoning',
    '7B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('qwen25-3b', 'Qwen2.5 3B', 'Alibaba', 'text-generation',
    'Compact Qwen for edge deployment and mobile applications',
    '3B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '4GB VRAM' }),

  m('qwen25-1-5b', 'Qwen2.5 1.5B', 'Alibaba', 'text-generation',
    'Ultra-lightweight Qwen for on-device inference',
    '1.5B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('qwen25-coder', 'Qwen2.5-Coder', 'Alibaba', 'code',
    'Code-specialized Qwen with state-of-the-art programming abilities',
    '7B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, benchmarks: { HumanEval: 88.4 }, hardwareReq: '8GB VRAM' }),

  m('qwen2-vl', 'Qwen2 VL', 'Alibaba', 'vision',
    'Vision-language model with advanced image and video understanding',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('qwen-audio', 'Qwen-Audio', 'Alibaba', 'audio',
    'Audio understanding model for speech recognition, translation, and analysis',
    '7B', 'Qwen License',
    { contextLength: 32768, ...OSF, tasks: ['audio', 'speech-recognition'], hardwareReq: '8GB VRAM' }),

  m('qwen25-math-72b', 'Qwen2.5-Math 72B', 'Alibaba', 'text-generation',
    'Math-specialized model with strong mathematical reasoning and problem solving',
    '72B', 'Qwen License',
    { contextLength: 4096, ...OSF, formats: GGUF, benchmarks: { MATH: 83.1 }, hardwareReq: '48GB VRAM' }),

  // ═══════════════════════════════════════
  // DEEPSEEK  (7)
  // ═══════════════════════════════════════
  m('deepseek-v25', 'DeepSeek-V2.5', 'DeepSeek', 'text-generation',
    'Combines general and coding capabilities in a unified MoE architecture',
    '236B (21B active)', 'DeepSeek License',
    { contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '80GB VRAM' }),

  m('deepseek-coder-v2', 'DeepSeek-Coder-V2', 'DeepSeek', 'code',
    'Advanced code model rivaling GPT-4 Turbo in coding benchmarks',
    '236B (21B active)', 'DeepSeek License',
    {
      contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts',
      benchmarks: { HumanEval: 90.2 }, hardwareReq: '80GB VRAM'
    }),

  m('deepseek-v2', 'DeepSeek-V2', 'DeepSeek', 'text-generation',
    'Strong MoE model with efficient MLA attention for cost-effective inference',
    '236B (21B active)', 'DeepSeek License',
    { contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '80GB VRAM' }),

  m('deepseek-r1', 'DeepSeek-R1', 'DeepSeek', 'text-generation',
    'Reasoning model with chain-of-thought capabilities rivaling o1',
    '671B (37B active)', 'DeepSeek License',
    {
      contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts',
      benchmarks: { MMLU: 90.8, MATH: 97.3 }, hardwareReq: '400GB+ VRAM'
    }),

  m('deepseek-llm-67b', 'DeepSeek-LLM 67B', 'DeepSeek', 'text-generation',
    'Dense 67B model trained on 2T tokens of high-quality data',
    '67B', 'DeepSeek License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  m('deepseek-coder-33b', 'DeepSeek-Coder 33B', 'DeepSeek', 'code',
    'Code model trained on 2T tokens with 87 programming languages',
    '33B', 'DeepSeek License',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 56.1 }, hardwareReq: '24GB VRAM' }),

  m('deepseek-coder-v2-lite', 'DeepSeek-Coder-V2 Lite', 'DeepSeek', 'code',
    'Lightweight code model for efficient deployment with strong coding ability',
    '16B (2.4B active)', 'DeepSeek License',
    { contextLength: 131072, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '8GB VRAM' }),

  // ═══════════════════════════════════════
  // 01.AI  (Yi)  (7)
  // ═══════════════════════════════════════
  m('yi-large', 'Yi-Large', '01.AI', 'text-generation',
    'Flagship Yi model with strong multilingual and reasoning capabilities',
    'Unknown', 'Proprietary',
    { contextLength: 32768, hardwareReq: 'API only' }),

  m('yi-15-34b', 'Yi-1.5 34B', '01.AI', 'text-generation',
    'Large Yi model with excellent performance across reasoning benchmarks',
    '34B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('yi-15-9b', 'Yi-1.5 9B', '01.AI', 'text-generation',
    'Efficient 9B Yi model for balanced performance and cost',
    '9B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('yi-15-6b', 'Yi-1.5 6B', '01.AI', 'text-generation',
    'Compact Yi model for resource-efficient deployment',
    '6B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '6GB VRAM' }),

  m('yi-vision', 'Yi-Vision', '01.AI', 'vision',
    'Vision-language Yi model for image understanding and visual reasoning',
    '34B', 'Apache 2.0',
    { contextLength: 4096, ...OSF, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '24GB VRAM' }),

  m('yi-coder-9b', 'Yi-Coder 9B', '01.AI', 'code',
    'Code-specialized Yi with strong programming ability across languages',
    '9B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('yi-coder-1-5b', 'Yi-Coder 1.5B', '01.AI', 'code',
    'Ultra-compact code model for on-device code completion',
    '1.5B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  // ═══════════════════════════════════════
  // COHERE  (5)
  // ═══════════════════════════════════════
  m('command-r-plus', 'Command R+', 'Cohere', 'text-generation',
    'Cohere most powerful model optimized for RAG and enterprise applications',
    '104B', 'CC-BY-NC',
    { contextLength: 131072, ...OSF, freeOnOpenRouter: true, formats: GGUF, hardwareReq: '64GB VRAM' }),

  m('command-r', 'Command R', 'Cohere', 'text-generation',
    'Efficient model optimized for retrieval-augmented generation workflows',
    '35B', 'CC-BY-NC',
    { contextLength: 131072, ...OSF, freeOnOpenRouter: true, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('command', 'Command', 'Cohere', 'text-generation',
    'General-purpose text generation model for business applications',
    'Unknown', 'Proprietary',
    { contextLength: 4096, hardwareReq: 'API only' }),

  m('embed-v3', 'Embed v3', 'Cohere', 'embedding',
    'State-of-the-art multilingual embedding model with 1024 dimensions',
    'Unknown', 'Proprietary',
    { contextLength: 512, tasks: ['embeddings'], hardwareReq: 'API only' }),

  m('rerank-3', 'Rerank 3', 'Cohere', 'embedding',
    'Semantic reranking model for improving search relevance and RAG quality',
    'Unknown', 'Proprietary',
    { contextLength: 4096, tasks: ['reranking'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // AI21 LABS  (3)
  // ═══════════════════════════════════════
  m('jamba-15-large', 'Jamba 1.5 Large', 'AI21 Labs', 'text-generation',
    'Hybrid SSM-Transformer model with 256K context and strong long-document abilities',
    '94B (12B active)', 'Jamba License',
    {
      contextLength: 262144, ...OSF, freeOnOpenRouter: true, formats: GGUF,
      architecture: 'SSM-Transformer Hybrid', hardwareReq: '80GB VRAM'
    }),

  m('jamba-15-mini', 'Jamba 1.5 Mini', 'AI21 Labs', 'text-generation',
    'Compact Jamba with efficient SSM architecture for cost-effective inference',
    '52B (12B active)', 'Jamba License',
    {
      contextLength: 262144, ...OSF, freeOnOpenRouter: true, formats: GGUF,
      architecture: 'SSM-Transformer Hybrid', hardwareReq: '32GB VRAM'
    }),

  m('jurassic-2', 'Jurassic-2', 'AI21 Labs', 'text-generation',
    'AI21 Labs enterprise-grade language model for professional applications',
    'Unknown', 'Proprietary',
    { contextLength: 8192, hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // TII / FALCON  (4)
  // ═══════════════════════════════════════
  m('falcon-180b', 'Falcon 180B', 'TII', 'text-generation',
    'One of the largest open-source models with strong multilingual performance',
    '180B', 'Falcon License',
    { contextLength: 2048, ...OSF, formats: GGUF, hardwareReq: '200GB+ VRAM' }),

  m('falcon-40b', 'Falcon 40B', 'TII', 'text-generation',
    'High-performance 40B model trained on RefinedWeb dataset',
    '40B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '32GB VRAM' }),

  m('falcon-7b', 'Falcon 7B', 'TII', 'text-generation',
    'Efficient 7B model with excellent quality per parameter count',
    '7B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('falcon-2-11b', 'Falcon 2 11B', 'TII', 'text-generation',
    'Next-gen Falcon with improved architecture and 11B parameters',
    '11B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  // ═══════════════════════════════════════
  // STABILITY AI  (8)
  // ═══════════════════════════════════════
  m('sd-35-large', 'Stable Diffusion 3.5 Large', 'Stability AI', 'image-generation',
    'Latest SD model with 8B MMDiT-X architecture for highest quality image generation',
    '8B', 'Stability Community',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '12GB VRAM' }),

  m('sd-3', 'Stable Diffusion 3', 'Stability AI', 'image-generation',
    'MMDiT architecture model with superior text rendering and composition',
    '2B', 'Stability Community',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '8GB VRAM' }),

  m('sdxl-10', 'SDXL 1.0', 'Stability AI', 'image-generation',
    'High-resolution image generation model producing 1024x1024 images natively',
    '3.5B', 'CreativeML Open RAIL++-M',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '8GB VRAM' }),

  m('sd-15', 'Stable Diffusion 1.5', 'Stability AI', 'image-generation',
    'Most widely adopted image generation model with massive ecosystem of extensions',
    '860M', 'CreativeML Open RAIL-M',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '4GB VRAM' }),

  m('svd', 'Stable Video Diffusion', 'Stability AI', 'video',
    'Video generation model creating short clips from image inputs',
    '1.5B', 'Stability Community',
    { contextLength: 0, ...OSF, tasks: ['video-generation'], hardwareReq: '16GB VRAM' }),

  m('stable-audio-2', 'Stable Audio 2.0', 'Stability AI', 'audio',
    'AI audio generation model for music and sound effects from text prompts',
    'Unknown', 'Stability Community',
    { contextLength: 0, ...OSF, tasks: ['audio-generation'], hardwareReq: '8GB VRAM' }),

  m('stablelm-2', 'StableLM 2', 'Stability AI', 'text-generation',
    'Efficient language model for local deployment with strong performance per size',
    '1.6B', 'Stability Community',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '4GB RAM' }),

  m('stable-cascade', 'Stable Cascade', 'Stability AI', 'image-generation',
    'Multi-stage image generation with Würstchen architecture for efficiency',
    '5.1B', 'Stability Community',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '10GB VRAM' }),

  // ═══════════════════════════════════════
  // BLACK FOREST LABS  (3)
  // ═══════════════════════════════════════
  m('flux-1-pro', 'FLUX.1 Pro', 'Black Forest Labs', 'image-generation',
    'State-of-the-art text-to-image model with exceptional prompt adherence',
    '12B', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('flux-1-dev', 'FLUX.1 Dev', 'Black Forest Labs', 'image-generation',
    'Open-weight variant of FLUX.1 for research and development use',
    '12B', 'FLUX.1-dev Non-Commercial',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '24GB VRAM' }),

  m('flux-1-schnell', 'FLUX.1 Schnell', 'Black Forest Labs', 'image-generation',
    'Fast distilled FLUX model generating images in 1-4 steps',
    '12B', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '16GB VRAM' }),

  // ═══════════════════════════════════════
  // RUNWAY  (2)
  // ═══════════════════════════════════════
  m('gen-3-alpha', 'Gen-3 Alpha', 'Runway', 'video',
    'Advanced video generation model for high-fidelity content creation',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['video-generation'], hardwareReq: 'API only' }),

  m('gen-2', 'Gen-2', 'Runway', 'video',
    'Text and image-to-video generation with motion controls',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['video-generation'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // PIKA  (2)
  // ═══════════════════════════════════════
  m('pika-20', 'Pika 2.0', 'Pika Labs', 'video',
    'Next-generation video model with scene-level editing and effects',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['video-generation'], hardwareReq: 'API only' }),

  m('pika-15', 'Pika 1.5', 'Pika Labs', 'video',
    'Video generation model with style transfer and motion control',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['video-generation'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // ELEVENLABS  (3)
  // ═══════════════════════════════════════
  m('elevenlabs-turbo-v25', 'ElevenLabs Turbo v2.5', 'ElevenLabs', 'audio',
    'Lowest-latency voice synthesis model for real-time applications',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['text-to-speech'], hardwareReq: 'API only' }),

  m('elevenlabs-multilingual-v2', 'ElevenLabs Multilingual v2', 'ElevenLabs', 'audio',
    'Multi-language voice synthesis supporting 29 languages with emotional range',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['text-to-speech'], hardwareReq: 'API only' }),

  m('elevenlabs-voice-design', 'ElevenLabs Voice Design', 'ElevenLabs', 'audio',
    'Generate custom synthetic voices from text descriptions',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['voice-cloning'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // ASSEMBLYAI  (2)
  // ═══════════════════════════════════════
  m('assemblyai-universal-2', 'AssemblyAI Universal-2', 'AssemblyAI', 'audio',
    'Best-in-class speech recognition with near-human accuracy across accents',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['speech-recognition'], hardwareReq: 'API only' }),

  m('assemblyai-nano', 'AssemblyAI Nano', 'AssemblyAI', 'audio',
    'Ultra-fast speech recognition model optimized for real-time streaming',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['speech-recognition'], hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // NVIDIA  (5)
  // ═══════════════════════════════════════
  m('nemotron-4-340b', 'Nemotron-4 340B', 'NVIDIA', 'text-generation',
    'Massive 340B model for synthetic data generation and reward modeling',
    '340B', 'NVIDIA Open Model License',
    { contextLength: 4096, ...OSF, formats: GGUF, hardwareReq: '400GB+ VRAM' }),

  m('mistral-nemo-minitron', 'Mistral-NeMo-Minitron', 'NVIDIA', 'text-generation',
    'Pruned and distilled Mistral Nemo for efficient deployment',
    '8B', 'NVIDIA Open Model License',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('llama-31-nemotron', 'Llama-3.1-Nemotron 70B', 'NVIDIA', 'text-generation',
    'NVIDIA-customized LLaMA 3.1 70B optimized for helpfulness and accuracy',
    '70B', 'Llama 3.1 License',
    { contextLength: 131072, ...ALL, formats: GGUF, benchmarks: { MMLU: 85.0 }, hardwareReq: '48GB VRAM' }),

  m('nvlm-d-72b', 'NVLM-D 72B', 'NVIDIA', 'vision',
    'Frontier-class multimodal model matching GPT-4V on vision benchmarks',
    '72B', 'NVIDIA Open Model License',
    { contextLength: 32768, ...OSF, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '48GB VRAM' }),

  m('nemotron-mini-4b', 'Nemotron-Mini 4B', 'NVIDIA', 'text-generation',
    'Compact 4B model distilled from Nemotron-4 for edge deployment',
    '4B', 'NVIDIA Open Model License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '4GB VRAM' }),

  // ═══════════════════════════════════════
  // SAMSUNG  (1)
  // ═══════════════════════════════════════
  m('samsung-gauss-2', 'Samsung Gauss 2', 'Samsung', 'text-generation',
    'Samsung on-device AI model for Galaxy devices with language and code abilities',
    'Unknown', 'Proprietary',
    { contextLength: 4096, hardwareReq: 'Device only' }),

  // ═══════════════════════════════════════
  // APPLE  (2)
  // ═══════════════════════════════════════
  m('openelm-3b', 'OpenELM 3B', 'Apple', 'text-generation',
    'Apple open-source efficient language model with layer-wise scaling',
    '3B', 'Apple License',
    { contextLength: 2048, ...OSF, formats: ['safetensors'], hardwareReq: '4GB VRAM' }),

  m('openelm-1-1b', 'OpenELM 1.1B', 'Apple', 'text-generation',
    'Compact Apple language model for on-device inference research',
    '1.1B', 'Apple License',
    { contextLength: 2048, ...OSF, formats: ['safetensors'], hardwareReq: '2GB RAM' }),

  // ═══════════════════════════════════════
  // SALESFORCE  (2)
  // ═══════════════════════════════════════
  m('xgen-7b', 'XGen-7B', 'Salesforce', 'text-generation',
    'Salesforce 7B model trained on 1.5T tokens with 8K context support',
    '7B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('codet5-plus', 'CodeT5+', 'Salesforce', 'code',
    'Encoder-decoder code model supporting code understanding and generation',
    '16B', 'BSD-3-Clause',
    { contextLength: 2048, ...OSF, hardwareReq: '12GB VRAM' }),

  // ═══════════════════════════════════════
  // BIGCODE / HUGGINGFACE  (10)
  // ═══════════════════════════════════════
  m('starcoder2-15b', 'StarCoder2 15B', 'BigCode', 'code',
    'Trained on 4T+ tokens from The Stack v2 — strong code generation across 600+ languages',
    '15B', 'BigCode Open RAIL-M',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 46.3 }, hardwareReq: '12GB VRAM' }),

  m('starcoder2-7b', 'StarCoder2 7B', 'BigCode', 'code',
    'Efficient code model balancing performance and deployment cost',
    '7B', 'BigCode Open RAIL-M',
    { contextLength: 16384, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('starcoder2-3b', 'StarCoder2 3B', 'BigCode', 'code',
    'Compact code model for real-time code completion on consumer hardware',
    '3B', 'BigCode Open RAIL-M',
    { contextLength: 16384, ...ALL, formats: GGUF, hardwareReq: '4GB VRAM' }),

  m('starcoder', 'StarCoder', 'BigCode', 'code',
    'Original StarCoder model trained on permissively licensed code',
    '15B', 'BigCode Open RAIL-M',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { HumanEval: 33.6 }, hardwareReq: '12GB VRAM' }),

  m('wizardcoder', 'WizardCoder', 'BigCode', 'code',
    'Instruction-tuned code model with Evol-Instruct for complex coding tasks',
    '15B', 'BigCode Open RAIL-M',
    { contextLength: 8192, ...ALL, formats: GGUF, benchmarks: { HumanEval: 57.3 }, hardwareReq: '12GB VRAM' }),

  m('zephyr-7b', 'Zephyr 7B', 'HuggingFace', 'text-generation',
    'Mistral 7B fine-tuned with DPO — strong chat model with aligned responses',
    '7B', 'MIT',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('zephyr-141b', 'Zephyr 141B', 'HuggingFace', 'text-generation',
    'Mixtral 8x22B fine-tuned with DPO for high-quality instruction following',
    '141B', 'Apache 2.0',
    { contextLength: 65536, ...ALL, formats: GGUF, hardwareReq: '100GB+ VRAM' }),

  m('smollm2', 'SmolLM2', 'HuggingFace', 'text-generation',
    'Tiny but capable language model family for edge and embedded use cases',
    '1.7B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('idefics3', 'IDEFICS3', 'HuggingFace', 'vision',
    'Open multimodal model for visual question answering and image understanding',
    '8B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('smolvlm', 'SmolVLM', 'HuggingFace', 'vision',
    'Compact vision-language model for efficient multimodal processing',
    '2B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '4GB VRAM' }),

  // ═══════════════════════════════════════
  // NOUSRESEARCH  (3)
  // ═══════════════════════════════════════
  m('hermes-3-70b', 'Hermes 3 70B', 'NousResearch', 'text-generation',
    'Frontier-class instruction model with function calling and advanced reasoning',
    '70B', 'Llama 3.1 License',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  m('hermes-3-8b', 'Hermes 3 8B', 'NousResearch', 'text-generation',
    'Efficient instruct model with strong tool use and structured output',
    '8B', 'Llama 3.1 License',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('nous-capybara', 'Nous Capybara', 'NousResearch', 'text-generation',
    'Multi-turn conversation model trained on curated long-form dialogues',
    '34B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  // ═══════════════════════════════════════
  // COGNITIVE COMPUTATIONS  (2)
  // ═══════════════════════════════════════
  m('dolphin-29', 'Dolphin 2.9', 'Cognitive Computations', 'text-generation',
    'Uncensored instruct model based on Llama 3 with broad knowledge',
    '70B', 'Llama 3 License',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  m('dolphin-mixtral', 'Dolphin Mixtral', 'Cognitive Computations', 'text-generation',
    'Uncensored Mixtral MoE fine-tune for unrestricted general assistance',
    '46B (13B active)', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '32GB VRAM' }),

  // ═══════════════════════════════════════
  // IMAGE MODELS  (12)
  // ═══════════════════════════════════════
  m('controlnet', 'ControlNet', 'Lvmin Zhang', 'image-generation',
    'Adds spatial conditioning controls to Stable Diffusion for guided generation',
    '1.4B', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '6GB VRAM' }),

  m('ip-adapter', 'IP-Adapter', 'Tencent', 'image-generation',
    'Image prompt adapter for SD — reference image-guided generation',
    '22M', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '6GB VRAM' }),

  m('animatediff', 'AnimateDiff', 'Yuwei Guo', 'video',
    'Motion module for Stable Diffusion enabling text-to-video generation',
    '500M', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['video-generation'], hardwareReq: '8GB VRAM' }),

  m('instructpix2pix', 'InstructPix2Pix', 'Tim Brooks', 'image-generation',
    'Edit images using text instructions without masks or inpainting',
    '860M', 'MIT',
    { contextLength: 0, ...ALL, tasks: ['image-editing'], hardwareReq: '6GB VRAM' }),

  m('kandinsky-3', 'Kandinsky 3', 'Sber', 'image-generation',
    'Text-to-image model with strong prompt following and artistic quality',
    '11.9B', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '12GB VRAM' }),

  m('wuerstchen', 'Wuerstchen', 'Stability AI', 'image-generation',
    'Highly efficient diffusion model working in compressed latent space',
    '1B', 'MIT',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '4GB VRAM' }),

  m('segmind-ssd', 'Segmind SSD', 'Segmind', 'image-generation',
    'Distilled SDXL model 50% smaller — generates high-quality images 2x faster',
    '1.3B', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '4GB VRAM' }),

  m('playground-v25', 'Playground v2.5', 'Playground AI', 'image-generation',
    'Aesthetically focused image model surpassing SDXL in human preference',
    '2.6B', 'Playground License',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '8GB VRAM' }),

  m('ideogram-20', 'Ideogram 2.0', 'Ideogram', 'image-generation',
    'Best-in-class text rendering in generated images with high quality',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('adobe-firefly', 'Adobe Firefly', 'Adobe', 'image-generation',
    'Commercially safe image generation trained on licensed content',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('midjourney', 'Midjourney', 'Midjourney', 'image-generation',
    'Industry-leading artistic image generation with distinctive aesthetic quality',
    'Unknown', 'Proprietary',
    { contextLength: 0, tasks: ['image-generation'], hardwareReq: 'API only' }),

  m('pixart-sigma', 'PixArt-Sigma', 'PixArt', 'image-generation',
    'Efficient DiT-based model generating 4K images with weak-to-strong training',
    '600M', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '6GB VRAM' }),

  m('deepfloyd-if', 'DeepFloyd IF', 'Stability AI', 'image-generation',
    'Pixel-based cascaded diffusion model with native text understanding',
    '4.3B', 'DeepFloyd License',
    { contextLength: 0, ...OSF, tasks: ['image-generation'], hardwareReq: '16GB VRAM' }),

  m('sdxl-turbo', 'SDXL Turbo', 'Stability AI', 'image-generation',
    'Adversarial diffusion distilled SDXL for real-time image generation',
    '3.5B', 'Stability Community',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '8GB VRAM' }),

  m('lcm', 'Latent Consistency Models', 'Tsinghua', 'image-generation',
    'Generate high-quality images in 2-4 steps by distilling diffusion models',
    'Various', 'MIT',
    { contextLength: 0, ...ALL, tasks: ['image-generation'], hardwareReq: '6GB VRAM' }),

  // ═══════════════════════════════════════
  // CODE MODELS (additional)  (5)
  // ═══════════════════════════════════════
  m('phind-codellama', 'Phind-CodeLlama 34B', 'Phind', 'code',
    'Code LLaMA fine-tuned on proprietary data for superior code generation',
    '34B', 'Llama 2 License',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 73.8 }, hardwareReq: '24GB VRAM' }),

  m('magicoder', 'Magicoder', 'ise-uiuc', 'code',
    'Code model trained on synthetic coding exercises using OSS-Instruct',
    '6.7B', 'Apache 2.0',
    { contextLength: 16384, ...ALL, formats: GGUF, benchmarks: { HumanEval: 76.8 }, hardwareReq: '8GB VRAM' }),

  m('opencoder', 'OpenCoder', 'InternLM', 'code',
    'Open-source code model with strong performance on coding benchmarks',
    '8B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('refact-1-6b', 'Refact 1.6B', 'Refact AI', 'code',
    'Ultra-compact code model for IDE integration and real-time completion',
    '1.6B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('granite-code-34b', 'Granite Code 34B', 'IBM', 'code',
    'IBM enterprise-grade code model trained on 116 programming languages',
    '34B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('granite-code-8b', 'Granite Code 8B', 'IBM', 'code',
    'Efficient IBM code model for code generation and understanding',
    '8B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('codeqwen-7b', 'CodeQwen 7B', 'Alibaba', 'code',
    'Code-specialized Qwen with strong multi-language programming ability',
    '7B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  // ═══════════════════════════════════════
  // EMBEDDING MODELS  (7)
  // ═══════════════════════════════════════
  m('uae-large-v1', 'UAE-Large-V1', 'WhereIsAI', 'embedding',
    'Top MTEB embedding model with 1024 dimensions and strong retrieval',
    '335M', 'MIT',
    { contextLength: 512, ...ALL, tasks: ['embeddings'], hardwareReq: '2GB RAM' }),

  m('bge-m3', 'BGE-M3', 'BAAI', 'embedding',
    'Multi-functionality, multi-lingual, multi-granularity embedding model',
    '567M', 'MIT',
    { contextLength: 8192, ...ALL, tasks: ['embeddings'], hardwareReq: '2GB RAM' }),

  m('e5-mistral', 'E5-Mistral-7B', 'Microsoft', 'embedding',
    'Mistral-based embedding model with 4096-dimension high-quality embeddings',
    '7B', 'MIT',
    { contextLength: 32768, ...ALL, tasks: ['embeddings'], hardwareReq: '8GB VRAM' }),

  m('nomic-embed', 'Nomic Embed', 'Nomic AI', 'embedding',
    'Fully open-source embedding model with 768 dimensions and 8K context',
    '137M', 'Apache 2.0',
    { contextLength: 8192, ...ALL, tasks: ['embeddings'], hardwareReq: '1GB RAM' }),

  m('jina-embeddings-v3', 'Jina Embeddings v3', 'Jina AI', 'embedding',
    'Task-specific embedding model with 1024 dimensions and late interaction',
    '570M', 'Apache 2.0',
    { contextLength: 8192, ...ALL, tasks: ['embeddings'], hardwareReq: '2GB RAM' }),

  m('gte-large', 'GTE-Large', 'Alibaba', 'embedding',
    'General text embeddings model with strong performance on MTEB benchmark',
    '335M', 'MIT',
    { contextLength: 8192, ...ALL, tasks: ['embeddings'], hardwareReq: '2GB RAM' }),

  m('mxbai-embed-large', 'mxbai-embed-large', 'mixedbread.ai', 'embedding',
    'High-quality embedding model ranking top on MTEB retrieval benchmarks',
    '335M', 'Apache 2.0',
    { contextLength: 512, ...ALL, tasks: ['embeddings'], hardwareReq: '2GB RAM' }),

  m('all-minilm-l6-v2', 'all-MiniLM-L6-v2', 'sentence-transformers', 'embedding',
    'Most popular lightweight sentence embedding model for quick prototyping',
    '22M', 'Apache 2.0',
    { contextLength: 256, ...ALL, tasks: ['embeddings'], formats: GGUF3, hardwareReq: '256MB RAM' }),

  // ═══════════════════════════════════════
  // VISION MODELS  (11)
  // ═══════════════════════════════════════
  m('llava-16-34b', 'LLaVA 1.6 34B', 'LLaVA Team', 'vision',
    'Large vision-language model with excellent visual understanding and reasoning',
    '34B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '24GB VRAM' }),

  m('llava-16-13b', 'LLaVA 1.6 13B', 'LLaVA Team', 'vision',
    'Mid-size vision-language model balancing quality and efficiency',
    '13B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '12GB VRAM' }),

  m('bakllava', 'BakLLaVA', 'SkunkworksAI', 'vision',
    'Mistral-based vision-language model with strong visual reasoning',
    '7B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('cogvlm2', 'CogVLM2', 'Zhipu AI', 'vision',
    'Advanced vision-language model with deep image understanding capabilities',
    '19B', 'CogVLM2 License',
    { contextLength: 8192, ...OSF, tasks: ['vision', 'text-generation'], hardwareReq: '16GB VRAM' }),

  m('internvl2', 'InternVL2', 'Shanghai AI Lab', 'vision',
    'Open-source GPT-4V competitor with dynamic high-resolution image processing',
    '76B', 'MIT',
    { contextLength: 32768, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '48GB VRAM' }),

  m('pixtral-12b', 'Pixtral 12B', 'Mistral AI', 'vision',
    'Mistral first multimodal model with native image understanding at 12B scale',
    '12B', 'Apache 2.0',
    { contextLength: 131072, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '12GB VRAM' }),

  m('molmo-72b', 'Molmo 72B', 'Allen AI', 'vision',
    'Frontier vision-language model with pointing and spatial reasoning',
    '72B', 'Apache 2.0',
    { contextLength: 4096, ...OSF, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '48GB VRAM' }),

  m('molmo-7b', 'Molmo 7B', 'Allen AI', 'vision',
    'Efficient Molmo variant for accessible vision-language tasks',
    '7B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('mplug-owl3', 'mPLUG-Owl3', 'Alibaba', 'vision',
    'Advanced multimodal model for interleaved image-text understanding',
    '7B', 'Apache 2.0',
    { contextLength: 8192, ...OSF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('moondream-2', 'Moondream 2', 'Vikhyat', 'vision',
    'Ultra-compact 1.8B vision model running on edge devices with strong results',
    '1.8B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '2GB RAM' }),

  m('florence-2', 'Florence 2', 'Microsoft', 'vision',
    'Unified vision foundation model for captioning, detection, segmentation',
    '770M', 'MIT',
    { contextLength: 4096, ...ALL, tasks: ['vision', 'text-generation'], hardwareReq: '4GB VRAM' }),

  // ═══════════════════════════════════════
  // AUDIO MODELS (additional)  (5)
  // ═══════════════════════════════════════
  m('bark', 'Bark', 'Suno', 'audio',
    'Open-source text-to-audio model generating speech, music, and sound effects',
    '1B', 'MIT',
    { contextLength: 0, ...ALL, tasks: ['text-to-speech', 'audio-generation'], hardwareReq: '6GB VRAM' }),

  m('musicgen', 'MusicGen', 'Meta', 'audio',
    'Text-to-music model generating high-quality music from text descriptions',
    '3.3B', 'CC-BY-NC',
    { contextLength: 0, ...OSF, tasks: ['music-generation'], hardwareReq: '8GB VRAM' }),

  m('xtts-v2', 'XTTS v2', 'Coqui', 'audio',
    'Multi-lingual text-to-speech with voice cloning in 17 languages',
    '500M', 'CPML',
    { contextLength: 0, ...OSF, tasks: ['text-to-speech', 'voice-cloning'], hardwareReq: '4GB VRAM' }),

  m('tortoise-tts', 'Tortoise TTS', 'James Betker', 'audio',
    'High-quality multi-voice TTS system with prosody control',
    '1B', 'Apache 2.0',
    { contextLength: 0, ...ALL, tasks: ['text-to-speech'], hardwareReq: '6GB VRAM' }),

  m('whisper-large-v3', 'Whisper Large v3', 'OpenAI', 'audio',
    'Latest Whisper with improved multilingual accuracy and reduced hallucinations',
    '1.55B', 'MIT',
    { contextLength: 0, ...ALL, tasks: ['speech-recognition'], formats: ['pytorch', 'onnx', 'ggml'], hardwareReq: '4GB VRAM' }),

  // ═══════════════════════════════════════
  // ELEUTHERAI  (5)
  // ═══════════════════════════════════════
  m('gpt-neox-20b', 'GPT-NeoX-20B', 'EleutherAI', 'text-generation',
    'Autoregressive 20B model — one of the first large open-source LLMs',
    '20B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '16GB VRAM' }),

  m('gpt-j-6b', 'GPT-J-6B', 'EleutherAI', 'text-generation',
    'Popular open-source 6B model with strong code generation abilities',
    '6B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '6GB VRAM' }),

  m('pythia-12b', 'Pythia 12B', 'EleutherAI', 'text-generation',
    'Research model suite for studying LLM training dynamics at 12B scale',
    '12B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('pythia-6-9b', 'Pythia 6.9B', 'EleutherAI', 'text-generation',
    'Mid-size Pythia model for interpretability and training research',
    '6.9B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('pythia-2-8b', 'Pythia 2.8B', 'EleutherAI', 'text-generation',
    'Compact Pythia model for efficient training dynamics research',
    '2.8B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '4GB VRAM' }),

  // ═══════════════════════════════════════
  // MOSAIC / DATABRICKS  (4)
  // ═══════════════════════════════════════
  m('dbrx', 'DBRX', 'Databricks', 'text-generation',
    'Databricks 132B MoE model with 36B active — strong general performance',
    '132B (36B active)', 'Databricks Open Model License',
    { contextLength: 32768, ...ALL, formats: GGUF, architecture: 'Mixture of Experts', hardwareReq: '80GB VRAM' }),

  m('mpt-30b', 'MPT-30B', 'MosaicML', 'text-generation',
    '30B model with 8K context trained with ALiBi for length extrapolation',
    '30B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('mpt-7b', 'MPT-7B', 'MosaicML', 'text-generation',
    'Efficient 7B model with ALiBi attention — one of the first fully open LLMs',
    '7B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('dolly-v2', 'Dolly v2', 'Databricks', 'text-generation',
    'First commercially viable open-source instruction-following model',
    '12B', 'MIT',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  // ═══════════════════════════════════════
  // INFLECTION / REKA / WRITER  (4)
  // ═══════════════════════════════════════
  m('inflection-25', 'Inflection 2.5', 'Inflection AI', 'text-generation',
    'Model powering Pi chatbot — competitive with GPT-4 at 40% of compute',
    'Unknown', 'Proprietary',
    { contextLength: 32768, hardwareReq: 'API only' }),

  m('reka-core', 'Reka Core', 'Reka', 'multimodal',
    'Frontier multimodal model processing text, images, video, and audio',
    'Unknown', 'Proprietary',
    { contextLength: 128000, tasks: ['text-generation', 'vision', 'audio'], hardwareReq: 'API only' }),

  m('reka-flash', 'Reka Flash', 'Reka', 'multimodal',
    'Efficient multimodal model balancing speed and capability',
    '21B', 'Proprietary',
    { contextLength: 128000, tasks: ['text-generation', 'vision'], hardwareReq: 'API only' }),

  m('reka-edge', 'Reka Edge', 'Reka', 'text-generation',
    'Compact Reka model for on-device and edge deployment scenarios',
    '7B', 'Proprietary',
    { contextLength: 128000, hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // ALLEN AI  (3)
  // ═══════════════════════════════════════
  m('olmo-7b', 'OLMo 7B', 'Allen AI', 'text-generation',
    'Fully open model with open data, training code, and evaluation',
    '7B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('olmo-1-7b', 'OLMo 1.7B', 'Allen AI', 'text-generation',
    'Compact fully open model for research into language model training',
    '1.7B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('tulu-2', 'Tulu 2', 'Allen AI', 'text-generation',
    'Instruction-tuned LLaMA with DPO alignment and strong chat ability',
    '70B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  // ═══════════════════════════════════════
  // INTERNLM  (3)
  // ═══════════════════════════════════════
  m('internlm2-20b', 'InternLM2 20B', 'Shanghai AI Lab', 'text-generation',
    'Strong 20B model with excellent reasoning and 200K context support',
    '20B', 'Apache 2.0',
    { contextLength: 200000, ...ALL, formats: GGUF, hardwareReq: '16GB VRAM' }),

  m('internlm2-7b', 'InternLM2 7B', 'Shanghai AI Lab', 'text-generation',
    'Efficient InternLM model with strong Chinese and English capability',
    '7B', 'Apache 2.0',
    { contextLength: 200000, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('internlm2-1-8b', 'InternLM2 1.8B', 'Shanghai AI Lab', 'text-generation',
    'Ultra-compact InternLM for mobile and embedded applications',
    '1.8B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  // ═══════════════════════════════════════
  // CHATGLM / ZHIPU  (2)
  // ═══════════════════════════════════════
  m('glm-4', 'GLM-4', 'Zhipu AI', 'text-generation',
    'Leading Chinese-English bilingual model with strong reasoning and tool use',
    'Unknown', 'Proprietary',
    { contextLength: 131072, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  m('chatglm3-6b', 'ChatGLM3-6B', 'Zhipu AI', 'text-generation',
    'Open bilingual chat model with code interpretation and function calling',
    '6B', 'ChatGLM3 License',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '6GB VRAM' }),

  // ═══════════════════════════════════════
  // BAICHUAN  (2)
  // ═══════════════════════════════════════
  m('baichuan2-13b', 'Baichuan2 13B', 'Baichuan', 'text-generation',
    'Strong Chinese-English bilingual model with 13B parameters',
    '13B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('baichuan2-7b', 'Baichuan2 7B', 'Baichuan', 'text-generation',
    'Efficient bilingual model for Chinese and English language tasks',
    '7B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  // ═══════════════════════════════════════
  // MINICPM / TENCENT  (3)
  // ═══════════════════════════════════════
  m('minicpm-v-26', 'MiniCPM-V 2.6', 'OpenBMB', 'vision',
    'Ultra-compact vision-language model with GPT-4V comparable performance',
    '8B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

  m('minicpm-2b', 'MiniCPM 2B', 'OpenBMB', 'text-generation',
    'Powerful 2B model punching above its weight in benchmarks',
    '2B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '2GB RAM' }),

  m('hunyuan-large', 'Hunyuan-Large', 'Tencent', 'text-generation',
    'Tencent largest MoE model with 389B total parameters and strong Chinese ability',
    '389B (52B active)', 'Tencent Hunyuan License',
    { contextLength: 32768, ...OSF, architecture: 'Mixture of Experts', hardwareReq: '200GB+ VRAM' }),

  // ═══════════════════════════════════════
  // COMMUNITY FINE-TUNES  (16)
  // ═══════════════════════════════════════
  m('vicuna-13b', 'Vicuna 13B', 'LMSYS', 'text-generation',
    'LLaMA fine-tune on ShareGPT conversations — strong open chat model',
    '13B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('vicuna-7b', 'Vicuna 7B', 'LMSYS', 'text-generation',
    'Compact Vicuna variant for accessible conversational AI',
    '7B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('openchat-36', 'OpenChat 3.6', 'OpenChat', 'text-generation',
    'Latest OpenChat trained with C-RLFT — exceeds ChatGPT on MT-Bench',
    '8B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('openchat-35', 'OpenChat 3.5', 'OpenChat', 'text-generation',
    'Mistral 7B fine-tune achieving 7.81 on MT-Bench without RLHF',
    '7B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('openhermes-25', 'OpenHermes 2.5', 'Teknium', 'text-generation',
    'Mistral 7B fine-tuned on curated GPT-4 data with function calling',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('airoboros-70b', 'Airoboros 70B', 'jondurbin', 'text-generation',
    'Creative writing and roleplay focused fine-tune of LLaMA 2 70B',
    '70B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '48GB VRAM' }),

  m('mythomax-13b', 'MythoMax 13B', 'Gryphe', 'text-generation',
    'Top creative writing model merging multiple specialized fine-tunes',
    '13B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '12GB VRAM' }),

  m('neural-chat-7b', 'Neural Chat 7B', 'Intel', 'text-generation',
    'Intel-optimized Mistral fine-tune for helpful and safe conversations',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('solar-10-7b', 'SOLAR 10.7B', 'Upstage', 'text-generation',
    'Depth-upscaled 10.7B model with excellent instruction following',
    '10.7B', 'Apache 2.0',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('wizardmath-70b', 'WizardMath 70B', 'WizardLM', 'text-generation',
    'Mathematical reasoning model using Reinforcement Learning from Evol-Instruct',
    '70B', 'Llama 2 License',
    { contextLength: 4096, ...OSF, formats: GGUF, benchmarks: { MATH: 22.7, GSM8K: 81.6 }, hardwareReq: '48GB VRAM' }),

  m('metamath-7b', 'MetaMath 7B', 'MetaMath', 'text-generation',
    'Math-focused fine-tune with bootstrapped mathematical reasoning data',
    '7B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('llemma-34b', 'Llemma 34B', 'EleutherAI', 'text-generation',
    'Open language model for mathematics with formal proof generation ability',
    '34B', 'Llama 2 License',
    { contextLength: 4096, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('tinyllama', 'TinyLlama 1.1B', 'TinyLlama', 'text-generation',
    'Compact 1.1B model trained on 3T tokens — great for edge devices',
    '1.1B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '1GB RAM' }),

  m('decilm-7b', 'DeciLM 7B', 'Deci AI', 'text-generation',
    'Optimized 7B model with variable GQA for faster inference',
    '7B', 'Apache 2.0',
    { contextLength: 8192, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('persimmon-8b', 'Persimmon 8B', 'Adept', 'text-generation',
    'Fully permissively licensed 8B model with 100K vocabulary',
    '8B', 'Apache 2.0',
    { contextLength: 16384, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('redpajama-7b', 'RedPajama 7B', 'Together AI', 'text-generation',
    'LLaMA architecture model trained on fully open RedPajama dataset',
    '7B', 'Apache 2.0',
    { contextLength: 2048, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  // ═══════════════════════════════════════
  // ALTERNATIVE ARCHITECTURES  (5)
  // ═══════════════════════════════════════
  m('rwkv-5-14b', 'RWKV-5 14B', 'RWKV', 'text-generation',
    'Linear attention RNN-Transformer hybrid with O(1) inference memory',
    '14B', 'Apache 2.0',
    { contextLength: 65536, ...ALL, formats: GGUF, architecture: 'RWKV (Linear Attention)', hardwareReq: '12GB VRAM' }),

  m('rwkv-5-7b', 'RWKV-5 7B', 'RWKV', 'text-generation',
    'Efficient RWKV model combining RNN speed with transformer quality',
    '7B', 'Apache 2.0',
    { contextLength: 65536, ...ALL, formats: GGUF, architecture: 'RWKV (Linear Attention)', hardwareReq: '8GB VRAM' }),

  m('mamba-2-8b', 'Mamba 2.8B', 'state-spaces', 'text-generation',
    'Selective state space model with linear-time sequence processing',
    '2.8B', 'Apache 2.0',
    { contextLength: 65536, ...ALL, formats: GGUF, architecture: 'Mamba (SSM)', hardwareReq: '4GB VRAM' }),

  m('striped-hyena-7b', 'StripedHyena 7B', 'Together AI', 'text-generation',
    'Hybrid model with Hyena operators for efficient long-range sequence modeling',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, architecture: 'Hyena Hybrid', hardwareReq: '8GB VRAM' }),

  m('bloom-176b', 'BLOOM 176B', 'BigScience', 'text-generation',
    'Multilingual model supporting 46 languages and 13 programming languages',
    '176B', 'RAIL',
    { contextLength: 2048, ...OSF, formats: GGUF, hardwareReq: '200GB+ VRAM' }),

  // ═══════════════════════════════════════
  // PERPLEXITY  (2)
  // ═══════════════════════════════════════
  m('pplx-70b-online', 'pplx-70b-online', 'Perplexity', 'text-generation',
    'Search-augmented 70B model with real-time internet access for current information',
    '70B', 'Proprietary',
    { contextLength: 4096, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  m('pplx-7b-online', 'pplx-7b-online', 'Perplexity', 'text-generation',
    'Efficient search-augmented model for real-time information retrieval',
    '7B', 'Proprietary',
    { contextLength: 4096, freeOnOpenRouter: true, hardwareReq: 'API only' }),

  // ═══════════════════════════════════════
  // SNOWFLAKE / IBM / MISC  (4)
  // ═══════════════════════════════════════
  m('snowflake-arctic', 'Snowflake Arctic', 'Snowflake', 'text-generation',
    'Dense-MoE hybrid with 480B total, 17B active — optimized for enterprise SQL and code',
    '480B (17B active)', 'Apache 2.0',
    { contextLength: 4096, ...ALL, architecture: 'Dense-MoE Hybrid', hardwareReq: '200GB+ VRAM' }),

  m('palmyra-x-004', 'Palmyra X 004', 'Writer', 'text-generation',
    'Enterprise-focused model excelling at business writing and analysis',
    'Unknown', 'Proprietary',
    { contextLength: 131072, hardwareReq: 'API only' }),

  m('qwq-32b-preview', 'QwQ-32B-Preview', 'Alibaba', 'text-generation',
    'Experimental reasoning model with chain-of-thought capabilities',
    '32B', 'Qwen License',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '24GB VRAM' }),

  m('marco-o1', 'Marco-o1', 'Alibaba', 'text-generation',
    'Open reasoning model focused on complex problem solving',
    '7B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('skywork-o1-8b', 'Skywork-o1 8B', 'Skywork', 'text-generation',
    'Open-source reasoning model trained with process reward modeling',
    '8B', 'Apache 2.0',
    { contextLength: 32768, ...ALL, formats: GGUF, hardwareReq: '8GB VRAM' }),

  m('llava-onevision-72b', 'LLaVA-OneVision 72B', 'LLaVA Team', 'vision',
    'Unified vision model handling single image, multi-image, and video understanding',
    '72B', 'Apache 2.0',
    { contextLength: 32768, ...OSF, formats: GGUF, tasks: ['vision', 'text-generation'], hardwareReq: '48GB VRAM' }),

  m('cogagent', 'CogAgent', 'Zhipu AI', 'vision',
    'Visual agent model for GUI understanding and web browsing automation',
    '18B', 'CogVLM2 License',
    { contextLength: 8192, ...OSF, tasks: ['vision', 'text-generation'], hardwareReq: '16GB VRAM' }),

  m('fuyu-8b', 'Fuyu 8B', 'Adept', 'vision',
    'Simplified vision-language model without separate image encoder',
    '8B', 'CC-BY-NC',
    { contextLength: 16384, ...OSF, tasks: ['vision', 'text-generation'], hardwareReq: '8GB VRAM' }),

];

// ═════════════════════════════════════════════════════════════════
//  GGUF QUANTIZED VARIANTS — auto-generated to reach 500+
// ═════════════════════════════════════════════════════════════════
const QUANT_LEVELS = ['Q3_K_M', 'Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0'] as const;

const quantDescriptions: Record<string, string> = {
  Q3_K_M: 'Aggressive quantization — smallest size, moderate quality loss',
  Q4_K_M: 'Balanced quantization — recommended for most users',
  Q5_K_M: 'Higher quality quantization with reasonable size increase',
  Q6_K: 'Near-lossless quantization with minimal quality degradation',
  Q8_0: 'Highest quality quantization — closest to full precision',
};

const quantSizeMultipliers: Record<string, number> = {
  Q3_K_M: 0.35,
  Q4_K_M: 0.45,
  Q5_K_M: 0.55,
  Q6_K: 0.65,
  Q8_0: 0.85,
};

// Select popular open-source models that realistically have GGUF quants
const quantCandidateIds = new Set([
  'llama-31-8b', 'llama-31-70b', 'llama-32-3b', 'llama-32-1b',
  'llama-3-8b', 'llama-3-70b', 'llama-2-7b', 'llama-2-13b',
  'codellama-7b', 'codellama-34b',
  'mistral-7b-v03', 'mistral-nemo', 'mixtral-8x7b',
  'gemma-2-2b', 'gemma-2-9b', 'gemma-2-27b', 'gemma-7b',
  'phi-3-mini', 'phi-35-mini', 'phi-2',
  'qwen25-7b', 'qwen25-14b', 'qwen25-32b', 'qwen25-3b',
  'yi-15-6b', 'yi-15-9b', 'yi-15-34b',
  'deepseek-coder-33b', 'deepseek-coder-v2-lite',
  'falcon-7b', 'falcon-2-11b',
  'starcoder2-3b', 'starcoder2-7b', 'starcoder2-15b',
  'hermes-3-8b', 'dolphin-mixtral',
  'openchat-35', 'openhermes-25', 'neural-chat-7b',
  'solar-10-7b', 'tinyllama', 'vicuna-7b', 'vicuna-13b',
  'zephyr-7b', 'stablelm-2', 'olmo-7b',
  'chatglm3-6b', 'baichuan2-7b', 'minicpm-2b',
  'rwkv-5-7b', 'mamba-2-8b', 'smollm2',
  'codestral', 'codegemma', 'internlm2-7b',
  'command-r', 'pixtral-12b', 'bakllava',
  'mythomax-13b', 'wizardcoder',
]);

const variantModels: AIModel[] = coreModels
  .filter((model) => model.openSource && quantCandidateIds.has(model.id))
  .flatMap((model) =>
    QUANT_LEVELS.map((quant) => ({
      ...model,
      id: `${model.id}-${quant.toLowerCase().replace(/_/g, '-')}`,
      name: `${model.name} (${quant})`,
      description: `${quant} quantized GGUF of ${model.name}. ${quantDescriptions[quant]}`,
      formats: ['gguf'] as string[],
      isVariant: true,
      hardwareReq: estimateQuantHardware(model.params, quant),
    }))
  );

function estimateQuantHardware(params: string, quant: string): string {
  const match = params.match(/([\d.]+)\s*B/i);
  if (!match) return '4GB RAM';
  const b = parseFloat(match[1]);
  const mult = quantSizeMultipliers[quant] || 0.5;
  const gbNeeded = Math.ceil(b * mult * 1.15); // 15% overhead
  if (gbNeeded <= 2) return '2GB RAM';
  if (gbNeeded <= 4) return '4GB RAM';
  return `${gbNeeded}GB VRAM`;
}

// ═════════════════════════════════════════════════════════════════
//  EXPORT
// ═════════════════════════════════════════════════════════════════
export const allModels: AIModel[] = [...coreModels, ...variantModels];

export const modelCount = allModels.length;

// ── Utilities ────────────────────────────────────────────────────
export function getModelById(id: string): AIModel | undefined {
  return allModels.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): AIModel[] {
  return allModels.filter((m) => m.provider === provider);
}

export function getModelsByCategory(category: ModelCategory): AIModel[] {
  return allModels.filter((m) => m.category === category);
}

export function getCoreModels(): AIModel[] {
  return allModels.filter((m) => !m.isVariant);
}

export function getFreeModels(): AIModel[] {
  return allModels.filter((m) => m.freeOnOpenRouter);
}

export function getFineTunableModels(): AIModel[] {
  return allModels.filter((m) => m.fineTunable);
}

export function getOpenSourceModels(): AIModel[] {
  return allModels.filter((m) => m.openSource);
}

export const allProviders = [...new Set(allModels.map((m) => m.provider))].sort();

export const allCategories: ModelCategory[] = [
  'text-generation',
  'code',
  'image-generation',
  'vision',
  'multimodal',
  'audio',
  'video',
  'embedding',
];

// ═══════════════════════════════════════════════════════════
// LIVE OPENROUTER SYNC
// ═══════════════════════════════════════════════════════════

const OR_MODEL_MAP: Record<string, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'gpt-4': 'openai/gpt-4',
  'gpt-35-turbo': 'openai/gpt-oss-20b:free',
  'o1': 'openai/o1',
  'o1-mini': 'openai/o3-mini',
  'o3': 'openai/o3',
  'codex': 'qwen/qwen3-coder:free',
  'claude-35-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3-opus': 'anthropic/claude-opus-4',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'claude-21': 'anthropic/claude-3.5-haiku',
  'claude-instant': 'anthropic/claude-3.5-haiku',
  'gemini-20-flash': 'google/gemini-2.0-flash-001',
  'gemini-15-pro': 'google/gemini-2.5-pro',
  'gemini-15-flash': 'google/gemini-2.5-flash',
  'gemini-ultra': 'google/gemini-2.5-pro',
  'gemma-2-27b': 'google/gemma-3-27b-it:free',
  'gemma-2-9b': 'google/gemma-2-9b-it',
  'gemma-2-2b': 'google/gemma-3-4b-it:free',
  'gemma-7b': 'google/gemma-3-12b-it:free',
  'llama-31-405b': 'nousresearch/hermes-3-llama-3.1-405b:free',
  'llama-31-70b': 'meta-llama/llama-3.3-70b-instruct:free',
  'llama-31-8b': 'meta-llama/llama-3.1-8b-instruct',
  'llama-32-3b': 'meta-llama/llama-3.2-3b-instruct:free',
  'llama-32-1b': 'meta-llama/llama-3.2-1b-instruct',
  'llama-3-70b': 'meta-llama/llama-3.3-70b-instruct:free',
  'llama-3-8b': 'meta-llama/llama-3-8b-instruct',
  'llama-2-70b': 'meta-llama/llama-3.3-70b-instruct:free',
  'llama-2-13b': 'meta-llama/llama-3.2-3b-instruct:free',
  'llama-2-7b': 'meta-llama/llama-3.2-3b-instruct:free',
  'codellama-70b': 'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-34b': 'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-7b': 'qwen/qwen3-coder:free',
  'mistral-large-2': 'mistralai/mistral-large',
  'mistral-nemo': 'mistralai/mistral-nemo',
  'mixtral-8x22b': 'mistralai/mixtral-8x22b-instruct',
  'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
  'mistral-7b-v03': 'mistralai/mistral-small-3.1-24b-instruct:free',
  'mistral-small': 'mistralai/mistral-small-3.1-24b-instruct:free',
  'codestral': 'mistralai/codestral-2508',
  'phi-35-moe': 'microsoft/phi-4',
  'phi-35-mini': 'microsoft/phi-4',
  'phi-35-vision': 'microsoft/phi-4',
  'phi-3-medium': 'microsoft/phi-4',
  'phi-3-small': 'microsoft/phi-4',
  'phi-3-mini': 'microsoft/phi-4',
  'phi-2': 'microsoft/phi-4',
  'wizardlm-2': 'microsoft/wizardlm-2-8x22b',
  'grok-2': 'x-ai/grok-3',
  'grok-2-mini': 'x-ai/grok-3-mini',
  'qwen25-72b': 'qwen/qwen-2.5-72b-instruct',
  'qwen25-32b': 'qwen/qwen3-32b',
  'qwen25-14b': 'qwen/qwen3-14b',
  'qwen25-7b': 'qwen/qwen-2.5-7b-instruct',
  'qwen25-3b': 'qwen/qwen3-4b:free',
  'qwen25-1-5b': 'qwen/qwen3-4b:free',
  'qwen25-coder': 'qwen/qwen3-coder:free',
  'qwen2-vl': 'qwen/qwen-2.5-vl-7b-instruct',
  'qwq-32b-preview': 'qwen/qwq-32b',
  'deepseek-v25': 'deepseek/deepseek-chat',
  'deepseek-r1': 'deepseek/deepseek-r1',
  'deepseek-coder-v2': 'deepseek/deepseek-chat',
  'deepseek-v2': 'deepseek/deepseek-chat',
  'deepseek-llm-67b': 'deepseek/deepseek-chat',
  'deepseek-coder-33b': 'deepseek/deepseek-chat',
  'deepseek-coder-v2-lite': 'deepseek/deepseek-chat',
  'yi-large': 'qwen/qwen-2.5-72b-instruct',
  'yi-15-34b': 'qwen/qwen-2.5-72b-instruct',
  'yi-15-9b': 'qwen/qwen3-8b',
  'command-r-plus': 'cohere/command-r-plus-08-2024',
  'command-r': 'cohere/command-r-08-2024',
  'command': 'cohere/command-r7b-12-2024',
  'jamba-15-large': 'ai21/jamba-large-1.7',
  'jamba-15-mini': 'ai21/jamba-large-1.7',
  'nemotron-4-340b': 'nvidia/nemotron-3-super-120b-a12b:free',
  'llama-31-nemotron': 'nvidia/llama-3.1-nemotron-70b-instruct',
  'hermes-3-70b': 'nousresearch/hermes-3-llama-3.1-70b',
  'hermes-3-8b': 'nousresearch/hermes-2-pro-llama-3-8b',
  'dolphin-29': 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'dolphin-mixtral': 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'glm-4': 'z-ai/glm-4.5-air:free',
  'chatglm3-6b': 'z-ai/glm-4.5-air:free',
  'pplx-70b-online': 'perplexity/sonar-pro',
  'pplx-7b-online': 'perplexity/sonar',
  'inflection-25': 'inflection/inflection-3-pi',
  'reka-core': 'google/gemini-2.5-pro',
  'reka-flash': 'google/gemini-2.5-flash',
  'palmyra-x-004': 'writer/palmyra-x5',
  'marco-o1': 'qwen/qwen3-8b',
  'llava-16-34b': 'meta-llama/llama-3.2-11b-vision-instruct',
  'llava-16-13b': 'meta-llama/llama-3.2-11b-vision-instruct',
  'pixtral-12b': 'mistralai/pixtral-12b',
  'internvl2': 'qwen/qwen2.5-vl-72b-instruct',
  'molmo-72b': 'allenai/molmo-2-8b',
  'molmo-7b': 'allenai/molmo-2-8b',
  'llava-onevision-72b': 'qwen/qwen2.5-vl-72b-instruct',
};

interface ORModel {
  id: string;
  pricing?: { prompt: string; completion: string };
}

let _orModelsCache: ORModel[] = [];
let _orCacheTime = 0;

async function _fetchORModels(): Promise<ORModel[]> {
  if (_orModelsCache.length > 0 && Date.now() - _orCacheTime < 3_600_000) {
    return _orModelsCache;
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) return _orModelsCache;
    const data = await res.json() as { data: ORModel[] };
    _orModelsCache = data.data || [];
    _orCacheTime = Date.now();
    return _orModelsCache;
  } catch {
    return _orModelsCache;
  }
}

let _liveSynced: AIModel[] | null = null;

export async function getLiveModels(): Promise<AIModel[]> {
  if (_liveSynced) return _liveSynced;
  try {
    const orModels = await _fetchORModels();
    if (orModels.length === 0) return allModels;

    const freeIds = new Set(
      orModels
        .filter(m => {
          if (m.id.endsWith(':free')) return true;
          const p = parseFloat(m.pricing?.prompt || '1');
          const c = parseFloat(m.pricing?.completion || '1');
          return p === 0 && c === 0;
        })
        .map(m => m.id)
    );

    const availableIds = new Set(orModels.map(m => m.id));

    _liveSynced = allModels.map(model => {
      const orId = OR_MODEL_MAP[model.id];
      if (!orId) return model;
      return {
        ...model,
        freeOnOpenRouter: freeIds.has(orId),
        apiAvailable: availableIds.has(orId) || model.apiAvailable,
      };
    });

    return _liveSynced;
  } catch {
    return allModels;
  }
}

export function resetModelsCache(): void {
  _liveSynced = null;
  _orModelsCache = [];
  _orCacheTime = 0;
}