import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allModels, getCoreModels, allProviders, allCategories, getLiveModels } from '@/data/models';
import type { AIModel, ModelCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | ''>('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showVariants, setShowVariants] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [liveModels, setLiveModels] = useState<AIModel[]>(allModels);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLiveModels().then((models) => {
      setLiveModels(models);
      setIsLoading(false);
    }).catch(() => {
      setLiveModels(allModels);
      setIsLoading(false);
    });
  }, []);

  const coreOnly = useMemo(() => liveModels.filter((m) => !m.isVariant), [liveModels]);

  const filtered = useMemo(() => {
    let models = showVariants ? liveModels : coreOnly;

    if (search) {
      const q = search.toLowerCase();
      models = models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      models = models.filter((m) => m.category === selectedCategory);
    }

    if (selectedProvider) {
      models = models.filter((m) => m.provider === selectedProvider);
    }

    if (freeOnly) {
      models = models.filter((m) => m.freeOnOpenRouter);
    }

    return models;
  }, [search, selectedCategory, selectedProvider, showVariants, freeOnly, liveModels, coreOnly]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Models</h1>
            <p className="text-sm text-white/40 mt-1">
              {isLoading ? (
                <span className="animate-pulse">Loading live data...</span>
              ) : (
                <>{filtered.length} models · <span className="text-green-400">Live</span></>
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="flex-1 min-w-[200px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ModelCategory | '')}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">All Providers</option>
            {allProviders.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="rounded" />
            <span className="text-xs text-white/60">Free only</span>
          </label>

          <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={showVariants} onChange={(e) => setShowVariants(e.target.checked)} className="rounded" />
            <span className="text-xs text-white/60">Show GGUF variants</span>
          </label>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 animate-pulse h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.slice(0, 100).map((model) => (
              <Link key={model.id} to={`/model/${model.id}`} className="group block">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all h-full"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[model.category]}10`,
                        borderColor: `${CATEGORY_COLORS[model.category]}30`,
                        color: CATEGORY_COLORS[model.category],
                      }}
                    >
                      {model.provider.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                          {model.name}
                        </h3>
                        {model.freeOnOpenRouter && (
                          <span className="px-1 py-0.5 text-[7px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/20 shrink-0">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-white/30">{model.provider}</div>
                    </div>
                  </div>

                  <p className="text-xs text-white/30 line-clamp-2 mb-3">{model.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-white/20">
                    <span
                      className="px-1.5 py-0.5 rounded border"
                      style={{
                        borderColor: `${CATEGORY_COLORS[model.category]}30`,
                        color: CATEGORY_COLORS[model.category],
                      }}
                    >
                      {CATEGORY_LABELS[model.category]}
                    </span>
                    <span>{model.params}</span>
                    {model.openSource && <span className="text-green-400">Open</span>}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {filtered.length > 100 && (
          <p className="text-center text-white/20 text-sm mt-8">
            Showing 100 of {filtered.length} models. Use search to narrow results.
          </p>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-20 text-white/20">
            No models match your filters.
          </div>
        )}
      </main>
    </div>
  );
}