import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForgeStore } from '@/stores/forgeStore';
import TrainingChart from './TrainingChart';

export default function StepTraining() {
  const { activeTrainingJob, cancelTraining, isTraining, resetWizard } = useForgeStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTrainingJob?.logs]);

  if (!activeTrainingJob) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/30">
        <p>No active training job</p>
        <button onClick={resetWizard} className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm">
          Start New Forge
        </button>
      </div>
    );
  }

  const job = activeTrainingJob;
  const isComplete = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isDone = isComplete || isFailed || isCancelled;

  const statusColors: Record<string, string> = {
    preparing: 'text-yellow-400',
    'uploading-data': 'text-yellow-400',
    queued: 'text-orange-400',
    training: 'text-cyan-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
    cancelled: 'text-gray-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isComplete ? 'Training Complete' : isFailed ? 'Training Failed' : 'Training in Progress'}
          </h2>
          <p className={`text-sm font-medium ${statusColors[job.status] || 'text-white/40'}`}>
            Status: {job.status.replace(/-/g, ' ').toUpperCase()}
          </p>
        </div>
        {!isDone && (
          <button
            onClick={cancelTraining}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400
                       text-sm hover:bg-red-500/20 transition-colors"
          >
            Cancel Training
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40">Progress</span>
          <span className="text-sm font-mono text-cyan-400">{job.progress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${job.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-white/20">
          <span>Step {job.currentStep}/{job.totalSteps || '?'}</span>
          <span>Epoch {job.currentEpoch + 1}/{job.totalEpochs}</span>
          {job.elapsed > 0 && <span>{formatDuration(job.elapsed)}</span>}
          {job.estimatedRemaining > 0 && <span>~{formatDuration(job.estimatedRemaining)} remaining</span>}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Current Loss', value: job.loss ? job.loss.toFixed(4) : '-', color: 'text-cyan-400' },
          { label: 'Learning Rate', value: job.learningRate ? job.learningRate.toExponential(2) : '-', color: 'text-purple-400' },
          { label: 'GPU Provider', value: job.gpuProvider || '-', color: 'text-white/60' },
          { label: 'GPU Type', value: job.gpuType || 'Detecting...', color: 'text-white/60' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <div className="text-[10px] text-white/30 uppercase">{stat.label}</div>
            <div className={`text-sm font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <TrainingChart
            data={(job.lossHistory || []).map((p) => ({ step: p.step, value: p.value }))}
            label="Training Loss"
            color="#00D4FF"
            height={180}
          />
        </div>
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <TrainingChart
            data={(job.lrHistory || []).map((p) => ({ step: p.step, value: p.value }))}
            label="Learning Rate"
            color="#9D4EDD"
            height={180}
            format={(v) => v.toExponential(1)}
          />
        </div>
      </div>

      {/* Error */}
      {job.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-300 font-mono">{job.error}</p>
        </div>
      )}

      {/* Logs */}
      <div className="p-4 bg-black/40 rounded-xl border border-white/5">
        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Training Logs</h3>
        <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
          {(job.logs || []).map((log, i) => (
            <div key={i} className={`flex gap-2
              ${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-white/40'}`}>
              <span className="text-white/15 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Done actions */}
      {isDone && (
        <div className="flex justify-between">
          <button
            onClick={resetWizard}
            className="px-6 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
          >
            New Forge
          </button>
          {isComplete && (
            <a
              href="/my-models"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500
                         text-white font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all"
            >
              View in My Models
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}