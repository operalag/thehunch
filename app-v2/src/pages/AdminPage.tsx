import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { useContract } from '@/hooks/useContract';
import { useMarketsCache } from '@/hooks/useMarketsCache';
import { CONTRACTS } from '@/config/contracts';
import { getNetworkConfig, getExplorerLink } from '@/config/networks';
import { truncateAddress } from '@/lib/utils';
import { haptic } from '@/lib/telegram';

type StatusType = { message: string; isError: boolean } | null;

export function AdminPage({ onBack }: { onBack: () => void }) {
  const address = useTonAddress();
  const wallet = useTonWallet();
  const { setFeeDistributor, mintTokens } = useContract();
  const { syncMarkets, updateMarketStatus } = useMarketsCache();

  const networkConfig = getNetworkConfig();
  const isConnected = !!wallet && !!address;

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
        <h1 className="text-lg font-semibold text-danger">Admin Panel</h1>
        <span className="px-2 py-0.5 bg-danger/20 text-danger text-[10px] font-bold rounded">
          RESTRICTED
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-danger/10 rounded-2xl border border-danger/20"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-danger">Admin-only operations</p>
              <p className="text-xs text-tg-hint mt-1">
                These functions require the contract admin wallet. Unauthorized transactions will fail on-chain.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Network & Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-tg-text">Environment</h3>
          <InfoRow label="Network" value={networkConfig.displayName} />
          <InfoRow
            label="Wallet"
            value={address ? truncateAddress(address, 6) : 'Not connected'}
            mono
          />
        </motion.div>

        {/* Contract Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-tg-text">Contract Addresses</h3>
          <ContractLink label="HNCH Jetton Master" address={CONTRACTS.HNCH_JETTON_MASTER} />
          <ContractLink label="Master Oracle" address={CONTRACTS.MASTER_ORACLE} />
          <ContractLink label="Fee Distributor" address={CONTRACTS.FEE_DISTRIBUTOR} />
        </motion.div>

        {/* Set Fee Distributor */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SetFeeDistributorSection
            currentAddress={CONTRACTS.FEE_DISTRIBUTOR}
            onSubmit={setFeeDistributor}
            disabled={!isConnected}
          />
        </motion.div>

        {/* Mint Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MintTokensSection
            onSubmit={mintTokens}
            disabled={!isConnected}
          />
        </motion.div>

        {/* Sync Markets Cache */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SyncCacheSection
            onSync={syncMarkets}
            onUpdateStatus={updateMarketStatus}
            network={networkConfig.name as 'mainnet' | 'testnet'}
          />
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-tg-hint">{label}</span>
      <span className={`text-xs font-medium text-tg-text ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function ContractLink({ label, address }: { label: string; address: string }) {
  const url = getExplorerLink(address);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    haptic.light();
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-tg-hint flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-brand-400 hover:text-brand-300 truncate max-w-[180px]"
        >
          {truncateAddress(address, 6)}
        </a>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/5 rounded transition-colors flex-shrink-0"
          title="Copy address"
        >
          <svg className="w-3.5 h-3.5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SetFeeDistributorSection({
  currentAddress,
  onSubmit,
  disabled,
}: {
  currentAddress: string;
  onSubmit: (addr: string) => Promise<any>;
  disabled: boolean;
}) {
  const [addr, setAddr] = useState(currentAddress);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusType>(null);

  const handleSubmit = async () => {
    if (!addr.trim() || loading) return;
    setLoading(true);
    setStatus(null);
    haptic.medium();
    try {
      await onSubmit(addr.trim());
      setStatus({ message: 'Transaction submitted. Verify on explorer in ~15s.', isError: false });
      haptic.success();
    } catch (err: any) {
      setStatus({ message: err.message || 'Transaction failed', isError: true });
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4 border border-danger/20">
      <div>
        <h3 className="text-sm font-semibold text-tg-text">Set Fee Distributor</h3>
        <p className="text-xs text-tg-hint mt-1">
          Updates the Fee Distributor address on the Master Oracle contract (op 0x0E).
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-tg-hint">New Fee Distributor Address</label>
        <input
          type="text"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="EQ... or kQ..."
          className="w-full px-3 py-2.5 bg-white/[0.03] rounded-xl text-sm font-mono text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-danger focus:outline-none transition-colors"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !addr.trim()}
        className="w-full px-4 py-3 bg-danger/20 hover:bg-danger/30 active:bg-danger/40 text-danger font-semibold rounded-xl transition-colors border border-danger/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Set Fee Distributor'}
      </button>
      <StatusMessage status={status} />
    </div>
  );
}

function MintTokensSection({
  onSubmit,
  disabled,
}: {
  onSubmit: (toAddress: string, amount: bigint) => Promise<any>;
  disabled: boolean;
}) {
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusType>(null);

  const handleSubmit = async () => {
    if (!toAddr.trim() || !amount || loading) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus({ message: 'Invalid amount', isError: true });
      haptic.error();
      return;
    }
    setLoading(true);
    setStatus(null);
    haptic.medium();
    try {
      const amountNano = BigInt(Math.floor(amountNum * 1e9));
      await onSubmit(toAddr.trim(), amountNano);
      setStatus({ message: `Mint transaction submitted for ${amountNum.toLocaleString()} HNCH`, isError: false });
      haptic.success();
    } catch (err: any) {
      setStatus({ message: err.message || 'Transaction failed', isError: true });
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4 border border-danger/20">
      <div>
        <h3 className="text-sm font-semibold text-tg-text">Mint HNCH Tokens</h3>
        <p className="text-xs text-tg-hint mt-1">
          Mint new HNCH tokens to a specified address. Jetton Master admin only.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-tg-hint">Recipient Address</label>
          <input
            type="text"
            value={toAddr}
            onChange={(e) => setToAddr(e.target.value)}
            placeholder="EQ... or UQ..."
            className="w-full px-3 py-2.5 bg-white/[0.03] rounded-xl text-sm font-mono text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-danger focus:outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-tg-hint">Amount (HNCH)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            className="w-full px-3 py-2.5 bg-white/[0.03] rounded-xl text-sm text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-danger focus:outline-none transition-colors"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !toAddr.trim() || !amount}
        className="w-full px-4 py-3 bg-danger/20 hover:bg-danger/30 active:bg-danger/40 text-danger font-semibold rounded-xl transition-colors border border-danger/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Minting...' : 'Mint Tokens'}
      </button>
      <StatusMessage status={status} />
    </div>
  );
}

function SyncCacheSection({
  onSync,
  onUpdateStatus,
  network,
}: {
  onSync: (network?: 'mainnet' | 'testnet' | 'both', force?: boolean) => Promise<{ success: boolean; totalMarketsAdded: number; error?: string }>;
  onUpdateStatus: (marketAddress: string, network?: 'mainnet' | 'testnet') => Promise<{ success: boolean; error?: string }>;
  network: 'mainnet' | 'testnet';
}) {
  const [syncLoading, setSyncLoading] = useState(false);
  const [updateAddr, setUpdateAddr] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [status, setStatus] = useState<StatusType>(null);

  const handleSync = async (force: boolean) => {
    setSyncLoading(true);
    setStatus(null);
    haptic.medium();
    try {
      const result = await onSync(network, force);
      if (result.success) {
        setStatus({
          message: `Synced successfully. ${result.totalMarketsAdded} markets added/updated.`,
          isError: false,
        });
        haptic.success();
      } else {
        setStatus({ message: result.error || 'Sync failed', isError: true });
        haptic.error();
      }
    } catch (err: any) {
      setStatus({ message: err.message || 'Sync failed', isError: true });
      haptic.error();
    } finally {
      setSyncLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateAddr.trim() || updateLoading) return;
    setUpdateLoading(true);
    setStatus(null);
    haptic.medium();
    try {
      const result = await onUpdateStatus(updateAddr.trim(), network);
      if (result.success) {
        setStatus({ message: 'Market status updated in cache.', isError: false });
        haptic.success();
      } else {
        setStatus({ message: result.error || 'Update failed', isError: true });
        haptic.error();
      }
    } catch (err: any) {
      setStatus({ message: err.message || 'Update failed', isError: true });
      haptic.error();
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-tg-text">Supabase Cache</h3>
        <p className="text-xs text-tg-hint mt-1">
          Sync market data from blockchain to Supabase cache, or refresh a single market's status.
        </p>
      </div>

      {/* Sync buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSync(false)}
          disabled={syncLoading}
          className="px-4 py-3 bg-brand-400/20 hover:bg-brand-400/30 active:bg-brand-400/40 text-brand-400 font-semibold rounded-xl transition-colors border border-brand-400/30 text-sm disabled:opacity-50"
        >
          {syncLoading ? 'Syncing...' : 'Sync New'}
        </button>
        <button
          onClick={() => handleSync(true)}
          disabled={syncLoading}
          className="px-4 py-3 bg-warning/20 hover:bg-warning/30 active:bg-warning/40 text-warning font-semibold rounded-xl transition-colors border border-warning/30 text-sm disabled:opacity-50"
        >
          {syncLoading ? 'Syncing...' : 'Force Sync'}
        </button>
      </div>

      {/* Update single market */}
      <div className="pt-2 border-t border-white/5 space-y-3">
        <label className="text-xs text-tg-hint">Update Single Market Status</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={updateAddr}
            onChange={(e) => setUpdateAddr(e.target.value)}
            placeholder="Market contract address"
            className="flex-1 px-3 py-2.5 bg-white/[0.03] rounded-xl text-sm font-mono text-tg-text placeholder:text-tg-hint border border-white/10 focus:border-brand-400 focus:outline-none transition-colors"
          />
          <button
            onClick={handleUpdateStatus}
            disabled={updateLoading || !updateAddr.trim()}
            className="px-4 py-2.5 bg-brand-400/20 hover:bg-brand-400/30 text-brand-400 font-medium rounded-xl transition-colors border border-brand-400/30 text-sm flex-shrink-0 disabled:opacity-50"
          >
            {updateLoading ? '...' : 'Update'}
          </button>
        </div>
      </div>

      <StatusMessage status={status} />
    </div>
  );
}

function StatusMessage({ status }: { status: StatusType }) {
  if (!status) return null;
  return (
    <div className={`p-3 rounded-xl border text-sm ${
      status.isError
        ? 'bg-danger/10 border-danger/20 text-danger'
        : 'bg-success/10 border-success/20 text-success'
    }`}>
      {status.message}
    </div>
  );
}
