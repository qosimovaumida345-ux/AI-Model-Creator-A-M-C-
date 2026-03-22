import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getModelById } from '@/data/models';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';
import { useChatStore } from '@/stores/chatStore';
import type { AIModel, ModelCategory } from '@/types';

type ORModel = {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  top_provider?: { max_completion_tokens?: number };
  architecture?: { modality?: string; tokenizer?: string };
};

function isFree(or: ORModel): boolean {
  if (or.id.endsWith(':free')) return true;
  const p = parseFloat(or.pricing?.prompt ?? '1');
  const c = parseFloat(or.pricing?.completion ?? '1');
  return p === 0 && c === 0;
}

function guessProvider(orId: string): string {
  const beforeColon = orId.split(':')[0];
  const parts = beforeColon.split('/');
  return parts[0] || 'OpenRouter';
}

function orToAIModel(or: ORModel): AIModel {
  return {
    id: or.id,
    name: or.name || or.id.split('/').pop() || or.id,
    provider: guessProvider(or.id),
    category: 'text-generation' as ModelCategory,
    description: or.description || 'OpenRouter model',
    params: 'API',
    license: 'API',
    formats: ['api'],
    tasks: ['text-generation'],
    architecture: or.architecture?.modality || 'Transformer',
    contextLength: or.context_length ?? 4096,
    fineTunable: false,
    openSource: false,
    apiAvailable: true,
    freeOnOpenRouter: isFree(or),
    hardwareReq: 'API access',
    trainingData: 'Not disclosed',
    benchmarks: {},
    isVariant: false,
  };
}

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createSession } = useChatStore();

  const [model, setModel] = useState<AIModel | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setModel(null);
      setLoading(false);
      return;
    }

    const decoded = decodeURIComponent(id);

    // 1. Avval local static modeldan qidiramiz
    const local = getModelById(decoded);
    if (local) {
      setModel(local);
      setLoading(false);
      return;
    }

    // 2. Agar local topilmasa — OpenRouter'dan live ma'lumot olamiz
    async function fetchLive() {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error('fetch failed');
        const json = (await res.json()) as { data: ORModel[] };
        const found = json.data.find(
          (m) => m.id === decoded || m.id.split(':')[0] === decoded
        );
        if (found) {
          setModel(orToAIModel(found));
        } else {
          setModel(null);
        }
      } catch {
        setModel(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLive();
  }, [id]);

  const handleChat = async () => {
    if (!model) return;
    const sessionId = await createSession(model.id, model.name);
    navigate(`/chat?session=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading model info...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Model Not Found</h1>
          <p className="text-white/40 text-sm mb-6">
            This model may have been removed or renamed by the provider.
          </p>
          <Link to="/models" className="text-cyan-400 hover:underline">
            ← Back to Models
          </Link>
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS[model.category] || '#00D4FF';
  const categoryLabel = CATEGORY_LABELS[model.category] || model.category;
  const isLiveModel = !getModelById(model.id);

  const promptPrice = model as any;
  const pricingInfo = isLiveModel ? null : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/models"
          className="text-sm text-white/30 hover:text-white/60 mb-6 inline-block"
        >
          ← Back to Models
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold border"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
                color,
              }}
            >
              {model.provider.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{model.name}</h1>
                {isLiveModel && (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 rounded border border-blue-500/20">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/40 flex-wrap">
                <span>{model.provider}</span>
                <span>·</span>
                <span style={{ color }}>{categoryLabel}</span>
                <span>·</span>
                <span>{model.params}</span>
                {model.freeOnOpenRouter && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded border border-green-500/20">
                    FREE ON OPENROUTER
                  </span>
                )}
                {!model.freeOnOpenRouter && model.apiAvailable && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/20">
                    PAID
                  </span>
                )}
              </div>
              <div className="mt-1 text-[10px] text-white/20 font-mono">{model.id}</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 mb-8 leading-relaxed">{model.description}</p>

          {/* Actions */}
          <div className="flex gap-3 mb-10 flex-wrap">
            <button
              onClick={handleChat}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
              Chat with Model
            </button>
            {model.fineTunable && (
              <Link
                to="/forge"
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium hover:bg-white/10 transition-all"
              >
                Forge Custom Model
              </Link>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Parameters', value: model.params },
              {
                label: 'Context Length',
                value:
                  model.contextLength > 0
                    ? model.contextLength.toLocaleString() + ' tokens'
                    : 'N/A',
              },
              { label: 'Architecture', value: model.architecture },
              { label: 'License', value: model.license },
              { label: 'Open Source', value: model.openSource ? 'Yes' : 'No' },
              { label: 'Fine-Tunable', value: model.fineTunable ? 'Yes' : 'No' },
              { label: 'Hardware', value: model.hardwareReq },
              { label: 'Formats', value: model.formats.join(', ') },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 bg-white/[0.02] rounded-xl border border-white/5"
              >
                <div className="text-[10px] text-white/25 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-sm text-white mt-1">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Benchmarks */}
          {Object.keys(model.benchmarks).length > 0 && (
            <div className="p-6 bg-white/[0.02] rounded-xl border border-white/10 mb-8">
              <h3 className="text-sm font-semibold mb-4">Benchmarks</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(model.benchmarks).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-[10px] text-white/30 uppercase">{key}</div>
                    <div className="text-lg font-mono text-cyan-400">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {model.tasks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {model.tasks.map((task) => (
                <span
                  key={task}
                  className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-white/40"
                >
                  {task}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}