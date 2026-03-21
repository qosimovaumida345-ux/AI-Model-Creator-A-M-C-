import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { modelCount } from '@/data/models';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Model Forge
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fine-tune, chat with, and deploy {modelCount}+ AI models.
            Real inference, real training, real results — no fake responses.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/models"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 transition-all"
            >
              Explore Models
            </Link>
            <Link
              to="/chat"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Start Chatting
            </Link>
            <Link
              to="/forge"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Forge a Model
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: `${modelCount}+`, label: 'AI Models' },
            { value: '50+', label: 'Providers' },
            { value: 'Real', label: 'Inference' },
            { value: '100%', label: 'Offline Ready' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-xs text-white/30 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real AI Chat',
                desc: 'Chat with 500+ models via OpenRouter or local Ollama. Every response is real — zero hardcoded strings.',
                icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
              },
              {
                title: 'Fine-Tune Models',
                desc: 'Upload your data, configure LoRA parameters, and train on Replicate GPUs with live loss charts.',
                icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
              },
              {
                title: 'Run Offline',
                desc: 'Download GGUF models, install the desktop app, and run everything locally with llama.cpp.',
                icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        AI Model Forge v1.0.0 — Built with React, Three.js, and real AI
      </footer>
    </div>
  );
}