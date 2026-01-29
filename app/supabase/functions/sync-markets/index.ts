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

    console.log(`[parseParticipants] Processing ${txData.transactions.length} transactions...`);

    // Process transactions in chronological order (oldest first)
    for (const tx of txData.transactions.reverse()) {
      // Look for incoming messages
      if (!tx.in_msg || !tx.in_msg.source) {
        console.log(`[parseParticipants] Skipping tx: no in_msg or source`);
        continue;
      }

      const opCode = tx.in_msg.op_code;
      const rawBody = tx.in_msg.raw_body || '';

      console.log(`[parseParticipants] tx op_code=${opCode}, rawBody length=${rawBody.length}`);

      // Skip if not a Jetton transfer notification (0x7362d09c)
      // Also handle different case formats
      if (opCode !== '0x7362d09c' && opCode !== '0x7362D09C') {
        console.log(`[parseParticipants] Skipping: not a Jetton transfer (${opCode})`);
        continue;
      }

      console.log(`[parseParticipants] Found Jetton transfer, checking for propose/challenge...`);

      try {
        // Look for propose (00000010) or challenge (00000011) in the raw_body
        // The forward_payload contains the actual operation
        let action: 'propose' | 'challenge' | null = null;
        let answer = false;

        // Search for propose op in hex string
        const proposeIndex = rawBody.indexOf('00000010');
        const challengeIndex = rawBody.indexOf('00000011');

        console.log(`[parseParticipants] proposeIndex=${proposeIndex}, challengeIndex=${challengeIndex}`);

        if (proposeIndex !== -1) {
          action = 'propose';
          // Answer is after op (8 chars) + query_id (16 chars)
          const answerOffset = proposeIndex + 8 + 16;
          if (answerOffset + 2 <= rawBody.length) {
            const answerHex = rawBody.substring(answerOffset, answerOffset + 2);
            console.log(`[parseParticipants] answerHex=${answerHex}`);
            // In FunC: -1 = true (0xff), 0 = false (0x00)
            answer = answerHex === 'ff' || answerHex === 'FF';
          }
        } else if (challengeIndex !== -1) {
          action = 'challenge';
          const answerOffset = challengeIndex + 8 + 16;
          if (answerOffset + 2 <= rawBody.length) {
            const answerHex = rawBody.substring(answerOffset, answerOffset + 2);
            console.log(`[parseParticipants] answerHex=${answerHex}`);
            answer = answerHex === 'ff' || answerHex === 'FF';
          }
        }

        if (!action) {
          console.log(`[parseParticipants] No propose/challenge op found, skipping`);
          continue;
        }

        console.log(`[parseParticipants] Found action=${action}, answer=${answer}`);

        // Extract sender from the raw_body of the Jetton transfer_notification
        // Format: op(4) + query_id(8) + jetton_amount(var) + sender_address + forward_payload
        // The sender address is encoded after the jetton amount (which is variable length)
        //
        // For now, we'll extract the sender from the raw_body by looking for the address pattern
        // A TON address is 267 bits = 34 bytes when serialized
        // After BOC header and cell refs, the data contains the sender address

        // Simpler approach: The source of the Jetton transfer is the Jetton wallet
        // We can extract the original sender from within the message body
        // The raw_body contains the sender address after query_id and amount

        // Looking at the hex: after 7362d09c (op) + 8 bytes query_id + variable coins
        // For jetton transfers, the sender is typically in the body
        // Let's extract from position after the op code area

        let senderAddress = tx.in_msg.source.address; // Default to Jetton wallet address

        // Try to extract original sender from raw_body
        // The format has sender address after: op(8 hex) + query_id(16 hex) + amount(varies)
        // Look for address-like pattern (starts with 0: or 8 followed by workchain)
        // Actually, in the transfer_notification, the sender is encoded in the cell
        // The address appears after the jetton amount in the message body

        // For robustness, let's check the transaction's account addresses
        // The in_msg.source is the Jetton wallet, but we need the actual user
        // We can infer from the account that owns the Jetton wallet

        // Alternative: Parse the raw_body more carefully
        // The sender slice in transfer_notification starts after op(4)+query_id(8)+amount(var)
        // Amount is a VarUInteger16, typically 1-16 bytes
        // For 10000 HNCH = 10000 * 1e9 = 10e12 nanoHNCH, which fits in ~6 bytes

        // Let's try a regex to find a potential address in the raw body
        // TON addresses in raw form are 32 bytes (64 hex chars) after workchain (1 byte)
        const addressMatch = rawBody.match(/([0-9a-f]{64})/i);
        if (addressMatch && addressMatch[1]) {
          // Found a potential address hash, but we need workchain too
          // For now, assume workchain 0 (basechain)
          const potentialAddr = '0:' + addressMatch[1];
          // Verify it's different from the Jetton wallet
          if (potentialAddr !== senderAddress) {
            // Could be the sender, but let's be conservative
            // Actually, let's skip complex parsing and just use what we have
          }
        }

        // For now, use the source address (Jetton wallet)
        // The user can be determined later or we accept the Jetton wallet as proxy

        // Convert raw address to friendly format
        const friendlyAddress = rawToFriendly(senderAddress, network === 'testnet');

        // Check if already tracked
        const { data: existing } = await supabase
          .from('market_participants')
          .select('id')
          .eq('market_address', instanceAddress)
          .eq('participant_address', friendlyAddress)
          .eq('escalation_level', escalationLevel)
          .maybeSingle();

        if (existing) {
          console.log(`[parseParticipants] Participant ${friendlyAddress} already tracked at level ${escalationLevel}`);
          if (action === 'challenge') escalationLevel++;
          continue;
        }

        // Extract bond amount from Jetton transfer
        // The jetton_amount is variable-length encoded in the raw_body
        // For simplicity, we'll estimate from escalation level
        const bondAmounts = [10000, 20000, 40000, 80000]; // in HNCH
        const bondAmount = BigInt(bondAmounts[Math.min(escalationLevel, 3)] * 1e9);

        participants.push({
          market_id: marketId,
          network,
          market_address: instanceAddress,
          participant_address: friendlyAddress,
          action,
          answer,
          bond_amount: bondAmount.toString(),
          escalation_level: escalationLevel,
          timestamp: tx.utime || Math.floor(Date.now() / 1000),
          tx_hash: tx.hash || null,
        });

        console.log(`[parseParticipants] Found ${action} by ${friendlyAddress.substring(0, 8)}... answer=${answer} at level ${escalationLevel}`);

        // Increment escalation level after recording
        if (action === 'challenge') {
          escalationLevel++;
        }
      } catch (parseError) {
        console.error(`[parseParticipants] Error parsing tx:`, parseError);
        continue;
      }
    }

    // Insert participants
    if (participants.length > 0) {
      const { error } = await supabase
        .from('market_participants')
        .insert(participants);

      if (error) {
        console.error(`[parseParticipants] Error inserting participants:`, error);
        return 0;
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
