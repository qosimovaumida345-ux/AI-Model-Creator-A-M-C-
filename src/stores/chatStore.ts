import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { ChatSession, ChatMessage, ChatSettings } from '@/types';
import { DEFAULT_CHAT_SETTINGS } from '@/types';
import * as api from '@/services/api';
import { useSettingsStore } from './settingsStore';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  abortController: AbortController | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (modelId: string, modelName: string, isForged?: boolean) => Promise<string>;
  setActiveSession: (id: string | null) => void;
  deleteSession: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
  getActiveSession: () => ChatSession | undefined;
  updateSessionSettings: (sessionId: string, settings: Partial<ChatSettings>) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  error: null,
  abortController: null,

  loadSessions: async () => {
    try {
      const sessions = await api.fetchSessions();
      set({ sessions });
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  },

  createSession: async (modelId, modelName, isForged = false) => {
    try {
      const session = await api.createSession({
        modelId,
        modelName,
        isForgedModel: isForged,
        settings: DEFAULT_CHAT_SETTINGS,
      });
      set((s) => ({
        sessions: [session, ...s.sessions],
        activeSessionId: session.id,
      }));
      return session.id;
    } catch (err) {
      console.error('Failed to create session:', err);
      // Create local-only session as fallback
      const localSession: ChatSession = {
        id: uuid(),
        modelId,
        modelName,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: DEFAULT_CHAT_SETTINGS,
        isForgedModel: isForged,
      };
      set((s) => ({
        sessions: [localSession, ...s.sessions],
        activeSessionId: localSession.id,
      }));
      return localSession.id;
    }
  },

  setActiveSession: (id) => set({ activeSessionId: id, error: null, streamingContent: '' }),

  deleteSession: async (id) => {
    try {
      await api.deleteSession(id);
    } catch {
      /* continue even if server delete fails */
    }
    set((s) => ({
      sessions: s.sessions.filter((sess) => sess.id !== id),
      activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
    }));
  },

  sendMessage: async (content: string) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === state.activeSessionId);
    if (!session) return;

    const settingsStore = useSettingsStore.getState();
    const provider = settingsStore.getEffectiveProvider();
    const apiKey = settingsStore.settings.inference.openRouterApiKey || undefined;

    // Add user message to local state immediately
    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...session.messages, userMessage];
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === session.id
          ? {
              ...sess,
              messages: updatedMessages,
              title: sess.messages.length === 0
                ? content.slice(0, 80) + (content.length > 80 ? '...' : '')
                : sess.title,
              updatedAt: new Date().toISOString(),
            }
          : sess
      ),
      isStreaming: true,
      streamingContent: '',
      error: null,
    }));

    // Build messages array for API (include system prompt)
    const apiMessages: Array<{ role: string; content: string }> = [];
    if (session.settings.systemPrompt) {
      apiMessages.push({ role: 'system', content: session.settings.systemPrompt });
    }
    for (const msg of updatedMessages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    const abortController = new AbortController();
    set({ abortController });

    const startTime = Date.now();
    let fullContent = '';

    await api.streamChat(
      {
        model: session.modelId,
        messages: apiMessages,
        temperature: session.settings.temperature,
        topP: session.settings.topP,
        maxTokens: session.settings.maxTokens,
        frequencyPenalty: session.settings.frequencyPenalty,
        presencePenalty: session.settings.presencePenalty,
        stop: session.settings.stop,
        stream: true,
        sessionId: session.id,
        provider,
        apiKey: apiKey || undefined,
      },
      // onChunk
      (chunk: string) => {
        fullContent += chunk;
        set({ streamingContent: fullContent });
      },
      // onDone
      () => {
        const assistantMessage: ChatMessage = {
          id: uuid(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date().toISOString(),
          generationTime: Date.now() - startTime,
          model: session.modelId,
        };

        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === session.id
              ? {
                  ...sess,
                  messages: [...updatedMessages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : sess
          ),
          isStreaming: false,
          streamingContent: '',
          abortController: null,
        }));
      },
      // onError
      (error: string) => {
        const errMessage: ChatMessage = {
          id: uuid(),
          role: 'assistant',
          content: `Error: ${error}`,
          timestamp: new Date().toISOString(),
          error: true,
          model: session.modelId,
        };

        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === session.id
              ? {
                  ...sess,
                  messages: [...updatedMessages, errMessage],
                  updatedAt: new Date().toISOString(),
                }
              : sess
          ),
          isStreaming: false,
          streamingContent: '',
          error,
          abortController: null,
        }));
      },
      abortController.signal
    );
  },

  stopStreaming: () => {
    const { abortController, streamingContent, activeSessionId, sessions } = get();
    if (abortController) {
      abortController.abort();
    }

    // Save whatever was streamed so far
    if (streamingContent && activeSessionId) {
      const partialMessage: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: streamingContent + '\n\n*(generation stopped)*',
        timestamp: new Date().toISOString(),
        model: sessions.find((s) => s.id === activeSessionId)?.modelId,
      };

      set((s) => ({
        sessions: s.sessions.map((sess) =>
          sess.id === activeSessionId
            ? { ...sess, messages: [...sess.messages, partialMessage] }
            : sess
        ),
        isStreaming: false,
        streamingContent: '',
        abortController: null,
      }));
    } else {
      set({ isStreaming: false, streamingContent: '', abortController: null });
    }
  },

  clearError: () => set({ error: null }),

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId);
  },

  updateSessionSettings: (sessionId, settings) => {
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? { ...sess, settings: { ...sess.settings, ...settings } }
          : sess
      ),
    }));
  },
}));