import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function ChatMessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.error;

  if (isSystem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 px-4 py-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
          ${isUser
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
            : isError
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/20 text-purple-300'
          }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Content */}
      <div
        className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}
      >
        <div
          className={`inline-block text-left px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser
              ? 'bg-cyan-500/20 border border-cyan-500/20 text-white rounded-br-md'
              : isError
                ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md'
                : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-md'
            }`}
        >
          {message.content}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-2 h-4 ml-1 bg-cyan-400 rounded-sm align-middle"
            />
          )}
        </div>

        {/* Metadata */}
        <div className={`flex items-center gap-2 mt-1 text-[10px] text-white/20
          ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.generationTime && (
            <span>{(message.generationTime / 1000).toFixed(1)}s</span>
          )}
          {message.tokens && <span>{message.tokens} tokens</span>}
        </div>
      </div>
    </motion.div>
  );
}