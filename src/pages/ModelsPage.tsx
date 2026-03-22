import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { allModels, getCoreModels, allProviders, allCategories } from '@/data/models';
import type { AIModel, ModelCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';

type ORModel = {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
};

function isFree(or: ORModel): boolean {
  if (or.id.endsWith(':free')) return true;
  const p = parseFloat(or.pricing?.prompt ?? '1');
  const c = parseFloat(or.pricing?.completion ?? '1');
  return p === 0 && c === 0;
}

function guessProvider(orId: string): string {
  // e.g. "meta-llama/llama-3.3-70b-instruct:free" -> "meta-llama"
  const beforeColon = orId.split(':')[0];
  const parts = beforeColon.split('/');
  return parts[0] || 'OpenRouter';
}

function guessName(or: ORModel): string {
  // OpenRouter ko'pincha name beradi, bo'lmasa id dan chiqaramiz
  if (or.name && or.name.trim()) return or.name;
  return or.id.split('/').pop() || or.id;
}

function toLocalAIModel(or: ORModel): AIModel {
  // Minimal AIModel: sizning card UI ishlashi uchun yetarli fieldlar
  const provider = guessProvider(or.id);

  return {
    id: or.id, // MUHIM: endi Link /model/:id ga OpenRouter id ketadi
    name: guessName(or),
    provider,
    category: 'text-generation',
    description: or.description || 'OpenRouter model',
    params: 'API',
    license: 'API',
    formats: ['api'],
    tasks: ['text-generation'],
    architecture: 'Transformer',
    contextLength: or.context_length ?? 4096,
    fineTunable: false,
    openSource: false,
    apiAvailable: true,
    freeOnOpenRouter: isFree(or),
    hardwareReq: 'API access',
    trainingData: 'Not disclosed',
    benchmarks: {},
    isVariant: false,
  };
}

export default function ModelsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | ''>('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showVariants, setShowVariants] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  const [live, setLive] = useState<AIModel[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error('OpenRouter models fetch failed');
        const json = (await res.json()) as { data: ORModel[] };
        const models = (json.data || []).map(toLocalAIModel);

        if (!cancelled) setLive(models);
      } catch {
        if (!cancelled) setLive(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const baseModels = useMemo(() => {
    // Live kelsa — live ishlatamiz, bo'lmasa static
    if (live && live.length > 0) return live;
    return showVariants ? allModels : getCoreModels();
  }, [live, showVariants]);

  const providers = useMemo(() => {
    if (live && live.length > 0) {
      return [...new Set(live.map((m) => m.provider))].sort();
    }
    return allProviders;
  }, [live]);

  const filtered = useMemo(() => {
    let models = baseModels;

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

    // Live ro'yxatda category mapping yo'q, shuning uchun category filter faqat staticda ishlaydi
    if (selectedCategory && !(live && live.length > 0)) {
      models = models.filter((m) => m.category === selectedCategory);
    }

    if (selectedProvider) {
      models = models.filter((m) => m.provider === selectedProvider);
    }

    if (freeOnly) {
      models = models.filter((m) => m.freeOnOpenRouter);
    }

    return models;
  }, [baseModels, search, selectedCategory, selectedProvider, freeOnly, live]);

  const usingLive = !!(live && live.length > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Models</h1>
            <p className="text-sm text-white/40 mt-1">
              {loading ? 'Loading…' : `${filtered.length} models`}
              {usingLive ? <span className="ml-2 text-green-400">LIVE</span> : <span className="ml-2 text-yellow-400">STATIC</span>}
            </p>
          </div>
        </div>

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
            disabled={usingLive}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-40"
          >
            <option value="">{usingLive ? 'Category (disabled in live)' : 'All Categories'}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="rounded" />
            <span className="text-xs text-white/60">Free only</span>
          </label>

          {!usingLive && (
            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
              <input type="checkbox" checked={showVariants} onChange={(e) => setShowVariants(e.target.checked)} className="rounded" />
              <span className="text-xs text-white/60">Show GGUF variants</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.slice(0, 100).map((model) => (
            <Link key={model.id} to={`/model/${encodeURIComponent(model.id)}`} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all h-full"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[model.category] || '#00D4FF'}10`,
                      borderColor: `${CATEGORY_COLORS[model.category] || '#00D4FF'}30`,
                      color: CATEGORY_COLORS[model.category] || '#00D4FF',
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
                  <span className="px-1.5 py-0.5 rounded border border-white/10 text-white/50">
                    {usingLive ? 'OpenRouter' : CATEGORY_LABELS[model.category]}
                  </span>
                  <span>{usingLive ? `${model.contextLength} ctx` : model.params}</span>
                  {model.openSource && <span className="text-green-400">Open</span>}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}