const CF_BASE = 'https://api.cloudflare.com/client/v4/accounts';

function getAccountId(): string {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) throw new Error('CLOUDFLARE_ACCOUNT_ID not set');
  return id;
}

function getApiKey(): string {
  const key = process.env.CLOUDFLARE_API_KEY;
  if (!key) throw new Error('CLOUDFLARE_API_KEY not set');
  return key;
}

// Cloudflare Workers AI free models
const CF_MODELS: Record<string, string> = {
  'llama-31-8b':        '@cf/meta/llama-3.1-8b-instruct',
  'llama-31-70b':       '@cf/meta/llama-3.1-70b-instruct',
  'llama-32-3b':        '@cf/meta/llama-3.2-3b-instruct',
  'llama-32-1b':        '@cf/meta/llama-3.2-1b-instruct',
  'llama-3-8b':         '@cf/meta/llama-3-8b-instruct',
  'mistral-7b-v03':     '@cf/mistral/mistral-7b-instruct-v0.2',
  'gemma-7b':           '@hf/google/gemma-7b-it',
  'gemma-2-2b':         '@cf/google/gemma-7b-it-lora',
  'qwen25-7b':          '@cf/qwen/qwen1.5-7b-chat-awq',
  'phi-2':              '@cf/microsoft/phi-2',
  'codellama-7b':       '@hf/thebloke/codellama-7b-instruct-awq',
  'deepseek-coder-33b': '@hf/thebloke/deepseek-coder-6.7b-instruct-awq',
  'openchat-35':        '@cf/openchat/openchat-3.5-0106',
  'openhermes-25':      '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
  'neural-chat-7b':     '@hf/thebloke/neural-chat-7b-v3-1-awq',
  'zephyr-7b':          '@hf/thebloke/zephyr-7b-beta-awq',
  'tinyllama':          '@cf/tinyllama/tinyllama-1.1b-chat-v1.0',
  'falcon-7b':          '@cf/tiiuae/falcon-7b-instruct',
  'mistral-small':      '@cf/mistral/mistral-7b-instruct-v0.2',
  'dolphin-29':         '@cf/cognitivecomputations/deepseek-math-7b-instruct',
  'stablelm-2':         '@cf/stabilityai/stablelm-2-zephyr-1.6b',
  'sqlcoder-7b':        '@cf/defog/sqlcoder-7b-2',
};

export function isCloudflareAvailable(): boolean {
  return !!process.env.CLOUDFLARE_ACCOUNT_ID && !!process.env.CLOUDFLARE_API_KEY;
}

export function getCloudflareModelId(internalId: string): string | null {
  return CF_MODELS[internalId] || null;
}

export function getAnyCloudflareModel(): string {
  return '@cf/meta/llama-3.1-8b-instruct';
}

export async function streamCloudflareChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const accountId = getAccountId();
  const apiKey = getApiKey();

  try {
    const response = await fetch(
      `${CF_BASE}/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages,
          stream: true,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      onError(`Cloudflare AI error ${response.status}: ${err}`);
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
          const text = json.response;
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch {}
      }
    }

    onDone(fullText);
  } catch (err: unknown) {
    onError(`Cloudflare AI error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

export async function chatCloudflare(
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const accountId = getAccountId();
  const apiKey = getApiKey();

  const response = await fetch(
    `${CF_BASE}/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        stream: false,
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudflare AI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.result?.response || '';
}