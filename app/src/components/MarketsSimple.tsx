/**
 * MarketsSimple - Minimal markets display from Supabase cache
 * This is a crash-proof version that only displays cached data
 */

import { useState, useEffect } from 'react';
import { supabase, isCacheEnabled, getNetwork } from '../config/supabase';

interface MarketData {
  id: number;
  address: string;
  question: string;
  status: string;
  category: string;
  resolution_deadline: number;
  can_propose_now: boolean;
}

export function MarketsSimple() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('initializing...');

  useEffect(() => {
    async function loadMarkets() {
      const cacheEnabled = isCacheEnabled();
      const network = getNetwork();
      setDebug(`cache=${cacheEnabled}, network=${network}, supabase=${supabase ? 'yes' : 'null'}`);

      if (!cacheEnabled || !supabase) {
        setError(`Cache not configured (enabled=${cacheEnabled})`);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('markets')
          .select('id, address, question, status, category, resolution_deadline, can_propose_now')
          .eq('network', network)
          .order('id', { ascending: false });

        setDebug(`cache=${cacheEnabled}, network=${network}, fetched=${data?.length || 0}, error=${fetchError?.message || 'none'}`);

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setMarkets(data || []);
        }
      } catch (e: any) {
        setDebug(`cache=${cacheEnabled}, network=${network}, exception=${e.message}`);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#4CAF50';
      case 'proposed': return '#FF9800';
      case 'challenged': return '#f44336';
      case 'resolved': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <section className="markets" id="markets">
      <h2>Prediction Markets</h2>

      {/* Debug info - remove after fixing */}
      <p style={{ fontSize: '0.7rem', color: '#666', background: '#222', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
        DEBUG: {debug}
      </p>

      {loading && <p>Loading markets from cache...</p>}

      {error && (
        <div className="error-message" style={{ padding: '1rem', background: '#ffebee', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Make sure the database migration has been applied and cache is populated.
          </p>
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <p>No markets found in cache. Please run the cache population script.</p>
      )}

      {!loading && markets.length > 0 && (
        <div className="market-cards">
          {markets.map((market) => (
            <div key={market.id} className="market-card" style={{
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              background: '#1a1a2e'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{
                  background: getStatusColor(market.status),
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}>
                  {market.status}
                </span>
                <span style={{ color: '#888' }}>#{market.id}</span>
              </div>

              <h4 style={{ margin: '1rem 0', fontSize: '1.1rem' }}>{market.question}</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.85rem' }}>
                <span>Deadline: {formatDate(market.resolution_deadline)}</span>
                <span style={{ textTransform: 'capitalize' }}>{market.category}</span>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <a
                  href={`https://testnet.tonviewer.com/${market.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#64B5F6', fontSize: '0.85rem' }}
                >
                  View Contract →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
