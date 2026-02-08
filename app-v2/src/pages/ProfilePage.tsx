import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { getTelegramUser, haptic } from '@/lib/telegram';
import { truncateAddress } from '@/lib/utils';
import { getNetworkConfig } from '@/config/networks';

export function ProfilePage({ onOpenAdmin }: { onOpenAdmin?: () => void }) {
  const address = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const telegramUser = getTelegramUser();
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const config = getNetworkConfig();
  const currentNetwork = config.name;

  const handleCopyAddress = async () => {
    if (!address) return;

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

  const handleDisconnect = async () => {
    haptic.medium();
    await tonConnectUI.disconnect();
    haptic.success();
  };

  const handleNetworkToggle = (newNetwork: 'testnet' | 'mainnet') => {
    haptic.selection();
    setNetwork(newNetwork);
    // TODO: Implement network switching logic
    // This would require app restart or dynamic config switching
  };

  const openExplorer = () => {
    if (!address) return;
    haptic.light();
    const explorerUrl =
      currentNetwork === 'testnet'
        ? `https://testnet.tonviewer.com/${address}`
        : `https://tonviewer.com/${address}`;
    window.open(explorerUrl, '_blank');
  };

  const openTelegram = () => {
    haptic.light();
    window.open('https://t.me/hunchoracle', '_blank');
  };

  const openFaq = () => {
    haptic.light();
    window.open('https://docs.hunchoracle.com', '_blank');
  };

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

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-tg-text mb-1">Profile</h1>
          <p className="text-sm text-tg-hint">Manage your account and settings</p>
        </motion.div>

        {/* Telegram User Info */}
        {telegramUser && (
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-4">
              {telegramUser.photo_url ? (
                <img
                  src={telegramUser.photo_url}
                  alt={telegramUser.first_name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-400 flex items-center justify-center text-white text-2xl font-bold">
                  {telegramUser.first_name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-tg-text">
                  {telegramUser.first_name}
                  {telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}
                </h3>
                {telegramUser.username && (
                  <p className="text-sm text-tg-hint">@{telegramUser.username}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Wallet Info */}
        {address && (
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-tg-text">Wallet Address</h3>

            <div className="flex items-center gap-3">
              <div className="flex-1 px-3 py-2 bg-surface rounded-lg font-mono text-sm text-tg-text">
                {truncateAddress(address, 6)}
              </div>

              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-surface-hover active:bg-surface-active rounded-lg transition-colors"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <button
                onClick={openExplorer}
                className="p-2 hover:bg-surface-hover active:bg-surface-active rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Network Switcher */}
        <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-tg-text">Network</h3>

          <div className="flex gap-3">
            <button
              onClick={() => handleNetworkToggle('testnet')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                currentNetwork === 'testnet'
                  ? 'bg-brand-400 text-white'
                  : 'bg-surface text-tg-hint hover:bg-surface-hover'
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => handleNetworkToggle('mainnet')}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                currentNetwork === 'mainnet'
                  ? 'bg-brand-400 text-white'
                  : 'bg-surface text-tg-hint hover:bg-surface-hover'
              }`}
              disabled
            >
              Mainnet
              <span className="ml-2 text-xs opacity-70">(Soon)</span>
            </button>
          </div>

          <p className="text-xs text-tg-hint">
            Current network: <span className="text-tg-text font-medium capitalize">{currentNetwork}</span>
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-sm font-semibold text-tg-text">Quick Links</h3>

          <button
            onClick={openTelegram}
            className="w-full glass-card p-4 flex items-center justify-between hover:bg-surface-hover active:bg-surface-active transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.03-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.499-.187.937.11.78.89z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-tg-text">Join Community</div>
                <div className="text-xs text-tg-hint">@hunchoracle</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={openFaq}
            className="w-full glass-card p-4 flex items-center justify-between hover:bg-surface-hover active:bg-surface-active transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-tg-text">FAQ & Docs</div>
                <div className="text-xs text-tg-hint">Learn how it works</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Admin Panel */}
        {address && onOpenAdmin && (
          <motion.div variants={itemVariants}>
            <button
              onClick={() => { haptic.light(); onOpenAdmin(); }}
              className="w-full glass-card p-4 flex items-center justify-between hover:bg-surface-hover active:bg-surface-active transition-colors border border-danger/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-danger">Admin Panel</div>
                  <div className="text-xs text-tg-hint">Contract management</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-tg-hint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* App Info */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-tg-hint">App Version</span>
            <span className="text-sm font-mono text-tg-text">v3.0.0</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-tg-hint">Smart Contracts</span>
            <span className="text-sm font-mono text-success">V6.6</span>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-tg-hint text-center">
              Built with Claude Code
            </p>
          </div>
        </motion.div>

        {/* Disconnect button */}
        {address && (
          <motion.div variants={itemVariants}>
            <button
              onClick={handleDisconnect}
              className="w-full px-6 py-3 bg-danger/10 hover:bg-danger/20 active:bg-danger/30 text-danger font-semibold rounded-xl transition-colors border border-danger/20"
            >
              Disconnect Wallet
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
