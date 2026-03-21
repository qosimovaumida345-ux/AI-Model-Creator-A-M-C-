import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Scale, FileCode } from 'lucide-react';
import type { AIModel, ModelCategory } from '@/types';
import { CATEGORY_COLORS } from '@/types';
import ProviderLogo from './ProviderLogo';
import { cn } from '@/utils/cn';

interface ModelCardProps {
  model: AIModel;
  index: number;
}

export default function ModelCard({ model, index }: ModelCardProps) {
  const catColor = CATEGORY_COLORS[model.category] || '#00D4FF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5) }}
    >
      <Link to={`/model/${model.id}`} className="block group">
        <div
          className={cn(
            'glass glow-border relative overflow-hidden p-5',
            'transition-all duration-500',
            'hover:bg-white/[0.06] hover:shadow-glow-sm hover:-translate-y-1',
            'h-full flex flex-col'
          )}
        >
          {/* Category indicator line at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, ${catColor}, transparent)` }}
          />

          {/* Header: Logo + Provider */}
          <div className="flex items-start justify-between mb-3">
            <ProviderLogo provider={model.provider} size="md" />
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-lg uppercase tracking-wider"
              style={{
                color: catColor,
                backgroundColor: `${catColor}15`,
                border: `1px solid ${catColor}25`,
              }}
            >
              {model.category.replace('-', ' ')}
            </span>
          </div>

          {/* Model Name */}
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-forge-blue transition-colors line-clamp-1">
            {model.name}
          </h3>
          <p className="text-[11px] text-forge-muted mb-3">{model.provider}</p>

          {/* Description */}
          <p className="text-xs text-forge-muted/80 leading-relaxed mb-4 line-clamp-2 flex-1">
            {model.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-[10px] text-forge-muted mb-3">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {model.params}
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3" />
              {model.license.length > 12 ? model.license.slice(0, 12) + '...' : model.license}
            </span>
            {model.formats.length > 0 && (
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {model.formats[0]}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {model.openSource && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-forge-green/10 text-forge-green border border-forge-green/20">
                Open Source
              </span>
            )}
            {model.freeOnOpenRouter && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-forge-blue/10 text-forge-blue border border-forge-blue/20">
                Free API
              </span>
            )}
            {model.fineTunable && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-forge-purple/10 text-forge-purple border border-forge-purple/20">
                Fine-tunable
              </span>
            )}
          </div>

          {/* Action hint */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-[11px] text-forge-muted group-hover:text-forge-blue transition-colors">
              View Details
            </span>
            <ArrowRight className="w-4 h-4 text-forge-muted group-hover:text-forge-blue group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}