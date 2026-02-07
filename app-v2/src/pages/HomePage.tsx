import { motion } from 'framer-motion';
import { useTonWallet, useTonAddress, TonConnectButton } from '@tonconnect/ui-react';
import { useJettonBalance, useTonBalance } from '@/hooks/useJettonBalance';
import { useStakingInfo } from '@/hooks/useStakingInfo';
import { useMarketsCache } from '@/hooks/useMarketsCache';
import { BalanceCard } from '@/components/BalanceCard';
import { MarketCard } from '@/components/MarketCard';
import { BalanceSkeleton, CardSkeleton } from '@/components/Skeleton';
import { haptic } from '@/lib/telegram';

import type { TabId } from '../App';
import type { Market } from '@/hooks/useMarketsCache';

interface HomePageProps {
  onNavigate?: (tab: TabId) => void;
  onSelectMarket?: (market: Market) => void;
  onCreateMarket?: () => void;
}

export function HomePage({ onNavigate, onSelectMarket, onCreateMarket }: HomePageProps) {
  const wallet = useTonWallet();
  const address = useTonAddress();

  // Balances
  const { balance: hnchBalance, loading: hnchLoading } = useJettonBalance();
  const { balance: tonBalance, loading: tonLoading } = useTonBalance();

  // Staking info
  const { userStake, loading: stakingLoading } = useStakingInfo();

  // Markets
  const { markets, loading: marketsLoading } = useMarketsCache();

  const isConnected = !!wallet && !!address;
  const balanceLoading = hnchLoading || tonLoading || stakingLoading;

  // Get active markets (non-resolved, up to 3)
  const activeMarkets = markets
    .filter((m) => m.status !== 'resolved')
    .slice(0, 3);

  // Feature cards for hero section
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Predict',
      description: 'Trade on future events and outcomes',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Earn',
      description: 'Stake HNCH tokens for rewards',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Resolve',
      description: 'Help verify outcomes and earn',
    },
  ];

  // Container variants for stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!isConnected) {
    // Hero section for non-connected users
    return (
      <div className="min-h-screen flex flex-col">
        {/* Pull indicator */}
        <div className="h-1 w-16 mx-auto mt-2 bg-white/10 rounded-full" />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md"
          >
            {/* Logo / Brand */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gradient mb-3">
                HUNCH Oracle
              </h1>
              <p className="text-tg-hint text-lg">
                Decentralized prediction markets on TON
              </p>
            </div>

            {/* Connect button */}
            <div className="flex justify-center py-4">
              <TonConnectButton />
            </div>

            {/* Features grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 mt-12"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-card p-6 text-left"
                >
                  <div className="text-brand-400 mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-tg-text mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-tg-hint">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Connected user dashboard
  return (
    <div className="min-h-screen pb-24">
      {/* Pull indicator */}
      <div className="h-1 w-16 mx-auto mt-2 mb-4 bg-white/10 rounded-full" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 space-y-6"
      >
        {/* Balance Card */}
        <motion.div variants={itemVariants}>
          {balanceLoading ? (
            <BalanceSkeleton />
          ) : (
            <BalanceCard
              hnchBalance={hnchBalance}
              tonBalance={tonBalance}
              stakedBalance={userStake}
              address={address}
              loading={false}
            />
          )}
        </motion.div>

        {/* Active Markets Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-tg-text">Active Markets</h2>
            <button
              onClick={() => onNavigate?.('markets')}
              className="text-sm text-brand-400 font-medium"
            >
              See all →
            </button>
          </div>

          {marketsLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : activeMarkets.length > 0 ? (
            <div className="space-y-3">
              {activeMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onClick={() => onSelectMarket?.(market)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-tg-hint">No active markets</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <button
            onClick={() => { haptic.light(); onCreateMarket?.(); }}
            className="glass-card p-4 text-center hover:bg-surface-hover active:bg-surface-active transition-colors"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs text-tg-text font-medium">Create</span>
          </button>

          <button
            onClick={() => { haptic.light(); onNavigate?.('stake'); }}
            className="glass-card p-4 text-center hover:bg-surface-hover active:bg-surface-active transition-colors"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-tg-text font-medium">Stake</span>
          </button>

          <button
            onClick={() => { haptic.light(); onNavigate?.('markets'); }}
            className="glass-card p-4 text-center hover:bg-surface-hover active:bg-surface-active transition-colors"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs text-tg-text font-medium">Trade</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
