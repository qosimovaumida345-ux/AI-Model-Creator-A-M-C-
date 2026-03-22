const GROQ_BASE = 'https://api.groq.com/openai/v1';

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');
  return key;
}

// Groq free models
const GROQ_MODELS: Record<string, string> = {
  'llama-31-70b': 'llama-3.1-70b-versatile',
  'llama-31-8b': 'llama-3.1-8b-instant',
  'llama-3-70b': 'llama3-70b-8192',
  'llama-3-8b': 'llama3-8b-8192',
  'llama-32-3b': 'llama-3.2-3b-preview',
  'llama-32-1b': 'llama-3.2-1b-preview',
  'mixtral-8x7b': 'mixtral-8x7b-32768',
  'gemma-2-9b': 'gemma2-9b-it',
  'gemma-7b': 'gemma-7b-it',
  'qwen25-32b': 'qwen-qwq-32b',
  'deepseek-r1': 'deepseek-r1-distill-llama-70b',
};

export function isGroqAvailable(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export function getGroqModelId(internalId: string): string | null {
  return GROQ_MODELS[internalId] || null;
}

export async function streamGroqChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
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