import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { getCurrentNetwork, setNetwork, type NetworkType } from '../config/networks';

export function NetworkSwitcher() {
  const [currentNetwork] = useState<NetworkType>(getCurrentNetwork());
  const [tonConnectUI] = useTonConnectUI();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitch = async () => {
    const newNetwork = currentNetwork === 'mainnet' ? 'testnet' : 'mainnet';

    // Confirm the switch
    const confirmed = window.confirm(
      `Switch to ${newNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}?\n\n` +
      `Your wallet will be disconnected and the page will reload.`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      // Disconnect wallet first
      if (tonConnectUI.connected) {
        await tonConnectUI.disconnect();
      }
    } catch (e) {
      console.warn('Error disconnecting wallet:', e);
    }

    // Switch network (this will reload the page)
    setNetwork(newNetwork);
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={isLoading}
      className="network-switcher"
      title={`Currently on ${currentNetwork}. Click to switch.`}
    >
      <span className={`network-indicator ${currentNetwork}`}></span>
      <span className="network-label">
        {isLoading ? 'Switching...' : currentNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'}
      </span>
      <svg
        className="switch-icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4M7 4L3 8M7 4L11 8" />
        <path d="M17 8V20M17 20L21 16M17 20L13 16" />
      </svg>
    </button>
  );
}
