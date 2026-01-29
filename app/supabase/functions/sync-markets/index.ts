/**
 * Supabase Edge Function: sync-markets
 *
 * Auto-detects new prediction markets by monitoring Master Oracle transactions
 * on TON blockchain. When Master Oracle deploys a new Oracle Instance, this function:
 * 1. Fetches recent transactions from TON API
 * 2. Identifies new Oracle Instance deployments from outgoing messages
 * 3. Queries the instance contract to extract market data
 * 4. Inserts new markets into Supabase (with deduplication)
 * 5. Fetches and tracks all participants (proposers/challengers) for bond claims
 * 6. Updates sync state to track progress
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Address, TonClient, beginCell } from 'https://esm.sh/ton@13.9.0';

// Network configurations
const NETWORKS = {
  mainnet: {
    masterOracle: 'EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J',
    tonApiUrl: 'https://tonapi.io/v2',
  },
  testnet: {
    masterOracle: 'kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf',
    tonApiUrl: 'https://testnet.tonapi.io/v2',
  },
};

// Category detection based on question text
// Valid categories: cricket, champions_league, soccer_world_cup, winter_olympics, other
function detectCategory(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('cricket')) {
    return 'cricket';
  }

  if (lowerQuestion.includes('champions league')) {
    return 'champions_league';
  }

  if (lowerQuestion.includes('world cup') && lowerQuestion.includes('soccer')) {
    return 'soccer_world_cup';
  }

  if (lowerQuestion.includes('winter olympics') || lowerQuestion.includes('winter olympic')) {
    return 'winter_olympics';
  }

  // Default to 'other' for everything else
  return 'other';
}

// Fetch transactions from TON API
async function fetchTransactions(
  network: 'mainnet' | 'testnet',
  address: string,
  afterLt?: string,
  limit = 100
): Promise<any> {
  const config = NETWORKS[network];
  const url = `${config.tonApiUrl}/blockchain/accounts/${address}/transactions?limit=${limit}${afterLt ? `&after_lt=${afterLt}` : ''}`;

  const tonApiKey = Deno.env.get('TONAPI_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (tonApiKey) {
    headers['Authorization'] = `Bearer ${tonApiKey}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`TON API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Call get method on TON contract
async function callGetMethod(
  network: 'mainnet' | 'testnet',
  address: string,
  method: string
): Promise<any> {
  const config = NETWORKS[network];
  const url = `${config.tonApiUrl}/blockchain/accounts/${address}/methods/${method}`;

  const tonApiKey = Deno.env.get('TONAPI_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (tonApiKey) {
    headers['Authorization'] = `Bearer ${tonApiKey}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`TON API get method error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to extract ASCII strings from BOC cell hex data
// BOC format contains binary data with embedded strings that may have length prefixes
function extractStringsFromBoc(cellHex: string): string[] {
  const strings: string[] = [];
  let current = '';
  let startOffset = 0;

  // Convert hex to bytes
  const bytes: number[] = [];
  for (let i = 0; i < cellHex.length; i += 2) {
    bytes.push(parseInt(cellHex.substr(i, 2), 16));
  }

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII (32-126) - space to tilde
    if (b >= 32 && b <= 126) {
      if (current.length === 0) startOffset = i;
      current += String.fromCharCode(b);
    } else {
      if (current.length > 5) {
        // Check if first character might be a length/type prefix byte that looks like ASCII
        // This happens when the prefix byte falls in printable range (e.g., 0x72 = 'r')
        let cleanStr = current;
        const firstCharCode = current.charCodeAt(0);

        // If first char is lowercase letter and string is question/rules, it's likely a prefix
        if (firstCharCode >= 97 && firstCharCode <= 122 && current.length > 10) {
          cleanStr = current.substring(1);
        }

        strings.push(cleanStr.trim());
      }
      current = '';
    }
  }

  // Don't forget the last string
  if (current.length > 5) {
    let cleanStr = current;
    const firstCharCode = current.charCodeAt(0);
    if (firstCharCode >= 97 && firstCharCode <= 122 && current.length > 10) {
      cleanStr = current.substring(1);
    }
    strings.push(cleanStr.trim());
  }

  return strings;
}

// Helper function to parse cell BOC for question/rules
function parseCellBoc(cellHex: string): { question: string; rules: string; resolutionSource: string } {
  const strings = extractStringsFromBoc(cellHex);

  console.log(`[parseCellBoc] Found ${strings.length} strings:`, strings.map(s => s.substring(0, 50) + '...'));

  let question = '';
  let rules = '';
  let resolutionSource = '';

  for (const str of strings) {
    // Question: contains '?' and is reasonably short
    if (!question && str.includes('?') && str.length < 300) {
      question = str;
    }
    // Rules: longer explanatory text after question
    else if (question && !rules && str.length > 20) {
      rules = str;
    }
    // Resolution source: shorter text after rules (URL or reference)
    else if (question && rules && str.length > 3 && str.length < 150) {
      resolutionSource = str;
      break;
    }
  }

  // If no question with '?' found, take the first substantial string
  if (!question && strings.length > 0) {
    question = strings[0];
    if (strings.length > 1) rules = strings[1];
    if (strings.length > 2) resolutionSource = strings[2];
  }

  console.log(`[parseCellBoc] Parsed: question="${question.substring(0, 50)}...", rules="${rules.substring(0, 50)}..."`);

  return { question, rules, resolutionSource };
}

// Convert raw address (0:...) to user-friendly format (EQ.../kQ...)
function rawToFriendly(rawAddress: string, testnet = false): string {
  try {
    // Parse raw address
    const [workchain, hexPart] = rawAddress.split(':');
    if (!hexPart || hexPart.length !== 64) return rawAddress;

    const workchainNum = parseInt(workchain);
    const addrBytes = new Uint8Array(hexPart.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []);

    // Build address with tag
    const tag = testnet ? 0x91 : 0x11; // Non-bounceable for testnet, bounceable for mainnet
    const addr = new Uint8Array(34);
    addr[0] = tag;
    addr[1] = workchainNum;
    addr.set(addrBytes, 2);

    // Calculate CRC16-CCITT
    let crc = 0;
    for (let i = 0; i < 34; i++) {
      crc ^= addr[i] << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }

    // Append CRC
    const full = new Uint8Array(36);
    full.set(addr);
    full[34] = (crc >> 8) & 0xFF;
    full[35] = crc & 0xFF;

    // Base64 encode
    let b64 = btoa(String.fromCharCode(...full));
    // Make URL-safe
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');

    return b64;
  } catch {
    return rawAddress;
  }
}

// Parse participants (proposers and challengers) from Oracle Instance transactions
// Proposals and challenges come via Jetton transfers (op 0x7362d09c = transfer_notification)
// The forward_payload inside contains our op::propose (0x10) or op::challenge (0x11)
async function parseParticipants(
  network: 'mainnet' | 'testnet',
  instanceAddress: string,
  marketId: number,
  supabase: any
): Promise<number> {
  try {
    console.log(`[parseParticipants] Fetching transactions for ${instanceAddress}`);

    // Fetch all transactions TO this instance (incoming messages)
    const txData = await fetchTransactions(network, instanceAddress, undefined, 100);

    if (!txData.transactions || txData.transactions.length === 0) {
      console.log(`[parseParticipants] No transactions found for ${instanceAddress}`);
      return 0;
    }

    const participants: any[] = [];
    let escalationLevel = 0;
    let hasProposal = false;

    console.log(`[parseParticipants] Processing ${txData.transactions.length} transactions...`);

    // Process transactions in chronological order (oldest first)
    for (const tx of txData.transactions.reverse()) {
      // Look for incoming messages
      if (!tx.in_msg || !tx.in_msg.source) {
        console.log(`[parseParticipants] Skipping tx ${tx.hash?.substring(0, 8)}: no in_msg or source`);
        continue;
      }

      const opCode = tx.in_msg.op_code?.toLowerCase();
      const rawBody = tx.in_msg.raw_body || '';
      const txHash = tx.hash || '';

      console.log(`[parseParticipants] tx ${txHash.substring(0, 8)} op_code=${opCode}, rawBody length=${rawBody.length}`);

      // Skip if not a Jetton transfer notification (0x7362d09c)
      if (opCode !== '0x7362d09c') {
        console.log(`[parseParticipants] Skipping: not a Jetton transfer (${opCode})`);
        continue;
      }

      // Check if this tx was already processed (by tx_hash)
      const { data: existingTx } = await supabase
        .from('market_participants')
        .select('id')
        .eq('tx_hash', txHash)
        .maybeSingle();

      if (existingTx) {
        console.log(`[parseParticipants] tx ${txHash.substring(0, 8)} already processed, skipping`);
        // But we still need to count it for escalation level
        const { data: existingRecord } = await supabase
          .from('market_participants')
          .select('action')
          .eq('tx_hash', txHash)
          .single();
        if (existingRecord?.action === 'propose') hasProposal = true;
        if (existingRecord?.action === 'challenge') escalationLevel++;
        continue;
      }

      console.log(`[parseParticipants] Found Jetton transfer, checking for propose/challenge...`);

      try {
        // Try to use decoded_body first (cleaner), fall back to raw_body parsing
        let action: 'propose' | 'challenge' | null = null;
        let answer = false;
        let senderAddress = tx.in_msg.source.address; // Fallback to Jetton wallet

        const decodedBody = tx.in_msg.decoded_body;

        if (decodedBody && decodedBody.forward_payload) {
          // Use decoded body - much cleaner!
          const forwardPayload = decodedBody.forward_payload;
          const opCode = forwardPayload.value?.op_code;

          console.log(`[parseParticipants] Using decoded_body, forward_payload op_code=${opCode}`);

          if (opCode === 16 || opCode === 0x10) {
            action = 'propose';
          } else if (opCode === 17 || opCode === 0x11) {
            action = 'challenge';
          }

          // Extract sender from decoded_body
          if (decodedBody.sender) {
            senderAddress = decodedBody.sender;
            console.log(`[parseParticipants] Sender from decoded_body: ${senderAddress}`);
          }

          // Parse answer from forward_payload cell
          // The cell contains: op(4) + query_id(8) + answer(1 bit)
          // In decoded form, we need to check the raw cell value
          if (action && forwardPayload.value?.value) {
            const cellHex = forwardPayload.value.value.toLowerCase();
            // Look for the answer bit after the BOC header
            // Cell format: b5ee9c72... header, then op(8 hex) + query_id(16 hex) + answer byte
            const opIndex = cellHex.indexOf('00000010') !== -1 ? cellHex.indexOf('00000010') :
                            cellHex.indexOf('00000011') !== -1 ? cellHex.indexOf('00000011') : -1;
            if (opIndex !== -1) {
              const answerOffset = opIndex + 8 + 16;
              if (answerOffset + 2 <= cellHex.length) {
                const answerByte = parseInt(cellHex.substring(answerOffset, answerOffset + 2), 16);
                answer = (answerByte & 0x80) !== 0;
                console.log(`[parseParticipants] Answer from forward_payload: ${answer}`);
              }
            }
          }
        }

        // Fall back to raw_body parsing if decoded_body didn't work
        if (!action) {
          console.log(`[parseParticipants] Falling back to raw_body parsing...`);

          // Search for propose op in hex string (32-bit op code as hex)
          const proposeIndex = rawBody.toLowerCase().indexOf('00000010');
          const challengeIndex = rawBody.toLowerCase().indexOf('00000011');

          console.log(`[parseParticipants] proposeIndex=${proposeIndex}, challengeIndex=${challengeIndex}`);

          if (proposeIndex !== -1) {
            action = 'propose';
            const answerOffset = proposeIndex + 8 + 16;
            if (answerOffset + 2 <= rawBody.length) {
              const answerByte = parseInt(rawBody.substring(answerOffset, answerOffset + 2), 16);
              answer = (answerByte & 0x80) !== 0;
            }
          } else if (challengeIndex !== -1) {
            action = 'challenge';
            const answerOffset = challengeIndex + 8 + 16;
            if (answerOffset + 2 <= rawBody.length) {
              const answerByte = parseInt(rawBody.substring(answerOffset, answerOffset + 2), 16);
              answer = (answerByte & 0x80) !== 0;
            }
          }
        }

        if (!action) {
          console.log(`[parseParticipants] No propose/challenge op found, skipping`);
          continue;
        }

        // Validate action sequence: propose must come first, then challenges
        if (action === 'propose' && hasProposal) {
          console.log(`[parseParticipants] Duplicate propose (already have one), skipping`);
          continue;
        }
        if (action === 'challenge' && !hasProposal) {
          console.log(`[parseParticipants] Challenge without prior propose, skipping`);
          continue;
        }

        console.log(`[parseParticipants] Found action=${action}, answer=${answer}, sender=${senderAddress}`);


        // Convert raw address to friendly format
        const friendlyAddress = rawToFriendly(senderAddress, network === 'testnet');

        // Determine escalation level based on action
        const currentLevel = action === 'propose' ? 0 : escalationLevel;

        // Extract bond amount - estimate from escalation level
        // Bond doubles each escalation: 10k -> 20k -> 40k -> 80k HNCH
        const bondAmounts = [10000, 20000, 40000, 80000]; // in HNCH
        const bondAmount = BigInt(bondAmounts[Math.min(currentLevel, 3)] * 1e9);

        participants.push({
          market_id: marketId,
          network,
          market_address: instanceAddress,
          participant_address: friendlyAddress,
          action,
          answer,
          bond_amount: bondAmount.toString(),
          escalation_level: currentLevel,
          timestamp: tx.utime || Math.floor(Date.now() / 1000),
          tx_hash: txHash,
        });

        console.log(`[parseParticipants] Found ${action} by ${friendlyAddress.substring(0, 8)}... answer=${answer} at level ${currentLevel}`);

        // Update state for next iteration
        if (action === 'propose') {
          hasProposal = true;
        } else if (action === 'challenge') {
          escalationLevel++;
        }
      } catch (parseError) {
        console.error(`[parseParticipants] Error parsing tx ${txHash.substring(0, 8)}:`, parseError);
        continue;
      }
    }

    // Insert participants (use upsert to handle any duplicates gracefully)
    if (participants.length > 0) {
      const { error } = await supabase
        .from('market_participants')
        .upsert(participants, {
          onConflict: 'market_address,participant_address,escalation_level',
          ignoreDuplicates: true,
        });

      if (error) {
        console.error(`[parseParticipants] Error inserting participants:`, error);
        // Try inserting one by one to see which fail
        let inserted = 0;
        for (const p of participants) {
          const { error: singleError } = await supabase
            .from('market_participants')
            .insert(p);
          if (!singleError) inserted++;
          else console.log(`[parseParticipants] Skipped duplicate: ${p.participant_address.substring(0, 8)} level ${p.escalation_level}`);
        }
        console.log(`[parseParticipants] Inserted ${inserted}/${participants.length} participants for market ${marketId}`);
        return inserted;
      }

      console.log(`[parseParticipants] Inserted ${participants.length} participants for market ${marketId}`);
    }

    return participants.length;
  } catch (error) {
    console.error(`[parseParticipants] Error:`, error);
    return 0;
  }
}

// Parse market data from instance contract
async function parseMarketData(
  network: 'mainnet' | 'testnet',
  instanceAddress: string,
  marketId: number
): Promise<any> {
  try {
    // Call get_instance_state to get basic info
    const stateResult = await callGetMethod(network, instanceAddress, 'get_instance_state');

    if (!stateResult.success || !stateResult.stack) {
      console.error('Failed to get instance state:', stateResult);
      return null;
    }

    // Stack returns: (instance_id, state, escalation_count, total_bonds, resolution_method, resolution_deadline)
    const resolutionDeadline = parseInt(stateResult.stack[5]?.value || stateResult.stack[5]?.num || '0', 16);
    const proposalStartTime = resolutionDeadline + 300; // 5 minutes after deadline

    // Call get_query to get question, rules, resolution_source
    const queryResult = await callGetMethod(network, instanceAddress, 'get_query');

    if (!queryResult.success) {
      console.error('Failed to get query:', queryResult);
      return null;
    }

    let question = '';
    let rules = '';
    let resolutionSource = '';

    // Try decoded first (some contracts have automatic decoding)
    if (queryResult.decoded?.question) {
      question = queryResult.decoded.question;
      rules = queryResult.decoded.rules || '';
      resolutionSource = queryResult.decoded.resolution_source || '';
    }
    // Fallback: parse from raw cell data
    else if (queryResult.stack?.[0]?.cell) {
      const parsed = parseCellBoc(queryResult.stack[0].cell);
      question = parsed.question;
      rules = parsed.rules;
      resolutionSource = parsed.resolutionSource;
    }

    if (!question) {
      console.error('Could not extract question from query result:', queryResult);
      return null;
    }

    // Get creation timestamp
    const createdAt = Math.floor(Date.now() / 1000);

    // Detect category
    const category = detectCategory(question);

    return {
      id: marketId,
      network,
      address: instanceAddress,
      question,
      rules,
      resolution_source: resolutionSource,
      resolution_deadline: resolutionDeadline,
      proposal_start_time: proposalStartTime,
      created_at: createdAt,
      creator: '', // Can extract from deployment transaction if needed
      status: 'open',
      category,
      can_propose_now: createdAt >= proposalStartTime,
    };
  } catch (error) {
    console.error(`Error parsing market data for ${instanceAddress}:`, error);
    return null;
  }
}

// Sync markets for a specific network
async function syncNetwork(
  network: 'mainnet' | 'testnet',
  supabase: any,
  force = false
): Promise<{ success: boolean; marketsAdded: number; error?: string }> {
  const config = NETWORKS[network];

  try {
    // Get last processed LT from sync_state
    const { data: syncState, error: syncError } = await supabase
      .from('sync_state')
      .select('last_processed_lt, master_oracle_address')
      .eq('network', network)
      .single();

    if (syncError) {
      throw new Error(`Failed to fetch sync state: ${syncError.message}`);
    }

    const lastProcessedLt = force ? undefined : syncState.last_processed_lt;

    // Fetch transactions from Master Oracle
    const txData = await fetchTransactions(
      network,
      config.masterOracle,
      lastProcessedLt,
      100
    );

    if (!txData.transactions || txData.transactions.length === 0) {
      console.log(`No new transactions for ${network}`);
      return { success: true, marketsAdded: 0 };
    }

    // Get the latest market ID to assign incremental IDs
    const { data: latestMarket } = await supabase
      .from('markets')
      .select('id')
      .eq('network', network)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    let nextMarketId = (latestMarket?.id || 100) + 1;

    const newMarkets: any[] = [];
    let newLastProcessedLt = lastProcessedLt;

    // Process transactions in reverse (oldest first)
    for (const tx of txData.transactions.reverse()) {
      const lt = tx.lt;

      // Update last processed LT
      if (!newLastProcessedLt || BigInt(lt) > BigInt(newLastProcessedLt)) {
        newLastProcessedLt = lt;
      }

      // Skip if already processed (safety check)
      if (lastProcessedLt && BigInt(lt) <= BigInt(lastProcessedLt)) {
        continue;
      }

      // Look for outgoing messages (Oracle Instance deployments)
      if (tx.out_msgs && tx.out_msgs.length > 0) {
        for (const msg of tx.out_msgs) {
          // Check if this is a deployment message (has init state)
          if (msg.destination && msg.init) {
            const rawAddress = msg.destination.address;

            // Skip if this is the Master Oracle itself
            // Master Oracle addresses - both raw format (0:...) hex parts to match against
            const masterOracleHashes = [
              '78e409936ba9ab636d11ef05a0f69cd1f5cb67e08a80f8f10afc9147d8b4cbb4', // mainnet v6.3
              '4ef9c64c749534971947d5b045f0c9fb0231794909e7aaa464ab4fdae493dca8', // testnet v6.2
            ];
            const rawHexPart = rawAddress.split(':')[1]?.toLowerCase();
            if (rawHexPart && masterOracleHashes.includes(rawHexPart)) {
              console.log(`Skipping Master Oracle address: ${rawAddress}`);
              continue;
            }

            // Convert to user-friendly address format
            const instanceAddress = rawToFriendly(rawAddress, network === 'testnet');

            console.log(`[syncNetwork] Found deployment: raw=${rawAddress}, friendly=${instanceAddress}`);

            // Check if this market already exists in DB (check both address formats)
            const { data: existingFriendly } = await supabase
              .from('markets')
              .select('id')
              .eq('network', network)
              .eq('address', instanceAddress)
              .maybeSingle();

            const { data: existingRaw } = await supabase
              .from('markets')
              .select('id')
              .eq('network', network)
              .eq('address', rawAddress)
              .maybeSingle();

            const existing = existingFriendly || existingRaw;

            if (existing) {
              console.log(`Market already exists: ${instanceAddress}`);
              continue;
            }

            // Parse market data from the instance
            console.log(`[syncNetwork] Parsing market data for ${instanceAddress}...`);
            const marketData = await parseMarketData(network, instanceAddress, nextMarketId);

            if (marketData) {
              console.log(`[syncNetwork] Successfully parsed market: "${marketData.question?.substring(0, 50)}..."`);
              newMarkets.push(marketData);

              // Parse participants after market is found
              console.log(`[syncNetwork] Parsing participants for market ${nextMarketId}...`);
              await parseParticipants(network, instanceAddress, nextMarketId, supabase);

              nextMarketId++;
            } else {
              console.log(`[syncNetwork] Failed to parse market data for ${instanceAddress}`);
            }
          }
        }
      }
    }

    // Insert new markets into Supabase
    if (newMarkets.length > 0) {
      const { error: insertError } = await supabase
        .from('markets')
        .insert(newMarkets);

      if (insertError) {
        console.error(`Error inserting markets for ${network}:`, insertError);
        throw new Error(`Failed to insert markets: ${insertError.message}`);
      }

      console.log(`Inserted ${newMarkets.length} new markets for ${network}`);
    }

    // Update sync state
    const { error: updateError } = await supabase
      .from('sync_state')
      .update({
        last_processed_lt: newLastProcessedLt,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('network', network);

    if (updateError) {
      console.error(`Error updating sync state for ${network}:`, updateError);
    }

    return { success: true, marketsAdded: newMarkets.length };
  } catch (error: any) {
    console.error(`Error syncing ${network}:`, error);
    return { success: false, marketsAdded: 0, error: error.message };
  }
}

// Main handler
serve(async (req) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    const network = body.network || 'both'; // 'mainnet' | 'testnet' | 'both'
    const force = body.force || false;
    const backfillParticipants = body.backfill_participants || false;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: any = {};

    // Backfill participants for existing markets
    if (backfillParticipants) {
      console.log('[sync-markets] Backfilling participants for existing markets...');
      const networksToProcess = network === 'both' ? ['mainnet', 'testnet'] : [network];

      for (const net of networksToProcess) {
        const { data: markets, error } = await supabase
          .from('markets')
          .select('id, address')
          .eq('network', net);

        if (error) {
          console.error(`Error fetching markets for ${net}:`, error);
          results[net] = { success: false, error: error.message, participantsSynced: 0 };
          continue;
        }

        let participantsSynced = 0;
        for (const market of markets || []) {
          console.log(`[backfill] Processing market ${market.id} at ${market.address}`);
          const count = await parseParticipants(net as 'mainnet' | 'testnet', market.address, market.id, supabase);
          participantsSynced += count;
        }

        results[net] = { success: true, participantsSynced };
        console.log(`[backfill] Synced ${participantsSynced} participants for ${net}`);
      }

      return new Response(
        JSON.stringify({ success: true, mode: 'backfill_participants', results }),
        { status: 200, headers }
      );
    }

    // Sync mainnet
    if (network === 'mainnet' || network === 'both') {
      results.mainnet = await syncNetwork('mainnet', supabase, force);
    }

    // Sync testnet
    if (network === 'testnet' || network === 'both') {
      results.testnet = await syncNetwork('testnet', supabase, force);
    }

    // Determine overall success
    const allSucceeded = Object.values(results).every((r: any) => r.success);
    const totalMarketsAdded = Object.values(results).reduce(
      (sum: number, r: any) => sum + r.marketsAdded,
      0
    );

    const status = allSucceeded ? 200 : (totalMarketsAdded > 0 ? 207 : 500);

    return new Response(
      JSON.stringify({
        success: allSucceeded,
        totalMarketsAdded,
        results,
      }),
      { status, headers }
    );
  } catch (error: any) {
    console.error('Sync markets error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      { status: 500, headers }
    );
  }
});
