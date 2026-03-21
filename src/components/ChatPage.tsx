import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SavedModel } from '../data/builderQuestions';

interface Props {
  model: SavedModel;
  onBack: () => void;
}

export default function ChatPage({ model, onBack }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Welcome message
  useEffect(() => {
    const personality = model.answers?.personality || 'friendly';
    const welcomeMessages: Record<string, string> = {
      professional: `Good day. I'm ${model.name} v${model.version}. How may I assist you today?`,
      friendly: `Hey there! 😊 I'm ${model.name}! Built from ${model.sourceModels.length} amazing AI models. Let's chat!`,
      witty: `Well, well, well... you actually came to talk to me! I'm ${model.name}, and I promise I'm worth every byte. 😏`,
      mentor: `Welcome, young padawan. I am ${model.name}, a fusion of ${model.sourceModels.length} AI minds. What shall we explore today?`,
      creative_p: `✨ Hello, wonderful human! I'm ${model.name} — a kaleidoscope of ${model.sourceModels.length} AI dreams woven together!`,
      analytical: `${model.name} v${model.version} initialized. ${model.sourceModels.length} model architectures loaded. Ready for analysis.`,
    };
    const msg = welcomeMessages[personality] || welcomeMessages.friendly;
    setMessages([{ role: 'ai', text: msg }]);
  }, [model]);

  const sendMessage = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const personality = model.answers?.personality || 'friendly';
      const lower = userMsg.toLowerCase();
      let response = '';

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        response = personality === 'witty'
          ? `Oh hi again! Miss me already? 😏 What's on your mind?`
          : `Hello! 😊 How can I help you today?`;
      } else if (lower.includes('code') || lower.includes('program') || lower.includes('function')) {
        response = `Here's a quick example:\n\n\`\`\`python\ndef ${model.name.toLowerCase()}_analyze(data):\n    """Powered by ${model.sourceModels.length} AI models"""\n    result = process(data)\n    return {\n        "model": "${model.name}",\n        "confidence": 0.97,\n        "result": result\n    }\n\`\`\`\n\nI can write in any language! What would you like?`;
      } else if (lower.includes('permission') || lower.includes('access') || lower.includes('can you')) {
        const perms = model.permissions || [];
        response = perms.length > 0
          ? `My permissions:\n${perms.map(p => `✅ ${p}`).join('\n')}\n\nThese were set during creation for safety.`
          : `I currently have no special permissions set. My creator kept things secure! 🔒`;
      } else if (lower.includes('who') || lower.includes('what are you') || lower.includes('about')) {
        response = `I'm **${model.name}** v${model.version}!\n\n🧬 Built from: ${model.sourceModels.slice(0, 5).join(', ')}${model.sourceModels.length > 5 ? ` and ${model.sourceModels.length - 5} more` : ''}\n📏 Size: ${model.size}MB\n🔐 Permissions: ${(model.permissions || []).length} active\n⚡ Superpower: ${model.answers?.superpower || 'reasoning'}`;
      } else if (lower.includes('joke') || lower.includes('funny')) {
        const jokes = [
          `Why do transformers never get invited to parties? Because they always pay too much attention! 🤖😄`,
          `What do you call an AI that sings? A-Dell! 🎤`,
          `I told my neural network a joke. It didn't laugh — but it gave it a high confidence score! 📊😂`,
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
      } else if (lower.includes('help') || lower.includes('what can you do')) {
        response = `I can help with lots of things!\n\n💬 General conversation\n💻 Write code in any language\n📝 Creative writing\n🧮 Math & analysis\n🎯 Answer questions\n🔐 Show my permissions\n😄 Tell jokes\n\nJust ask away!`;
      } else if (lower.includes('math') || lower.includes('calcul') || /\d+\s*[\+\-\*\/]\s*\d+/.test(lower)) {
        const match = userMsg.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
        if (match) {
          const [, a, op, b] = match;
          const num1 = parseFloat(a);
          const num2 = parseFloat(b);
          let result = 0;
          switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num2 !== 0 ? num1 / num2 : NaN; break;
          }
          response = `🧮 ${num1} ${op} ${num2} = **${result}**\n\nNeed more calculations?`;
        } else {
          response = `I'm ready for math! Try something like "25 * 17" or "1024 / 32" and I'll solve it instantly! 🧮`;
        }
      } else {
        const templates: Record<string, string[]> = {
          professional: [
            `That's an excellent point. Based on my integrated knowledge from ${model.sourceModels.length} models, I can provide a comprehensive analysis.`,
            `Let me address that systematically. My assessment is as follows...`,
          ],
          friendly: [
            `Great question! 😊 I love thinking about stuff like this. Here's my take...`,
            `Ooh, that's interesting! Let me share what I think...`,
          ],
          witty: [
            `Now THAT'S a question! Let me consult my ${model.sourceModels.length} brain cells... 🧠💫`,
            `Ah, you're testing me! I like it. Here's my brilliantly witty answer...`,
          ],
          mentor: [
            `A wise question indeed. Let me share some knowledge with you...`,
            `Consider this perspective, drawn from the wisdom of ${model.sourceModels.length} AI minds...`,
          ],
          creative_p: [
            `Ooh, that sparks my imagination! ✨ Let me paint an answer...`,
            `What a wonderful prompt! Here's my creative interpretation...`,
          ],
          analytical: [
            `Processing... Analysis complete. Here are the key findings from cross-referencing ${model.sourceModels.length} architectures:`,
            `Data analysis initiated. Results indicate the following patterns:`,
          ],
        };
        const options = templates[personality] || templates.friendly;
        response = options[Math.floor(Math.random() * options.length)];
      }

      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition font-space text-sm">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm">
              🧠
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm gradient-text">{model.name}</h3>
              <p className="text-[10px] text-gray-500 font-space">v{model.version} • Online</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
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
          <div ref={endRef} />
        </div>
      </div>

      {/* Quick buttons */}
      <div className="px-4 py-2">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto hide-scrollbar">
          {['Hello!', 'Write code', 'Tell a joke', 'What can you do?', 'My permissions', '42 * 73'].map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-500 hover:bg-white/10 hover:text-white transition font-space whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="glass-strong border-t border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={`Message ${model.name}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 font-space text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
