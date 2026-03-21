import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import InferenceToggle from './InferenceToggle';

interface Props {
  onNewChat: () => void;
}

export default function ChatSidebar({ onNewChat }: Props) {
  const { sessions, activeSessionId, setActiveSession, deleteSession, loadSessions } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="w-72 h-full flex flex-col bg-black/40 border-r border-white/10 backdrop-blur-xl">
      {/* New chat button */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                     bg-gradient-to-r from-cyan-500/20 to-purple-500/20
                     border border-cyan-500/30 hover:border-cyan-400/50
                     text-white text-sm font-medium transition-all hover:scale-[1.02]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Inference toggle */}
      <div className="p-3 border-b border-white/10">
        <InferenceToggle />
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                         transition-colors text-sm
                         ${
                           activeSessionId === session.id
                             ? 'bg-white/10 text-white border border-white/10'
                             : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                         }`}
              onClick={() => setActiveSession(session.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-40">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs">{session.title || 'New Chat'}</div>
                <div className="text-[10px] text-white/30 truncate">{session.modelName}</div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity
                           p-1 rounded hover:bg-red-500/20 hover:text-red-400"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {sessions.length === 0 && (
          <div className="text-center text-white/20 text-xs py-8">
            No conversations yet
          </div>
        )}
      </div>

      {/* Model count */}
      <div className="p-3 border-t border-white/10 text-[10px] text-white/20 text-center">
        {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}