import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { allModels } from '@/data/models';
import type { AIModel } from '@/types';
import ChatMessageBubble from './ChatMessageBubble';
import ChatInput from './ChatInput';
import ChatSettingsPanel from './ChatSettingsPanel';

type ORModel = {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
};

function isFree(or: ORModel): boolean {
  if (or.id.endsWith(':free')) return true;
  const p = parseFloat(or.pricing?.prompt ?? '1');
  const c = parseFloat(or.pricing?.completion ?? '1');
  return p === 0 && c === 0;
}

function orToAIModel(or: ORModel): AIModel {
  return {
    id: or.id,
    name: or.name || or.id.split('/').pop() || or.id,
    provider: or.id.split(':')[0].split('/')[0] || 'OpenRouter',
    category: 'text-generation',
    description: or.description || '',
    params: 'API',
    license: 'API',
    formats: ['api'],
    tasks: ['text-generation'],
    architecture: 'Transformer',
    contextLength: or.context_length ?? 4096,
    fineTunable: false,
    openSource: false,
    apiAvailable: true,
    freeOnOpenRouter: isFree(or),
    hardwareReq: 'API access',
    trainingData: 'Not disclosed',
    benchmarks: {},
    isVariant: false,
  };
}

export default function ChatInterface() {
  const {
    activeSessionId,
    sessions,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    stopStreaming,
    clearError,
    createSession,
    updateSessionSettings,
  } = useChatStore();

  const { hasApiKey } = useSettingsStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  const session = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, streamingContent]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Start a Conversation</h2>
            <p className="text-white/40 text-sm max-w-md">
              Select a model and start chatting. All responses come from real AI models via OpenRouter or your local Ollama instance.
            </p>
          </div>

          {!hasApiKey() && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 max-w-md">
              <p className="text-yellow-300 text-xs">
                Set your OpenRouter API key in chat settings to enable online inference. Many models are free. Get a key at{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">
                  openrouter.ai/keys
                </a>
              </p>
            </div>
          )}

          <button
            onClick={() => setShowModelPicker(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-105"
          >
            Choose a Model
          </button>
        </motion.div>

        <AnimatePresence>
          {showModelPicker && (
            <ModelPickerModal
              search={modelSearch}
              onSearch={setModelSearch}
              onSelect={async (model: AIModel) => {
                setShowModelPicker(false);
                await createSession(model.id, model.name);
              }}
              onClose={() => setShowModelPicker(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
            AI
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{session.modelName}</h3>
            <span className="text-[10px] text-white/30">{session.modelId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="text-[10px] text-cyan-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Generating...
            </span>
          )}
          <ChatSettingsPanel
            settings={session.settings}
            onChange={(patch) => updateSessionSettings(session.id, patch)}
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between"
          >
            <span className="text-red-300 text-xs">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-4">
          {session.messages.length === 0 && !isStreaming && (
            <div className="text-center py-16 text-white/20 text-sm">
              Send a message to start the conversation with {session.modelName}
            </div>
          )}

          {session.messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {isStreaming && streamingContent && (
            <ChatMessageBubble
              message={{ id: 'streaming', role: 'assistant', content: streamingContent, timestamp: new Date().toISOString() }}
              isStreaming
            />
          )}

          {isStreaming && !streamingContent && (
            <div className="flex gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/20 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                </motion.div>
              </div>
              <div className="flex items-center gap-1.5 py-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={sendMessage} onStop={stopStreaming} isStreaming={isStreaming} />
    </div>
  );
}

// ── Live Model Picker Modal ───────────────────────────────────
function ModelPickerModal({
  search,
  onSearch,
  onSelect,
  onClose,
}: {
  search: string;
  onSearch: (v: string) => void;
  onSelect: (model: AIModel) => void;
  onClose: () => void;
}) {
  const [liveModels, setLiveModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error('failed');
        const json = (await res.json()) as { data: ORModel[] };
        const models = (json.data || []).map(orToAIModel);
        if (!cancelled) setLiveModels(models);
      } catch {
        if (!cancelled) {
          setLiveModels(
            allModels.filter((m) =>
              ['text-generation', 'code', 'multimodal', 'vision'].includes(m.category)
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sorted = liveModels
    .filter((m) => {
      if (!search) return m.freeOnOpenRouter;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.freeOnOpenRouter && !b.freeOnOpenRouter) return -1;
      if (!a.freeOnOpenRouter && b.freeOnOpenRouter) return 1;
      return a.provider.localeCompare(b.provider);
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Choose a Model</span>
            {!loading && (
              <span className="text-[10px] text-green-400">{liveModels.length} LIVE models</span>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search models..."
            autoFocus
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
          />
          {!search && (
            <p className="text-[10px] text-white/30 mt-2">
              Free models shown by default. Type to search all {liveModels.length} models.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 mx-1 my-1 rounded-xl bg-white/5 animate-pulse" />
            ))
          ) : sorted.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">No models found</div>
          ) : (
            sorted.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-white/60">
                  {model.provider.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{model.name}</span>
                    {model.freeOnOpenRouter ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/20 shrink-0">FREE</span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/20 shrink-0">PAID</span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/30 truncate">
                    {model.provider} · {model.contextLength.toLocaleString()} ctx
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-cyan-400 transition-colors shrink-0">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/10 text-center text-[10px] text-white/20">
          {sorted.length} models · Free models shown first
        </div>
      </motion.div>
    </motion.div>
  );
}