import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { allModels } from '@/data/models';
import type { AIModel, ModelCategory } from '@/types';

const ITEMS_PER_PAGE = 24;

function parseParams(params: string): number {
  const lower = params.toLowerCase().replace(/[~()estimated]/g, '').trim();
  const match = lower.match(/([\d.]+)\s*(t|b|m|k)?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = match[2];
  switch (unit) {
    case 't': return num * 1e12;
    case 'b': return num * 1e9;
    case 'm': return num * 1e6;
    case 'k': return num * 1e3;
    default: return num;
  }
}

export function useModels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'all'>('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showOpenSourceOnly, setShowOpenSourceOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const providers = useMemo(() => {
    const set = new Set(allModels.map((m) => m.provider));
    return Array.from(set).sort();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(allModels, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'provider', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'category', weight: 1 },
          { name: 'architecture', weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    []
  );

  const filteredModels = useMemo(() => {
    let results: AIModel[];

    if (searchQuery.trim()) {
      results = fuse.search(searchQuery).map((r) => r.item);
    } else {
      results = [...allModels];
    }

    if (selectedCategory !== 'all') {
      results = results.filter((m) => m.category === selectedCategory);
    }

    if (selectedProvider !== 'all') {
      results = results.filter((m) => m.provider === selectedProvider);
    }

    if (showOpenSourceOnly) {
      results = results.filter((m) => m.openSource);
    }

    if (showFreeOnly) {
      results = results.filter((m) => m.freeOnOpenRouter);
    }

    // Sort
    if (!searchQuery.trim()) {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'provider':
            return a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name);
          case 'params-desc':
            return parseParams(b.params) - parseParams(a.params);
          case 'params-asc':
            return parseParams(a.params) - parseParams(b.params);
          default:
            return 0;
        }
      });
    }

    return results;
  }, [searchQuery, selectedCategory, selectedProvider, sortBy, showOpenSourceOnly, showFreeOnly, fuse]);

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);

  const paginatedModels = useMemo(
    () => filteredModels.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE),
    [filteredModels, safeCurrentPage]
  );

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((c: ModelCategory | 'all') => {
    setSelectedCategory(c);
    setCurrentPage(1);
  }, []);

  const handleProviderChange = useCallback((p: string) => {
    setSelectedProvider(p);
    setCurrentPage(1);
  }, []);

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    selectedProvider,
    setSelectedProvider: handleProviderChange,
    sortBy,
    setSortBy,
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    showOpenSourceOnly,
    setShowOpenSourceOnly,
    showFreeOnly,
    setShowFreeOnly,
    providers,
    filteredModels,
    paginatedModels,
    totalCount: allModels.length,
    filteredCount: filteredModels.length,
  };
}