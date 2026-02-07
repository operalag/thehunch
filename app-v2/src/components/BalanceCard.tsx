import { motion } from 'framer-motion';
import { formatBalance, truncateAddress } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import { useState } from 'react';

interface BalanceCardProps {
  hnchBalance: string;
  tonBalance: string;
  stakedBalance: string;
  address: string;
  loading?: boolean;
}

export function BalanceCard({
  hnchBalance,
  tonBalance,
  stakedBalance,
  address,
  loading = false,
}: BalanceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      haptic.error();
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-32" />
          <div className="h-10 bg-white/20 rounded w-48" />
          <div className="flex gap-4">
            <div className="h-6 bg-white/20 rounded w-24" />
            <div className="h-6 bg-white/20 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 p-6 shadow-lg"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 space-y-4">
        {/* Wallet address */}
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm font-medium">Wallet</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors"
          >
            <span className="text-white text-sm font-mono">
              {truncateAddress(address)}
            </span>
            {copied ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Primary balance - HNCH */}
        <div>
          <div className="text-white/70 text-sm mb-1">HNCH Balance</div>
          <div className="text-white text-4xl font-bold tracking-tight">
            {formatBalance(hnchBalance)}
          </div>
        </div>

        {/* Secondary balances */}
        <div className="flex items-center gap-6 pt-2">
          <div>
            <div className="text-white/60 text-xs mb-0.5">TON</div>
            <div className="text-white text-lg font-semibold">
              {formatBalance(tonBalance)}
            </div>
          </div>

          <div className="w-px h-8 bg-white/20" />

          <div>
            <div className="text-white/60 text-xs mb-0.5">Staked</div>
            <div className="text-white text-lg font-semibold">
              {formatBalance(stakedBalance)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
