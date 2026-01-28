/**
 * Supabase Edge Function: sync-markets
 *
 * Auto-detects new prediction markets by monitoring Master Oracle transactions
 * on TON blockchain. When Master Oracle deploys a new Oracle Instance, this function:
 * 1. Fetches recent transactions from TON API
 * 2. Identifies new Oracle Instance deployments from outgoing messages
 * 3. Queries the instance contract to extract market data
 * 4. Inserts new markets into Supabase (with deduplication)
 * 5. Updates sync state to track progress
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: any = {};

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
