import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModelCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { cn } from '@/utils/cn';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ModelCategory | 'all';
  onCategoryChange: (c: ModelCategory | 'all') => void;
  selectedProvider: string;
  onProviderChange: (p: string) => void;
  providers: string[];
  sortBy: string;
  onSortChange: (s: string) => void;
  totalCount: number;
  filteredCount: number;
  showOpenSourceOnly: boolean;
  onOpenSourceToggle: (v: boolean) => void;
  showFreeOnly: boolean;
  onFreeToggle: (v: boolean) => void;
}

const categories: (ModelCategory | 'all')[] = [
  'all',
  'text-generation',
  'code',
  'image-generation',
  'multimodal',
  'vision',
  'audio',
  'embedding',
  'video',
];

export default function SearchFilter(props: SearchFilterProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forge-muted" />
          <input
            type="text"
            value={props.searchQuery}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search 500+ models by name, provider, or description..."
            className={cn(
              'w-full pl-12 pr-10 py-3.5 rounded-xl',
              'bg-white/[0.04] border border-white/[0.08]',
              'text-sm text-white placeholder:text-forge-muted',
              'focus:outline-none focus:border-forge-blue/50 focus:shadow-glow-sm',
              'transition-all duration-300'
            )}
          />
          {props.searchQuery && (
            <button
              onClick={() => props.onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4 text-forge-muted" />
            </button>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            'px-4 rounded-xl glass flex items-center gap-2 text-sm transition-all',
            filtersOpen ? 'border-forge-blue/50 text-forge-blue' : 'text-forge-muted hover:text-white'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:block">Filters</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const active = props.selectedCategory === cat;
          const color = cat === 'all' ? '#00D4FF' : CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => props.onCategoryChange(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 shrink-0',
                active
                  ? 'text-white shadow-glow-sm'
                  : 'text-forge-muted hover:text-white glass'
              )}
              style={
                active
                  ? { backgroundColor: `${color}20`, border: `1px solid ${color}40`, color }
                  : {}
              }
            >
              {cat === 'all' ? 'All Models' : CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass p-4 flex flex-wrap gap-4 items-center">
              {/* Provider Select */}
              <div className="relative">
                <select
                  value={props.selectedProvider}
                  onChange={(e) => props.onProviderChange(e.target.value)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 pr-8 text-xs text-white focus:outline-none focus:border-forge-blue/50"
                >
                  <option value="all">All Providers</option>
                  {props.providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-muted pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={props.sortBy}
                  onChange={(e) => props.onSortChange(e.target.value)}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 pr-8 text-xs text-white focus:outline-none focus:border-forge-blue/50"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="provider">By Provider</option>
                  <option value="params-desc">Largest First</option>
                  <option value="params-asc">Smallest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-muted pointer-events-none" />
              </div>

              {/* Toggles */}
              <label className="flex items-center gap-2 text-xs text-forge-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={props.showOpenSourceOnly}
                  onChange={(e) => props.onOpenSourceToggle(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-forge-blue focus:ring-forge-blue/30"
                />
                Open Source Only
              </label>
              <label className="flex items-center gap-2 text-xs text-forge-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={props.showFreeOnly}
                  onChange={(e) => props.onFreeToggle(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-forge-blue focus:ring-forge-blue/30"
                />
                Free on OpenRouter
              </label>

              {/* Count */}
              <span className="text-xs text-forge-muted ml-auto">
                Showing {props.filteredCount} of {props.totalCount} models
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}