import { TonConnectButton } from '@tonconnect/ui-react';
import { NetworkSwitcher } from './NetworkSwitcher';

const APP_VERSION = 'RC-260126-A'; // Release Candidate - V6.3 ICC Markets, Staking Verified

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>HUNCH Oracle</h1>
          <span className="version-badge">{APP_VERSION}</span>
        </div>
        <nav className="nav">
          <a href="https://thehunch.app" target="_blank" rel="noopener noreferrer">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#markets">Markets</a>
          <a href="#stake">Stake</a>
          <a href="#stats">Stats</a>
        </nav>
        <div className="header-actions">
          <NetworkSwitcher />
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
