import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress } from '@tonconnect/ui-react';
import { useContract } from '@/hooks/useContract';
import { useJettonBalance } from '@/hooks/useJettonBalance';
import { formatBalance } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import type { MarketCategory } from '@/hooks/useMarketsCache';

interface CreateMarketPageProps {
  onBack: () => void;
  onCreated: () => void;
}

const CATEGORIES: { id: MarketCategory; label: string }[] = [
  { id: 'cricket', label: 'Cricket' },
  { id: 'champions_league', label: 'Champions League' },
  { id: 'soccer_world_cup', label: 'World Cup' },
  { id: 'winter_olympics', label: 'Winter Olympics' },
  { id: 'other', label: 'Other' },
];

export function CreateMarketPage({ onBack, onCreated }: CreateMarketPageProps) {
  const address = useTonAddress();
  const { createMarket, MARKET_CREATION_FEE_HNCH } = useContract();
  const { balance: hnchBalance } = useJettonBalance();

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<MarketCategory>('other');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [rules, setRules] = useState('');
  const [resolutionSource, setResolutionSource] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address;
  const hnchNum = Number(hnchBalance) / 1e9;
  const hasEnoughBalance = hnchNum >= MARKET_CREATION_FEE_HNCH;

  // Convert date input to unix timestamp
  const deadlineTimestamp = deadlineDate
    ? Math.floor(new Date(deadlineDate).getTime() / 1000)
    : 0;

  const isValid =
    question.trim().length >= 10 &&
    deadlineTimestamp > Math.floor(Date.now() / 1000) + 3600 && // at least 1h in future
    hasEnoughBalance;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setError(null);

    // Build the question with category prefix for cache compatibility
    const fullQuestion = question.trim();

    try {
      setIsSubmitting(true);
      haptic.medium();
      await createMarket(
        fullQuestion,
        deadlineTimestamp,
        rules.trim() || undefined,
        resolutionSource.trim() || undefined
      );
      haptic.success();
      onCreated();
    } catch (err: any) {
      console.error('Create market error:', err);
      setError(err.message || 'Failed to create market');
      haptic.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimum deadline: 1 hour from now
  const minDate = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(16px)' }}
      >
        <button
          onClick={() => { haptic.light(); onBack(); }}
          className="p-2 -ml-2 hover:bg-white/5 active:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-tg-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-tg-text">Create Market</h1>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Fee info banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-tg-text">Creation Fee</div>
              <div className="text-xs text-tg-hint mt-0.5">
                25% rebated after resolution
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-brand-400">
                {MARKET_CREATION_FEE_HNCH.toLocaleString()} HNCH
              </div>
              <div className="text-xs text-tg-hint">
                Balance: {formatBalance(hnchBalance)}
              </div>
            </div>
          </div>
          {!hasEnoughBalance && isConnected && (
            <div className="mt-3 p-2.5 bg-danger/10 rounded-lg border border-danger/20">
              <p className="text-xs text-danger">
                Insufficient HNCH balance. You need at least {MARKET_CREATION_FEE_HNCH.toLocaleString()} HNCH.
              </p>
            </div>
          )}
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-tg-text">
            Question <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-tg-hint">
            Must be answerable with YES or NO
          </p>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will [event] happen by [date]?"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 bg-white/[0.03] rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors resize-none"
          />
          <div className="text-xs text-tg-hint text-right">
            {question.length}/500
          </div>
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-tg-text">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); haptic.selection(); }}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  category === cat.id
                    ? 'bg-brand-400/20 text-brand-400 border border-brand-400'
                    : 'bg-white/5 text-tg-hint border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Resolution Deadline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-tg-text">
            Resolution Deadline <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-tg-hint">
            After this date, anyone can propose an answer
          </p>
          <input
            type="datetime-local"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            min={minDate}
            className="w-full px-4 py-3 bg-white/[0.03] rounded-xl text-tg-text border border-white/10 focus:border-brand-400 focus:outline-none transition-colors [color-scheme:dark]"
          />
          {deadlineDate && deadlineTimestamp <= Math.floor(Date.now() / 1000) + 3600 && (
            <p className="text-xs text-danger">
              Deadline must be at least 1 hour in the future
            </p>
          )}
        </motion.div>

        {/* Optional fields toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => { setShowOptional(!showOptional); haptic.selection(); }}
            className="flex items-center gap-2 text-sm text-brand-400 font-medium"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showOptional ? 'Hide' : 'Show'} optional fields
          </button>
        </motion.div>

        {/* Rules (optional) */}
        {showOptional && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-tg-text">
                Resolution Rules
              </label>
              <p className="text-xs text-tg-hint">
                Define exactly how this market should be resolved
              </p>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Market resolves YES if... Market resolves NO if..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors resize-none"
              />
              <div className="text-xs text-tg-hint text-right">
                {rules.length}/2000
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-tg-text">
                Resolution Source
              </label>
              <p className="text-xs text-tg-hint">
                Official source to verify the outcome
              </p>
              <input
                type="text"
                value={resolutionSource}
                onChange={(e) => setResolutionSource(e.target.value)}
                placeholder="e.g., Official ICC website (icc-cricket.com)"
                maxLength={500}
                className="w-full px-4 py-3 bg-white/[0.03] rounded-xl text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors"
              />
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-danger/10 rounded-xl border border-danger/20">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Fee breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 space-y-2"
        >
          <div className="text-xs font-medium text-tg-hint mb-2">Fee Distribution</div>
          <FeeRow label="Staker rewards (60%)" value="6,000 HNCH" />
          <FeeRow label="Creator rebate (25%)" value="2,500 HNCH" highlight />
          <FeeRow label="Treasury (10%)" value="1,000 HNCH" />
          <FeeRow label="Resolver reward (5%)" value="500 HNCH" />
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-sm text-tg-hint">Connect your wallet to create a market</p>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="w-full px-6 py-4 bg-brand-400 hover:bg-brand-500 active:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isSubmitting
                ? 'Creating Market...'
                : `Create Market (${MARKET_CREATION_FEE_HNCH.toLocaleString()} HNCH)`
              }
            </button>
          )}
          <p className="text-xs text-tg-hint text-center mt-3">
            You'll receive 2,500 HNCH back after the market resolves
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeeRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-tg-hint">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-success' : 'text-tg-text'}`}>
        {value}
      </span>
    </div>
  );
}
