/**
 * useMasterOracleBalance - Fetch and monitor Master Oracle contract balance
 *
 * The Master Oracle needs sufficient TON balance to deploy new market contracts.
 * If balance is too low, market creation will fail with action phase error 37.
 *
 * Recommended minimum: 1 TON (covers ~10-20 market deployments)
 */

import { useState, useEffect, useCallback } from 'react';
import { CONTRACTS } from '../config/contracts';
import { getNetworkConfig } from '../config/networks';

interface MasterOracleBalanceResult {
  balance: number | null;        // Balance in TON
  balanceNano: bigint | null;    // Balance in nanoTON
  loading: boolean;
  error: string | null;
  isLow: boolean;                // True if balance < MIN_BALANCE_TON
  refetch: () => Promise<void>;
  address: string;               // Master Oracle address for display
}

// Minimum recommended balance in TON
// Each market deployment costs ~0.05-0.1 TON in gas
const MIN_BALANCE_TON = 0.5;

export function useMasterOracleBalance(): MasterOracleBalanceResult {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceNano, setBalanceNano] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const masterOracleAddress = CONTRACTS.MASTER_ORACLE;

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const config = getNetworkConfig();
      const apiUrl = config.tonapiUrl;

      const response = await fetch(
        `${apiUrl}/accounts/${masterOracleAddress}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      const balanceNanoValue = BigInt(data.balance || 0);
      const balanceValue = Number(balanceNanoValue) / 1e9;

      setBalanceNano(balanceNanoValue);
      setBalance(balanceValue);
    } catch (err: any) {
      console.error('[MasterOracleBalance] Error fetching balance:', err);
      setError(err.message || 'Failed to fetch Master Oracle balance');
    } finally {
      setLoading(false);
    }
  }, [masterOracleAddress]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    balanceNano,
    loading,
    error,
    isLow: balance !== null && balance < MIN_BALANCE_TON,
    refetch: fetchBalance,
    address: masterOracleAddress,
  };
}

// Export constants for use in UI
export const MASTER_ORACLE_MIN_BALANCE = MIN_BALANCE_TON;
