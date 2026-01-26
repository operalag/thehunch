/**
 * Supabase Client Configuration
 * Used for caching market data to improve frontend performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCurrentNetwork, getSupabaseConfig } from './networks';

// Get Supabase config from environment
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

// Only create client if credentials are available
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Check if Supabase caching is enabled
 */
export const isCacheEnabled = (): boolean => supabase !== null;

/**
 * Get current network - uses localStorage-based network from networks.ts
 */
export const getNetwork = (): 'testnet' | 'mainnet' => {
  return getCurrentNetwork();
};

// Database types for type safety
export interface MarketRow {
  id: number;
  network: string;
  address: string;
  question: string;
  rules: string | null;
  resolution_source: string | null;
  resolution_deadline: number;
  proposal_start_time: number;
  created_at: number;
  creator: string;
  status: 'open' | 'proposed' | 'challenged' | 'voting' | 'resolved';
  proposed_outcome: boolean | null;
  current_bond: number | null;
  escalation_count: number | null;
  can_propose_now: boolean | null;
  category: string;
  proposed_at: number | null;
  challenge_deadline: number | null;
  veto_guard_address: string | null;
  veto_end: number | null;
  veto_count: number | null;
  support_count: number | null;
  current_answer: boolean | null;
  rebate_creator: string | null;
  rebate_amount: number | null;
  rebate_claimed: boolean | null;
  resolver_address: string | null;
  resolver_reward: number | null;
  resolver_claimed: boolean | null;
  cached_at: string;
  updated_at: string;
}

export interface CacheMetadataRow {
  network: string;
  last_refresh_at: string;
  refresh_status: 'idle' | 'refreshing' | 'error';
  total_markets: number;
  error_message: string | null;
  refresh_duration_ms: number | null;
}

/**
 * Insert a new market into Supabase cache
 * Called when a market is created through the frontend
 */
export async function insertMarketToCache(market: {
  id: number;
  address: string;
  question: string;
  rules: string;
  resolutionSource: string;
  resolutionDeadline: number;
  creator: string;
  category?: string;
}): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping cache insert');
    return false;
  }

  const network = getNetwork();
  const now = Math.floor(Date.now() / 1000);

  try {
    const { error } = await supabase.from('markets').upsert({
      id: market.id,
      network,
      address: market.address,
      question: market.question,
      rules: market.rules,
      resolution_source: market.resolutionSource,
      resolution_deadline: market.resolutionDeadline,
      proposal_start_time: market.resolutionDeadline + 300, // 5 min after deadline
      created_at: now,
      creator: market.creator,
      status: 'open',
      category: market.category || 'other',
      can_propose_now: false,
    }, { onConflict: 'id,network' });

    if (error) {
      console.error('Error inserting market to cache:', error.message);
      return false;
    }

    console.log(`Market ${market.id} cached successfully on ${network}`);
    return true;
  } catch (e) {
    console.error('Error inserting market to cache:', e);
    return false;
  }
}

/**
 * Update market status in cache
 * Called when market state changes (proposed, challenged, resolved, etc.)
 */
export async function updateMarketInCache(
  marketId: number,
  updates: Partial<MarketRow>
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping cache update');
    return false;
  }

  const network = getNetwork();

  try {
    const { error } = await supabase
      .from('markets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', marketId)
      .eq('network', network);

    if (error) {
      console.error('Error updating market in cache:', error.message);
      return false;
    }

    console.log(`Market ${marketId} cache updated on ${network}`);
    return true;
  } catch (e) {
    console.error('Error updating market in cache:', e);
    return false;
  }
}
