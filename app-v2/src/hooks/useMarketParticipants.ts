/**
 * useMarketParticipants - Fetch participants and determine bond winners
 *
 * This hook fetches all participants (proposers and challengers) for a given market
 * and determines who won based on the final answer.
 *
 * Winner logic:
 * - Compare participant's answer with market's final answer
 * - Winner = participant whose answer matches current_answer
 * - Calculate winnings: participant's bond + loser's bonds + 2000 HNCH bonus
 */

import { useState, useEffect } from 'react';
import { supabase, isCacheEnabled, getNetwork } from '../config/supabase';

export interface Participant {
  id: number;
  marketId: number;
  marketAddress: string;
  participantAddress: string;
  action: 'propose' | 'challenge';
  answer: boolean;
  bondAmount: number; // in HNCH (already converted from nano)
  escalationLevel: number;
  timestamp: number;
  txHash: string | null;
}

export interface WinnerInfo {
  participant: Participant;
  winnings: number; // Total winnings in HNCH
  bondReturned: number; // Original bond
  bondsWon: number; // Loser bonds won
  bonus: number; // 2000 HNCH bonus
}

interface UseMarketParticipantsResult {
  participants: Participant[];
  winner: WinnerInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketParticipants(
  marketAddress: string,
  finalAnswer?: boolean // The market's resolved answer
): UseMarketParticipantsResult {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isCacheEnabled() || !supabase) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }

      const network = getNetwork();

      // Fetch participants for this market
      const { data, error: fetchError } = await supabase
        .from('market_participants')
        .select('*')
        .eq('market_address', marketAddress)
        .eq('network', network)
        .order('timestamp', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch participants: ${fetchError.message}`);
      }

      if (!data || data.length === 0) {
        setParticipants([]);
        setWinner(null);
        setLoading(false);
        return;
      }

      // Transform to Participant objects
      const transformedParticipants: Participant[] = data.map((row) => ({
        id: row.id,
        marketId: row.market_id,
        marketAddress: row.market_address,
        participantAddress: row.participant_address,
        action: row.action,
        answer: row.answer,
        bondAmount: Number(row.bond_amount) / 1e9, // Convert from nano HNCH to HNCH
        escalationLevel: row.escalation_level,
        timestamp: row.timestamp,
        txHash: row.tx_hash,
      }));

      setParticipants(transformedParticipants);

      // Determine winner if market is resolved
      if (finalAnswer !== undefined) {
        const winnerInfo = determineWinner(transformedParticipants, finalAnswer);
        setWinner(winnerInfo);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('[useMarketParticipants] Error:', err);
      setError(err.message || 'Failed to fetch participants');
      setParticipants([]);
      setWinner(null);
      setLoading(false);
    }
  };

  // Determine who won the bonds
  const determineWinner = (
    participants: Participant[],
    finalAnswer: boolean
  ): WinnerInfo | null => {
    if (participants.length === 0) return null;

    // Find the participant whose answer matches the final answer
    // In case of multiple participants with same answer, the last one (highest escalation) wins
    const winners = participants.filter((p) => p.answer === finalAnswer);

    if (winners.length === 0) return null;

    // The winner is the last participant with matching answer (highest escalation)
    const winningParticipant = winners[winners.length - 1];

    // Calculate winnings
    const totalBonds = participants.reduce((sum, p) => sum + p.bondAmount, 0);
    const loserBonds = totalBonds - winningParticipant.bondAmount;
    const bonus = 2000; // 2k HNCH bonus for winner

    return {
      participant: winningParticipant,
      winnings: winningParticipant.bondAmount + loserBonds + bonus,
      bondReturned: winningParticipant.bondAmount,
      bondsWon: loserBonds,
      bonus,
    };
  };

  useEffect(() => {
    if (marketAddress) {
      fetchParticipants();
    }
  }, [marketAddress, finalAnswer]);

  return {
    participants,
    winner,
    loading,
    error,
    refetch: fetchParticipants,
  };
}
