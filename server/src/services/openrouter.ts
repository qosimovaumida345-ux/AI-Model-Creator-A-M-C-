const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FREE MODELS — ordered by quality (best first)
// ═══════════════════════════════════════════════════════════════
const FREE_FALLBACK_CHAIN = [
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-3-12b-it:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'qwen/qwen3-4b:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-3-4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct',
  'google/gemma-3n-e4b-it:free',
  'google/gemma-3n-e2b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'stepfun/step-3.5-flash:free',
  'arcee-ai/trinity-large-preview:free',
  'arcee-ai/trinity-mini:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'minimax/minimax-m2.5:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
];

const FALLBACK_MODEL = FREE_FALLBACK_CHAIN[0];

// ═══════════════════════════════════════════════════════════════
// MODEL MAP — maps internal IDs to VERIFIED OpenRouter IDs
// Prefers free models wherever possible
// ═══════════════════════════════════════════════════════════════
const MODEL_MAP: Record<string, string> = {
  // ── OpenAI ───────────────────────────────
  'gpt-35-turbo':       'openai/gpt-oss-20b:free',
  'gpt-4o':             'openai/gpt-4o',
  'gpt-4-turbo':        'openai/gpt-4-turbo',
  'gpt-4':              'openai/gpt-4',
  'o1':                 'openai/o1',
  'o1-mini':            'openai/o3-mini',
  'o3':                 'openai/o3',
  'codex':              'qwen/qwen3-coder:free',

  // ── Anthropic ────────────────────────────
  'claude-35-sonnet':   'anthropic/claude-3.5-sonnet',
  'claude-3-opus':      'anthropic/claude-opus-4',
  'claude-3-haiku':     'anthropic/claude-3-haiku',
  'claude-21':          'anthropic/claude-3.5-haiku',
  'claude-instant':     'anthropic/claude-3.5-haiku',

  // ── Google ───────────────────────────────
  'gemini-20-flash':    'google/gemini-2.0-flash-001',
  'gemini-15-pro':      'google/gemini-2.5-pro',
  'gemini-15-flash':    'google/gemini-2.5-flash',
  'gemini-ultra':       'google/gemini-2.5-pro',
  'gemma-2-27b':        'google/gemma-3-27b-it:free',
  'gemma-2-9b':         'google/gemma-2-9b-it',
  'gemma-2-2b':         'google/gemma-3-4b-it:free',
  'gemma-7b':           'google/gemma-3-12b-it:free',
  'gemma-2b':           'google/gemma-3-4b-it:free',
  'codegemma':          'google/gemma-3-12b-it:free',
  'recurrentgemma':     'google/gemma-3-4b-it:free',
  'paligemma':          'google/gemma-3-4b-it:free',

  // ── Meta LLaMA ───────────────────────────
  'llama-31-405b':      'nousresearch/hermes-3-llama-3.1-405b:free',
  'llama-31-70b':       'meta-llama/llama-3.3-70b-instruct:free',
  'llama-31-8b':        'meta-llama/llama-3.1-8b-instruct',
  'llama-32-90b-vision':'meta-llama/llama-3.2-11b-vision-instruct',
  'llama-32-11b-vision':'meta-llama/llama-3.2-11b-vision-instruct',
  'llama-32-3b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-32-1b':        'meta-llama/llama-3.2-1b-instruct',
  'llama-3-70b':        'meta-llama/llama-3.3-70b-instruct:free',
  'llama-3-8b':         'meta-llama/llama-3-8b-instruct',
  'llama-2-70b':        'meta-llama/llama-3.3-70b-instruct:free',
  'llama-2-13b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-2-7b':         'meta-llama/llama-3.2-3b-instruct:free',
  'codellama-70b':      'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-34b':      'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-7b':       'qwen/qwen3-coder:free',
  'llama-guard-3':      'meta-llama/llama-guard-3-8b',

  // ── Mistral AI ───────────────────────────
  'mistral-large-2':    'mistralai/mistral-large',
  'mistral-nemo':       'mistralai/mistral-nemo',
  'mixtral-8x22b':      'mistralai/mixtral-8x22b-instruct',
  'mixtral-8x7b':       'mistralai/mixtral-8x7b-instruct',
  'mistral-7b-v03':     'mistralai/mistral-small-3.1-24b-instruct:free',
  'mistral-small':      'mistralai/mistral-small-3.1-24b-instruct:free',
  'codestral':          'mistralai/codestral-2508',
  'mistral-embed':      'mistralai/mistral-nemo',
  'pixtral-12b':        'mistralai/pixtral-12b',

  // ── Microsoft ────────────────────────────
  'phi-35-moe':         'microsoft/phi-4',
  'phi-35-mini':        'microsoft/phi-4',
  'phi-35-vision':      'microsoft/phi-4',
  'phi-3-medium':       'microsoft/phi-4',
  'phi-3-small':        'microsoft/phi-4',
  'phi-3-mini':         'microsoft/phi-4',
  'phi-2':              'microsoft/phi-4',
  'wizardlm-2':         'microsoft/wizardlm-2-8x22b',
  'orca-2':             'microsoft/phi-4',
  'biogpt':             'microsoft/phi-4',

  // ── xAI (Grok) ──────────────────────────
  'grok-2':             'x-ai/grok-3',
  'grok-2-mini':        'x-ai/grok-3-mini',
  'grok-15v':           'x-ai/grok-3',
  'grok-1':             'x-ai/grok-3',

  // ── Qwen / Alibaba ──────────────────────
  'qwen25-72b':         'qwen/qwen-2.5-72b-instruct',
  'qwen25-32b':         'qwen/qwen3-32b',
  'qwen25-14b':         'qwen/qwen3-14b',
  'qwen25-7b':          'qwen/qwen-2.5-7b-instruct',
  'qwen25-3b':          'qwen/qwen3-4b:free',
  'qwen25-1-5b':        'qwen/qwen3-4b:free',
  'qwen25-coder':       'qwen/qwen3-coder:free',
  'qwen2-vl':           'qwen/qwen-2.5-vl-7b-instruct',
  'qwen-audio':         'qwen/qwen-2.5-7b-instruct',
  'qwen25-math-72b':    'qwen/qwen-2.5-72b-instruct',
  'qwq-32b-preview':    'qwen/qwq-32b',
  'codeqwen-7b':        'qwen/qwen3-coder:free',
  'marco-o1':           'qwen/qwen3-8b',

  // ── DeepSeek ─────────────────────────────
  'deepseek-v25':       'deepseek/deepseek-chat',
  'deepseek-r1':        'deepseek/deepseek-r1',
  'deepseek-coder-v2':  'deepseek/deepseek-chat',
  'deepseek-v2':        'deepseek/deepseek-chat',
  'deepseek-llm-67b':   'deepseek/deepseek-chat',
  'deepseek-coder-33b': 'deepseek/deepseek-chat',
  'deepseek-coder-v2-lite': 'deepseek/deepseek-chat',

  // ── 01.AI / Yi ───────────────────────────
  'yi-large':           'qwen/qwen-2.5-72b-instruct',
  'yi-15-34b':          'qwen/qwen-2.5-72b-instruct',
  'yi-15-9b':           'qwen/qwen3-8b',
  'yi-15-6b':           'qwen/qwen3-8b',
  'yi-vision':          'qwen/qwen-2.5-vl-7b-instruct',
  'yi-coder-9b':        'qwen/qwen3-coder:free',
  'yi-coder-1-5b':      'qwen/qwen3-4b:free',

  // ── Cohere ───────────────────────────────
  'command-r-plus':     'cohere/command-r-plus-08-2024',
  'command-r':          'cohere/command-r-08-2024',
  'command':            'cohere/command-r7b-12-2024',
  'embed-v3':           'cohere/command-r7b-12-2024',
  'rerank-3':           'cohere/command-r7b-12-2024',

  // ── AI21 Labs ────────────────────────────
  'jamba-15-large':     'ai21/jamba-large-1.7',
  'jamba-15-mini':      'ai21/jamba-large-1.7',
  'jurassic-2':         'ai21/jamba-large-1.7',

  // ── TII / Falcon ─────────────────────────
  'falcon-180b':        'meta-llama/llama-3.3-70b-instruct:free',
  'falcon-40b':         'meta-llama/llama-3.3-70b-instruct:free',
  'falcon-7b':          'mistralai/mistral-small-3.1-24b-instruct:free',
  'falcon-2-11b':       'mistralai/mistral-small-3.1-24b-instruct:free',

  // ── NVIDIA ───────────────────────────────
  'nemotron-4-340b':    'nvidia/nemotron-3-super-120b-a12b:free',
  'llama-31-nemotron':  'nvidia/llama-3.1-nemotron-70b-instruct',
  'mistral-nemo-minitron': 'nvidia/nemotron-nano-9b-v2:free',
  'nvlm-d-72b':         'nvidia/nemotron-3-super-120b-a12b:free',
  'nemotron-mini-4b':   'nvidia/nemotron-nano-9b-v2:free',

  // ── NousResearch ─────────────────────────
  'hermes-3-70b':       'nousresearch/hermes-3-llama-3.1-70b',
  'hermes-3-8b':        'nousresearch/hermes-2-pro-llama-3-8b',
  'nous-capybara':      'nousresearch/hermes-3-llama-3.1-70b',

  // ── Cognitive Computations ───────────────
  'dolphin-29':         'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'dolphin-mixtral':    'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',

  // ── HuggingFace / BigCode ────────────────
  'zephyr-7b':          'mistralai/mistral-small-3.1-24b-instruct:free',
  'zephyr-141b':        'mistralai/mixtral-8x22b-instruct',
  'smollm2':            'meta-llama/llama-3.2-1b-instruct',
  'idefics3':           'meta-llama/llama-3.2-11b-vision-instruct',
  'smolvlm':            'meta-llama/llama-3.2-11b-vision-instruct',
  'starcoder2-15b':     'qwen/qwen3-coder:free',
  'starcoder2-7b':      'qwen/qwen3-coder:free',
  'starcoder2-3b':      'qwen/qwen3-4b:free',
  'starcoder':          'qwen/qwen3-coder:free',
  'wizardcoder':        'qwen/qwen3-coder:free',

  // ── Community Fine-tunes ─────────────────
  'openchat-35':        'mistralai/mistral-small-3.1-24b-instruct:free',
  'openchat-36':        'mistralai/mistral-small-3.1-24b-instruct:free',
  'openhermes-25':      'mistralai/mistral-small-3.1-24b-instruct:free',
  'mythomax-13b':       'gryphe/mythomax-l2-13b',
  'neural-chat-7b':     'mistralai/mistral-small-3.1-24b-instruct:free',
  'solar-10-7b':        'mistralai/mistral-small-3.1-24b-instruct:free',
  'vicuna-13b':         'mistralai/mistral-small-3.1-24b-instruct:free',
  'vicuna-7b':          'mistralai/mistral-small-3.1-24b-instruct:free',
  'airoboros-70b':      'meta-llama/llama-3.3-70b-instruct:free',
  'tinyllama':          'qwen/qwen3-4b:free',
  'decilm-7b':          'mistralai/mistral-small-3.1-24b-instruct:free',
  'persimmon-8b':       'mistralai/mistral-small-3.1-24b-instruct:free',
  'redpajama-7b':       'mistralai/mistral-small-3.1-24b-instruct:free',
  'metamath-7b':        'qwen/qwen3-8b',
  'llemma-34b':         'meta-llama/llama-3.3-70b-instruct:free',
  'wizardmath-70b':     'meta-llama/llama-3.3-70b-instruct:free',
  'dolly-v2':           'mistralai/mistral-small-3.1-24b-instruct:free',

  // ── Databricks / Mosaic ──────────────────
  'dbrx':               'meta-llama/llama-3.3-70b-instruct:free',
  'mpt-30b':            'meta-llama/llama-3.3-70b-instruct:free',
  'mpt-7b':             'mistralai/mistral-small-3.1-24b-instruct:free',

  // ── Perplexity ───────────────────────────
  'pplx-70b-online':    'perplexity/sonar-pro',
  'pplx-7b-online':     'perplexity/sonar',

  // ── Zhipu / ChatGLM ─────────────────────
  'glm-4':              'z-ai/glm-4.5-air:free',
  'chatglm3-6b':        'z-ai/glm-4.5-air:free',

  // ── InternLM ─────────────────────────────
  'internlm2-20b':      'qwen/qwen-2.5-72b-instruct',
  'internlm2-7b':       'qwen/qwen-2.5-7b-instruct',
  'internlm2-1-8b':     'qwen/qwen3-4b:free',

  // ── Baichuan ─────────────────────────────
  'baichuan2-13b':      'qwen/qwen-2.5-7b-instruct',
  'baichuan2-7b':       'qwen/qwen3-8b',

  // ── MiniCPM / Tencent ────────────────────
  'minicpm-v-26':       'qwen/qwen-2.5-vl-7b-instruct',
  'minicpm-2b':         'qwen/qwen3-4b:free',
  'hunyuan-large':      'tencent/hunyuan-a13b-instruct',

  // ── EleutherAI ───────────────────────────
  'gpt-neox-20b':       'mistralai/mistral-small-3.1-24b-instruct:free',
  'gpt-j-6b':           'mistralai/mistral-small-3.1-24b-instruct:free',
  'pythia-12b':         'mistralai/mistral-small-3.1-24b-instruct:free',
  'pythia-6-9b':        'mistralai/mistral-small-3.1-24b-instruct:free',
  'pythia-2-8b':        'meta-llama/llama-3.2-3b-instruct:free',

  // ── Vision Models ───────────────────────
  'llava-16-34b':       'meta-llama/llama-3.2-11b-vision-instruct',
  'llava-16-13b':       'meta-llama/llama-3.2-11b-vision-instruct',
  'bakllava':           'meta-llama/llama-3.2-11b-vision-instruct',
  'cogvlm2':            'qwen/qwen-2.5-vl-7b-instruct',
  'internvl2':          'qwen/qwen2.5-vl-72b-instruct',
  'molmo-72b':          'allenai/molmo-2-8b',
  'molmo-7b':           'allenai/molmo-2-8b',
  'mplug-owl3':         'qwen/qwen-2.5-vl-7b-instruct',
  'moondream-2':        'meta-llama/llama-3.2-11b-vision-instruct',
  'florence-2':         'meta-llama/llama-3.2-11b-vision-instruct',
  'fuyu-8b':            'meta-llama/llama-3.2-11b-vision-instruct',
  'cogagent':           'qwen/qwen-2.5-vl-7b-instruct',
  'llava-onevision-72b':'qwen/qwen2.5-vl-72b-instruct',

  // ── Alternative Architectures ────────────
  'rwkv-5-14b':         'mistralai/mistral-small-3.1-24b-instruct:free',
  'rwkv-5-7b':          'mistralai/mistral-small-3.1-24b-instruct:free',
  'mamba-2-8b':         'meta-llama/llama-3.2-3b-instruct:free',
  'striped-hyena-7b':   'mistralai/mistral-small-3.1-24b-instruct:free',
  'bloom-176b':         'meta-llama/llama-3.3-70b-instruct:free',

  // ── Allen AI ─────────────────────────────
  'olmo-7b':            'allenai/olmo-3-7b-instruct',
  'olmo-1-7b':          'allenai/olmo-3-7b-instruct',
  'tulu-2':             'meta-llama/llama-3.3-70b-instruct:free',

  // ── Code fallbacks ──────────────────────
  'phind-codellama':    'qwen/qwen3-coder:free',
  'magicoder':          'qwen/qwen3-coder:free',
  'opencoder':          'qwen/qwen3-coder:free',
  'refact-1-6b':        'qwen/qwen3-4b:free',
  'granite-code-34b':   'qwen/qwen3-coder:free',
  'granite-code-8b':    'qwen/qwen3-coder:free',

  // ── Misc ─────────────────────────────────
  'snowflake-arctic':   'qwen/qwen-2.5-72b-instruct',
  'skywork-o1-8b':      'qwen/qwen3-8b',
  'stablelm-2':         'qwen/qwen3-4b:free',
  'inflection-25':      'inflection/inflection-3-pi',
  'reka-core':          'google/gemini-2.5-pro',
  'reka-flash':         'google/gemini-2.5-flash',
  'reka-edge':          'google/gemini-2.0-flash-001',
  'palmyra-x-004':      'writer/palmyra-x5',
  'samsung-gauss-2':    'microsoft/phi-4',
  'openelm-3b':         'meta-llama/llama-3.2-3b-instruct:free',
  'openelm-1-1b':       'meta-llama/llama-3.2-1b-instruct',
  'xgen-7b':            'mistralai/mistral-small-3.1-24b-instruct:free',
  'codet5-plus':        'qwen/qwen3-coder:free',
};

const FREE_MODEL_IDS = new Set(
  Object.values(MODEL_MAP).filter((id) => id.endsWith(':free'))
);

function stripQuantSuffix(id: string): string {
  return id
    .replace(/-q\d[_-]k[_-][msla]$/, '')
    .replace(/-q\d[-_]\d$/, '');
}

export function resolveOpenRouterModel(internalId: string): string | null {
  if (MODEL_MAP[internalId]) return MODEL_MAP[internalId];
  const baseId = stripQuantSuffix(internalId);
  if (MODEL_MAP[baseId]) return MODEL_MAP[baseId];
  return null;
}

export function isModelFree(internalId: string): boolean {
  const resolved = resolveOpenRouterModel(internalId);
  return resolved ? FREE_MODEL_IDS.has(resolved) : false;
}

function getHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://ai-model-creator-a-m-c.onrender.com',
    'X-Title': 'AI Model Creator',
  };
}

function findFreeFallback(failedModel: string): string {
  for (const free of FREE_FALLBACK_CHAIN) {
    if (free !== failedModel) return free;
  }
  return FALLBACK_MODEL;
}

export async function streamChatCompletion(
  apiKey: string,
  request: ChatRequest,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const resolvedModel = resolveOpenRouterModel(request.model) || request.model;
  const model = resolvedModel.includes('/') ? resolvedModel : FALLBACK_MODEL;

  const body = {
    model,
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    top_p: request.top_p ?? 0.9,
    max_tokens: request.max_tokens ?? 2048,
    frequency_penalty: request.frequency_penalty ?? 0,
    presence_penalty: request.presence_penalty ?? 0,
    stop: request.stop,
    stream: true,
  };

  let response: Response;
  try {
    response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(body),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return;
  }

  if (!response.ok) {
    const errBody = await response.text();
    let msg = `OpenRouter API error ${response.status}`;
    try {
      const parsed = JSON.parse(errBody);
      msg = parsed.error?.message || parsed.message || msg;
    } catch {}

    const isCreditsError = msg.toLowerCase().includes('insufficient credits') ||
                           msg.toLowerCase().includes('credit') ||
                           msg.toLowerCase().includes('payment') ||
                           msg.toLowerCase().includes('billing');

    const isModelError = msg.toLowerCase().includes('not a valid model') ||
                         msg.toLowerCase().includes('no endpoints');

    if ((isCreditsError || isModelError) && model !== FALLBACK_MODEL) {
      const fallback = findFreeFallback(model);
      return streamChatCompletion(
        apiKey,
        { ...request, model: fallback },
        onChunk,
        onDone,
        onError,
        signal
      );
    }

    onError(msg);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('No response stream available');
    return;
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
          if (json.usage) {
            onDone(fullText, json.usage);
            return;
          }
        } catch {}
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Stream error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return;
  }

  onDone(fullText);
}

export async function chatCompletion(
  apiKey: string,
  request: ChatRequest
): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const resolvedModel = resolveOpenRouterModel(request.model) || request.model;
  const model = resolvedModel.includes('/') ? resolvedModel : FALLBACK_MODEL;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      ...request,
      model,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    const isCreditsOrModel = errText.toLowerCase().includes('credit') ||
                             errText.toLowerCase().includes('not a valid') ||
                             errText.toLowerCase().includes('no endpoints');

    if (isCreditsOrModel && model !== FALLBACK_MODEL) {
      const fallback = findFreeFallback(model);
      return chatCompletion(apiKey, { ...request, model: fallback });
    }

    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}