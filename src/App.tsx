import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconForge, IconBrain, IconCpu, IconDownload, IconPlay, IconStop,
  IconTrash, IconEdit, IconChat, IconGrid, IconHammer, IconLayers,
  IconMonitor, IconServer, IconCheck, IconX, IconSearch, IconSend,
  IconMenu, IconArrowLeft, IconSettings, IconWifi, IconWifiOff, IconImage,
} from './components/Icons';
import ParticleCanvas from './components/ParticleCanvas';
import {
  type ForgedModel, type ChatMessage, type DeviceInfo,
  type ModelCategory, type Quantization, type MergeStrategy,
  MODEL_CATALOG, detectDevice, uid,
  saveForgedModel, loadAllForgedModels, deleteForgedModel, generateResponse,
} from './lib/store';

/* ─── Page type ─────────────────────────────────── */
type Page = 'home' | 'gallery' | 'forge' | 'models' | 'runner' | 'system';

/* ─── Motion variants ───────────────────────────── */
const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const scaleIn = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } };

/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [models, setModels] = useState<ForgedModel[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileNav, setMobileNav] = useState(false);
  const [device] = useState<DeviceInfo>(() => detectDevice());

  // Load saved models
  useEffect(() => {
    loadAllForgedModels().then(setModels);
  }, []);

  // Online status
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const addModel = useCallback(async (m: ForgedModel) => {
    await saveForgedModel(m);
    setModels(prev => [...prev, m]);
  }, []);

  const removeModel = useCallback(async (id: string) => {
    await deleteForgedModel(id);
    setModels(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateModel = useCallback(async (updated: ForgedModel) => {
    await saveForgedModel(updated);
    setModels(prev => prev.map(m => m.id === updated.id ? updated : m));
  }, []);

  const navItems: { id: Page; label: string; icon: ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <IconBrain size={20} /> },
    { id: 'gallery', label: 'Model Hub', icon: <IconGrid size={20} /> },
    { id: 'forge', label: 'Forge Studio', icon: <IconHammer size={20} /> },
    { id: 'models', label: 'My Models', icon: <IconLayers size={20} /> },
    { id: 'runner', label: 'AI Chat', icon: <IconChat size={20} /> },
    { id: 'system', label: 'System', icon: <IconMonitor size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-void text-text-primary font-sans relative">
      <ParticleCanvas />

      {/* ── Top Navigation Bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <IconForge size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              <span className="text-gradient">Neural</span>
              <span className="text-text-bright">Forge</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                  page === item.id
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Online indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {isOnline ? <IconWifi size={14} /> : <IconWifiOff size={14} />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            {/* Mobile menu */}
            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              {mobileNav ? <IconX size={22} className="text-white" /> : <IconMenu size={22} className="text-text-muted" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="p-4 flex flex-col gap-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setPage(item.id); setMobileNav(false); }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                      page === item.id ? 'bg-indigo-500/20 text-white' : 'text-text-muted hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Main Content ── */}
      <main className="relative z-10 pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          {page === 'home' && <HomePage key="home" setPage={setPage} modelCount={models.length} />}
          {page === 'gallery' && <GalleryPage key="gallery" />}
          {page === 'forge' && <ForgePage key="forge" onForge={addModel} setPage={setPage} />}
          {page === 'models' && <MyModelsPage key="models" models={models} onDelete={removeModel} onUpdate={updateModel} setPage={setPage} />}
          {page === 'runner' && <RunnerPage key="runner" models={models} />}
          {page === 'system' && <SystemPage key="system" device={device} isOnline={isOnline} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════ */
function HomePage({ setPage, modelCount }: { setPage: (p: Page) => void; modelCount: number }) {
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Orbiting rings */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-rotate-slow" />
              <div className="absolute inset-3 rounded-full border border-purple-500/20 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
              <div className="absolute inset-6 rounded-full border border-cyan-500/15 animate-rotate-slow" style={{ animationDuration: '25s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-pulse-glow">
                  <IconForge size={36} className="text-white" />
                </div>
              </div>
              {/* Floating dots */}
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-indigo-400 animate-float" style={{ animationDelay: '0s' }} />
              <div className="absolute bottom-2 right-0 w-1.5 h-1.5 rounded-full bg-purple-400 animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="text-gradient">Neural</span>
              <span className="text-text-bright">Forge</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-4 leading-relaxed">
              Create, customize, and deploy your own AI models.
              Forge frontier-grade intelligence from the world's best open and proprietary architectures.
            </p>
            <p className="text-sm text-text-dim max-w-xl mx-auto mb-10">
              Powered by GGUF quantization, ONNX Runtime, and llama.cpp for true offline capability.
              Works on Desktop, Mobile, and Edge devices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setPage('forge')}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <IconHammer size={20} className="group-hover:rotate-12 transition-transform" />
                Forge New Model
              </button>
              <button
                onClick={() => setPage('gallery')}
                className="px-8 py-4 rounded-xl glass border border-white/10 text-text-primary font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <IconGrid size={20} />
                Browse Model Hub
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Available Models', value: MODEL_CATALOG.length.toString(), icon: <IconGrid size={22} />, color: 'from-indigo-500/20 to-indigo-600/5' },
            { label: 'Your Forged Models', value: modelCount.toString(), icon: <IconHammer size={22} />, color: 'from-purple-500/20 to-purple-600/5' },
            { label: 'Architectures', value: '6', icon: <IconCpu size={22} />, color: 'from-cyan-500/20 to-cyan-600/5' },
            { label: 'Quantization Formats', value: '5', icon: <IconServer size={22} />, color: 'from-pink-500/20 to-pink-600/5' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} className={`glass rounded-2xl p-5 bg-gradient-to-br ${s.color}`}>
              <div className="text-text-muted mb-3">{s.icon}</div>
              <div className="text-3xl font-bold text-text-bright mb-1">{s.value}</div>
              <div className="text-sm text-text-dim">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured models */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-text-bright mb-6">Featured Models</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODEL_CATALOG.slice(0, 4).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all group cursor-pointer"
              onClick={() => setPage('gallery')}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden mb-4 bg-white/5 flex items-center justify-center">
                <img src={m.logo} alt={m.name} className="w-10 h-10 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-semibold text-text-bright mb-1 group-hover:text-indigo-300 transition-colors">{m.name}</h3>
              <p className="text-xs text-text-dim mb-3">{m.company}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted">{m.parameters} params</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted">{m.size}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   GALLERY PAGE
   ═══════════════════════════════════════════════════ */
function GalleryPage() {
  const [filter, setFilter] = useState<ModelCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories: { id: ModelCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Models' },
    { id: 'text', label: 'Text / LLM' },
    { id: 'multimodal', label: 'Multimodal' },
    { id: 'code', label: 'Code' },
    { id: 'image', label: 'Image' },
    { id: 'audio', label: 'Audio' },
    { id: 'vision', label: 'Vision' },
  ];

  const filtered = MODEL_CATALOG.filter(m => {
    if (filter !== 'all' && m.category !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-2">Model Hub</h1>
          <p className="text-text-muted">Browse {MODEL_CATALOG.length} frontier AI models from leading companies</p>
        </div>
        <div className="relative w-full sm:w-72">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === c.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 text-text-muted border border-transparent hover:bg-white/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Model grid */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(m => (
          <motion.div
            key={m.id}
            variants={scaleIn}
            layout
            className="glass rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300"
          >
            {/* Color accent bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}80, transparent)` }} />

            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/5">
                  <img src={m.logo} alt={m.name} className="w-10 h-10 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-text-bright text-sm leading-tight">{m.name}</h3>
                  <p className="text-xs text-text-dim mt-0.5">{m.company}</p>
                </div>
              </div>

              <p className="text-xs text-text-muted mb-4 leading-relaxed line-clamp-2">{m.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {m.capabilities.slice(0, 3).map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/5">
                    {c}
                  </span>
                ))}
                {m.capabilities.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-text-dim">+{m.capabilities.length - 3}</span>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                  <div className="text-[10px] text-text-dim">Parameters</div>
                  <div className="text-xs font-semibold text-text-primary">{m.parameters}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                  <div className="text-[10px] text-text-dim">Size (Q4)</div>
                  <div className="text-xs font-semibold text-text-primary">{m.size}</div>
                </div>
              </div>

              {/* Expandable details */}
              <button
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-2"
              >
                {expanded === m.id ? 'Hide details' : 'View details'}
              </button>

              <AnimatePresence>
                {expanded === m.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-dim">Architecture</span>
                        <span className="text-text-muted font-mono text-[11px]">{m.architecture}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-dim">Context</span>
                        <span className="text-text-muted font-mono text-[11px]">{m.contextWindow}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-dim">License</span>
                        <span className="text-text-muted font-mono text-[11px]">{m.license}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-dim">Category</span>
                        <span className="text-text-muted font-mono text-[11px] capitalize">{m.category}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <IconSearch size={48} className="text-text-dim mx-auto mb-4" />
          <p className="text-text-muted">No models match your search criteria</p>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   FORGE STUDIO PAGE
   ═══════════════════════════════════════════════════ */
function ForgePage({ onForge, setPage }: { onForge: (m: ForgedModel) => Promise<void>; setPage: (p: Page) => void }) {
  const [name, setName] = useState('');
  const [baseId, setBaseId] = useState(MODEL_CATALOG[0].id);
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful, harmless, and honest AI assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [taskType, setTaskType] = useState('general');
  const [quantization, setQuantization] = useState<Quantization>('Q4_K_M');
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('slerp');
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [forgeStage, setForgeStage] = useState('');

  const base = MODEL_CATALOG.find(m => m.id === baseId)!;

  const toggleMerge = (id: string) => {
    if (id === baseId) return;
    setMergeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const doForge = async () => {
    if (!name.trim()) return;
    setIsForging(true);
    setForgeProgress(0);

    const stages = [
      'Initializing forge environment...',
      'Loading base model weights...',
      'Applying quantization profile...',
      mergeIds.length > 0 ? `Merging ${mergeIds.length} model(s) via ${mergeStrategy.toUpperCase()}...` : 'Configuring model parameters...',
      'Compiling inference graph...',
      'Optimizing for target device...',
      'Generating GGUF package...',
      'Validating model integrity...',
      'Forge complete!',
    ];

    for (let i = 0; i < stages.length; i++) {
      setForgeStage(stages[i]);
      setForgeProgress(((i + 1) / stages.length) * 100);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }

    const forged: ForgedModel = {
      id: uid(),
      name: name.trim(),
      baseModel: base.name,
      baseModelId: base.id,
      systemPrompt,
      temperature,
      maxTokens,
      taskType,
      quantization,
      mergeStrategy,
      mergedWith: mergeIds.map(id => MODEL_CATALOG.find(m => m.id === id)?.name || id),
      createdAt: new Date().toISOString(),
      status: 'ready',
      size: base.size,
      color: base.color,
      downloaded: false,
    };

    await onForge(forged);
    setTimeout(() => {
      setIsForging(false);
      setPage('models');
    }, 800);
  };

  if (isForging) {
    return (
      <motion.div {...fadeUp} className="max-w-2xl mx-auto px-4 py-20 text-center">
        {/* Spinning forge animation */}
        <div className="relative w-40 h-40 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-rotate-slow" />
          <div className="absolute inset-3 rounded-full border-2 border-purple-500/30 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
          <div className="absolute inset-6 rounded-full border-2 border-cyan-500/20 animate-rotate-slow" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-pulse-glow">
              <IconHammer size={32} className="text-white" />
            </div>
          </div>
          {/* Orbiting particles */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-rotate-slow"
              style={{
                top: '50%', left: '50%',
                transformOrigin: `0 ${60 + i * 8}px`,
                animationDuration: `${3 + i * 0.7}s`,
                animationDelay: `${i * 0.3}s`,
                background: `hsl(${240 + i * 20}, 80%, 65%)`,
                boxShadow: `0 0 8px hsl(${240 + i * 20}, 80%, 65%)`,
              }}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-text-bright mb-3">Forging Your Model</h2>
        <p className="text-sm text-text-muted mb-2 font-mono">{forgeStage}</p>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto h-2 rounded-full bg-white/5 overflow-hidden mb-3">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${forgeProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-text-dim">{Math.round(forgeProgress)}% complete</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <IconHammer size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-bright">Forge Studio</h1>
          <p className="text-sm text-text-muted">Configure and build your custom AI model</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model name */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-3">Model Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., MyAssistant-7B-v2"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
            />
          </div>

          {/* Base model selection */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-3">Base Model</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MODEL_CATALOG.filter(m => m.category !== 'image' && m.category !== 'audio').map(m => (
                <button
                  key={m.id}
                  onClick={() => setBaseId(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    baseId === m.id
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <img src={m.logo} alt="" className="w-6 h-6 object-contain rounded" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    <span className="text-xs font-semibold text-text-bright truncate">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-text-dim">{m.parameters} params</span>
                </button>
              ))}
            </div>
          </div>

          {/* Merge models */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-1">Merge With (Optional)</label>
            <p className="text-xs text-text-dim mb-3">Select additional models to merge into your forge</p>
            <div className="flex flex-wrap gap-2">
              {MODEL_CATALOG.filter(m => m.id !== baseId && m.category !== 'image' && m.category !== 'audio').map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMerge(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    mergeIds.includes(m.id)
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/5 text-text-muted border border-transparent hover:bg-white/10'
                  }`}
                >
                  {mergeIds.includes(m.id) && <IconCheck size={12} />}
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* System prompt */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-3">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500/50 transition-all text-sm resize-none font-mono"
            />
          </div>

          {/* Parameters */}
          <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-text-bright block mb-3">
                Temperature: <span className="text-indigo-400">{temperature.toFixed(2)}</span>
              </label>
              <input type="range" min="0" max="2" step="0.01" value={temperature} onChange={e => setTemperature(+e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-text-dim mt-1">
                <span>Precise</span><span>Balanced</span><span>Creative</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-text-bright block mb-3">
                Max Tokens: <span className="text-indigo-400">{maxTokens.toLocaleString()}</span>
              </label>
              <input type="range" min="256" max="32768" step="256" value={maxTokens} onChange={e => setMaxTokens(+e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-text-dim mt-1">
                <span>256</span><span>16K</span><span>32K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings + Preview */}
        <div className="space-y-6">
          {/* Task type */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-3">Task Type</label>
            <div className="space-y-2">
              {['general', 'coding', 'creative', 'analysis', 'education', 'customer-support'].map(t => (
                <button
                  key={t}
                  onClick={() => setTaskType(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    taskType === t ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-white/[0.02] text-text-muted hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quantization */}
          <div className="glass rounded-2xl p-6">
            <label className="text-sm font-semibold text-text-bright block mb-3">Quantization</label>
            <div className="space-y-2">
              {(['Q4_K_M', 'Q5_K_M', 'Q8_0', 'F16', 'F32'] as Quantization[]).map(q => (
                <button
                  key={q}
                  onClick={() => setQuantization(q)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    quantization === q ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'bg-white/[0.02] text-text-muted hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {q}
                  <span className="text-text-dim ml-2">
                    {q === 'Q4_K_M' ? '(Smallest, fast)' : q === 'Q5_K_M' ? '(Balanced)' : q === 'Q8_0' ? '(High quality)' : q === 'F16' ? '(Full precision)' : '(Maximum)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Merge strategy */}
          {mergeIds.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <label className="text-sm font-semibold text-text-bright block mb-3">Merge Strategy</label>
              <div className="space-y-2">
                {(['slerp', 'ties', 'dare-ties', 'linear', 'passthrough'] as MergeStrategy[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setMergeStrategy(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono uppercase transition-all ${
                      mergeStrategy === s ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'bg-white/[0.02] text-text-muted hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview & Build */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-bright mb-4">Forge Preview</h3>
            <div className="space-y-2 text-xs mb-5">
              <div className="flex justify-between"><span className="text-text-dim">Name</span><span className="text-text-muted font-mono">{name || '---'}</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Base</span><span className="text-text-muted font-mono">{base.name}</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Merged</span><span className="text-text-muted font-mono">{mergeIds.length} model(s)</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Quant</span><span className="text-text-muted font-mono">{quantization}</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Task</span><span className="text-text-muted font-mono capitalize">{taskType}</span></div>
            </div>

            <button
              onClick={doForge}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <IconHammer size={18} />
              Build Model
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   MY MODELS PAGE
   ═══════════════════════════════════════════════════ */
function MyModelsPage({ models, onDelete, onUpdate, setPage }: {
  models: ForgedModel[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (m: ForgedModel) => Promise<void>;
  setPage: (p: Page) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [device] = useState(() => detectDevice());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [iconTarget, setIconTarget] = useState<string | null>(null);

  const startEdit = (m: ForgedModel) => { setEditingId(m.id); setEditName(m.name); };
  const saveEdit = async (m: ForgedModel) => {
    if (editName.trim()) await onUpdate({ ...m, name: editName.trim() });
    setEditingId(null);
  };

  const startIconChange = (id: string) => {
    setIconTarget(id);
    fileInputRef.current?.click();
  };

  const handleIconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !iconTarget) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const m = models.find(x => x.id === iconTarget);
      if (m) await onUpdate({ ...m, customIcon: reader.result as string });
      setIconTarget(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const simulateInstall = async (id: string) => {
    setInstalling(id);
    setInstallProgress(0);
    for (let i = 0; i <= 100; i += 2) {
      setInstallProgress(i);
      await new Promise(r => setTimeout(r, 60));
    }
    const m = models.find(x => x.id === id);
    if (m) await onUpdate({ ...m, downloaded: true });
    setInstalling(null);
  };

  const getBaseLogo = (baseModelId: string) => {
    return MODEL_CATALOG.find(m => m.id === baseModelId)?.logo || '';
  };

  if (models.length === 0) {
    return (
      <motion.div {...fadeUp} className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
          <IconLayers size={40} className="text-text-dim" />
        </div>
        <h2 className="text-2xl font-bold text-text-bright mb-3">No Models Yet</h2>
        <p className="text-text-muted mb-8">Head to the Forge Studio to create your first custom AI model</p>
        <button
          onClick={() => setPage('forge')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2 mx-auto"
        >
          <IconHammer size={18} />
          Open Forge Studio
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleIconFile} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-bright mb-2">My Models</h1>
          <p className="text-text-muted">{models.length} forged model{models.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setPage('forge')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
        >
          <IconHammer size={16} />
          Forge New
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map(m => {
          const isInstalling = installing === m.id;
          return (
            <motion.div
              key={m.id}
              layout
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="glass rounded-2xl overflow-hidden"
            >
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}80, transparent)` }} />
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <button
                    onClick={() => startIconChange(m.id)}
                    className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/5 hover:border-indigo-500/30 transition-colors group relative"
                    title="Change icon"
                  >
                    {m.customIcon ? (
                      <img src={m.customIcon} alt="" className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <img src={getBaseLogo(m.baseModelId)} alt="" className="w-10 h-10 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <IconImage size={16} className="text-white" />
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    {editingId === m.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg bg-white/10 border border-indigo-500/30 text-sm text-text-bright focus:outline-none min-w-0"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveEdit(m)}
                        />
                        <button onClick={() => saveEdit(m)} className="p-1 rounded-lg hover:bg-white/10 text-emerald-400"><IconCheck size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-white/10 text-red-400"><IconX size={16} /></button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-text-bright text-sm truncate">{m.name}</h3>
                    )}
                    <p className="text-xs text-text-dim mt-0.5">Based on {m.baseModel}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-text-dim">Quantization</span><span className="text-text-muted font-mono">{m.quantization}</span></div>
                  <div className="flex justify-between"><span className="text-text-dim">Task</span><span className="text-text-muted capitalize">{m.taskType}</span></div>
                  <div className="flex justify-between"><span className="text-text-dim">Temperature</span><span className="text-text-muted">{m.temperature.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-text-dim">Created</span><span className="text-text-muted">{new Date(m.createdAt).toLocaleDateString()}</span></div>
                  {m.mergedWith.length > 0 && (
                    <div className="flex justify-between"><span className="text-text-dim">Merged</span><span className="text-text-muted truncate max-w-[140px]">{m.mergedWith.join(', ')}</span></div>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${m.downloaded ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-yellow-400 shadow-lg shadow-yellow-500/50'}`} />
                  <span className="text-xs text-text-muted">{m.downloaded ? 'Installed' : 'Ready to install'}</span>
                </div>

                {/* Install progress */}
                {isInstalling && (
                  <div className="mb-4">
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        animate={{ width: `${installProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-[10px] text-text-dim mt-1">Installing for {device.os}... {installProgress}%</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!m.downloaded && !isInstalling && (
                    <button
                      onClick={() => simulateInstall(m.id)}
                      className="flex-1 py-2 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-medium hover:bg-indigo-500/25 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <IconDownload size={14} />
                      Install ({device.installerExt})
                    </button>
                  )}
                  {m.downloaded && (
                    <button
                      onClick={() => setPage('runner')}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <IconPlay size={14} />
                      Run
                    </button>
                  )}
                  <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition-colors">
                    <IconEdit size={14} />
                  </button>
                  <button onClick={() => onDelete(m.id)} className="p-2 rounded-lg bg-white/5 text-text-muted hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   AI CHAT / RUNNER PAGE
   ═══════════════════════════════════════════════════ */
function RunnerPage({ models }: { models: ForgedModel[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelStatus, setModelStatus] = useState<'idle' | 'running'>('idle');
  const endRef = useRef<HTMLDivElement>(null);

  const selected = models.find(m => m.id === selectedId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startModel = (id: string) => {
    setSelectedId(id);
    setModelStatus('running');
    setMessages([]);
  };

  const stopModel = () => {
    setModelStatus('idle');
    setSelectedId(null);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected || isTyping) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate streaming response
    const fullResponse = generateResponse(input, selected.name);
    const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: '', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, aiMsg]);

    let current = '';
    for (let i = 0; i < fullResponse.length; i++) {
      current += fullResponse[i];
      const snapshot = current;
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: snapshot } : m));
      await new Promise(r => setTimeout(r, 8 + Math.random() * 15));
    }
    setIsTyping(false);
  };

  const getBaseLogo = (baseModelId: string) => {
    return MODEL_CATALOG.find(m => m.id === baseModelId)?.logo || '';
  };

  if (models.length === 0) {
    return (
      <motion.div {...fadeUp} className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
          <IconChat size={40} className="text-text-dim" />
        </div>
        <h2 className="text-2xl font-bold text-text-bright mb-3">No Models Available</h2>
        <p className="text-text-muted">Create and install a model first to start chatting</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar: model list */}
      <div className="w-72 border-r border-white/5 flex-shrink-0 flex flex-col bg-abyss/50 hidden sm:flex">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-sm font-bold text-text-bright flex items-center gap-2">
            <IconServer size={16} />
            Model Runner
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => modelStatus === 'running' && selectedId === m.id ? stopModel() : startModel(m.id)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                selectedId === m.id ? 'bg-indigo-500/15 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                  {m.customIcon ? (
                    <img src={m.customIcon} alt="" className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <img src={getBaseLogo(m.baseModelId)} alt="" className="w-6 h-6 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-text-bright truncate">{m.name}</div>
                  <div className="text-[10px] text-text-dim">{m.baseModel}</div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  selectedId === m.id && modelStatus === 'running'
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50'
                    : 'bg-white/20'
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <IconChat size={48} className="text-text-dim mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-bright mb-2">Select a Model</h3>
              <p className="text-sm text-text-muted">Choose a model from the sidebar to start chatting</p>
              {/* Mobile: show model list inline */}
              <div className="sm:hidden mt-6 space-y-2 max-w-sm mx-auto">
                {models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => startModel(m.id)}
                    className="w-full p-3 rounded-xl glass text-left flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                      <img src={getBaseLogo(m.baseModelId)} alt="" className="w-6 h-6 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-bright">{m.name}</div>
                      <div className="text-[10px] text-text-dim">{m.baseModel}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-abyss/30">
              <div className="flex items-center gap-3">
                <button onClick={stopModel} className="sm:hidden p-1.5 rounded-lg hover:bg-white/10">
                  <IconArrowLeft size={18} className="text-text-muted" />
                </button>
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                  {selected.customIcon ? (
                    <img src={selected.customIcon} alt="" className="w-5 h-5 object-cover rounded" />
                  ) : (
                    <img src={getBaseLogo(selected.baseModelId)} alt="" className="w-5 h-5 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-bright">{selected.name}</div>
                  <div className="text-[10px] text-text-dim flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Running
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={stopModel} className="p-2 rounded-lg hover:bg-red-500/15 text-text-muted hover:text-red-400 transition-colors" title="Stop model">
                  <IconStop size={16} />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-colors">
                  <IconSettings size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16 text-text-dim text-sm">
                  Start a conversation with {selected.name}
                </div>
              )}
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-white/5'
                  }`}>
                    {msg.role === 'user' ? (
                      <IconBrain size={16} className="text-indigo-300" />
                    ) : selected.customIcon ? (
                      <img src={selected.customIcon} alt="" className="w-5 h-5 object-cover rounded" />
                    ) : (
                      <img src={getBaseLogo(selected.baseModelId)} alt="" className="w-5 h-5 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className={`rounded-xl px-4 py-3 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/15 border border-indigo-500/10'
                      : 'glass'
                  }`}>
                    <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
                    {msg.role === 'assistant' && isTyping && msg === messages[messages.length - 1] && (
                      <span className="inline-block w-1.5 h-4 bg-indigo-400 animate-pulse ml-0.5 rounded-sm" />
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/5 p-4 bg-abyss/30">
              <div className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500/40 transition-all"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <IconSend size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   SYSTEM INFO PAGE
   ═══════════════════════════════════════════════════ */
function SystemPage({ device, isOnline }: { device: DeviceInfo; isOnline: boolean }) {
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(est => {
        setStorageEstimate({ usage: est.usage || 0, quota: est.quota || 0 });
      });
    }
  }, []);

  const fmtBytes = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
    return (b / 1073741824).toFixed(1) + ' GB';
  };

  const sections: { title: string; icon: ReactNode; rows: { label: string; value: string; highlight?: boolean }[] }[] = [
    {
      title: 'Operating System',
      icon: <IconMonitor size={20} />,
      rows: [
        { label: 'OS', value: device.os },
        { label: 'Version', value: device.osVersion || 'N/A' },
        { label: 'Device Type', value: device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1) },
        { label: 'Architecture', value: device.architecture },
      ],
    },
    {
      title: 'Hardware',
      icon: <IconCpu size={20} />,
      rows: [
        { label: 'CPU Cores', value: device.cores.toString() },
        { label: 'Memory', value: device.memory + ' GB' },
        { label: 'GPU', value: device.gpu.length > 50 ? device.gpu.slice(0, 50) + '...' : device.gpu },
      ],
    },
    {
      title: 'Browser & Runtime',
      icon: <IconServer size={20} />,
      rows: [
        { label: 'Browser', value: device.browser },
        { label: 'Electron', value: device.isElectron ? 'Yes' : 'No' },
        { label: 'Capacitor', value: device.isCapacitor ? 'Yes' : 'No' },
        { label: 'PWA Mode', value: device.isPWA ? 'Yes' : 'No' },
      ],
    },
    {
      title: 'Network & Storage',
      icon: isOnline ? <IconWifi size={20} /> : <IconWifiOff size={20} />,
      rows: [
        { label: 'Status', value: isOnline ? 'Online' : 'Offline', highlight: true },
        { label: 'Storage Used', value: storageEstimate ? fmtBytes(storageEstimate.usage) : 'N/A' },
        { label: 'Storage Quota', value: storageEstimate ? fmtBytes(storageEstimate.quota) : 'N/A' },
      ],
    },
    {
      title: 'Installer',
      icon: <IconDownload size={20} />,
      rows: [
        { label: 'Package Type', value: device.installerType },
        { label: 'Extension', value: device.installerExt },
        { label: 'Offline Support', value: 'GGUF + ONNX Runtime' },
        { label: 'Backend', value: 'llama.cpp / ONNX' },
      ],
    },
  ];

  // Compute compatibility score
  const score = Math.min(100, (device.cores >= 4 ? 25 : 10) + (device.memory >= 8 ? 25 : device.memory >= 4 ? 15 : 5) + (device.gpu !== 'Unknown' ? 25 : 10) + (isOnline ? 15 : 5) + (device.deviceType === 'desktop' ? 10 : 5));

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <IconMonitor size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-bright">System Information</h1>
          <p className="text-sm text-text-muted">Device capabilities and compatibility analysis</p>
        </div>
      </div>

      {/* Compatibility score */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff08" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-bright">{score}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-bright mb-1">
              {score >= 75 ? 'Excellent Compatibility' : score >= 50 ? 'Good Compatibility' : 'Limited Compatibility'}
            </h3>
            <p className="text-sm text-text-muted">
              {score >= 75
                ? 'Your device is well-suited for running AI models locally with full performance.'
                : score >= 50
                ? 'Your device can run most quantized models. Consider Q4 quantization for best experience.'
                : 'Your device may struggle with larger models. Use cloud inference or small Q4 models.'}
            </p>
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4 text-text-muted">
              {s.icon}
              <h3 className="text-sm font-semibold text-text-bright">{s.title}</h3>
            </div>
            <div className="space-y-2.5">
              {s.rows.map((r, j) => (
                <div key={j} className="flex justify-between items-center">
                  <span className="text-xs text-text-dim">{r.label}</span>
                  <span className={`text-xs font-mono ${
                    r.highlight ? (r.value === 'Online' ? 'text-emerald-400' : 'text-red-400') : 'text-text-muted'
                  } text-right max-w-[60%] truncate`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* User agent */}
      <div className="glass rounded-2xl p-5 mt-5">
        <h3 className="text-sm font-semibold text-text-bright mb-3">User Agent String</h3>
        <code className="text-[11px] text-text-dim font-mono break-all leading-relaxed block">{navigator.userAgent}</code>
      </div>
    </motion.div>
  );
}
