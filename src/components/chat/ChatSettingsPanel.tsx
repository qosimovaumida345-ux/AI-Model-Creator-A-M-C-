import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSettings } from '@/types';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props {
  settings: ChatSettings;
  onChange: (settings: Partial<ChatSettings>) => void;
}

export default function ChatSettingsPanel({ settings, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings: appSettings, setOpenRouterKey } = useSettingsStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60
                   hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 z-50 w-80 bg-gray-900/95 backdrop-blur-xl
                         border border-white/10 rounded-xl p-4 shadow-2xl space-y-4"
            >
              <h3 className="text-sm font-semibold text-white">Chat Settings</h3>

              {/* OpenRouter API Key */}
              <div>
                <label className="text-[11px] text-white/40 uppercase tracking-wider">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={appSettings.inference.openRouterApiKey || ''}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                             text-white text-xs placeholder-white/20 focus:outline-none
                             focus:border-cyan-500/50"
                />
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400/60 hover:text-cyan-400 mt-1 inline-block"
                >
                  Get free key at openrouter.ai/keys
                </a>
              </div>

              {/* Temperature */}
              <SliderSetting
                label="Temperature"
                value={settings.temperature}
                min={0} max={2} step={0.05}
                onChange={(v) => onChange({ temperature: v })}
              />

              {/* Top P */}
              <SliderSetting
                label="Top P"
                value={settings.topP}
                min={0} max={1} step={0.05}
                onChange={(v) => onChange({ topP: v })}
              />

              {/* Max Tokens */}
              <SliderSetting
                label="Max Tokens"
                value={settings.maxTokens}
                min={64} max={16384} step={64}
                onChange={(v) => onChange({ maxTokens: v })}
                format={(v) => v.toLocaleString()}
              />

              {/* System Prompt */}
              <div>
                <label className="text-[11px] text-white/40 uppercase tracking-wider">
                  System Prompt
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => onChange({ systemPrompt: e.target.value })}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                             text-white text-xs placeholder-white/20 resize-none
                             focus:outline-none focus:border-cyan-500/50"
                  placeholder="You are a helpful AI assistant."
                />
              </div>

              {/* Frequency Penalty */}
              <SliderSetting
                label="Frequency Penalty"
                value={settings.frequencyPenalty}
                min={0} max={2} step={0.05}
                onChange={(v) => onChange({ frequencyPenalty: v })}
              />

              {/* Presence Penalty */}
              <SliderSetting
                label="Presence Penalty"
                value={settings.presencePenalty}
                min={0} max={2} step={0.05}
                onChange={(v) => onChange({ presencePenalty: v })}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Slider sub-component ─────────────────────────────────────
function SliderSetting({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] text-white/40 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-cyan-400 font-mono">
          {format ? format(value) : value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                   [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,212,255,0.5)]"
      />
    </div>
  );
}