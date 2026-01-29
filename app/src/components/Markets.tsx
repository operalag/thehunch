import { useState, useEffect, useMemo } from 'react';
import { useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';
import { useContract } from '../hooks/useContract';
import { useJettonBalance } from '../hooks/useJettonBalance';
import { useMarkets, type Market, type MarketCategory } from '../hooks/useMarketsCache';
import { useStakingInfo } from '../hooks/useStakingInfo';
import { useMarketParticipants } from '../hooks/useMarketParticipants';
import { getExplorerLink } from '../config/contracts';
import { updateMarketInCache } from '../config/supabase';

// Filter types
type StatusFilter = 'all' | 'open' | 'waiting' | 'proposed' | 'challenged' | 'voting' | 'resolved';
type CategoryFilter = 'all' | MarketCategory;
type SortOption = 'newest' | 'oldest' | 'deadline-soon' | 'deadline-late' | 'alphabetical' | 'status';

// Child component for Bond History - properly uses hooks at top level
interface BondHistorySectionProps {
  market: Market;
  isExpanded: boolean;
  onToggle: () => void;
  formatTimeSince: (timestamp: number) => string;
}

function BondHistorySection({ market, isExpanded, onToggle, formatTimeSince }: BondHistorySectionProps) {
  const { participants } = useMarketParticipants(market.address, market.currentAnswer);

  if (participants.length === 0) return null;

  return (
    <div className="bond-history-section">
      <button className="history-toggle-btn" onClick={onToggle}>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="toggle-text">View Market History ({participants.length} event{participants.length !== 1 ? 's' : ''})</span>
      </button>

      {isExpanded && (
        <div className="bond-history-timeline">
          {participants.map((participant, index) => (
            <div key={participant.id} className="timeline-event">
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                {index < participants.length - 1 && <div className="marker-line"></div>}
              </div>
              <div className="timeline-content">
                <div className="event-header">
                  <span className={`event-action ${participant.action}`}>
                    {participant.action === 'propose' ? '📝 Proposed' : '⚔️ Challenged'}
                  </span>
                  <span className="event-time">{formatTimeSince(participant.timestamp)}</span>
                </div>
                <div className="event-details">
                  <div className="event-answer">
                    Answer: <span className={`answer-badge ${participant.answer ? 'yes' : 'no'}`}>
                      {participant.answer ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="event-bond">
                    Bond: <strong>{participant.bondAmount.toLocaleString()} HNCH</strong>
                  </div>
                  <div className="event-participant">
                    By: <span className="participant-address">
                      {participant.participantAddress.slice(0, 6)}...{participant.participantAddress.slice(-4)}
                    </span>
                  </div>
                </div>
                {market.status === 'resolved' && market.currentAnswer === participant.answer && index === participants.length - 1 && (
                  <div className="winner-badge">🏆 Winner</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Child component for Bond Claim - properly uses hooks at top level
interface BondClaimSectionProps {
  market: Market;
  userAddress: string | undefined;
  isClaimingBonds: string | null;
  onClaimBonds: (market: Market) => void;
}

function BondClaimSection({ market, userAddress, isClaimingBonds, onClaimBonds }: BondClaimSectionProps) {
  const { winner } = useMarketParticipants(market.address, market.currentAnswer);

  // Check if current user can claim
  const canClaim = () => {
    if (!userAddress || !winner) return false;
    const userNormalized = userAddress.toLowerCase();
    const participantNormalized = winner.participant.participantAddress.toLowerCase();
    return market.status === 'resolved' && userNormalized === participantNormalized;
  };

  if (!winner || !canClaim()) return null;

  return (
    <div className="rebate-claim-action bond-claim-action">
      <button
        className="btn-claim-rebate btn-claim-bonds"
        onClick={() => onClaimBonds(market)}
        disabled={isClaimingBonds === market.address}
      >
        {isClaimingBonds === market.address
          ? 'Claiming...'
          : `Claim Your Winnings: ${winner.winnings.toLocaleString()} HNCH`}
      </button>
      <div className="winnings-breakdown">
        <span className="breakdown-item">Bond returned: {winner.bondReturned.toLocaleString()} HNCH</span>
        <span className="breakdown-item">Bonds won: {winner.bondsWon.toLocaleString()} HNCH</span>
        <span className="breakdown-item">Bonus: {winner.bonus.toLocaleString()} HNCH</span>
      </div>
    </div>
  );
}

export function Markets() {
  const wallet = useTonWallet();
  const userAddress = useTonAddress();
  const { createMarket, proposeOutcome, challengeOutcome, settleMarket, castVeto, counterVeto, finalizeVeto, claimCreatorRebate, claimResolverReward, claimReward, MIN_BOND_HNCH, MARKET_CREATION_FEE_HNCH } = useContract();
  const { formattedBalance, balance } = useJettonBalance();
  const { markets: fetchedMarkets, loading: marketsLoading, refetch: refetchMarkets, syncMarkets, loadingProgress } = useMarkets();
  const stakingInfo = useStakingInfo();

  // Sync markets state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create market state
  const [question, setQuestion] = useState('');
  const [rules, setRules] = useState('');
  const [resolutionSource, setResolutionSource] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');
  const [resolutionTime, setResolutionTime] = useState('23:59');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isCreating, setIsCreating] = useState(false);

  // Common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Zurich',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Dubai',
    'Australia/Sydney',
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Calculate Unix timestamp from date, time, and timezone
  // Uses date-fns-tz for correct timezone conversion including DST handling
  const calculateUnixTimestamp = (): number | null => {
    if (!resolutionDate || !resolutionTime) return null;
    try {
      // Parse the date string as a date in the selected timezone
      // This correctly handles DST transitions for future dates
      const dateTimeStr = `${resolutionDate}T${resolutionTime}:00`;

      // fromZonedTime interprets the input as being in the specified timezone
      // and returns the equivalent UTC Date object
      const utcDate = fromZonedTime(dateTimeStr, timezone);

      return Math.floor(utcDate.getTime() / 1000);
    } catch {
      return null;
    }
  };

  // Format a Unix timestamp for display in a specific timezone
  const formatTimestampInTimezone = (timestamp: number, tz: string): string => {
    try {
      const date = new Date(timestamp * 1000);
      const zonedDate = toZonedTime(date, tz);
      return format(zonedDate, 'MMM d, yyyy HH:mm zzz', { timeZone: tz });
    } catch {
      return new Date(timestamp * 1000).toLocaleString();
    }
  };

  const unixTimestamp = calculateUnixTimestamp();

  // Check if date is more than 1 year in the future
  const isDateTooFarInFuture = (): boolean => {
    if (!unixTimestamp) return false;
    const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    return unixTimestamp > oneYearFromNow;
  };

  // Check if date is less than 2 hours from now
  const isDateTooSoon = (): boolean => {
    if (!unixTimestamp) return false;
    const twoHoursFromNow = Math.floor(Date.now() / 1000) + (2 * 60 * 60);
    return unixTimestamp < twoHoursFromNow;
  };

  // Check if timestamp is valid (not too soon, not too far)
  const isTimestampValid = unixTimestamp && !isDateTooSoon() && !isDateTooFarInFuture();

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

  // Track user votes in localStorage
  const getUserVote = (marketAddress: string): 'veto' | 'support' | null => {
    const voteKey = `vote_${marketAddress}_${userAddress}`;
    return localStorage.getItem(voteKey) as 'veto' | 'support' | null;
  };

  const setUserVote = (marketAddress: string, voteType: 'veto' | 'support') => {
    const voteKey = `vote_${marketAddress}_${userAddress}`;
    localStorage.setItem(voteKey, voteType);
  };
  // Settle state
  const [isSettling, setIsSettling] = useState<string | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementMarket, setSettlementMarket] = useState<Market | null>(null);

  // Rebate claim state
  const [isClaimingRebate, setIsClaimingRebate] = useState<string | null>(null);
  // Resolver reward claim state (v1.1)
  const [isClaimingResolver, setIsClaimingResolver] = useState<string | null>(null);
  // Bond claim state
  const [isClaimingBonds, setIsClaimingBonds] = useState<string | null>(null);
  // Bond history expansion state
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const [countdowns, setCountdowns] = useState<Record<string, {
    vetoCountdown?: string;
    challengeCountdown?: string;
    proposalCountdown?: string;
    timeSince?: string;
    urgency?: 'safe' | 'warning' | 'urgent';
    vetoProgress?: number;
    challengeProgress?: number;
    proposalProgress?: number;
  }>>({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Status priority for sorting (lower = more urgent)
  const statusPriority: Record<string, number> = {
    'voting': 1,      // DAO veto - most urgent
    'challenged': 2,  // Active challenge
    'proposed': 3,    // Awaiting challenge/finalization
    'open': 4,        // Can propose
    'resolved': 5,    // Completed
  };

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    // First filter
    const filtered = fetchedMarkets.filter(market => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'waiting') {
          // "Waiting for proposal" = open but can't propose yet
          if (market.status !== 'open' || market.canProposeNow) return false;
        } else if (statusFilter === 'open') {
          // "Open" = open and can propose now
          if (market.status !== 'open' || !market.canProposeNow) return false;
        } else {
          if (market.status !== statusFilter) return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (market.category !== categoryFilter) return false;
      }

      return true;
    });

    // Then sort
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.id - a.id; // Higher ID = newer
        case 'oldest':
          return a.id - b.id; // Lower ID = older
        case 'deadline-soon':
          return a.resolutionDeadline - b.resolutionDeadline; // Sooner deadline first
        case 'deadline-late':
          return b.resolutionDeadline - a.resolutionDeadline; // Later deadline first
        case 'alphabetical':
          return a.question.localeCompare(b.question);
        case 'status':
          // Sort by status priority, then by deadline
          const priorityDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
          if (priorityDiff !== 0) return priorityDiff;
          return a.resolutionDeadline - b.resolutionDeadline;
        default:
          return 0;
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

  const hnchBalance = Number(balance) / 1e9;

  // 2% of 100M HNCH = 2M HNCH required for veto
  const VETO_THRESHOLD_HNCH = 2_000_000;
  const VETO_LOCK_PERIOD = 24 * 60 * 60; // 24 hours in seconds
  const INITIAL_CHALLENGE_PERIOD_SECONDS = 4 * 60 * 60; // 4 hours (updated from 2 hours)
  const VETO_PERIOD_SECONDS = 48 * 60 * 60; // 48 hours

  // Bond escalation schedule and rewards
  const BOND_SCHEDULE = [10000, 20000, 40000, 80000]; // HNCH
  const WINNER_BONUS = 2000; // HNCH

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Helper function to format time since
  const formatTimeSince = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - timestamp;
    if (elapsed < 60) return 'Just now';
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  };

  // Helper function to calculate urgency level
  const getUrgency = (remaining: number, total: number): 'safe' | 'warning' | 'urgent' => {
    const percentage = remaining / total;
    if (percentage > 0.5) return 'safe';      // More than 50% time left
    if (percentage > 0.125) return 'warning'; // 12.5-50% time left
    return 'urgent';                          // Less than 12.5% time left
  };

  // Check if user can veto (has enough stake and staked for 24h+)
  const canUserVeto = (): boolean => {
    if (!stakingInfo || !stakingInfo.userStake) return false;
    const stakeAmount = Number(stakingInfo.userStake) / 1e9;
    const now = Math.floor(Date.now() / 1000);
    return stakeAmount >= VETO_THRESHOLD_HNCH && stakingInfo.lockTime > 0 && now >= stakingInfo.lockTime + VETO_LOCK_PERIOD;
  };

  // Calculate risk/reward for challenging
  const calculateChallengeRiskReward = (market: Market) => {
    const currentBond = market.currentBond || 10000;
    const requiredBond = currentBond * 2;
    const potentialWin = requiredBond + currentBond + WINNER_BONUS;
    const potentialLoss = requiredBond;
    const roi = ((potentialWin - requiredBond) / requiredBond) * 100;

    return {
      requiredBond,
      potentialWin,
      potentialLoss,
      roi: Math.round(roi)
    };
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

  // Calculate countdowns once when markets change - NO automatic timer to prevent memory issues
  // User can manually refresh to update countdowns
  useEffect(() => {
    // Skip if no markets
    if (fetchedMarkets.length === 0) return;

    const now = Math.floor(Date.now() / 1000);
    const newCountdowns: Record<string, {
      vetoCountdown?: string;
      challengeCountdown?: string;
      proposalCountdown?: string;
      timeSince?: string;
      urgency?: 'safe' | 'warning' | 'urgent';
      vetoProgress?: number;
      challengeProgress?: number;
      proposalProgress?: number;
    }> = {};

    for (const market of fetchedMarkets) {
      const countdown: typeof newCountdowns[string] = {};

      // Open markets: proposal window countdown
      if (market.status === 'open') {
        if (market.canProposeNow) {
          // Proposals are open - show time since they opened
          if (market.proposalStartTime) {
            countdown.timeSince = formatTimeSince(market.proposalStartTime);
          }
          countdown.urgency = 'safe';
        } else if (market.proposalStartTime) {
          // Countdown to when proposals open
          const remaining = market.proposalStartTime - now;
          if (remaining > 0) {
            countdown.proposalCountdown = formatDuration(remaining);
            // Total wait time is 5 minutes after resolution deadline
            countdown.proposalProgress = Math.max(0, Math.min(100, (remaining / 300) * 100));
            countdown.urgency = getUrgency(remaining, 300);
          }
        }
      }

      // Proposed/Challenged markets: challenge period countdown
      if ((market.status === 'proposed' || market.status === 'challenged') && market.challengeDeadline) {
        const remaining = market.challengeDeadline - now;
        // Calculate actual period from contract data (2h initial or 4h escalated)
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
        // Show time since proposal
        if (market.proposedAt) {
          countdown.timeSince = formatTimeSince(market.proposedAt);
        }
      }

      // Voting markets: veto period countdown
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

      // Auto-refresh markets after a delay to pick up the new market
      setTimeout(() => {
        console.log('[Markets] Auto-refreshing after market creation...');
        refetchMarkets();
      }, 15000); // 15 second delay for blockchain confirmation
    } catch (error: any) {
      console.error('Failed to create market:', error);
      alert(error.message || 'Failed to create market. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

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

      // Update cache to reflect proposed status (optimistic update)
      await updateMarketInCache(market.id, {
        status: 'proposed',
        proposed_outcome: proposeAnswer,
        current_bond: bondAmount * 1e9, // Convert to nano
        proposed_at: Math.floor(Date.now() / 1000),
        challenge_deadline: Math.floor(Date.now() / 1000) + 86400, // 24h challenge window
      });

      // Refetch markets to update UI
      await refetchMarkets();

      setProposeMarketId(null);
      alert('Proposal transaction sent! Your outcome will be recorded after blockchain confirmation.');
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

    // TASK 2: Show confirmation modal if this is the 3rd challenge (triggers DAO vote)
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
      // Challenge with opposite answer
      const oppositeAnswer = !market.proposedOutcome;
      await challengeOutcome(market.address, oppositeAnswer, bondAmount);

      // Update cache to reflect challenged status (optimistic update)
      await updateMarketInCache(market.id, {
        status: 'challenged',
        current_bond: bondAmount * 1e9, // Convert to nano
        escalation_count: (market.escalationCount || 0) + 1,
        proposed_outcome: oppositeAnswer,
        challenge_deadline: Math.floor(Date.now() / 1000) + 86400, // Reset 24h window
      });

      // Refetch markets to update UI
      await refetchMarkets();

      setChallengeMarketId(null);
      setShowDaoConfirmModal(false);
      setDaoConfirmMarket(null);
      alert('Challenge transaction sent! Your challenge will be recorded after blockchain confirmation.');
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

      // TASK 5: Track user vote
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

      // TASK 5: Track user vote
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
      alert('Settle transaction sent! The market will be resolved after blockchain confirmation.');
      refetchMarkets();
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

  // v1.1: Claim resolver reward (5% of market fee = 500 HNCH)
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

  // Claim bonds after winning a market
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

  // Helper to check if user can claim rebate for a market
  const canClaimRebate = (market: Market): boolean => {
    if (!userAddress || !market.rebateCreator) return false;
    // Compare addresses (normalize to same format)
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

  // v1.1: Helper to check if user can claim resolver reward
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

  // Handle manual market sync
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

      // Clear message after 5 seconds
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

  const getStatusBadge = (status: Market['status']) => {
    const badges = {
      open: { class: 'badge-pending', text: 'Open' },
      proposed: { class: 'badge-proposed', text: 'Proposed' },
      challenged: { class: 'badge-challenged', text: 'Challenged' },
      voting: { class: 'badge-challenged', text: 'DAO Voting' },
      resolved: { class: 'badge-resolved', text: 'Resolved' },
    };
    return badges[status];
  };

  return (
    <section className="markets" id="markets">
      <h2>Prediction Markets</h2>

      {wallet && (
        <>
          {/* HNCH Balance Info */}
          <div className="balance-info">
            <span>Your HNCH Balance: <strong>{formattedBalance} HNCH</strong></span>
            <span className="bond-info">Minimum bond: {MIN_BOND_HNCH.toLocaleString()} HNCH</span>
          </div>

          {/* Create Market Form */}
          <div className="create-market">
            <h3>Create New Market</h3>
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
      )}

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

        {/* Filter Controls */}
        <div className="market-filters">
          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <div className="filter-buttons">
              {[
                { key: 'all', label: 'All' },
                { key: 'open', label: 'Open' },
                { key: 'waiting', label: 'Waiting' },
                { key: 'proposed', label: 'Proposed' },
                { key: 'challenged', label: 'Challenged' },
                { key: 'voting', label: 'DAO Veto' },
                { key: 'resolved', label: 'Resolved' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-btn ${statusFilter === key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(key as StatusFilter)}
                >
                  {label}
                  {statusCounts[key] !== undefined && (
                    <span className="filter-count">{statusCounts[key] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <div className="filter-buttons">
              {[
                { key: 'all', label: 'All', icon: '🌐' },
                { key: 'cricket', label: 'Cricket', icon: '🏏' },
                { key: 'champions_league', label: 'Champions League', icon: '⚽' },
                { key: 'soccer_world_cup', label: 'Soccer World Cup', icon: '🏆' },
                { key: 'winter_olympics', label: 'Winter Olympics', icon: '⛷️' },
                { key: 'other', label: 'Other', icon: '📊' },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={`filter-btn category-btn ${categoryFilter === key ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(key as CategoryFilter)}
                >
                  <span className="filter-icon">{icon}</span>
                  {label}
                  {categoryCounts[key] !== undefined && (
                    <span className="filter-count">{categoryCounts[key] || 0}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-group sort-group">
            <label className="filter-label">Sort by:</label>
            <div className="sort-select-wrapper">
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline-soon">Deadline (Soonest)</option>
                <option value="deadline-late">Deadline (Latest)</option>
                <option value="status">Status (Most Urgent)</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
              <span className="sort-icon">↕</span>
            </div>
          </div>
        </div>
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
            {filteredMarkets.map((market) => {
              const badge = getStatusBadge(market.status);
              const isProposingThis = proposeMarketId === market.id;
              const isChallengingThis = challengeMarketId === market.id;

              return (
                <div key={market.id} className="market-card">
                  <div className="market-header">
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                    <span className="market-id">#{market.id}</span>
                  </div>

                  <h4 className="market-question">{market.question}</h4>

                  {/* WEEK 4 TASK 1: Market Lifecycle Progress Bar */}
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

                  {/* TASK 1: DAO Trigger Warning for 2nd Challenge */}
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

                  {/* TASK 2: Bond Escalation Schedule Visualization */}
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
                    {market.status === 'open' && !market.canProposeNow && countdowns[market.address]?.proposalCountdown && (
                      <div className={`countdown-box countdown-${countdowns[market.address]?.urgency || 'safe'}`}>
                        <div className="countdown-header">
                          <span className="countdown-icon">⏳</span>
                          <span className="countdown-title detail-with-tooltip">
                            Proposals Open In
                            <span className="tooltip-text">There is a 5-minute delay after the resolution deadline before proposals are allowed. This prevents front-running.</span>
                          </span>
                        </div>
                        <div className="countdown-timer">
                          <span className="countdown-value">{countdowns[market.address]?.proposalCountdown}</span>
                        </div>
                        <div className="countdown-progress-bar">
                          <div
                            className={`countdown-progress-fill progress-${countdowns[market.address]?.urgency || 'safe'}`}
                            style={{ width: `${countdowns[market.address]?.proposalProgress || 0}%` }}
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
                          {countdowns[market.address]?.timeSince && (
                            <span className="countdown-since">Opened {countdowns[market.address]?.timeSince}</span>
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
                          {formatTimestampInTimezone(market.resolutionDeadline, Intl.DateTimeFormat().resolvedOptions().timeZone)}
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
                        {countdowns[market.address]?.challengeCountdown && (
                          <div className={`countdown-box countdown-${countdowns[market.address]?.urgency || 'safe'}`}>
                            <div className="countdown-header">
                              <span className="countdown-icon">⏱️</span>
                              <span className="countdown-title detail-with-tooltip">
                                Challenge Period
                                <span className="tooltip-text">4 hours to challenge the current proposal. If no one challenges within this time, the market can be settled with the proposed outcome.</span>
                              </span>
                            </div>
                            <div className="countdown-timer">
                              {countdowns[market.address]?.challengeCountdown === 'Challenge period ended' ? (
                                <span className="countdown-value countdown-ended">Challenge period ended</span>
                              ) : (
                                <>
                                  <span className="countdown-value">{countdowns[market.address]?.challengeCountdown}</span>
                                  <span className="countdown-label">to challenge this outcome</span>
                                </>
                              )}
                            </div>
                            {countdowns[market.address]?.challengeProgress !== undefined && (
                              <div className="countdown-progress-bar">
                                <div
                                  className={`countdown-progress-fill progress-${countdowns[market.address]?.urgency || 'safe'}`}
                                  style={{ width: `${countdowns[market.address]?.challengeProgress}%` }}
                                />
                              </div>
                            )}
                            {countdowns[market.address]?.timeSince && (
                              <div className="countdown-since">Proposed {countdowns[market.address]?.timeSince}</div>
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
                        <div className={`countdown-box countdown-${countdowns[market.address]?.urgency || 'safe'}`}>
                          <div className="countdown-header">
                            <span className="countdown-icon">⚖️</span>
                            <span className="countdown-title detail-with-tooltip">
                              DAO Veto Period
                              <span className="tooltip-text">48-hour DAO voting period. Token holders with 2M+ HNCH staked for 24+ hours can vote to veto or support the proposed outcome.</span>
                            </span>
                          </div>
                          <div className="countdown-timer">
                            {countdowns[market.address]?.vetoCountdown === 'Voting ended' ? (
                              <span className="countdown-value countdown-ended">Voting Ended - Ready to Finalize</span>
                            ) : (
                              <>
                                <span className="countdown-value">{countdowns[market.address]?.vetoCountdown || 'Loading...'}</span>
                                <span className="countdown-label">remaining to veto</span>
                              </>
                            )}
                          </div>
                          {countdowns[market.address]?.vetoProgress !== undefined && (
                            <div className="countdown-progress-bar">
                              <div
                                className={`countdown-progress-fill progress-${countdowns[market.address]?.urgency || 'safe'}`}
                                style={{ width: `${countdowns[market.address]?.vetoProgress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* TASK 3: Enhanced Voting Eligibility Display */}
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

                        {/* TASK 4: Vote Impact Prediction */}
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
                        {/* v1.1: Resolver Reward Info */}
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

                  {/* TASK 4: Bond History Timeline */}
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
                          title={!market.canProposeNow ? `Proposals open at ${formatTimestampInTimezone((market.proposalStartTime || 0), Intl.DateTimeFormat().resolvedOptions().timeZone)}` : ''}
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
                          onClick={() => {
                            setSettlementMarket(market);
                            setShowSettlementModal(true);
                          }}
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
                              {/* TASK 5: Already Voted Indicator */}
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

                      {/* v1.1: Resolver Reward Claim for Resolved Markets */}
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

                      {/* TASK 3: Risk/Reward Calculator - Show when viewing challenge button */}
                      {(market.status === 'proposed' || market.status === 'challenged') &&
                       !isChallengingThis &&
                       (market.escalationCount || 0) < 3 &&
                       market.challengeDeadline &&
                       Math.floor(Date.now() / 1000) < market.challengeDeadline && (() => {
                        const riskReward = calculateChallengeRiskReward(market);
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
            })}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h3>How Bonds Work</h3>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>Propose</h4>
              <p>Bond minimum 10,000 HNCH to propose YES or NO</p>
            </div>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Challenge</h4>
              <p>Bond 2x to challenge with opposite answer</p>
            </div>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>Resolve</h4>
              <p>After 4 hours without challenge, outcome is final</p>
            </div>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <div className="step-content">
              <h4>Claim</h4>
              <p>Winners get their bond back + loser's bond</p>
            </div>
          </div>
        </div>
      </div>

      {/* WEEK 4 TASK 3: Settlement Explainer Modal */}
      {showSettlementModal && settlementMarket && (
        <div className="settlement-modal-overlay" onClick={() => setShowSettlementModal(false)}>
          <div className="settlement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settlement-modal-header">
              <span className="modal-icon">🎯</span>
              <h3>Settle Market & Earn Reward</h3>
            </div>
            <div className="settlement-modal-body">
              <div className="settlement-reward-badge">
                You Will Earn
                <span className="reward-amount">500 HNCH</span>
              </div>

              <div className="settlement-explainer">
                <h4>What Settlement Does:</h4>
                <ul className="settlement-explainer-list">
                  <li>
                    <span className="icon">🔒</span>
                    <span className="text">
                      <strong>Finalizes the market</strong> with the current proposed outcome
                    </span>
                  </li>
                  <li>
                    <span className="icon">💰</span>
                    <span className="text">
                      <strong>Bond winner receives</strong> their bond back + loser's bond + 2,000 HNCH bonus
                    </span>
                  </li>
                  <li>
                    <span className="icon">🎁</span>
                    <span className="text">
                      <strong>You receive 500 HNCH</strong> as a reward for settling this market
                    </span>
                  </li>
                  <li>
                    <span className="icon">👤</span>
                    <span className="text">
                      <strong>Market creator receives</strong> 2,500 HNCH rebate (25% of creation fee)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="settlement-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">
                  This action is irreversible! Make sure the proposed outcome is correct.
                </span>
              </div>

              <div className="settlement-explainer">
                <h4>Current Proposed Outcome:</h4>
                <ul className="settlement-explainer-list">
                  <li>
                    <span className="icon">{settlementMarket.proposedOutcome ? '✅' : '❌'}</span>
                    <span className="text">
                      <strong>{settlementMarket.proposedOutcome ? 'YES' : 'NO'}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="settlement-modal-actions">
              <button
                className="btn-settle-confirm"
                onClick={async () => {
                  setShowSettlementModal(false);
                  await handleSettle(settlementMarket);
                }}
                disabled={isSettling === settlementMarket.address}
              >
                {isSettling === settlementMarket.address ? 'Settling...' : 'Confirm & Settle'}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => {
                  setShowSettlementModal(false);
                  setSettlementMarket(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK 2: DAO Trigger Confirmation Modal */}
      {showDaoConfirmModal && daoConfirmMarket && (
        <div className="modal-overlay" onClick={() => setShowDaoConfirmModal(false)}>
          <div className="dao-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">⚖️</span>
              <h3>This Will Trigger a DAO Vote!</h3>
            </div>
            <div className="modal-body">
              <p className="modal-warning">
                After your challenge, this market will enter a <strong>48-hour DAO voting period</strong>.
              </p>
              <div className="modal-info-box">
                <h4>What happens next:</h4>
                <ul>
                  <li>Market enters DAO voting for 48 hours</li>
                  <li>Only users with 2M+ HNCH staked for 24h+ can vote</li>
                  <li>Community votes to resolve the dispute</li>
                  <li>After 48 hours, anyone can finalize the vote</li>
                </ul>
              </div>
              <div className="modal-challenge-details">
                <p><strong>Your Challenge:</strong></p>
                <p>Proposing: <span className={`outcome-${!daoConfirmMarket.proposedOutcome ? 'yes' : 'no'}`}>
                  {!daoConfirmMarket.proposedOutcome ? 'YES' : 'NO'}
                </span></p>
                <p>Bond Required: <strong>{((daoConfirmMarket.currentBond || 0) * 2).toLocaleString()} HNCH</strong></p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-confirm-dao"
                onClick={() => executeChallengeTransaction(daoConfirmMarket)}
                disabled={isChallenging}
              >
                {isChallenging ? 'Submitting...' : 'Confirm & Trigger DAO Vote'}
              </button>
              <button
                className="btn-cancel-modal"
                onClick={() => {
                  setShowDaoConfirmModal(false);
                  setDaoConfirmMarket(null);
                  setChallengeMarketId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
