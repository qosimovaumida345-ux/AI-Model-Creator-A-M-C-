import { motion } from 'framer-motion';
import { useDownloadStore } from '@/stores/downloadStore';

interface GgufModel {
  modelId: string;
  name: string;
  quant: string;
  size: number;
  url: string;
  fileName: string;
}

interface Props {
  model: GgufModel;
}

export default function DownloadCard({ model }: Props) {
  const { tasks, addDownload } = useDownloadStore();
  const existingTask = tasks.find(
    (t) => t.modelId === model.modelId && t.status !== 'failed'
  );

  const isDownloading = existingTask?.status === 'downloading';
  const isCompleted = existingTask?.status === 'completed';
  const isQueued = existingTask?.status === 'queued';

  const formatSize = (bytes: number) => {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
    return `${(bytes / 1_000_000).toFixed(0)} MB`;
  };

  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec >= 1_000_000) return `${(bytesPerSec / 1_000_000).toFixed(1)} MB/s`;
    return `${(bytesPerSec / 1_000).toFixed(0)} KB/s`;
  };

  const handleDownload = () => {
    if (isDownloading || isCompleted || isQueued) return;
    addDownload(model.modelId, model.name, model.url, model.fileName, model.size);
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                        border border-cyan-500/20 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" className="text-cyan-400">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">{model.name}</h3>
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span>{model.quant}</span>
            <span>·</span>
            <span>{formatSize(model.size)}</span>
            <span>·</span>
            <span>GGUF</span>
          </div>
        </div>
      </div>

      {/* Progress bar when downloading */}
      {existingTask && (isDownloading || isQueued) && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/30">
              {isQueued ? 'Queued...' : `${formatSize(existingTask.downloadedSize)} / ${formatSize(existingTask.totalSize)}`}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">{existingTask.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${existingTask.progress}%` }}
            />
          </div>
          {isDownloading && existingTask.speed > 0 && (
            <span className="text-[9px] text-white/20 mt-0.5 block">
              {formatSpeed(existingTask.speed)}
            </span>
          )}
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloading || isCompleted || isQueued}
        className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2
          ${isCompleted
            ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
            : isDownloading || isQueued
              ? 'bg-white/5 border border-white/10 text-white/30 cursor-wait'
              : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 cursor-pointer'
          }`}
      >
        {isCompleted ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Downloaded
          </>
        ) : isDownloading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            </motion.div>
            Downloading...
          </>
        ) : isQueued ? (
          'Queued...'
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download GGUF
          </>
        )}
      </button>
    </div>
  );
}