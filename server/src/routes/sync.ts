import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import { syncStore, type SyncSnapshot, type DeviceRecord } from '../db/syncStore.js';
import { forgedModelStore } from '../db/forgeStore.js';
import { sessionStore } from '../db/store.js';

export const syncRouter = Router();

// ── Register device ──────────────────────────────────────────
syncRouter.post('/devices/register', (req: Request, res: Response) => {
  const { deviceId, deviceName, platform } = req.body;

  if (!deviceId) {
    return res.status(400).json({ success: false, error: 'deviceId required' });
  }

  const device: DeviceRecord = {
    id: deviceId,
    name: deviceName || `Device-${deviceId.slice(0, 6)}`,
    platform: platform || 'unknown',
    lastSeen: new Date().toISOString(),
    lastSyncAt: null,
  };

  syncStore.registerDevice(device);

  res.json({ success: true, data: device });
});

// ── List devices ─────────────────────────────────────────────
syncRouter.get('/devices', (_, res) => {
  res.json({ success: true, data: syncStore.getDevices() });
});

// ── Push sync (device → server) ──────────────────────────────
syncRouter.post('/push', (req: Request, res: Response) => {
  try {
    const { deviceId, deviceName, forgedModels, chatSessions, settings } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId required' });
    }

    // Compute checksum from payload
    const payloadStr = JSON.stringify({ forgedModels, chatSessions, settings });
    const checksum = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 16);

    const snapshot: SyncSnapshot = {
      id: crypto.randomUUID(),
      deviceId,
      deviceName: deviceName || 'Unknown',
      timestamp: new Date().toISOString(),
      forgedModels: forgedModels || [],
      chatSessions: chatSessions || [],
      settings: settings || {},
      checksum,
    };

    syncStore.saveSnapshot(snapshot);
    syncStore.updateDeviceSync(deviceId);

    // Also merge forged models into server store
    if (Array.isArray(forgedModels)) {
      for (const model of forgedModels) {
        const existing = forgedModelStore.getById(model.id);
        if (!existing) {
          forgedModelStore.create(model);
        } else {
          // Update if incoming is newer
          if (new Date(model.updatedAt) > new Date(existing.updatedAt)) {
            forgedModelStore.update(model.id, model);
          }
        }
      }
    }

    // Merge chat sessions
    if (Array.isArray(chatSessions)) {
      for (const session of chatSessions) {
        const existing = sessionStore.getById(session.id);
        if (!existing) {
          sessionStore.create(session);
        } else if (new Date(session.updatedAt) > new Date(existing.updatedAt)) {
          sessionStore.update(session.id, session);
        }
      }
    }

    res.json({
      success: true,
      data: {
        snapshotId: snapshot.id,
        checksum,
        timestamp: snapshot.timestamp,
        mergedModels: (forgedModels || []).length,
        mergedSessions: (chatSessions || []).length,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Sync push failed',
    });
  }
});

// ── Pull sync (server → device) ──────────────────────────────
syncRouter.post('/pull', (req: Request, res: Response) => {
  try {
    const { deviceId, lastChecksum } = req.body;

    const snapshot = syncStore.getLatestSnapshot();

    // No snapshot exists yet
    if (!snapshot) {
      return res.json({
        success: true,
        data: {
          hasChanges: false,
          forgedModels: forgedModelStore.getAll(),
          chatSessions: sessionStore.getAll(),
          settings: {},
          checksum: null,
          timestamp: null,
        },
      });
    }

    const hasChanges = snapshot.checksum !== lastChecksum;

    if (deviceId) {
      syncStore.updateDeviceSync(deviceId);
    }

    res.json({
      success: true,
      data: {
        hasChanges,
        forgedModels: forgedModelStore.getAll(),
        chatSessions: sessionStore.getAll(),
        settings: snapshot.settings,
        checksum: snapshot.checksum,
        timestamp: snapshot.timestamp,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Sync pull failed',
    });
  }
});

// ── Get sync status ──────────────────────────────────────────
syncRouter.get('/status', (_, res) => {
  const snapshot = syncStore.getLatestSnapshot();
  const devices = syncStore.getDevices();

  res.json({
    success: true,
    data: {
      lastSync: snapshot?.timestamp || null,
      checksum: snapshot?.checksum || null,
      deviceCount: devices.length,
      devices,
    },
  });
});