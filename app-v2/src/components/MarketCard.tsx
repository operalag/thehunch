import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { formatDuration, formatCompact } from '@/lib/utils';
import type { Market } from '@/hooks/useMarketsCache';

interface MarketCardProps {
  market: Market;
  onClick?: () => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = market.resolutionDeadline - now;
  const isExpired = secondsLeft <= 0;

  const deadlineDisplay = isExpired
    ? 'Expired'
    : formatDuration(secondsLeft);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-4 cursor-pointer transition-colors hover:bg-surface-hover active:bg-surface-active"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-tg-text line-clamp-2 flex-1">
          {market.question}
        </h3>
        <StatusBadge status={market.status} />
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs text-tg-hint">
        {market.category && (
          <span className="px-2 py-0.5 bg-white/5 rounded-md">
            {market.category}
          </span>
        )}

        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={isExpired ? 'text-danger' : ''}>
            {deadlineDisplay}
          </span>
        </div>

        {market.currentBond && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{formatCompact(Number(market.currentBond) / 1e9)} HNCH</span>
          </div>
        )}
      </div>

      {/* Bond amount for proposed/challenged markets */}
      {market.currentBond && (market.status === 'proposed' || market.status === 'challenged') && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-tg-hint">Bond Amount</span>
            <span className="text-tg-text font-medium">
              {formatCompact(Number(market.currentBond) / 1e9)} HNCH
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
