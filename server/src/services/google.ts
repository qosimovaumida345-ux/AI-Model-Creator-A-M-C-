const GOOGLE_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey(): string {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('GOOGLE_AI_API_KEY not set');
  return key;
}

const GOOGLE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export function isGoogleModel(model: string): boolean {
  return model.startsWith('google/') || GOOGLE_MODELS.some((m) => model.includes(m));
}

export function getGoogleModelId(internalId: string): string {
  const map: Record<string, string> = {
    'gemini-20-flash': 'gemini-2.0-flash',
    'gemini-15-pro': 'gemini-1.5-pro',
    'gemini-15-flash': 'gemini-1.5-flash',
    'gemini-ultra': 'gemini-1.5-pro',
  };
  return map[internalId] || 'gemini-2.0-flash';
}

export async function streamGoogleChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const apiKey = getApiKey();
  const googleModel = model.replace('google/', '');

  // Convert messages to Google format
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === 'system');

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction.content }],
    };
  }

  try {
    const response = await fetch(
      `${GOOGLE_BASE}/models/${googleModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      onError(`Google AI error ${response.status}: ${err}`);
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
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch {}
      }
    }

    onDone(fullText);
  } catch (err: unknown) {
    onError(`Google AI error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}