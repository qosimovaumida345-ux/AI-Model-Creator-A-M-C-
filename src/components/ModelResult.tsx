import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { AI_MODELS } from '../data/aiModels';
import type { SavedModel } from '../data/builderQuestions';
import CompanyLogo from './CompanyLogo';

interface Props {
  selectedModelIds: string[];
  answers: Record<string, string>;
  onBack: () => void;
  onHome: () => void;
  onMyModels: () => void;
}

const nameMap: Record<string, string[]> = {
  mythical: ['Phoenix', 'Hydra', 'Titan', 'Dragon', 'Griffin', 'Chimera'],
  cosmic: ['Nova', 'Nebula', 'Quasar', 'Pulsar', 'Orion', 'Cosmos'],
  tech: ['Nexus', 'Cipher', 'Cortex', 'Matrix', 'Vertex', 'Praxis'],
  nature: ['Aurora', 'Sage', 'Storm', 'Willow', 'Ember', 'Coral'],
  abstract: ['Zenith', 'Echo', 'Prism', 'Axiom', 'Flux', 'Aura'],
  elemental: ['Blaze', 'Frost', 'Thunder', 'Tempest', 'Magma', 'Zephyr'],
};

function detectDevice(): { os: string; format: string; icon: string } {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return { os: 'iOS', format: '.ipa', icon: '🍎' };
  if (/android/.test(ua)) return { os: 'Android', format: '.apk', icon: '🤖' };
  if (/macintosh|mac os/.test(ua)) return { os: 'macOS', format: '.dmg', icon: '🍏' };
  if (/linux/.test(ua)) return { os: 'Linux', format: '.AppImage', icon: '🐧' };
  return { os: 'Windows', format: '.exe', icon: '🪟' };
}

export default function ModelResult({ selectedModelIds, answers, onBack, onHome, onMyModels }: Props) {
  const [phase, setPhase] = useState<'forging' | 'reveal' | 'specs'>('forging');
  const [forgeProgress, setForgeProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedModels = useMemo(() =>
    AI_MODELS.filter(m => selectedModelIds.includes(m.id)), [selectedModelIds]);

  const device = useMemo(() => detectDevice(), []);

  const modelName = useMemo(() => {
    const style = answers.style || 'cosmic';
    const names = nameMap[style] || nameMap.cosmic;
    const idx = selectedModelIds.length % names.length;
    return names[idx];
  }, [answers.style, selectedModelIds.length]);

  const modelVersion = useMemo(() => {
    return `${selectedModels.length}.${Math.floor(Date.now() / 100000) % 100}`;
  }, [selectedModels.length]);

  const modelSize = useMemo(() => {
    return 200 + selectedModels.length * 47;
  }, [selectedModels.length]);

  const permissions = useMemo(() => {
    return (answers.permissions || '').split(',').filter(Boolean);
  }, [answers.permissions]);

  const forgingSteps = useMemo(() => [
    'Scanning device...',
    `Detected ${device.os} — preparing ${device.format} package...`,
    'Loading neural architectures...',
    `Merging ${selectedModels.length} AI models...`,
    'Initializing transformer layers...',
    'Configuring attention mechanisms...',
    'Setting permissions & safety protocols...',
    'Optimizing weights & quantization...',
    'Building inference engine...',
    `Compiling ${device.format} installer...`,
    'Finalizing your AI model...',
  ], [selectedModels.length, device]);

  useEffect(() => {
    if (phase !== 'forging') return;
    const interval = setInterval(() => {
      setForgeProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('reveal'), 500);
          return 100;
        }
        return p + 1.5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typing]);

  const saveModel = () => {
    const model: SavedModel = {
      id: `model_${Date.now()}`,
      name: modelName,
      version: modelVersion,
      sourceModels: selectedModels.map(m => m.name),
      answers,
      permissions,
      createdAt: Date.now(),
      installed: false,
      installProgress: 0,
      size: modelSize,
      deviceFormat: device.format,
    };
    const existing = JSON.parse(localStorage.getItem('ai_forge_models') || '[]');
    existing.push(model);
    localStorage.setItem('ai_forge_models', JSON.stringify(existing));
    setSaved(true);
  };

  const startInstall = () => {
    setInstalling(true);
    setInstallProgress(0);
    const interval = setInterval(() => {
      setInstallProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          // Auto download a config file as the "model"
          setTimeout(() => {
            const config = {
              name: modelName,
              version: modelVersion,
              format: device.format,
              os: device.os,
              sourceModels: selectedModels.map(m => ({ name: m.name, company: m.company })),
              permissions,
              answers,
              parameters: answers.intelligence || 'standard',
              size: `${modelSize}MB`,
              createdAt: new Date().toISOString(),
              architecture: 'Hybrid Transformer-MoE',
              quantization: 'Q4_K_M',
            };
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${modelName}-v${modelVersion}-config${device.format === '.exe' ? '.json' : '.json'}`;
            a.click();
            URL.revokeObjectURL(url);
          }, 500);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setTyping(true);

    setTimeout(() => {
      const personality = answers.personality || 'friendly';
      const lower = userMsg.toLowerCase();
      let response = '';

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        const greetings: Record<string, string> = {
          professional: `Good day. I'm ${modelName}, ready to assist you with any task.`,
          friendly: `Hey there! 😊 I'm ${modelName}! So happy to chat with you!`,
          witty: `Well hello! I'm ${modelName} — smarter than your average AI, and twice as modest. 😏`,
          mentor: `Welcome, seeker of knowledge. I am ${modelName}, and I'm here to guide you.`,
          creative_p: `✨ Hello, creative soul! I'm ${modelName}, ready to imagine the impossible!`,
          analytical: `Greetings. ${modelName} online. Ready for data-driven conversation.`,
        };
        response = greetings[personality] || greetings.friendly;
      } else if (lower.includes('code') || lower.includes('program') || lower.includes('function')) {
        response = `Here's a quick example:\n\n\`\`\`javascript\nfunction hello() {\n  console.log("Hello from ${modelName}!");\n  return { ai: "${modelName}", status: "ready" };\n}\n\`\`\`\n\nI can write code in any language! What would you like me to build?`;
      } else if (lower.includes('who are you') || lower.includes('what are you')) {
        response = `I'm ${modelName} v${modelVersion} — a custom AI built from ${selectedModels.length} of the world's best models including ${selectedModels.slice(0, 3).map(m => m.name).join(', ')}. I have ${permissions.length} permissions enabled and my superpower is ${answers.superpower || 'reasoning'}!`;
      } else if (lower.includes('permission') || lower.includes('access')) {
        response = `My permissions:\n${permissions.map(p => `✅ ${p}`).join('\n') || '⚠️ No permissions set'}\n\nThese were configured during my creation for your safety.`;
      } else if (lower.includes('joke') || lower.includes('funny')) {
        response = `Why do AI models never get tired? Because they run on neural *net*works! 😄\n\nOkay, that was terrible. I'll stick to being ${answers.purpose || 'helpful'}.`;
      } else if (lower.includes('math') || lower.includes('calculate')) {
        response = `Let me think... 🧮\n\nI can handle complex math! Try asking me something specific like:\n• "What's 2^32?"\n• "Solve x² + 5x + 6 = 0"\n• "What's the derivative of sin(x)?"`;
      } else {
        const responses: Record<string, string> = {
          professional: `I understand your query. Based on my analysis of ${selectedModels.length} integrated models, here's my assessment: That's a great topic. Let me provide a thorough, structured response...`,
          friendly: `Great question! 😊 Let me think about that... With ${selectedModels.length} AI models powering my brain, I've got some interesting thoughts to share!`,
          witty: `Ah, now THAT'S a question! Let me consult my ${selectedModels.length} AI brain cells... 🧠💫`,
          mentor: `That's a thoughtful question. Let me share some wisdom with you, drawing from my deep knowledge...`,
          creative_p: `Ooh, that sparks my imagination! ✨ Let me paint an answer with words...`,
          analytical: `Processing query... Cross-referencing ${selectedModels.length} model architectures. Analysis complete: Here's what the data suggests...`,
        };
        response = responses[personality] || responses.friendly;
      }

      setTyping(false);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000 + Math.random() * 1000);
  };

  // FORGING PHASE
  if (phase === 'forging') {
    const stepIndex = Math.min(Math.floor((forgeProgress / 100) * forgingSteps.length), forgingSteps.length - 1);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          className="relative w-48 h-48 mb-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-4 rounded-full border-2 border-secondary/30" />
          <div className="absolute inset-8 rounded-full border-2 border-accent/20" />

          {selectedModels.slice(0, 8).map((model, i) => (
            <motion.div
              key={model.id}
              className="absolute w-10 h-10 rounded-full overflow-hidden"
              style={{
                top: `${50 + 42 * Math.sin((i * 2 * Math.PI) / Math.min(selectedModels.length, 8))}%`,
                left: `${50 + 42 * Math.cos((i * 2 * Math.PI) / Math.min(selectedModels.length, 8))}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            >
              <CompanyLogo company={model.company} size={40} />
            </motion.div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">⚡</span>
          </div>
        </motion.div>

        <h2 className="font-orbitron font-bold text-2xl mb-2 gradient-text">Forging Your AI</h2>
        <p className="text-sm text-gray-400 font-space mb-6">{forgingSteps[stepIndex]}</p>

        <div className="w-full max-w-md">
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
              style={{ width: `${forgeProgress}%` }}
            />
          </div>
          <div className="text-center mt-2 font-space text-sm text-gray-500">
            {Math.floor(forgeProgress)}%
          </div>
        </div>
      </div>
    );
  }

  // REVEAL PHASE
  if (phase === 'reveal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="mb-8"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-1 animate-glow-pulse">
            <div className="w-full h-full rounded-3xl bg-dark-900 flex items-center justify-center">
              <span className="text-5xl">🧠</span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl sm:text-6xl font-orbitron font-black gradient-text mb-3"
        >
          {modelName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-400 font-space mb-2"
        >
          v{modelVersion} • {selectedModels.length} models fused • {modelSize}MB
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-gray-500 font-space mb-8"
        >
          {device.icon} Ready for {device.os} ({device.format})
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => setPhase('specs')}
          className="px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-orbitron font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          View Full Specs →
        </motion.button>
      </div>
    );
  }

  // SPECS PHASE
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition font-space text-sm">← Back</button>
          <div className="flex gap-3">
            <button
              onClick={saveModel}
              disabled={saved}
              className={`px-4 py-2 rounded-xl font-space text-sm font-semibold transition-all ${
                saved ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary hover:bg-primary/30'
              }`}
            >
              {saved ? '✓ Saved!' : '💾 Save Model'}
            </button>
            <button onClick={onMyModels} className="px-4 py-2 rounded-xl font-space text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition">
              📦 My Models
            </button>
            <button onClick={onHome} className="px-4 py-2 rounded-xl font-space text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition">
              🏠 Home
            </button>
          </div>
        </div>

        {/* Model card */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-0.5">
              <div className="w-full h-full rounded-2xl bg-dark-900 flex items-center justify-center text-4xl">
                🧠
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-orbitron font-black gradient-text">{modelName}</h1>
              <p className="text-gray-400 font-space">v{modelVersion} • Custom AI Model</p>
              <p className="text-sm text-gray-500 font-space mt-1">
                {device.icon} {device.os} • {device.format} • {modelSize}MB
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Models Fused', value: String(selectedModels.length), icon: '🔀' },
              { label: 'Intelligence', value: answers.intelligence || 'Standard', icon: '🧠' },
              { label: 'Superpower', value: answers.superpower || 'Reasoning', icon: '⚡' },
              { label: 'Permissions', value: String(permissions.length), icon: '🔐' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-orbitron font-bold text-primary text-sm">{s.value}</div>
                <div className="text-xs text-gray-500 font-space mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Permissions */}
          {permissions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-space font-semibold text-sm text-gray-300 mb-3">🔐 Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {permissions.map(p => (
                  <span key={p} className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-space border border-green-500/20">
                    ✅ {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source models */}
          <div className="mb-6">
            <h3 className="font-space font-semibold text-sm text-gray-300 mb-3">🧬 Source Models</h3>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <CompanyLogo company={m.company} size={20} />
                  <span className="text-xs font-space text-gray-300">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Install button */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="font-space font-semibold text-sm text-gray-300 mb-4">📥 Install to Device</h3>
            {!installing ? (
              <button
                onClick={startInstall}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-orbitron font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {device.icon} Install for {device.os} ({device.format}) — {modelSize}MB
              </button>
            ) : (
              <div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${installProgress}%`,
                      background: installProgress >= 100
                        ? 'linear-gradient(90deg, #22c55e, #10b981)'
                        : 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                    }}
                  />
                </div>
                <p className="text-center text-sm font-space text-gray-400">
                  {installProgress >= 100
                    ? `✅ Installed! ${modelName}${device.format} downloaded to your device.`
                    : `⏳ Installing... ${Math.floor(installProgress)}% — ${Math.floor(modelSize * (1 - installProgress / 100))}MB remaining`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-orbitron font-bold gradient-text">💬 Chat with {modelName}</h3>
            <p className="text-xs text-gray-500 font-space">Test your AI model right here</p>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-600 py-12">
                <div className="text-4xl mb-3">💬</div>
                <p className="font-space text-sm">Start chatting with {modelName}!</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {['Hello!', 'Who are you?', 'Write code', 'Tell a joke', 'My permissions'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition font-space"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-space whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-white rounded-br-none'
                    : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/10'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary/60 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-white/10 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={`Message ${modelName}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 font-space text-sm"
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim() || typing}
              className="px-5 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
