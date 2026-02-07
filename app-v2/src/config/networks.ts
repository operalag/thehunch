// Network-specific configuration for HUNCH Oracle Protocol
// Shared with app/ — contract addresses for testnet and mainnet

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
  manifestUrl: string;
}

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

export const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  displayName: 'Mainnet',
  chainId: '-239',
  explorerUrl: 'https://tonviewer.com',
  tonapiUrl: 'https://tonapi.io/v2',
  contracts: {
    HNCH_JETTON_MASTER: 'EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb',
    MASTER_ORACLE: 'EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J',
    FEE_DISTRIBUTOR: 'EQAJmXOgU62n3hkN6RcZv1I5MIdqFqK6sFit3Z7bktKj61QU',
  },
  manifestUrl: 'https://www.thehunch.business/tonconnect-manifest.json',
};

const NETWORK_STORAGE_KEY = 'hunch_network';

export const getCurrentNetwork = (): NetworkType => {
  if (typeof window === 'undefined') return 'mainnet';
  const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
  if (stored === 'testnet' || stored === 'mainnet') return stored;
  return 'mainnet';
};

export const setNetwork = (network: NetworkType): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NETWORK_STORAGE_KEY, network);
  window.location.reload();
};

export const CURRENT_NETWORK: NetworkType = getCurrentNetwork();

export const getNetworkConfig = (): NetworkConfig => {
  return CURRENT_NETWORK === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
};

export const isMainnet = (): boolean => CURRENT_NETWORK === 'mainnet';
export const isTestnet = (): boolean => CURRENT_NETWORK === 'testnet';

export const getExplorerLink = (address: string): string => {
  const config = getNetworkConfig();
  return `${config.explorerUrl}/${address}`;
};

export const getTonapiKey = (): string | undefined => {
  return import.meta.env.VITE_TONAPI_KEY;
};

export const getTonapiHeaders = (): Record<string, string> => {
  const key = getTonapiKey();
  if (key) return { Authorization: `Bearer ${key}` };
  return {};
};

export const getSupabaseConfig = () => ({
  url: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
  anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
});
