// Contract configuration - uses network-specific addresses
// Updated 2026-01-12 - Now uses getters to ensure fresh values

import { getNetworkConfig, getExplorerLink as getNetworkExplorerLink } from './networks';

// Use getters to ensure we always get fresh values from network config
// This prevents issues with module caching
export const CONTRACTS = {
  get HNCH_JETTON_MASTER() {
    return getNetworkConfig().contracts.HNCH_JETTON_MASTER;
  },
  get MASTER_ORACLE() {
    return getNetworkConfig().contracts.MASTER_ORACLE;
  },
  get FEE_DISTRIBUTOR() {
    return getNetworkConfig().contracts.FEE_DISTRIBUTOR;
  },
  // Legacy alias for backwards compatibility
  get PRICE_ORACLE() {
    return getNetworkConfig().contracts.MASTER_ORACLE;
  },
};

// Fee Distribution Configuration (v2 - 1B supply)
export const FEE_CONFIG = {
  MARKET_CREATION_FEE: 10000,  // HNCH
  STAKER_SHARE: 60,           // 60% to stakers
  CREATOR_SHARE: 25,          // 25% creator rebate
  TREASURY_SHARE: 10,         // 10% to treasury
  RESOLVER_SHARE: 5,          // 5% resolver reward
} as const;

// Use getters for network info too
export const getNetwork = () => getNetworkConfig().name;
export const getExplorerUrl = () => getNetworkConfig().explorerUrl;

// Legacy exports
export const NETWORK = getNetworkConfig().name;
export const EXPLORER_URL = getNetworkConfig().explorerUrl;

export const getExplorerLink = getNetworkExplorerLink;
