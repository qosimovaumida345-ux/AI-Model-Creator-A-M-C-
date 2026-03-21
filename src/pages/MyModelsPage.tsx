import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForgeStore } from '@/stores/forgeStore';
import ForgedModelCard from '@/components/forge/ForgedModelCard';

export default function MyModelsPage() {
  const { forgedModels, loadForgedModels, deleteForgedModel } = useForgeStore();

  useEffect(() => {
    loadForgedModels();
  }, [loadForgedModels]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-lg font-bold">Model Forge</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm text-white/60">My Models</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/forge" className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20
                       border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:border-cyan-400/50 transition-colors">
              New Forge
            </Link>
            <Link to="/chat" className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
              Chat
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {forgedModels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10
                            flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.5" className="text-white/20">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Forged Models Yet</h2>
            <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
              Create your first custom AI model by fine-tuning a base model with your own data.
            </p>
            <Link
              to="/forge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r
                         from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg
                         hover:shadow-cyan-500/20 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Start Forging
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Forged Models</h1>
              <span className="text-sm text-white/30">{forgedModels.length} model{forgedModels.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forgedModels.map((model) => (
                <ForgedModelCard key={model.id} model={model} onDelete={deleteForgedModel} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}