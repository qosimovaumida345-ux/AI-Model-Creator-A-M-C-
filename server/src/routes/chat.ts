import { Router, type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import { streamChatCompletion, chatCompletion } from '../services/openrouter.js';
import { streamOllamaChat, checkOllamaHealth, listOllamaModels } from '../services/ollama.js';
import { sessionStore } from '../db/store.js';

export const chatRouter = Router();

// ── List sessions ────────────────────────────────────────────
chatRouter.get('/sessions', (_, res) => {
  res.json({ success: true, data: sessionStore.getAll() });
});

// ── Get session by ID ────────────────────────────────────────
chatRouter.get('/sessions/:id', (req, res) => {
  const session = sessionStore.getById(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: session });
});

// ── Create session ───────────────────────────────────────────
chatRouter.post('/sessions', (req, res) => {
  const { modelId, modelName, settings, isForgedModel } = req.body;
  const session = sessionStore.create({
    id: uuid(),
    modelId: modelId || 'gpt-35-turbo',
    modelName: modelName || 'GPT-3.5 Turbo',
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: settings || {},
    isForgedModel: isForgedModel || false,
  });
  res.json({ success: true, data: session });
});

// ── Update session ───────────────────────────────────────────
chatRouter.patch('/sessions/:id', (req, res) => {
  const updated = sessionStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: updated });
});

// ── Delete session ───────────────────────────────────────────
chatRouter.delete('/sessions/:id', (req, res) => {
  const deleted = sessionStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true });
});

// ── Check Ollama status ──────────────────────────────────────
chatRouter.get('/ollama/status', async (_, res) => {
  const healthy = await checkOllamaHealth();
  const models = healthy ? await listOllamaModels() : [];
  res.json({ success: true, data: { available: healthy, models } });
});

// ── Stream Chat Completion (main endpoint) ───────────────────
chatRouter.post('/completions', async (req: Request, res: Response) => {
  const {
    model,
    messages,
    temperature,
    top_p,
    max_tokens,
    frequency_penalty,
    presence_penalty,
    stop,
    stream = true,
    sessionId,
    provider = 'openrouter', // 'openrouter' | 'ollama'
  } = req.body;

  // Get API key from request header or env
  const apiKey =
    req.headers['x-openrouter-key'] as string ||
    process.env.OPENROUTER_API_KEY ||
    '';

  if (provider === 'openrouter' && !apiKey) {
    return res.status(400).json({
      success: false,
      error: 'No OpenRouter API key. Set OPENROUTER_API_KEY in .env or provide via settings.',
    });
  }

  // Save user message to session if sessionId provided
  if (sessionId && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'user') {
      sessionStore.addMessage(sessionId, {
        id: uuid(),
        role: 'user',
        content: lastMsg.content,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ── Streaming response ─────────────────────────────────────
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const onChunk = (text: string) => {
      const payload = JSON.stringify({ choices: [{ delta: { content: text } }] });
      res.write(`data: ${payload}\n\n`);
    };

    const onDone = (fullText: string, usage?: Record<string, number>) => {
      // Save assistant message
      if (sessionId) {
        sessionStore.addMessage(sessionId, {
          id: uuid(),
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
          tokens: usage?.completion_tokens,
          model,
        });
      }
      if (usage) {
        res.write(`data: ${JSON.stringify({ usage })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    };

    const onError = (error: string) => {
      const errPayload = JSON.stringify({ error });
      res.write(`data: ${errPayload}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    };

    if (provider === 'ollama') {
      await streamOllamaChat(
        {
          model,
          messages,
          options: { temperature, top_p, num_predict: max_tokens, repeat_penalty: presence_penalty },
          stream: true,
        },
        onChunk,
        onDone,
        onError
      );
    } else {
      await streamChatCompletion(
        apiKey,
        { model, messages, temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stop },
        onChunk,
        onDone,
        onError
      );
    }
    return;
  }

  // ── Non-streaming response ─────────────────────────────────
  try {
    if (provider === 'ollama') {
      let fullText = '';
      await streamOllamaChat(
        { model, messages, options: { temperature, top_p, num_predict: max_tokens }, stream: false },
        (chunk) => { fullText += chunk; },
        () => {},
        (err) => { throw new Error(err); }
      );

      if (sessionId) {
        sessionStore.addMessage(sessionId, {
          id: uuid(),
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
          model,
        });
      }

      return res.json({
        success: true,
        data: {
          choices: [{ message: { role: 'assistant', content: fullText } }],
        },
      });
    }

    const result = await chatCompletion(apiKey, {
      model, messages, temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stop,
    });

    if (sessionId) {
      sessionStore.addMessage(sessionId, {
        id: uuid(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
        tokens: result.usage?.completion_tokens,
        model,
      });
    }

    res.json({
      success: true,
      data: {
        choices: [{ message: { role: 'assistant', content: result.content } }],
        usage: result.usage,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});