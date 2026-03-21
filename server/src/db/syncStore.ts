import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const SYNC_FILE = path.join(DATA_DIR, 'sync-state.json');
const DEVICES_FILE = path.join(DATA_DIR, 'devices.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string): T | null {
  ensureDir();
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return null; }
}

function writeJson<T>(file: string, data: T) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── Sync State ───────────────────────────────────────────────
export interface SyncSnapshot {
  id: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  forgedModels: unknown[];
  chatSessions: unknown[];
  settings: Record<string, unknown>;
  checksum: string;
}

export interface DeviceRecord {
  id: string;
  name: string;
  platform: string;
  lastSeen: string;
  lastSyncAt: string | null;
}

export const syncStore = {
  getLatestSnapshot(): SyncSnapshot | null {
    return readJson<SyncSnapshot>(SYNC_FILE);
  },

  saveSnapshot(snapshot: SyncSnapshot): void {
    writeJson(SYNC_FILE, snapshot);
  },

  getDevices(): DeviceRecord[] {
    return readJson<DeviceRecord[]>(DEVICES_FILE) || [];
  },

  registerDevice(device: DeviceRecord): void {
    const devices = syncStore.getDevices();
    const idx = devices.findIndex((d) => d.id === device.id);
    if (idx >= 0) {
      devices[idx] = { ...devices[idx], ...device, lastSeen: new Date().toISOString() };
    } else {
      devices.push({ ...device, lastSeen: new Date().toISOString() });
    }
    writeJson(DEVICES_FILE, devices);
  },

  updateDeviceSync(deviceId: string): void {
    const devices = syncStore.getDevices();
    const device = devices.find((d) => d.id === deviceId);
    if (device) {
      device.lastSyncAt = new Date().toISOString();
      device.lastSeen = new Date().toISOString();
      writeJson(DEVICES_FILE, devices);
    }
  },
};