import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { useChatStore } from '@/stores/chatStore';
import { getCoreModels } from '@/data/models';
import type { AIModel } from '@/types';

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
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar onNewChat={handleNewChat} />
      </div>

      {/* Mobile sidebar */}
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

      {/* Mobile sidebar overlay */}
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

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
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

      {/* Quick model picker modal */}
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

// ── Quick model selector ─────────────────────────────────────
function QuickModelPick({
  onSelect,
  onClose,
}: {
  onSelect: (model: AIModel) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const models = getCoreModels()
    .filter((m) => ['text-generation', 'code', 'multimodal', 'vision'].includes(m.category))
    .filter((m) => {
      if (!search) return m.freeOnOpenRouter; // Show free models by default
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.freeOnOpenRouter && !b.freeOnOpenRouter) return -1;
      if (!a.freeOnOpenRouter && b.freeOnOpenRouter) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 50);

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
        className="w-full max-w-lg max-h-[70vh] bg-gray-900/95 backdrop-blur-xl
                   border border-white/10 rounded-2xl flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">Select Model for Chat</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all models..."
            autoFocus
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
          />
          {!search && (
            <p className="text-[10px] text-white/30 mt-2">
              Showing free models. Type to search all 500+ models.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelect(model)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                         hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10
                              flex items-center justify-center text-[9px] font-bold text-white/40 shrink-0">
                {model.provider.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-white truncate">{model.name}</span>
                  {model.freeOnOpenRouter && (
                    <span className="px-1 py-0.5 text-[8px] font-bold bg-green-500/20
                                     text-green-400 rounded">
                      FREE
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/30">{model.provider}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}