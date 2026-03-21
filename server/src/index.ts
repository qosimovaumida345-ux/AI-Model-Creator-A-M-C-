\import express from 'express';
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

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env'),
});

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost',
    'capacitor://localhost',
    'https://ai-model-creator-a-m-c.onrender.com',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '100mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _, next) => {
    if (!req.path.includes('/events') && !req.path.includes('/health')) {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  });
}

app.use('/api', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/forge', forgeRouter);
app.use('/api/install', installRouter);
app.use('/api/sync', syncRouter);
app.use('/api/export', exportRouter);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Model Creator API is running',
    health: '/api/health',
  });
});

app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.path}`,
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;