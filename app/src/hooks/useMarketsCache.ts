/**
 * useMarketsCache - Fetch markets from Supabase cache
 *
 * This hook provides instant loading of markets by reading from Supabase cache
 * instead of making 50-100 API calls to the blockchain.
 *
 * The cache is populated by a separate edge function that runs periodically
 * or can be triggered manually.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isCacheEnabled, getNetwork } from '../config/supabase';
import type { MarketRow } from '../config/supabase';

// Re-export the Market type and MarketCategory for compatibility
export type MarketCategory = 'cricket' | 'champions_league' | 'soccer_world_cup' | 'winter_olympics' | 'other';

export interface Market {
  id: number;
  address: string;
  question: string;
  rules?: string;
  resolutionSource?: string;
  resolutionDeadline: number;
  proposalStartTime: number;
  createdAt: number;
  creator: string;
  status: 'open' | 'proposed' | 'challenged' | 'voting' | 'resolved';
  proposedOutcome?: boolean;
  currentBond?: number;
  escalationCount?: number;
  canProposeNow?: boolean;
  category: MarketCategory;
  proposedAt?: number;
  challengeDeadline?: number;
  vetoGuardAddress?: string;
  vetoEnd?: number;
  vetoCount?: number;
  supportCount?: number;
  currentAnswer?: boolean;
  rebateCreator?: string;
  rebateAmount?: number;
  rebateClaimed?: boolean;
  resolverAddress?: string;
  resolverReward?: number;
  resolverClaimed?: boolean;
}

interface UseMarketsResult {
  markets: Market[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadingProgress: { total: number; loaded: number; status: string } | null;
  cacheSource: 'supabase' | 'none';
  lastRefreshed: Date | null;
}

/**
 * Transform Supabase row to Market interface
 */
function transformRowToMarket(row: MarketRow): Market {
  return {
    id: row.id,
    address: row.address,
    question: row.question,
    rules: row.rules || undefined,
    resolutionSource: row.resolution_source || undefined,
    resolutionDeadline: row.resolution_deadline,
    proposalStartTime: row.proposal_start_time,
    createdAt: row.created_at,
    creator: row.creator,
    status: row.status,
    proposedOutcome: row.proposed_outcome ?? undefined,
    currentBond: row.current_bond ?? undefined,
    escalationCount: row.escalation_count ?? undefined,
    canProposeNow: row.can_propose_now ?? undefined,
    category: row.category as MarketCategory,
    proposedAt: row.proposed_at ?? undefined,
    challengeDeadline: row.challenge_deadline ?? undefined,
    vetoGuardAddress: row.veto_guard_address ?? undefined,
    vetoEnd: row.veto_end ?? undefined,
    vetoCount: row.veto_count ?? undefined,
    supportCount: row.support_count ?? undefined,
    currentAnswer: row.current_answer ?? undefined,
    rebateCreator: row.rebate_creator ?? undefined,
    rebateAmount: row.rebate_amount ?? undefined,
    rebateClaimed: row.rebate_claimed ?? undefined,
    resolverAddress: row.resolver_address ?? undefined,
    resolverReward: row.resolver_reward ?? undefined,
    resolverClaimed: row.resolver_claimed ?? undefined,
  };
}

export function useMarketsCache(): UseMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    total: number;
    loaded: number;
    status: string;
  } | null>(null);
  const [cacheSource, setCacheSource] = useState<'supabase' | 'none'>('none');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchMarketsFromCache = useCallback(async () => {
    if (!isCacheEnabled() || !supabase) {
      setError('Supabase cache not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress({ total: 0, loaded: 0, status: 'Loading markets from cache...' });

    const network = getNetwork();

    try {
      // Fetch markets from Supabase
      const { data: marketRows, error: fetchError } = await supabase
        .from('markets')
        .select('*')
        .eq('network', network)
        .order('id', { ascending: false });

      if (fetchError) {
        // Check if table doesn't exist yet
        if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
          setError('Markets cache not initialized. Please run the database migration first.');
          setLoadingProgress({ total: 0, loaded: 0, status: 'Cache tables not found. Please apply migration.' });
        } else {
          throw new Error(`Failed to fetch markets: ${fetchError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!marketRows || marketRows.length === 0) {
        setMarkets([]);
        setLoadingProgress({ total: 0, loaded: 0, status: 'No markets in cache. Please run cache refresh.' });
        setCacheSource('supabase');
        setLastRefreshed(new Date());
        setLoading(false);
        return;
      }

      // Transform rows to Market objects
      const transformedMarkets = marketRows.map(transformRowToMarket);

      setMarkets(transformedMarkets);
      setCacheSource('supabase');
      setLastRefreshed(new Date());
      setLoadingProgress({
        total: transformedMarkets.length,
        loaded: transformedMarkets.length,
        status: `Loaded ${transformedMarkets.length} markets from cache`
      });

      // Clear progress after short delay
      setTimeout(() => setLoadingProgress(null), 2000);

    } catch (err: any) {
      console.error('[useMarketsCache] Error:', err);
      setError(err.message || 'Failed to load markets from cache');
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount - no automatic refresh
  useEffect(() => {
    fetchMarketsFromCache();
  }, [fetchMarketsFromCache]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarketsFromCache,
    loadingProgress,
    cacheSource,
    lastRefreshed,
  };
}

// Also export the old hook name for compatibility during transition
export { useMarketsCache as useMarkets };
