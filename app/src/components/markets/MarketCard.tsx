import type { Market } from '../../hooks/useMarketsCache';
import type { CountdownEntry } from './constants';
import {
  VETO_THRESHOLD_HNCH,
  VETO_LOCK_PERIOD,
  BOND_SCHEDULE,
  WINNER_BONUS,
  getStatusBadge,
  calculateChallengeRiskReward,
  formatTimestampInTimezone,
  formatTimeSince,
} from './constants';
import { BondHistorySection } from './BondHistorySection';
import { BondClaimSection } from './BondClaimSection';
import { getExplorerLink } from '../../config/contracts';

interface StakingInfo {
  userStake?: bigint | string | null;
  lockTime: number;
  formattedUserStake: string;
}

interface MarketCardProps {
  market: Market;
  wallet: unknown;
  userAddress: string | undefined;
  countdown: CountdownEntry | undefined;
  stakingInfo: StakingInfo;

  // Propose form state
  proposeMarketId: number | null;
  setProposeMarketId: (id: number | null) => void;
  proposeAnswer: boolean;
  setProposeAnswer: (answer: boolean) => void;
  proposeBond: string;
  setProposeBond: (bond: string) => void;
  isProposing: boolean;

  // Challenge form state
  challengeMarketId: number | null;
  setChallengeMarketId: (id: number | null) => void;
  challengeBond: string;
  setChallengeBond: (bond: string) => void;
  isChallenging: boolean;

  // Veto/finalize loading states
  isVetoing: boolean;
  isCounterVetoing: boolean;
  isFinalizing: boolean;

  // Settle/claim loading states
  isSettling: string | null;
  isClaimingRebate: string | null;
  isClaimingResolver: string | null;
  isClaimingBonds: string | null;

  // Bond history expansion
  expandedHistory: Set<number>;
  toggleHistoryExpansion: (marketId: number) => void;

  // Action handlers
  handlePropose: (market: Market) => void;
  handleChallenge: (market: Market) => void;
  handleCastVeto: (market: Market) => void;
  handleCounterVeto: (market: Market) => void;
  handleFinalizeVeto: (market: Market) => void;
  handleClaimRebate: (market: Market) => void;
  handleClaimResolverReward: (market: Market) => void;
  handleClaimBonds: (market: Market) => void;
  onOpenSettleModal: (market: Market) => void;

  // Claim / vote helpers
  canClaimRebate: (market: Market) => boolean;
  canClaimResolverReward: (market: Market) => boolean;
  canUserVeto: () => boolean;
  getUserVote: (marketAddress: string) => 'veto' | 'support' | null;

  MIN_BOND_HNCH: number;
  formattedBalance: string;
}

export function MarketCard({
  market,
  wallet,
  userAddress,
  countdown,
  stakingInfo,
  proposeMarketId,
  setProposeMarketId,
  proposeAnswer,
  setProposeAnswer,
  proposeBond,
  setProposeBond,
  isProposing,
  challengeMarketId,
  setChallengeMarketId,
  challengeBond,
  setChallengeBond,
  isChallenging,
  isVetoing,
  isCounterVetoing,
  isFinalizing,
  isSettling,
  isClaimingRebate,
  isClaimingResolver,
  isClaimingBonds,
  expandedHistory,
  toggleHistoryExpansion,
  handlePropose,
  handleChallenge,
  handleCastVeto,
  handleCounterVeto,
  handleFinalizeVeto,
  handleClaimRebate,
  handleClaimResolverReward,
  handleClaimBonds,
  onOpenSettleModal,
  canClaimRebate,
  canClaimResolverReward,
  canUserVeto,
  getUserVote,
  MIN_BOND_HNCH,
}: MarketCardProps) {
  const badge = getStatusBadge(market.status);
  const isProposingThis = proposeMarketId === market.id;
  const isChallengingThis = challengeMarketId === market.id;
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="market-card">
      <div className="market-header">
        <span className={`status-badge ${badge.class}`}>
          {badge.text}
        </span>
        <span className="market-id">#{market.id}</span>
      </div>

      <h4 className="market-question">{market.question}</h4>

      {/* Market Lifecycle Progress Bar */}
      <div className="market-lifecycle-progress">
        <div className={`lifecycle-step ${market.status === 'open' || market.status === 'proposed' || market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved' ? 'completed' : 'future'} ${market.status === 'open' ? 'current' : ''}`}>
          <div className="step-icon">{market.status === 'open' ? '⏳' : '✓'}</div>
          <div className="step-label">Open</div>
        </div>
        <div className="lifecycle-connector"></div>
        <div className={`lifecycle-step ${market.status === 'proposed' || market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved' ? 'completed' : 'future'} ${market.status === 'proposed' ? 'current' : ''}`}>
          <div className="step-icon">{market.status === 'proposed' || (market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved') ? '✓' : '💡'}</div>
          <div className="step-label">Proposed</div>
        </div>
        <div className="lifecycle-connector"></div>
        <div className={`lifecycle-step ${market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved' ? 'completed' : 'future'} ${market.status === 'challenged' ? 'current' : ''}`}>
          <div className="step-icon">{market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved' ? '✓' : '⚔️'}</div>
          <div className="step-label">Challenged</div>
        </div>
        <div className="lifecycle-connector"></div>
        <div className={`lifecycle-step ${market.status === 'voting' || market.status === 'resolved' ? 'completed' : 'future'} ${market.status === 'voting' ? 'current' : ''}`}>
          <div className="step-icon">{market.status === 'voting' || market.status === 'resolved' ? (market.status === 'resolved' ? '✓' : '🗳️') : '🗳️'}</div>
          <div className="step-label">Voting</div>
        </div>
        <div className="lifecycle-connector"></div>
        <div className={`lifecycle-step ${market.status === 'resolved' ? 'completed current' : 'future'}`}>
          <div className="step-icon">✅</div>
          <div className="step-label">Resolved</div>
        </div>
      </div>

      {market.rules && (
        <div className="market-rules">
          <span className="rules-label">Rules:</span>
          <p className="rules-text">{market.rules}</p>
        </div>
      )}

      {market.resolutionSource && (
        <div className="market-source">
          <span className="source-label">Resolution Source:</span>
          <span className="source-text">{market.resolutionSource}</span>
        </div>
      )}

      {/* DAO Trigger Warning for 2nd Challenge */}
      {(market.status === 'proposed' || market.status === 'challenged') &&
       (market.escalationCount || 0) === 2 && (
        <div className="dao-trigger-warning">
          <div className="warning-header">
            <span className="warning-icon-large">⚠️</span>
            <h5>One More Challenge Will Trigger DAO Vote!</h5>
          </div>
          <p className="warning-description">
            After the next challenge, this market will enter a 48-hour DAO voting period.
          </p>
          <div className="dao-requirements">
            <div className="requirement-item">
              <span className="req-icon">🔒</span>
              <span className="req-text">Requires 2,000,000+ HNCH staked</span>
            </div>
            <div className="requirement-item">
              <span className="req-icon">⏱️</span>
              <span className="req-text">Staked for 24+ hours to participate</span>
            </div>
            <div className="requirement-item">
              <span className="req-icon">⚖️</span>
              <span className="req-text">Community votes to resolve dispute</span>
            </div>
          </div>
        </div>
      )}

      {/* Bond Escalation Schedule Visualization */}
      {(market.status === 'proposed' || market.status === 'challenged') && (
        <div className="bond-escalation-schedule">
          <h5 className="escalation-title">Bond Escalation Path</h5>
          <div className="escalation-steps">
            {BOND_SCHEDULE.map((bondAmount, index) => {
              const isCurrentLevel = (market.escalationCount || 0) === index;
              const isPastLevel = (market.escalationCount || 0) > index;
              const isNextLevel = (market.escalationCount || 0) === index - 1;

              return (
                <div
                  key={index}
                  className={`escalation-step-card ${
                    isCurrentLevel ? 'current' : isPastLevel ? 'past' : 'future'
                  }`}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-amount">{bondAmount.toLocaleString()} HNCH</div>
                  {isCurrentLevel && (
                    <div className="you-are-here">You Are Here</div>
                  )}
                  {isNextLevel && (
                    <div className="next-required">Next Required</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="escalation-info">
            <span className="escalation-label">Current Escalation Level:</span>
            <span className="escalation-value">{(market.escalationCount || 0) + 1} of 4</span>
          </div>
        </div>
      )}

      <div className="market-details">
        {/* Countdown box for open markets waiting for proposals */}
        {market.status === 'open' && !market.canProposeNow && countdown?.proposalCountdown && (
          <div className={`countdown-box countdown-${countdown?.urgency || 'safe'}`}>
            <div className="countdown-header">
              <span className="countdown-icon">⏳</span>
              <span className="countdown-title detail-with-tooltip">
                Proposals Open In
                <span className="tooltip-text">There is a 5-minute delay after the resolution deadline before proposals are allowed. This prevents front-running.</span>
              </span>
            </div>
            <div className="countdown-timer">
              <span className="countdown-value">{countdown?.proposalCountdown}</span>
            </div>
            <div className="countdown-progress-bar">
              <div
                className={`countdown-progress-fill progress-${countdown?.urgency || 'safe'}`}
                style={{ width: `${countdown?.proposalProgress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Open and ready for proposals */}
        {market.status === 'open' && market.canProposeNow && (
          <div className="countdown-box countdown-safe">
            <div className="countdown-header">
              <span className="countdown-icon">✅</span>
              <span className="countdown-title">Proposals Open</span>
            </div>
            <div className="countdown-timer">
              <span className="countdown-value countdown-ready">Ready for proposals!</span>
              {countdown?.timeSince && (
                <span className="countdown-since">Opened {countdown?.timeSince}</span>
              )}
            </div>
          </div>
        )}

        {market.resolutionDeadline && market.resolutionDeadline > 0 && (
          <div className="detail">
            <span className="label detail-with-tooltip">
              Resolution Deadline
              <span className="tooltip-text">The event must resolve by this time. After this deadline passes, there is a 5-minute delay before proposals can be submitted.</span>
            </span>
            <span className="value" title={`UTC: ${new Date(market.resolutionDeadline * 1000).toUTCString()}`}>
              {formatTimestampInTimezone(market.resolutionDeadline, localTz)}
            </span>
          </div>
        )}
        {market.address && (
          <div className="detail">
            <span className="label">Contract</span>
            <a
              href={getExplorerLink(market.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="value contract-link"
            >
              {market.address.slice(0, 8)}...{market.address.slice(-6)}
            </a>
          </div>
        )}

        {(market.status === 'proposed' || market.status === 'challenged') && (
          <>
            {/* Challenge Period Countdown */}
            {countdown?.challengeCountdown && (
              <div className={`countdown-box countdown-${countdown?.urgency || 'safe'}`}>
                <div className="countdown-header">
                  <span className="countdown-icon">⏱️</span>
                  <span className="countdown-title detail-with-tooltip">
                    Challenge Period
                    <span className="tooltip-text">4 hours to challenge the current proposal. If no one challenges within this time, the market can be settled with the proposed outcome.</span>
                  </span>
                </div>
                <div className="countdown-timer">
                  {countdown?.challengeCountdown === 'Challenge period ended' ? (
                    <span className="countdown-value countdown-ended">Challenge period ended</span>
                  ) : (
                    <>
                      <span className="countdown-value">{countdown?.challengeCountdown}</span>
                      <span className="countdown-label">to challenge this outcome</span>
                    </>
                  )}
                </div>
                {countdown?.challengeProgress !== undefined && (
                  <div className="countdown-progress-bar">
                    <div
                      className={`countdown-progress-fill progress-${countdown?.urgency || 'safe'}`}
                      style={{ width: `${countdown?.challengeProgress}%` }}
                    />
                  </div>
                )}
                {countdown?.timeSince && (
                  <div className="countdown-since">Proposed {countdown?.timeSince}</div>
                )}
              </div>
            )}
            <div className="detail">
              <span className="label">{market.status === 'challenged' ? 'Challenged To' : 'Proposed'}</span>
              <span className={`value outcome-${market.proposedOutcome ? 'yes' : 'no'}`}>
                {market.proposedOutcome ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="detail">
              <span className="label">Current Bond</span>
              <span className="value">{market.currentBond?.toLocaleString()} HNCH</span>
            </div>
            {market.escalationCount !== undefined && (
              <div className="detail">
                <span className="label">Escalations</span>
                <span className="value">{market.escalationCount}/3</span>
              </div>
            )}
          </>
        )}

        {market.status === 'voting' && (
          <>
            {/* Prominent Veto Countdown Timer */}
            <div className={`countdown-box countdown-${countdown?.urgency || 'safe'}`}>
              <div className="countdown-header">
                <span className="countdown-icon">⚖️</span>
                <span className="countdown-title detail-with-tooltip">
                  DAO Veto Period
                  <span className="tooltip-text">48-hour DAO voting period. Token holders with 2M+ HNCH staked for 24+ hours can vote to veto or support the proposed outcome.</span>
                </span>
              </div>
              <div className="countdown-timer">
                {countdown?.vetoCountdown === 'Voting ended' ? (
                  <span className="countdown-value countdown-ended">Voting Ended - Ready to Finalize</span>
                ) : (
                  <>
                    <span className="countdown-value">{countdown?.vetoCountdown || 'Loading...'}</span>
                    <span className="countdown-label">remaining to veto</span>
                  </>
                )}
              </div>
              {countdown?.vetoProgress !== undefined && (
                <div className="countdown-progress-bar">
                  <div
                    className={`countdown-progress-fill progress-${countdown?.urgency || 'safe'}`}
                    style={{ width: `${countdown?.vetoProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Voting Eligibility Display */}
            <div className="voting-eligibility-card">
              <h5 className="eligibility-title">Voting Eligibility</h5>
              <div className="eligibility-requirements">
                <div className={`requirement-row ${(Number(stakingInfo.userStake || 0) / 1e9) >= VETO_THRESHOLD_HNCH ? 'met' : 'unmet'}`}>
                  <span className="req-check">
                    {(Number(stakingInfo.userStake || 0) / 1e9) >= VETO_THRESHOLD_HNCH ? '✅' : '❌'}
                  </span>
                  <div className="req-content">
                    <span className="req-label">Stake Amount</span>
                    <span className="req-value">
                      {stakingInfo.formattedUserStake} / {VETO_THRESHOLD_HNCH.toLocaleString()} HNCH
                    </span>
                  </div>
                </div>
                <div className={`requirement-row ${stakingInfo.lockTime > 0 && Math.floor(Date.now() / 1000) >= stakingInfo.lockTime + VETO_LOCK_PERIOD ? 'met' : 'unmet'}`}>
                  <span className="req-check">
                    {stakingInfo.lockTime > 0 && Math.floor(Date.now() / 1000) >= stakingInfo.lockTime + VETO_LOCK_PERIOD ? '✅' : '❌'}
                  </span>
                  <div className="req-content">
                    <span className="req-label">Lock Duration</span>
                    <span className="req-value">
                      {stakingInfo.lockTime > 0
                        ? Math.floor(Date.now() / 1000) >= stakingInfo.lockTime + VETO_LOCK_PERIOD
                          ? '24+ hours ✓'
                          : `${Math.floor((stakingInfo.lockTime + VETO_LOCK_PERIOD - Math.floor(Date.now() / 1000)) / 3600)}h remaining`
                        : 'Not staked'}
                    </span>
                  </div>
                </div>
              </div>
              {!canUserVeto() && (
                <a href="#stake" className="go-to-staking-link">
                  Go to Staking →
                </a>
              )}
            </div>

            <div className="detail">
              <span className="label">Current Answer</span>
              <span className={`value outcome-${market.currentAnswer ? 'yes' : 'no'}`}>
                {market.currentAnswer ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="veto-votes-display">
              <div className="vote-column veto-column">
                <span className="vote-count">{market.vetoCount || 0}</span>
                <span className="vote-label">Vetoes</span>
              </div>
              <div className="vote-vs">vs</div>
              <div className="vote-column support-column">
                <span className="vote-count">{market.supportCount || 0}</span>
                <span className="vote-label">Support</span>
              </div>
            </div>

            {/* Vote Impact Prediction */}
            <div className="vote-impact-prediction">
              <div className="impact-header">
                <span className="impact-icon">📊</span>
                <span className="impact-title">Vote Impact</span>
              </div>
              <div className="impact-current">
                <span className="impact-label">Current Tally:</span>
                <span className="impact-value">
                  {market.vetoCount || 0} vetoes vs {market.supportCount || 0} supports
                </span>
              </div>
              <div className="impact-prediction">
                <span className="impact-label">Net Effect:</span>
                <span className={`impact-result ${((market.vetoCount || 0) - (market.supportCount || 0)) > 0 ? 'flip' : 'stand'}`}>
                  {((market.vetoCount || 0) - (market.supportCount || 0)) > 0
                    ? `Answer will flip to ${market.currentAnswer ? 'NO' : 'YES'}`
                    : 'Current answer stands'}
                </span>
              </div>
              {canUserVeto() && (
                <div className="impact-if-you-vote">
                  <div className="if-veto">
                    <span className="if-label">If you veto:</span>
                    <span className={`if-result ${((market.vetoCount || 0) + 1 - (market.supportCount || 0)) > 0 ? 'flip' : 'stand'}`}>
                      {((market.vetoCount || 0) + 1 - (market.supportCount || 0)) > 0
                        ? `Answer will flip to ${market.currentAnswer ? 'NO' : 'YES'}`
                        : 'Current answer stands'}
                    </span>
                  </div>
                  <div className="if-support">
                    <span className="if-label">If you support:</span>
                    <span className={`if-result ${((market.vetoCount || 0) - ((market.supportCount || 0) + 1)) > 0 ? 'flip' : 'stand'}`}>
                      {((market.vetoCount || 0) - ((market.supportCount || 0) + 1)) > 0
                        ? `Answer will flip to ${market.currentAnswer ? 'NO' : 'YES'}`
                        : 'Current answer stands'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {market.status === 'resolved' && (
          <>
            <div className="resolved-outcome">
              <div className="detail">
                <span className="label">Final Outcome</span>
                <span className={`value outcome-${market.currentAnswer ? 'yes' : 'no'} outcome-final`}>
                  {market.currentAnswer ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
            {/* Creator Rebate Info */}
            {market.rebateAmount !== undefined && market.rebateAmount > 0 && (
              <div className="rebate-info">
                <div className="detail">
                  <span className="label">Creator Rebate (25%)</span>
                  <span className={`value ${market.rebateClaimed ? 'rebate-claimed' : 'rebate-available'}`}>
                    {market.rebateAmount.toLocaleString()} HNCH
                    {market.rebateClaimed ? ' (Claimed)' : ' (Available)'}
                  </span>
                </div>
              </div>
            )}
            {/* Resolver Reward Info */}
            {market.resolverReward !== undefined && market.resolverReward > 0 && (
              <div className="rebate-info resolver-info">
                <div className="detail">
                  <span className="label">Resolver Reward (5%)</span>
                  <span className={`value ${market.resolverClaimed ? 'rebate-claimed' : 'rebate-available'}`}>
                    {market.resolverReward.toLocaleString()} HNCH
                    {market.resolverClaimed ? ' (Claimed)' : ' (Available)'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bond History Timeline */}
      {(market.status === 'proposed' || market.status === 'challenged' || market.status === 'voting' || market.status === 'resolved') && (
        <BondHistorySection
          market={market}
          isExpanded={expandedHistory.has(market.id)}
          onToggle={() => toggleHistoryExpansion(market.id)}
          formatTimeSince={formatTimeSince}
        />
      )}

      {/* Actions based on status */}
      {wallet && (
        <div className="market-actions">
          {market.status === 'open' && !isProposingThis && (
            <button
              className="btn-propose"
              onClick={() => {
                setProposeMarketId(market.id);
                setProposeBond(MIN_BOND_HNCH.toString());
              }}
              disabled={!market.canProposeNow}
              title={!market.canProposeNow ? `Proposals open at ${formatTimestampInTimezone((market.proposalStartTime || 0), localTz)}` : ''}
            >
              {market.canProposeNow ? 'Propose Outcome' : 'Proposals Not Open Yet'}
            </button>
          )}

          {(market.status === 'proposed' || market.status === 'challenged') &&
           !isChallengingThis &&
           (market.escalationCount || 0) < 3 &&
           market.challengeDeadline &&
           Math.floor(Date.now() / 1000) < market.challengeDeadline && (
            <button
              className="btn-challenge"
              onClick={() => {
                setChallengeMarketId(market.id);
                setChallengeBond(((market.currentBond || MIN_BOND_HNCH) * 2).toString());
              }}
            >
              Challenge ({((market.currentBond || MIN_BOND_HNCH) * 2).toLocaleString()} HNCH)
            </button>
          )}

          {/* Settle button when challenge period has ended */}
          {(market.status === 'proposed' || market.status === 'challenged') &&
           market.challengeDeadline &&
           Math.floor(Date.now() / 1000) >= market.challengeDeadline && (
            <button
              className="btn-settle btn-settle-badge"
              onClick={() => onOpenSettleModal(market)}
              disabled={isSettling === market.address}
            >
              {isSettling === market.address ? 'Settling...' : (
                <>
                  Settle Market
                  <span className="settle-reward-chip">Earn 500 HNCH</span>
                </>
              )}
            </button>
          )}

          {/* Veto Actions for voting markets */}
          {market.status === 'voting' && (
            <div className="veto-actions">
              {market.vetoEnd && Math.floor(Date.now() / 1000) < market.vetoEnd ? (
                <>
                  {/* Already Voted Indicator */}
                  {market.address && getUserVote(market.address) ? (
                    <div className="already-voted-badge">
                      <span className="voted-icon">✓</span>
                      <span className="voted-text">
                        You voted: <strong>{getUserVote(market.address) === 'veto' ? 'VETO' : 'SUPPORT'}</strong>
                      </span>
                      <span className="voted-hint">You cannot vote again in this market</span>
                    </div>
                  ) : (
                    <>
                      <div className="veto-eligibility">
                        {canUserVeto() ? (
                          <span className="eligible">You are eligible to veto/counter-veto</span>
                        ) : (
                          <span className="not-eligible">
                            Requires {VETO_THRESHOLD_HNCH.toLocaleString()} HNCH staked for 24h+
                          </span>
                        )}
                      </div>
                      <div className="veto-buttons">
                        <button
                          className="btn-veto"
                          onClick={() => handleCastVeto(market)}
                          disabled={isVetoing || !canUserVeto() || (market.address ? !!getUserVote(market.address) : false)}
                          title={`Veto: flip answer to ${market.currentAnswer ? 'NO' : 'YES'}`}
                        >
                          {isVetoing ? 'Vetoing...' : `Veto (flip to ${market.currentAnswer ? 'NO' : 'YES'})`}
                        </button>
                        <button
                          className="btn-counter-veto"
                          onClick={() => handleCounterVeto(market)}
                          disabled={isCounterVetoing || !canUserVeto() || (market.address ? !!getUserVote(market.address) : false)}
                          title={`Support: keep answer as ${market.currentAnswer ? 'YES' : 'NO'}`}
                        >
                          {isCounterVetoing ? 'Counter-vetoing...' : `Support (keep ${market.currentAnswer ? 'YES' : 'NO'})`}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button
                  className="btn-finalize"
                  onClick={() => handleFinalizeVeto(market)}
                  disabled={isFinalizing}
                >
                  {isFinalizing ? 'Finalizing...' : 'Finalize Vote'}
                </button>
              )}
            </div>
          )}

          {/* Creator Rebate Claim for Resolved Markets */}
          {market.status === 'resolved' && canClaimRebate(market) && (
            <div className="rebate-claim-action">
              <button
                className="btn-claim-rebate"
                onClick={() => handleClaimRebate(market)}
                disabled={isClaimingRebate === market.address}
              >
                {isClaimingRebate === market.address
                  ? 'Claiming...'
                  : `Claim ${(market.rebateAmount || 0).toLocaleString()} HNCH Rebate`}
              </button>
              <span className="rebate-hint">
                25% of your market creation fee
              </span>
            </div>
          )}

          {/* Resolver Reward Claim for Resolved Markets */}
          {market.status === 'resolved' && canClaimResolverReward(market) && (
            <div className="rebate-claim-action resolver-claim-action">
              <button
                className="btn-claim-rebate btn-claim-resolver"
                onClick={() => handleClaimResolverReward(market)}
                disabled={isClaimingResolver === market.address}
              >
                {isClaimingResolver === market.address
                  ? 'Claiming...'
                  : `Claim ${(market.resolverReward || 0).toLocaleString()} HNCH Resolver Reward`}
              </button>
              <span className="rebate-hint">
                5% reward for resolving this market
              </span>
            </div>
          )}

          {/* Bond Claim for Winners */}
          {market.status === 'resolved' && market.currentAnswer !== undefined && (
            <BondClaimSection
              market={market}
              userAddress={userAddress}
              isClaimingBonds={isClaimingBonds}
              onClaimBonds={handleClaimBonds}
            />
          )}

          {/* Propose Form */}
          {isProposingThis && (
            <div className="action-form">
              <h5>Propose Outcome</h5>
              <div className="outcome-selector">
                <button
                  type="button"
                  className={`outcome-btn ${proposeAnswer ? 'selected' : ''}`}
                  onClick={() => setProposeAnswer(true)}
                >
                  YES
                </button>
                <button
                  type="button"
                  className={`outcome-btn ${!proposeAnswer ? 'selected' : ''}`}
                  onClick={() => setProposeAnswer(false)}
                >
                  NO
                </button>
              </div>
              <div className="form-group">
                <label>Bond Amount (HNCH)</label>
                <input
                  type="number"
                  min={MIN_BOND_HNCH}
                  value={proposeBond}
                  onChange={(e) => setProposeBond(e.target.value)}
                />
                <span className="hint">Min: {MIN_BOND_HNCH.toLocaleString()} HNCH</span>
              </div>
              <div className="action-buttons">
                <button
                  className="btn-confirm"
                  onClick={() => handlePropose(market)}
                  disabled={isProposing}
                >
                  {isProposing ? 'Submitting...' : 'Submit Proposal'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setProposeMarketId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Risk/Reward Calculator */}
          {(market.status === 'proposed' || market.status === 'challenged') &&
           !isChallengingThis &&
           (market.escalationCount || 0) < 3 &&
           market.challengeDeadline &&
           Math.floor(Date.now() / 1000) < market.challengeDeadline && (() => {
            const riskReward = calculateChallengeRiskReward(market.currentBond || 10000);
            return (
              <div className="risk-reward-calculator">
                <div className="calculator-header">
                  <span className="calculator-icon">📊</span>
                  <h5>Challenge Risk & Reward</h5>
                </div>
                <div className="calculator-content">
                  <div className="reward-section">
                    <div className="reward-label">If You Win:</div>
                    <div className="reward-amount win">+{riskReward.potentialWin.toLocaleString()} HNCH</div>
                    <div className="reward-breakdown">
                      (Your bond + opponent's bond + {WINNER_BONUS.toLocaleString()} bonus)
                    </div>
                  </div>
                  <div className="risk-section">
                    <div className="risk-label">If You Lose:</div>
                    <div className="risk-amount lose">-{riskReward.potentialLoss.toLocaleString()} HNCH</div>
                    <div className="risk-breakdown">
                      (Your bond forfeited)
                    </div>
                  </div>
                  <div className="roi-section">
                    <div className="roi-label">Potential ROI:</div>
                    <div className={`roi-value ${riskReward.roi > 0 ? 'positive' : 'negative'}`}>
                      {riskReward.roi > 0 ? '+' : ''}{riskReward.roi}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Challenge Form */}
          {isChallengingThis && (
            <div className="action-form">
              <h5>Challenge Proposal</h5>
              <p className="challenge-info">
                You are challenging "{market.proposedOutcome ? 'YES' : 'NO'}" with "{market.proposedOutcome ? 'NO' : 'YES'}"
              </p>
              <div className="form-group">
                <label>Bond Amount (HNCH)</label>
                <input
                  type="number"
                  min={(market.currentBond || MIN_BOND_HNCH) * 2}
                  value={challengeBond}
                  onChange={(e) => setChallengeBond(e.target.value)}
                />
                <span className="hint">
                  Min: {((market.currentBond || MIN_BOND_HNCH) * 2).toLocaleString()} HNCH (2x current)
                </span>
              </div>
              <div className="action-buttons">
                <button
                  className="btn-confirm btn-challenge"
                  onClick={() => handleChallenge(market)}
                  disabled={isChallenging}
                >
                  {isChallenging ? 'Submitting...' : 'Submit Challenge'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setChallengeMarketId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
