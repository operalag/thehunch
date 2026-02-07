import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { getNetworkConfig, getTonapiHeaders } from '../config/networks';

// Retry delay with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface JettonBalance {
  balance: string;
  formattedBalance: string;
  loading: boolean;
  error: string | null;
}

export function useJettonBalance(): JettonBalance {
  const address = useTonAddress();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance('0');
      return;
    }

    const fetchBalance = async (retryAttempt = 0) => {
      if (retryAttempt === 0) {
        setLoading(true);
        setError(null);
      }

      try {
        // Get config fresh each time to ensure we have correct values
        const config = getNetworkConfig();
        const apiUrl = config.tonapiUrl;
        const jettonMaster = config.contracts.HNCH_JETTON_MASTER;

        console.log(`[HNCH Balance] Network: ${config.name}`);
        console.log(`[HNCH Balance] Fetching for ${address}`);
        console.log(`[HNCH Balance] API: ${apiUrl}`);
        console.log(`[HNCH Balance] Jetton: ${jettonMaster}`);

        const url = `${apiUrl}/accounts/${address}/jettons/${jettonMaster}`;
        console.log(`[HNCH Balance] Full URL: ${url}`);

        const headers = getTonapiHeaders();
        const response = await fetch(url, { headers });
        console.log(`[HNCH Balance] Response status: ${response.status}`);

        if (response.status === 404) {
          console.log('[HNCH Balance] 404 - No jetton wallet yet');
          setBalance('0');
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[HNCH Balance] Response data:', JSON.stringify(data));

        if (!response.ok) {
          if (data.error?.includes('has no jetton wallet')) {
            setBalance('0');
            setLoading(false);
            return;
          }
          if (data.error?.includes('rate limit') || data.error?.includes('free tier')) {
            console.warn(`[HNCH Balance] Rate limited, retry ${retryAttempt + 1}/5...`);
            if (retryAttempt < 5) {
              await delay(2000 * (retryAttempt + 1));
              return fetchBalance(retryAttempt + 1);
            }
            setError('Rate limited');
            setLoading(false);
            return;
          }
          throw new Error(`API error: ${response.status} - ${data.error || 'Unknown'}`);
        }

        // SUCCESS - set the balance
        const balanceValue = String(data.balance || '0');
        console.log(`[HNCH Balance] SUCCESS! Balance: ${balanceValue}`);
        setBalance(balanceValue);
        setError(null);
      } catch (err: any) {
        console.error('[HNCH Balance] FAILED:', err.message);
        if (retryAttempt < 5) {
          console.log(`[HNCH Balance] Retrying (${retryAttempt + 1}/5)...`);
          await delay(2000 * (retryAttempt + 1));
          return fetchBalance(retryAttempt + 1);
        }
        setError(err.message);
      } finally {
        if (retryAttempt === 0 || retryAttempt >= 5) {
          setLoading(false);
        }
      }
    };

    // Fetch once when address changes - NO automatic refresh to prevent rate limiting
    fetchBalance();
  }, [address]);

  // Format balance (9 decimals for HNCH)
  const formattedBalance = (Number(balance) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return { balance, formattedBalance, loading, error };
}

// Hook for TON balance
export function useTonBalance(): { balance: string; formattedBalance: string; loading: boolean; error: string | null } {
  const address = useTonAddress();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance('0');
      return;
    }

    const fetchBalance = async (retryAttempt = 0) => {
      if (retryAttempt === 0) {
        setLoading(true);
        setError(null);
      }

      try {
        const config = getNetworkConfig();
        const apiUrl = config.tonapiUrl;

        console.log(`[TON Balance] Fetching for ${address} from ${apiUrl}`);

        const headers = getTonapiHeaders();
        const response = await fetch(`${apiUrl}/accounts/${address}`, { headers });
        console.log(`[TON Balance] Response status: ${response.status}`);

        const data = await response.json();
        console.log('[TON Balance] Response data:', JSON.stringify(data));

        if (!response.ok) {
          if (data.error?.includes('rate limit') || data.error?.includes('free tier')) {
            console.warn(`[TON Balance] Rate limited, retry ${retryAttempt + 1}/5...`);
            if (retryAttempt < 5) {
              await delay(2000 * (retryAttempt + 1));
              return fetchBalance(retryAttempt + 1);
            }
            setError('Rate limited');
            setLoading(false);
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const balanceValue = String(data.balance || '0');
        console.log(`[TON Balance] SUCCESS! Balance: ${balanceValue}`);
        setBalance(balanceValue);
        setError(null);
      } catch (err: any) {
        console.error('[TON Balance] FAILED:', err.message);
        if (retryAttempt < 5) {
          console.log(`[TON Balance] Retrying (${retryAttempt + 1}/5)...`);
          await delay(2000 * (retryAttempt + 1));
          return fetchBalance(retryAttempt + 1);
        }
        setError(err.message);
      } finally {
        if (retryAttempt === 0 || retryAttempt >= 5) {
          setLoading(false);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(() => fetchBalance(), 15000);
    return () => clearInterval(interval);
  }, [address]);

  const formattedBalance = (Number(balance) / 1e9).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return { balance, formattedBalance, loading, error };
}
