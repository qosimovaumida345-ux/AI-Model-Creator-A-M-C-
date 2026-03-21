// Real Ollama API integration for local/offline inference
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

interface OllamaChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    repeat_penalty?: number;
    stop?: string[];
  };
  stream?: boolean;
}

// Map our internal IDs to Ollama model tags
const OLLAMA_MODEL_MAP: Record<string, string> = {
  'llama-31-8b':    'llama3.1:8b',
  'llama-31-70b':   'llama3.1:70b',
  'llama-32-3b':    'llama3.2:3b',
  'llama-32-1b':    'llama3.2:1b',
  'llama-3-8b':     'llama3:8b',
  'llama-3-70b':    'llama3:70b',
  'llama-2-7b':     'llama2:7b',
  'llama-2-13b':    'llama2:13b',
  'codellama-7b':   'codellama:7b',
  'codellama-34b':  'codellama:34b',
  'mistral-7b-v03': 'mistral:7b',
  'mistral-nemo':   'mistral-nemo',
  'mixtral-8x7b':   'mixtral:8x7b',
  'gemma-2-2b':     'gemma2:2b',
  'gemma-2-9b':     'gemma2:9b',
  'gemma-2-27b':    'gemma2:27b',
  'gemma-7b':       'gemma:7b',
  'phi-3-mini':     'phi3:mini',
  'phi-35-mini':    'phi3.5',
  'qwen25-7b':      'qwen2.5:7b',
  'qwen25-14b':     'qwen2.5:14b',
  'qwen25-32b':     'qwen2.5:32b',
  'qwen25-72b':     'qwen2.5:72b',
  'qwen25-coder':   'qwen2.5-coder:7b',
  'deepseek-r1':    'deepseek-r1:8b',
  'deepseek-v25':   'deepseek-v2.5',
  'starcoder2-3b':  'starcoder2:3b',
  'starcoder2-7b':  'starcoder2:7b',
  'zephyr-7b':      'zephyr:7b',
  'openchat-35':    'openchat:7b',
  'neural-chat-7b': 'neural-chat:7b',
  'tinyllama':      'tinyllama',
  'stablelm-2':     'stablelm2',
  'smollm2':        'smollm2',
  'nomic-embed':    'nomic-embed-text',
  'all-minilm-l6-v2':'all-minilm',
};

export function resolveOllamaModel(internalId: string): string {
  const baseId = internalId.replace(/-q\d[_-]k[_-][msla]$/, '').replace(/-q\d[-_]\d$/, '');
  return OLLAMA_MODEL_MAP[baseId] || OLLAMA_MODEL_MAP[internalId] || internalId;
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}

export async function streamOllamaChat(
  request: OllamaChatRequest,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const model = resolveOllamaModel(request.model);

  let response: Response;
  try {
    response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        options: request.options,
        stream: true,
      }),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Cannot connect to Ollama at ${OLLAMA_HOST}. Is it running?`);
    return;
  }

  if (!response.ok) {
    const errText = await response.text();
    onError(`Ollama error ${response.status}: ${errText}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('No response stream from Ollama');
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
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullText += json.message.content;
            onChunk(json.message.content);
          }
          if (json.done) {
            onDone(fullText);
            return;
          }
        } catch { /* skip */ }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Ollama stream error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return;
  }

  onDone(fullText);
}