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
// MODEL MAP — every value is a VERIFIED OpenRouter model ID
// ═══════════════════════════════════════════════════════════════
const MODEL_MAP: Record<string, string> = {
  // ── OpenAI ───────────────────────────────
  'gpt-35-turbo':       'openai/gpt-3.5-turbo',
  'gpt-4o':             'openai/gpt-4o',
  'gpt-4-turbo':        'openai/gpt-4-turbo',
  'gpt-4':              'openai/gpt-4',
  'o1':                 'openai/o1',
  'o1-mini':            'openai/o3-mini',
  'o3':                 'openai/o3',
  'codex':              'openai/gpt-4o-mini',

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
  'gemma-2-27b':        'google/gemma-2-27b-it',
  'gemma-2-9b':         'google/gemma-2-9b-it',
  'gemma-2-2b':         'google/gemma-3-4b-it:free',
  'gemma-7b':           'google/gemma-3-12b-it:free',
  'gemma-2b':           'google/gemma-3-4b-it:free',
  'codegemma':          'google/gemma-3-12b-it:free',
  'recurrentgemma':     'google/gemma-3-4b-it:free',
  'paligemma':          'google/gemma-3-4b-it:free',

  // ── Meta LLaMA ───────────────────────────
  'llama-31-405b':      'meta-llama/llama-3.1-405b',
  'llama-31-70b':       'meta-llama/llama-3.1-70b-instruct',
  'llama-31-8b':        'meta-llama/llama-3.1-8b-instruct',
  'llama-32-90b-vision':'meta-llama/llama-3.2-11b-vision-instruct',
  'llama-32-11b-vision':'meta-llama/llama-3.2-11b-vision-instruct',
  'llama-32-3b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-32-1b':        'meta-llama/llama-3.2-1b-instruct',
  'llama-3-70b':        'meta-llama/llama-3-70b-instruct',
  'llama-3-8b':         'meta-llama/llama-3-8b-instruct',
  'llama-2-70b':        'meta-llama/llama-3.3-70b-instruct:free',
  'llama-2-13b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-2-7b':         'meta-llama/llama-3.2-3b-instruct:free',
  'codellama-70b':      'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-34b':      'meta-llama/llama-3.3-70b-instruct:free',
  'codellama-7b':       'meta-llama/llama-3.1-8b-instruct',
  'llama-guard-3':      'meta-llama/llama-guard-3-8b',

  // ── Mistral AI ───────────────────────────
  'mistral-large-2':    'mistralai/mistral-large',
  'mistral-nemo':       'mistralai/mistral-nemo',
  'mixtral-8x22b':      'mistralai/mixtral-8x22b-instruct',
  'mixtral-8x7b':       'mistralai/mixtral-8x7b-instruct',
  'mistral-7b-v03':     'mistralai/mistral-7b-instruct-v0.1',
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
  'qwen25-coder':       'qwen/qwen-2.5-coder-32b-instruct',
  'qwen2-vl':           'qwen/qwen-2.5-vl-7b-instruct',
  'qwen-audio':         'qwen/qwen-2.5-7b-instruct',
  'qwen25-math-72b':    'qwen/qwen-2.5-72b-instruct',
  'qwq-32b-preview':    'qwen/qwq-32b',
  'codeqwen-7b':        'qwen/qwen2.5-coder-7b-instruct',
  'marco-o1':           'qwen/qwen3-8b',

  // ── DeepSeek ─────────────────────────────
  'deepseek-v25':       'deepseek/deepseek-chat',
  'deepseek-r1':        'deepseek/deepseek-r1',
  'deepseek-coder-v2':  'deepseek/deepseek-chat',
  'deepseek-v2':        'deepseek/deepseek-chat',
  'deepseek-llm-67b':   'deepseek/deepseek-chat',
  'deepseek-coder-33b': 'deepseek/deepseek-chat',
  'deepseek-coder-v2-lite': 'deepseek/deepseek-chat',

  // ── 01.AI / Yi → mapped to Qwen (Yi not on OpenRouter) ──
  'yi-large':           'qwen/qwen-2.5-72b-instruct',
  'yi-15-34b':          'qwen/qwen-2.5-72b-instruct',
  'yi-15-9b':           'qwen/qwen3-8b',
  'yi-15-6b':           'qwen/qwen3-8b',
  'yi-vision':          'qwen/qwen-2.5-vl-7b-instruct',
  'yi-coder-9b':        'qwen/qwen2.5-coder-7b-instruct',
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

  // ── TII / Falcon → mapped to Meta (Falcon not on OpenRouter) ──
  'falcon-180b':        'meta-llama/llama-3.3-70b-instruct:free',
  'falcon-40b':         'meta-llama/llama-3.3-70b-instruct:free',
  'falcon-7b':          'meta-llama/llama-3.1-8b-instruct',
  'falcon-2-11b':       'meta-llama/llama-3.1-8b-instruct',

  // ── NVIDIA ───────────────────────────────
  'nemotron-4-340b':    'nvidia/llama-3.1-nemotron-70b-instruct',
  'llama-31-nemotron':  'nvidia/llama-3.1-nemotron-70b-instruct',
  'mistral-nemo-minitron': 'nvidia/nemotron-nano-9b-v2:free',
  'nvlm-d-72b':         'nvidia/llama-3.1-nemotron-70b-instruct',
  'nemotron-mini-4b':   'nvidia/nemotron-nano-9b-v2:free',

  // ── NousResearch ─────────────────────────
  'hermes-3-70b':       'nousresearch/hermes-3-llama-3.1-70b',
  'hermes-3-8b':        'nousresearch/hermes-2-pro-llama-3-8b',
  'nous-capybara':      'nousresearch/hermes-3-llama-3.1-70b',

  // ── Cognitive Computations ───────────────
  'dolphin-29':         'meta-llama/llama-3.3-70b-instruct:free',
  'dolphin-mixtral':    'mistralai/mixtral-8x7b-instruct',

  // ── HuggingFace / BigCode ────────────────
  'zephyr-7b':          'mistralai/mistral-7b-instruct-v0.1',
  'zephyr-141b':        'mistralai/mixtral-8x22b-instruct',
  'smollm2':            'meta-llama/llama-3.2-1b-instruct',
  'idefics3':           'meta-llama/llama-3.2-11b-vision-instruct',
  'smolvlm':            'meta-llama/llama-3.2-11b-vision-instruct',
  'starcoder2-15b':     'qwen/qwen-2.5-coder-32b-instruct',
  'starcoder2-7b':      'qwen/qwen2.5-coder-7b-instruct',
  'starcoder2-3b':      'qwen/qwen3-4b:free',
  'starcoder':          'qwen/qwen-2.5-coder-32b-instruct',
  'wizardcoder':        'qwen/qwen-2.5-coder-32b-instruct',

  // ── Community Fine-tunes ─────────────────
  'openchat-35':        'meta-llama/llama-3.1-8b-instruct',
  'openchat-36':        'meta-llama/llama-3.1-8b-instruct',
  'openhermes-25':      'meta-llama/llama-3.1-8b-instruct',
  'mythomax-13b':       'gryphe/mythomax-l2-13b',
  'neural-chat-7b':     'meta-llama/llama-3.1-8b-instruct',
  'solar-10-7b':        'meta-llama/llama-3.1-8b-instruct',
  'vicuna-13b':         'meta-llama/llama-3.1-8b-instruct',
  'vicuna-7b':          'meta-llama/llama-3.1-8b-instruct',
  'airoboros-70b':      'meta-llama/llama-3.3-70b-instruct:free',
  'tinyllama':          'meta-llama/llama-3.2-1b-instruct',
  'decilm-7b':          'meta-llama/llama-3.1-8b-instruct',
  'persimmon-8b':       'meta-llama/llama-3.1-8b-instruct',
  'redpajama-7b':       'meta-llama/llama-3.1-8b-instruct',
  'metamath-7b':        'meta-llama/llama-3.1-8b-instruct',
  'llemma-34b':         'meta-llama/llama-3.3-70b-instruct:free',
  'wizardmath-70b':     'meta-llama/llama-3.3-70b-instruct:free',
  'dolly-v2':           'meta-llama/llama-3.1-8b-instruct',

  // ── Databricks / Mosaic ──────────────────
  'dbrx':               'meta-llama/llama-3.3-70b-instruct:free',
  'mpt-30b':            'meta-llama/llama-3.3-70b-instruct:free',
  'mpt-7b':             'meta-llama/llama-3.1-8b-instruct',

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
  'gpt-neox-20b':       'meta-llama/llama-3.1-8b-instruct',
  'gpt-j-6b':           'meta-llama/llama-3.1-8b-instruct',
  'pythia-12b':         'meta-llama/llama-3.1-8b-instruct',
  'pythia-6-9b':        'meta-llama/llama-3.1-8b-instruct',
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
  'rwkv-5-14b':         'meta-llama/llama-3.1-8b-instruct',
  'rwkv-5-7b':          'meta-llama/llama-3.1-8b-instruct',
  'mamba-2-8b':         'meta-llama/llama-3.2-3b-instruct:free',
  'striped-hyena-7b':   'meta-llama/llama-3.1-8b-instruct',
  'bloom-176b':         'meta-llama/llama-3.3-70b-instruct:free',

  // ── Allen AI ─────────────────────────────
  'olmo-7b':            'allenai/olmo-3-7b-instruct',
  'olmo-1-7b':          'allenai/olmo-3-7b-instruct',
  'tulu-2':             'meta-llama/llama-3.3-70b-instruct:free',

  // ── Code fallbacks ──────────────────────
  'phind-codellama':    'qwen/qwen-2.5-coder-32b-instruct',
  'magicoder':          'qwen/qwen2.5-coder-7b-instruct',
  'opencoder':          'qwen/qwen2.5-coder-7b-instruct',
  'refact-1-6b':        'qwen/qwen3-4b:free',
  'granite-code-34b':   'qwen/qwen-2.5-coder-32b-instruct',
  'granite-code-8b':    'qwen/qwen2.5-coder-7b-instruct',

  // ── Misc ─────────────────────────────────
  'snowflake-arctic':   'qwen/qwen-2.5-72b-instruct',
  'skywork-o1-8b':      'qwen/qwen3-8b',
  'stablelm-2':         'meta-llama/llama-3.2-1b-instruct',
  'inflection-25':      'inflection/inflection-3-pi',
  'reka-core':          'google/gemini-2.5-pro',
  'reka-flash':         'google/gemini-2.5-flash',
  'reka-edge':          'google/gemini-2.0-flash-001',
  'palmyra-x-004':      'writer/palmyra-x5',
  'samsung-gauss-2':    'microsoft/phi-4',
  'openelm-3b':         'meta-llama/llama-3.2-3b-instruct:free',
  'openelm-1-1b':       'meta-llama/llama-3.2-1b-instruct',
  'xgen-7b':            'meta-llama/llama-3.1-8b-instruct',
  'codet5-plus':        'qwen/qwen2.5-coder-7b-instruct',
};

// Safe fallback model (verified free on OpenRouter)
const FALLBACK_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

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

const FREE_MODEL_IDS = new Set(
  Object.values(MODEL_MAP).filter((id) => id.endsWith(':free'))
);

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

export async function streamChatCompletion(
  apiKey: string,
  request: ChatRequest,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const resolvedModel = resolveOpenRouterModel(request.model) || request.model;

  // If we couldn't resolve and it doesn't look like an OpenRouter ID, use fallback
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

    // If model not found, retry with fallback
    if (response.status === 400 && msg.includes('not a valid model') && model !== FALLBACK_MODEL) {
      return streamChatCompletion(
        apiKey,
        { ...request, model: FALLBACK_MODEL },
        onChunk,
        onDone,
        (fallbackErr) => onError(`Original model failed: ${msg}. Fallback also failed: ${fallbackErr}`),
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
    // If model not found, retry with fallback
    if (response.status === 400 && model !== FALLBACK_MODEL) {
      return chatCompletion(apiKey, { ...request, model: FALLBACK_MODEL });
    }
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}