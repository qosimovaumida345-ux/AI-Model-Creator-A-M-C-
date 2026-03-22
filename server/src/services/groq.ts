const GROQ_BASE = 'https://api.groq.com/openai/v1';

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');
  return key;
}

let cachedGroqModels: string[] = [];
let cacheTime = 0;

async function getAvailableGroqModels(): Promise<string[]> {
  if (cachedGroqModels.length > 0 && Date.now() - cacheTime < 60 * 60 * 1000) {
    return cachedGroqModels;
  }
  try {
    const response = await fetch(`${GROQ_BASE}/models`, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });
    if (!response.ok) return cachedGroqModels;
    const data = await response.json() as { data: { id: string }[] };
    cachedGroqModels = data.data.map((m) => m.id);
    cacheTime = Date.now();
    return cachedGroqModels;
  } catch {
    return cachedGroqModels;
  }
}

const GROQ_PREFERRED: string[] = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
  'qwen-qwq-32b',
  'deepseek-r1-distill-llama-70b',
];

const GROQ_KEYWORD_MAP: { keywords: string[]; preferred: string[] }[] = [
  { keywords: ['llama', '70b', '31', '33'], preferred: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'] },
  { keywords: ['llama', '8b', '31', '32'], preferred: ['llama-3.1-8b-instant'] },
  { keywords: ['llama', '3b', '1b', '32'], preferred: ['llama-3.1-8b-instant'] },
  { keywords: ['mixtral', 'mistral'], preferred: ['mixtral-8x7b-32768'] },
  { keywords: ['gemma'], preferred: ['gemma2-9b-it'] },
  { keywords: ['qwen', 'qwq'], preferred: ['qwen-qwq-32b'] },
  { keywords: ['deepseek', 'r1'], preferred: ['deepseek-r1-distill-llama-70b'] },
];

async function resolveGroqModel(internalId: string): Promise<string> {
  const available = await getAvailableGroqModels();
  const idLower = internalId.toLowerCase();

  for (const { keywords, preferred } of GROQ_KEYWORD_MAP) {
    const matches = keywords.every((kw) => idLower.includes(kw));
    if (matches) {
      for (const p of preferred) {
        if (available.includes(p)) return p;
      }
    }
  }

  for (const p of GROQ_PREFERRED) {
    if (available.includes(p)) return p;
  }

  return 'llama-3.3-70b-versatile';
}

export function isGroqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export async function getGroqModelId(internalId: string): Promise<string> {
  return resolveGroqModel(internalId);
}

export async function streamGroqChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const apiKey = getApiKey();
  const actualModel = await resolveGroqModel(model);

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: actualModel,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      const isDecommissioned =
        err.includes('decommissioned') ||
        err.includes('not found') ||
        err.includes('does not exist');

      if (isDecommissioned) {
        const available = await getAvailableGroqModels();
        const fallback = GROQ_PREFERRED.find((p) => available.includes(p)) || 'llama-3.3-70b-versatile';
        if (fallback !== actualModel) {
          return streamGroqChat(fallback, messages, onChunk, onDone, onError);
        }
      }

      onError(`Groq error ${response.status}: ${err}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response stream');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {}
      }
    }

    onDone(fullText);
  } catch (err: unknown) {
    onError(`Groq error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}