import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCurrentNetwork, getSupabaseConfig } from './networks';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isCacheEnabled = (): boolean => supabase !== null;

export const getNetwork = (): 'testnet' | 'mainnet' => getCurrentNetwork();

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
