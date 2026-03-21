const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3001/api';

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
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
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
  const res = await fetch(`${API_BASE}/forge/trainable-models`);
  const data = await res.json();
  return data.data || [];
}