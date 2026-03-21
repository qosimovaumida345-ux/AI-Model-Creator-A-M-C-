import { motion, AnimatePresence } from 'framer-motion';
import { useDownloadStore } from '@/stores/downloadStore';

export default function DownloadManager() {
  const { tasks, removeTask, pauseTask, resumeTask, clearCompleted } = useDownloadStore();

  if (tasks.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
    return `${(bytes / 1_000_000).toFixed(0)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Downloads</h3>
        <button
          onClick={clearCompleted}
          className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          Clear completed
        </button>
      </div>

      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/[0.02] border border-white/10 rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                task.status === 'downloading' ? 'bg-cyan-400 animate-pulse' :
                task.status === 'completed' ? 'bg-green-400' :
                task.status === 'failed' ? 'bg-red-400' :
                task.status === 'paused' ? 'bg-yellow-400' :
                'bg-white/20'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">{task.modelName}</div>
                <div className="text-[10px] text-white/30">
                  {task.status === 'downloading'
                    ? `${formatSize(task.downloadedSize)} / ${formatSize(task.totalSize)}`
                    : task.status === 'completed'
                      ? `${formatSize(task.totalSize)} — Complete`
                      : task.status === 'failed'
                        ? task.error || 'Failed'
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)
                  }
                </div>
              </div>

              <div className="flex items-center gap-1">
                {task.status === 'downloading' && (
                  <button onClick={() => pauseTask(task.id)} className="p-1 hover:bg-white/10 rounded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/30">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  </button>
                )}
                {task.status === 'paused' && (
                  <button onClick={() => resumeTask(task.id)} className="p-1 hover:bg-white/10 rounded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/30">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                )}
                <button onClick={() => removeTask(task.id)} className="p-1 hover:bg-red-500/20 rounded text-white/20 hover:text-red-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {task.status === 'downloading' && (
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500 rounded-full"
                  animate={{ width: `${task.progress}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}