import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedModel } from '../data/builderQuestions';

interface Props {
  onBack: () => void;
  onChat: (model: SavedModel) => void;
}

function detectDevice(): { os: string; format: string; icon: string } {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return { os: 'iOS', format: '.ipa', icon: '🍎' };
  if (/android/.test(ua)) return { os: 'Android', format: '.apk', icon: '🤖' };
  if (/macintosh|mac os/.test(ua)) return { os: 'macOS', format: '.dmg', icon: '🍏' };
  if (/linux/.test(ua)) return { os: 'Linux', format: '.AppImage', icon: '🐧' };
  return { os: 'Windows', format: '.exe', icon: '🪟' };
}

export default function MyModels({ onBack, onChat }: Props) {
  const [models, setModels] = useState<SavedModel[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const device = detectDevice();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ai_forge_models') || '[]');
    setModels(saved);
  }, []);

  const deleteModel = (id: string) => {
    const updated = models.filter(m => m.id !== id);
    setModels(updated);
    localStorage.setItem('ai_forge_models', JSON.stringify(updated));
  };

  const installModel = (id: string) => {
    setInstalling(id);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
        const updated = models.map(m => m.id === id ? { ...m, installed: true, installProgress: 100 } : m);
        setModels(updated);
        localStorage.setItem('ai_forge_models', JSON.stringify(updated));
        setInstalling(null);

        // Download config file
        const model = models.find(m => m.id === id);
        if (model) {
          const config = {
            name: model.name,
            version: model.version,
            format: device.format,
            os: device.os,
            sourceModels: model.sourceModels,
            permissions: model.permissions,
            size: `${model.size}MB`,
            createdAt: new Date(model.createdAt).toISOString(),
          };
          const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${model.name}-v${model.version}-config.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        const updated = models.map(m => m.id === id ? { ...m, installProgress: progress } : m);
        setModels(updated);
      }
    }, 60);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition font-space text-sm">
            ← Back to Home
          </button>
          <h2 className="font-orbitron font-bold text-xl gradient-text">📦 My Models</h2>
          <div className="text-sm text-gray-500 font-space">{models.length} models</div>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-orbitron font-bold text-xl text-gray-400 mb-2">No Models Yet</h3>
            <p className="text-gray-600 font-space text-sm mb-6">Build your first AI model to see it here!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-orbitron font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
            >
              ⚡ Start Building
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {models.map(model => (
                <motion.div
                  key={model.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="glass rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-0.5">
                        <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center text-2xl">
                          🧠
                        </div>
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-lg gradient-text">{model.name}</h3>
                        <p className="text-xs text-gray-500 font-space">
                          v{model.version} • {model.sourceModels.length} models • {model.size}MB
                        </p>
                        <p className="text-xs text-gray-600 font-space mt-1">
                          Created {new Date(model.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {model.installed && (
                        <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-space font-semibold">
                          ✅ Installed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Source models preview */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {model.sourceModels.slice(0, 8).map((name, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-space">
                        {name}
                      </span>
                    ))}
                    {model.sourceModels.length > 8 && (
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-500 font-space">
                        +{model.sourceModels.length - 8} more
                      </span>
                    )}
                  </div>

                  {/* Permissions */}
                  {model.permissions && model.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {model.permissions.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-green-500/10 rounded text-[10px] text-green-400 font-space">
                          🔐 {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Install progress */}
                  {installing === model.id && (
                    <div className="mb-4">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
                          style={{ width: `${model.installProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-space mt-1 text-center">
                        Installing... {model.installProgress}%
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => onChat(model)}
                      className="px-4 py-2 bg-primary/15 text-primary rounded-xl text-sm font-space font-semibold hover:bg-primary/25 transition"
                    >
                      💬 Chat
                    </button>

                    {!model.installed && installing !== model.id && (
                      <button
                        onClick={() => installModel(model.id)}
                        className="px-4 py-2 bg-green-500/15 text-green-400 rounded-xl text-sm font-space font-semibold hover:bg-green-500/25 transition"
                      >
                        {device.icon} Install ({device.format})
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const config = JSON.stringify(model, null, 2);
                        const blob = new Blob([config], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${model.name}-v${model.version}-full-config.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-sm font-space hover:bg-white/10 transition"
                    >
                      📥 Export
                    </button>

                    <button
                      onClick={() => {
                        const text = `Check out my custom AI model "${model.name}" v${model.version} built from ${model.sourceModels.length} AI models! Built with AI FORGE 🧠⚡`;
                        if (navigator.share) {
                          navigator.share({ title: model.name, text });
                        } else {
                          navigator.clipboard.writeText(text);
                        }
                      }}
                      className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-sm font-space hover:bg-white/10 transition"
                    >
                      🔗 Share
                    </button>

                    <button
                      onClick={() => deleteModel(model.id)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-space hover:bg-red-500/20 transition ml-auto"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
