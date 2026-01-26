/**
 * StatsSimple - Crash-proof statistics display
 * Uses Supabase cache instead of blockchain API calls
 */

import { useState, useEffect } from 'react';
import { CONTRACTS, getExplorerLink } from '../config/contracts';
import { supabase, isCacheEnabled, getNetwork } from '../config/supabase';

// Protocol constants
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion HNCH
const MIN_BOND = 10_000;
const CHALLENGE_MULTIPLIER = 2;
const CHALLENGE_PERIOD_HOURS = 4;
const MAX_ESCALATIONS = 3;
const VETO_THRESHOLD_PERCENT = 2;
const VETO_THRESHOLD = TOTAL_SUPPLY * (VETO_THRESHOLD_PERCENT / 100);
const VETO_LOCK_HOURS = 24;
const DAO_VOTE_HOURS = 48;
const MARKET_CREATION_FEE = 1_000;
const STAKER_FEE_SHARE = 60;

interface MarketStats {
  total: number;
  active: number;
  resolved: number;
  disputed: number;
}

export function StatsSimple() {
  const [marketStats, setMarketStats] = useState<MarketStats>({ total: 0, active: 0, resolved: 0, disputed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isCacheEnabled() || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const network = getNetwork();

        // Get market counts by status from Supabase
        const { data, error } = await supabase
          .from('markets')
          .select('status')
          .eq('network', network);

        if (!error && data) {
          const stats = data.reduce((acc, m) => {
            acc.total++;
            if (m.status === 'resolved') acc.resolved++;
            else if (m.status === 'voting') acc.disputed++;
            else acc.active++;
            return acc;
          }, { total: 0, active: 0, resolved: 0, disputed: 0 });

          setMarketStats(stats);
        }
      } catch (e) {
        console.error('[StatsSimple] Error loading stats:', e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  // Format large numbers
  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(decimals) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(decimals) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(decimals) + 'K';
    return num.toLocaleString();
  };

  return (
    <section className="stats-page" id="stats">
      <h2>Protocol Statistics</h2>
      <p className="stats-description">
        Real-time metrics and parameters for the HUNCH Oracle protocol
      </p>

      {/* Supply Overview */}
      <div className="stats-section">
        <h3>Token Supply</h3>
        <div className="stats-cards">
          <div className="stats-card large">
            <div className="stats-icon">💎</div>
            <div className="stats-content">
              <span className="stats-label">Total Supply</span>
              <span className="stats-value">{formatNumber(TOTAL_SUPPLY)}</span>
              <span className="stats-unit">HNCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Activity - from cache */}
      <div className="stats-section">
        <h3>Market Activity</h3>
        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-icon">📊</div>
            <div className="stats-content">
              <span className="stats-label">Total Markets</span>
              <span className="stats-value">{loading ? '...' : marketStats.total}</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🟢</div>
            <div className="stats-content">
              <span className="stats-label">Active</span>
              <span className="stats-value">{loading ? '...' : marketStats.active}</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">✅</div>
            <div className="stats-content">
              <span className="stats-label">Resolved</span>
              <span className="stats-value">{loading ? '...' : marketStats.resolved}</span>
            </div>
          </div>
          <div className="stats-card warning">
            <div className="stats-icon">⚖️</div>
            <div className="stats-content">
              <span className="stats-label">In Dispute</span>
              <span className="stats-value">{loading ? '...' : marketStats.disputed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Parameters */}
      <div className="stats-section">
        <h3>Protocol Parameters</h3>
        <div className="params-grid">
          <div className="param-card">
            <span className="param-label">Minimum Bond</span>
            <span className="param-value">{formatNumber(MIN_BOND)} HNCH</span>
            <span className="param-desc">To propose an outcome</span>
          </div>
          <div className="param-card">
            <span className="param-label">Challenge Multiplier</span>
            <span className="param-value">{CHALLENGE_MULTIPLIER}x</span>
            <span className="param-desc">Bond required to challenge</span>
          </div>
          <div className="param-card">
            <span className="param-label">Challenge Period</span>
            <span className="param-value">{CHALLENGE_PERIOD_HOURS} hours</span>
            <span className="param-desc">Time to dispute a proposal</span>
          </div>
          <div className="param-card">
            <span className="param-label">Max Escalations</span>
            <span className="param-value">{MAX_ESCALATIONS}</span>
            <span className="param-desc">Before DAO vote triggers</span>
          </div>
          <div className="param-card">
            <span className="param-label">Market Creation Fee</span>
            <span className="param-value">{formatNumber(MARKET_CREATION_FEE)} HNCH</span>
            <span className="param-desc">To create a new market</span>
          </div>
          <div className="param-card">
            <span className="param-label">Staker Fee Share</span>
            <span className="param-value">{STAKER_FEE_SHARE}%</span>
            <span className="param-desc">Of protocol fees</span>
          </div>
        </div>
      </div>

      {/* DAO Governance */}
      <div className="stats-section">
        <h3>DAO Governance</h3>
        <div className="governance-visual">
          <div className="veto-threshold">
            <div className="threshold-header">
              <span className="threshold-label">Veto Power Threshold</span>
              <span className="threshold-value">{VETO_THRESHOLD_PERCENT}% of supply</span>
            </div>
            <div className="threshold-amount">
              <span className="amount">{formatNumber(VETO_THRESHOLD)}</span>
              <span className="unit">HNCH required</span>
            </div>
          </div>

          <div className="params-grid">
            <div className="param-card">
              <span className="param-label">Stake Lock Period</span>
              <span className="param-value">{VETO_LOCK_HOURS} hours</span>
              <span className="param-desc">Before veto rights activate</span>
            </div>
            <div className="param-card">
              <span className="param-label">DAO Vote Duration</span>
              <span className="param-value">{DAO_VOTE_HOURS} hours</span>
              <span className="param-desc">Veto voting window</span>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Ladder */}
      <div className="stats-section">
        <h3>Bond Escalation Ladder</h3>
        <p className="section-desc">How bonds scale during disputes</p>
        <div className="escalation-ladder">
          {[0, 1, 2, 3].map((level) => {
            const bond = MIN_BOND * Math.pow(CHALLENGE_MULTIPLIER, level);
            const isDao = level === 3;
            return (
              <div key={level} className={`escalation-step ${isDao ? 'dao' : ''}`}>
                <div className="step-level">{isDao ? 'DAO' : `Level ${level + 1}`}</div>
                <div className="step-bond">
                  {isDao ? 'Veto Vote' : `${formatNumber(bond)} HNCH`}
                </div>
                <div className="step-action">
                  {level === 0 ? 'Initial Proposal' :
                   isDao ? '48h Voting Period' :
                   `Challenge (${CHALLENGE_MULTIPLIER}x)`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contracts */}
      <div className="stats-section">
        <h3>Deployed Contracts</h3>
        <div className="contracts-grid">
          {[
            { name: 'HNCH Token', address: CONTRACTS.HNCH_JETTON_MASTER },
            { name: 'Master Oracle', address: CONTRACTS.MASTER_ORACLE },
            { name: 'Price Oracle', address: CONTRACTS.PRICE_ORACLE },
            { name: 'Fee Distributor', address: CONTRACTS.FEE_DISTRIBUTOR },
          ].map((contract) => (
            <a
              key={contract.name}
              href={getExplorerLink(contract.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="contract-card"
            >
              <span className="contract-name">{contract.name}</span>
              <span className="contract-address">
                {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
              </span>
              <span className="contract-link">View on Explorer</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
