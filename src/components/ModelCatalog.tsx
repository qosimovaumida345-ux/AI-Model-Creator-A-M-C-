import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_MODELS, CATEGORIES, TIERS, type AIModel, type ModelCategory, type ModelTier } from '../data/aiModels';
import CompanyLogo from './CompanyLogo';

interface Props {
  onNext: (selected: string[]) => void;
  onBack: () => void;
}

const tierColors: Record<ModelTier, string> = {
  legendary: 'border-yellow-500/50 shadow-yellow-500/20',
  epic: 'border-purple-500/50 shadow-purple-500/20',
  rare: 'border-blue-500/50 shadow-blue-500/20',
  common: 'border-gray-500/30 shadow-gray-500/10',
};

const tierBadge: Record<ModelTier, string> = {
  legendary: 'bg-yellow-500/20 text-yellow-300',
  epic: 'bg-purple-500/20 text-purple-300',
  rare: 'bg-blue-500/20 text-blue-300',
  common: 'bg-gray-500/20 text-gray-400',
};

export default function ModelCatalog({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ModelCategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<ModelTier | 'all'>('all');

  const filtered = useMemo(() => {
    return AI_MODELS.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !search || m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
      const matchTier = tierFilter === 'all' || m.tier === tierFilter;
      return matchSearch && matchCat && matchTier;
    });
  }, [search, categoryFilter, tierFilter]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(m => m.id)));
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition flex items-center gap-2 font-space text-sm">
              ← Back
            </button>
            <h2 className="font-orbitron font-bold text-lg gradient-text">
              Choose Base Models
            </h2>
            <button onClick={selectAll} className="text-xs font-space text-primary hover:text-white transition px-3 py-1 rounded-lg bg-primary/10">
              {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search 200+ AI models, companies..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 font-space text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-space whitespace-nowrap transition ${
                categoryFilter === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              🌐 All ({AI_MODELS.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = AI_MODELS.filter(m => m.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-space whitespace-nowrap transition ${
                    categoryFilter === cat.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat.icon} {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Tier filters */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-space transition ${
                tierFilter === 'all' ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              All Tiers
            </button>
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-space transition ${
                  tierFilter === t.id ? 'bg-white/15 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
        <div className="text-sm text-gray-500 mb-4 font-space">{filtered.length} models found</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((model: AIModel) => {
              const isSelected = selected.has(model.id);
              return (
                <motion.div
                  key={model.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => toggle(model.id)}
                  className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-200 card-hover ${
                    isSelected
                      ? 'border-primary/60 bg-primary/10 shadow-lg shadow-primary/20 ring-1 ring-primary/30'
                      : `${tierColors[model.tier]} bg-white/[0.02] hover:bg-white/[0.05]`
                  }`}
                >
                  {/* Tier badge */}
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-space ${tierBadge[model.tier]}`}>
                    {model.tier.toUpperCase()}
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs text-black font-bold">✓</span>
                    </motion.div>
                  )}

                  {/* Company logo + Model info */}
                  <div className="flex items-start gap-3 mt-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                      <CompanyLogo company={model.company} size={48} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-space font-bold text-sm text-white truncate">{model.name}</h3>
                      <p className="text-xs text-gray-400 font-space">{model.company}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2">{model.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-lg">{model.icon}</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-space">
                      {model.category}
                    </span>
                    {model.params && (
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-space">
                        {model.params}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10 px-4 py-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {Array.from(selected).slice(0, 5).map(id => {
                    const mdl = AI_MODELS.find(m => m.id === id);
                    return mdl ? (
                      <div key={id} className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center overflow-hidden">
                        <CompanyLogo company={mdl.company} size={28} />
                      </div>
                    ) : null;
                  })}
                  {selected.size > 5 && (
                    <div className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-900 flex items-center justify-center text-xs text-gray-400">
                      +{selected.size - 5}
                    </div>
                  )}
                </div>
                <span className="text-sm font-space text-gray-300">
                  <strong className="text-primary">{selected.size}</strong> models selected
                </span>
              </div>
              <button
                onClick={() => onNext(Array.from(selected))}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl font-orbitron font-bold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
