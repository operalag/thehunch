import { getNetworkConfig, getExplorerLink as getNetworkExplorerLink } from './networks';

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
};

export const FEE_CONFIG = {
  MARKET_CREATION_FEE: 10000,
  STAKER_SHARE: 60,
  CREATOR_SHARE: 25,
  TREASURY_SHARE: 10,
  RESOLVER_SHARE: 5,
} as const;

export const getExplorerLink = getNetworkExplorerLink;
