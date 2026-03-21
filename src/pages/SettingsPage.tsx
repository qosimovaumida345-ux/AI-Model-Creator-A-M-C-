import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSyncStore } from '@/stores/syncStore';
import { useForgeStore } from '@/stores/forgeStore';
import { useChatStore } from '@/stores/chatStore';
import { exportAllData, importData } from '@/services/syncService';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const sync = useSyncStore();
  const forge = useForgeStore();
  const chat = useChatStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'sync' | 'data'>('general');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importData(file);
      setImportResult(`Imported ${result.importedModels} models and ${result.importedSessions} sessions`);
      forge.loadForgedModels();
      chat.loadSessions();
    } catch (err: unknown) {
      setImportResult(`Error: ${err instanceof Error ? err.message : 'Import failed'}`);
    }
  };

  const tabs = [
    { key: 'general' as const, label: 'General' },
    { key: 'api' as const, label: 'API Keys' },
    { key: 'sync' as const, label: 'Sync' },
    { key: 'data' as const, label: 'Data' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
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
            <span className="text-sm text-white/60">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.key ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="settings-tab"
                  className="absolute inset-0 bg-white/10 rounded-lg border border-white/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* General */}
          {activeTab === 'general' && (
            <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Section title="Appearance">
                <ToggleOption
                  label="Animations"
                  description="Enable smooth transitions and animations"
                  checked={settings.settings.animations}
                  onChange={(v) => settings.updateSettings({ animations: v })}
                />
                <ToggleOption
                  label="Reduced Motion"
                  description="Minimize animations for accessibility"
                  checked={settings.settings.reducedMotion}
                  onChange={(v) => settings.updateSettings({ reducedMotion: v })}
                />
                <ToggleOption
                  label="Show Model Variants"
                  description="Display GGUF quantized variants in model gallery"
                  checked={settings.settings.showVariants}
                  onChange={(v) => settings.updateSettings({ showVariants: v })}
                />
                <ToggleOption
                  label="Compact Model Cards"
                  description="Use smaller cards in model gallery"
                  checked={settings.settings.compactModelCards}
                  onChange={(v) => settings.updateSettings({ compactModelCards: v })}
                />
              </Section>

              <Section title="Inference">
                <div className="space-y-3">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Default Mode</label>
                  <div className="flex gap-2">
                    {(['auto', 'online', 'offline'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => settings.setInferenceMode(mode)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors
                          ${settings.inferenceMode === mode
                            ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                            : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/60'}`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            </motion.div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Section title="API Keys" description="Keys are stored locally in your browser and never sent to our servers">
                <KeyInput
                  label="OpenRouter"
                  value={settings.settings.inference.openRouterApiKey || ''}
                  onChange={settings.setOpenRouterKey}
                  placeholder="sk-or-v1-..."
                  helpUrl="https://openrouter.ai/keys"
                  helpText="Free key — access many free models"
                />
                <KeyInput
                  label="OpenAI"
                  value={settings.settings.inference.openaiApiKey || ''}
                  onChange={settings.setOpenAIKey}
                  placeholder="sk-..."
                  helpUrl="https://platform.openai.com/api-keys"
                  helpText="For GPT-4o, o1, DALL-E, Whisper"
                />
                <KeyInput
                  label="Anthropic"
                  value={settings.settings.inference.anthropicApiKey || ''}
                  onChange={settings.setAnthropicKey}
                  placeholder="sk-ant-..."
                  helpUrl="https://console.anthropic.com/settings/keys"
                  helpText="For Claude 3.5 Sonnet, Opus, Haiku"
                />
                <KeyInput
                  label="Google AI"
                  value={settings.settings.inference.googleApiKey || ''}
                  onChange={settings.setGoogleKey}
                  placeholder="AIza..."
                  helpUrl="https://aistudio.google.com/app/apikey"
                  helpText="For Gemini models"
                />
              </Section>
            </motion.div>
          )}

          {/* Sync */}
          {activeTab === 'sync' && (
            <motion.div key="sync" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Section title="Cloud Sync" description="Sync forged models and chat history across devices">
                <ToggleOption
                  label="Auto Sync"
                  description="Automatically sync data when online"
                  checked={sync.autoSyncEnabled}
                  onChange={(v) => sync.setAutoSync(v)}
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => sync.fullSync()}
                    disabled={sync.isSyncing}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm
                               hover:bg-cyan-500/30 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {sync.isSyncing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                      </motion.div>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                      </svg>
                    )}
                    {sync.isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>

                  {sync.lastSyncedAt && (
                    <span className="text-xs text-white/30">
                      Last synced: {new Date(sync.lastSyncedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {sync.syncError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-300">{sync.syncError}</p>
                    <button onClick={sync.clearError} className="text-[10px] text-red-400 mt-1 hover:underline">Dismiss</button>
                  </div>
                )}
              </Section>

              {/* Devices */}
              {sync.devices.length > 0 && (
                <Section title="Connected Devices">
                  <div className="space-y-2">
                    {sync.devices.map((device) => (
                      <div key={device.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-white">{device.name}</div>
                          <div className="text-[10px] text-white/30">
                            {device.platform} · Last seen {new Date(device.lastSeen).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </motion.div>
          )}

          {/* Data */}
          {activeTab === 'data' && (
            <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Section title="Data Management">
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="Forged Models" value={forge.forgedModels.length} />
                  <StatBox label="Chat Sessions" value={chat.sessions.length} />
                </div>
              </Section>

              <Section title="Export & Import">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => exportAllData()}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm
                               hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Export All Data
                  </button>

                  <button
                    onClick={() => importRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm
                               hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Import Data
                  </button>
                  <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                </div>

                {importResult && (
                  <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <p className="text-xs text-cyan-300">{importResult}</p>
                  </div>
                )}
              </Section>

              <Section title="Danger Zone">
                <button
                  onClick={() => {
                    if (confirm('Delete all chat sessions? This cannot be undone.')) {
                      chat.sessions.forEach((s) => chat.deleteSession(s.id));
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm
                             hover:bg-red-500/20 transition-colors"
                >
                  Clear All Chat History
                </button>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="text-[11px] text-white/30 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleOption({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm text-white/80">{label}</div>
        <div className="text-[11px] text-white/30">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function KeyInput({ label, value, onChange, placeholder, helpUrl, helpText }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; helpUrl: string; helpText: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-white/50">{label}</label>
        <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400/60 hover:text-cyan-400">
          {helpText}
        </a>
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-16 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                     placeholder-white/15 focus:outline-none focus:border-cyan-500/50 font-mono"
        />
        <button
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] text-white/30 hover:text-white/60 rounded"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {value && (
        <div className="flex items-center gap-1 text-[10px] text-green-400/60">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Configured
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5 text-center">
      <div className="text-2xl font-bold text-cyan-400">{value}</div>
      <div className="text-[11px] text-white/30 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}