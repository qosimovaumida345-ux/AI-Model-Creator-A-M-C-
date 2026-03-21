import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isStreaming, disabled }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-black/20 p-4">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for newline)"
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                       text-white text-sm placeholder-white/30 resize-none
                       focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20
                       disabled:opacity-50 transition-colors"
          />
        </div>

        {isStreaming ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="shrink-0 w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30
                       flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                       flex items-center justify-center text-white
                       disabled:opacity-30 disabled:cursor-not-allowed
                       hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}