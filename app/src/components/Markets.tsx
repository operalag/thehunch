import { useState, useEffect, useMemo } from 'react';
import { useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useContract } from '../hooks/useContract';
import { useJettonBalance } from '../hooks/useJettonBalance';
import { useMarkets, type Market } from '../hooks/useMarketsCache';
import { useStakingInfo } from '../hooks/useStakingInfo';
import { useMasterOracleBalance } from '../hooks/useMasterOracleBalance';

import {
  type StatusFilter,
  type CategoryFilter,
  type SortOption,
  type CountdownEntry,
  VETO_THRESHOLD_HNCH,
  VETO_LOCK_PERIOD,
  INITIAL_CHALLENGE_PERIOD_SECONDS,
  VETO_PERIOD_SECONDS,
  formatDuration,
  formatTimeSince,
  getUrgency,
} from './markets/constants';
import { CreateMarketForm } from './markets/CreateMarketForm';
import { MarketFilters } from './markets/MarketFilters';
import { MarketCard } from './markets/MarketCard';
import { SettlementModal } from './markets/SettlementModal';
import { DaoConfirmModal } from './markets/DaoConfirmModal';
import { HowItWorks } from './markets/HowItWorks';

export function Markets() {
  const wallet = useTonWallet();
  const userAddress = useTonAddress();
  const {
    createMarket,
    proposeOutcome,
    challengeOutcome,
    settleMarket,
    castVeto,
    counterVeto,
    finalizeVeto,
    claimCreatorRebate,
    claimResolverReward,
    claimReward,
    MIN_BOND_HNCH,
    MARKET_CREATION_FEE_HNCH,
  } = useContract();
  const { formattedBalance, balance } = useJettonBalance();
  const {
    markets: fetchedMarkets,
    loading: marketsLoading,
    refetch: refetchMarkets,
    syncMarkets,
    updateMarketStatus,
    loadingProgress,
  } = useMarkets();
  const stakingInfo = useStakingInfo();
  const masterOracleBalance = useMasterOracleBalance();

  // Sync markets state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Propose state
  const [proposeMarketId, setProposeMarketId] = useState<number | null>(null);
  const [proposeAnswer, setProposeAnswer] = useState<boolean>(true);
  const [proposeBond, setProposeBond] = useState(MIN_BOND_HNCH.toString());
  const [isProposing, setIsProposing] = useState(false);

  // Challenge state
  const [challengeMarketId, setChallengeMarketId] = useState<number | null>(null);
  const [challengeBond, setChallengeBond] = useState('');
  const [isChallenging, setIsChallenging] = useState(false);

  // Veto state
  const [isVetoing, setIsVetoing] = useState(false);
  const [isCounterVetoing, setIsCounterVetoing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // DAO Challenge Confirmation Modal state
  const [showDaoConfirmModal, setShowDaoConfirmModal] = useState(false);
  const [daoConfirmMarket, setDaoConfirmMarket] = useState<Market | null>(null);

  // Settle state
  const [isSettling, setIsSettling] = useState<string | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementMarket, setSettlementMarket] = useState<Market | null>(null);

  // Rebate claim state
  const [isClaimingRebate, setIsClaimingRebate] = useState<string | null>(null);
  const [isClaimingResolver, setIsClaimingResolver] = useState<string | null>(null);
  const [isClaimingBonds, setIsClaimingBonds] = useState<string | null>(null);

  // Bond history expansion state
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());

  // Countdown state
  const [countdowns, setCountdowns] = useState<Record<string, CountdownEntry>>({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const hnchBalance = Number(balance) / 1e9;

  // Status priority for sorting (lower = more urgent)
  const statusPriority: Record<string, number> = {
    'voting': 1,
    'challenged': 2,
    'proposed': 3,
    'open': 4,
    'resolved': 5,
  };

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    const filtered = fetchedMarkets.filter(market => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'waiting') {
          if (market.status !== 'open' || market.canProposeNow) return false;
        } else if (statusFilter === 'open') {
          if (market.status !== 'open' || !market.canProposeNow) return false;
        } else {
          if (market.status !== statusFilter) return false;
        }
      }
      if (categoryFilter !== 'all') {
        if (market.category !== categoryFilter) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return b.id - a.id;
        case 'oldest': return a.id - b.id;
        case 'deadline-soon': return a.resolutionDeadline - b.resolutionDeadline;
        case 'deadline-late': return b.resolutionDeadline - a.resolutionDeadline;
        case 'alphabetical': return a.question.localeCompare(b.question);
        case 'status': {
          const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
          if (priorityDiff !== 0) return priorityDiff;
          return a.resolutionDeadline - b.resolutionDeadline;
        }
        default: return 0;
      }
    });
  }, [fetchedMarkets, statusFilter, categoryFilter, sortOption]);

  // Count markets by category for filter badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: fetchedMarkets.length };
    for (const market of fetchedMarkets) {
      counts[market.category] = (counts[market.category] || 0) + 1;
    }
    return counts;
  }, [fetchedMarkets]);

  // Count markets by status for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: fetchedMarkets.length };
    for (const market of fetchedMarkets) {
      if (market.status === 'open' && !market.canProposeNow) {
        counts['waiting'] = (counts['waiting'] || 0) + 1;
      } else if (market.status === 'open' && market.canProposeNow) {
        counts['open'] = (counts['open'] || 0) + 1;
      } else {
        counts[market.status] = (counts[market.status] || 0) + 1;
      }
    }
    return counts;
  }, [fetchedMarkets]);

  // Calculate countdowns once when markets change
  useEffect(() => {
    if (fetchedMarkets.length === 0) return;

    const now = Math.floor(Date.now() / 1000);
    const newCountdowns: Record<string, CountdownEntry> = {};

    for (const market of fetchedMarkets) {
      const countdown: CountdownEntry = {};

      if (market.status === 'open') {
        if (market.canProposeNow) {
          if (market.proposalStartTime) {
            countdown.timeSince = formatTimeSince(market.proposalStartTime);
          }
          countdown.urgency = 'safe';
        } else if (market.proposalStartTime) {
          const remaining = market.proposalStartTime - now;
          if (remaining > 0) {
            countdown.proposalCountdown = formatDuration(remaining);
            countdown.proposalProgress = Math.max(0, Math.min(100, (remaining / 300) * 100));
            countdown.urgency = getUrgency(remaining, 300);
          }
        }
      }

      if ((market.status === 'proposed' || market.status === 'challenged') && market.challengeDeadline) {
        const remaining = market.challengeDeadline - now;
        const actualPeriod = market.proposedAt
          ? market.challengeDeadline - market.proposedAt
          : INITIAL_CHALLENGE_PERIOD_SECONDS;
        if (remaining > 0) {
          countdown.challengeCountdown = formatDuration(remaining);
          countdown.challengeProgress = Math.max(0, Math.min(100, (remaining / actualPeriod) * 100));
          countdown.urgency = getUrgency(remaining, actualPeriod);
        } else {
          countdown.challengeCountdown = 'Challenge period ended';
          countdown.challengeProgress = 0;
        }
        if (market.proposedAt) {
          countdown.timeSince = formatTimeSince(market.proposedAt);
        }
      }

      if (market.status === 'voting' && market.vetoEnd) {
        const remaining = market.vetoEnd - now;
        if (remaining > 0) {
          countdown.vetoCountdown = formatDuration(remaining);
          countdown.vetoProgress = Math.max(0, Math.min(100, (remaining / VETO_PERIOD_SECONDS) * 100));
          countdown.urgency = getUrgency(remaining, VETO_PERIOD_SECONDS);
        } else {
          countdown.vetoCountdown = 'Voting ended';
          countdown.vetoProgress = 0;
        }
      }

      newCountdowns[market.address] = countdown;
    }
    setCountdowns(newCountdowns);
  }, [fetchedMarkets]);

  // Track user votes in localStorage
  const getUserVote = (marketAddress: string): 'veto' | 'support' | null => {
    const voteKey = `vote_${marketAddress}_${userAddress}`;
    return localStorage.getItem(voteKey) as 'veto' | 'support' | null;
  };

  const setUserVote = (marketAddress: string, voteType: 'veto' | 'support') => {
    const voteKey = `vote_${marketAddress}_${userAddress}`;
    localStorage.setItem(voteKey, voteType);
  };

  // Toggle bond history expansion
  const toggleHistoryExpansion = (marketId: number) => {
    setExpandedHistory(prev => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  };

  // Check if user can veto
  const canUserVeto = (): boolean => {
    if (!stakingInfo || !stakingInfo.userStake) return false;
    const stakeAmount = Number(stakingInfo.userStake) / 1e9;
    const now = Math.floor(Date.now() / 1000);
    return stakeAmount >= VETO_THRESHOLD_HNCH && stakingInfo.lockTime > 0 && now >= stakingInfo.lockTime + VETO_LOCK_PERIOD;
  };

  // Helper to check if user can claim rebate
  const canClaimRebate = (market: Market): boolean => {
    if (!userAddress || !market.rebateCreator) return false;
    const userNormalized = userAddress.toLowerCase();
    const creatorNormalized = market.rebateCreator.toLowerCase();
    return (
      market.status === 'resolved' &&
      userNormalized === creatorNormalized &&
      market.rebateAmount !== undefined &&
      market.rebateAmount > 0 &&
      !market.rebateClaimed
    );
  };

  // Helper to check if user can claim resolver reward
  const canClaimResolverReward = (market: Market): boolean => {
    if (!userAddress || !market.resolverAddress) return false;
    const userNormalized = userAddress.toLowerCase();
    const resolverNormalized = market.resolverAddress.toLowerCase();
    return (
      market.status === 'resolved' &&
      userNormalized === resolverNormalized &&
      market.resolverReward !== undefined &&
      market.resolverReward > 0 &&
      !market.resolverClaimed
    );
  };

  // Action handlers
  const handlePropose = async (market: Market) => {
    if (!market.address) {
      alert('Market address not available');
      return;
    }

    const bondAmount = parseFloat(proposeBond);
    if (bondAmount < MIN_BOND_HNCH) {
      alert(`Minimum bond is ${MIN_BOND_HNCH.toLocaleString()} HNCH`);
      return;
    }
    if (bondAmount > hnchBalance) {
      alert(`Insufficient HNCH balance. You have ${formattedBalance} HNCH`);
      return;
    }

    setIsProposing(true);
    try {
      await proposeOutcome(market.address, proposeAnswer, bondAmount);
      await new Promise(resolve => setTimeout(resolve, 8000));
      await updateMarketStatus(market.address);
      setProposeMarketId(null);
      alert('Proposal submitted successfully! The market now shows your proposed outcome.');
    } catch (error: any) {
      console.error('Failed to propose:', error);
      alert(error.message || 'Failed to propose outcome. Please try again.');
    } finally {
      setIsProposing(false);
    }
  };

  const handleChallenge = async (market: Market) => {
    if (!market.address || market.currentBond === undefined) {
      alert('Market data not available');
      return;
    }

    if ((market.escalationCount || 0) === 2) {
      setDaoConfirmMarket(market);
      setShowDaoConfirmModal(true);
      return;
    }

    await executeChallengeTransaction(market);
  };

  const executeChallengeTransaction = async (market: Market) => {
    if (!market.address || market.currentBond === undefined) {
      alert('Market data not available');
      return;
    }

    const requiredBond = market.currentBond * 2;
    const bondAmount = parseFloat(challengeBond);

    if (bondAmount < requiredBond) {
      alert(`Minimum challenge bond is ${requiredBond.toLocaleString()} HNCH (2x current bond)`);
      return;
    }
    if (bondAmount > hnchBalance) {
      alert(`Insufficient HNCH balance. You have ${formattedBalance} HNCH`);
      return;
    }

    setIsChallenging(true);
    try {
      const oppositeAnswer = !market.proposedOutcome;
      await challengeOutcome(market.address, oppositeAnswer, bondAmount);
      await new Promise(resolve => setTimeout(resolve, 8000));
      await updateMarketStatus(market.address);
      setChallengeMarketId(null);
      setShowDaoConfirmModal(false);
      setDaoConfirmMarket(null);
      alert('Challenge submitted successfully! The market now shows the updated bond and deadline.');
    } catch (error: any) {
      console.error('Failed to challenge:', error);
      alert(error.message || 'Failed to challenge. Please try again.');
    } finally {
      setIsChallenging(false);
    }
  };

  const handleCastVeto = async (market: Market) => {
    if (!market.vetoGuardAddress || !stakingInfo.userStake) {
      alert('Veto not available');
      return;
    }

    if (!canUserVeto()) {
      alert(`You need at least ${VETO_THRESHOLD_HNCH.toLocaleString()} HNCH staked for 24+ hours to veto`);
      return;
    }

    setIsVetoing(true);
    try {
      const stakeAmount = BigInt(stakingInfo.userStake);
      const lockTime = stakingInfo.lockTime || 0;
      await castVeto(market.vetoGuardAddress, stakeAmount, lockTime);
      if (market.address) {
        setUserVote(market.address, 'veto');
      }
      alert('Veto transaction sent! Your veto will be recorded after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to veto:', error);
      alert(error.message || 'Failed to cast veto. Please try again.');
    } finally {
      setIsVetoing(false);
    }
  };

  const handleCounterVeto = async (market: Market) => {
    if (!market.vetoGuardAddress || !stakingInfo.userStake) {
      alert('Counter-veto not available');
      return;
    }

    if (!canUserVeto()) {
      alert(`You need at least ${VETO_THRESHOLD_HNCH.toLocaleString()} HNCH staked for 24+ hours to counter-veto`);
      return;
    }

    setIsCounterVetoing(true);
    try {
      const stakeAmount = BigInt(stakingInfo.userStake);
      const lockTime = stakingInfo.lockTime || 0;
      await counterVeto(market.vetoGuardAddress, stakeAmount, lockTime);
      if (market.address) {
        setUserVote(market.address, 'support');
      }
      alert('Counter-veto transaction sent! Your counter-veto will be recorded after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to counter-veto:', error);
      alert(error.message || 'Failed to cast counter-veto. Please try again.');
    } finally {
      setIsCounterVetoing(false);
    }
  };

  const handleFinalizeVeto = async (market: Market) => {
    if (!market.vetoGuardAddress) {
      alert('Veto guard not available');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (market.vetoEnd && now < market.vetoEnd) {
      alert('Veto period has not ended yet');
      return;
    }

    setIsFinalizing(true);
    try {
      await finalizeVeto(market.vetoGuardAddress);
      alert('Finalize transaction sent! The dispute will be resolved after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to finalize:', error);
      alert(error.message || 'Failed to finalize vote. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSettle = async (market: Market) => {
    if (!market.address) {
      alert('Market address not available');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (market.challengeDeadline && now < market.challengeDeadline) {
      alert('Challenge period has not ended yet');
      return;
    }

    setIsSettling(market.address);
    try {
      await settleMarket(market.address);
      await new Promise(resolve => setTimeout(resolve, 8000));
      await updateMarketStatus(market.address);
      alert('Market settled successfully! You earned 500 HNCH as resolver reward.');
    } catch (error: any) {
      console.error('Failed to settle:', error);
      alert(error.message || 'Failed to settle market. Please try again.');
    } finally {
      setIsSettling(null);
    }
  };

  const handleClaimRebate = async (market: Market) => {
    if (!market.address) {
      alert('Market address not available');
      return;
    }

    setIsClaimingRebate(market.address);
    try {
      await claimCreatorRebate(market.address);
      alert('Rebate claim transaction sent! Your 2,500 HNCH rebate will be sent after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to claim rebate:', error);
      alert(error.message || 'Failed to claim rebate. Please try again.');
    } finally {
      setIsClaimingRebate(null);
    }
  };

  const handleClaimResolverReward = async (market: Market) => {
    if (!market.address) {
      alert('Market address not available');
      return;
    }

    setIsClaimingResolver(market.address);
    try {
      await claimResolverReward(market.address);
      alert('Resolver reward claim sent! Your 500 HNCH reward will be sent after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to claim resolver reward:', error);
      alert(error.message || 'Failed to claim resolver reward. Please try again.');
    } finally {
      setIsClaimingResolver(null);
    }
  };

  const handleClaimBonds = async (market: Market) => {
    if (!market.address) {
      alert('Market address not available');
      return;
    }

    setIsClaimingBonds(market.address);
    try {
      await claimReward(market.address);
      alert('Bond claim transaction sent! Your winnings will be sent after blockchain confirmation.');
      refetchMarkets();
    } catch (error: any) {
      console.error('Failed to claim bonds:', error);
      alert(error.message || 'Failed to claim bonds. Please try again.');
    } finally {
      setIsClaimingBonds(null);
    }
  };

  const handleSyncMarkets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await syncMarkets('both', false);

      if (result.success) {
        if (result.totalMarketsAdded > 0) {
          setSyncMessage({
            type: 'success',
            text: `Successfully synced ${result.totalMarketsAdded} new market${result.totalMarketsAdded !== 1 ? 's' : ''}!`,
          });
        } else {
          setSyncMessage({
            type: 'success',
            text: 'All markets are up to date. No new markets found.',
          });
        }
      } else {
        setSyncMessage({
          type: 'error',
          text: result.error || 'Failed to sync markets. Please try again.',
        });
      }

      setTimeout(() => setSyncMessage(null), 5000);
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncMessage({
        type: 'error',
        text: error.message || 'Failed to sync markets. Please try again.',
      });
      setTimeout(() => setSyncMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <section className="markets" id="markets">
      <h2>Prediction Markets</h2>

      <CreateMarketForm
        wallet={wallet}
        formattedBalance={formattedBalance}
        balance={balance}
        masterOracleBalance={masterOracleBalance}
        createMarket={createMarket}
        MIN_BOND_HNCH={MIN_BOND_HNCH}
        MARKET_CREATION_FEE_HNCH={MARKET_CREATION_FEE_HNCH}
        refetchMarkets={refetchMarkets}
      />

      {/* Markets List */}
      <div className="markets-list">
        <div className="markets-header">
          <h3>Markets ({filteredMarkets.length} of {fetchedMarkets.length})</h3>
          <div className="markets-header-actions">
            <div className="sync-info-tooltip">
              <span className="info-icon" title="New markets appear within 5 minutes of creation on the blockchain">ℹ️</span>
              <span className="info-text">New markets auto-sync every 120 minutes</span>
            </div>
            <button
              className="btn-sync"
              onClick={handleSyncMarkets}
              disabled={isSyncing || marketsLoading}
              title="Manually sync markets from blockchain"
            >
              {isSyncing ? 'Syncing...' : 'Sync Markets'}
            </button>
            <button
              className="btn-refresh"
              onClick={() => refetchMarkets()}
              disabled={marketsLoading}
            >
              {marketsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Sync notification message */}
        {syncMessage && (
          <div className={`sync-notification sync-${syncMessage.type}`}>
            <span className="sync-notification-icon">
              {syncMessage.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="sync-notification-text">{syncMessage.text}</span>
          </div>
        )}

        <MarketFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          statusCounts={statusCounts}
          categoryCounts={categoryCounts}
        />

        {marketsLoading ? (
          <div className="loading-markets">
            <p className="loading-status">
              {loadingProgress?.status || 'Loading markets from blockchain...'}
            </p>
            {loadingProgress && loadingProgress.total > 0 && (
              <div className="loading-progress">
                <div className="loading-progress-bar">
                  <div
                    className="loading-progress-fill"
                    style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                  />
                </div>
                <span className="loading-progress-text">
                  {loadingProgress.loaded} / {loadingProgress.total} markets
                </span>
              </div>
            )}
          </div>
        ) : fetchedMarkets.length === 0 ? (
          <p className="no-markets">No active markets yet. Create one above!</p>
        ) : filteredMarkets.length === 0 ? (
          <p className="no-markets">No markets match the selected filters. Try adjusting your filters.</p>
        ) : (
          <div className="market-cards">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                wallet={wallet}
                userAddress={userAddress}
                countdown={countdowns[market.address]}
                stakingInfo={stakingInfo}
                proposeMarketId={proposeMarketId}
                setProposeMarketId={setProposeMarketId}
                proposeAnswer={proposeAnswer}
                setProposeAnswer={setProposeAnswer}
                proposeBond={proposeBond}
                setProposeBond={setProposeBond}
                isProposing={isProposing}
                challengeMarketId={challengeMarketId}
                setChallengeMarketId={setChallengeMarketId}
                challengeBond={challengeBond}
                setChallengeBond={setChallengeBond}
                isChallenging={isChallenging}
                isVetoing={isVetoing}
                isCounterVetoing={isCounterVetoing}
                isFinalizing={isFinalizing}
                isSettling={isSettling}
                isClaimingRebate={isClaimingRebate}
                isClaimingResolver={isClaimingResolver}
                isClaimingBonds={isClaimingBonds}
                expandedHistory={expandedHistory}
                toggleHistoryExpansion={toggleHistoryExpansion}
                handlePropose={handlePropose}
                handleChallenge={handleChallenge}
                handleCastVeto={handleCastVeto}
                handleCounterVeto={handleCounterVeto}
                handleFinalizeVeto={handleFinalizeVeto}
                handleClaimRebate={handleClaimRebate}
                handleClaimResolverReward={handleClaimResolverReward}
                handleClaimBonds={handleClaimBonds}
                onOpenSettleModal={(market) => {
                  setSettlementMarket(market);
                  setShowSettlementModal(true);
                }}
                canClaimRebate={canClaimRebate}
                canClaimResolverReward={canClaimResolverReward}
                canUserVeto={canUserVeto}
                getUserVote={getUserVote}
                MIN_BOND_HNCH={MIN_BOND_HNCH}
                formattedBalance={formattedBalance}
              />
            ))}
          </div>
        )}
      </div>

      <HowItWorks />

      <SettlementModal
        show={showSettlementModal}
        market={settlementMarket}
        isSettling={isSettling}
        onSettle={handleSettle}
        onClose={() => {
          setShowSettlementModal(false);
          setSettlementMarket(null);
        }}
      />

      <DaoConfirmModal
        show={showDaoConfirmModal}
        market={daoConfirmMarket}
        isChallenging={isChallenging}
        onConfirm={executeChallengeTransaction}
        onClose={() => {
          setShowDaoConfirmModal(false);
          setDaoConfirmMarket(null);
          setChallengeMarketId(null);
        }}
      />
    </section>
  );
}
