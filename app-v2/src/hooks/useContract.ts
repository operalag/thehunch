import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { CONTRACTS } from '../config/contracts';
import { getNetworkConfig, getTonapiHeaders } from '../config/networks';

// Op codes from contracts
const OP_CODES = {
  // Master Oracle
  CREATE_INSTANCE: 0x01,
  STAKE: 0x03,
  UNSTAKE: 0x04,
  CLAIM_STAKER_REWARDS: 0x09,
  // Oracle Instance
  PROPOSE: 0x10,
  CHALLENGE: 0x11,
  SETTLE: 0x13,
  CLAIM_REWARD: 0x14,
  // Fee Distributor
  CLAIM_CREATOR_REBATE: 0x34,
  CLAIM_RESOLVER_REWARD: 0x37, // v1.1: Resolver reward (5% of market fee)
  // Veto Guard
  CAST_VETO: 0x41,
  FINALIZE_VOTE: 0x42,
  COUNTER_VETO: 0x44,
  // Jetton
  TRANSFER: 0xf8a7ea5,
};

// Minimum bond amount: 10,000 HNCH
const MIN_BOND_HNCH = 10000;
// Market creation fee: 10,000 HNCH (v1.1)
const MARKET_CREATION_FEE_HNCH = 10000;

export function useContract() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userAddress = useTonAddress();

  // Get user's jetton wallet address from TonAPI
  const getJettonWalletAddress = async (): Promise<string | null> => {
    if (!userAddress) return null;

    try {
      const config = getNetworkConfig();
      const apiUrl = config.tonapiUrl;
      const jettonMaster = config.contracts.HNCH_JETTON_MASTER;
      const isTestnet = config.name === 'testnet';

      console.log(`[getJettonWallet] Fetching for ${userAddress}`);
      console.log(`[getJettonWallet] Jetton: ${jettonMaster}`);

      const headers = getTonapiHeaders();
      const response = await fetch(
        `${apiUrl}/accounts/${userAddress}/jettons/${jettonMaster}`,
        { headers }
      );

      if (!response.ok) {
        console.log(`[getJettonWallet] Response not OK: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log(`[getJettonWallet] Response:`, data);

      const rawAddress = data.wallet_address?.address;
      if (!rawAddress) {
        console.log(`[getJettonWallet] No wallet_address in response`);
        return null;
      }

      // Convert raw address (0:xxx) to user-friendly format for TonConnect
      const address = Address.parse(rawAddress);
      const friendlyAddress = address.toString({ testOnly: isTestnet, bounceable: true });
      console.log(`[getJettonWallet] Jetton wallet: ${friendlyAddress}`);
      return friendlyAddress;
    } catch (err) {
      console.error(`[getJettonWallet] Error:`, err);
      return null;
    }
  };

  const sendTransaction = async (
    to: string,
    amount: string,
    payload?: string
  ) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // Convert address to user-friendly format for TonConnect
    // TonConnect requires EQ.../UQ... format, not raw 0:... format
    const config = getNetworkConfig();
    const isTestnet = config.name === 'testnet';
    let friendlyAddress: string;
    try {
      const addr = Address.parse(to);
      friendlyAddress = addr.toString({ testOnly: isTestnet, bounceable: true });
      console.log(`[sendTransaction] Converted address: ${to} -> ${friendlyAddress}`);
    } catch (e) {
      console.error(`[sendTransaction] Failed to parse address: ${to}`, e);
      throw new Error(`Invalid address format: ${to}`);
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes (TonConnect max)
      messages: [
        {
          address: friendlyAddress,
          amount: toNano(amount).toString(),
          payload: payload,
        },
      ],
    };

    return tonConnectUI.sendTransaction(transaction);
  };

  // Helper: Send HNCH tokens via Jetton transfer with forward payload
  const sendHnchWithPayload = async (
    destination: string,
    hnchAmount: number,
    forwardPayload: ReturnType<typeof beginCell>
  ) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const jettonWalletAddress = await getJettonWalletAddress();
    if (!jettonWalletAddress) {
      throw new Error('No HNCH balance found. Please ensure you have HNCH tokens.');
    }

    // Convert HNCH amount to nano (9 decimals)
    const amountNano = BigInt(Math.floor(hnchAmount * 1e9));

    // Jetton transfer message (TEP-74)
    const body = beginCell()
      .storeUint(OP_CODES.TRANSFER, 32)
      .storeUint(Date.now(), 64) // query_id
      .storeCoins(amountNano)
      .storeAddress(Address.parse(destination))
      .storeAddress(Address.parse(userAddress)) // response_destination
      .storeBit(0) // no custom_payload
      .storeCoins(toNano('0.1')) // forward_ton_amount for processing
      .storeBit(1) // forward_payload in ref
      .storeRef(forwardPayload.endCell())
      .endCell();

    return sendTransaction(
      jettonWalletAddress,
      '0.2', // TON for gas
      body.toBoc().toString('base64')
    );
  };

  // ============================================
  // MARKET OPERATIONS
  // ============================================

  /**
   * Create a new prediction market (Oracle Instance)
   * Cost: 10,000 HNCH fee + ~0.25 TON for deployment (v1.1)
   * Fee distribution: 60% stakers, 25% creator rebate, 10% treasury, 5% resolver reward
   * @param question - The prediction question (must be YES/NO answerable)
   * @param resolutionDeadline - Unix timestamp after which outcomes can be proposed
   * @param rules - Optional rules for resolution
   * @param resolutionSource - Optional source for resolution verification
   */
  const createMarket = async (
    question: string,
    resolutionDeadline: number,
    rules?: string,
    resolutionSource?: string
  ) => {
    // Build query cell with refs for question, rules, and resolution source
    const queryCell = beginCell()
      .storeUint(resolutionDeadline, 64) // resolution_deadline
      .storeRef(beginCell().storeStringTail(question).endCell()) // question ref
      .storeRef(beginCell().storeStringTail(rules || '').endCell()) // rules ref
      .storeRef(beginCell().storeStringTail(resolutionSource || '').endCell()) // resolution_source ref
      .endCell();

    // Forward payload contains create_instance op + query cell
    const forwardPayload = beginCell()
      .storeUint(OP_CODES.CREATE_INSTANCE, 32)
      .storeUint(Date.now(), 64) // query_id
      .storeRef(queryCell);

    // Send HNCH with forward payload to Master Oracle
    return sendHnchWithPayload(CONTRACTS.MASTER_ORACLE, MARKET_CREATION_FEE_HNCH, forwardPayload);
  };

  /**
   * Propose an outcome for a market
   * Requires: Minimum 10,000 HNCH bond
   * @param instanceAddress - The Oracle Instance contract address
   * @param answer - true for YES, false for NO
   * @param bondAmount - Amount of HNCH to bond (minimum 10,000)
   */
  const proposeOutcome = async (
    instanceAddress: string,
    answer: boolean,
    bondAmount: number
  ) => {
    if (bondAmount < MIN_BOND_HNCH) {
      throw new Error(`Minimum bond is ${MIN_BOND_HNCH.toLocaleString()} HNCH`);
    }

    const forwardPayload = beginCell()
      .storeUint(OP_CODES.PROPOSE, 32)
      .storeUint(Date.now(), 64) // query_id
      .storeInt(answer ? -1 : 0, 1); // true = -1, false = 0 in FunC

    return sendHnchWithPayload(instanceAddress, bondAmount, forwardPayload);
  };

  /**
   * Challenge a proposed outcome
   * Requires: 2x the current bond in HNCH
   * @param instanceAddress - The Oracle Instance contract address
   * @param answer - Your answer (opposite of current proposal)
   * @param bondAmount - Amount of HNCH to bond (must be >= 2x current)
   */
  const challengeOutcome = async (
    instanceAddress: string,
    answer: boolean,
    bondAmount: number
  ) => {
    const forwardPayload = beginCell()
      .storeUint(OP_CODES.CHALLENGE, 32)
      .storeUint(Date.now(), 64) // query_id
      .storeInt(answer ? -1 : 0, 1);

    return sendHnchWithPayload(instanceAddress, bondAmount, forwardPayload);
  };

  /**
   * Settle a market after challenge period expires
   * @param instanceAddress - The Oracle Instance contract address
   */
  const settleMarket = async (instanceAddress: string) => {
    const body = beginCell()
      .storeUint(OP_CODES.SETTLE, 32)
      .storeUint(Date.now(), 64)
      .endCell();

    return sendTransaction(
      instanceAddress,
      '0.1',
      body.toBoc().toString('base64')
    );
  };

  /**
   * Claim reward after market resolution
   * @param instanceAddress - The Oracle Instance contract address
   */
  const claimReward = async (instanceAddress: string) => {
    const body = beginCell()
      .storeUint(OP_CODES.CLAIM_REWARD, 32)
      .storeUint(Date.now(), 64)
      .endCell();

    return sendTransaction(
      instanceAddress,
      '0.1',
      body.toBoc().toString('base64')
    );
  };

  // ============================================
  // STAKING OPERATIONS
  // ============================================

  /**
   * Stake HNCH tokens to earn rewards and participate in governance
   * @param amount - Amount of HNCH to stake
   */
  const stakeTokens = async (amount: string) => {
    const hnchAmount = parseFloat(amount);
    if (isNaN(hnchAmount) || hnchAmount <= 0) {
      throw new Error('Invalid stake amount');
    }

    // Debug: Log the op code being used
    console.log('[Stake Debug] OP_CODES.STAKE =', OP_CODES.STAKE, '(expected: 3)');

    const forwardPayload = beginCell()
      .storeUint(OP_CODES.STAKE, 32)
      .storeUint(Date.now(), 64);

    // Debug: Show the payload being sent
    const payloadCell = forwardPayload.endCell();
    console.log('[Stake Debug] Forward payload BOC:', payloadCell.toBoc().toString('hex'));

    // Rebuild the payload (endCell already called, need fresh builder)
    const forwardPayload2 = beginCell()
      .storeUint(OP_CODES.STAKE, 32)
      .storeUint(Date.now(), 64);

    return sendHnchWithPayload(CONTRACTS.MASTER_ORACLE, hnchAmount, forwardPayload2);
  };

  /**
   * Unstake HNCH tokens (24-hour lock period applies)
   * @param amount - Amount of HNCH to unstake
   */
  const unstakeTokens = async (amount: string) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const amountNano = BigInt(Math.floor(parseFloat(amount) * 1e9));

    const body = beginCell()
      .storeUint(OP_CODES.UNSTAKE, 32)
      .storeUint(Date.now(), 64)
      .storeCoins(amountNano)
      .endCell();

    return sendTransaction(
      CONTRACTS.MASTER_ORACLE,
      '0.1',
      body.toBoc().toString('base64')
    );
  };

  /**
   * Claim staker rewards from the Fee Distributor
   * Sends request to Master Oracle which forwards to Fee Distributor with stake info
   * Rewards are proportional to your stake relative to total staked
   */
  const claimStakerRewards = async () => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const body = beginCell()
      .storeUint(OP_CODES.CLAIM_STAKER_REWARDS, 32)
      .storeUint(Date.now(), 64)
      .endCell();

    return sendTransaction(
      CONTRACTS.MASTER_ORACLE,
      '0.1', // Gas for processing
      body.toBoc().toString('base64')
    );
  };

  /**
   * Claim creator rebate from the Fee Distributor
   * Creator gets 25% of market creation fee back after market resolves
   * @param instanceAddress - The Oracle Instance contract address
   */
  const claimCreatorRebate = async (instanceAddress: string) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const body = beginCell()
      .storeUint(OP_CODES.CLAIM_CREATOR_REBATE, 32)
      .storeUint(Date.now(), 64)
      .storeAddress(Address.parse(instanceAddress))
      .endCell();

    return sendTransaction(
      CONTRACTS.FEE_DISTRIBUTOR,
      '0.1', // Gas for processing
      body.toBoc().toString('base64')
    );
  };

  /**
   * Claim resolver reward from the Fee Distributor (v1.1)
   * Resolver gets 5% of market creation fee (500 HNCH per market)
   * - Unchallenged: Proposer is resolver
   * - Challenged: Last challenger is resolver
   * - DAO Veto: Treasury is resolver (reward goes to treasury)
   * @param instanceAddress - The Oracle Instance contract address
   */
  const claimResolverReward = async (instanceAddress: string) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    const body = beginCell()
      .storeUint(OP_CODES.CLAIM_RESOLVER_REWARD, 32)
      .storeUint(Date.now(), 64)
      .storeAddress(Address.parse(instanceAddress))
      .endCell();

    return sendTransaction(
      CONTRACTS.FEE_DISTRIBUTOR,
      '0.1', // Gas for processing
      body.toBoc().toString('base64')
    );
  };

  // ============================================
  // VETO OPERATIONS (DAO Dispute Resolution)
  // ============================================

  /**
   * Cast a veto against the current proposed answer
   * Requires: >2% of total supply staked for 24+ hours
   * @param vetoGuardAddress - The VetoGuard contract address
   * @param stakeAmount - Your staked HNCH amount (in nano)
   * @param lockTime - Unix timestamp when you staked
   */
  const castVeto = async (
    vetoGuardAddress: string,
    stakeAmount: bigint,
    lockTime: number
  ) => {
    const body = beginCell()
      .storeUint(OP_CODES.CAST_VETO, 32)
      .storeUint(Date.now(), 64)
      .storeCoins(stakeAmount)
      .storeUint(lockTime, 64)
      .endCell();

    return sendTransaction(
      vetoGuardAddress,
      '0.05',
      body.toBoc().toString('base64')
    );
  };

  /**
   * Counter-veto to support the current proposed answer
   * Neutralizes one existing veto
   * Requires: >2% of total supply staked for 24+ hours
   * @param vetoGuardAddress - The VetoGuard contract address
   * @param stakeAmount - Your staked HNCH amount (in nano)
   * @param lockTime - Unix timestamp when you staked
   */
  const counterVeto = async (
    vetoGuardAddress: string,
    stakeAmount: bigint,
    lockTime: number
  ) => {
    const body = beginCell()
      .storeUint(OP_CODES.COUNTER_VETO, 32)
      .storeUint(Date.now(), 64)
      .storeCoins(stakeAmount)
      .storeUint(lockTime, 64)
      .endCell();

    return sendTransaction(
      vetoGuardAddress,
      '0.05',
      body.toBoc().toString('base64')
    );
  };

  /**
   * Finalize the veto vote after 48h period ends
   * Anyone can call this to resolve the dispute
   * @param vetoGuardAddress - The VetoGuard contract address
   */
  const finalizeVeto = async (vetoGuardAddress: string) => {
    const body = beginCell()
      .storeUint(OP_CODES.FINALIZE_VOTE, 32)
      .storeUint(Date.now(), 64)
      .endCell();

    return sendTransaction(
      vetoGuardAddress,
      '0.1',
      body.toBoc().toString('base64')
    );
  };

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Update Fee Distributor address on Master Oracle (admin only)
   * Required when Fee Distributor is redeployed
   * @param newFeeDistributorAddress - The new Fee Distributor contract address
   */
  const setFeeDistributor = async (newFeeDistributorAddress: string) => {
    const body = beginCell()
      .storeUint(0x0E, 32) // op::set_fee_distributor
      .storeUint(Date.now(), 64)
      .storeAddress(Address.parse(newFeeDistributorAddress))
      .endCell();

    return sendTransaction(
      CONTRACTS.MASTER_ORACLE,
      '0.05',
      body.toBoc().toString('base64')
    );
  };

  /**
   * Mint HNCH tokens (admin only)
   */
  const mintTokens = async (toAddress: string, amount: bigint) => {
    const body = beginCell()
      .storeUint(21, 32) // op::mint
      .storeUint(0, 64)
      .storeAddress(Address.parse(toAddress))
      .storeCoins(amount)
      .storeRef(beginCell().endCell())
      .endCell();

    return sendTransaction(
      CONTRACTS.HNCH_JETTON_MASTER,
      '0.1',
      body.toBoc().toString('base64')
    );
  };

  return {
    wallet,
    userAddress,
    // Market operations
    createMarket,
    proposeOutcome,
    challengeOutcome,
    settleMarket,
    claimReward,
    // Staking operations
    stakeTokens,
    unstakeTokens,
    claimStakerRewards,
    claimCreatorRebate,
    claimResolverReward, // v1.1
    // Veto operations
    castVeto,
    counterVeto,
    finalizeVeto,
    // Admin
    setFeeDistributor,
    mintTokens,
    // Utilities
    sendTransaction,
    getJettonWalletAddress,
    // Constants
    MIN_BOND_HNCH,
    MARKET_CREATION_FEE_HNCH,
  };
}
