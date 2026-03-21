import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ForgeStudio from '@/components/forge/ForgeStudio';
import { useForgeStore } from '@/stores/forgeStore';

export default function ForgePage() {
  const { error, clearError } = useForgeStore();

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

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
            <span className="text-sm text-white/60">Forge Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/my-models" className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
              My Models
            </Link>
            <Link to="/chat" className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
              Chat
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between"
          >
            <span className="text-sm text-red-300">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300 text-sm">Dismiss</button>
          </motion.div>
        )}

        <ForgeStudio />
      </main>
    </div>
  );
}