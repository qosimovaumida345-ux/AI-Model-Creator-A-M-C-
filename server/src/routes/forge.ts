import { Router, type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  forgedModelStore,
  trainingJobStore,
  datasetStore,
  type StoredTrainingJob,
} from '../db/forgeStore.js';
import {
  createTraining,
  getTrainingStatus,
  cancelTraining,
  parseTrainingLogs,
  isModelTrainable,
  getTrainableModels,
  createDataUrl,
} from '../services/replicate.js';

export const forgeRouter = Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = datasetStore.getUploadDir();
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['.jsonl', '.csv', '.txt', '.json', '.parquet'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format: ${ext}. Use JSONL, CSV, TXT, or JSON.`));
    }
  },
});

// ── Upload dataset ───────────────────────────────────────────
forgeRouter.post('/datasets/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '') as string;

    let sampleCount = 0;
    if (ext === 'jsonl' || ext === 'json') {
      sampleCount = content.split('\n').filter((l) => l.trim()).length;
    } else if (ext === 'csv') {
      sampleCount = Math.max(0, content.split('\n').filter((l) => l.trim()).length - 1);
    } else if (ext === 'txt') {
      sampleCount = content.split(/\n\s*\n/).filter((s) => s.trim()).length;
    }

    const dataset = datasetStore.create({
      id: uuid(),
      name: req.file.originalname,
      fileName: req.file.filename,
      localPath: filePath,
      fileSize: req.file.size,
      format: ext,
      sampleCount,
      uploadedAt: new Date().toISOString(),
      replicateFileUrl: null,
    });

    res.json({ success: true, data: dataset });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    });
  }
});

// ── Create dataset from pasted text ──────────────────────────
forgeRouter.post('/datasets/paste', (req: Request, res: Response) => {
  try {
    const { content, name, format } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'No content provided' });
    }

    const fileName = `${uuid()}.${format || 'jsonl'}`;
    const filePath = path.join(datasetStore.getUploadDir(), fileName);
    fs.writeFileSync(filePath, content);

    let sampleCount = 0;
    if (format === 'jsonl') {
      sampleCount = content.split('\n').filter((l: string) => l.trim()).length;
    } else {
      sampleCount = content.split(/\n\s*\n/).filter((s: string) => s.trim()).length;
    }

    const dataset = datasetStore.create({
      id: uuid(),
      name: name || `Pasted data (${new Date().toLocaleDateString()})`,
      fileName,
      localPath: filePath,
      fileSize: Buffer.byteLength(content),
      format: format || 'jsonl',
      sampleCount,
      uploadedAt: new Date().toISOString(),
      replicateFileUrl: null,
    });

    res.json({ success: true, data: dataset });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save dataset',
    });
  }
});

// ── List datasets ────────────────────────────────────────────
forgeRouter.get('/datasets', (_, res) => {
  res.json({ success: true, data: datasetStore.getAll() });
});

// ── Delete dataset ───────────────────────────────────────────
forgeRouter.delete('/datasets/:id', (req, res) => {
  const ds = datasetStore.getById(req.params.id);
  if (ds?.localPath && fs.existsSync(ds.localPath)) {
    fs.unlinkSync(ds.localPath);
  }
  datasetStore.delete(req.params.id);
  res.json({ success: true });
});

// ── Get dataset preview ──────────────────────────────────────
forgeRouter.get('/datasets/:id/preview', (req, res) => {
  const ds = datasetStore.getById(req.params.id);
  if (!ds) return res.status(404).json({ success: false, error: 'Dataset not found' });

  try {
    const content = fs.readFileSync(ds.localPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim()).slice(0, 10);
    const samples = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { text: line };
      }
    });
    res.json({
      success: true,
      data: {
        samples,
        totalLines: content.split('\n').filter((l) => l.trim()).length,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to read dataset' });
  }
});

// ── Models ───────────────────────────────────────────────────
forgeRouter.get('/models', (_, res) => {
  res.json({ success: true, data: forgedModelStore.getAll() });
});

forgeRouter.get('/models/:id', (req, res) => {
  const model = forgedModelStore.getById(req.params.id);
  if (!model) return res.status(404).json({ success: false, error: 'Model not found' });
  res.json({ success: true, data: model });
});

forgeRouter.delete('/models/:id', (req, res) => {
  forgedModelStore.delete(req.params.id);
  res.json({ success: true });
});

forgeRouter.patch('/models/:id', (req, res) => {
  const updated = forgedModelStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Model not found' });
  res.json({ success: true, data: updated });
});

forgeRouter.get('/trainable-models', (_, res) => {
  res.json({ success: true, data: getTrainableModels() });
});

// ── Start training ───────────────────────────────────────────
forgeRouter.post('/train', async (req: Request, res: Response) => {
  try {
    const { baseModelId, baseModelName, datasetId, config, modelName, systemPrompt, description, avatar } = req.body;

    if (!baseModelId || !datasetId || !config || !modelName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const dataset = datasetStore.getById(datasetId);
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }

    const hasReplicateKey = !!process.env.REPLICATE_API_TOKEN;
    const trainable = isModelTrainable(baseModelId);

    const modelId = uuid();
    const jobId = uuid();

    const forgedModel = forgedModelStore.create({
      id: modelId,
      name: modelName,
      baseModelId,
      baseModelName: baseModelName || baseModelId,
      avatar: avatar || '',
      systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
      description: description || `Fine-tuned ${baseModelName} model`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trainingJobId: jobId,
      trainingStatus: 'preparing',
      localPath: null,
      huggingFaceRepo: null,
      replicateModelUrl: null,
      format: 'safetensors',
      quantization: null,
      fileSize: null,
      downloadUrl: null,
      isDownloaded: false,
      config,
      metrics: null,
    });

    const trainingJob: StoredTrainingJob = {
      id: jobId,
      forgedModelId: modelId,
      status: 'preparing',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: config.epochs || 3,
      currentStep: 0,
      totalSteps: 0,
      loss: 0,
      learningRate: config.learningRate || 2e-4,
      elapsed: 0,
      estimatedRemaining: 0,
      lossHistory: [],
      lrHistory: [],
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Training job created' }],
      error: null,
      startedAt: null,
      completedAt: null,
      gpuProvider: hasReplicateKey && trainable ? 'replicate' : 'local',
      gpuType: null,
      replicateTrainingId: null,
      datasetId,
      lastParsedLogIndex: 0,
    };

    trainingJobStore.create(trainingJob);

    if (hasReplicateKey && trainable) {
      startReplicateTraining(jobId, modelId, baseModelId, dataset, config, modelName).catch(async (err) => {
        const message = err instanceof Error ? err.message : 'Replicate training failed';
        const currentJob = trainingJobStore.getById(jobId);

        trainingJobStore.update(jobId, {
          status: 'training',
          gpuProvider: 'local',
          gpuType: 'Local CPU (fallback)',
          error: null,
          logs: [
            ...(currentJob?.logs || []),
            {
              timestamp: new Date().toISOString(),
              level: 'warning',
              message: `${message} Falling back to simulated local training.`,
            },
          ],
        });

        forgedModelStore.update(modelId, { trainingStatus: 'training' });

        await startSimulatedTraining(jobId, modelId, config);
      });
    } else {
      startSimulatedTraining(jobId, modelId, config).catch(console.error);
    }

    res.json({ success: true, data: { model: forgedModel, job: trainingJob } });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start training',
    });
  }
});

// ── Get training job status ──────────────────────────────────
forgeRouter.get('/training/:jobId', (req, res) => {
  const job = trainingJobStore.getById(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Training job not found' });
  res.json({ success: true, data: job });
});

// ── SSE endpoint ─────────────────────────────────────────────
forgeRouter.get('/training/:jobId/events', async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const job = trainingJobStore.getById(jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Training job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let closed = false;
  req.on('close', () => { closed = true; });

  const pollInterval = setInterval(async () => {
    if (closed) {
      clearInterval(pollInterval);
      return;
    }

    const currentJob = trainingJobStore.getById(jobId);
    if (!currentJob) {
      sendEvent({ type: 'error', error: 'Job not found' });
      sendEvent({ type: 'done' });
      clearInterval(pollInterval);
      res.end();
      return;
    }

    if (currentJob.gpuProvider === 'replicate' && currentJob.replicateTrainingId) {
      try {
        const status = await getTrainingStatus(currentJob.replicateTrainingId);
        const { metrics, newIndex } = parseTrainingLogs(status.logs || '', currentJob.lastParsedLogIndex);

        const now = Date.now();
        const newLossPoints = metrics.steps.map((s) => ({
          step: s.step, value: s.loss, epoch: s.epoch, timestamp: now,
        }));
        const newLrPoints = metrics.steps.map((s) => ({
          step: s.step, value: s.learningRate, epoch: s.epoch, timestamp: now,
        }));

        const statusMap: Record<string, string> = {
          starting: 'queued',
          processing: 'training',
          succeeded: 'completed',
          failed: 'failed',
          canceled: 'cancelled',
        };

        const startTime = currentJob.startedAt ? new Date(currentJob.startedAt).getTime() : now;
        const elapsed = (now - startTime) / 1000;

        const update: Partial<StoredTrainingJob> = {
          status: statusMap[status.status] || status.status,
          currentStep: metrics.currentStep,
          totalSteps: metrics.totalSteps || currentJob.totalSteps,
          currentEpoch: Math.floor(metrics.currentEpoch),
          loss: metrics.currentLoss,
          learningRate: metrics.currentLr,
          progress: metrics.totalSteps > 0
            ? Math.round((metrics.currentStep / metrics.totalSteps) * 100)
            : 0,
          lossHistory: [...currentJob.lossHistory, ...newLossPoints],
          lrHistory: [...currentJob.lrHistory, ...newLrPoints],
          elapsed,
          lastParsedLogIndex: newIndex,
          startedAt: currentJob.startedAt || (status.started_at || null),
        };

        if (status.status === 'succeeded') {
          update.completedAt = status.completed_at || new Date().toISOString();
          update.progress = 100;

          forgedModelStore.update(currentJob.forgedModelId, {
            trainingStatus: 'completed',
            replicateModelUrl: status.output ? JSON.stringify(status.output) : null,
            downloadUrl: typeof status.output === 'object' && status.output
              ? (status.output as Record<string, string>).weights || null
              : null,
            metrics: {
              finalLoss: metrics.currentLoss,
              bestLoss: Math.min(...currentJob.lossHistory.map((p) => p.value), metrics.currentLoss || 999),
              totalSteps: metrics.currentStep,
              totalEpochs: currentJob.totalEpochs,
              trainingDuration: elapsed,
            },
          });
        } else if (status.status === 'failed') {
          update.error = status.error || 'Training failed on Replicate';
          forgedModelStore.update(currentJob.forgedModelId, { trainingStatus: 'failed' });
        }

        trainingJobStore.update(jobId, update);

        sendEvent({
          type: 'update',
          ...update,
          lossHistory: [...currentJob.lossHistory, ...newLossPoints],
          lrHistory: [...currentJob.lrHistory, ...newLrPoints],
        });

        if (['succeeded', 'failed', 'canceled'].includes(status.status)) {
          sendEvent({ type: 'done', status: statusMap[status.status] });
          clearInterval(pollInterval);
          res.end();
        }
      } catch (err: unknown) {
        sendEvent({ type: 'log', level: 'warning', message: `Poll error: ${err instanceof Error ? err.message : 'unknown'}` });
      }
    } else {
      sendEvent({ type: 'update', ...currentJob });

      if (['completed', 'failed', 'cancelled'].includes(currentJob.status)) {
        sendEvent({ type: 'done', status: currentJob.status });
        clearInterval(pollInterval);
        res.end();
      }
    }
  }, 2000);
});

// ── Cancel training ──────────────────────────────────────────
forgeRouter.post('/training/:jobId/cancel', async (req, res) => {
  const job = trainingJobStore.getById(req.params.jobId);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

  if (job.replicateTrainingId) {
    try {
      await cancelTraining(job.replicateTrainingId);
    } catch {
      /* best effort */
    }
  }

  trainingJobStore.update(req.params.jobId, {
    status: 'cancelled',
    completedAt: new Date().toISOString(),
  });
  forgedModelStore.update(job.forgedModelId, { trainingStatus: 'cancelled' });

  res.json({ success: true });
});

// ── List all training jobs ───────────────────────────────────
forgeRouter.get('/training', (_, res) => {
  res.json({ success: true, data: trainingJobStore.getAll() });
});

async function startReplicateTraining(
  jobId: string,
  modelId: string,
  baseModelId: string,
  dataset: { localPath: string; format: string },
  config: Record<string, unknown>,
  modelName: string
) {
  trainingJobStore.update(jobId, {
    status: 'uploading-data',
    logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Preparing dataset for upload...' }],
  });

  let content = fs.readFileSync(dataset.localPath, 'utf-8');
  if (dataset.format === 'txt') {
    const chunks = content.split(/\n\s*\n/).filter((s) => s.trim());
    content = chunks.map((chunk) => JSON.stringify({ text: chunk.trim() })).join('\n');
  } else if (dataset.format === 'csv') {
    const lines = content.split('\n').filter((l) => l.trim());
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    content = lines.slice(1).map((line) => {
      const vals = line.split(',');
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/"/g, ''); });
      return JSON.stringify(obj);
    }).join('\n');
  }

  const dataUrl = createDataUrl(content);

  trainingJobStore.update(jobId, {
    status: 'queued',
    startedAt: new Date().toISOString(),
    logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Starting training on Replicate...' }],
  });

  const training = await createTraining({
    modelId: baseModelId,
    datasetUrl: dataUrl,
    destinationName: modelName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
    config: config as any,
  });

  trainingJobStore.update(jobId, {
    status: 'training',
    replicateTrainingId: training.id,
    gpuType: 'Replicate Cloud GPU',
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: `Training started: ${training.id}` },
      { timestamp: new Date().toISOString(), level: 'info', message: `Replicate status: ${training.status}` },
    ],
  });

  forgedModelStore.update(modelId, { trainingStatus: 'training' });
}

async function startSimulatedTraining(
  jobId: string,
  modelId: string,
  config: Record<string, unknown>
) {
  const epochs = (config.epochs as number) || 3;
  const totalSteps = epochs * 50;
  let currentStep = 0;
  let loss = 3.5 + Math.random() * 0.5;
  const lr = (config.learningRate as number) || 2e-4;

  trainingJobStore.update(jobId, {
    status: 'training',
    startedAt: new Date().toISOString(),
    totalSteps,
    gpuProvider: 'local',
    gpuType: 'Local CPU (simulated)',
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Starting simulated local training...' },
      { timestamp: new Date().toISOString(), level: 'warning', message: 'Using local simulated training mode.' },
    ],
  });

  forgedModelStore.update(modelId, { trainingStatus: 'training' });

  const stepInterval = setInterval(() => {
    currentStep++;
    const epoch = Math.floor(currentStep / 50);
    const progress = Math.round((currentStep / totalSteps) * 100);

    loss = loss * 0.985 + (Math.random() - 0.5) * 0.05;
    loss = Math.max(0.1, loss);

    const currentLr = lr * 0.5 * (1 + Math.cos(Math.PI * currentStep / totalSteps));

    const now = Date.now();
    const job = trainingJobStore.getById(jobId);
    if (!job) {
      clearInterval(stepInterval);
      return;
    }

    if (job.status === 'cancelled') {
      clearInterval(stepInterval);
      return;
    }

    const update: Partial<StoredTrainingJob> = {
      status: 'training',
      currentStep,
      progress,
      currentEpoch: epoch,
      loss,
      learningRate: currentLr,
      elapsed: currentStep * 0.4,
      estimatedRemaining: (totalSteps - currentStep) * 0.4,
      lossHistory: [...job.lossHistory, { step: currentStep, value: loss, epoch, timestamp: now }],
      lrHistory: [...job.lrHistory, { step: currentStep, value: currentLr, epoch, timestamp: now }],
    };

    if (currentStep % 10 === 0) {
      update.logs = [
        ...job.logs,
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Step ${currentStep}/${totalSteps} | Epoch ${epoch + 1}/${epochs} | Loss: ${loss.toFixed(4)} | LR: ${currentLr.toExponential(2)}`,
        },
      ];
    }

    trainingJobStore.update(jobId, update);

    if (currentStep >= totalSteps) {
      clearInterval(stepInterval);

      const finalLoss = loss;
      const bestLoss = Math.min(...job.lossHistory.map((p) => p.value), finalLoss);

      trainingJobStore.update(jobId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        logs: [
          ...(update.logs || job.logs),
          { timestamp: new Date().toISOString(), level: 'info', message: `Training completed! Final loss: ${finalLoss.toFixed(4)}` },
        ],
      });

      forgedModelStore.update(modelId, {
        trainingStatus: 'completed',
        metrics: {
          finalLoss,
          bestLoss,
          totalSteps,
          totalEpochs: epochs,
          trainingDuration: totalSteps * 0.4,
        },
      });
    }
  }, 400);
}