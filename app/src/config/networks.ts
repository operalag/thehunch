// Network-specific configuration for HUNCH Oracle Protocol
// This file defines contract addresses for testnet and mainnet deployments
// Network can be switched at runtime via localStorage

export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  name: string;
  displayName: string;
  chainId: string;
  explorerUrl: string;
  tonapiUrl: string;
  contracts: {
    HNCH_JETTON_MASTER: string;
    MASTER_ORACLE: string;
    FEE_DISTRIBUTOR: string;
  };
  // TonConnect manifest URL
  manifestUrl: string;
}

// Testnet Configuration - V6.2 deployed 2026-01-25 (CRITICAL: fixed stake_snapshots dict loading)
export const TESTNET_CONFIG: NetworkConfig = {
  name: 'testnet',
  displayName: 'Testnet',
  chainId: '-3',
  explorerUrl: 'https://testnet.tonviewer.com',
  tonapiUrl: 'https://testnet.tonapi.io/v2',
  contracts: {
    HNCH_JETTON_MASTER: 'kQDiGlipbnCEHokWD7984TwKSjy52X5O_omWhVbw5FH4jeWf',
    MASTER_ORACLE: 'kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf',
    FEE_DISTRIBUTOR: 'kQAeRl5W6SpCoQwjXzFz-iYDNI8Td8XC4O0K3rmYNvoM9LVF',
  },
  manifestUrl: 'https://www.thehunch.business/tonconnect-manifest.json',
};

// Mainnet Configuration - V6.3 deployed 2026-01-27 (FIXED: Fee Distributor master_address)
export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  displayName: 'Mainnet',
  chainId: '-239',
  explorerUrl: 'https://tonviewer.com',
  tonapiUrl: 'https://tonapi.io/v2',
  contracts: {
    HNCH_JETTON_MASTER: 'EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb',
    MASTER_ORACLE: 'EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J',
    FEE_DISTRIBUTOR: 'EQBplZMDqiykFOIcME0LtYwe55p1SJ9YxKNjXnPs7n6mVHxE',  // Redeployed with correct master_address
  },
  manifestUrl: 'https://www.thehunch.business/tonconnect-manifest.json',
};

// Storage key for network preference
const NETWORK_STORAGE_KEY = 'hunch_network';

// Get current network from localStorage (defaults to mainnet)
export const getCurrentNetwork = (): NetworkType => {
  if (typeof window === 'undefined') return 'mainnet';

  const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
  if (stored === 'testnet' || stored === 'mainnet') {
    return stored;
  }
  return 'mainnet'; // Default to mainnet
};

// Set network and reload page to reinitialize connections
export const setNetwork = (network: NetworkType): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(NETWORK_STORAGE_KEY, network);
  // Reload to reinitialize all connections with new network
  window.location.reload();
};

// Current network (evaluated at module load time)
export const CURRENT_NETWORK: NetworkType = getCurrentNetwork();

// Get current network configuration
export const getNetworkConfig = (): NetworkConfig => {
  return CURRENT_NETWORK === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
};

// Check if we're on mainnet
export const isMainnet = (): boolean => CURRENT_NETWORK === 'mainnet';

// Check if we're on testnet
export const isTestnet = (): boolean => CURRENT_NETWORK === 'testnet';

// Get explorer link for an address
export const getExplorerLink = (address: string): string => {
  const config = getNetworkConfig();
  return `${config.explorerUrl}/${address}`;
};

// Get the other network's name
export const getOtherNetworkName = (): string => {
  return CURRENT_NETWORK === 'mainnet' ? 'Testnet' : 'Mainnet';
};

// Get TONAPI key from environment
export const getTonapiKey = (): string | undefined => {
  return import.meta.env.VITE_TONAPI_KEY;
};

// Get headers for TONAPI requests (includes API key if available)
export const getTonapiHeaders = (): Record<string, string> => {
  const key = getTonapiKey();
  if (key) {
    return { 'Authorization': `Bearer ${key}` };
  }
  return {};
};

// Get Supabase configuration from environment
export const getSupabaseConfig = () => {
  return {
    url: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  };
};
