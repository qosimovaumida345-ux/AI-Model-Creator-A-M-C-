import { Router, type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import { streamChatCompletion, chatCompletion } from '../services/openrouter.js';
import { streamOllamaChat, checkOllamaHealth, listOllamaModels } from '../services/ollama.js';
import { sessionStore } from '../db/store.js';
import { forgedModelStore } from '../db/forgeStore.js';

// Free provider imports — har biri xavfsiz try/catch bilan
let isGroqAvailable: () => boolean = () => false;
let getGroqModelId: (id: string) => string | null = () => null;
let streamGroqChat: any = null;

let isCloudflareAvailable: () => boolean = () => false;
let getCloudflareModelId: (id: string) => string | null = () => null;
let streamCloudflareChat: any = null;
let chatCloudflare: any = null;

let streamGoogleChat: any = null;
let getGoogleModelId: (id: string) => string = () => 'gemini-2.0-flash';

// Xavfsiz import — agar fayl mavjud bo'lmasa xato bermaydi
try {
  const groq = await import('../services/groq.js');
  isGroqAvailable = groq.isGroqAvailable;
  getGroqModelId = groq.getGroqModelId;
  streamGroqChat = groq.streamGroqChat;
} catch { }

try {
  const cf = await import('../services/cloudflare.js');
  isCloudflareAvailable = cf.isCloudflareAvailable;
  getCloudflareModelId = cf.getCloudflareModelId;
  streamCloudflareChat = cf.streamCloudflareChat;
  chatCloudflare = cf.chatCloudflare;
} catch { }

try {
  const google = await import('../services/google.js');
  streamGoogleChat = google.streamGoogleChat;
  getGoogleModelId = google.getGoogleModelId;
} catch { }

export const chatRouter = Router();

// ── Gemini model IDs ─────────────────────────────────────────
const GEMINI_MODELS = new Set([
  'gemini-20-flash', 'gemini-15-pro', 'gemini-15-flash', 'gemini-ultra',
]);

// ── Helper: resolve model ID ─────────────────────────────────
function resolveModelId(modelId: string): { actualModelId: string; systemPrompt: string | null } {
  const forgedModel = forgedModelStore.getById(modelId);
  if (forgedModel) {
    return {
      actualModelId: forgedModel.baseModelId,
      systemPrompt: forgedModel.systemPrompt || null,
    };
  }
  return { actualModelId: modelId, systemPrompt: null };
}

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
    provider = 'openrouter',
  } = req.body;

  // Resolve forged model UUID to real model ID
  const { actualModelId, systemPrompt: forgedSystemPrompt } = resolveModelId(model);

  // If this is a forged model, prepend its system prompt
  let finalMessages = [...messages];
  if (forgedSystemPrompt) {
    const hasSystem = finalMessages.some((m: { role: string }) => m.role === 'system');
    if (!hasSystem) {
      finalMessages = [
        { role: 'system', content: forgedSystemPrompt },
        ...finalMessages,
      ];
    }
  }

  // Block Ollama in production
  if (provider === 'ollama' && process.env.NODE_ENV === 'production') {
    return res.status(400).json({
      success: false,
      error: 'Offline (Ollama) mode is only available when running the app locally.',
    });
  }

  // Get API key from request header or env
  const apiKey =
    req.headers['x-openrouter-key'] as string ||
    process.env.OPENROUTER_API_KEY ||
    '';

  // Save user message to session
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
      if (sessionId) {
        sessionStore.addMessage(sessionId, {
          id: uuid(),
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
          tokens: usage?.completion_tokens,
          model: actualModelId,
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

    // ── Ollama (local only) ──────────────────────────────────
    if (provider === 'ollama') {
      await streamOllamaChat(
        {
          model: actualModelId,
          messages: finalMessages,
          options: { temperature, top_p, num_predict: max_tokens, repeat_penalty: presence_penalty },
          stream: true,
        },
        onChunk,
        onDone,
        onError
      );
      return;
    }

    // ══════════════════════════════════════════════════════════
    // SMART FREE PROVIDER ROUTING
    // Bepul providerlarni birinchi sinaydi
    // ══════════════════════════════════════════════════════════

    if (streamGroqChat && isGroqAvailable()) {
      const groqModel = await getGroqModelId(actualModelId);
      if (groqModel) {
        try {
          await streamGroqChat(groqModel, finalMessages, onChunk, onDone, onError);
          return;
        } catch { }
      }
    }

    // 2. Groq (BEPUL, TEZKOR)
    if (streamGroqChat && isGroqAvailable()) {
      const groqModel = getGroqModelId(actualModelId);
      if (groqModel) {
        try {
          await streamGroqChat(groqModel, finalMessages, onChunk, onDone, onError);
          return;
        } catch {
          // Keyingi providerga o'tadi
        }
      }
    }

    // 3. Cloudflare Workers AI (BEPUL, kuniga 10K)
    if (streamCloudflareChat && isCloudflareAvailable()) {
      const cfModel = getCloudflareModelId(actualModelId);
      if (cfModel) {
        try {
          await streamCloudflareChat(cfModel, finalMessages, onChunk, onDone, onError);
          return;
        } catch {
          // OpenRouter ga o'tadi
        }
      }
    }

    // 4. Hech qanday key yo'q bo'lsa — Cloudflare default model
    if (!apiKey) {
      if (streamCloudflareChat && isCloudflareAvailable()) {
        try {
          await streamCloudflareChat('@cf/meta/llama-3.1-8b-instruct', finalMessages, onChunk, onDone, onError);
          return;
        } catch {
          onError('API key yo\'q. Settings da OpenRouter API key kiriting yoki Cloudflare/Groq/Google AI sozlang.');
          return;
        }
      }
      onError('API key yo\'q. OPENROUTER_API_KEY environment variable ga kiriting yoki Settings orqali bering.');
      return;
    }

    // 5. OpenRouter (bepul modellar birinchi, keyin pullik)
    await streamChatCompletion(
      apiKey,
      {
        model: actualModelId,
        messages: finalMessages,
        temperature,
        top_p,
        max_tokens,
        frequency_penalty,
        presence_penalty,
        stop,
      },
      onChunk,
      onDone,
      onError
    );
    return;
  }

  // ── Non-streaming response ─────────────────────────────────
  try {
    if (provider === 'ollama') {
      let fullText = '';
      await streamOllamaChat(
        { model: actualModelId, messages: finalMessages, options: { temperature, top_p, num_predict: max_tokens }, stream: false },
        (chunk) => { fullText += chunk; },
        () => { },
        (err) => { throw new Error(err); }
      );

      if (sessionId) {
        sessionStore.addMessage(sessionId, {
          id: uuid(),
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString(),
          model: actualModelId,
        });
      }

      return res.json({
        success: true,
        data: {
          choices: [{ message: { role: 'assistant', content: fullText } }],
        },
      });
    }

    // Non-streaming: Cloudflare sinab ko'rish
    if (chatCloudflare && isCloudflareAvailable()) {
      const cfModel = getCloudflareModelId(actualModelId);
      if (cfModel) {
        try {
          const content = await chatCloudflare(cfModel, finalMessages);

          if (sessionId) {
            sessionStore.addMessage(sessionId, {
              id: uuid(),
              role: 'assistant',
              content,
              timestamp: new Date().toISOString(),
              model: actualModelId,
            });
          }

          return res.json({
            success: true,
            data: {
              choices: [{ message: { role: 'assistant', content } }],
            },
          });
        } catch {
          // OpenRouter ga o'tadi
        }
      }
    }

    // Non-streaming: OpenRouter
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key sozlanmagan.',
      });
    }

    const result = await chatCompletion(apiKey, {
      model: actualModelId,
      messages: finalMessages,
      temperature,
      top_p,
      max_tokens,
      frequency_penalty,
      presence_penalty,
      stop,
    });

    if (sessionId) {
      sessionStore.addMessage(sessionId, {
        id: uuid(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
        tokens: result.usage?.completion_tokens,
        model: actualModelId,
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