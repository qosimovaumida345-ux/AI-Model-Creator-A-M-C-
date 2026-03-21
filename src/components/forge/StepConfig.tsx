import { useForgeStore } from '@/stores/forgeStore';

export default function StepConfig() {
  const { config, updateConfig, modelName, setModelName, modelDescription,
    setModelDescription, systemPrompt, setSystemPrompt, prevStep, nextStep } = useForgeStore();

  const Slider = ({ label, field, min, max, step, format }: {
    label: string; field: keyof typeof config; min: number; max: number; step: number; format?: (v: number) => string;
  }) => {
    const val = config[field] as number;
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">{label}</label>
          <span className="text-xs text-cyan-400 font-mono">
            {format ? format(val) : (step < 0.001 ? val.toExponential(1) : val)}
          </span>
        </div>
        <input
          type="range" min={min} max={max} step={step} value={val}
          onChange={(e) => updateConfig({ [field]: parseFloat(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Fine-Tuning Configuration</h2>
        <p className="text-sm text-white/40">Set training hyperparameters and model identity</p>
      </div>

      {/* Model Identity */}
      <div className="space-y-3 p-4 bg-white/[0.02] rounded-xl border border-white/10">
        <h3 className="text-sm font-semibold text-white">Model Identity</h3>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Model Name *</label>
          <input
            value={modelName} onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g., my-code-assistant"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Description</label>
          <input
            value={modelDescription} onChange={(e) => setModelDescription(e.target.value)}
            placeholder="What does this model specialize in?"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] text-white/40 uppercase tracking-wider">System Prompt</label>
          <textarea
            value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3}
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       placeholder-white/20 resize-none focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Hyperparameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/[0.02] rounded-xl border border-white/10">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Training Parameters</h3>
          <Slider label="Learning Rate" field="learningRate" min={1e-6} max={1e-3} step={1e-6}
            format={(v) => v.toExponential(1)} />
          <Slider label="Epochs" field="epochs" min={1} max={20} step={1} />
          <Slider label="Batch Size" field="batchSize" min={1} max={64} step={1} />
          <Slider label="Max Sequence Length" field="maxSequenceLength" min={128} max={8192} step={128}
            format={(v) => v.toLocaleString()} />
          <Slider label="Warmup Steps" field="warmupSteps" min={0} max={200} step={5} />
          <Slider label="Weight Decay" field="weightDecay" min={0} max={0.1} step={0.005} />
          <Slider label="Gradient Accumulation" field="gradientAccumulationSteps" min={1} max={32} step={1} />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">LoRA Parameters</h3>
          <Slider label="LoRA Rank" field="loraRank" min={4} max={128} step={4} />
          <Slider label="LoRA Alpha" field="loraAlpha" min={8} max={256} step={8} />
          <Slider label="LoRA Dropout" field="loraDropout" min={0} max={0.5} step={0.01} />

          <div className="pt-2">
            <label className="text-[11px] text-white/40 uppercase tracking-wider">Optimizer</label>
            <select
              value={config.optimizer}
              onChange={(e) => updateConfig({ optimizer: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         focus:outline-none focus:border-cyan-500/50"
            >
              <option value="adamw">AdamW</option>
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="adafactor">Adafactor</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-white/40 uppercase tracking-wider">LR Scheduler</label>
            <select
              value={config.scheduler}
              onChange={(e) => updateConfig({ scheduler: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         focus:outline-none focus:border-cyan-500/50"
            >
              <option value="cosine">Cosine</option>
              <option value="linear">Linear</option>
              <option value="constant">Constant</option>
              <option value="cosine_with_restarts">Cosine w/ Restarts</option>
            </select>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.bf16}
                onChange={(e) => updateConfig({ bf16: e.target.checked, fp16: !e.target.checked })}
                className="rounded bg-white/5 border-white/20 text-cyan-500 focus:ring-cyan-500/30" />
              <span className="text-xs text-white/60">BF16</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.gradientCheckpointing}
                onChange={(e) => updateConfig({ gradientCheckpointing: e.target.checked })}
                className="rounded bg-white/5 border-white/20 text-cyan-500 focus:ring-cyan-500/30" />
              <span className="text-xs text-white/60">Gradient Checkpointing</span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={prevStep} className="px-6 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!modelName.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                     text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          Next: Hardware
        </button>
      </div>
    </div>
  );
}