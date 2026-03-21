import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { detectDevice, getInstallerInfo, getHardwareAssessment, getPlatformIcon } from '@/services/deviceDetection';
import type { DeviceInfo, Platform } from '@/types';
import DownloadCard from '@/components/install/DownloadCard';
import DownloadManager from '@/components/install/DownloadManager';

interface GgufModel {
  modelId: string;
  name: string;
  quant: string;
  size: number;
  url: string;
  fileName: string;
}

export default function InstallPage() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [ggufModels, setGgufModels] = useState<GgufModel[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    const d = detectDevice();
    setDevice(d);
    setSelectedPlatform(d.platform);

    // Fetch GGUF model list
    fetch('/api/install/gguf-models')
      .then((r) => r.json())
      .then((data) => setGgufModels(data.data || []))
      .catch(() => {});
  }, []);

  const installer = useMemo(() => {
    if (!device) return null;
    return getInstallerInfo({ ...device, platform: selectedPlatform || device.platform });
  }, [device, selectedPlatform]);

  const hardware = useMemo(() => {
    if (!device) return null;
    return getHardwareAssessment(device);
  }, [device]);

  if (!device) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </motion.div>
      </div>
    );
  }

  const platforms: Array<{ key: Platform; label: string }> = [
    { key: 'windows', label: 'Windows' },
    { key: 'macos', label: 'macOS' },
    { key: 'linux', label: 'Linux' },
    { key: 'android', label: 'Android' },
    { key: 'ios', label: 'iOS' },
  ];

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
            <span className="text-sm text-white/60">Install</span>
          </div>
          <Link to="/chat" className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10">
            Chat
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Device detection results */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Your Device
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBox label="Platform" value={device.platform.charAt(0).toUpperCase() + device.platform.slice(1)} />
              <InfoBox label="Architecture" value={device.architecture.toUpperCase()} />
              <InfoBox label="CPU Cores" value={device.cores ? String(device.cores) : 'Unknown'} />
              <InfoBox label="RAM" value={device.ram ? `${device.ram} GB` : 'Unknown'} />
              <InfoBox label="GPU" value={device.gpu?.renderer || 'Not detected'} />
              <InfoBox label="VRAM" value={device.gpu?.vram ? `${device.gpu.vram} GB` : 'Unknown'} />
              <InfoBox label="WebGPU" value={device.supportsWebGPU ? 'Supported' : 'No'} />
              <InfoBox label="WASM" value={device.supportsWASM ? 'Supported' : 'No'} />
            </div>

            {hardware && (
              <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    hardware.inferenceSpeed === 'fast' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                    hardware.inferenceSpeed === 'moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/20 text-red-400 border-red-500/20'
                  }`}>
                    {hardware.inferenceSpeed.toUpperCase()}
                  </span>
                  <span className="text-sm text-white/60">
                    Max model: <strong className="text-white">{hardware.maxModelSize}</strong> parameters
                  </span>
                </div>
                <p className="text-xs text-white/40">{hardware.recommendation}</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Platform installer selector */}
        <section>
          <h2 className="text-xl font-bold mb-4">Download Installer</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {platforms.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPlatform(p.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
                  ${selectedPlatform === p.key
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                    : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                  }
                  ${p.key === device.platform ? 'ring-1 ring-cyan-500/20' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                  <path d={getPlatformIcon(p.key)} fill="currentColor" />
                </svg>
                <span className="text-sm">{p.label}</span>
                {p.key === device.platform && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-cyan-500/20 text-cyan-400 rounded">
                    DETECTED
                  </span>
                )}
              </button>
            ))}
          </div>

          {installer && (
            <motion.div
              key={selectedPlatform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20
                                border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d={getPlatformIcon(installer.platform)} fill="#00D4FF" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{installer.fileName}</h3>
                  <div className="flex items-center gap-3 text-sm text-white/40 mt-1">
                    <span>{(installer.fileSize / 1_000_000).toFixed(0)} MB</span>
                    <span>·</span>
                    <span>v{installer.version}</span>
                    <span>·</span>
                    <span>{installer.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/30 mb-4">{installer.requirements}</p>

              <div className="flex items-center gap-3">
                <a
                  href={installer.downloadUrl}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                             text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download for {selectedPlatform?.charAt(0).toUpperCase()}{selectedPlatform?.slice(1)}
                </a>
              </div>

              {installer.platform === 'ios' && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-300">
                    iOS requires sideloading since no Apple Developer account is configured.
                    Use AltStore or Sideloadly to install the .ipa file on your device.
                  </p>
                </div>
              )}

              {/* What's included */}
              <div className="mt-6 space-y-2">
                <h4 className="text-xs text-white/40 uppercase tracking-wider">Included in installer</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '⚛', text: 'Model Forge UI (React)' },
                    { icon: '🔧', text: 'Express API Server' },
                    { icon: '🦙', text: 'llama.cpp Runtime' },
                    { icon: '💾', text: 'Local SQLite Database' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/40 p-2 bg-white/[0.02] rounded-lg">
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Downloadable GGUF models */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Download Models for Offline Use</h2>
              <p className="text-sm text-white/40 mt-1">
                GGUF models run locally via llama.cpp — no internet required after download
              </p>
            </div>
            {hardware && (
              <span className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-lg">
                Recommended: up to {hardware.maxModelSize}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ggufModels.map((model) => (
              <DownloadCard key={model.modelId} model={model} />
            ))}
          </div>
        </section>

        {/* Active downloads */}
        <section>
          <DownloadManager />
        </section>

        {/* Build instructions */}
        <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Build From Source</h2>
          <div className="space-y-4">
            <BuildStep
              num={1}
              title="Clone and install"
              code="git clone https://github.com/modelforge/app.git && cd app && npm install"
            />
            <BuildStep
              num={2}
              title="Build the frontend"
              code="npm run build"
            />
            <BuildStep
              num={3}
              title="Build Electron (Windows)"
              code="npx electron-builder --win --x64"
            />
            <BuildStep
              num={3}
              title="Build Capacitor (Android)"
              code="npx cap sync android && cd android && ./gradlew assembleDebug"
            />
            <BuildStep
              num={4}
              title="Download llama.cpp binary"
              code="# Download from https://github.com/ggerganov/llama.cpp/releases&#10;# Place llama-server binary in ./bin/ directory"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
      <div className="text-[10px] text-white/25 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-white font-mono mt-0.5 truncate">{value}</div>
    </div>
  );
}

function BuildStep({ num, title, code }: { num: number; title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.replace(/&#10;/g, '\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 font-bold">
          {num}
        </span>
        <span className="text-sm text-white/60">{title}</span>
      </div>
      <div className="relative group">
        <pre className="bg-black/60 border border-white/5 rounded-lg p-3 text-xs text-cyan-400/80 font-mono overflow-x-auto">
          {code.replace(/&#10;/g, '\n')}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] bg-white/5 text-white/30
                     opacity-0 group-hover:opacity-100 transition-opacity hover:text-white/60"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}