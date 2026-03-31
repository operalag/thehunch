import { useState } from 'react';
import { fromZonedTime } from 'date-fns-tz';
import type { TonConnectUIProvider } from '@tonconnect/ui-react';
import { MASTER_ORACLE_MIN_BALANCE } from '../../hooks/useMasterOracleBalance';
import { getExplorerLink } from '../../config/contracts';
import { timezones, formatTimestampInTimezone } from './constants';

// Shape of the masterOracleBalance hook return value used by this component
interface MasterOracleBalanceInfo {
  balance: number | null;
  isLow: boolean;
  loading: boolean;
  address: string;
  refetch: () => void;
}

interface CreateMarketFormProps {
  wallet: ReturnType<typeof import('@tonconnect/ui-react').useTonWallet>;
  formattedBalance: string;
  balance: string | null;
  masterOracleBalance: MasterOracleBalanceInfo;
  createMarket: (question: string, resolutionDeadline: number, rules?: string, resolutionSource?: string) => Promise<void>;
  MIN_BOND_HNCH: number;
  MARKET_CREATION_FEE_HNCH: number;
  refetchMarkets: () => void;
}

export function CreateMarketForm({
  wallet,
  formattedBalance,
  masterOracleBalance,
  createMarket,
  MIN_BOND_HNCH,
  MARKET_CREATION_FEE_HNCH,
  refetchMarkets,
}: CreateMarketFormProps) {
  const [showMasterOracleInfo, setShowMasterOracleInfo] = useState(false);

  // Create market form state
  const [question, setQuestion] = useState('');
  const [rules, setRules] = useState('');
  const [resolutionSource, setResolutionSource] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');
  const [resolutionTime, setResolutionTime] = useState('23:59');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isCreating, setIsCreating] = useState(false);

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Calculate Unix timestamp from date, time, and timezone
  const calculateUnixTimestamp = (): number | null => {
    if (!resolutionDate || !resolutionTime) return null;
    try {
      const dateTimeStr = `${resolutionDate}T${resolutionTime}:00`;
      const utcDate = fromZonedTime(dateTimeStr, timezone);
      return Math.floor(utcDate.getTime() / 1000);
    } catch {
      return null;
    }
  };

  const unixTimestamp = calculateUnixTimestamp();

  const isDateTooFarInFuture = (): boolean => {
    if (!unixTimestamp) return false;
    const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    return unixTimestamp > oneYearFromNow;
  };

  const isDateTooSoon = (): boolean => {
    if (!unixTimestamp) return false;
    const twoHoursFromNow = Math.floor(Date.now() / 1000) + (2 * 60 * 60);
    return unixTimestamp < twoHoursFromNow;
  };

  const isTimestampValid = unixTimestamp && !isDateTooSoon() && !isDateTooFarInFuture();

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !question || !unixTimestamp) return;

    setIsCreating(true);
    try {
      await createMarket(question, unixTimestamp, rules || undefined, resolutionSource || undefined);
      setQuestion('');
      setRules('');
      setResolutionSource('');
      setResolutionDate('');
      setResolutionTime('23:59');
      alert('Market creation transaction sent! The new market will appear after blockchain confirmation (~15-30 seconds). Click "Refresh Markets" to check.');

      setTimeout(() => {
        console.log('[Markets] Auto-refreshing after market creation...');
        refetchMarkets();
      }, 15000);
    } catch (error: any) {
      console.error('Failed to create market:', error);
      alert(error.message || 'Failed to create market. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!wallet) return null;

  return (
    <>
      {/* HNCH Balance Info */}
      <div className="balance-info">
        <span>Your HNCH Balance: <strong>{formattedBalance} HNCH</strong></span>
        <span className="bond-info">Minimum bond: {MIN_BOND_HNCH.toLocaleString()} HNCH</span>
      </div>

      {/* Create Market Form */}
      <div className="create-market">
        <div className="create-market-header">
          <h3>Create New Market</h3>
          <button
            type="button"
            className="info-btn"
            onClick={() => setShowMasterOracleInfo(!showMasterOracleInfo)}
            title="Important: Master Oracle funding info"
          >
            ℹ️
          </button>
        </div>

        {/* Master Oracle Info Popup */}
        {showMasterOracleInfo && (
          <div className="master-oracle-info-popup">
            <div className="info-popup-header">
              <h4>⚠️ Master Oracle Contract Info</h4>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowMasterOracleInfo(false)}
              >
                ✕
              </button>
            </div>
            <div className="info-popup-content">
              <div className={`balance-status ${masterOracleBalance.isLow ? 'low' : 'ok'}`}>
                <span className="status-icon">{masterOracleBalance.isLow ? '🔴' : '🟢'}</span>
                <span className="status-label">Current Balance:</span>
                <span className="status-value">
                  {masterOracleBalance.loading
                    ? 'Loading...'
                    : masterOracleBalance.balance !== null
                      ? `${masterOracleBalance.balance.toFixed(4)} TON`
                      : 'Error loading'}
                </span>
                <button
                  type="button"
                  className="refresh-balance-btn"
                  onClick={() => masterOracleBalance.refetch()}
                  disabled={masterOracleBalance.loading}
                >
                  🔄
                </button>
              </div>

              {masterOracleBalance.isLow && (
                <div className="warning-banner">
                  <strong>⚠️ Balance too low!</strong> Market creation will fail.
                  Minimum recommended: {MASTER_ORACLE_MIN_BALANCE} TON
                </div>
              )}

              <div className="info-section">
                <h5>Why does this matter?</h5>
                <p>
                  The Master Oracle contract deploys new market contracts on the TON blockchain.
                  It needs TON to pay for gas fees during deployment. If the balance is too low,
                  your market creation will fail (your HNCH tokens may be stuck or bounced).
                </p>
              </div>

              <div className="info-section">
                <h5>How to fund the Master Oracle</h5>
                <ol>
                  <li>Copy the Master Oracle address below</li>
                  <li>Send TON from your wallet (recommended: 5-10 TON)</li>
                  <li>Wait for the transaction to confirm</li>
                  <li>Refresh the balance above to verify</li>
                </ol>
              </div>

              <div className="address-section">
                <label>Master Oracle Address:</label>
                <div className="address-copy">
                  <code>{masterOracleBalance.address}</code>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(masterOracleBalance.address);
                      alert('Address copied to clipboard!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <a
                  href={getExplorerLink(masterOracleBalance.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  View on Explorer ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Low balance warning banner (always visible when low) */}
        {masterOracleBalance.isLow && !showMasterOracleInfo && (
          <div className="master-oracle-warning-banner" onClick={() => setShowMasterOracleInfo(true)}>
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              Master Oracle balance low ({masterOracleBalance.balance?.toFixed(4)} TON).
              Market creation may fail. <strong>Click for details.</strong>
            </span>
          </div>
        )}

        <p className="form-description">
          Creating a market costs ~0.5 TON for deployment. After the resolution date, anyone can propose outcomes by bonding HNCH tokens.
        </p>
        <form onSubmit={handleCreateMarket}>
          <div className="form-group">
            <label htmlFor="question">Question (must have YES/NO answer)</label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Will ETH reach $5,000 by December 2025?"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rules">Resolution Rules (optional)</label>
            <textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g., Market resolves YES if price reaches $5,000 at any point before deadline on major exchanges (Binance, Coinbase, Kraken). Price must be sustained for at least 1 minute."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="resolutionSource">Resolution Source (optional)</label>
            <input
              id="resolutionSource"
              type="text"
              value={resolutionSource}
              onChange={(e) => setResolutionSource(e.target.value)}
              placeholder="e.g., CoinGecko, official announcement, etc."
            />
          </div>
          <div className="form-group">
            <label>Resolution Date & Time (when outcome can be reported)</label>
            <div className="datetime-row">
              <input
                id="resolutionDate"
                type="date"
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                min={getMinDate()}
                required
              />
              <input
                id="resolutionTime"
                type="time"
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          {unixTimestamp && (
            <div className="unix-timestamp">
              <span className="label">Resolution Deadline:</span>
              <span className="value">{formatTimestampInTimezone(unixTimestamp, timezone)}</span>
              <span className="hint">
                (UTC: {new Date(unixTimestamp * 1000).toUTCString()})
              </span>
            </div>
          )}
          {isDateTooSoon() && (
            <div className="date-warning date-warning-error">
              <span className="warning-icon">⏰</span>
              <span className="warning-text">
                Resolution date must be at least 2 hours from now to allow time for market discovery.
              </span>
            </div>
          )}
          {isDateTooFarInFuture() && (
            <div className="date-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">
                Warning: This date is more than 1 year in the future. Please double-check the year is correct!
              </span>
            </div>
          )}
          <div className="form-row">
            <div className="cost-display">
              <span className="label">Creation Cost:</span>
              <span className="value">{MARKET_CREATION_FEE_HNCH.toLocaleString()} HNCH + ~0.2 TON</span>
            </div>
            <button type="submit" disabled={isCreating || !isTimestampValid}>
              {isCreating ? 'Creating...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
