import { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { useContract } from '../hooks/useContract';
import { useJettonBalance } from '../hooks/useJettonBalance';
import { useStakingInfo } from '../hooks/useStakingInfo';
import { CONTRACTS } from '../config/contracts';
import { getExplorerLink } from '../config/networks';

// Info tooltip component for claim rewards rules
function ClaimInfoTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="claim-info-tooltip-container">
      <button
        type="button"
        className="info-icon-btn"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        aria-label="Claim rewards information"
      >
        <span className="info-icon">ⓘ</span>
      </button>
      {showTooltip && (
        <div className="claim-tooltip">
          <h4>Epoch-Based Rewards</h4>
          <ul>
            <li><strong>Current epoch rewards are NOT claimable</strong> — still accumulating</li>
            <li><strong>Completed epoch rewards ARE claimable</strong> — anytime after they end</li>
            <li><strong>Up to 30 past epochs</strong> can be claimed in one transaction (gas limit)</li>
            <li><strong>Rewards are proportional</strong> to your stake at each epoch's snapshot</li>
          </ul>
          <p className="tooltip-note">Epochs last 24 hours. "Pending Distribution" shows rewards accumulating in the current epoch.</p>
        </div>
      )}
    </div>
  );
}

// Format seconds into hours:minutes:seconds
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Stake() {
  const wallet = useTonWallet();
  const { stakeTokens, unstakeTokens, claimStakerRewards } = useContract();
  const { balance, formattedBalance, loading: balanceLoading } = useJettonBalance();
  const {
    formattedTotalStaked,
    formattedUserStake,
    userStake,
    canUnstake,
    timeUntilUnlock,
    formattedUserPendingRewards,
    userPendingRewards,
    apy,
    pendingStakerRewards,
    currentEpoch,
    timeUntilNextEpoch,
    userLastClaimedEpoch,
    claimableEpochs,
    feeDistributorAvailable,
    loading: stakingLoading,
    refetch: refetchStaking
  } = useStakingInfo();

  const [amount, setAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Live countdown states
  const [epochCountdown, setEpochCountdown] = useState(timeUntilNextEpoch);
  const [unlockCountdown, setUnlockCountdown] = useState(timeUntilUnlock);

  // Sync countdown states when hook values change (e.g., after refetch)
  useEffect(() => {
    setEpochCountdown(timeUntilNextEpoch);
  }, [timeUntilNextEpoch]);

  useEffect(() => {
    setUnlockCountdown(timeUntilUnlock);
  }, [timeUntilUnlock]);

  // Live countdown timer - decrements every second
  useEffect(() => {
    const timer = setInterval(() => {
      setEpochCountdown(prev => prev > 0 ? prev - 1 : 0);
      setUnlockCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate max amount (balance in HNCH, not nano)
  const maxAmount = (Number(balance) / 1e9).toString();
  const maxUnstakeAmount = (Number(userStake) / 1e9).toString();
  const hasStake = Number(userStake) > 0;

  // Veto eligibility constants
  const VETO_THRESHOLD_HNCH = 2_000_000; // 2% of 100M supply

  // Calculate veto eligibility
  const userStakeHnch = Number(userStake) / 1e9;
  const hasEnoughForVeto = userStakeHnch >= VETO_THRESHOLD_HNCH;
  const isVetoEligible = hasEnoughForVeto && timeUntilUnlock <= 0;
  const vetoPercentage = Math.min(100, (userStakeHnch / VETO_THRESHOLD_HNCH) * 100);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount) return;

    setIsStaking(true);
    try {
      await stakeTokens(amount);
      setAmount('');
      alert('Staking transaction sent! Your stake will update after blockchain confirmation.');
      // Refetch after a delay to allow blockchain to process
      setTimeout(refetchStaking, 15000);
    } catch (error: any) {
      console.error('Failed to stake:', error);
      alert(error.message || 'Failed to stake. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !unstakeAmount) return;

    setIsUnstaking(true);
    try {
      await unstakeTokens(unstakeAmount);
      setUnstakeAmount('');
      alert('Unstake request sent! Your tokens will be available after the 24-hour lock period.');
      setTimeout(refetchStaking, 15000);
    } catch (error: any) {
      console.error('Failed to unstake:', error);
      alert(error.message || 'Failed to unstake. Please try again.');
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!wallet) return;

    const pendingAmount = Number(userPendingRewards) / 1e9;
    if (pendingAmount <= 0) {
      alert('No rewards to claim.');
      return;
    }

    setIsClaiming(true);
    try {
      await claimStakerRewards();
      alert(`Claim transaction submitted. Check your wallet in ~15 seconds to verify the ${pendingAmount.toLocaleString()} HNCH was received.`);
      setTimeout(refetchStaking, 15000);
    } catch (error: any) {
      console.error('Failed to claim rewards:', error);
      alert(error.message || 'Failed to claim rewards. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Check if user has pending rewards to claim
  const hasPendingRewards = Number(userPendingRewards) > 0;
  const hasStakeForClaim = Number(userStake) > 0;

  if (!wallet) {
    return (
      <section className="stake" id="stake">
        <h2>Stake HNCH</h2>
        <div className="connect-wallet-prompt">
          <div className="connect-icon">🔗</div>
          <h3>Connect Wallet to Continue</h3>
          <p className="connect-message">Connect your wallet to:</p>
          <ul className="connect-features">
            <li>Stake HNCH tokens and earn rewards</li>
            <li>Claim your staking rewards</li>
            <li>Participate in DAO governance</li>
            <li>Vote on disputed market outcomes</li>
          </ul>
          <p className="connect-hint">Use the "Connect Wallet" button at the top of the page</p>
        </div>
      </section>
    );
  }

  return (
    <section className="stake" id="stake">
      <h2>Stake HNCH</h2>

      <div className="staking-info">
        <div className="info-card">
          <h3>Why Stake?</h3>
          <ul>
            <li>Earn 60% of all protocol fees</li>
            <li>Participate in DAO governance</li>
            <li>Vote on disputed outcomes</li>
            <li>Higher weight in quadratic voting</li>
          </ul>
        </div>

        <div className="staking-stats">
          <div className="stat">
            <span className="stat-label">Total Staked</span>
            <span className="stat-value">
              {stakingLoading ? '...' : formattedTotalStaked} HNCH
            </span>
          </div>
          <div className="stat highlight">
            <span className="stat-label">Your Stake</span>
            <span className="stat-value">
              {stakingLoading ? '...' : formattedUserStake} HNCH
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">APY</span>
            <span className="stat-value">
              {stakingLoading ? '...' : feeDistributorAvailable && apy > 0 ? `${apy.toFixed(2)}%` : '--'}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Your Pending Rewards</span>
            <span className="stat-value highlight-rewards">
              {stakingLoading ? '...' : feeDistributorAvailable ? formattedUserPendingRewards : '--'} HNCH
            </span>
          </div>
        </div>

        {/* Fee Distributor Warning */}
        {!feeDistributorAvailable && !stakingLoading && (
          <div className="fee-distributor-warning">
            <span className="warning-icon">⚠️</span>
            <div className="warning-content">
              <strong>Rewards System Upgrading</strong>
              <p>The rewards distribution system is being upgraded. Staking and unstaking work normally. Reward tracking will resume after the upgrade is complete.</p>
            </div>
          </div>
        )}

        {/* Claim Rewards Section - only show if Fee Distributor is available */}
        {hasStakeForClaim && feeDistributorAvailable && (
          <div className="claim-rewards-section">
            {/* Epoch Status */}
            <div className="epoch-status">
              <div className="epoch-info-row">
                <div className="epoch-badge">
                  <span className="epoch-label">Current Epoch</span>
                  <span className="epoch-number">#{currentEpoch}</span>
                </div>
                {epochCountdown > 0 && (
                  <div className="epoch-countdown">
                    <span className="countdown-label">Next epoch in:</span>
                    <span className="countdown-value">{formatCountdown(epochCountdown)}</span>
                  </div>
                )}
              </div>
              <div className="claim-status-row">
                {userLastClaimedEpoch >= 0 ? (
                  <span className="last-claimed">Last claimed: Epoch #{userLastClaimedEpoch}</span>
                ) : (
                  <span className="never-claimed">Never claimed rewards</span>
                )}
                {claimableEpochs > 0 ? (
                  <span className="claimable-epochs claimable">
                    {claimableEpochs} epoch{claimableEpochs > 1 ? 's' : ''} ready to claim
                  </span>
                ) : (
                  <span className="claimable-epochs not-claimable">
                    No epochs ready (current epoch still accumulating)
                  </span>
                )}
              </div>
            </div>

            <div className="claim-info">
              <div className="claim-amount">
                <span className="claim-label">
                  {claimableEpochs > 0 ? 'Ready to Claim:' : 'Accumulating This Epoch:'}
                </span>
                <span className="claim-value">{formattedUserPendingRewards} HNCH</span>
              </div>
              <p className="claim-description">
                {claimableEpochs > 0 ? (
                  <>Your share of completed epoch rewards. Claim now!</>
                ) : (
                  <>
                    Rewards accumulate during each 24h epoch.
                    Your share will be claimable when the current epoch ends.
                    {Number(pendingStakerRewards) > 0 && (
                      <span className="total-pool">
                        {' '}Total pool: {(Number(pendingStakerRewards) / 1e9).toLocaleString()} HNCH
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="claim-btn-row">
              <button
                className={`claim-btn ${claimableEpochs > 0 && hasPendingRewards ? 'has-rewards' : ''}`}
                onClick={handleClaimRewards}
                disabled={isClaiming || !hasPendingRewards || claimableEpochs === 0}
              >
                {isClaiming ? 'Claiming...' :
                  claimableEpochs > 0 && hasPendingRewards ? `Claim Rewards (${claimableEpochs} epoch${claimableEpochs > 1 ? 's' : ''})` :
                  'Waiting for Epoch to Complete'}
              </button>
              <ClaimInfoTooltip />
            </div>
            <a
              href={getExplorerLink(CONTRACTS.FEE_DISTRIBUTOR)}
              target="_blank"
              rel="noopener noreferrer"
              className="fee-distributor-link"
            >
              View Fee Distributor Contract
            </a>
          </div>
        )}
      </div>

      {/* Veto Power Section */}
      <div className="veto-power-section">
        <h3>DAO Veto Power</h3>
        <p className="veto-description">
          Stake holders with 2% or more of total supply (2M HNCH) can veto disputed market outcomes.
          Tokens must be staked for at least 24 hours before veto rights activate.
        </p>

        <div className="veto-status-card">
          <div className="veto-progress">
            <div className="progress-label">
              <span>Stake Progress</span>
              <span>{userStakeHnch.toLocaleString()} / {VETO_THRESHOLD_HNCH.toLocaleString()} HNCH</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${vetoPercentage}%` }}
              />
            </div>
            <div className="progress-percent">{vetoPercentage.toFixed(1)}% of veto threshold</div>
          </div>

          <div className="veto-requirements">
            <div className={`requirement ${hasEnoughForVeto ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">{hasEnoughForVeto ? '✓' : '○'}</span>
              <span>Stake 2M+ HNCH (2% of supply)</span>
            </div>
            <div className={`requirement ${unlockCountdown <= 0 && hasStake ? 'met' : 'unmet'}`}>
              <span className="requirement-icon">{unlockCountdown <= 0 && hasStake ? '✓' : '○'}</span>
              <span>Staked for 24+ hours</span>
              {unlockCountdown > 0 && (
                <span className="time-remaining">({formatCountdown(unlockCountdown)} remaining)</span>
              )}
            </div>
          </div>

          <div className={`veto-eligibility-badge ${isVetoEligible ? 'eligible' : 'not-eligible'}`}>
            {isVetoEligible ? (
              <>
                <span className="badge-icon">✓</span>
                <span>You can veto disputed market outcomes</span>
              </>
            ) : (
              <>
                <span className="badge-icon">○</span>
                <span>Meet both requirements to gain veto power</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="staking-form">
        <h3>Stake Tokens</h3>
        <form onSubmit={handleStake}>
          <div className="form-group">
            <label htmlFor="stake-amount">
              Amount (HNCH)
              <span className="balance-label">
                Available: {balanceLoading ? '...' : formattedBalance} HNCH
              </span>
            </label>
            <div className="input-with-max">
              <input
                id="stake-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              <button type="button" className="max-btn" onClick={() => setAmount(maxAmount)}>
                MAX
              </button>
            </div>
          </div>
          <button type="submit" disabled={isStaking} className="stake-btn">
            {isStaking ? 'Staking...' : 'Stake HNCH'}
          </button>
        </form>
      </div>

      <div className="unstake-section">
        <h3>Unstake</h3>
        <p>Unstaking has a 24-hour lock period to ensure network security.</p>

        {hasStake ? (
          <>
            {/* Lock countdown display */}
            {unlockCountdown > 0 ? (
              <div className="lock-countdown">
                <span className="lock-icon">🔒</span>
                <div className="countdown-info">
                  <span className="countdown-label">Time until unlock:</span>
                  <span className="countdown-timer">{formatCountdown(unlockCountdown)}</span>
                </div>
              </div>
            ) : canUnstake ? (
              <div className="unlock-ready">
                <span className="unlock-icon">🔓</span>
                <span>Your tokens are unlocked and ready to unstake!</span>
              </div>
            ) : null}

            <form onSubmit={handleUnstake}>
              <div className="form-group">
                <label htmlFor="unstake-amount">
                  Amount (HNCH)
                  <span className="balance-label">
                    Staked: {stakingLoading ? '...' : formattedUserStake} HNCH
                  </span>
                </label>
                <div className="input-with-max">
                  <input
                    id="unstake-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxUnstakeAmount}
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={!canUnstake && unlockCountdown > 0}
                  />
                  <button
                    type="button"
                    className="max-btn"
                    onClick={() => setUnstakeAmount(maxUnstakeAmount)}
                    disabled={!canUnstake && unlockCountdown > 0}
                  >
                    MAX
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isUnstaking || (!canUnstake && unlockCountdown > 0)}
                className={canUnstake || unlockCountdown === 0 ? "unstake-btn-active" : "unstake-btn-locked"}
              >
                {isUnstaking ? 'Requesting...' :
                  (!canUnstake && unlockCountdown > 0) ? 'Locked' : 'Request Unstake'}
              </button>
            </form>
          </>
        ) : (
          <p className="no-stake-message">You don't have any staked HNCH yet.</p>
        )}
      </div>
    </section>
  );
}
