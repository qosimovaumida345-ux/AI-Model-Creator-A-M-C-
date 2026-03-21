const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3001/api';

<<<<<<< HEAD
export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/forge/datasets/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function pasteDataset(content: string, name: string, format: string) {
  const res = await fetch(`${API_BASE}/forge/datasets/paste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, name, format }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/forge/datasets`);
  const data = await res.json();
  return data.data || [];
}

export async function deleteDataset(id: string) {
  await fetch(`${API_BASE}/forge/datasets/${id}`, { method: 'DELETE' });
}

export async function previewDataset(id: string) {
  const res = await fetch(`${API_BASE}/forge/datasets/${id}/preview`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchForgedModels() {
  const res = await fetch(`${API_BASE}/forge/models`);
  const data = await res.json();
  return data.data || [];
}

export async function deleteForgedModel(id: string) {
  await fetch(`${API_BASE}/forge/models/${id}`, { method: 'DELETE' });
}

export async function updateForgedModel(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/forge/models/${id}`, {
=======
interface ChatCompletionParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  sessionId?: string;
  provider?: 'openrouter' | 'ollama';
  apiKey?: string;
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/chat/sessions`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchSession(id: string) {
  const res = await fetch(`${API_BASE}/chat/sessions/${id}`);
  const data = await res.json();
  return data.data;
}

export async function createSession(params: {
  modelId: string;
  modelName: string;
  settings?: Record<string, unknown>;
  isForgedModel?: boolean;
}) {
  const res = await fetch(`${API_BASE}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return data.data;
}

export async function updateSession(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/chat/sessions/${id}`, {
>>>>>>> 279d76158f771ba5545cad61a6904e077624e191
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  return data.data;
}

<<<<<<< HEAD
export async function startTraining(params: {
  baseModelId: string;
  baseModelName: string;
  datasetId: string;
  config: Record<string, unknown>;
  modelName: string;
  systemPrompt: string;
  description: string;
  avatar: string;
}) {
  const res = await fetch(`${API_BASE}/forge/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchTrainingJob(jobId: string) {
  const res = await fetch(`${API_BASE}/forge/training/${jobId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function cancelTraining(jobId: string) {
  await fetch(`${API_BASE}/forge/training/${jobId}/cancel`, { method: 'POST' });
}

export function subscribeToTraining(
  jobId: string,
  onUpdate: (data: Record<string, unknown>) => void,
  onDone: (status: string) => void,
  onError: (error: string) => void
): () => void {
  const url = `${API_BASE}/forge/training/${jobId}/events`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'done') {
        onDone(data.status || 'completed');
        eventSource.close();
      } else if (data.type === 'error') {
        onError(data.error || 'Unknown error');
        eventSource.close();
      } else {
        onUpdate(data);
      }
    } catch {
      /* skip */
    }
  };

  eventSource.onerror = () => {
    onError('Lost connection to training stream');
    eventSource.close();
  };

  return () => eventSource.close();
}

export async function fetchTrainableModels(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/forge/trainable-models`);
  const data = await res.json();
  return data.data || [];
}
=======
export async function deleteSession(id: string) {
  await fetch(`${API_BASE}/chat/sessions/${id}`, { method: 'DELETE' });
}

export async function checkOllamaStatus(): Promise<{ available: boolean; models: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/chat/ollama/status`);
    const data = await res.json();
    return data.data || { available: false, models: [] };
  } catch {
    return { available: false, models: [] };
  }
}

export async function streamChat(
  params: ChatCompletionParams,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (params.apiKey) {
    headers['X-OpenRouter-Key'] = params.apiKey;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        top_p: params.topP ?? 0.9,
        max_tokens: params.maxTokens ?? 2048,
        frequency_penalty: params.frequencyPenalty ?? 0,
        presence_penalty: params.presencePenalty ?? 0,
        stop: params.stop,
        stream: true,
        sessionId: params.sessionId,
        provider: params.provider || 'openrouter',
      }),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Network error: ${err instanceof Error ? err.message : 'Cannot connect to server'}`);
    return;
  }

  if (!response.ok) {
    const errText = await response.text();
    try {
      const parsed = JSON.parse(errText);
      onError(parsed.error || `Server error ${response.status}`);
    } catch {
      onError(`Server error ${response.status}: ${errText}`);
    }
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('No response stream');
    return;
  }

  const decoder = new TextDecoder();
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
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6);
        if (payload === '[DONE]') {
          onDone();
          return;
        }

        try {
          const json = JSON.parse(payload);
          if (json.error) {
            onError(json.error);
            return;
          }
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // skip
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(`Stream error: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  onDone();
}

export async function sendChat(params: ChatCompletionParams): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (params.apiKey) {
    headers['X-OpenRouter-Key'] = params.apiKey;
  }

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      top_p: params.topP ?? 0.9,
      max_tokens: params.maxTokens ?? 2048,
      stream: false,
      sessionId: params.sessionId,
      provider: params.provider || 'openrouter',
    }),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Chat failed');
  return data.data.choices[0].message.content;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
>>>>>>> 279d76158f771ba5545cad61a6904e077624e191
