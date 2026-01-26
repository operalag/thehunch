import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { CONTRACTS } from '../config/contracts';
import { getNetworkConfig, getTonapiHeaders } from '../config/networks';

// Get API URL from network config
const getTonapiUrl = () => getNetworkConfig().tonapiUrl;

// Helper: Convert address to non-bounceable format for TONAPI queries
// TONAPI accepts UQ... (non-bounceable) or 0:... (raw), but NOT EQ... (bounceable)
const toNonBounceableAddress = (addressStr: string): string => {
  if (!addressStr) {
    console.log('[StakingInfo] Empty address provided');
    return '';
  }
  try {
    // Parse the address (works with any format: EQ..., UQ..., kQ..., 0:...)
    const addr = Address.parse(addressStr);
    // Return non-bounceable format (UQ... for mainnet, 0Q... for testnet)
    const isTestnet = getNetworkConfig().name === 'testnet';
    const result = addr.toString({ bounceable: false, testOnly: isTestnet });
    console.log('[StakingInfo] Address conversion:', {
      input: addressStr,
      output: result,
      network: isTestnet ? 'testnet' : 'mainnet'
    });
    return result;
  } catch (e) {
    console.error('[StakingInfo] Address parse failed:', addressStr, e);
    // Try returning raw if it looks like raw format
    if (addressStr.includes(':')) {
      console.log('[StakingInfo] Returning raw address as-is');
      return addressStr;
    }
    return addressStr;
  }
};

// 24-hour lock period in seconds
const LOCK_PERIOD_SECONDS = 24 * 60 * 60;

interface StakingInfo {
  totalStaked: string;
  formattedTotalStaked: string;
  userStake: string;
  formattedUserStake: string;
  lockTime: number; // Unix timestamp when stake was locked
  unlockTime: number; // Unix timestamp when unstake becomes available
  canUnstake: boolean;
  timeUntilUnlock: number; // Seconds until unlock (0 if already unlocked)
  // Rewards info
  pendingStakerRewards: string; // Total pending rewards for all stakers
  userPendingRewards: string; // User's proportional share of pending rewards
  formattedUserPendingRewards: string;
  apy: number; // Estimated APY based on pending rewards
  lastDistribution: number; // Unix timestamp of last distribution
  // Epoch info
  currentEpoch: number; // Current epoch number
  epochStart: number; // Unix timestamp when current epoch started
  timeUntilNextEpoch: number; // Seconds until next epoch
  userLastClaimedEpoch: number; // Last epoch the user claimed (-1 if never claimed)
  claimableEpochs: number; // Number of epochs user can claim
  // Fee Distributor availability
  feeDistributorAvailable: boolean; // Whether Fee Distributor contract is working
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStakingInfo(): StakingInfo {
  const address = useTonAddress();
  console.log('[StakingInfo] Hook called, TonConnect address:', address);

  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [userStake, setUserStake] = useState<string>('0');
  const [lockTime, setLockTime] = useState<number>(0);
  const [pendingStakerRewards, setPendingStakerRewards] = useState<string>('0');
  const [lastDistribution, setLastDistribution] = useState<number>(0);
  // Epoch state
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [epochStart, setEpochStart] = useState<number>(0);
  const [timeUntilNextEpoch, setTimeUntilNextEpoch] = useState<number>(0);
  const [userLastClaimedEpoch, setUserLastClaimedEpoch] = useState<number>(-1);
  const [feeDistributorAvailable, setFeeDistributorAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Calculate "now" on each render instead of using state to avoid timer
  const now = Math.floor(Date.now() / 1000);

  const fetchStakingInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch total staked from Master Oracle
      const apiUrl = getTonapiUrl();
      const headers = getTonapiHeaders();
      const networkConfig = getNetworkConfig();
      console.log('[StakingInfo] Network config:', {
        network: networkConfig.name,
        masterOracle: CONTRACTS.MASTER_ORACLE,
        apiUrl: apiUrl,
        hasApiKey: !!headers.Authorization
      });
      const totalResponse = await fetch(
        `${apiUrl}/blockchain/accounts/${CONTRACTS.MASTER_ORACLE}/methods/get_total_staked`,
        { headers }
      );

      if (totalResponse.ok) {
        const totalData = await totalResponse.json();
        // The result is in the stack, first element
        if (totalData.decoded?.success && totalData.decoded?.stack) {
          const stack = totalData.decoded.stack;
          if (stack.length > 0 && stack[0].type === 'num') {
            setTotalStaked(stack[0].value || '0');
          }
        } else if (totalData.stack && totalData.stack.length > 0) {
          // Alternative format
          const value = totalData.stack[0];
          if (typeof value === 'object' && value.num) {
            setTotalStaked(value.num);
          } else if (typeof value === 'string') {
            setTotalStaked(value);
          }
        }
      }

      // Fetch user stake info if address is connected (using get_stake_info for amount + lock time)
      if (address) {
        try {
          // Convert address to non-bounceable format (TONAPI rejects bounceable EQ... format)
          const nonBounceableAddr = toNonBounceableAddress(address);
          console.log('[StakingInfo Debug] Address conversion:', { original: address, nonBounceable: nonBounceableAddr });

          // Use the get_stake_info method which returns (stake_amount, lock_time)
          const userResponse = await fetch(
            `${apiUrl}/blockchain/accounts/${CONTRACTS.MASTER_ORACLE}/methods/get_stake_info?args=${encodeURIComponent(nonBounceableAddr)}`,
            { headers }
          );

          console.log('[StakingInfo Debug] API response status:', userResponse.status, userResponse.ok);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('[StakingInfo Debug] get_stake_info response:', userData);

            // Parse the two-value response: (stake_amount, lock_time)
            if (userData.stack && userData.stack.length >= 2) {
              // First value: stake amount - convert hex to decimal if needed
              const stakeValue = userData.stack[0];
              console.log('[StakingInfo Debug] Parsing stakeValue:', stakeValue);
              if (typeof stakeValue === 'object' && stakeValue.num) {
                const numStr = stakeValue.num;
                // Convert hex to decimal string for proper BigInt handling
                const parsed = numStr.startsWith('0x') ? BigInt(numStr).toString() : numStr;
                console.log('[StakingInfo Debug] Setting userStake to:', parsed, '(from:', numStr, ')');
                setUserStake(parsed);
              } else if (typeof stakeValue === 'string') {
                const parsed = stakeValue.startsWith('0x') ? BigInt(stakeValue).toString() : stakeValue;
                console.log('[StakingInfo Debug] Setting userStake (string) to:', parsed);
                setUserStake(parsed);
              } else {
                console.log('[StakingInfo Debug] Could not parse stakeValue, type:', typeof stakeValue);
              }

              // Second value: lock time (Unix timestamp)
              const lockValue = userData.stack[1];
              let lockTimestamp = 0;
              if (typeof lockValue === 'object' && lockValue.num) {
                // Parse hex value like "0x..."
                lockTimestamp = parseInt(lockValue.num, 16) || parseInt(lockValue.num, 10) || 0;
              } else if (typeof lockValue === 'string') {
                lockTimestamp = parseInt(lockValue, 16) || parseInt(lockValue, 10) || 0;
              }
              setLockTime(lockTimestamp);
            } else {
              console.log('[StakingInfo Debug] userData.stack missing or too short:', userData.stack);
            }
          } else {
            console.error('[StakingInfo Debug] API call failed:', userResponse.status, await userResponse.text());
          }
        } catch (userErr) {
          console.error('Failed to fetch user stake:', userErr);
          // Don't set error, just keep userStake at 0
        }
      }

      // Fetch epoch info from Fee Distributor (epoch-based rewards)
      try {
        const epochResponse = await fetch(
          `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_epoch_info`,
          { headers }
        );

        if (epochResponse.ok) {
          const epochData = await epochResponse.json();
          console.log('[StakingInfo Debug] get_epoch_info response:', epochData);

          // Check if Fee Distributor call succeeded (exit_code 0 means success)
          if (epochData.success === false || epochData.exit_code !== 0) {
            console.warn('[StakingInfo] Fee Distributor not available (exit_code:', epochData.exit_code, ')');
            setFeeDistributorAvailable(false);
            // Keep rewards at 0, don't fail the whole fetch
          } else if (epochData.stack && epochData.stack.length >= 4) {
            setFeeDistributorAvailable(true);

            // Parse helper for hex values
            const parseHexNum = (val: any): number => {
              if (typeof val === 'object' && val.num) {
                const numStr = val.num;
                return numStr.startsWith('0x') ? parseInt(numStr, 16) : parseInt(numStr, 10);
              } else if (typeof val === 'string') {
                return val.startsWith('0x') ? parseInt(val, 16) : parseInt(val, 10);
              }
              return 0;
            };

            // current_epoch is at index 0
            setCurrentEpoch(parseHexNum(epochData.stack[0]));

            // epoch_start_time is at index 1
            const epochStartTime = parseHexNum(epochData.stack[1]);
            setEpochStart(epochStartTime);
            setLastDistribution(epochStartTime);

            // current_epoch_rewards is at index 2
            const rewardsValue = epochData.stack[2];
            if (typeof rewardsValue === 'object' && rewardsValue.num) {
              const numStr = rewardsValue.num;
              const parsed = numStr.startsWith('0x')
                ? BigInt(numStr).toString()
                : numStr;
              setPendingStakerRewards(parsed);
            } else if (typeof rewardsValue === 'string') {
              setPendingStakerRewards(rewardsValue);
            }

            // time_until_next is at index 3
            setTimeUntilNextEpoch(parseHexNum(epochData.stack[3]));
          }
        } else {
          console.warn('[StakingInfo] Fee Distributor request failed');
          setFeeDistributorAvailable(false);
        }
      } catch (rewardsErr) {
        console.error('Failed to fetch epoch info:', rewardsErr);
        setFeeDistributorAvailable(false);
        // Don't fail the whole fetch, just keep rewards at 0
      }

      // Fetch user's last claimed epoch if address is connected
      if (address) {
        try {
          // Use non-bounceable format for TONAPI
          const nonBounceableAddr = toNonBounceableAddress(address);
          const claimResponse = await fetch(
            `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_user_claim_info?args=${encodeURIComponent(nonBounceableAddr)}`,
            { headers }
          );

          if (claimResponse.ok) {
            const claimData = await claimResponse.json();
            console.log('[StakingInfo Debug] get_user_claim_info response:', claimData);

            // Stack returns: (last_claimed_epoch) or error if never claimed
            if (claimData.stack && claimData.stack.length >= 1) {
              const lastClaimedValue = claimData.stack[0];
              if (typeof lastClaimedValue === 'object' && lastClaimedValue.num) {
                const numStr = lastClaimedValue.num;
                const parsed = numStr.startsWith('0x') ? parseInt(numStr, 16) : parseInt(numStr, 10);
                setUserLastClaimedEpoch(parsed);
              } else if (typeof lastClaimedValue === 'string') {
                setUserLastClaimedEpoch(parseInt(lastClaimedValue, 16) || parseInt(lastClaimedValue, 10) || -1);
              }
            }
          } else {
            // User has never claimed
            setUserLastClaimedEpoch(-1);
          }
        } catch (claimErr) {
          console.log('[StakingInfo] User has never claimed or error:', claimErr);
          setUserLastClaimedEpoch(-1);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch staking info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch staking info once when address changes - NO automatic refresh
    // User can manually refresh using the refetch function
    if (address) {
      fetchStakingInfo();
    }
  }, [address]);

  // No automatic timer - calculate on render only to prevent memory issues
  // The "now" value is set initially and updated only when fetchStakingInfo is called

  // Format balances (9 decimals for HNCH)
  const formatBalance = (balance: string) => {
    const num = Number(balance) / 1e9;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate unlock timing
  const unlockTime = lockTime > 0 ? lockTime + LOCK_PERIOD_SECONDS : 0;
  const timeUntilUnlock = unlockTime > 0 ? Math.max(0, unlockTime - now) : 0;
  const canUnstake = lockTime > 0 && now >= unlockTime;

  // Calculate user's proportional share of pending rewards
  // userPendingRewards = (pendingStakerRewards * userStake) / totalStaked
  const totalStakedNum = BigInt(totalStaked || '0');
  const userStakeNum = BigInt(userStake || '0');
  const pendingRewardsNum = BigInt(pendingStakerRewards || '0');

  let userPendingRewards = '0';
  if (totalStakedNum > 0n && userStakeNum > 0n) {
    const userShare = (pendingRewardsNum * userStakeNum) / totalStakedNum;
    userPendingRewards = userShare.toString();
  }

  // Calculate APY
  // APY = (annual rewards / total staked) * 100
  // If we have pending rewards and know when they started accumulating,
  // we can estimate the annual rate
  // For now, we'll use a simple formula:
  // If rewards accumulated since last distribution, annualize that rate
  let apy = 0;
  if (totalStakedNum > 0n && pendingRewardsNum > 0n && lastDistribution > 0) {
    const secondsSinceDistribution = now - lastDistribution;
    if (secondsSinceDistribution > 0) {
      // Annualize: (rewards / totalStaked) * (seconds in year / seconds elapsed) * 100
      const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
      // Convert to numbers for percentage calculation (safe since we're dividing)
      const rewardsFloat = Number(pendingRewardsNum) / 1e9;
      const stakedFloat = Number(totalStakedNum) / 1e9;
      const annualizedRewards = (rewardsFloat / secondsSinceDistribution) * SECONDS_PER_YEAR;
      apy = (annualizedRewards / stakedFloat) * 100;
    }
  }

  // Calculate claimable epochs
  // User can claim from (lastClaimedEpoch + 1) to (currentEpoch - 1)
  // Note: Current epoch is still accumulating, so not claimable yet
  let claimableEpochs = 0;
  if (currentEpoch > 0) {
    const firstClaimableEpoch = userLastClaimedEpoch < 0 ? 0 : userLastClaimedEpoch + 1;
    const lastClaimableEpoch = currentEpoch - 1; // Current epoch still in progress
    if (lastClaimableEpoch >= firstClaimableEpoch) {
      claimableEpochs = Math.min(30, lastClaimableEpoch - firstClaimableEpoch + 1); // Max 30 per tx
    }
  }

  // Debug log to trace final values
  console.log('[StakingInfo] Returning values:', {
    userStake,
    formattedUserStake: formatBalance(userStake),
    loading,
    address
  });

  return {
    totalStaked,
    formattedTotalStaked: formatBalance(totalStaked),
    userStake,
    formattedUserStake: formatBalance(userStake),
    lockTime,
    unlockTime,
    canUnstake,
    timeUntilUnlock,
    // Rewards info
    pendingStakerRewards,
    userPendingRewards,
    formattedUserPendingRewards: formatBalance(userPendingRewards),
    apy,
    lastDistribution,
    // Epoch info
    currentEpoch,
    epochStart,
    timeUntilNextEpoch,
    userLastClaimedEpoch,
    claimableEpochs,
    // Fee Distributor availability
    feeDistributorAvailable,
    loading,
    error,
    refetch: fetchStakingInfo,
  };
}
