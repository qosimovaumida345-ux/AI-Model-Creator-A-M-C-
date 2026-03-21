function getApiBase(): string {
  // 1. Check Vite env (set at build time)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. In production, use same origin (works if backend serves frontend)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }
  
  // 3. Local development fallback
  return 'http://localhost:3001/api';
}

const API_BASE = getApiBase();

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/forge/datasets/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
  
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
  
  if (!res.ok) {
    throw new Error(`Save failed: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchDatasets() {
  try {
    const res = await fetch(`${API_BASE}/forge/datasets`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function deleteDataset(id: string) {
  try {
    await fetch(`${API_BASE}/forge/datasets/${id}`, { method: 'DELETE' });
  } catch {
    // Continue even if server delete fails
  }
}

export async function previewDataset(id: string) {
  const res = await fetch(`${API_BASE}/forge/datasets/${id}/preview`);
  if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchForgedModels() {
  try {
    const res = await fetch(`${API_BASE}/forge/models`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function deleteForgedModel(id: string) {
  try {
    await fetch(`${API_BASE}/forge/models/${id}`, { method: 'DELETE' });
  } catch {
    // Continue even if server delete fails
  }
}

export async function updateForgedModel(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/forge/models/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  const data = await res.json();
  return data.data;
}

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
  
  if (!res.ok) {
    throw new Error(`Training request failed: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function fetchTrainingJob(jobId: string) {
  const res = await fetch(`${API_BASE}/forge/training/${jobId}`);
  if (!res.ok) throw new Error(`Failed to fetch training job: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export async function cancelTraining(jobId: string) {
  try {
    await fetch(`${API_BASE}/forge/training/${jobId}/cancel`, { method: 'POST' });
  } catch {
    // Best effort
  }
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
      /* skip unparseable */
    }
  };

  eventSource.onerror = () => {
    onError('Lost connection to training stream');
    eventSource.close();
  };

  return () => eventSource.close();
}

export async function fetchTrainableModels(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/forge/trainable-models`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}