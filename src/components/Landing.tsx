import { motion } from 'framer-motion';
import { AI_MODELS } from '../data/aiModels';

interface Props {
  onStart: () => void;
  onMyModels: () => void;
}

const floatingIcons = ['🧠', '🤖', '⚡', '🔮', '🌐', '💎', '🚀', '✨', '🎯', '🔬', '💻', '🎨'];

export default function Landing({ onStart, onMyModels }: Props) {
  const uniqueCompanies = new Set(AI_MODELS.map(m => m.company)).size;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,0.1)_0%,transparent_50%)]" />

      {/* Floating icons */}
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-4xl opacity-20 pointer-events-none select-none"
          style={{
            left: `${10 + (i % 6) * 15}%`,
            top: `${10 + Math.floor(i / 6) * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, i % 2 === 0 ? 15 : -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        >
          {icon}
        </motion.div>
      ))}

      {/* Orbiting ring */}
      <div className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-white/5 animate-spin-slow">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-primary/50 rounded-full"
            style={{
              top: `${50 + 48 * Math.sin((i * Math.PI) / 2)}%`,
              left: `${50 + 48 * Math.cos((i * Math.PI) / 2)}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300 font-space">
            {AI_MODELS.length}+ AI Models from {uniqueCompanies}+ Companies Available
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl font-orbitron font-black mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="gradient-text">AI FORGE</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-300 font-space mb-4 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Build Your Own AI Model from the World's Best
        </motion.p>

        <motion.p
          className="text-sm sm:text-base text-gray-500 mb-12 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Select from every AI model ever created. Combine their strengths.
          Answer 6 questions. Forge something unique. Install & use offline.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <button
            onClick={onStart}
            className="group relative px-10 py-4 rounded-xl font-orbitron font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient" />
            <div className="absolute inset-[2px] bg-dark-900 rounded-[10px]" />
            <span className="relative z-10 flex items-center gap-3 text-white">
              ⚡ Start Building
            </span>
          </button>

          <button
            onClick={onMyModels}
            className="px-8 py-4 rounded-xl font-space font-semibold text-gray-300 glass hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
          >
            📦 My Models Library
          </button>
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="relative z-10 mt-20 flex flex-wrap justify-center gap-8 sm:gap-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        {[
          { value: `${AI_MODELS.length}+`, label: 'AI Models' },
          { value: `${uniqueCompanies}+`, label: 'Companies' },
          { value: '10', label: 'Categories' },
          { value: '∞', label: 'Possibilities' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl sm:text-3xl font-orbitron font-bold gradient-text">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-space mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary/60 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
