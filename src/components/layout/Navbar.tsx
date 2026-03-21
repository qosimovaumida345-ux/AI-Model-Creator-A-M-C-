import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSyncStore } from '@/stores/syncStore';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/models', label: 'Models' },
  { path: '/forge', label: 'Forge' },
  { path: '/chat', label: 'Chat' },
  { path: '/my-models', label: 'My Models' },
  { path: '/install', label: 'Install' },
  { path: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const location = useLocation();
  const { isSyncing } = useSyncStore();

  // Hide navbar on chat page (has its own layout)
  if (location.pathname.startsWith('/chat')) return null;

  return (
    <header className="border-b border-white/10 bg-black/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Model Forge</span>
            <span className="text-[8px] text-cyan-400/60 font-medium uppercase tracking-widest ml-1.5">BETA</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-1.5 text-sm rounded-lg transition-colors
                  ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-white/[0.08] rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {isSyncing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-cyan-400/40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </motion.div>
          )}

          <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-400' : 'bg-red-400'}`} />

          {/* Mobile menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 text-white/60 hover:text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-14 z-50 w-48 bg-gray-900/95 backdrop-blur-xl
                       border border-white/10 rounded-xl py-2 shadow-2xl"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm transition-colors
                  ${location.pathname.startsWith(item.path) && item.path !== '/'
                    ? 'text-cyan-400 bg-cyan-500/5'
                    : location.pathname === item.path
                      ? 'text-cyan-400 bg-cyan-500/5'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

// Need useState import
import { useState } from 'react';