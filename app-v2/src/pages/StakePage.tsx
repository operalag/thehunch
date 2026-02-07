import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress } from '@tonconnect/ui-react';
import { useStakingInfo } from '@/hooks/useStakingInfo';
import { useContract } from '@/hooks/useContract';
import { useJettonBalance } from '@/hooks/useJettonBalance';
import { formatBalance, formatCompact, formatDuration } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import { Skeleton } from '@/components/Skeleton';

export function StakePage() {
  const address = useTonAddress();
  const { stakeTokens, unstakeTokens, claimStakerRewards } = useContract();
  const { balance: hnchBalance, loading: balanceLoading } = useJettonBalance();
  const {
    totalStaked,
    userStake,
    userPendingRewards,
    apy,
    timeUntilUnlock,
    timeUntilNextEpoch,
    loading: stakingLoading,
    refetch,
  } = useStakingInfo();

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [epochTimeRemaining, setEpochTimeRemaining] = useState(0);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setLockTimeRemaining(timeUntilUnlock);
      setEpochTimeRemaining(timeUntilNextEpoch);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilUnlock, timeUntilNextEpoch]);

  const handleStake = async () => {
    if (!stakeAmount || isStaking) return;

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      haptic.error();
      return;
    }

    const maxBalance = Number(hnchBalance) / 1e9;
    if (amount > maxBalance) {
      haptic.error();
      return;
    }

    try {
      setIsStaking(true);
      haptic.medium();
      await stakeTokens(stakeAmount);
      haptic.success();
      setStakeAmount('');
      refetch();
    } catch (err) {
      console.error('Stake error:', err);
      haptic.error();
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || isUnstaking) return;

    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      haptic.error();
      return;
    }

    const maxStaked = Number(userStake) / 1e9;
    if (amount > maxStaked) {
      haptic.error();
      return;
    }

    if (lockTimeRemaining > 0) {
      haptic.error();
      return;
    }

    try {
      setIsUnstaking(true);
      haptic.medium();
      await unstakeTokens(unstakeAmount);
      haptic.success();
      setUnstakeAmount('');
      refetch();
    } catch (err) {
      console.error('Unstake error:', err);
      haptic.error();
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (isClaiming) return;

    const rewards = Number(userPendingRewards);
    if (rewards <= 0) {
      haptic.error();
      return;
    }

    try {
      setIsClaiming(true);
      haptic.medium();
      await claimStakerRewards();
      haptic.success();
      refetch();
    } catch (err) {
      console.error('Claim error:', err);
      haptic.error();
    } finally {
      setIsClaiming(false);
    }
  };

  const setMaxStake = () => {
    const max = Number(hnchBalance) / 1e9;
    setStakeAmount(max.toString());
    haptic.light();
  };

  const setMaxUnstake = () => {
    const max = Number(userStake) / 1e9;
    setUnstakeAmount(max.toString());
    haptic.light();
  };

  const isConnected = !!address;
  const loading = balanceLoading || stakingLoading;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-tg-text mb-2">Wallet Not Connected</h3>
          <p className="text-sm text-tg-hint">Connect your wallet to stake HNCH</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-tg-text mb-1">Stake HNCH</h1>
          <p className="text-sm text-tg-hint">Earn rewards by staking your tokens</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <div className="text-xs text-tg-hint mb-1">Total Staked</div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-lg font-bold text-tg-text">
                {formatCompact(Number(totalStaked) / 1e9)}
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <div className="text-xs text-tg-hint mb-1">APY</div>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-lg font-bold text-success">
                {apy.toFixed(1)}%
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <div className="text-xs text-tg-hint mb-1">Your Stake</div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-lg font-bold text-tg-text">
                {formatCompact(Number(userStake) / 1e9)}
              </div>
            )}
          </div>

          <div className="glass-card p-4">
            <div className="text-xs text-tg-hint mb-1">Pending Rewards</div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-lg font-bold text-brand-400">
                {formatCompact(Number(userPendingRewards) / 1e9)}
              </div>
            )}
          </div>
        </div>

        {/* Stake section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-tg-text">Stake Tokens</h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-tg-hint">Amount</label>
              <button
                onClick={setMaxStake}
                className="text-xs text-brand-400 font-medium hover:text-brand-300"
              >
                Max: {formatBalance(hnchBalance)} HNCH
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tg-hint font-medium">
                HNCH
              </div>
            </div>
          </div>

          <button
            onClick={handleStake}
            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
            className="w-full px-6 py-3 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStaking ? 'Staking...' : 'Stake'}
          </button>
        </motion.div>

        {/* Unstake section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-tg-text">Unstake Tokens</h3>
            {lockTimeRemaining > 0 && (
              <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md">
                Locked: {formatDuration(lockTimeRemaining)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-tg-hint">Amount</label>
              <button
                onClick={setMaxUnstake}
                disabled={lockTimeRemaining > 0}
                className="text-xs text-brand-400 font-medium hover:text-brand-300 disabled:opacity-50"
              >
                Max: {formatBalance(userStake)} HNCH
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.00"
                disabled={lockTimeRemaining > 0}
                className="w-full px-4 py-3 bg-surface rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tg-hint font-medium">
                HNCH
              </div>
            </div>
          </div>

          {lockTimeRemaining > 0 && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-xs text-warning">
                Tokens are locked for 24 hours after staking. You can unstake in {formatDuration(lockTimeRemaining)}.
              </p>
            </div>
          )}

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || lockTimeRemaining > 0}
            className="w-full px-6 py-3 bg-surface hover:bg-surface-hover active:bg-surface-active text-tg-text font-semibold rounded-xl transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnstaking ? 'Unstaking...' : 'Unstake'}
          </button>
        </motion.div>

        {/* Claim rewards section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-tg-text">Claim Rewards</h3>
            {epochTimeRemaining > 0 && (
              <span className="text-xs text-tg-hint">
                Next epoch: {formatDuration(epochTimeRemaining)}
              </span>
            )}
          </div>

          <div className="p-4 bg-brand-400/10 rounded-xl border border-brand-400/20">
            <div className="text-sm text-tg-hint mb-1">Available Rewards</div>
            <div className="text-2xl font-bold text-brand-400">
              {formatBalance(userPendingRewards)} HNCH
            </div>
          </div>

          <button
            onClick={handleClaimRewards}
            disabled={isClaiming || Number(userPendingRewards) <= 0}
            className="w-full px-6 py-3 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
          </button>

          <p className="text-xs text-tg-hint text-center">
            Rewards are distributed from market fees (60% of creation fees)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
