import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';

interface Props {
  model: {
    id: string;
    name: string;
    baseModelName: string;
    description: string;
    createdAt: string;
    trainingStatus: string;
    metrics: Record<string, number> | null;
  };
  onDelete: (id: string) => void;
}

export default function ForgedModelCard({ model, onDelete }: Props) {
  const navigate = useNavigate();
  const { createSession } = useChatStore();

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/20',
    training: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    failed: 'bg-red-500/20 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/20',
    preparing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  };

  const handleChat = async () => {
    const sessionId = await createSession(model.id, model.name, true);
    navigate(`/chat?session=${sessionId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20
                          border border-orange-500/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" className="text-orange-400">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{model.name}</h3>
            <span className="text-[11px] text-white/30">Based on {model.baseModelName}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${statusColors[model.trainingStatus] || statusColors.preparing}`}>
          {model.trainingStatus.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-white/40 mb-4 line-clamp-2">{model.description}</p>

      {/* Metrics */}
      {model.metrics && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {model.metrics.finalLoss != null && (
            <div className="p-2 bg-white/[0.02] rounded-lg">
              <div className="text-[9px] text-white/20 uppercase">Final Loss</div>
              <div className="text-xs font-mono text-cyan-400">{model.metrics.finalLoss.toFixed(4)}</div>
            </div>
          )}
          {model.metrics.bestLoss != null && (
            <div className="p-2 bg-white/[0.02] rounded-lg">
              <div className="text-[9px] text-white/20 uppercase">Best Loss</div>
              <div className="text-xs font-mono text-green-400">{model.metrics.bestLoss.toFixed(4)}</div>
            </div>
          )}
          {model.metrics.totalSteps != null && (
            <div className="p-2 bg-white/[0.02] rounded-lg">
              <div className="text-[9px] text-white/20 uppercase">Steps</div>
              <div className="text-xs font-mono text-white/60">{model.metrics.totalSteps}</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {model.trainingStatus === 'completed' && (
          <button
            onClick={handleChat}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20
                       border border-cyan-500/30 text-cyan-400 text-xs font-medium
                       hover:border-cyan-400/50 transition-colors"
          >
            Chat with Model
          </button>
        )}
        <button
          onClick={() => onDelete(model.id)}
          className="px-3 py-2 rounded-lg bg-white/5 text-white/30 text-xs
                     hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Created date */}
      <div className="text-[10px] text-white/15 mt-3">
        Created {new Date(model.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}