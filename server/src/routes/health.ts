import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      ollama: process.env.OLLAMA_HOST || 'http://localhost:11434',
    },
  });
});