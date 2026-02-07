import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMarketsCache } from '@/hooks/useMarketsCache';
import { MarketCard } from '@/components/MarketCard';
import { CardSkeleton } from '@/components/Skeleton';
import { haptic } from '@/lib/telegram';
import type { Market } from '@/hooks/useMarketsCache';

type FilterTab = 'all' | 'open' | 'active' | 'resolved';

interface MarketsPageProps {
  onSelectMarket?: (market: Market) => void;
  onCreateMarket?: () => void;
}

export function MarketsPage({ onSelectMarket, onCreateMarket }: MarketsPageProps) {
  const { markets, loading, error, refetch } = useMarketsCache();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);

  // Extract unique categories from markets
  const categories = useMemo(() => {
    const cats = new Set<string>();
    markets.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats).sort();
  }, [markets]);

  // Filter markets based on current selections
  const filteredMarkets = useMemo(() => {
    let filtered = markets;

    // Filter by tab
    if (filterTab === 'open') {
      filtered = filtered.filter((m) => m.status === 'open');
    } else if (filterTab === 'active') {
      filtered = filtered.filter((m) =>
        ['proposed', 'challenged', 'voting'].includes(m.status)
      );
    } else if (filterTab === 'resolved') {
      filtered = filtered.filter((m) => m.status === 'resolved');
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) =>
        m.question.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [markets, filterTab, selectedCategory, searchQuery]);

  const handleFilterChange = (tab: FilterTab) => {
    if (tab !== filterTab) {
      haptic.selection();
      setFilterTab(tab);
    }
  };

  const handleCategoryToggle = (category: string) => {
    haptic.selection();
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleRefetch = async () => {
    setIsRefetching(true);
    haptic.medium();
    try {
      await refetch();
      haptic.success();
    } catch (err) {
      haptic.error();
    } finally {
      setIsRefetching(false);
    }
  };

  const filterTabs: Array<{ id: FilterTab; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'active', label: 'Active' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header with search */}
      <div className="sticky top-0 z-10 glass-navbar px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-tg-text">Markets</h1>
          <button
            onClick={handleRefetch}
            disabled={isRefetching}
            className="p-2 hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-5 h-5 text-tg-hint ${isRefetching ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            className="w-full px-4 py-2.5 pl-10 bg-surface rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tg-hint"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
            >
              <svg className="w-4 h-4 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterTab === tab.id
                  ? 'bg-brand-400 text-white'
                  : 'bg-surface text-tg-hint hover:bg-surface-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-brand-400/20 text-brand-400 border border-brand-400'
                    : 'bg-white/5 text-tg-hint border border-white/10 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Markets list */}
      <div className="px-4 py-4 space-y-3">
        {error && (
          <div className="glass-card p-4 border border-danger/30 bg-danger/5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-danger mb-1">Error loading markets</h3>
                <p className="text-xs text-tg-hint">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredMarkets.map((market, idx) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MarketCard
                  market={market}
                  onClick={() => {
                    haptic.light();
                    onSelectMarket?.(market);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-tg-text font-medium mb-2">No markets found</h3>
            <p className="text-sm text-tg-hint">
              {searchQuery
                ? 'Try a different search query'
                : selectedCategory
                ? 'No markets in this category'
                : 'Check back later for new markets'}
            </p>
          </div>
        )}
      </div>

      {/* Floating create button */}
      {onCreateMarket && (
        <button
          onClick={() => { haptic.medium(); onCreateMarket(); }}
          className="fixed right-4 bottom-24 w-14 h-14 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 rounded-full shadow-lg shadow-brand-400/30 flex items-center justify-center transition-colors z-20"
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}
    </div>
  );
}
