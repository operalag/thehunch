import { useState, useEffect, useCallback, useRef } from 'react';
import { Cell, Address } from '@ton/core';
import { CONTRACTS } from '../config/contracts';
import { getNetworkConfig, getTonapiHeaders } from '../config/networks';

// Get API URL and network info from config
const getTonapiUrl = () => getNetworkConfig().tonapiUrl;
const isTestnet = () => getNetworkConfig().name === 'testnet';

// Helper: convert raw address (0:...) to friendly format (EQ.../kQ...) for TonAPI
const toFriendlyAddress = (rawAddress: string, testnet = true): string => {
  try {
    const addr = Address.parseRaw(rawAddress);
    return addr.toString({ testOnly: testnet, bounceable: true });
  } catch {
    return rawAddress; // Return as-is if parsing fails
  }
};

// 5 minutes delay after resolution deadline before proposals can be made
const PROPOSAL_DELAY_SECONDS = 300;

// Rate limiting settings - TONAPI free tier is ~1 req/sec, with API key it's 10 req/sec
// Without API key, we need to be very conservative to avoid rate limits
// To get a free API key: sign up at https://tonconsole.com/ and set VITE_TONAPI_KEY env var
const hasApiKey = !!getTonapiHeaders()['Authorization'];
console.log('[Markets] TONAPI key configured:', hasApiKey ? 'yes' : 'no (using conservative rate limits)');
const BATCH_SIZE = hasApiKey ? 10 : 2; // 2 parallel for free tier, 10 with API key
const BATCH_DELAY_MS = hasApiKey ? 1100 : 2500; // 2.5s between batches for free tier
const API_DELAY_MS = hasApiKey ? 50 : 500; // 500ms between sequential calls for free tier
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = hasApiKey ? 1000 : 2000; // 2s initial retry for free tier

// Helper: delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Execute requests in parallel batches (10 per second)
async function fetchInBatches<T>(
  items: T[],
  fetchFn: (item: T) => Promise<any>,
  onProgress?: (loaded: number, total: number) => void
): Promise<any[]> {
  const results: any[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    // Execute batch in parallel
    const batchResults = await Promise.all(
      batch.map(item => fetchFn(item).catch(err => {
        console.log('[Markets] Batch item failed:', err);
        return null;
      }))
    );

    results.push(...batchResults);

    // Update progress
    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, total), total);
    }

    // Wait before next batch (unless it's the last batch)
    if (i + BATCH_SIZE < items.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return results;
}

// Helper: fetch with retry and rate limiting
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  retryDelay = RETRY_DELAY_MS
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (response.status === 429) {
      // Rate limited - wait and retry
      if (retries > 0) {
        console.log(`[Markets] Rate limited, retrying in ${retryDelay}ms... (${retries} retries left)`);
        await delay(retryDelay);
        return fetchWithRetry(url, options, retries - 1, retryDelay * 2);
      }
      throw new Error('Rate limit exceeded after retries');
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`[Markets] Request failed, retrying in ${retryDelay}ms... (${retries} retries left)`);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1, retryDelay * 2);
    }
    throw error;
  }
}

export type MarketCategory = 'cricket' | 'champions_league' | 'soccer_world_cup' | 'winter_olympics' | 'other';

export interface Market {
  id: number;
  address: string;
  question: string;
  rules?: string;
  resolutionSource?: string;
  resolutionDeadline: number;
  proposalStartTime: number;  // When proposals can start (resolutionDeadline + 5 min)
  createdAt: number;
  creator: string;
  status: 'open' | 'proposed' | 'challenged' | 'voting' | 'resolved';
  proposedOutcome?: boolean;
  currentBond?: number;
  escalationCount?: number;
  canProposeNow?: boolean;
  category: MarketCategory;
  // Proposal timing fields
  proposedAt?: number;        // Timestamp when current proposal was made
  challengeDeadline?: number; // Timestamp when challenge period ends (2h initial, 4h after escalation)
  // Veto guard fields (for 'voting' status)
  vetoGuardAddress?: string;
  vetoEnd?: number;
  vetoCount?: number;
  supportCount?: number;
  currentAnswer?: boolean;  // The answer being voted on
  // Creator rebate fields
  rebateCreator?: string;     // Creator address who can claim rebate
  rebateAmount?: number;      // Rebate amount in HNCH (2,500 HNCH = 25% of 10,000 fee)
  rebateClaimed?: boolean;    // Whether rebate has been claimed
  // v1.1: Resolver reward fields
  resolverAddress?: string;   // Resolver who can claim reward
  resolverReward?: number;    // Resolver reward in HNCH (500 HNCH = 5% of 10,000 fee)
  resolverClaimed?: boolean;  // Whether resolver reward has been claimed
}

// Detect category from question text
function detectCategory(question: string): MarketCategory {
  const q = question.toLowerCase();

  // Cricket keywords
  if (q.includes('cricket') || q.includes('t20') || q.includes('icc') ||
      q.includes('world cup 2026') || q.includes('ipl') || q.includes('ashes') ||
      q.includes('test match') || q.includes('odi') || q.includes('wicket')) {
    return 'cricket';
  }

  // Champions League keywords
  if (q.includes('champions league') || q.includes('ucl') || q.includes('uefa champions')) {
    return 'champions_league';
  }

  // Soccer/Football World Cup keywords
  if (q.includes('fifa') || q.includes('soccer world cup') || q.includes('football world cup') ||
      (q.includes('world cup') && (q.includes('soccer') || q.includes('football') || q.includes('fifa')))) {
    return 'soccer_world_cup';
  }

  // Winter Olympics keywords
  if (q.includes('winter olympics') || q.includes('winter games') || q.includes('beijing 2026') ||
      q.includes('milano cortina') || q.includes('skiing') || q.includes('ice hockey olympics')) {
    return 'winter_olympics';
  }

  return 'other';
}

interface UseMarketsResult {
  markets: Market[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  // Loading progress
  loadingProgress: {
    total: number;
    loaded: number;
    status: string;
  } | null;
}

// State constants matching contract
const STATE_OPEN = 0;
const STATE_PROPOSED = 1;
const STATE_CHALLENGED = 2;
const STATE_DAO_VOTE = 3;
const STATE_RESOLVED = 4;

function mapState(stateNum: number): Market['status'] {
  switch (stateNum) {
    case STATE_OPEN: return 'open';
    case STATE_PROPOSED: return 'proposed';
    case STATE_CHALLENGED: return 'challenged';
    case STATE_DAO_VOTE: return 'voting';
    case STATE_RESOLVED: return 'resolved';
    default: return 'open';
  }
}

export function useMarkets(): UseMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    total: number;
    loaded: number;
    status: string;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMarkets = useCallback(async () => {
    // Cancel any previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setLoadingProgress({ total: 0, loaded: 0, status: 'Connecting to blockchain...' });

    const apiUrl = getTonapiUrl();
    // Use API key to avoid rate limiting
    const headers = getTonapiHeaders();

    try {
      // Get total number of instances from Master Oracle
      setLoadingProgress({ total: 0, loaded: 0, status: 'Fetching market count...' });
      const countResponse = await fetchWithRetry(
        `${apiUrl}/blockchain/accounts/${CONTRACTS.MASTER_ORACLE}/methods/get_next_instance_id`,
        { headers }
      );

      if (!countResponse.ok) {
        throw new Error('Failed to fetch instance count');
      }

      const countData = await countResponse.json();
      console.log('[Markets] Instance count response:', countData);

      if (!countData.success || !countData.stack || countData.stack.length === 0) {
        setMarkets([]);
        return;
      }

      // Parse next_instance_id (this is the count of existing instances)
      const parseNum = (val: any): number => {
        if (typeof val === 'object' && val.num) {
          const numStr = val.num.startsWith('0x') ? val.num : '0x' + val.num;
          return parseInt(numStr, 16) || 0;
        }
        return parseInt(val, 10) || 0;
      };

      const totalInstances = parseNum(countData.stack[0]);
      console.log('[Markets] Total instances:', totalInstances);

      if (totalInstances === 0) {
        setMarkets([]);
        setLoadingProgress(null);
        return;
      }

      setLoadingProgress({ total: totalInstances, loaded: 0, status: `Loading ${totalInstances} markets (parallel)...` });

      // Fetch all instance addresses in parallel batches (10 per second)
      const instanceIds = Array.from({ length: totalInstances }, (_, i) => i);

      const fetchInstance = async (instanceId: number) => {
        const instanceResponse = await fetchWithRetry(
          `${apiUrl}/blockchain/accounts/${CONTRACTS.MASTER_ORACLE}/methods/get_instance?args=${instanceId}`,
          { headers }
        );

        if (!instanceResponse.ok) return null;

        const instanceData = await instanceResponse.json();
        if (!instanceData.success || !instanceData.stack || instanceData.stack.length < 3) return null;

        // Stack: (instance_address as slice, created_at, creator_address as slice)
        const addrVal = instanceData.stack[0];
        const createdAtVal = instanceData.stack[1];
        const creatorVal = instanceData.stack[2];

        // Parse address from slice
        let address = '';
        if (addrVal && typeof addrVal === 'object' && addrVal.cell) {
          try {
            const cellBoc = Buffer.from(addrVal.cell, 'hex');
            const cell = Cell.fromBoc(cellBoc)[0];
            const slice = cell.beginParse();
            const addr = slice.loadAddress();
            if (addr) {
              address = addr.toRawString();
            }
          } catch (e) {
            console.log(`[Markets] Could not parse address for instance ${instanceId}:`, e);
          }
        }

        // Parse creator address
        let creator = '';
        if (creatorVal && typeof creatorVal === 'object' && creatorVal.cell) {
          try {
            const cellBoc = Buffer.from(creatorVal.cell, 'hex');
            const cell = Cell.fromBoc(cellBoc)[0];
            const slice = cell.beginParse();
            const addr = slice.loadAddress();
            if (addr) {
              creator = addr.toRawString();
            }
          } catch (e) {
            console.log(`[Markets] Could not parse creator for instance ${instanceId}:`, e);
          }
        }

        if (!address) return null;

        return {
          id: instanceId,
          address,
          createdAt: parseNum(createdAtVal),
          creator,
        };
      };

      const instanceResults = await fetchInBatches(
        instanceIds,
        fetchInstance,
        (loaded, total) => {
          setLoadingProgress({
            total,
            loaded,
            status: `Fetching market addresses ${loaded} of ${total}...`
          });
        }
      );

      const instanceAddresses = instanceResults.filter((r): r is NonNullable<typeof r> => r !== null);

      console.log('[Markets] Found instance addresses:', instanceAddresses);

      if (instanceAddresses.length === 0) {
        setMarkets([]);
        return;
      }

      // Fetch state and query for all instances in parallel batches

      // Helper to parse question cell
      const parseQuestionCell = (cellData: any, instanceId: number) => {
        let question = `Market #${instanceId}`;
        let rules = '';
        let resolutionSource = '';

        if (cellData && cellData.cell) {
          try {
            const cellBoc = Buffer.from(cellData.cell, 'hex');
            const cell = Cell.fromBoc(cellBoc)[0];
            const slice = cell.beginParse();
            slice.loadUint(64); // Skip resolution_deadline

            if (slice.remainingRefs >= 1) {
              const questionCell = slice.loadRef();
              question = questionCell.beginParse().loadStringTail() || `Market #${instanceId}`;

              if (slice.remainingRefs >= 1) {
                const rulesCell = slice.loadRef();
                rules = rulesCell.beginParse().loadStringTail() || '';
              }

              if (slice.remainingRefs >= 1) {
                const sourceCell = slice.loadRef();
                resolutionSource = sourceCell.beginParse().loadStringTail() || '';
              }
            } else {
              const questionText = slice.loadStringTail();
              if (questionText) question = questionText;
            }
          } catch (parseErr) {
            console.log(`[Markets] Could not parse query cell:`, parseErr);
          }
        }
        return { question, rules, resolutionSource };
      };

      // Fetch state and query in parallel for each market
      const fetchMarketBasics = async (instance: typeof instanceAddresses[0]) => {
        const { id: instanceId, address, createdAt, creator } = instance;

        // Fetch state and query in parallel
        const [stateResponse, questionResponse] = await Promise.all([
          fetchWithRetry(`${apiUrl}/blockchain/accounts/${address}/methods/get_instance_state`, { headers }),
          fetchWithRetry(`${apiUrl}/blockchain/accounts/${address}/methods/get_query`, { headers })
        ]);

        if (!stateResponse.ok) return null;
        const stateData = await stateResponse.json();
        if (!stateData.success || !stateData.stack || stateData.stack.length < 6) return null;

        // Parse state
        const state = parseNum(stateData.stack[1]);
        const escalationCount = parseNum(stateData.stack[2]);
        const totalBonds = parseNum(stateData.stack[3]);
        const resolutionDeadline = parseNum(stateData.stack[5]);

        // Parse question
        let question = `Market #${instanceId}`;
        let rules = '';
        let resolutionSource = '';

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          if (questionData.success && questionData.stack && questionData.stack.length > 0) {
            const parsed = parseQuestionCell(questionData.stack[0], instanceId);
            question = parsed.question;
            rules = parsed.rules;
            resolutionSource = parsed.resolutionSource;
          }
        }

        return {
          instanceId, address, createdAt, creator,
          state, escalationCount, totalBonds, resolutionDeadline,
          question, rules, resolutionSource
        };
      };

      // Batch fetch market basics (state + query)
      const marketBasics = await fetchInBatches(
        instanceAddresses,
        fetchMarketBasics,
        (loaded, total) => {
          setLoadingProgress({
            total,
            loaded,
            status: `Loading market details ${loaded} of ${total}...`
          });
        }
      );

      const validMarketBasics = marketBasics.filter((m): m is NonNullable<typeof m> => m !== null);

      // Now fetch additional data for each market (proposals, veto, rebates)
      const fetchedMarkets: Market[] = [];

      for (const basics of validMarketBasics) {
        try {
          const {
            instanceId, address, createdAt, creator,
            state, escalationCount, totalBonds, resolutionDeadline,
            question, rules, resolutionSource
          } = basics;

          const proposalStartTime = resolutionDeadline + PROPOSAL_DELAY_SECONDS;
        const nowSeconds = Math.floor(Date.now() / 1000);
        const canProposeNow = state === STATE_OPEN && nowSeconds >= proposalStartTime;

        // Fetch current proposal data for proposed/challenged markets
        let proposedOutcome: boolean | undefined;
        let currentBond = totalBonds / 1e9;
        let proposedAt: number | undefined;
        let challengeDeadline: number | undefined;

        // Veto guard fields for voting markets
        let vetoGuardAddress: string | undefined;
        let vetoEnd: number | undefined;
        let vetoCount: number | undefined;
        let supportCount: number | undefined;
        let currentAnswer: boolean | undefined;

        // Challenge period: 2 hours for initial proposal, 4 hours after escalation
        const INITIAL_CHALLENGE_PERIOD_SECONDS = 2 * 60 * 60;

        if (state === STATE_PROPOSED || state === STATE_CHALLENGED) {
          try {
            await delay(API_DELAY_MS);
            const proposalResponse = await fetchWithRetry(
              `${apiUrl}/blockchain/accounts/${address}/methods/get_current_proposal`,
              { headers }
            );
            if (proposalResponse.ok) {
              const proposalData = await proposalResponse.json();
              if (proposalData.success && proposalData.stack && proposalData.stack.length >= 3) {
                const answerVal = proposalData.stack[1];
                const bondVal = proposalData.stack[2];
                const proposedAtVal = proposalData.stack.length > 3 ? proposalData.stack[3] : undefined;
                const deadlineVal = proposalData.stack.length > 4 ? proposalData.stack[4] : undefined;

                if (typeof answerVal === 'object' && answerVal.num !== undefined) {
                  const numStr = answerVal.num.startsWith('0x') ? answerVal.num : '0x' + answerVal.num;
                  proposedOutcome = parseInt(numStr, 16) !== 0;
                }

                if (typeof bondVal === 'object' && bondVal.num !== undefined) {
                  const numStr = bondVal.num.startsWith('0x') ? bondVal.num : '0x' + bondVal.num;
                  currentBond = parseInt(numStr, 16) / 1e9;
                }

                if (proposedAtVal && typeof proposedAtVal === 'object' && proposedAtVal.num !== undefined) {
                  const numStr = proposedAtVal.num.startsWith('0x') ? proposedAtVal.num : '0x' + proposedAtVal.num;
                  proposedAt = parseInt(numStr, 16);
                  challengeDeadline = proposedAt + INITIAL_CHALLENGE_PERIOD_SECONDS;
                }

                if (deadlineVal && typeof deadlineVal === 'object' && deadlineVal.num !== undefined) {
                  const numStr = deadlineVal.num.startsWith('0x') ? deadlineVal.num : '0x' + deadlineVal.num;
                  const parsedDeadline = parseInt(numStr, 16);
                  if (parsedDeadline > 0) challengeDeadline = parsedDeadline;
                }
              }
            }
          } catch (propErr) {
            console.log(`[Markets] Could not fetch proposal for ${address}:`, propErr);
          }
        }

        // Fetch veto guard data for voting markets
        if (state === STATE_DAO_VOTE) {
            try {
              await delay(API_DELAY_MS);
              // First, get the veto guard address from Master Oracle
              // Note: TonAPI requires friendly address format (kQ.../EQ...) not raw format (0:...)
              const friendlyAddress = toFriendlyAddress(address, isTestnet());
              const vetoGuardResponse = await fetchWithRetry(
                `${apiUrl}/blockchain/accounts/${CONTRACTS.MASTER_ORACLE}/methods/get_veto_guard?args=${encodeURIComponent(friendlyAddress)}`,
                { headers }
              );

              if (vetoGuardResponse.ok) {
                const vetoGuardData = await vetoGuardResponse.json();
                console.log(`[Markets] Veto guard for ${address}:`, vetoGuardData);

                if (vetoGuardData.success && vetoGuardData.stack && vetoGuardData.stack.length > 0) {
                  const guardAddrVal = vetoGuardData.stack[0];
                  // Parse address from cell (same format as instance addresses)
                  if (guardAddrVal && typeof guardAddrVal === 'object' && guardAddrVal.cell) {
                    try {
                      const cellBoc = Buffer.from(guardAddrVal.cell, 'hex');
                      const cell = Cell.fromBoc(cellBoc)[0];
                      const slice = cell.beginParse();
                      const addr = slice.loadAddress();
                      if (addr) {
                        // Use friendly format for API calls
                        vetoGuardAddress = addr.toString({ testOnly: true, bounceable: true });
                        console.log(`[Markets] Parsed veto guard address: ${vetoGuardAddress}`);
                      }
                    } catch (e) {
                      console.log(`[Markets] Could not parse veto guard address:`, e);
                    }
                  } else if (guardAddrVal && typeof guardAddrVal === 'string') {
                    // Fallback: plain string format
                    vetoGuardAddress = guardAddrVal;
                  }

                  // Fetch veto status from the guard contract
                  if (vetoGuardAddress) {
                    await delay(API_DELAY_MS);
                    const statusResponse = await fetchWithRetry(
                      `${apiUrl}/blockchain/accounts/${vetoGuardAddress}/methods/get_veto_status`,
                      { headers }
                    );

                    if (statusResponse.ok) {
                      const statusData = await statusResponse.json();
                      console.log(`[Markets] Veto status for ${vetoGuardAddress}:`, statusData);

                      if (statusData.success && statusData.stack && statusData.stack.length >= 4) {
                        // Stack: (veto_end, current_answer, veto_count, support_count)
                        vetoEnd = parseNum(statusData.stack[0]);
                        const answerVal = statusData.stack[1];
                        if (typeof answerVal === 'object' && answerVal.num !== undefined) {
                          const numStr = answerVal.num.startsWith('0x') ? answerVal.num : '0x' + answerVal.num;
                          currentAnswer = parseInt(numStr, 16) !== 0;
                        }
                        vetoCount = parseNum(statusData.stack[2]);
                        supportCount = parseNum(statusData.stack[3]);
                      }
                    }
                  }
                }
              }
            } catch (vetoErr) {
              console.log(`[Markets] Could not fetch veto data for ${address}:`, vetoErr);
            }
          }

          // Fetch creator rebate info from Fee Distributor
          let rebateCreator: string | undefined;
          let rebateAmount: number | undefined;
          let rebateClaimed: boolean | undefined;

          try {
            await delay(API_DELAY_MS);
            const rebateResponse = await fetchWithRetry(
              `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_creator_rebate?args=${encodeURIComponent(address)}`,
              { headers }
            );

            if (rebateResponse.ok) {
              const rebateData = await rebateResponse.json();
              console.log(`[Markets] Rebate data for ${address}:`, rebateData);

              if (rebateData.success && rebateData.stack && rebateData.stack.length >= 3) {
                // Stack: (creator_address, rebate_amount, claimed)
                const creatorVal = rebateData.stack[0];
                const amountVal = rebateData.stack[1];
                const claimedVal = rebateData.stack[2];

                // Parse creator address
                if (creatorVal && typeof creatorVal === 'string') {
                  rebateCreator = creatorVal;
                }

                // Parse rebate amount
                if (typeof amountVal === 'object' && amountVal.num !== undefined) {
                  const numStr = amountVal.num.startsWith('0x') ? amountVal.num : '0x' + amountVal.num;
                  rebateAmount = parseInt(numStr, 16) / 1e9;
                }

                // Parse claimed status
                if (typeof claimedVal === 'object' && claimedVal.num !== undefined) {
                  const numStr = claimedVal.num.startsWith('0x') ? claimedVal.num : '0x' + claimedVal.num;
                  rebateClaimed = parseInt(numStr, 16) !== 0;
                }
              }
            }
          } catch (rebateErr) {
            console.log(`[Markets] Could not fetch rebate for ${address}:`, rebateErr);
          }

          // v1.1: Fetch resolver reward info from Fee Distributor
          let resolverAddress: string | undefined;
          let resolverReward: number | undefined;
          let resolverClaimed: boolean | undefined;

          try {
            await delay(API_DELAY_MS);
            const resolverResponse = await fetchWithRetry(
              `${apiUrl}/blockchain/accounts/${CONTRACTS.FEE_DISTRIBUTOR}/methods/get_resolver_reward?args=${encodeURIComponent(address)}`,
              { headers }
            );

            if (resolverResponse.ok) {
              const resolverData = await resolverResponse.json();
              console.log(`[Markets] Resolver data for ${address}:`, resolverData);

              if (resolverData.success && resolverData.stack && resolverData.stack.length >= 3) {
                // Stack: (resolver_address, reward_amount, claimed)
                const resolverVal = resolverData.stack[0];
                const amountVal = resolverData.stack[1];
                const claimedVal = resolverData.stack[2];

                // Parse resolver address
                if (resolverVal && typeof resolverVal === 'string') {
                  resolverAddress = resolverVal;
                }

                // Parse resolver reward amount
                if (typeof amountVal === 'object' && amountVal.num !== undefined) {
                  const numStr = amountVal.num.startsWith('0x') ? amountVal.num : '0x' + amountVal.num;
                  resolverReward = parseInt(numStr, 16) / 1e9;
                }

                // Parse claimed status
                if (typeof claimedVal === 'object' && claimedVal.num !== undefined) {
                  const numStr = claimedVal.num.startsWith('0x') ? claimedVal.num : '0x' + claimedVal.num;
                  resolverClaimed = parseInt(numStr, 16) !== 0;
                }
              }
            }
          } catch (resolverErr) {
            console.log(`[Markets] Could not fetch resolver for ${address}:`, resolverErr);
          }

          fetchedMarkets.push({
            id: instanceId,
            address,
            question,
            rules: rules || undefined,
            resolutionSource: resolutionSource || undefined,
            resolutionDeadline,
            proposalStartTime,
            createdAt,
            creator: creator || rebateCreator || '',
            status: mapState(state),
            proposedOutcome,
            currentBond,
            escalationCount,
            canProposeNow,
            category: detectCategory(question),
            // Proposal timing fields
            proposedAt,
            challengeDeadline,
            // Veto guard fields
            vetoGuardAddress,
            vetoEnd,
            vetoCount,
            supportCount,
            currentAnswer,
            // Creator rebate fields
            rebateCreator,
            rebateAmount,
            rebateClaimed,
            // v1.1: Resolver reward fields
            resolverAddress,
            resolverReward,
            resolverClaimed,
          });
        } catch (instanceErr) {
          console.error(`Failed to fetch market ${basics.instanceId}:`, instanceErr);
        }
      }

      // Sort by ID
      fetchedMarkets.sort((a, b) => a.id - b.id);
      setMarkets(fetchedMarkets);
      setLoadingProgress({
        total: fetchedMarkets.length,
        loaded: fetchedMarkets.length,
        status: `Loaded ${fetchedMarkets.length} markets successfully`
      });
    } catch (err: any) {
      console.error('Failed to fetch markets:', err);
      setError(err.message);
      setLoadingProgress(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        // Clear progress after a short delay
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
        progressTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setLoadingProgress(null);
          }
        }, 2000);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Fetch markets once on mount - NO automatic refresh to prevent memory issues
    // User can manually refresh using the refetch function
    fetchMarkets();

    return () => {
      mountedRef.current = false;
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency - only run once on mount

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
    loadingProgress,
  };
}
