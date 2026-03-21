import { Router, type Request, type Response } from 'express';
import { forgedModelStore } from '../db/forgeStore.js';
import { sessionStore } from '../db/store.js';

export const exportRouter = Router();

// ── Export all data as JSON ──────────────────────────────────
exportRouter.get('/all', (_, res) => {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    forgedModels: forgedModelStore.getAll(),
    chatSessions: sessionStore.getAll(),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="modelforge-export-${Date.now()}.json"`);
  res.json(data);
});

// ── Import data from JSON ────────────────────────────────────
exportRouter.post('/import', (req: Request, res: Response) => {
  try {
    const { forgedModels, chatSessions } = req.body;

    let importedModels = 0;
    let importedSessions = 0;

    if (Array.isArray(forgedModels)) {
      for (const model of forgedModels) {
        if (model.id && model.name) {
          const existing = forgedModelStore.getById(model.id);
          if (!existing) {
            forgedModelStore.create(model);
            importedModels++;
          }
        }
      }
    }

    if (Array.isArray(chatSessions)) {
      for (const session of chatSessions) {
        if (session.id) {
          const existing = sessionStore.getById(session.id);
          if (!existing) {
            sessionStore.create(session);
            importedSessions++;
          }
        }
      }
    }

    res.json({
      success: true,
      data: { importedModels, importedSessions },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Import failed',
    });
  }
});

// ── Export single forged model ────────────────────────────────
exportRouter.get('/model/:id', (req, res) => {
  const model = forgedModelStore.getById(req.params.id);
  if (!model) return res.status(404).json({ success: false, error: 'Model not found' });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${model.name}-export.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    model,
  });
});