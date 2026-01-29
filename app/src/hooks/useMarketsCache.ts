/**
 * useMarketsCache - Fetch markets from Supabase cache or use hardcoded V6.3 markets
 *
 * This hook provides instant loading of markets by reading from Supabase cache
 * instead of making 50-100 API calls to the blockchain.
 *
 * For testnet, V6.3 markets are hardcoded since they were deployed on-chain
 * but couldn't be inserted into Supabase (requires service role key).
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isCacheEnabled, getNetwork } from '../config/supabase';
import type { MarketRow } from '../config/supabase';

// ============================================================================
// V6.3 TESTNET MARKETS (Deployed 2026-01-26)
// These are hardcoded because Supabase insert requires service role key
// ============================================================================
const V6_3_TESTNET_MARKETS: MarketRow[] = [
  {
    id: 104,
    network: 'testnet',
    address: 'kQCQueuPJYMfDofROv0rYyevQwMGk4AI46vAq_JQPQkHNrdM',
    question: 'Will at least one Associate Member team qualify for the Super 8 stage?',
    rules: `Market resolves YES if any Associate Member team (non-Full Member of ICC) is among the eight teams that qualify for the Super 8 stage.

Associate Member teams in this tournament: USA, Scotland (replaced Bangladesh), Nepal, Namibia, Italy (debut), Oman, Papua New Guinea, Uganda.

Market resolves NO if all eight Super 8 qualifiers are Full Member nations (India, Pakistan, Australia, England, South Africa, New Zealand, West Indies, Sri Lanka, Afghanistan, Ireland).

Group stage concludes February 20, 2026. Super 8 teams are confirmed immediately after all group matches complete.`,
    resolution_source: 'Official ICC Group Stage standings and Super 8 qualification at icc-cricket.com',
    resolution_deadline: 1771632000, // February 21, 2026 00:00 UTC
    proposal_start_time: 1771632300,
    created_at: 1737881723,
    creator: '',
    status: 'open',
    proposed_outcome: null,
    current_bond: null,
    escalation_count: null,
    can_propose_now: null,
    category: 'cricket',
    proposed_at: null,
    challenge_deadline: null,
    veto_guard_address: null,
    veto_end: null,
    veto_count: null,
    support_count: null,
    current_answer: null,
    rebate_creator: null,
    rebate_amount: null,
    rebate_claimed: null,
    resolver_address: null,
    resolver_reward: null,
    resolver_claimed: null,
    cached_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 103,
    network: 'testnet',
    address: 'kQAhDEt2GwdhEd0VGuYzPEX7zUaUBFimx6qgPUWHk-Bnwo7J',
    question: 'Will the 2026 T20 World Cup Final be held in Ahmedabad?',
    rules: `Market resolves YES if the ICC Men's T20 World Cup 2026 Final is played at the Narendra Modi Stadium in Ahmedabad, India.

Market resolves NO if the final is played at R. Premadasa Stadium in Colombo, Sri Lanka, or any other venue.

Per ICC rules: If Pakistan qualifies for the final, the venue shifts from Ahmedabad to Colombo for security/political reasons.

Resolution becomes possible after Semi-Final 2 concludes on March 5, 2026, when both finalists are confirmed.`,
    resolution_source: 'Official ICC tournament page and venue confirmation at icc-cricket.com',
    resolution_deadline: 1772755200, // March 6, 2026 00:00 UTC
    proposal_start_time: 1772755500,
    created_at: 1737881791,
    creator: '',
    status: 'open',
    proposed_outcome: null,
    current_bond: null,
    escalation_count: null,
    can_propose_now: null,
    category: 'cricket',
    proposed_at: null,
    challenge_deadline: null,
    veto_guard_address: null,
    veto_end: null,
    veto_count: null,
    support_count: null,
    current_answer: null,
    rebate_creator: null,
    rebate_amount: null,
    rebate_claimed: null,
    resolver_address: null,
    resolver_reward: null,
    resolver_claimed: null,
    cached_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 102,
    network: 'testnet',
    address: 'kQDAQgBDY8HkA6Jn-gmPgE95Q_X-J2RRdesOC6kqDJ61oHvL',
    question: 'Will India win the 2026 ICC Men\'s T20 World Cup?',
    rules: `Market resolves YES if India is officially declared the winner of the ICC Men's T20 World Cup 2026 Final by the International Cricket Council (ICC).

Market resolves NO if:
- Any other team wins the tournament
- India is eliminated before the final
- The tournament is cancelled or abandoned without a winner being declared

Note: If the final extends to the reserve day (March 9, 2026), resolution accounts for this. Super overs and DLS-adjusted results are valid outcomes.

Final scheduled: March 8, 2026, 7:00 PM IST at Narendra Modi Stadium, Ahmedabad (or Colombo if Pakistan in final).`,
    resolution_source: 'Official ICC website (icc-cricket.com) and ESPNcricinfo match center',
    resolution_deadline: 1773100800, // March 10, 2026 00:00 UTC
    proposal_start_time: 1773101100,
    created_at: 1737881753,
    creator: '',
    status: 'open',
    proposed_outcome: null,
    current_bond: null,
    escalation_count: null,
    can_propose_now: null,
    category: 'cricket',
    proposed_at: null,
    challenge_deadline: null,
    veto_guard_address: null,
    veto_end: null,
    veto_count: null,
    support_count: null,
    current_answer: null,
    rebate_creator: null,
    rebate_amount: null,
    rebate_claimed: null,
    resolver_address: null,
    resolver_reward: null,
    resolver_claimed: null,
    cached_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 101,
    network: 'testnet',
    address: 'kQDfp5UzzqG0fgn20V_waUKdRibJBSqvcbu7xkhao4uNRL7a',
    question: 'Will this resolve to YES? (V6.3 Test Market)',
    rules: 'Test market for V6.3 deployment verification. This market is for testing the proposal/challenge/settlement flow.',
    resolution_source: 'Manual resolution for testing',
    resolution_deadline: 1737889800, // Already passed - was ~2h after deployment
    proposal_start_time: 1737890100,
    created_at: 1737881723,
    creator: '',
    status: 'open',
    proposed_outcome: null,
    current_bond: null,
    escalation_count: null,
    can_propose_now: null,
    category: 'other',
    proposed_at: null,
    challenge_deadline: null,
    veto_guard_address: null,
    veto_end: null,
    veto_count: null,
    support_count: null,
    current_answer: null,
    rebate_creator: null,
    rebate_amount: null,
    rebate_claimed: null,
    resolver_address: null,
    resolver_reward: null,
    resolver_claimed: null,
    cached_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
  syncMarkets: (network?: 'mainnet' | 'testnet' | 'both', force?: boolean) => Promise<{ success: boolean; totalMarketsAdded: number; error?: string }>;
  updateMarketStatus: (marketAddress: string, network?: 'mainnet' | 'testnet') => Promise<{ success: boolean; error?: string }>;
  loadingProgress: { total: number; loaded: number; status: string } | null;
  cacheSource: 'supabase' | 'none';
  lastRefreshed: Date | null;
}

/**
 * Transform Supabase row to Market interface
 */
function transformRowToMarket(row: MarketRow): Market {
  // Calculate canProposeNow dynamically based on current time vs proposal_start_time
  // This ensures the UI shows correct state even if Supabase cache isn't updated
  const now = Math.floor(Date.now() / 1000);
  const canProposeNow = row.status === 'open' && row.proposal_start_time <= now;

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
    canProposeNow: canProposeNow,
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
    setLoading(true);
    setError(null);
    setLoadingProgress({ total: 0, loaded: 0, status: 'Loading markets...' });

    const network = getNetwork();

    try {
      // Use Supabase for both testnet and mainnet
      if (!isCacheEnabled() || !supabase) {
        // Fallback to hardcoded V6.3 markets for testnet if Supabase unavailable
        if (network === 'testnet') {
          const transformedMarkets = V6_3_TESTNET_MARKETS.map(transformRowToMarket);
          setMarkets(transformedMarkets);
          setCacheSource('supabase');
          setLastRefreshed(new Date());
          setLoadingProgress({
            total: transformedMarkets.length,
            loaded: transformedMarkets.length,
            status: `Loaded ${transformedMarkets.length} V6.3 markets (fallback)`
          });
          setTimeout(() => setLoadingProgress(null), 2000);
          setLoading(false);
          return;
        }
        setError('Supabase cache not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setLoading(false);
        return;
      }

      // Fetch markets from Supabase
      // Filter by creation time to include:
      // - V6.3 markets (deployed Jan 25-26, 2026)
      // - New markets created via frontend
      // Cutoff: Jan 25, 2026 00:00 UTC (Unix timestamp 1769299200)
      // This excludes old V6.2 markets which were created earlier
      const V6_3_DEPLOYMENT_CUTOFF = 1769299200; // Jan 25, 2026 00:00 UTC

      const { data: marketRows, error: fetchError } = await supabase
        .from('markets')
        .select('*')
        .eq('network', network)
        .gte('created_at', V6_3_DEPLOYMENT_CUTOFF)
        .order('created_at', { ascending: false });

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

  // Sync markets by calling the Supabase Edge Function
  const syncMarkets = useCallback(async (
    network: 'mainnet' | 'testnet' | 'both' = 'both',
    force = false
  ): Promise<{ success: boolean; totalMarketsAdded: number; error?: string }> => {
    if (!isCacheEnabled() || !supabase) {
      return {
        success: false,
        totalMarketsAdded: 0,
        error: 'Supabase not configured',
      };
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ network, force }),
      });

      const result = await response.json();

      // Refetch markets after sync
      if (result.success && result.totalMarketsAdded > 0) {
        await fetchMarketsFromCache();
      }

      return {
        success: result.success,
        totalMarketsAdded: result.totalMarketsAdded || 0,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[useMarketsCache] Sync error:', error);
      return {
        success: false,
        totalMarketsAdded: 0,
        error: error.message || 'Failed to sync markets',
      };
    }
  }, [fetchMarketsFromCache]);

  // Update a single market's status from blockchain
  const updateMarketStatus = useCallback(async (
    marketAddress: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isCacheEnabled() || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/sync-markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ network, update_status: true, market_address: marketAddress }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the markets list to show updated status
        await fetchMarketsFromCache();
      }

      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('[useMarketsCache] Update status error:', error);
      return { success: false, error: error.message || 'Failed to update market status' };
    }
  }, [fetchMarketsFromCache]);

  // Fetch on mount - no automatic refresh
  useEffect(() => {
    fetchMarketsFromCache();
  }, [fetchMarketsFromCache]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarketsFromCache,
    syncMarkets,
    updateMarketStatus,
    loadingProgress,
    cacheSource,
    lastRefreshed,
  };
}

// Also export the old hook name for compatibility during transition
export { useMarketsCache as useMarkets };
