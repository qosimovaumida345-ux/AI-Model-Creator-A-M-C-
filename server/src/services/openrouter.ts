// Real OpenRouter API integration — streams responses via SSE
import type { IncomingMessage } from 'http';

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

// Map our internal model IDs to OpenRouter model IDs
// See https://openrouter.ai/models for full list
const MODEL_MAP: Record<string, string> = {
  // ── Free models (":free" suffix) ─────────────────
  'gpt-35-turbo':       'openai/gpt-3.5-turbo',
  'gpt-4o':             'openai/gpt-4o',
  'gpt-4-turbo':        'openai/gpt-4-turbo',
  'gpt-4':              'openai/gpt-4',
  'o1':                 'openai/o1',
  'o1-mini':            'openai/o1-mini',
  'o3':                 'openai/o3-mini',
  'claude-35-sonnet':   'anthropic/claude-3.5-sonnet',
  'claude-3-opus':      'anthropic/claude-3-opus',
  'claude-3-haiku':     'anthropic/claude-3-haiku',
  'claude-21':          'anthropic/claude-2.1',
  'claude-instant':     'anthropic/claude-instant-1.1',
  'gemini-20-flash':    'google/gemini-2.0-flash-exp:free',
  'gemini-15-pro':      'google/gemini-pro-1.5',
  'gemini-15-flash':    'google/gemini-flash-1.5',
  'gemini-ultra':       'google/gemini-pro',
  'gemma-2-27b':        'google/gemma-2-27b-it',
  'gemma-2-9b':         'google/gemma-2-9b-it:free',
  'gemma-2-2b':         'google/gemma-2-2b-it',
  'gemma-7b':           'google/gemma-7b-it',
  'llama-31-405b':      'meta-llama/llama-3.1-405b-instruct:free',
  'llama-31-70b':       'meta-llama/llama-3.1-70b-instruct:free',
  'llama-31-8b':        'meta-llama/llama-3.1-8b-instruct:free',
  'llama-32-90b-vision':'meta-llama/llama-3.2-90b-vision-instruct',
  'llama-32-11b-vision':'meta-llama/llama-3.2-11b-vision-instruct',
  'llama-32-3b':        'meta-llama/llama-3.2-3b-instruct:free',
  'llama-32-1b':        'meta-llama/llama-3.2-1b-instruct:free',
  'llama-3-70b':        'meta-llama/llama-3-70b-instruct',
  'llama-3-8b':         'meta-llama/llama-3-8b-instruct:free',
  'llama-2-70b':        'meta-llama/llama-2-70b-chat',
  'llama-2-13b':        'meta-llama/llama-2-13b-chat',
  'llama-2-7b':         'meta-llama/llama-2-7b-chat',
  'mistral-large-2':    'mistralai/mistral-large',
  'mistral-nemo':       'mistralai/mistral-nemo',
  'mixtral-8x22b':      'mistralai/mixtral-8x22b-instruct',
  'mixtral-8x7b':       'mistralai/mixtral-8x7b-instruct:free',
  'mistral-7b-v03':     'mistralai/mistral-7b-instruct:free',
  'mistral-small':      'mistralai/mistral-small',
  'codestral':          'mistralai/codestral-mamba',
  'phi-35-moe':         'microsoft/phi-3.5-mini-128k-instruct',
  'phi-35-mini':        'microsoft/phi-3.5-mini-128k-instruct',
  'phi-3-medium':       'microsoft/phi-3-medium-128k-instruct:free',
  'phi-3-mini':         'microsoft/phi-3-mini-128k-instruct:free',
  'grok-2':             'x-ai/grok-2-1212',
  'grok-2-mini':        'x-ai/grok-2-vision-1212',
  'qwen25-72b':         'qwen/qwen-2.5-72b-instruct:free',
  'qwen25-32b':         'qwen/qwen-2.5-32b-instruct',
  'qwen25-14b':         'qwen/qwen-2.5-14b-instruct',
  'qwen25-7b':          'qwen/qwen-2.5-7b-instruct:free',
  'qwen25-coder':       'qwen/qwen-2.5-coder-32b-instruct',
  'deepseek-v25':       'deepseek/deepseek-chat',
  'deepseek-r1':        'deepseek/deepseek-r1:free',
  'deepseek-coder-v2':  'deepseek/deepseek-coder',
  'yi-large':           '01-ai/yi-large',
  'yi-15-34b':          '01-ai/yi-34b-chat',
  'command-r-plus':     'cohere/command-r-plus',
  'command-r':          'cohere/command-r',
  'jamba-15-large':     'ai21/jamba-1-5-large',
  'jamba-15-mini':      'ai21/jamba-1-5-mini',
  'hermes-3-70b':       'nousresearch/hermes-3-llama-3.1-70b',
  'hermes-3-8b':        'nousresearch/hermes-3-llama-3.1-8b',
  'dolphin-29':         'cognitivecomputations/dolphin-llama-3-70b',
  'dolphin-mixtral':    'cognitivecomputations/dolphin-mixtral-8x22b',
  'zephyr-7b':          'huggingfaceh4/zephyr-7b-beta:free',
  'openchat-35':        'openchat/openchat-7b:free',
  'openhermes-25':      'teknium/openhermes-2.5-mistral-7b',
  'mythomax-13b':       'gryphe/mythomax-l2-13b',
  'neural-chat-7b':     'intel/neural-chat-7b',
  'solar-10-7b':        'upstage/solar-10.7b-instruct',
  'wizardlm-2':         'microsoft/wizardlm-2-8x22b',
  'dbrx':               'databricks/dbrx-instruct',
  'pixtral-12b':        'mistralai/pixtral-12b',
  'glm-4':              'thudm/glm-4-9b',
  'internlm2-20b':      'internlm/internlm2-20b',
  'nous-capybara':      'nousresearch/nous-capybara-34b',
  'vicuna-13b':         'lmsys/vicuna-13b-v1.5',
  'pplx-70b-online':    'perplexity/pplx-70b-online',
};

// Known free models on OpenRouter
const FREE_MODEL_IDS = new Set(
  Object.values(MODEL_MAP).filter((id) => id.endsWith(':free'))
);

export function resolveOpenRouterModel(internalId: string): string | null {
  // Direct match
  if (MODEL_MAP[internalId]) return MODEL_MAP[internalId];

  // Strip quantization suffix (e.g., "llama-31-8b-q4-k-m" → "llama-31-8b")
  const baseId = internalId.replace(/-q\d[_-]k[_-][msla]$/, '').replace(/-q\d[-_]\d$/, '');
  if (MODEL_MAP[baseId]) return MODEL_MAP[baseId];

  return null;
}

export function isModelFree(internalId: string): boolean {
  const resolved = resolveOpenRouterModel(internalId);
  return resolved ? FREE_MODEL_IDS.has(resolved) : false;
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

  const body = {
    model: resolvedModel,
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://modelforge.onrender.com',
        'X-Title': 'AI Model Forge',
      },
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
    } catch { /* use default msg */ }
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
          // Check for usage in the final chunk
          if (json.usage) {
            onDone(fullText, json.usage);
            return;
          }
        } catch {
          // Skip unparseable chunks
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Stream error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return;
  }

  onDone(fullText);
}

// Non-streaming fallback
export async function chatCompletion(
  apiKey: string,
  request: ChatRequest
): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const resolvedModel = resolveOpenRouterModel(request.model) || request.model;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://modelforge.onrender.com',
      'X-Title': 'AI Model Forge',
    },
    body: JSON.stringify({
      ...request,
      model: resolvedModel,
      stream: false,
    }),
  });

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