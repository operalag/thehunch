import { useState, useEffect } from 'react';
import { CONTRACTS, getExplorerLink } from '../config/contracts';
import { getNetworkConfig } from '../config/networks';
import './TokenFlow.css';

// Get API URL from network config (no API key needed for public endpoints)
const getTonapiUrl = () => getNetworkConfig().tonapiUrl;

interface WalletBalance {
  address: string;
  name: string;
  hnchBalance: string;
  tonBalance: string;
  jettonWallet?: string;
  loading: boolean;
  error?: string;
}

interface EpochInfo {
  currentEpoch: number;
  epochStart: number;
  currentEpochRewards: string;
  timeUntilNext: number;
}

// Key addresses in the HUNCH ecosystem
const DEPLOYER_WALLET = '0QBTNdmtPpYGrWqKzcbaZsbXHOrImwcp7yPQ-htNDs199EYJ';

export function TokenFlow() {
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
  const [pendingAmounts, setPendingAmounts] = useState<{ treasury: string; burn: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Fetch HNCH balance for an address
  const fetchHnchBalance = async (ownerAddress: string): Promise<{ balance: string; jettonWallet: string | null }> => {
    try {
      const apiUrl = getTonapiUrl();
      const response = await fetch(
        `${apiUrl}/accounts/${ownerAddress}/jettons/${CONTRACTS.HNCH_JETTON_MASTER}`
      );

      if (!response.ok) {
        return { balance: '0', jettonWallet: null };
      }

      const data = await response.json();
      return {
        balance: data.balance || '0',
        jettonWallet: data.wallet_address?.address || null,
      };
    } catch {
      return { balance: '0', jettonWallet: null };
    }
  };

  // Fetch TON balance for an address
  const fetchTonBalance = async (address: string): Promise<string> => {
    try {
      const apiUrl = getTonapiUrl();
      const response = await fetch(
        `${apiUrl}/accounts/${address}`
      );

      if (!response.ok) return '0';

      const data = await response.json();
      return data.balance || '0';
    } catch {
      return '0';
    }
  };

  // Fetch epoch info from Fee Distributor
  const fetchEpochInfo = async () => {
    try {
      const apiUrl = getTonapiUrl();
      const response = await fetch(
        `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_epoch_info`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.stack && data.stack.length >= 4) {
        const parseNum = (val: any): number => {
          if (typeof val === 'object' && val.num) {
            const numStr = val.num.startsWith('0x') ? val.num : '0x' + val.num;
            return parseInt(numStr, 16) || 0;
          }
          return parseInt(val, 10) || 0;
        };

        const parseBigNum = (val: any): string => {
          if (typeof val === 'object' && val.num) {
            const numStr = val.num.startsWith('0x') ? val.num : '0x' + val.num;
            return BigInt(numStr).toString();
          }
          return '0';
        };

        return {
          currentEpoch: parseNum(data.stack[0]),
          epochStart: parseNum(data.stack[1]),
          currentEpochRewards: parseBigNum(data.stack[2]),
          timeUntilNext: parseNum(data.stack[3]),
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Fetch pending amounts from Fee Distributor
  const fetchPendingAmounts = async () => {
    try {
      const apiUrl = getTonapiUrl();
      const response = await fetch(
        `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_pending_amounts`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.stack && data.stack.length >= 2) {
        const parseBigNum = (val: any): string => {
          if (typeof val === 'object' && val.num) {
            const numStr = val.num.startsWith('0x') ? val.num : '0x' + val.num;
            return BigInt(numStr).toString();
          }
          return '0';
        };

        return {
          treasury: parseBigNum(data.stack[0]),
          burn: parseBigNum(data.stack[1]),
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Format HNCH amount (9 decimals)
  const formatHnch = (amount: string): string => {
    const num = Number(amount) / 1e9;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format TON amount (9 decimals)
  const formatTon = (amount: string): string => {
    const num = Number(amount) / 1e9;
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // Define wallets to track
      const walletsToFetch = [
        { address: DEPLOYER_WALLET, name: 'Deployer / Treasury' },
        { address: CONTRACTS.MASTER_ORACLE, name: 'Master Oracle' },
        { address: CONTRACTS.FEE_DISTRIBUTOR, name: 'Fee Distributor' },
        { address: CONTRACTS.HNCH_JETTON_MASTER, name: 'HNCH Jetton Master' },
      ];

      // Fetch balances for all wallets
      const walletData = await Promise.all(
        walletsToFetch.map(async (w) => {
          const [hnchData, tonBalance] = await Promise.all([
            fetchHnchBalance(w.address),
            fetchTonBalance(w.address),
          ]);

          return {
            address: w.address,
            name: w.name,
            hnchBalance: hnchData.balance,
            tonBalance,
            jettonWallet: hnchData.jettonWallet || undefined,
            loading: false,
          };
        })
      );

      setWallets(walletData);

      // Fetch epoch info and pending amounts
      const [epoch, pending] = await Promise.all([
        fetchEpochInfo(),
        fetchPendingAmounts(),
      ]);

      setEpochInfo(epoch);
      setPendingAmounts(pending);
      setLoading(false);
    };

    fetchAllData();
    // No automatic refresh to prevent memory issues
    // User can manually refresh by collapsing/expanding the section
  }, []);

  return (
    <section className="token-flow-section">
      <div className="section-header" onClick={() => setExpanded(!expanded)}>
        <h2>HNCH Token Flow</h2>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
          {expanded ? '−' : '+'}
        </span>
      </div>

      {expanded && (
        <div className="token-flow-content">
          {loading ? (
            <div className="loading">Loading token flow data...</div>
          ) : (
            <>
              {/* Epoch Info */}
              {epochInfo && (
                <div className="epoch-info-card">
                  <h3>Current Epoch: #{epochInfo.currentEpoch}</h3>
                  <div className="epoch-stats">
                    <div className="stat">
                      <span className="label">Accumulating Rewards</span>
                      <span className="value">{formatHnch(epochInfo.currentEpochRewards)} HNCH</span>
                    </div>
                    <div className="stat">
                      <span className="label">Next Epoch In</span>
                      <span className="value countdown">{formatTime(epochInfo.timeUntilNext)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Distribution */}
              {pendingAmounts && (
                <div className="pending-distribution">
                  <h3>Pending Distribution</h3>
                  <div className="pending-stats">
                    <div className="stat treasury">
                      <span className="label">Treasury (10%)</span>
                      <span className="value">{formatHnch(pendingAmounts.treasury)} HNCH</span>
                    </div>
                    <div className="stat resolver">
                      <span className="label">Resolver Reward (5%)</span>
                      <span className="value">{formatHnch(pendingAmounts.burn)} HNCH</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Flow Diagram */}
              <div className="flow-diagram">
                <h3>Fee Distribution Flow</h3>
                <div className="flow-chart">
                  <div className="flow-node source">
                    <span className="node-label">Market Creation</span>
                    <span className="node-value">10,000 HNCH</span>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-distribution">
                    <div className="flow-node stakers">
                      <span className="node-label">Stakers</span>
                      <span className="node-value">60%</span>
                    </div>
                    <div className="flow-node creator">
                      <span className="node-label">Creator Rebate</span>
                      <span className="node-value">25%</span>
                    </div>
                    <div className="flow-node treasury">
                      <span className="node-label">Treasury</span>
                      <span className="node-value">10%</span>
                    </div>
                    <div className="flow-node resolver">
                      <span className="node-label">Resolver Reward</span>
                      <span className="node-value">5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Balances */}
              <div className="wallet-balances">
                <h3>Contract & Wallet Balances</h3>
                <div className="wallets-grid">
                  {wallets.map((wallet) => (
                    <div key={wallet.address} className="wallet-card">
                      <div className="wallet-header">
                        <span className="wallet-name">{wallet.name}</span>
                        <a
                          href={getExplorerLink(wallet.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          View ↗
                        </a>
                      </div>
                      <div className="wallet-address">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                      </div>
                      <div className="wallet-balances-row">
                        <div className="balance hnch">
                          <span className="balance-label">HNCH</span>
                          <span className="balance-value">{formatHnch(wallet.hnchBalance)}</span>
                        </div>
                        <div className="balance ton">
                          <span className="balance-label">TON</span>
                          <span className="balance-value">{formatTon(wallet.tonBalance)}</span>
                        </div>
                      </div>
                      {wallet.jettonWallet && (
                        <div className="jetton-wallet">
                          <span className="label">Jetton Wallet:</span>
                          <a
                            href={getExplorerLink(wallet.jettonWallet)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {wallet.jettonWallet.slice(0, 8)}...
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contract Addresses Reference */}
              <div className="contract-addresses">
                <h3>Contract Addresses</h3>
                <div className="addresses-list">
                  <div className="address-item">
                    <span className="contract-name">HNCH Jetton Master</span>
                    <a href={getExplorerLink(CONTRACTS.HNCH_JETTON_MASTER)} target="_blank" rel="noopener noreferrer">
                      {CONTRACTS.HNCH_JETTON_MASTER}
                    </a>
                  </div>
                  <div className="address-item">
                    <span className="contract-name">Master Oracle</span>
                    <a href={getExplorerLink(CONTRACTS.MASTER_ORACLE)} target="_blank" rel="noopener noreferrer">
                      {CONTRACTS.MASTER_ORACLE}
                    </a>
                  </div>
                  <div className="address-item">
                    <span className="contract-name">Fee Distributor</span>
                    <a href={getExplorerLink(CONTRACTS.FEE_DISTRIBUTOR)} target="_blank" rel="noopener noreferrer">
                      {CONTRACTS.FEE_DISTRIBUTOR}
                    </a>
                  </div>
                  <div className="address-item">
                    <span className="contract-name">Price Oracle</span>
                    <a href={getExplorerLink(CONTRACTS.PRICE_ORACLE)} target="_blank" rel="noopener noreferrer">
                      {CONTRACTS.PRICE_ORACLE}
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
