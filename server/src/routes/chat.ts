import { Router, type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import { streamChatCompletion, chatCompletion } from '../services/openrouter.js';
import { streamOllamaChat, checkOllamaHealth, listOllamaModels } from '../services/ollama.js';
import { sessionStore } from '../db/store.js';
import { forgedModelStore } from '../db/forgeStore.js';

// ── Provider imports ─────────────────────────────────────────
let isGroqAvailable: () => boolean = () => false;
let getGroqModelId: (id: string) => Promise<string> = async () => 'llama-3.3-70b-versatile';
let streamGroqChat: any = null;

let isCloudflareAvailable: () => boolean = () => false;
let resolveCFModel: (id: string) => Promise<string> = async () => '@cf/meta/llama-3.1-8b-instruct';
let streamCloudflareChat: any = null;
let chatCloudflare: any = null;

let streamGoogleChat: any = null;
let resolveGoogleModel: (id: string) => Promise<string> = async () => 'gemini-2.0-flash';

try {
  const groq = await import('../services/groq.js');
  isGroqAvailable = groq.isGroqAvailable;
  getGroqModelId = groq.getGroqModelId;
  streamGroqChat = groq.streamGroqChat;
} catch {}

try {
  const cf = await import('../services/cloudflare.js');
  isCloudflareAvailable = cf.isCloudflareAvailable;
  resolveCFModel = cf.resolveCFModel;
  streamCloudflareChat = cf.streamCloudflareChat;
  chatCloudflare = cf.chatCloudflare;
} catch {}

try {
  const google = await import('../services/google.js');
  streamGoogleChat = google.streamGoogleChat;
  resolveGoogleModel = google.resolveGoogleModel;
} catch {}

export const chatRouter = Router();

const GEMINI_MODELS = new Set([
  'gemini-20-flash', 'gemini-15-pro', 'gemini-15-flash', 'gemini-ultra',
  'gemini-20-pro', 'gemini-25-pro', 'gemini-25-flash',
]);

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

// ── Sessions ─────────────────────────────────────────────────
chatRouter.get('/sessions', (_, res) => {
  res.json({ success: true, data: sessionStore.getAll() });
});

chatRouter.get('/sessions/:id', (req, res) => {
  const session = sessionStore.getById(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: session });
});

chatRouter.post('/sessions', (req, res) => {
  const { modelId, modelName, settings, isForgedModel } = req.body;
  const session = sessionStore.create({
    id: uuid(),
    modelId: modelId || 'llama-32-3b',
    modelName: modelName || 'LLaMA 3.2 3B',
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: settings || {},
    isForgedModel: isForgedModel || false,
  });
  res.json({ success: true, data: session });
});

chatRouter.patch('/sessions/:id', (req, res) => {
  const updated = sessionStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: updated });
});

chatRouter.delete('/sessions/:id', (req, res) => {
  const deleted = sessionStore.delete(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true });
});

chatRouter.get('/ollama/status', async (_, res) => {
  const healthy = await checkOllamaHealth();
  const models = healthy ? await listOllamaModels() : [];
  res.json({ success: true, data: { available: healthy, models } });
});

// ── Main Chat Endpoint ────────────────────────────────────────
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
    provider = 'auto',
  } = req.body;

  const { actualModelId, systemPrompt: forgedSystemPrompt } = resolveModelId(model);

  let finalMessages = [...messages];
  if (forgedSystemPrompt) {
    const hasSystem = finalMessages.some((m: { role: string }) => m.role === 'system');
    if (!hasSystem) {
      finalMessages = [{ role: 'system', content: forgedSystemPrompt }, ...finalMessages];
    }
  }

  if (provider === 'ollama' && process.env.NODE_ENV === 'production') {
    return res.status(400).json({
      success: false,
      error: 'Offline (Ollama) mode is only available when running the app locally.',
    });
  }

  const apiKey =
    (req.headers['x-openrouter-key'] as string) ||
    process.env.OPENROUTER_API_KEY ||
    '';

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

  // ── Streaming ─────────────────────────────────────────────
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const onChunk = (text: string) => {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`);
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
      if (usage) res.write(`data: ${JSON.stringify({ usage })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    };

    const onError = (error: string) => {
      res.write(`data: ${JSON.stringify({ error })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    };

    // Ollama
    if (provider === 'ollama') {
      await streamOllamaChat(
        {
          model: actualModelId,
          messages: finalMessages,
          options: { temperature, top_p, num_predict: max_tokens, repeat_penalty: presence_penalty },
          stream: true,
        },
        onChunk, onDone, onError
      );
      return;
    }

    // ══════════════════════════════════════════════════════════
    // SMART AUTO ROUTING — Live model detection
    // ══════════════════════════════════════════════════════════

    // 1. Google AI (Gemini modellar uchun)
    if (
      streamGoogleChat &&
      process.env.GOOGLE_AI_API_KEY &&
      (GEMINI_MODELS.has(actualModelId) || provider === 'google')
    ) {
      try {
        const googleModel = await resolveGoogleModel(actualModelId);
        await streamGoogleChat(googleModel, finalMessages, onChunk, onDone, onError);
        return;
      } catch {
        // keyingi providerga
      }
    }

    // 2. Groq — live model detection bilan
    if (streamGroqChat && isGroqAvailable() && provider !== 'openrouter') {
      try {
        const groqModel = await getGroqModelId(actualModelId);
        await streamGroqChat(groqModel, finalMessages, onChunk, onDone, onError);
        return;
      } catch {
        // keyingi providerga
      }
    }

    // 3. Cloudflare — live model detection bilan
    if (streamCloudflareChat && isCloudflareAvailable() && provider !== 'openrouter') {
      try {
        const cfModel = await resolveCFModel(actualModelId);
        await streamCloudflareChat(cfModel, finalMessages, onChunk, onDone, onError);
        return;
      } catch {
        // keyingi providerga
      }
    }

    // 4. API key yo'q — bepul fallback
    if (!apiKey) {
      if (streamCloudflareChat && isCloudflareAvailable()) {
        try {
          await streamCloudflareChat('@cf/meta/llama-3.1-8b-instruct', finalMessages, onChunk, onDone, onError);
          return;
        } catch {}
      }
      if (streamGroqChat && isGroqAvailable()) {
        try {
          await streamGroqChat('llama-3.3-70b-versatile', finalMessages, onChunk, onDone, onError);
          return;
        } catch {}
      }
      onError('API key topilmadi. Settings da OpenRouter API key kiriting.');
      return;
    }

    // 5. OpenRouter — live model resolution bilan, bepul modellar birinchi
    await streamChatCompletion(
      apiKey,
      { model: actualModelId, messages: finalMessages, temperature, top_p, max_tokens, frequency_penalty, presence_penalty, stop },
      onChunk, onDone, onError
    );
    return;
  }

  // ── Non-streaming ─────────────────────────────────────────
  try {
    if (provider === 'ollama') {
      let fullText = '';
      await streamOllamaChat(
        { model: actualModelId, messages: finalMessages, options: { temperature, top_p, num_predict: max_tokens }, stream: false },
        (chunk) => { fullText += chunk; },
        () => {},
        (err) => { throw new Error(err); }
      );
      if (sessionId) {
        sessionStore.addMessage(sessionId, {
          id: uuid(), role: 'assistant', content: fullText,
          timestamp: new Date().toISOString(), model: actualModelId,
        });
      }
      return res.json({ success: true, data: { choices: [{ message: { role: 'assistant', content: fullText } }] } });
    }

    // Cloudflare non-streaming
    if (chatCloudflare && isCloudflareAvailable() && provider !== 'openrouter') {
      try {
        const cfModel = await resolveCFModel(actualModelId);
        const content = await chatCloudflare(cfModel, finalMessages);
        if (sessionId) {
          sessionStore.addMessage(sessionId, {
            id: uuid(), role: 'assistant', content,
            timestamp: new Date().toISOString(), model: actualModelId,
          });
        }
        return res.json({ success: true, data: { choices: [{ message: { role: 'assistant', content } }] } });
      } catch {}
    }

    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'API key sozlanmagan.' });
    }

    const result = await chatCompletion(apiKey, {
      model: actualModelId, messages: finalMessages, temperature,
      top_p, max_tokens, frequency_penalty, presence_penalty, stop,
    });

    if (sessionId) {
      sessionStore.addMessage(sessionId, {
        id: uuid(), role: 'assistant', content: result.content,
        timestamp: new Date().toISOString(), tokens: result.usage?.completion_tokens, model: actualModelId,
      });
    }

    res.json({ success: true, data: { choices: [{ message: { role: 'assistant', content: result.content } }], usage: result.usage } });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});