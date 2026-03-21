import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health.js';
import { forgeRouter } from './routes/forge.js';
import { installRouter } from './routes/install.js';
import { syncRouter } from './routes/sync.js';
import { exportRouter } from './routes/export.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://modelforge.onrender.com',
    'capacitor://localhost',
    'http://localhost',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '100mb' }));

// ── Request logging in dev ───────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _, next) => {
    if (!req.path.includes('/events') && !req.path.includes('/health')) {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────
app.use('/api', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/forge', forgeRouter);
app.use('/api/install', installRouter);
app.use('/api/sync', syncRouter);
app.use('/api/export', exportRouter);

// ── API 404 handler ──────────────────────────────────────────
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.path}`,
  });
});

// ── Serve frontend in production ─────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(clientPath));
  app.get('*', (_, res) => res.sendFile(path.join(clientPath, 'index.html')));
}

// ── Global error handler ─────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║          AI MODEL FORGE  v1.0.0              ║
╠══════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}            ║
║  OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✓ configured' : '✗ not set  '}                  ║
║  Replicate:  ${process.env.REPLICATE_API_TOKEN ? '✓ configured' : '✗ not set  '}                  ║
║  HF Token:   ${process.env.HF_TOKEN ? '✓ configured' : '✗ not set  '}                  ║
║  Ollama:     ${(process.env.OLLAMA_HOST || 'http://localhost:11434').padEnd(30)}║
╚══════════════════════════════════════════════╝
`);
});

export default app;