import {
  getNetworkConfig,
  getOtherNetworkName,
  isTestnet,
  isMainnet,
  setNetwork,
} from '../config/networks';

export function NetworkIndicator() {
  const config = getNetworkConfig();
  const otherNetwork = getOtherNetworkName();

  const handleSwitch = () => {
    const newNetwork = isMainnet() ? 'testnet' : 'mainnet';
    if (window.confirm(`Switch to ${otherNetwork}? The page will reload.`)) {
      setNetwork(newNetwork);
    }
  };

  return (
    <div className="network-indicator">
      <div className={`network-badge ${isTestnet() ? 'testnet' : 'mainnet'}`}>
        <span className="network-dot"></span>
        <span className="network-name">{config.displayName}</span>
      </div>
      <button
        onClick={handleSwitch}
        className="network-switch-link"
        title={`Switch to ${otherNetwork}`}
      >
        Switch to {otherNetwork}
      </button>
    </div>
  );
}

// Compact version for header
export function NetworkBadge() {
  const config = getNetworkConfig();

  return (
    <div className={`network-badge compact ${isTestnet() ? 'testnet' : 'mainnet'}`}>
      <span className="network-dot"></span>
      <span className="network-name">{config.displayName}</span>
    </div>
  );
}

// Warning banner for testnet
export function TestnetWarning() {
  if (isMainnet()) return null;

  const handleSwitch = () => {
    if (window.confirm('Switch to Mainnet? The page will reload.')) {
      setNetwork('mainnet');
    }
  };

  return (
    <div className="testnet-warning-banner">
      <span className="warning-icon">!</span>
      <span className="warning-text">
        You are on <strong>Testnet</strong>. Tokens have no real value.
      </span>
      <button onClick={handleSwitch} className="switch-link">
        Go to Mainnet
      </button>
    </div>
  );
}
