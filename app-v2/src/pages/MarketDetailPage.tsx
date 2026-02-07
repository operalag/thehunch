import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress } from '@tonconnect/ui-react';
import { useContract } from '@/hooks/useContract';
import { useJettonBalance } from '@/hooks/useJettonBalance';
import { useMarketParticipants } from '@/hooks/useMarketParticipants';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/Skeleton';
import { formatCompact, formatDuration, formatBalance, truncateAddress, timeAgo } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import type { Market } from '@/hooks/useMarketsCache';

interface MarketDetailPageProps {
  market: Market;
  onBack: () => void;
}

export function MarketDetailPage({ market, onBack }: MarketDetailPageProps) {
  const address = useTonAddress();
  const { balance: hnchBalance } = useJettonBalance();
  const {
    proposeOutcome,
    challengeOutcome,
    settleMarket,
    claimReward,
    claimCreatorRebate,
    claimResolverReward,
    castVeto,
    counterVeto,
    finalizeVeto,
    MIN_BOND_HNCH,
  } = useContract();

  const { participants, winner, loading: participantsLoading } = useMarketParticipants(
    market.address,
    market.status === 'resolved' ? market.currentAnswer : undefined
  );

  const [bondAmount, setBondAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [countdown, setCountdown] = useState({ proposal: 0, challenge: 0, veto: 0 });

  const isConnected = !!address;
  const now = Math.floor(Date.now() / 1000);

  // Countdown timers
  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setCountdown({
        proposal: Math.max(0, market.proposalStartTime - now),
        challenge: market.challengeDeadline ? Math.max(0, market.challengeDeadline - now) : 0,
        veto: market.vetoEnd ? Math.max(0, market.vetoEnd - now) : 0,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [market.proposalStartTime, market.challengeDeadline, market.vetoEnd]);

  // Minimum bond for challenge = 2x current bond
  const minChallengeBond = useMemo(() => {
    if (market.currentBond) {
      return (market.currentBond / 1e9) * 2;
    }
    return MIN_BOND_HNCH;
  }, [market.currentBond, MIN_BOND_HNCH]);

  // Check if user is the market creator
  const isCreator = address && market.creator && market.rebateCreator === address;

  // Check if user is the resolver
  const isResolver = address && market.resolverAddress === address;

  const handlePropose = async (answer: boolean) => {
    if (isSubmitting) return;
    const amount = parseFloat(bondAmount);
    if (isNaN(amount) || amount < MIN_BOND_HNCH) {
      haptic.error();
      return;
    }
    try {
      setIsSubmitting(true);
      haptic.medium();
      await proposeOutcome(market.address, answer, amount);
      haptic.success();
      setBondAmount('');
    } catch (err) {
      console.error('Propose error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallenge = async (answer: boolean) => {
    if (isSubmitting) return;
    const amount = parseFloat(bondAmount);
    if (isNaN(amount) || amount < minChallengeBond) {
      haptic.error();
      return;
    }
    try {
      setIsSubmitting(true);
      haptic.medium();
      await challengeOutcome(market.address, answer, amount);
      haptic.success();
      setBondAmount('');
    } catch (err) {
      console.error('Challenge error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettle = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await settleMarket(market.address);
      haptic.success();
    } catch (err) {
      console.error('Settle error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimReward = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await claimReward(market.address);
      haptic.success();
    } catch (err) {
      console.error('Claim error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimCreatorRebate = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await claimCreatorRebate(market.address);
      haptic.success();
    } catch (err) {
      console.error('Claim rebate error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimResolverReward = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await claimResolverReward(market.address);
      haptic.success();
    } catch (err) {
      console.error('Claim resolver error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCastVeto = async () => {
    if (isSubmitting || !market.vetoGuardAddress) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      // Veto requires stake info - using 0n and 0 as placeholder
      // The contract will verify on-chain
      await castVeto(market.vetoGuardAddress, 0n, 0);
      haptic.success();
    } catch (err) {
      console.error('Veto error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounterVeto = async () => {
    if (isSubmitting || !market.vetoGuardAddress) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await counterVeto(market.vetoGuardAddress, 0n, 0);
      haptic.success();
    } catch (err) {
      console.error('Counter veto error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeVeto = async () => {
    if (isSubmitting || !market.vetoGuardAddress) return;
    try {
      setIsSubmitting(true);
      haptic.medium();
      await finalizeVeto(market.vetoGuardAddress);
      haptic.success();
    } catch (err) {
      console.error('Finalize veto error:', err);
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(16px)' }}>
        <button
          onClick={() => { haptic.light(); onBack(); }}
          className="p-2 -ml-2 hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-tg-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-tg-hint">Market #{market.id}</span>
        </div>
        <StatusBadge status={market.status} />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-tg-text leading-tight mb-3">
            {market.question}
          </h1>
          <div className="flex items-center gap-3 text-xs text-tg-hint">
            {market.category && (
              <span className="px-2 py-1 bg-white/5 rounded-md capitalize">
                {market.category.replace('_', ' ')}
              </span>
            )}
            <span>Created {timeAgo(market.createdAt)}</span>
          </div>
        </motion.div>

        {/* Status-specific info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {market.status === 'open' && (
            <OpenStatusCard
              market={market}
              countdown={countdown}
            />
          )}
          {(market.status === 'proposed' || market.status === 'challenged') && (
            <ProposedStatusCard
              market={market}
              countdown={countdown}
            />
          )}
          {market.status === 'voting' && (
            <VotingStatusCard
              market={market}
              countdown={countdown}
            />
          )}
          {market.status === 'resolved' && (
            <ResolvedStatusCard
              market={market}
              winner={winner}
            />
          )}
        </motion.div>

        {/* Action section */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Open market - propose */}
            {market.status === 'open' && market.canProposeNow && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-tg-text">Propose an Answer</h3>
                <p className="text-xs text-tg-hint">
                  Bond at least {MIN_BOND_HNCH.toLocaleString()} HNCH to propose your answer.
                  If unchallenged, you win the bond back + bonus.
                </p>
                <BondInput
                  value={bondAmount}
                  onChange={setBondAmount}
                  min={MIN_BOND_HNCH}
                  hnchBalance={hnchBalance}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePropose(true)}
                    disabled={isSubmitting || !bondAmount}
                    className="px-4 py-3 bg-success/20 hover:bg-success/30 active:bg-success/40 text-success font-semibold rounded-xl transition-colors border border-success/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'YES'}
                  </button>
                  <button
                    onClick={() => handlePropose(false)}
                    disabled={isSubmitting || !bondAmount}
                    className="px-4 py-3 bg-danger/20 hover:bg-danger/30 active:bg-danger/40 text-danger font-semibold rounded-xl transition-colors border border-danger/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'NO'}
                  </button>
                </div>
              </div>
            )}

            {/* Proposed/challenged - challenge */}
            {(market.status === 'proposed' || market.status === 'challenged') && countdown.challenge > 0 && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-tg-text">Challenge this Answer</h3>
                <p className="text-xs text-tg-hint">
                  Bond at least {formatCompact(minChallengeBond)} HNCH (2x current bond) to challenge with the opposite answer.
                </p>
                <BondInput
                  value={bondAmount}
                  onChange={setBondAmount}
                  min={minChallengeBond}
                  hnchBalance={hnchBalance}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChallenge(true)}
                    disabled={isSubmitting || !bondAmount}
                    className="px-4 py-3 bg-success/20 hover:bg-success/30 active:bg-success/40 text-success font-semibold rounded-xl transition-colors border border-success/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'YES'}
                  </button>
                  <button
                    onClick={() => handleChallenge(false)}
                    disabled={isSubmitting || !bondAmount}
                    className="px-4 py-3 bg-danger/20 hover:bg-danger/30 active:bg-danger/40 text-danger font-semibold rounded-xl transition-colors border border-danger/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'NO'}
                  </button>
                </div>
              </div>
            )}

            {/* Settle button - when challenge period expired */}
            {(market.status === 'proposed' || market.status === 'challenged') && countdown.challenge === 0 && market.challengeDeadline && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-tg-text">Settle Market</h3>
                <p className="text-xs text-tg-hint">
                  Challenge period has ended. Anyone can settle to finalize the outcome.
                </p>
                <button
                  onClick={handleSettle}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Settling...' : 'Settle Market'}
                </button>
              </div>
            )}

            {/* Veto voting */}
            {market.status === 'voting' && market.vetoGuardAddress && (
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-base font-semibold text-tg-text">DAO Dispute Resolution</h3>
                <p className="text-xs text-tg-hint">
                  Requires &gt;2% of total supply staked for 24+ hours to vote.
                </p>
                {countdown.veto > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleCastVeto}
                      disabled={isSubmitting}
                      className="px-4 py-3 bg-danger/20 hover:bg-danger/30 active:bg-danger/40 text-danger font-semibold rounded-xl transition-colors border border-danger/30 disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Veto'}
                    </button>
                    <button
                      onClick={handleCounterVeto}
                      disabled={isSubmitting}
                      className="px-4 py-3 bg-success/20 hover:bg-success/30 active:bg-success/40 text-success font-semibold rounded-xl transition-colors border border-success/30 disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Support'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFinalizeVeto}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Finalizing...' : 'Finalize Vote'}
                  </button>
                )}
              </div>
            )}

            {/* Resolved - claim actions */}
            {market.status === 'resolved' && (
              <div className="space-y-3">
                <button
                  onClick={handleClaimReward}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Claiming...' : 'Claim Bond Reward'}
                </button>

                {isCreator && !market.rebateClaimed && (
                  <button
                    onClick={handleClaimCreatorRebate}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-surface hover:bg-surface-hover active:bg-surface-active text-tg-text font-semibold rounded-xl transition-colors border border-white/10 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Claiming...' : `Claim Creator Rebate (${market.rebateAmount ? formatCompact(market.rebateAmount / 1e9) : '2,500'} HNCH)`}
                  </button>
                )}

                {isResolver && !market.resolverClaimed && (
                  <button
                    onClick={handleClaimResolverReward}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-surface hover:bg-surface-hover active:bg-surface-active text-tg-text font-semibold rounded-xl transition-colors border border-white/10 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Claiming...' : `Claim Resolver Reward (${market.resolverReward ? formatCompact(market.resolverReward / 1e9) : '500'} HNCH)`}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Rules & Resolution Source (expandable) */}
        {(market.rules || market.resolutionSource) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => { setShowRules(!showRules); haptic.selection(); }}
              className="w-full flex items-center justify-between p-4"
            >
              <span className="text-sm font-semibold text-tg-text">Rules & Resolution</span>
              <svg
                className={`w-4 h-4 text-tg-hint transition-transform ${showRules ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRules && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                {market.rules && (
                  <div>
                    <div className="text-xs text-tg-hint mb-1 font-medium">Rules</div>
                    <p className="text-sm text-tg-text whitespace-pre-line leading-relaxed">{market.rules}</p>
                  </div>
                )}
                {market.resolutionSource && (
                  <div>
                    <div className="text-xs text-tg-hint mb-1 font-medium">Resolution Source</div>
                    <p className="text-sm text-tg-text">{market.resolutionSource}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-tg-text">Timeline</h3>
          <div className="space-y-2">
            <TimelineItem
              label="Created"
              value={new Date(market.createdAt * 1000).toLocaleDateString()}
              done
            />
            <TimelineItem
              label="Resolution Deadline"
              value={new Date(market.resolutionDeadline * 1000).toLocaleDateString()}
              done={now >= market.resolutionDeadline}
            />
            <TimelineItem
              label="Proposals Open"
              value={new Date(market.proposalStartTime * 1000).toLocaleDateString()}
              done={now >= market.proposalStartTime}
            />
            {market.proposedAt && (
              <TimelineItem
                label="First Proposed"
                value={timeAgo(market.proposedAt)}
                done
              />
            )}
            {market.challengeDeadline && (
              <TimelineItem
                label="Challenge Deadline"
                value={countdown.challenge > 0 ? formatDuration(countdown.challenge) + ' left' : 'Expired'}
                done={countdown.challenge === 0}
              />
            )}
            {market.vetoEnd && (
              <TimelineItem
                label="Veto Voting Ends"
                value={countdown.veto > 0 ? formatDuration(countdown.veto) + ' left' : 'Ended'}
                done={countdown.veto === 0}
              />
            )}
          </div>
        </motion.div>

        {/* Participants / Bond History */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-tg-text">
            Participants {participants.length > 0 && `(${participants.length})`}
          </h3>
          {participantsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.answer ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {p.answer ? 'Y' : 'N'}
                    </div>
                    <div>
                      <div className="text-sm text-tg-text font-medium">
                        {truncateAddress(p.participantAddress)}
                      </div>
                      <div className="text-xs text-tg-hint capitalize">
                        {p.action} &middot; {timeAgo(p.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-tg-text font-medium">
                      {formatCompact(p.bondAmount)} HNCH
                    </div>
                    <div className="text-xs text-tg-hint">
                      Level {p.escalationLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-tg-hint py-2">No participants yet</p>
          )}
        </motion.div>

        {/* Contract address */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-2"
        >
          <p className="text-xs text-tg-hint">
            Contract: {truncateAddress(market.address, 6)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function BondInput({
  value,
  onChange,
  min,
  hnchBalance,
}: {
  value: string;
  onChange: (v: string) => void;
  min: number;
  hnchBalance: string;
}) {
  const maxBalance = Number(hnchBalance) / 1e9;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-tg-hint">
          Bond (min {formatCompact(min)} HNCH)
        </label>
        <button
          onClick={() => { onChange(maxBalance.toString()); haptic.light(); }}
          className="text-xs text-brand-400 font-medium"
        >
          Max: {formatBalance(hnchBalance)}
        </button>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={min.toLocaleString()}
          className="w-full px-4 py-3 bg-white/[0.03] rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tg-hint font-medium">
          HNCH
        </div>
      </div>
    </div>
  );
}

function OpenStatusCard({ market, countdown }: { market: Market; countdown: { proposal: number } }) {
  const now = Math.floor(Date.now() / 1000);
  const deadlinePassed = now >= market.resolutionDeadline;
  const canPropose = market.canProposeNow;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-tg-text">
            {canPropose ? 'Ready for Proposals' : 'Awaiting Resolution'}
          </div>
          <div className="text-xs text-tg-hint">
            {canPropose
              ? 'Anyone can propose YES or NO'
              : deadlinePassed
                ? `Proposals open in ${formatDuration(countdown.proposal)}`
                : `Resolution deadline in ${formatDuration(market.resolutionDeadline - now)}`
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function ProposedStatusCard({ market, countdown }: { market: Market; countdown: { challenge: number } }) {
  const isYes = market.proposedOutcome === true || market.currentAnswer === true;
  const bondDisplay = market.currentBond ? formatCompact(market.currentBond / 1e9) : '?';

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
          isYes ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {isYes ? 'YES' : 'NO'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-tg-text">
            {market.status === 'challenged' ? 'Challenged' : 'Proposed'}: {isYes ? 'YES' : 'NO'}
          </div>
          <div className="text-xs text-tg-hint">
            Current bond: {bondDisplay} HNCH
            {market.escalationCount ? ` (Escalation #${market.escalationCount})` : ''}
          </div>
        </div>
      </div>

      {/* Challenge countdown */}
      {countdown.challenge > 0 && (
        <div className="flex items-center justify-between p-3 bg-warning/5 rounded-xl border border-warning/10">
          <span className="text-xs text-warning font-medium">Challenge window</span>
          <span className="text-sm font-bold text-warning">{formatDuration(countdown.challenge)}</span>
        </div>
      )}
      {countdown.challenge === 0 && market.challengeDeadline && (
        <div className="flex items-center justify-between p-3 bg-success/5 rounded-xl border border-success/10">
          <span className="text-xs text-success font-medium">Challenge period ended</span>
          <span className="text-xs text-success">Ready to settle</span>
        </div>
      )}
    </div>
  );
}

function VotingStatusCard({ market, countdown }: { market: Market; countdown: { veto: number } }) {
  const vetoCount = market.vetoCount ?? 0;
  const supportCount = market.supportCount ?? 0;
  const total = vetoCount + supportCount;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-400/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-tg-text">DAO Veto Vote Active</div>
          <div className="text-xs text-tg-hint">
            {countdown.veto > 0
              ? `${formatDuration(countdown.veto)} remaining`
              : 'Voting period ended — ready to finalize'
            }
          </div>
        </div>
      </div>

      {/* Vote progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-danger font-medium">Veto: {vetoCount}</span>
          <span className="text-success font-medium">Support: {supportCount}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          {total > 0 ? (
            <>
              <div
                className="h-full bg-danger rounded-l-full transition-all"
                style={{ width: `${(vetoCount / total) * 100}%` }}
              />
              <div
                className="h-full bg-success rounded-r-full transition-all"
                style={{ width: `${(supportCount / total) * 100}%` }}
              />
            </>
          ) : (
            <div className="h-full w-full bg-white/5" />
          )}
        </div>
      </div>
    </div>
  );
}

function ResolvedStatusCard({ market, winner }: { market: Market; winner: any }) {
  const isYes = market.currentAnswer === true;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${
          isYes ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {isYes ? 'YES' : 'NO'}
        </div>
        <div>
          <div className="text-base font-bold text-tg-text">
            Resolved: {isYes ? 'YES' : 'NO'}
          </div>
          <div className="text-xs text-tg-hint">Market has been settled</div>
        </div>
      </div>

      {winner && (
        <div className="p-3 bg-brand-400/5 rounded-xl border border-brand-400/10">
          <div className="text-xs text-tg-hint mb-1">Winner</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-tg-text font-medium">
              {truncateAddress(winner.participant.participantAddress)}
            </span>
            <span className="text-sm text-brand-400 font-bold">
              +{formatCompact(winner.winnings)} HNCH
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-brand-400' : 'bg-white/20'}`} />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs text-tg-hint">{label}</span>
        <span className={`text-xs font-medium ${done ? 'text-tg-text' : 'text-tg-hint'}`}>{value}</span>
      </div>
    </div>
  );
}
