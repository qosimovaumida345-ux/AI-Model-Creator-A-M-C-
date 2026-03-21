import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForgeStore } from '@/stores/forgeStore';
import { getFineTunableModels } from '@/data/models';

export default function StepBaseModel() {
  const { selectedBaseModel, setBaseModel, nextStep, trainableModelIds } = useForgeStore();
  const [search, setSearch] = useState('');

  const models = useMemo(() => {
    const ftModels = getFineTunableModels().filter((m) => !m.isVariant);
    const q = search.toLowerCase();
    return ftModels
      .filter((m) => !search || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .sort((a, b) => {
        const aCloud = trainableModelIds.includes(a.id);
        const bCloud = trainableModelIds.includes(b.id);
        if (aCloud && !bCloud) return -1;
        if (!aCloud && bCloud) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [search, trainableModelIds]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Select Base Model</h2>
        <p className="text-sm text-white/40">Choose a model to fine-tune with your data</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search fine-tunable models..."
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                   placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {models.map((model) => {
          const isCloudReady = trainableModelIds.includes(model.id);
          const isSelected = selectedBaseModel === model.id;

          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setBaseModel(model.id, model.name)}
              className={`text-left p-4 rounded-xl border transition-all
                ${isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/20'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
                  ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
                  {model.provider.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white truncate">{model.name}</span>
                    {isCloudReady && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-purple-500/20 text-purple-400 rounded border border-purple-500/20">
                        CLOUD
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/30">
                    {model.provider} · {model.params} · {model.architecture}
                  </div>
                  <div className="text-[10px] text-white/20 mt-1 line-clamp-2">{model.description}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {models.length === 0 && (
        <div className="text-center text-white/20 py-8 text-sm">No fine-tunable models found</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={nextStep}
          disabled={!selectedBaseModel}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                     text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          Next: Upload Data
        </button>
      </div>
    </div>
  );
}