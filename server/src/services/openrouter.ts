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

// Map internal IDs to OpenRouter IDs
// Using base IDs without :free to avoid "not valid" errors
// The API key handles billing automatically
const MODEL_MAP: Record<string, string> = {
  // ── OpenAI ───────────────────────────────
  'gpt-35-turbo':       'openai/gpt-3.5-turbo',
  'gpt-4o':             'openai/gpt-4o',
  'gpt-4-turbo':        'openai/gpt-4-turbo',
  'gpt-4':              'openai/gpt-4',
  'o1':                 'openai/o1',
  'o1-mini':            'openai/o1-mini',
  'o3':                 'openai/o3-mini',

  // ── Anthropic ────────────────────────────
  'claude-35-sonnet':   'anthropic/claude-3.5-sonnet',
  'claude-3-opus':      'anthropic/claude-3-opus',
  'claude-3-haiku':     'anthropic/claude-3-haiku',
  'claude-21':          'anthropic/claude-2.1',
  'claude-instant':     'anthropic/claude-instant-1.1',

  // ── Google ───────────────────────────────
  'gemini-20-flash':    'google/gemini-2.0-flash-exp:free',
  'gemini-15-pro':      'google/gemini-pro-1.5',
  'gemini-15-flash':    'google/gemini-flash-1.5',
  'gemini-ultra':       'google/gemini-pro',
  'gemma-2-27b':        'google/gemma-2-27b-it',
  'gemma-2-9b':         'google/gemma-2-9b-it:free',
  'gemma-2-2b':         'google/gemma-2-9b-it:free',
  'gemma-7b':           'google/gemma-2-9b-it:free',
  'gemma-2b':           'google/gemma-2-9b-it:free',
  'codegemma':          'google/gemma-2-9b-it:free',
  'paligemma':          'google/gemma-2-9b-it:free',

  // ── Meta LLaMA ───────────────────────────
  'llama-31-405b':      'meta-llama/llama-3.1-405b-instruct',
  'llama-31-70b':       'meta-llama/llama-3.1-70b-instruct:free',
  'llama-31-8b':        'meta-llama/llama-3.1-8b-instruct:free',
  'llama-32-90b-vision':'meta-llama/llama-3.2-90b-vision-instruct',
  'llama-32-11b-vision':'meta-llama/llama-3.2-11b-vision-instruct:free',
  'llama-32-3b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-32-1b':        'meta-llama/llama-3.2-1b-instruct:free',
  'llama-3-70b':        'meta-llama/llama-3-70b-instruct',
  'llama-3-8b':         'meta-llama/llama-3-8b-instruct:free',
  'llama-2-70b':        'meta-llama/llama-3.1-70b-instruct:free',
  'llama-2-13b':        'meta-llama/llama-3.1-8b-instruct:free',
  'llama-2-7b':         'meta-llama/llama-3.1-8b-instruct:free',
  'codellama-70b':      'meta-llama/llama-3.1-70b-instruct:free',
  'codellama-34b':      'meta-llama/llama-3.1-70b-instruct:free',
  'codellama-7b':       'meta-llama/llama-3.1-8b-instruct:free',
  'llama-guard-3':      'meta-llama/llama-3.1-8b-instruct:free',

  // ── Mistral AI ───────────────────────────
  'mistral-large-2':    'mistralai/mistral-large',
  'mistral-nemo':       'mistralai/mistral-nemo',
  'mixtral-8x22b':      'mistralai/mixtral-8x22b-instruct',
  'mixtral-8x7b':       'mistralai/mixtral-8x7b-instruct',
  'mistral-7b-v03':     'mistralai/mistral-7b-instruct:free',
  'mistral-small':      'mistralai/mistral-small',
  'codestral':          'mistralai/codestral-mamba',
  'pixtral-12b':        'mistralai/pixtral-12b-2409',

  // ── Microsoft ────────────────────────────
  'phi-35-moe':         'microsoft/phi-3.5-mini-128k-instruct:free',
  'phi-35-mini':        'microsoft/phi-3.5-mini-128k-instruct:free',
  'phi-35-vision':      'microsoft/phi-3.5-mini-128k-instruct:free',
  'phi-3-medium':       'microsoft/phi-3-medium-128k-instruct:free',
  'phi-3-small':        'microsoft/phi-3-mini-128k-instruct:free',
  'phi-3-mini':         'microsoft/phi-3-mini-128k-instruct:free',
  'phi-2':              'microsoft/phi-3-mini-128k-instruct:free',
  'wizardlm-2':         'microsoft/wizardlm-2-8x22b',
  'orca-2':             'microsoft/phi-3-mini-128k-instruct:free',

  // ── xAI ──────────────────────────────────
  'grok-2':             'x-ai/grok-2-1212',
  'grok-2-mini':        'x-ai/grok-2-vision-1212',
  'grok-1':             'x-ai/grok-2-1212',

  // ── Alibaba / Qwen ──────────────────────
  'qwen25-72b':         'qwen/qwen-2.5-72b-instruct:free',
  'qwen25-32b':         'qwen/qwen-2.5-32b-instruct',
  'qwen25-14b':         'qwen/qwen-2.5-14b-instruct',
  'qwen25-7b':          'qwen/qwen-2.5-7b-instruct:free',
  'qwen25-3b':          'qwen/qwen-2.5-7b-instruct:free',
  'qwen25-1-5b':        'qwen/qwen-2.5-7b-instruct:free',
  'qwen25-coder':       'qwen/qwen-2.5-coder-32b-instruct:free',
  'qwen2-vl':           'qwen/qwen-2-vl-7b-instruct:free',
  'qwen25-math-72b':    'qwen/qwen-2.5-72b-instruct:free',
  'qwq-32b-preview':    'qwen/qwq-32b-preview',
  'codeqwen-7b':        'qwen/qwen-2.5-coder-32b-instruct:free',
  'marco-o1':           'qwen/qwen-2.5-7b-instruct:free',

  // ── DeepSeek ─────────────────────────────
  'deepseek-v25':       'deepseek/deepseek-chat',
  'deepseek-r1':        'deepseek/deepseek-r1:free',
  'deepseek-coder-v2':  'deepseek/deepseek-coder',
  'deepseek-v2':        'deepseek/deepseek-chat',
  'deepseek-llm-67b':   'deepseek/deepseek-chat',
  'deepseek-coder-33b': 'deepseek/deepseek-coder',
  'deepseek-coder-v2-lite': 'deepseek/deepseek-coder',

  // ── 01.AI / Yi ───────────────────────────
  'yi-large':           '01-ai/yi-large',
  'yi-15-34b':          '01-ai/yi-34b-chat',
  'yi-15-9b':           '01-ai/yi-34b-chat',
  'yi-15-6b':           '01-ai/yi-34b-chat',
  'yi-coder-9b':        '01-ai/yi-34b-chat',

  // ── Cohere ───────────────────────────────
  'command-r-plus':     'cohere/command-r-plus',
  'command-r':          'cohere/command-r',
  'command':            'cohere/command-r',

  // ── AI21 Labs ────────────────────────────
  'jamba-15-large':     'ai21/jamba-1-5-large',
  'jamba-15-mini':      'ai21/jamba-1-5-mini',

  // ── Others ───────────────────────────────
  'llama-31-nemotron':  'nvidia/llama-3.1-nemotron-70b-instruct:free',
  'mistral-nemo-minitron': 'meta-llama/llama-3.1-8b-instruct:free',
  'nemotron-mini-4b':   'meta-llama/llama-3.1-8b-instruct:free',
  'hermes-3-70b':       'nousresearch/hermes-3-llama-3.1-70b',
  'hermes-3-8b':        'nousresearch/hermes-3-llama-3.1-8b',
  'nous-capybara':      'meta-llama/llama-3.1-70b-instruct:free',
  'dolphin-29':         'meta-llama/llama-3.1-70b-instruct:free',
  'dolphin-mixtral':    'mistralai/mixtral-8x7b-instruct',
  'zephyr-7b':          'huggingfaceh4/zephyr-7b-beta:free',
  'zephyr-141b':        'meta-llama/llama-3.1-70b-instruct:free',
  'openchat-35':        'openchat/openchat-7b:free',
  'openchat-36':        'openchat/openchat-7b:free',
  'openhermes-25':      'teknium/openhermes-2.5-mistral-7b',
  'mythomax-13b':       'gryphe/mythomax-l2-13b:free',
  'neural-chat-7b':     'meta-llama/llama-3.1-8b-instruct:free',
  'solar-10-7b':        'meta-llama/llama-3.1-8b-instruct:free',
  'vicuna-13b':         'meta-llama/llama-3.1-8b-instruct:free',
  'vicuna-7b':          'meta-llama/llama-3.1-8b-instruct:free',
  'tinyllama':          'meta-llama/llama-3.2-1b-instruct:free',
  'airoboros-70b':      'meta-llama/llama-3.1-70b-instruct:free',
  'dbrx':               'meta-llama/llama-3.1-70b-instruct:free',
  'mpt-30b':            'meta-llama/llama-3.1-8b-instruct:free',
  'pplx-70b-online':    'perplexity/llama-3.1-sonar-huge-128k-online',
  'pplx-7b-online':     'perplexity/llama-3.1-sonar-small-128k-online',
  'starcoder2-15b':     'deepseek/deepseek-coder',
  'starcoder2-7b':      'deepseek/deepseek-coder',
  'starcoder2-3b':      'deepseek/deepseek-coder',
  'starcoder':          'deepseek/deepseek-coder',
  'wizardcoder':        'deepseek/deepseek-coder',
  'falcon-180b':        'meta-llama/llama-3.1-70b-instruct:free',
  'falcon-40b':         'meta-llama/llama-3.1-8b-instruct:free',
  'falcon-7b':          'meta-llama/llama-3.1-8b-instruct:free',
  'falcon-2-11b':       'meta-llama/llama-3.1-8b-instruct:free',
  'internlm2-20b':      'qwen/qwen-2.5-72b-instruct:free',
  'internlm2-7b':       'qwen/qwen-2.5-7b-instruct:free',
  'internlm2-1-8b':     'qwen/qwen-2.5-7b-instruct:free',
  'glm-4':              'qwen/qwen-2.5-72b-instruct:free',
  'chatglm3-6b':        'qwen/qwen-2.5-7b-instruct:free',
  'baichuan2-13b':      'qwen/qwen-2.5-7b-instruct:free',
  'baichuan2-7b':       'qwen/qwen-2.5-7b-instruct:free',
  'minicpm-v-26':       'qwen/qwen-2.5-7b-instruct:free',
  'minicpm-2b':         'qwen/qwen-2.5-7b-instruct:free',
  'hunyuan-large':      'qwen/qwen-2.5-72b-instruct:free',
  'gpt-neox-20b':       'meta-llama/llama-3.1-8b-instruct:free',
  'gpt-j-6b':           'meta-llama/llama-3.1-8b-instruct:free',
  'pythia-12b':         'meta-llama/llama-3.1-8b-instruct:free',
  'pythia-6-9b':        'meta-llama/llama-3.1-8b-instruct:free',
  'pythia-2-8b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llava-16-34b':       'meta-llama/llama-3.2-90b-vision-instruct',
  'llava-16-13b':       'meta-llama/llama-3.2-11b-vision-instruct:free',
  'bakllava':           'meta-llama/llama-3.2-11b-vision-instruct:free',
  'cogvlm2':            'qwen/qwen-2.5-7b-instruct:free',
  'internvl2':          'qwen/qwen-2.5-72b-instruct:free',
  'molmo-72b':          'meta-llama/llama-3.1-70b-instruct:free',
  'molmo-7b':           'meta-llama/llama-3.1-8b-instruct:free',
  'moondream-2':        'meta-llama/llama-3.1-8b-instruct:free',
  'florence-2':         'meta-llama/llama-3.1-8b-instruct:free',
  'fuyu-8b':            'meta-llama/llama-3.1-8b-instruct:free',
  'cogagent':           'qwen/qwen-2.5-7b-instruct:free',
  'llava-onevision-72b':'meta-llama/llama-3.1-70b-instruct:free',
  'idefics3':           'meta-llama/llama-3.1-8b-instruct:free',
  'smolvlm':            'meta-llama/llama-3.1-8b-instruct:free',
  'rwkv-5-14b':         'meta-llama/llama-3.1-8b-instruct:free',
  'rwkv-5-7b':          'meta-llama/llama-3.1-8b-instruct:free',
  'mamba-2-8b':         'meta-llama/llama-3.2-3b-instruct:free',
  'striped-hyena-7b':   'meta-llama/llama-3.1-8b-instruct:free',
  'bloom-176b':         'meta-llama/llama-3.1-70b-instruct:free',
  'snowflake-arctic':   'qwen/qwen-2.5-72b-instruct:free',
  'skywork-o1-8b':      'qwen/qwen-2.5-7b-instruct:free',
  'decilm-7b':          'mistralai/mistral-7b-instruct:free',
  'persimmon-8b':       'meta-llama/llama-3.1-8b-instruct:free',
  'redpajama-7b':       'meta-llama/llama-3.1-8b-instruct:free',
  'smollm2':            'meta-llama/llama-3.2-1b-instruct:free',
  'stablelm-2':         'meta-llama/llama-3.2-1b-instruct:free',
  'olmo-7b':            'meta-llama/llama-3.1-8b-instruct:free',
  'olmo-1-7b':          'meta-llama/llama-3.2-1b-instruct:free',
  'tulu-2':             'meta-llama/llama-3.1-70b-instruct:free',
  'dolly-v2':           'meta-llama/llama-3.1-8b-instruct:free',
  'metamath-7b':        'meta-llama/llama-3.1-8b-instruct:free',
  'llemma-34b':         'meta-llama/llama-3.1-70b-instruct:free',
  'wizardmath-70b':     'meta-llama/llama-3.1-70b-instruct:free',
  'phind-codellama':    'deepseek/deepseek-coder',
  'magicoder':          'deepseek/deepseek-coder',
  'opencoder':          'deepseek/deepseek-coder',
  'refact-1-6b':        'deepseek/deepseek-coder',
  'granite-code-34b':   'deepseek/deepseek-coder',
  'granite-code-8b':    'deepseek/deepseek-coder',
};

// Known reliable fallback model
const FALLBACK_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

const FREE_MODEL_IDS = new Set(
  Object.values(MODEL_MAP).filter((id) => id.endsWith(':free'))
);

export function resolveOpenRouterModel(internalId: string): string {
  // Direct match
  if (MODEL_MAP[internalId]) return MODEL_MAP[internalId];

  // Strip quantization suffix
  const baseId = internalId.replace(/-q\d[_-]k[_-][msla]$/, '').replace(/-q\d[-_]\d$/, '');
  if (MODEL_MAP[baseId]) return MODEL_MAP[baseId];

  // If the ID already looks like an OpenRouter ID (contains /), use it directly
  if (internalId.includes('/')) return internalId;

  // Fallback to a reliable free model
  return FALLBACK_MODEL;
}

export function isModelFree(internalId: string): boolean {
  const resolved = resolveOpenRouterModel(internalId);
  return FREE_MODEL_IDS.has(resolved);
}

async function tryModelRequest(
  apiKey: string,
  model: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://modelforge.onrender.com',
      'X-Title': 'AI Model Forge',
    },
    body: JSON.stringify({ ...body, model }),
  });
}

export async function streamChatCompletion(
  apiKey: string,
  request: ChatRequest,
  onChunk: (text: string) => void,
  onDone: (fullText: string, usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  let resolvedModel = resolveOpenRouterModel(request.model);

  const body = {
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
    response = await tryModelRequest(apiKey, resolvedModel, body);

    // If model not found, try without :free suffix
    if (!response.ok && response.status === 400) {
      const errText = await response.text();
      if (errText.includes('not a valid model') || errText.includes('not found')) {
        // Try without :free
        if (resolvedModel.endsWith(':free')) {
          const withoutFree = resolvedModel.replace(':free', '');
          response = await tryModelRequest(apiKey, withoutFree, body);

          if (!response.ok) {
            // Last resort: use fallback model
            resolvedModel = FALLBACK_MODEL;
            response = await tryModelRequest(apiKey, resolvedModel, body);
          }
        } else {
          // Try fallback model
          resolvedModel = FALLBACK_MODEL;
          response = await tryModelRequest(apiKey, resolvedModel, body);
        }
      }
    }
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
  let resolvedModel = resolveOpenRouterModel(request.model);

  const body = {
    messages: request.messages,
    temperature: request.temperature ?? 0.7,
    top_p: request.top_p ?? 0.9,
    max_tokens: request.max_tokens ?? 2048,
    frequency_penalty: request.frequency_penalty ?? 0,
    presence_penalty: request.presence_penalty ?? 0,
    stop: request.stop,
    stream: false,
  };

  let response = await tryModelRequest(apiKey, resolvedModel, body);

  // If model not found, try without :free, then fallback
  if (!response.ok && response.status === 400) {
    const errText = await response.text();
    if (errText.includes('not a valid model') || errText.includes('not found')) {
      if (resolvedModel.endsWith(':free')) {
        response = await tryModelRequest(apiKey, resolvedModel.replace(':free', ''), body);
      }
      if (!response.ok) {
        resolvedModel = FALLBACK_MODEL;
        response = await tryModelRequest(apiKey, resolvedModel, body);
      }
    }
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage,
  };
}