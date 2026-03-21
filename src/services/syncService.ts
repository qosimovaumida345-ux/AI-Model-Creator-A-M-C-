import { v4 as uuid } from 'uuid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generate or retrieve persistent device ID
function getDeviceId(): string {
  let id = localStorage.getItem('modelforge-device-id');
  if (!id) {
    id = uuid();
    localStorage.setItem('modelforge-device-id', id);
  }
  return id;
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux PC';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if ((window as any).electron) return 'Desktop App';
  return 'Web Browser';
}

function getPlatform(): string {
  if ((window as any).electron) return (window as any).electron.platform;
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh/i.test(ua)) return 'macos';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad/i.test(ua)) return 'ios';
  return 'web';
}

// ── Register device ──────────────────────────────────────────
export async function registerDevice(): Promise<void> {
  try {
    await fetch(`${API_BASE}/sync/devices/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
        platform: getPlatform(),
      }),
    });
  } catch {
    // Silently fail — not critical
  }
}

// ── Push local data to server ────────────────────────────────
export async function pushSync(data: {
  forgedModels: unknown[];
  chatSessions: unknown[];
  settings: Record<string, unknown>;
}): Promise<{ success: boolean; checksum?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
        ...data,
      }),
    });
    const json = await res.json();
    if (!json.success) return { success: false, error: json.error };
    return { success: true, checksum: json.data.checksum };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Push failed' };
  }
}

// ── Pull server data to local ────────────────────────────────
export async function pullSync(lastChecksum: string | null): Promise<{
  success: boolean;
  hasChanges: boolean;
  data?: {
    forgedModels: unknown[];
    chatSessions: unknown[];
    settings: Record<string, unknown>;
    checksum: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/sync/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        lastChecksum,
      }),
    });
    const json = await res.json();
    if (!json.success) return { success: false, hasChanges: false, error: json.error };
    return {
      success: true,
      hasChanges: json.data.hasChanges,
      data: {
        forgedModels: json.data.forgedModels,
        chatSessions: json.data.chatSessions,
        settings: json.data.settings,
        checksum: json.data.checksum,
      },
    };
  } catch (err: unknown) {
    return { success: false, hasChanges: false, error: err instanceof Error ? err.message : 'Pull failed' };
  }
}

// ── Get sync status ──────────────────────────────────────────
export async function getSyncStatus(): Promise<{
  lastSync: string | null;
  deviceCount: number;
  devices: Array<{ id: string; name: string; platform: string; lastSeen: string }>;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/sync/status`);
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// ── Export all data ──────────────────────────────────────────
export async function exportAllData(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/export/all`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelforge-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Export failed');
  }
}

// ── Import data ──────────────────────────────────────────────
export async function importData(file: File): Promise<{ importedModels: number; importedSessions: number }> {
  const text = await file.text();
  const data = JSON.parse(text);

  const res = await fetch(`${API_BASE}/export/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}