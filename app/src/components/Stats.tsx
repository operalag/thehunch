import { useState, useEffect } from 'react';
import { CONTRACTS, getExplorerLink } from '../config/contracts';
import { useStakingInfo } from '../hooks/useStakingInfo';
import { useMarkets } from '../hooks/useMarkets';
import { getNetworkConfig } from '../config/networks';

// Get API URL from network config (no API key needed for public endpoints)
const getTonapiUrl = () => getNetworkConfig().tonapiUrl;

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

export function Stats() {
  const { totalStaked, formattedTotalStaked } = useStakingInfo();
  const { markets } = useMarkets();
  const [circulatingSupply, setCirculatingSupply] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Calculate market stats
  const activeMarkets = markets.filter(m => m.status !== 'resolved').length;
  const resolvedMarkets = markets.filter(m => m.status === 'resolved').length;
  const totalMarkets = markets.length;
  const disputedMarkets = markets.filter(m => m.status === 'voting').length;

  // Calculate total value bonded
  const totalBonded = markets.reduce((sum, m) => {
    if (m.status === 'proposed' || m.status === 'challenged') {
      return sum + (m.currentBond || 0);
    }
    return sum;
  }, 0);

  // Staking metrics
  const totalStakedNum = Number(totalStaked) / 1e9;
  const stakingPercent = (totalStakedNum / TOTAL_SUPPLY) * 100;
  const circulatingPercent = (circulatingSupply / TOTAL_SUPPLY) * 100;

  // Fetch circulating supply (total minted)
  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const apiUrl = getTonapiUrl();
        const response = await fetch(
          `${apiUrl}/jettons/${CONTRACTS.HNCH_JETTON_MASTER}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.total_supply) {
            setCirculatingSupply(Number(data.total_supply) / 1e9);
          }
        }
      } catch (err) {
        console.error('Failed to fetch supply:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupply();
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
          <div className="stats-card">
            <div className="stats-icon">🔄</div>
            <div className="stats-content">
              <span className="stats-label">Circulating</span>
              <span className="stats-value">{loading ? '...' : formatNumber(circulatingSupply)}</span>
              <span className="stats-percent">{circulatingPercent.toFixed(1)}%</span>
            </div>
          </div>
          <div className="stats-card highlight">
            <div className="stats-icon">🔒</div>
            <div className="stats-content">
              <span className="stats-label">Total Staked</span>
              <span className="stats-value">{formattedTotalStaked}</span>
              <span className="stats-percent">{stakingPercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Staking Progress Bar */}
        <div className="supply-bar-container">
          <div className="supply-bar">
            <div
              className="supply-segment staked"
              style={{ width: `${Math.min(stakingPercent, 100)}%` }}
              title={`Staked: ${formatNumber(totalStakedNum)} HNCH`}
            />
            <div
              className="supply-segment circulating"
              style={{ width: `${Math.min(circulatingPercent - stakingPercent, 100 - stakingPercent)}%` }}
              title={`Circulating (unstaked): ${formatNumber(circulatingSupply - totalStakedNum)} HNCH`}
            />
          </div>
          <div className="supply-legend">
            <span className="legend-item"><span className="dot staked"></span> Staked</span>
            <span className="legend-item"><span className="dot circulating"></span> Circulating</span>
            <span className="legend-item"><span className="dot remaining"></span> Remaining</span>
          </div>
        </div>
      </div>

      {/* Market Activity */}
      <div className="stats-section">
        <h3>Market Activity</h3>
        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-icon">📊</div>
            <div className="stats-content">
              <span className="stats-label">Total Markets</span>
              <span className="stats-value">{totalMarkets}</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🟢</div>
            <div className="stats-content">
              <span className="stats-label">Active</span>
              <span className="stats-value">{activeMarkets}</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">✅</div>
            <div className="stats-content">
              <span className="stats-label">Resolved</span>
              <span className="stats-value">{resolvedMarkets}</span>
            </div>
          </div>
          <div className="stats-card warning">
            <div className="stats-icon">⚖️</div>
            <div className="stats-content">
              <span className="stats-label">In Dispute</span>
              <span className="stats-value">{disputedMarkets}</span>
            </div>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stats-card wide">
            <div className="stats-icon">💰</div>
            <div className="stats-content">
              <span className="stats-label">Total Value Bonded</span>
              <span className="stats-value">{formatNumber(totalBonded, 0)}</span>
              <span className="stats-unit">HNCH</span>
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
            <div className="threshold-bar">
              <div className="threshold-marker" style={{ left: `${VETO_THRESHOLD_PERCENT}%` }}>
                <span className="marker-line"></span>
                <span className="marker-label">{VETO_THRESHOLD_PERCENT}%</span>
              </div>
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
              <span className="contract-link">View on Explorer ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
