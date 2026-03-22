import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { useChatStore } from '@/stores/chatStore';
import { allModels } from '@/data/models';
import type { AIModel } from '@/types';

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

function guessProvider(orId: string): string {
  return orId.split(':')[0].split('/')[0] || 'OpenRouter';
}

function orToAIModel(or: ORModel): AIModel {
  return {
    id: or.id,
    name: or.name || or.id.split('/').pop() || or.id,
    provider: guessProvider(or.id),
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

export default function ChatPage() {
  const { createSession } = useChatStore();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showQuickPick, setShowQuickPick] = useState(false);

  const handleNewChat = useCallback(() => {
    setShowQuickPick(true);
  }, []);

  const handleModelSelect = useCallback(
    async (model: AIModel) => {
      setShowQuickPick(false);
      setShowMobileSidebar(false);
      await createSession(model.id, model.name);
    },
    [createSession]
  );

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      <div className="hidden md:block">
        <ChatSidebar onNewChat={handleNewChat} />
      </div>

      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 md:hidden"
          >
            <ChatSidebar onNewChat={handleNewChat} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-white/10">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="text-sm font-medium text-white">AI Model Forge Chat</span>
        </div>

        <ChatInterface />
      </div>

      <AnimatePresence>
        {showQuickPick && (
          <QuickModelPick
            onSelect={handleModelSelect}
            onClose={() => setShowQuickPick(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickModelPick({
  onSelect,
  onClose,
}: {
  onSelect: (model: AIModel) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
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
        // fallback to static
        if (!cancelled) setLiveModels(allModels.filter(m =>
          ['text-generation', 'code', 'multimodal', 'vision'].includes(m.category)
        ));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = liveModels
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
      return a.name.localeCompare(b.name);
    })
    .slice(0, 80);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[70vh] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Select Model</h3>
            {!loading && (
              <span className="text-[10px] text-green-400 font-medium">
                {liveModels.length} LIVE models
              </span>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all models..."
            autoFocus
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
          />
          {!search && (
            <p className="text-[10px] text-white/30 mt-2">
              Showing free models. Type to search all {liveModels.length} models.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 mx-1 my-1 rounded-lg bg-white/5 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-sm">
              No models found
            </div>
          ) : (
            filtered.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/40 shrink-0">
                  {model.provider.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-white truncate">{model.name}</span>
                    {model.freeOnOpenRouter ? (
                      <span className="px-1 py-0.5 text-[8px] font-bold bg-green-500/20 text-green-400 rounded shrink-0">
                        FREE
                      </span>
                    ) : (
                      <span className="px-1 py-0.5 text-[8px] font-bold bg-yellow-500/20 text-yellow-400 rounded shrink-0">
                        PAID
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/30">
                    {model.provider} · {model.contextLength.toLocaleString()} ctx
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}