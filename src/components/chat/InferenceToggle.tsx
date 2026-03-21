import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { checkOllamaStatus } from '@/services/api';

export default function InferenceToggle() {
  const {
    inferenceMode,
    isOnline,
    ollamaAvailable,
    setInferenceMode,
    setOllamaStatus,
  } = useSettingsStore();

  useEffect(() => {
    const check = async () => {
      const status = await checkOllamaStatus();
      setOllamaStatus(status.available, status.models);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [setOllamaStatus]);

  const effectiveMode =
    inferenceMode === 'auto'
      ? isOnline
        ? 'online'
        : 'offline'
      : inferenceMode;

  const modes: Array<{ key: 'auto' | 'online' | 'offline'; label: string }> = [
    { key: 'auto', label: 'Auto' },
    { key: 'online', label: 'Online' },
    { key: 'offline', label: 'Offline' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setInferenceMode(mode.key)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${inferenceMode === mode.key ? 'text-white' : 'text-white/50 hover:text-white/70'}`}
          >
            {inferenceMode === mode.key && (
              <motion.div
                layoutId="inference-mode"
                className="absolute inset-0 bg-white/10 rounded-md border border-white/20"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{mode.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-white/40 px-1">
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaAvailable ? 'bg-green-400' : 'bg-yellow-400'
            }`}
          />
          Ollama {ollamaAvailable ? 'ready' : 'N/A'}
        </span>
        <span className="ml-auto text-cyan-400/60">
          {effectiveMode === 'online' ? 'OpenRouter' : 'Local'}
        </span>
      </div>
    </div>
  );
}