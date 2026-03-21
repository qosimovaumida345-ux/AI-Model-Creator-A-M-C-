import { useState, useEffect } from 'react';
import { useForgeStore } from '@/stores/forgeStore';
import { motion } from 'framer-motion';

export default function StepHardware() {
  const { selectedBaseModel, selectedBaseModelName, trainableModelIds,
    config, updateConfig, prevStep, startTraining, isTraining } = useForgeStore();

  const isCloudAvailable = selectedBaseModel ? trainableModelIds.includes(selectedBaseModel) : false;

  // Local state for the selected hardware (default to local)
  const [selectedHardware, setSelectedHardware] = useState<'cloud' | 'local'>('local');

  // If they change to a model that doesn't support cloud, force local
  useEffect(() => {
    if (!isCloudAvailable) {
      setSelectedHardware('local');
    }
  }, [isCloudAvailable]);

  const gpuInfo = {
    cloud: {
      name: 'Replicate Cloud GPU',
      type: isCloudAvailable ? 'NVIDIA A100 / A40' : 'Not available for this model',
      available: isCloudAvailable,
      desc: 'Training runs on Replicate cloud infrastructure. Real GPU, real training.',
    },
    local: {
      name: 'Simulated Local',
      type: 'CPU (demonstration)',
      available: true,
      desc: 'Runs a simulated training loop for demonstration. No API keys required.',
    },
  };

  const handleStart = () => {
    // Save your manual choice to the config before sending to backend
    updateConfig({ hardwareProvider: selectedHardware });
    startTraining();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Hardware & Review</h2>
        <p className="text-sm text-white/40">Review your configuration before starting training</p>
      </div>

      {/* Hardware selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cloud GPU */}
        <motion.div
          whileHover={isCloudAvailable ? { scale: 1.01 } : {}}
          onClick={() => isCloudAvailable && setSelectedHardware('cloud')}
          className={`p-5 rounded-xl border transition-all ${isCloudAvailable ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
            ${selectedHardware === 'cloud'
              ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20'
              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
              ${selectedHardware === 'cloud' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/30'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{gpuInfo.cloud.name}</h3>
              <span className={`text-[10px] ${gpuInfo.cloud.available ? 'text-green-400' : 'text-white/30'}`}>
                {gpuInfo.cloud.type}
              </span>
            </div>
            {selectedHardware === 'cloud' && (
              <span className="ml-auto px-2 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded">
                SELECTED
              </span>
            )}
          </div>
          <p className="text-xs text-white/40">{gpuInfo.cloud.desc}</p>
        </motion.div>

        {/* Local */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => setSelectedHardware('local')}
          className={`p-5 rounded-xl border transition-all cursor-pointer
            ${selectedHardware === 'local'
              ? 'bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20'
              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center
              ${selectedHardware === 'local' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{gpuInfo.local.name}</h3>
              <span className="text-[10px] text-white/30">{gpuInfo.local.type}</span>
            </div>
            {selectedHardware === 'local' && (
              <span className="ml-auto px-2 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-400 rounded">
                SELECTED
              </span>
            )}
          </div>
          <p className="text-xs text-white/40">{gpuInfo.local.desc}</p>
        </motion.div>
      </div>

      {/* Config summary */}
      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-3">
        <h3 className="text-sm font-semibold text-white">Training Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Base Model', selectedBaseModelName || '-'],
            ['Epochs', config.epochs],
            ['Batch Size', config.batchSize],
            ['Learning Rate', config.learningRate?.toExponential(1) || '2.0e-4'],
            ['LoRA Rank', config.loraRank],
            ['LoRA Alpha', config.loraAlpha],
            ['Max Seq Length', config.maxSequenceLength?.toLocaleString() || '2,048'],
            ['Optimizer', (config.optimizer || 'adamw').toUpperCase()],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className="text-[10px] text-white/30 uppercase">{label}</div>
              <div className="text-sm text-white font-mono">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={prevStep} className="px-6 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={isTraining}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-500
                     text-white font-bold text-base disabled:opacity-50
                     hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2"
        >
          {isTraining ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </motion.div>
              Starting...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Start Forging
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}