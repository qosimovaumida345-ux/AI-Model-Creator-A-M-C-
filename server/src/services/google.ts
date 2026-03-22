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
        } catch { }
      }
    }

    onDone(fullText);
  } catch (err: unknown) {
    onError(`Google AI error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}
const GOOGLE_BASE = 'https://generativelanguage.googleapis.com/v1beta';

let cachedGoogleModels: string[] = [];
let googleCacheTime = 0;

async function getAvailableGoogleModels(): Promise<string[]> {
  if (cachedGoogleModels.length > 0 && Date.now() - googleCacheTime < 60 * 60 * 1000) {
    return cachedGoogleModels;
  }
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return cachedGoogleModels;

    const response = await fetch(
      `${GOOGLE_BASE}/models?key=${apiKey}`
    );
    if (!response.ok) return cachedGoogleModels;
    const data = await response.json() as { models: { name: string; supportedGenerationMethods?: string[] }[] };
    cachedGoogleModels = data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
    googleCacheTime = Date.now();
    return cachedGoogleModels;
  } catch {
    return cachedGoogleModels;
  }
}

const GOOGLE_KEYWORD_MAP: { keywords: string[]; preferred: string[] }[] = [
  { keywords: ['gemini', '2', 'flash'], preferred: ['gemini-2.0-flash', 'gemini-1.5-flash'] },
  { keywords: ['gemini', '2', 'pro'], preferred: ['gemini-2.5-pro', 'gemini-1.5-pro'] },
  { keywords: ['gemini', '15', 'pro'], preferred: ['gemini-1.5-pro', 'gemini-2.5-pro'] },
  { keywords: ['gemini', '15', 'flash'], preferred: ['gemini-1.5-flash', 'gemini-2.0-flash'] },
  { keywords: ['gemini', 'ultra'], preferred: ['gemini-2.5-pro'] },
  { keywords: ['gemma'], preferred: ['gemma-3-27b-it', 'gemma-3-9b-it'] },
];

export async function resolveGoogleModel(internalId: string): Promise<string> {
  const available = await getAvailableGoogleModels();
  const idLower = internalId.toLowerCase();

  for (const { keywords, preferred } of GOOGLE_KEYWORD_MAP) {
    if (keywords.some(kw => idLower.includes(kw))) {
      for (const p of preferred) {
        if (available.includes(p)) return p;
      }
    }
  }

  const GOOGLE_FALLBACK = 'gemini-2.0-flash';
  return available.includes(GOOGLE_FALLBACK) ? GOOGLE_FALLBACK : (available[0] || GOOGLE_FALLBACK);
}

export function getGoogleModelId(internalId: string): string {
  const map: Record<string, string> = {
    'gemini-20-flash': 'gemini-2.0-flash',
    'gemini-15-pro': 'gemini-1.5-pro',
    'gemini-15-flash': 'gemini-1.5-flash',
    'gemini-ultra': 'gemini-2.5-pro',
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
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    onError('GOOGLE_AI_API_KEY not set');
    return;
  }

  const actualModel = await resolveGoogleModel(model);

  const googleMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemMsg = messages.find(m => m.role === 'system');

  try {
    const response = await fetch(
      `${GOOGLE_BASE}/models/${actualModel}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: googleMessages,
          ...(systemMsg && {
            systemInstruction: { parts: [{ text: systemMsg.content }] },
          }),
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      const isNotFound = err.includes('not found') || err.includes('deprecated');
      if (isNotFound) {
        return streamGoogleChat('gemini-2.0-flash', messages, onChunk, onDone, onError);
      }
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
        } catch { }
      }
    }

    onDone(fullText);
  } catch (err: unknown) {
    onError(`Google AI error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}