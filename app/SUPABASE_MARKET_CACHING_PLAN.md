# Supabase Market Caching Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to implement Supabase caching for HUNCH Oracle market data to reduce load times from 3-9 seconds to near-instant on initial page load.

**Current State:**
- Frontend at `/Users/tonicaradonna/hunch-oracle-launchpad/frontend`
- All market data fetched from TON blockchain via TONAPI (~3-9 seconds for 12 markets)
- Main repo has Supabase configured (`@supabase/supabase-js` v2.89.0)
- Frontend does NOT have Supabase configured yet

**Target State:**
- Market data cached in Supabase (instant load)
- Wallet-specific data still fetched from blockchain (balances, staking)
- Refresh on-demand, on market creation, and every 4 hours via background job

---

## 1. Current Architecture Analysis

### 1.1 Data Fetching Flow

**Current Implementation (`useMarkets.ts`):**

```
┌─────────────────────────────────────────────────────────────────┐
│  useMarkets Hook (frontend/src/hooks/useMarkets.ts)            │
│                                                                 │
│  1. Fetch market count from Master Oracle                      │
│  2. Fetch all instance addresses (parallel batches)            │
│  3. For each market:                                            │
│     - Fetch state (open/proposed/challenged/voting/resolved)    │
│     - Fetch query (question, rules, resolution source)         │
│     - Fetch proposal data (if proposed/challenged)              │
│     - Fetch veto data (if voting)                               │
│     - Fetch rebate info (from Fee Distributor)                  │
│     - Fetch resolver reward info (v1.1)                         │
│                                                                 │
│  Total: ~50-100 API calls for 12 markets                       │
│  Time: 3-9 seconds                                              │
└─────────────────────────────────────────────────────────────────┘
```

**What Gets Fetched:**

**Market Data (CACHEABLE):**
- Market ID, address, creator
- Question, rules, resolution source
- Resolution deadline, proposal start time
- Status (open/proposed/challenged/voting/resolved)
- Proposed outcome, current bond, escalation count
- Challenge deadline, proposed timestamp
- Veto guard address, veto end time, vote counts
- Creator rebate info (address, amount, claimed status)
- Resolver reward info (address, amount, claimed status)
- Category (detected from question text)

**Wallet-Specific Data (NOT CACHEABLE - Always fetch from blockchain):**
- User's HNCH balance (`useJettonBalance.ts`)
- User's staked HNCH amount (`useStakingInfo.ts`)
- User's pending rewards (`useStakingInfo.ts`)
- User's lock time, unlock time (`useStakingInfo.ts`)

### 1.2 Network Configuration

**Current Networks:**
- Testnet: `https://testnet.tonapi.io/v2`
- Mainnet: `https://tonapi.io/v2`

Controlled via `VITE_NETWORK` env variable.

### 1.3 Supabase Status

**Main Repo (`/hunch-oracle-launchpad`):**
- `@supabase/supabase-js` v2.89.0 installed
- Supabase directory exists with migrations and edge functions
- Used for Telegram user tracking and alpha campaign

**Frontend Repo (`/hunch-oracle-launchpad/frontend`):**
- NO Supabase dependency
- NO Supabase client configuration
- Needs to be added

---

## 2. Database Schema Design

### 2.1 Tables Structure

```sql
-- ============================================
-- MARKETS TABLE
-- Stores cached market data from blockchain
-- ============================================

CREATE TABLE public.markets (
  -- Primary identifiers
  id INTEGER PRIMARY KEY,                    -- Market ID from blockchain
  address TEXT NOT NULL UNIQUE,              -- Market contract address
  network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet')),

  -- Market details
  question TEXT NOT NULL,
  rules TEXT,
  resolution_source TEXT,
  category TEXT NOT NULL CHECK (category IN ('cricket', 'champions_league', 'soccer_world_cup', 'winter_olympics', 'other')),

  -- Timestamps
  resolution_deadline BIGINT NOT NULL,       -- Unix timestamp
  proposal_start_time BIGINT NOT NULL,       -- Unix timestamp
  created_at BIGINT NOT NULL,                -- Unix timestamp from blockchain

  -- Creator info
  creator_address TEXT NOT NULL,

  -- Market status
  status TEXT NOT NULL CHECK (status IN ('open', 'proposed', 'challenged', 'voting', 'resolved')),
  can_propose_now BOOLEAN DEFAULT FALSE,

  -- Proposal data (for proposed/challenged markets)
  proposed_outcome BOOLEAN,
  current_bond_hnch NUMERIC(20, 2),          -- HNCH amount (not nanoHNCH)
  escalation_count INTEGER DEFAULT 0,
  proposed_at BIGINT,                        -- Unix timestamp
  challenge_deadline BIGINT,                 -- Unix timestamp

  -- Veto data (for voting markets)
  veto_guard_address TEXT,
  veto_end BIGINT,                           -- Unix timestamp
  veto_count INTEGER DEFAULT 0,
  support_count INTEGER DEFAULT 0,
  current_answer BOOLEAN,

  -- Rebate info (for resolved markets)
  rebate_creator_address TEXT,
  rebate_amount_hnch NUMERIC(20, 2),
  rebate_claimed BOOLEAN DEFAULT FALSE,

  -- Resolver reward info (v1.1)
  resolver_address TEXT,
  resolver_reward_hnch NUMERIC(20, 2),
  resolver_claimed BOOLEAN DEFAULT FALSE,

  -- Cache metadata
  last_updated_at TIMESTAMPTZ DEFAULT NOW(), -- Last cache update

  -- Constraints
  CONSTRAINT markets_unique_per_network UNIQUE (id, network)
);

-- Indexes for performance
CREATE INDEX idx_markets_network ON public.markets(network);
CREATE INDEX idx_markets_status ON public.markets(status);
CREATE INDEX idx_markets_category ON public.markets(category);
CREATE INDEX idx_markets_address ON public.markets(address);
CREATE INDEX idx_markets_last_updated ON public.markets(last_updated_at);
CREATE INDEX idx_markets_network_status ON public.markets(network, status);

-- ============================================
-- CACHE_METADATA TABLE
-- Tracks when cache was last refreshed
-- ============================================

CREATE TABLE public.cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL UNIQUE CHECK (network IN ('testnet', 'mainnet')),
  last_full_refresh_at TIMESTAMPTZ DEFAULT NOW(),
  last_refresh_duration_ms INTEGER,
  total_markets_cached INTEGER DEFAULT 0,
  refresh_status TEXT CHECK (refresh_status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  triggered_by TEXT CHECK (triggered_by IN ('scheduled', 'manual', 'market_creation'))
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access (markets are public data)
CREATE POLICY "Allow public read markets" ON public.markets
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read cache_metadata" ON public.cache_metadata
  FOR SELECT TO anon, authenticated
  USING (true);

-- Only service role can write (via Edge Functions)
CREATE POLICY "Service role can insert markets" ON public.markets
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update markets" ON public.markets
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete markets" ON public.markets
  FOR DELETE TO service_role
  USING (true);

CREATE POLICY "Service role can manage cache_metadata" ON public.cache_metadata
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2.2 Data Mapping

**Blockchain Data → Supabase Fields:**

| Blockchain Field | Supabase Field | Transformation |
|------------------|----------------|----------------|
| `id` | `id` | Direct copy (INTEGER) |
| `address` | `address` | Direct copy (TEXT) |
| `question` | `question` | Direct copy |
| `rules` | `rules` | Direct copy (nullable) |
| `resolutionSource` | `resolution_source` | Direct copy (nullable) |
| `resolutionDeadline` | `resolution_deadline` | Direct copy (BIGINT Unix timestamp) |
| `proposalStartTime` | `proposal_start_time` | Calculated: `resolution_deadline + 300` |
| `createdAt` | `created_at` | Direct copy (BIGINT Unix timestamp) |
| `creator` | `creator_address` | Direct copy |
| `status` | `status` | Map from state number to string |
| `proposedOutcome` | `proposed_outcome` | Direct copy (BOOLEAN, nullable) |
| `currentBond` | `current_bond_hnch` | Convert from nanoHNCH: `value / 1e9` |
| `escalationCount` | `escalation_count` | Direct copy (INTEGER) |
| `proposedAt` | `proposed_at` | Direct copy (BIGINT, nullable) |
| `challengeDeadline` | `challenge_deadline` | Direct copy (BIGINT, nullable) |
| `vetoGuardAddress` | `veto_guard_address` | Direct copy (nullable) |
| `vetoEnd` | `veto_end` | Direct copy (BIGINT, nullable) |
| `vetoCount` | `veto_count` | Direct copy (INTEGER) |
| `supportCount` | `support_count` | Direct copy (INTEGER) |
| `currentAnswer` | `current_answer` | Direct copy (BOOLEAN, nullable) |
| `rebateCreator` | `rebate_creator_address` | Direct copy (nullable) |
| `rebateAmount` | `rebate_amount_hnch` | Convert from nanoHNCH |
| `rebateClaimed` | `rebate_claimed` | Direct copy (BOOLEAN) |
| `resolverAddress` | `resolver_address` | Direct copy (nullable) |
| `resolverReward` | `resolver_reward_hnch` | Convert from nanoHNCH |
| `resolverClaimed` | `resolver_claimed` | Direct copy (BOOLEAN) |
| `category` | `category` | Detected from question text |
| Network (env var) | `network` | From `VITE_NETWORK` |
| Current time | `last_updated_at` | Auto-generated by Supabase |

---

## 3. Backend Implementation

### 3.1 Supabase Edge Function: Refresh Market Cache

**File:** `/supabase/functions/refresh-market-cache/index.ts`

**Purpose:** Fetch all market data from TON blockchain and update Supabase cache

**Trigger:**
1. HTTP POST endpoint (for manual refresh)
2. Scheduled cron job (every 4 hours)
3. Called from frontend after market creation

**Algorithm:**

```typescript
// 1. Determine network (from request or env)
const network = req.body?.network || Deno.env.get('VITE_NETWORK') || 'testnet';

// 2. Configure TON API URL
const tonapiUrl = network === 'mainnet'
  ? 'https://tonapi.io/v2'
  : 'https://testnet.tonapi.io/v2';

// 3. Fetch markets from blockchain (SAME LOGIC as useMarkets.ts)
const markets = await fetchMarketsFromBlockchain(tonapiUrl, network);

// 4. Upsert markets into Supabase (batch operation)
const { error } = await supabase
  .from('markets')
  .upsert(markets, {
    onConflict: 'address',
    ignoreDuplicates: false
  });

// 5. Update cache metadata
await supabase
  .from('cache_metadata')
  .upsert({
    network,
    last_full_refresh_at: new Date().toISOString(),
    total_markets_cached: markets.length,
    refresh_status: error ? 'failed' : 'success',
    error_message: error?.message,
    triggered_by: req.body?.triggered_by || 'manual'
  }, { onConflict: 'network' });

// 6. Return success/failure
return new Response(JSON.stringify({
  success: !error,
  markets_cached: markets.length
}));
```

**Key Implementation Details:**

- **Reuse blockchain fetching logic:** Copy the entire `useMarkets.ts` logic (it's well-tested)
- **Rate limiting:** Same batching strategy (10 requests/sec)
- **Error handling:** Partial failures should still cache successful markets
- **Network isolation:** Testnet and mainnet caches are completely separate

**Code Structure:**

```
/supabase/functions/refresh-market-cache/
  ├── index.ts                 # Main handler
  ├── blockchain-fetcher.ts    # Blockchain data fetching (copied from useMarkets.ts)
  ├── data-transformer.ts      # Transform blockchain data to Supabase schema
  └── types.ts                 # Shared types
```

### 3.2 Cron Job Configuration

**File:** `/supabase/functions/refresh-market-cache/cron.yml` (or Supabase dashboard)

```yaml
# Refresh market cache every 4 hours
- name: refresh-market-cache-testnet
  schedule: "0 */4 * * *"  # Every 4 hours at minute 0
  function: refresh-market-cache
  payload:
    network: testnet
    triggered_by: scheduled

- name: refresh-market-cache-mainnet
  schedule: "0 */4 * * *"  # Every 4 hours at minute 0
  function: refresh-market-cache
  payload:
    network: mainnet
    triggered_by: scheduled
```

**Alternative:** Use Supabase's built-in cron or external service (GitHub Actions, Vercel Cron, etc.)

---

## 4. Frontend Implementation

### 4.1 Install Supabase Client

**Steps:**

1. Add dependency to `frontend/package.json`:
   ```bash
   cd /Users/tonicaradonna/hunch-oracle-launchpad/frontend
   npm install @supabase/supabase-js@2.89.0
   ```

2. Create Supabase client config

### 4.2 Supabase Client Configuration

**File:** `/frontend/src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Supabase project URL and anon key (safe for client-side)
// These should be in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing configuration. Cache will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isCacheEnabled = () => supabase !== null;
```

**Environment Variables Required:**

Add to `/frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_NETWORK=testnet
```

### 4.3 Modified `useMarkets` Hook

**File:** `/frontend/src/hooks/useMarkets.ts`

**New Logic:**

```typescript
export function useMarkets(): UseMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheSource, setCacheSource] = useState<'supabase' | 'blockchain' | null>(null);

  const fetchMarketsFromSupabase = async (): Promise<Market[] | null> => {
    if (!isCacheEnabled()) return null;

    try {
      const network = getNetworkConfig().name;
      const { data, error } = await supabase!
        .from('markets')
        .select('*')
        .eq('network', network)
        .order('id', { ascending: true });

      if (error) throw error;

      // Transform Supabase data back to Market interface
      return data.map(transformSupabaseToMarket);
    } catch (err) {
      console.error('[Markets] Supabase fetch failed:', err);
      return null;
    }
  };

  const fetchMarketsFromBlockchain = async (): Promise<Market[]> => {
    // Existing blockchain fetching logic (keep as-is)
    // ...
  };

  const fetchMarkets = useCallback(async (forceBlockchain = false) => {
    setLoading(true);

    // Try Supabase first (unless forced to blockchain)
    if (!forceBlockchain) {
      const cachedMarkets = await fetchMarketsFromSupabase();
      if (cachedMarkets && cachedMarkets.length > 0) {
        setMarkets(cachedMarkets);
        setCacheSource('supabase');
        setLoading(false);
        return;
      }
    }

    // Fallback to blockchain (or forced refresh)
    const blockchainMarkets = await fetchMarketsFromBlockchain();
    setMarkets(blockchainMarkets);
    setCacheSource('blockchain');
    setLoading(false);
  }, []);

  // Trigger refresh function
  const triggerRefresh = useCallback(async () => {
    // Call Supabase Edge Function to refresh cache
    try {
      const network = getNetworkConfig().name;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refresh-market-cache`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ network, triggered_by: 'manual' })
        }
      );

      if (!response.ok) throw new Error('Refresh failed');

      // Re-fetch from Supabase
      await fetchMarkets(false);
    } catch (err) {
      console.error('[Markets] Manual refresh failed:', err);
      // Fallback to blockchain fetch
      await fetchMarkets(true);
    }
  }, [fetchMarkets]);

  return {
    markets,
    loading,
    refetch: triggerRefresh,  // Changed from fetchMarkets to triggerRefresh
    cacheSource,              // New: indicates data source
    loadingProgress,
  };
}
```

### 4.4 Refresh Button Enhancement

**File:** `/frontend/src/components/Markets.tsx`

**Changes:**

```tsx
// In Markets component
const { markets, loading, refetch, cacheSource } = useMarkets();

// UI Change
<button
  className="btn-refresh"
  onClick={() => refetch()}
  disabled={loading}
>
  {loading ? 'Refreshing...' : 'Refresh from Blockchain'}
</button>

{cacheSource && (
  <span className="cache-indicator">
    Data source: {cacheSource === 'supabase' ? 'Cache (fast)' : 'Blockchain (live)'}
  </span>
)}
```

### 4.5 Post-Market-Creation Refresh

**File:** `/frontend/src/components/Markets.tsx`

**Changes in `handleCreateMarket`:**

```tsx
const handleCreateMarket = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... existing validation ...

  setIsCreating(true);
  try {
    await createMarket(question, unixTimestamp, rules || undefined, resolutionSource || undefined);

    // Success! Trigger cache refresh
    alert('Market creation transaction sent!');

    // Wait 10 seconds for blockchain confirmation, then refresh cache
    setTimeout(async () => {
      await refetchMarkets(); // This will trigger Supabase Edge Function
    }, 10000);

  } catch (error: any) {
    // ... error handling ...
  } finally {
    setIsCreating(false);
  }
};
```

---

## 5. Migration Strategy

### 5.1 Phase 1: Database Setup (Week 1)

**Tasks:**
1. Create Supabase migration file for markets table
2. Create Supabase migration file for cache_metadata table
3. Test migrations locally with Supabase CLI
4. Deploy migrations to production Supabase project

**Deliverables:**
- `/supabase/migrations/YYYYMMDD_create_markets_cache.sql`
- `/supabase/migrations/YYYYMMDD_create_cache_metadata.sql`

**Testing:**
```bash
# Local Supabase
supabase start
supabase migration up

# Verify tables exist
psql $SUPABASE_DB_URL -c "SELECT * FROM public.markets LIMIT 1;"
```

### 5.2 Phase 2: Edge Function Development (Week 1-2)

**Tasks:**
1. Create `refresh-market-cache` Edge Function
2. Copy blockchain fetching logic from `useMarkets.ts`
3. Add data transformation layer
4. Test locally with `supabase functions serve`
5. Deploy to production

**Testing:**
```bash
# Local test
supabase functions serve refresh-market-cache --env-file .env.local

# Manual trigger
curl -X POST http://localhost:54321/functions/v1/refresh-market-cache \
  -H "Content-Type: application/json" \
  -d '{"network":"testnet","triggered_by":"manual"}'
```

**Deliverables:**
- `/supabase/functions/refresh-market-cache/index.ts`
- `/supabase/functions/refresh-market-cache/blockchain-fetcher.ts`
- `/supabase/functions/refresh-market-cache/data-transformer.ts`

### 5.3 Phase 3: Frontend Integration (Week 2)

**Tasks:**
1. Install `@supabase/supabase-js` in frontend
2. Create Supabase client config
3. Modify `useMarkets` hook to read from Supabase
4. Add fallback to blockchain if Supabase fails
5. Update Markets component UI

**Testing:**
- Load page with empty Supabase cache (should fallback to blockchain)
- Load page with populated cache (should be instant)
- Click "Refresh" button (should trigger Edge Function)
- Create a new market (should auto-refresh after 10 seconds)

**Deliverables:**
- Modified `/frontend/src/hooks/useMarkets.ts`
- New `/frontend/src/config/supabase.ts`
- Updated `/frontend/src/components/Markets.tsx`

### 5.4 Phase 4: Cron Job Setup (Week 2)

**Tasks:**
1. Configure 4-hour cron job in Supabase
2. Monitor first few runs
3. Set up error alerting

**Options:**
- **Option A:** Supabase built-in cron (if available)
- **Option B:** Vercel Cron (if deployed on Vercel)
- **Option C:** GitHub Actions workflow

**Deliverables:**
- Cron configuration file
- Monitoring dashboard

### 5.5 Phase 5: Testing & Optimization (Week 3)

**Test Cases:**

1. **Empty Cache Test:**
   - Clear Supabase cache
   - Load frontend
   - Verify it fetches from blockchain
   - Verify cache is populated

2. **Populated Cache Test:**
   - Ensure cache has data
   - Load frontend
   - Verify instant load (<500ms)

3. **Stale Cache Test:**
   - Load cached data
   - Create a new market on blockchain
   - Click "Refresh"
   - Verify new market appears

4. **Network Switch Test:**
   - Load testnet markets
   - Switch to mainnet
   - Verify correct markets show

5. **Wallet-Specific Data Test:**
   - Verify user balance is NOT cached
   - Verify staking info is NOT cached
   - Verify these still fetch from blockchain

**Performance Targets:**
- Initial page load: <500ms (from Supabase)
- Manual refresh: 3-9 seconds (blockchain fetch + cache update)
- Wallet data: <1 second (still from blockchain)

### 5.6 Phase 6: Production Deployment (Week 3)

**Deployment Checklist:**

- [ ] Supabase migrations applied to production
- [ ] Edge Function deployed to production
- [ ] Frontend env vars configured on Vercel
- [ ] Cron job active and tested
- [ ] Initial cache populated (run manual refresh)
- [ ] Monitoring and alerts configured
- [ ] Documentation updated

**Rollback Plan:**
- If Supabase fails, frontend automatically falls back to blockchain
- No user impact on failure (just slower load times)
- Can disable cache by removing env vars

---

## 6. Technical Considerations

### 6.1 Data Consistency

**Challenge:** Cache may be stale (up to 4 hours old)

**Solutions:**
1. **Manual Refresh Button:** Users can force update
2. **Post-Creation Refresh:** Auto-refresh after creating market
3. **Visual Indicator:** Show "Last updated: X minutes ago"
4. **Real-time Updates (Future):** Supabase Realtime subscriptions

**Cache Freshness Indicator:**

```tsx
// In Markets component
const [cacheAge, setCacheAge] = useState<number>(0);

useEffect(() => {
  if (cacheSource === 'supabase') {
    // Fetch cache metadata
    supabase
      .from('cache_metadata')
      .select('last_full_refresh_at')
      .eq('network', getNetworkConfig().name)
      .single()
      .then(({ data }) => {
        if (data) {
          const age = Date.now() - new Date(data.last_full_refresh_at).getTime();
          setCacheAge(age / 1000 / 60); // minutes
        }
      });
  }
}, [cacheSource]);

// UI
{cacheSource === 'supabase' && (
  <div className="cache-freshness">
    Data cached {Math.floor(cacheAge)} minutes ago
    <button onClick={() => refetch()}>Refresh Now</button>
  </div>
)}
```

### 6.2 Network Isolation

**Requirement:** Testnet and mainnet must have separate caches

**Implementation:**
- Every query includes `WHERE network = ?`
- Edge Function uses network from request body
- Frontend determines network from `VITE_NETWORK` env var

**Validation:**
```sql
-- Ensure no cross-network contamination
SELECT network, COUNT(*) FROM public.markets GROUP BY network;
-- Should only show one network per deployment
```

### 6.3 Wallet-Specific Data

**These MUST NOT be cached:**

1. **User's HNCH Balance** (`useJettonBalance.ts`)
   - Keep existing implementation
   - Always fetch from blockchain

2. **User's Staking Info** (`useStakingInfo.ts`)
   - Keep existing implementation
   - Always fetch from blockchain

3. **Rebate/Reward Claim Status** (per user)
   - Cache has global claim status
   - Frontend checks if connected wallet matches creator/resolver
   - Claim status fetched from blockchain on action

**No changes required to these hooks.**

### 6.4 Error Handling

**Scenarios:**

1. **Supabase is down:**
   - Frontend falls back to blockchain
   - User sees normal load time (3-9 seconds)

2. **Edge Function fails:**
   - Cache becomes stale
   - Manual refresh attempts blockchain fetch
   - Cron retries in 4 hours

3. **Blockchain API fails:**
   - Show cached data with warning
   - Allow retry

**Implementation:**

```typescript
const fetchMarkets = async () => {
  try {
    // Try Supabase first
    const cached = await fetchFromSupabase();
    if (cached) {
      setMarkets(cached);
      return;
    }
  } catch (supabaseErr) {
    console.warn('[Markets] Supabase failed, trying blockchain...', supabaseErr);
  }

  try {
    // Fallback to blockchain
    const live = await fetchFromBlockchain();
    setMarkets(live);
  } catch (blockchainErr) {
    console.error('[Markets] Both sources failed!', blockchainErr);
    setError('Failed to load markets. Please try again.');
  }
};
```

### 6.5 Rate Limiting

**TONAPI Limits:**
- Free tier: 10 requests/second
- Existing code already handles this with batching

**Supabase Limits:**
- Free tier: 500MB database, 2GB bandwidth/month
- Should be sufficient for market cache (each market ~1KB = 12KB total)

**Monitoring:**
- Track Edge Function execution count
- Alert if approaching limits

### 6.6 Security

**Supabase RLS (Row Level Security):**
- Public read access (markets are public)
- Only Edge Functions can write (service role)
- No sensitive data exposed

**API Keys:**
- Use Supabase ANON key (safe for client-side)
- Never expose SERVICE ROLE key in frontend

**Edge Function Authentication:**
- Manual refresh: requires valid anon key
- Cron job: uses service role key

---

## 7. Testing Plan

### 7.1 Unit Tests

**Backend (Edge Function):**
```typescript
// Test data transformation
describe('transformMarketData', () => {
  it('should convert blockchain data to Supabase schema', () => {
    const blockchainMarket = { /* ... */ };
    const result = transformMarketData(blockchainMarket);
    expect(result.current_bond_hnch).toBe(10000); // Not 10000000000000
  });
});

// Test upsert logic
describe('upsertMarkets', () => {
  it('should update existing markets', async () => {
    // ... test
  });
});
```

**Frontend:**
```typescript
// Test fallback logic
describe('useMarkets', () => {
  it('should fallback to blockchain if Supabase fails', async () => {
    // Mock Supabase failure
    // Verify blockchain fetch is called
  });

  it('should prefer Supabase when available', async () => {
    // Mock successful Supabase response
    // Verify blockchain is NOT called
  });
});
```

### 7.2 Integration Tests

**End-to-End Flow:**

1. **Initial Load:**
   - Start with empty Supabase cache
   - Load frontend
   - Verify markets load from blockchain
   - Verify Supabase cache is populated

2. **Cached Load:**
   - Reload frontend
   - Verify instant load (<500ms)
   - Verify data matches blockchain

3. **Manual Refresh:**
   - Click "Refresh" button
   - Verify Edge Function is called
   - Verify cache is updated
   - Verify UI shows new data

4. **Post-Creation Refresh:**
   - Create a new market
   - Wait 10 seconds
   - Verify cache includes new market

### 7.3 Performance Tests

**Metrics to Track:**

| Metric | Current (Blockchain) | Target (Supabase) |
|--------|---------------------|-------------------|
| Initial load time | 3-9 seconds | <500ms |
| Markets loaded | 12 | 12 |
| API calls | 50-100 | 1 (Supabase query) |
| Data freshness | Real-time | Up to 4 hours old |
| Fallback load time | N/A | 3-9 seconds (same as current) |

**Load Testing:**
- Simulate 100 concurrent users
- Verify Supabase handles load
- Verify Edge Function doesn't timeout

---

## 8. Deployment Steps

### 8.1 Prerequisites

**Environment Setup:**

1. **Supabase Project:**
   - Confirm project URL and keys
   - Ensure database is accessible

2. **Environment Variables:**

   **Main Repo (`.env.local`):**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **Frontend (`.env.local`):**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_NETWORK=testnet
   ```

   **Vercel (Production):**
   - Add same vars to Vercel environment settings

### 8.2 Step-by-Step Deployment

**Step 1: Database Migrations**

```bash
cd /Users/tonicaradonna/hunch-oracle-launchpad

# Create migration
supabase migration new create_markets_cache

# Edit migration file (add schema from Section 2.1)
# Apply locally
supabase db reset

# Deploy to production
supabase db push
```

**Step 2: Deploy Edge Function**

```bash
# Test locally first
supabase functions serve refresh-market-cache --env-file .env.local

# Deploy to production
supabase functions deploy refresh-market-cache --no-verify-jwt

# Test production
curl -X POST https://your-project.supabase.co/functions/v1/refresh-market-cache \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"network":"testnet","triggered_by":"manual"}'
```

**Step 3: Frontend Changes**

```bash
cd /Users/tonicaradonna/hunch-oracle-launchpad/frontend

# Install Supabase client
npm install @supabase/supabase-js@2.89.0

# Add config file (src/config/supabase.ts)
# Modify useMarkets hook
# Update Markets component

# Test locally
npm run dev

# Deploy to Vercel
git commit -am "feat: add Supabase market caching"
git push origin main
# Vercel auto-deploys
```

**Step 4: Initial Cache Population**

```bash
# Trigger manual refresh to populate cache
curl -X POST https://your-project.supabase.co/functions/v1/refresh-market-cache \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"network":"testnet","triggered_by":"manual"}'

# Verify cache
# Check Supabase dashboard -> Table Editor -> markets
```

**Step 5: Configure Cron Job**

**Option A: Supabase Cron**
- Go to Supabase Dashboard
- Database -> Cron Jobs
- Create new job: every 4 hours, call `refresh-market-cache` function

**Option B: GitHub Actions**

Create `.github/workflows/refresh-cache.yml`:
```yaml
name: Refresh Market Cache

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:  # Manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Supabase Edge Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/refresh-market-cache \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"network":"testnet","triggered_by":"scheduled"}'
```

**Step 6: Monitoring**

1. **Supabase Dashboard:**
   - Monitor Edge Function logs
   - Check database table growth
   - Review error rates

2. **Frontend Monitoring:**
   - Add console logs for cache hits
   - Track load times with `console.time()`

3. **Alerts:**
   - Set up Supabase alerts for function failures
   - Monitor cron job execution

---

## 9. Future Enhancements

### 9.1 Real-Time Updates (Phase 2)

**Goal:** Instant updates when markets change

**Implementation:**
- Use Supabase Realtime subscriptions
- Frontend subscribes to `markets` table changes
- Edge Function updates trigger real-time UI updates

```typescript
// In useMarkets hook
useEffect(() => {
  if (!supabase) return;

  const subscription = supabase
    .channel('markets-changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'markets',
        filter: `network=eq.${getNetworkConfig().name}`
      },
      (payload) => {
        console.log('[Markets] Real-time update:', payload);
        // Update local state
        setMarkets(prev => {
          // Merge new/updated market
          // ...
        });
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 9.2 Incremental Updates (Phase 2)

**Goal:** Only refresh changed markets, not all

**Implementation:**
- Track `last_updated_at` per market
- Edge Function checks blockchain for markets updated since last cache
- Only update changed records

**Benefits:**
- Faster refresh times
- Lower blockchain API usage
- Reduced database writes

### 9.3 GraphQL API (Phase 3)

**Goal:** More flexible querying

**Implementation:**
- Supabase has built-in GraphQL support
- Create GraphQL schema for markets
- Frontend uses GraphQL queries

### 9.4 Historical Data (Phase 3)

**Goal:** Track market state changes over time

**Implementation:**
- New table: `market_state_history`
- Snapshot market state on each cache refresh
- Enable historical queries (e.g., "What was the bond 2 days ago?")

---

## 10. Cost Analysis

### 10.1 Supabase Costs (Free Tier)

**Included:**
- 500MB database (markets ~1KB each = 500,000 markets supported)
- 2GB bandwidth/month (each market ~1KB = 2M reads/month)
- 500K Edge Function invocations/month
- Unlimited API requests

**Usage Estimate:**

| Resource | Per Month | Limit | % Used |
|----------|-----------|-------|--------|
| Database | ~12KB (12 markets) | 500MB | <0.01% |
| Bandwidth | ~500KB (500 page loads) | 2GB | 0.02% |
| Edge Functions | ~180 (cron) + ~100 (manual) | 500K | 0.06% |

**Conclusion:** Free tier is MORE than sufficient.

### 10.2 TONAPI Cost Savings

**Current:**
- 50-100 API calls per page load
- ~100 page loads/day = 5,000-10,000 calls/day

**With Cache:**
- 1 Supabase query per page load
- 50-100 API calls per cache refresh (every 4 hours)
- ~100 page loads/day + ~6 refreshes/day = 300-600 calls/day

**Savings:** ~90% reduction in blockchain API calls

---

## 11. Risk Assessment

### 11.1 Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Supabase downtime | Users see slow load | Low | Automatic fallback to blockchain |
| Stale cache data | Users see outdated markets | Medium | Manual refresh button, visual indicator |
| Edge Function timeout | Cache not updated | Low | Retry logic, cron retries in 4h |
| Database corruption | Data loss | Very Low | Regular backups, can rebuild from blockchain |
| Rate limit on TONAPI | Cache refresh fails | Medium | Existing batching handles this |
| Network mismatch bug | Wrong markets shown | Low | Strict WHERE network = ? filter |

### 11.2 Rollback Plan

**If caching fails completely:**

1. Remove `VITE_SUPABASE_URL` env var from Vercel
2. Frontend automatically falls back to 100% blockchain
3. Users experience normal 3-9 second load (current behavior)
4. Fix issue and re-enable cache

**Zero user impact on failure.**

---

## 12. Success Metrics

### 12.1 Key Performance Indicators (KPIs)

| Metric | Baseline (Current) | Target (With Cache) | Measurement Method |
|--------|-------------------|---------------------|-------------------|
| Initial page load time | 3-9 seconds | <500ms | Browser DevTools |
| API calls per page load | 50-100 | 1 | Network tab count |
| User-reported load issues | ~5/week | <1/week | User feedback |
| Cache hit rate | N/A | >95% | Supabase analytics |
| Manual refresh usage | N/A | <10% of sessions | Track button clicks |

### 12.2 Acceptance Criteria

**Phase 1 (MVP) is considered successful if:**

- [ ] Initial page load is <1 second (from cache)
- [ ] Fallback to blockchain works automatically
- [ ] Manual refresh updates cache within 10 seconds
- [ ] Post-market-creation refresh works reliably
- [ ] Zero data corruption (network isolation works)
- [ ] Wallet-specific data is NOT cached (privacy maintained)
- [ ] Testnet and mainnet caches are separate

---

## 13. Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1:** Database Setup | 3 days | Migrations deployed, tables created |
| **Phase 2:** Edge Function | 5 days | `refresh-market-cache` function working |
| **Phase 3:** Frontend Integration | 5 days | `useMarkets` hook uses Supabase |
| **Phase 4:** Cron Job Setup | 2 days | Automated 4-hour refreshes |
| **Phase 5:** Testing | 5 days | All test cases passing |
| **Phase 6:** Production Deployment | 2 days | Live on production |

**Total:** ~3 weeks from start to production

---

## 14. Next Steps

### Immediate Actions (This Week)

1. **Review & Approve Plan:** Get stakeholder sign-off
2. **Set Up Supabase Project:** Confirm access and credentials
3. **Create Database Schema:** Write migration files
4. **Test Schema Locally:** Verify tables work as expected

### Week 1 Tasks

- [ ] Create Supabase migrations
- [ ] Apply migrations to test environment
- [ ] Start Edge Function development
- [ ] Copy blockchain fetching logic

### Week 2 Tasks

- [ ] Complete Edge Function
- [ ] Deploy Edge Function to staging
- [ ] Install Supabase client in frontend
- [ ] Modify `useMarkets` hook
- [ ] Update Markets component UI

### Week 3 Tasks

- [ ] Set up cron job
- [ ] Comprehensive testing
- [ ] Performance benchmarking
- [ ] Production deployment
- [ ] Monitor for 48 hours

---

## 15. Appendix

### A. Code Snippets

**A.1: Supabase Client Initialization**

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isCacheEnabled = () => supabase !== null;
```

**A.2: Data Transformation Helper**

```typescript
// Helper to transform Supabase row to Market interface
function transformSupabaseToMarket(row: any): Market {
  return {
    id: row.id,
    address: row.address,
    question: row.question,
    rules: row.rules || undefined,
    resolutionSource: row.resolution_source || undefined,
    resolutionDeadline: row.resolution_deadline,
    proposalStartTime: row.proposal_start_time,
    createdAt: row.created_at,
    creator: row.creator_address,
    status: row.status,
    proposedOutcome: row.proposed_outcome,
    currentBond: row.current_bond_hnch,
    escalationCount: row.escalation_count || 0,
    canProposeNow: row.can_propose_now,
    category: row.category as MarketCategory,
    proposedAt: row.proposed_at || undefined,
    challengeDeadline: row.challenge_deadline || undefined,
    vetoGuardAddress: row.veto_guard_address || undefined,
    vetoEnd: row.veto_end || undefined,
    vetoCount: row.veto_count || 0,
    supportCount: row.support_count || 0,
    currentAnswer: row.current_answer,
    rebateCreator: row.rebate_creator_address || undefined,
    rebateAmount: row.rebate_amount_hnch,
    rebateClaimed: row.rebate_claimed || false,
    resolverAddress: row.resolver_address || undefined,
    resolverReward: row.resolver_reward_hnch,
    resolverClaimed: row.resolver_claimed || false,
  };
}
```

### B. SQL Queries

**B.1: Get Markets for Network**

```sql
SELECT * FROM public.markets
WHERE network = 'testnet'
ORDER BY id ASC;
```

**B.2: Get Cache Freshness**

```sql
SELECT
  network,
  last_full_refresh_at,
  EXTRACT(EPOCH FROM (NOW() - last_full_refresh_at)) / 60 AS minutes_since_refresh,
  total_markets_cached,
  refresh_status
FROM public.cache_metadata
WHERE network = 'testnet';
```

**B.3: Clear Old Cache (Manual Cleanup)**

```sql
-- Delete markets older than 7 days
DELETE FROM public.markets
WHERE last_updated_at < NOW() - INTERVAL '7 days';
```

### C. Environment Variable Reference

**Frontend (`.env.local` and Vercel):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_NETWORK=testnet
```

**Edge Functions (Supabase Secrets):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_NETWORK=testnet
```

### D. Monitoring Queries

**D.1: Cache Performance**

```sql
-- Track cache hits over time
SELECT
  DATE_TRUNC('hour', last_updated_at) AS hour,
  COUNT(*) AS markets_cached,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_updated_at))) / 60 AS avg_age_minutes
FROM public.markets
WHERE network = 'testnet'
GROUP BY hour
ORDER BY hour DESC
LIMIT 24;
```

**D.2: Refresh History**

```sql
-- Review recent cache refreshes
SELECT
  last_full_refresh_at,
  total_markets_cached,
  last_refresh_duration_ms / 1000.0 AS duration_seconds,
  refresh_status,
  triggered_by
FROM public.cache_metadata
ORDER BY last_full_refresh_at DESC
LIMIT 10;
```

---

## Conclusion

This implementation plan provides a complete roadmap for adding Supabase market caching to the HUNCH Oracle frontend. The design prioritizes:

1. **Performance:** <500ms initial load (vs 3-9 seconds currently)
2. **Reliability:** Automatic fallback to blockchain if cache fails
3. **Simplicity:** Minimal frontend changes, reuse existing logic
4. **Safety:** Wallet-specific data never cached, network isolation enforced
5. **Scalability:** Free tier supports 500,000 markets (current: 12)

**Key Benefits:**
- 90% reduction in blockchain API calls
- Instant page loads for returning users
- No downside risk (automatic fallback)
- Zero cost increase (free tier sufficient)

**Next Step:** Approve plan and begin Phase 1 (Database Setup).

---

**Document Version:** 1.0
**Created:** 2026-01-25
**Author:** Claude (Scrum Master Agent)
**Status:** Ready for Review
