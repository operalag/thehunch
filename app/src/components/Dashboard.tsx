import { useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { CONTRACTS, getExplorerLink } from '../config/contracts';
import { useJettonBalance, useTonBalance } from '../hooks/useJettonBalance';
import { useStakingInfo } from '../hooks/useStakingInfo';
import { getNetworkConfig, isTestnet } from '../config/networks';

export function Dashboard() {
  const wallet = useTonWallet();
  const address = useTonAddress();
  const { formattedBalance: hnchBalance, loading: hnchLoading, error: hnchError } = useJettonBalance();
  const { formattedBalance: tonBalance, loading: tonLoading, error: tonError } = useTonBalance();
  const { formattedUserStake, loading: stakingLoading } = useStakingInfo();
  const networkConfig = getNetworkConfig();

  if (!wallet) {
    return (
      <section className="dashboard" id="dashboard">
        <div className="connect-prompt">
          <h2>Welcome to HUNCH Oracle</h2>
          <p>Connect your TonKeeper wallet to get started</p>
          <div className="features">
            <div className="feature">
              <span className="icon">🔮</span>
              <h3>Predict Markets</h3>
              <p>Create and participate in prediction markets</p>
            </div>
            <div className="feature">
              <span className="icon">💰</span>
              <h3>Earn HNCH</h3>
              <p>Stake tokens and earn rewards</p>
            </div>
            <div className="feature">
              <span className="icon">⚖️</span>
              <h3>Resolve Disputes</h3>
              <p>Vote on challenged outcomes</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard" id="dashboard">
      <h2>Dashboard</h2>

      {isTestnet() && (
        <div className="info-box">
          <h4>How to Test the Demo</h4>
          <p>
            You need <strong>$TON on testnet</strong> and <strong>$HNCH on testnet</strong> to test this demo.
          </p>
          <p>
            To claim testnet $HNCH, you need to be a member. Buy a membership on{' '}
            <a href="https://getgems.io/collection/EQDirS1vK_KX28S-ugepwRJqwJJN77liPvZe3rtgkcrLW-KH" target="_blank" rel="noopener noreferrer">
              GetGems
            </a>{' '}
            and reach out on{' '}
            <a href="https://t.me/hunch_oracle" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>.
          </p>
        </div>
      )}

      <div className="wallet-info">
        <h3>Connected Wallet</h3>
        <p className="address">{address}</p>
        <a
          href={getExplorerLink(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="explorer-link"
        >
          View on Explorer ↗
        </a>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>HNCH Balance</h4>
          <p className="stat-value">{hnchLoading ? '...' : hnchBalance}</p>
          <span className="stat-label">HNCH</span>
          {hnchError && <span className="stat-error" title={hnchError}>Retrying...</span>}
        </div>
        <div className="stat-card">
          <h4>TON Balance</h4>
          <p className="stat-value">{tonLoading ? '...' : tonBalance}</p>
          <span className="stat-label">TON</span>
          {tonError && <span className="stat-error" title={tonError}>Retrying...</span>}
        </div>
        <div className="stat-card highlight">
          <h4>Staked HNCH</h4>
          <p className="stat-value">{stakingLoading ? '...' : formattedUserStake}</p>
          <span className="stat-label">HNCH</span>
        </div>
        <div className="stat-card">
          <h4>Pending Rewards</h4>
          <p className="stat-value">0.00</p>
          <span className="stat-label">HNCH</span>
        </div>
      </div>

      <div className="contracts-info">
        <h3>Deployed Contracts</h3>
        <div className="contract-list">
          <div className="contract-item">
            <span className="contract-name">HNCH Token</span>
            <a
              href={getExplorerLink(CONTRACTS.HNCH_JETTON_MASTER)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTRACTS.HNCH_JETTON_MASTER.slice(0, 8)}...{CONTRACTS.HNCH_JETTON_MASTER.slice(-6)}
            </a>
          </div>
          <div className="contract-item">
            <span className="contract-name">Master Oracle</span>
            <a
              href={getExplorerLink(CONTRACTS.MASTER_ORACLE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTRACTS.MASTER_ORACLE.slice(0, 8)}...{CONTRACTS.MASTER_ORACLE.slice(-6)}
            </a>
          </div>
          <div className="contract-item">
            <span className="contract-name">Price Oracle</span>
            <a
              href={getExplorerLink(CONTRACTS.PRICE_ORACLE)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTRACTS.PRICE_ORACLE.slice(0, 8)}...{CONTRACTS.PRICE_ORACLE.slice(-6)}
            </a>
          </div>
          <div className="contract-item">
            <span className="contract-name">Fee Distributor</span>
            <a
              href={getExplorerLink(CONTRACTS.FEE_DISTRIBUTOR)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTRACTS.FEE_DISTRIBUTOR.slice(0, 8)}...{CONTRACTS.FEE_DISTRIBUTOR.slice(-6)}
            </a>
          </div>
        </div>
      </div>

      {/* Debug Info - shows current network configuration */}
      <details className="debug-info">
        <summary>Network Debug Info</summary>
        <div className="debug-content">
          <p><strong>Network:</strong> {networkConfig.name}</p>
          <p><strong>API URL:</strong> {networkConfig.tonapiUrl}</p>
          <p><strong>Chain ID:</strong> {networkConfig.chainId}</p>
          <p><strong>HNCH Contract:</strong> {CONTRACTS.HNCH_JETTON_MASTER}</p>
          <p><strong>Master Oracle:</strong> {CONTRACTS.MASTER_ORACLE}</p>
          <p><strong>Fee Distributor:</strong> {CONTRACTS.FEE_DISTRIBUTOR}</p>
        </div>
      </details>
    </section>
  );
}
