# HUNCH Oracle Protocol - Data Integration Guide

> How themoon.business prediction market backend can sync with and access all HUNCH market data.
> Last updated: 2026-02-08

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Contract Addresses](#2-contract-addresses)
3. [On-Chain Data: Smart Contracts](#3-on-chain-data-smart-contracts)
   - 3.1 Master Oracle
   - 3.2 Oracle Instance (per market)
   - 3.3 Fee Distributor
   - 3.4 HNCH Jetton Master & Wallet
   - 3.5 Price Oracle
   - 3.6 Veto Guard
4. [Off-Chain Data: Supabase](#4-off-chain-data-supabase)
   - 4.1 Markets Table
   - 4.2 Market Participants Table
   - 4.3 Cache Metadata & Sync State
   - 4.4 Alpha/Campaign Tables
5. [API Access Patterns](#5-api-access-patterns)
   - 5.1 TONAPI Getter Calls
   - 5.2 Supabase REST Queries
   - 5.3 Supabase Edge Functions
6. [Data Flow: How Markets Are Created & Resolved](#6-data-flow)
7. [Complete Market Load Sequence](#7-complete-market-load-sequence)
8. [TonConnect Wallet Interactions](#8-tonconnect-wallet-interactions)
9. [Rate Limiting & Optimization](#9-rate-limiting)
10. [Integration Recipes for themoon.business](#10-integration-recipes)

---

## 1. ARCHITECTURE OVERVIEW

```
+-------------------------------------------------------------------+
|                    TON BLOCKCHAIN (Source of Truth)                 |
|                                                                     |
|  Master Oracle ─── Oracle Instance #0 (market)                     |
|       │          ├── Oracle Instance #1 (market)                   |
|       │          ├── Oracle Instance #2 (market)                   |
|       │          └── Oracle Instance #N (market)                   |
|       │                                                             |
|       ├── Fee Distributor (rewards, epochs, rebates)               |
|       ├── HNCH Jetton Master (token supply, wallets)               |
|       ├── Price Oracle (HNCH/TON, TON/USD prices)                  |
|       └── Veto Guards (per-market DAO voting)                      |
+-------------------------------------------------------------------+
          │                               │
          │ TONAPI (REST)                  │ Supabase Edge Function
          │ (blockchain view calls)        │ (sync-markets)
          ▼                               ▼
+-------------------+          +------------------------+
| themoon.business  |          | Supabase Database      |
| Backend           |◄────────►| (Market Cache)         |
| (your service)    |          | - markets              |
+-------------------+          | - market_participants  |
                               | - cache_metadata       |
                               | - sync_state           |
                               +------------------------+
```

**Two ways to read HUNCH data:**
1. **Direct blockchain reads** via TONAPI (real-time, authoritative, rate-limited)
2. **Supabase cache** (fast, pre-parsed, public read access with anon key)

---

## 2. CONTRACT ADDRESSES

### Mainnet (V6.6 - Active)

| Contract | Address | Explorer |
|----------|---------|----------|
| **Master Oracle** | `EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J` | [View](https://tonviewer.com/EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J) |
| **Fee Distributor** | `EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW` | [View](https://tonviewer.com/EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW) |
| **HNCH Jetton Master** | `EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb` | [View](https://tonviewer.com/EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb) |

### Testnet (V6.2)

| Contract | Address |
|----------|---------|
| **Master Oracle** | `kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf` |
| **Fee Distributor** | `kQAeRl5W6SpCoQwjXzFz-iYDNI8Td8XC4O0K3rmYNvoM9LVF` |
| **HNCH Jetton Master** | `kQDiGlipbnCEHokWD7984TwKSjy52X5O_omWhVbw5FH4jeWf` |

### TONAPI Base URLs

| Network | Base URL |
|---------|----------|
| Mainnet | `https://tonapi.io/v2` |
| Testnet | `https://testnet.tonapi.io/v2` |

---

## 3. ON-CHAIN DATA: SMART CONTRACTS

### 3.1 Master Oracle (V6.3)

The Master Oracle is the registry of all markets, stakers, and protocol parameters.

#### Getter Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get_next_instance_id()` | none | `int` | Total market count (0-indexed). Call this first to know how many markets exist. |
| `get_instance(id)` | `int` instance_id | `(slice address, int created_at, slice creator)` | Get market contract address, creation time, and creator for a specific market ID. |
| `get_total_staked()` | none | `int` | Total HNCH staked across all stakers (nanoHNCH, divide by 1e9). |
| `get_stake_info(address)` | user address | `(int stake, int lock_time)` | User's stake amount (nanoHNCH) and lock timestamp. |
| `get_stake(address)` | user address | `int` | User's stake amount only. |
| `get_oracle_params()` | none | `(int base_bond, int challenge_period, int veto_threshold, int max_esc, int veto_lock)` | Protocol parameters. |
| `get_delegate(address)` | user address | `slice` | Who the user delegated voting power to. |
| `get_veto_guard(instance_addr)` | market address | `slice` | Active VetoGuard contract address for a market in voting state. |
| `can_vote(address)` | user address | `int` | -1 if user meets veto requirements (2% stake + 24h lock), 0 otherwise. |
| `get_admin()` | none | `slice` | Current admin address. |
| `get_pending_admin()` | none | `slice` | Pending admin (V6 two-step transfer). |
| `get_my_jetton_wallet()` | none | `slice` | Master Oracle's own HNCH wallet address. |

#### TONAPI Call Examples

```bash
# Get total number of markets
GET https://tonapi.io/v2/blockchain/accounts/EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J/methods/get_next_instance_id

# Get market #0 info (address, created_at, creator)
GET https://tonapi.io/v2/blockchain/accounts/EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J/methods/get_instance?args=0

# Get total HNCH staked
GET https://tonapi.io/v2/blockchain/accounts/EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J/methods/get_total_staked

# Get user's stake info (use non-bounceable UQ... format for address arg)
GET https://tonapi.io/v2/blockchain/accounts/EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J/methods/get_stake_info?args=UQ...userAddress
```

#### Storage Layout (On-Chain)

```
Main Cell (4 refs):
├─ Ref 1 (addresses): admin, guardian, pending_admin, hnch_master, price_oracle, fee_distributor, jetton_wallet
├─ Ref 2 (params): base_bond, challenge_period, veto_threshold_bps, max_escalations
├─ Ref 3 (state):
│  ├─ instance_code (Cell)
│  ├─ total_staked (Coins)
│  ├─ next_instance_id (uint64)
│  ├─ staker_registry (Dict256: addr_hash → {stake, lock_time, snapshots})
│  ├─ instances (Dict64: id → {address, created_at, creator})
│  └─ delegations (Dict256: addr_hash → delegate_address)
└─ Ref 4 (veto): veto_guard_code, active_veto_guards (Dict256)
```

---

### 3.2 Oracle Instance (Per Market)

Each prediction market is a separate Oracle Instance contract deployed by the Master Oracle.

#### States

```
0 = OPEN       (waiting for proposals)
1 = PROPOSED   (initial proposal made, challenge period active)
2 = CHALLENGED (challenge made, escalating bond)
3 = VOTING     (DAO voting after max escalations)
4 = RESOLVED   (final answer set, rewards distributable)
```

#### Getter Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get_instance_state()` | none | `(id, state, esc_count, total_bonds, resolution_method, deadline)` | Full market state. `state` is 0-4 per above. |
| `get_query()` | none | `cell` | Market question, rules, resolution source. Stored as nested cell refs containing string data. |
| `get_current_proposal()` | none | `(slice proposer, int answer, int bond, int proposed_at, int deadline)` | Active proposal. `answer`: 0=NO, -1=YES. |
| `get_final_answer()` | none | `int` | Resolved answer (only valid when state=4). 0=NO, -1=YES. |
| `get_required_bond()` | none | `int` | Bond amount needed for next propose/challenge (nanoHNCH). |
| `get_bond_info(address)` | user address | `(int amount, int answer, int claimed)` | User's bond position on this market. |
| `get_resolution_deadline()` | none | `int` | When the resolution period starts (Unix timestamp). |
| `can_propose_now()` | none | `int` | -1 if proposals are open, 0 otherwise. |
| `get_reward_totals()` | none | `(int winner_total, int loser_total)` | Total bonds on winning vs losing side. |
| `get_bond_totals()` | none | `(int yes_bonds, int no_bonds)` | Total YES vs NO bonds (V6). |
| `get_expected_reward(address)` | user address | `int` | Expected payout if user is on winning side. |
| `get_my_jetton_wallet()` | none | `slice` | Instance's own HNCH wallet. |

#### TONAPI Call Examples

```bash
# Get market state (replace {MARKET_ADDR} with Oracle Instance address)
GET https://tonapi.io/v2/blockchain/accounts/{MARKET_ADDR}/methods/get_instance_state

# Get market question/rules (returns cell that needs parsing)
GET https://tonapi.io/v2/blockchain/accounts/{MARKET_ADDR}/methods/get_query

# Get current proposal
GET https://tonapi.io/v2/blockchain/accounts/{MARKET_ADDR}/methods/get_current_proposal

# Get user's bond on this market
GET https://tonapi.io/v2/blockchain/accounts/{MARKET_ADDR}/methods/get_bond_info?args=UQ...userAddress
```

#### Parsing the Query Cell

The `get_query()` response returns a BOC (Bag of Cells). Structure:

```
Root Cell:
├─ Ref 0: question string (loadStringTail)
├─ Ref 1: rules string (loadStringTail)
└─ Ref 2: resolution_source string (loadStringTail)
```

To parse with @ton/core:
```typescript
import { Cell } from '@ton/core';

const boc = Buffer.from(response.stack[0].cell, 'base64');
const cell = Cell.fromBoc(boc)[0];
const slice = cell.beginParse();
const question = slice.loadRef().beginParse().loadStringTail();
const rules = slice.loadRef().beginParse().loadStringTail();
const source = slice.loadRef().beginParse().loadStringTail();
```

#### Storage Layout (On-Chain)

```
Main Cell:
├─ Ref 1 (core): id, master, hnch_master, fee_distributor, jetton_wallet,
│                 query(Cell), created_at, resolution_deadline,
│                 yes_bonds_total, no_bonds_total, winner_total, loser_total
└─ Ref 2 (state): state(uint8), escalation_count, total_bonds_escrowed,
                   current_proposal(Cell), final_answer, resolved_at,
                   resolution_method, bonds(Dict256: addr_hash → bond_data)
```

---

### 3.3 Fee Distributor (V6.6)

Handles protocol fee distribution: 60% stakers, 25% creator rebate, 10% treasury, 5% resolver.

#### Getter Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `get_epoch_info()` | none | `(int epoch, int start, int rewards, int time_until_next)` | Current epoch number, start timestamp, accumulated rewards (nanoHNCH), seconds until next epoch. |
| `get_epoch_data(epoch_id)` | `int` epoch number | `(int rewards, int staked)` | Finalized epoch's total rewards and staked snapshot. |
| `get_user_last_claim(address)` | user address | `int` | Last epoch claimed by user (-1 = never). |
| `get_pending_rewards(address, stake)` | user address, user stake amount | `int` | Exact claimable rewards across all finalized epochs (nanoHNCH). |
| `get_pending_treasury()` | none | `int` | Treasury balance waiting for distribution. |
| `get_creator_rebate(instance_addr)` | market address | `(slice creator, int amount, int claimed)` | Creator rebate for a market. |
| `get_resolver_reward(instance_addr)` | market address | `(slice resolver, int amount, int claimed)` | Resolver reward for a market. |
| `get_my_jetton_wallet()` | none | `slice` | Fee Distributor's own HNCH wallet. |
| `get_last_distribution()` | none | `int` | Timestamp of last treasury distribution. |
| `is_claim_pending(query_id)` | `int` query_id | `int` | -1 if pending, 0 if not (bounce recovery tracking). |

#### TONAPI Call Examples

```bash
# Get current epoch info
GET https://tonapi.io/v2/blockchain/accounts/EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW/methods/get_epoch_info

# Get finalized epoch 0 data (rewards + staked snapshot)
GET https://tonapi.io/v2/blockchain/accounts/EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW/methods/get_epoch_data?args=0

# Get user's claimable rewards (pass address + their stake amount)
GET https://tonapi.io/v2/blockchain/accounts/EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW/methods/get_pending_rewards?args=UQ...userAddr&args=20000000000000000

# Get creator rebate for a specific market
GET https://tonapi.io/v2/blockchain/accounts/EQDd_J6o-OIFGPRdkjN6GTHe1g5noAIZpjBsXOX2KY9hKTdW/methods/get_creator_rebate?args=EQ...marketAddr
```

#### Epoch System

- Epoch duration: **24 hours** (86,400 seconds)
- Epoch 0 started at contract deployment
- Each epoch snapshots total staked and accumulated rewards
- Rewards from finalized epochs are claimable; current epoch rewards are not
- Epochs auto-advance when any transaction calls `maybe_advance_epoch()`

#### Storage Layout (On-Chain)

```
Main Cell (4 refs):
├─ Ref 1: master_address, hnch_master, treasury_address, my_jetton_wallet
├─ Ref 2: pending_treasury, last_distribution, distribution_interval
├─ Ref 3: current_epoch, epoch_start, current_epoch_rewards
└─ Ref 4 (dicts):
   ├─ epoch_data (Dict32: epoch → {rewards, staked})
   ├─ user_claims (Dict256: addr_hash → last_claimed_epoch)
   ├─ creator_rebates (Dict256: instance_hash → {creator, amount, claimed})
   └─ Nested Ref:
      ├─ resolver_rewards (Dict256: instance_hash → {resolver, amount, claimed})
      └─ pending_claims (Dict64: query_id → {claimer, last_epoch, amount})
```

---

### 3.4 HNCH Jetton Master & Wallet

Standard TEP-74 Jetton. 1 billion HNCH supply, 9 decimals.

#### Jetton Master Getters

| Method | Returns | Description |
|--------|---------|-------------|
| `get_jetton_data()` | `(int supply, int mintable, slice admin, cell content, cell code)` | Token metadata. |
| `get_wallet_address(owner)` | `slice` | Deterministic wallet address for any owner. |
| `is_paused()` | `int` | -1 if paused, 0 if active. |

#### Jetton Wallet Getters

| Method | Returns | Description |
|--------|---------|-------------|
| `get_wallet_balance()` | `int` | Balance in nanoHNCH. |
| `get_wallet_data()` | `(int balance, slice owner, slice master, cell code)` | Full wallet data. |

#### TONAPI Shortcut (No Cell Parsing Needed)

```bash
# Get user's HNCH balance via TONAPI accounts endpoint
GET https://tonapi.io/v2/accounts/{USER_ADDRESS}/jettons/EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb
# Returns: { wallet_address, balance, ... }
```

---

### 3.5 Price Oracle

Provides HNCH/TON and TON/USD prices for dual-anchor bond calculation.

#### Getter Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_prices()` | `(int hnch_ton, int ton_usd, int hnch_usd, int last_updated)` | All prices (9 decimals). |
| `get_hnch_usd_price()` | `int` | HNCH/USD price (9 decimals). |
| `calculate_dual_anchor_bond(base, min_usd)` | `int` | Required bond ensuring minimum USD value. |

---

### 3.6 Veto Guard (Per Escalated Market)

Deployed when a market reaches max escalations and enters DAO voting.

#### Getter Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_veto_status()` | `(int veto_end, int current_answer, int veto_count, int support_count)` | Voting status. |

---

## 4. OFF-CHAIN DATA: SUPABASE

### Connection Details

```
Supabase Project: oogoitdpytaborwzjnno.supabase.co
Anon Key:         Available in VITE_SUPABASE_ANON_KEY env var
Service Role Key: Available in SUPABASE_SERVICE_ROLE_KEY (for writes)
```

Both testnet and mainnet data live in the same Supabase project, separated by `network` column.

**RLS Policies:**
- `markets`: Public READ (anon key), Service Role WRITE
- `market_participants`: Public READ (anon key), Service Role WRITE
- `cache_metadata`: Public READ (anon key), Service Role WRITE

### 4.1 Markets Table

The primary cache for on-chain market data. Pre-parsed and indexed for fast queries.

```sql
CREATE TABLE markets (
  -- Identity
  id                    INTEGER NOT NULL,
  network               TEXT NOT NULL DEFAULT 'testnet',    -- 'testnet' | 'mainnet'
  address               TEXT NOT NULL,                      -- Oracle Instance contract addr

  -- Market Content
  question              TEXT NOT NULL,
  rules                 TEXT,
  resolution_source     TEXT,
  resolution_deadline   BIGINT NOT NULL,                    -- Unix timestamp
  proposal_start_time   BIGINT NOT NULL,                    -- deadline + 300s
  created_at            BIGINT NOT NULL,                    -- Unix timestamp
  creator               TEXT NOT NULL,                      -- Creator wallet address

  -- State
  status                TEXT NOT NULL,                      -- 'open'|'proposed'|'challenged'|'voting'|'resolved'
  proposed_outcome      BOOLEAN,                            -- YES=true, NO=false, null=no proposal
  current_bond          NUMERIC(20, 9),                     -- Current bond in HNCH
  escalation_count      INTEGER,                            -- 0-3
  can_propose_now       BOOLEAN,
  category              TEXT NOT NULL,                      -- 'cricket'|'champions_league'|'soccer_world_cup'|'winter_olympics'|'other'

  -- Proposal Timeline
  proposed_at           BIGINT,
  challenge_deadline    BIGINT,

  -- Veto Guard (voting state markets)
  veto_guard_address    TEXT,
  veto_end              BIGINT,
  veto_count            INTEGER,
  support_count         INTEGER,
  current_answer        BOOLEAN,

  -- Creator Rebate (25% of market creation fee)
  rebate_creator        TEXT,
  rebate_amount         NUMERIC(20, 9),                     -- HNCH
  rebate_claimed        BOOLEAN,

  -- Resolver Reward (5% of market creation fee)
  resolver_address      TEXT,
  resolver_reward       NUMERIC(20, 9),                     -- HNCH
  resolver_claimed      BOOLEAN,

  -- Metadata
  cached_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (id, network)
);

-- Key indexes for fast queries
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_network ON markets(network);
CREATE INDEX idx_markets_address ON markets(address);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_creator ON markets(creator);
CREATE INDEX idx_markets_created_at ON markets(created_at);
CREATE INDEX idx_markets_resolution_deadline ON markets(resolution_deadline);
```

### 4.2 Market Participants Table

Tracks every propose and challenge action for bond-winner determination.

```sql
CREATE TABLE market_participants (
  id                    BIGSERIAL PRIMARY KEY,
  market_id             INTEGER,
  network               TEXT NOT NULL,                      -- 'testnet' | 'mainnet'
  market_address        TEXT NOT NULL,                      -- Oracle Instance address
  participant_address   TEXT NOT NULL,                      -- Wallet that bonded
  action                TEXT NOT NULL,                      -- 'propose' | 'challenge'
  answer                BOOLEAN NOT NULL,                   -- YES=true, NO=false
  bond_amount           BIGINT NOT NULL,                    -- nanoHNCH (divide by 1e9)
  escalation_level      INTEGER DEFAULT 0,                  -- 0=initial, 1-3=escalated
  timestamp             INTEGER,                            -- Unix timestamp
  tx_hash               TEXT,                               -- TON transaction hash
  created_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(market_address, participant_address, escalation_level)
);

CREATE INDEX idx_participants_market ON market_participants(market_address);
CREATE INDEX idx_participants_network ON market_participants(network);
```

### 4.3 Cache Metadata & Sync State

```sql
-- Tracks cache refresh health
CREATE TABLE cache_metadata (
  network               TEXT PRIMARY KEY,                   -- 'testnet' | 'mainnet'
  last_refresh_at       TIMESTAMPTZ,
  refresh_status        TEXT,                               -- 'idle' | 'refreshing' | 'error'
  total_markets         INTEGER,
  error_message         TEXT,
  refresh_duration_ms   INTEGER,
  updated_at            TIMESTAMPTZ
);

-- Tracks blockchain sync progress (logical time)
CREATE TABLE sync_state (
  id                    SERIAL PRIMARY KEY,
  network               TEXT NOT NULL,
  master_oracle_address TEXT,
  last_processed_lt     TEXT,                               -- TON logical time
  last_synced_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 Alpha/Campaign Tables (Telegram Mini App)

Additional tables for the gamification/campaign layer (not core to market data):

- `alpha_users` - Telegram users (telegram_id, ton_wallet, points)
- `alpha_registrations` - Public signups (email, wallet, country)
- `clans` / `clan_memberships` - Team system
- `checkins` - Daily login streaks
- `point_transactions` - Points audit trail
- `referrals` - Referral tracking
- `alpha_leaderboards` - Periodic snapshots

---

## 5. API ACCESS PATTERNS

### 5.1 TONAPI Getter Calls

**Authentication:** Optional but recommended. Pass API key as Bearer token.

```bash
# With API key (higher rate limits)
curl -H "Authorization: Bearer YOUR_TONAPI_KEY" \
  "https://tonapi.io/v2/blockchain/accounts/{ADDRESS}/methods/{METHOD}?args={ARG1}&args={ARG2}"

# Without API key (lower rate limits)
curl "https://tonapi.io/v2/blockchain/accounts/{ADDRESS}/methods/{METHOD}"
```

**Response format:**

```json
{
  "success": true,
  "exit_code": 0,
  "stack": [
    { "type": "num", "num": "0x1" },
    { "type": "cell", "cell": "te6cc..." },
    { "type": "num", "num": "0x5f5e100" }
  ]
}
```

**Parsing hex values:**
- Numbers: `"0x5f5e100"` = `parseInt("0x5f5e100", 16)` = `100000000`
- Addresses: Cell BOC → parse with @ton/core → `Address.parse()`
- Strings: Cell BOC → `loadStringTail()`

### 5.2 Supabase REST Queries

themoon.business can query the Supabase cache directly with the anon key:

```bash
# Get all mainnet markets (fast, pre-parsed, no blockchain calls needed)
curl "https://oogoitdpytaborwzjnno.supabase.co/rest/v1/markets?network=eq.mainnet&order=created_at.desc" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get all markets with status 'open'
curl "https://oogoitdpytaborwzjnno.supabase.co/rest/v1/markets?network=eq.mainnet&status=eq.open" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get participants for a specific market
curl "https://oogoitdpytaborwzjnno.supabase.co/rest/v1/market_participants?market_address=eq.EQ...&network=eq.mainnet&order=timestamp.asc" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**JavaScript/TypeScript:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oogoitdpytaborwzjnno.supabase.co',
  'YOUR_ANON_KEY'
);

// Get all mainnet markets
const { data: markets } = await supabase
  .from('markets')
  .select('*')
  .eq('network', 'mainnet')
  .order('created_at', { ascending: false });

// Get participants for a market
const { data: participants } = await supabase
  .from('market_participants')
  .select('*')
  .eq('market_address', 'EQ...')
  .eq('network', 'mainnet')
  .order('timestamp', { ascending: true });
```

### 5.3 Supabase Edge Function: sync-markets

Triggers blockchain sync to update the cache.

```bash
POST https://oogoitdpytaborwzjnno.supabase.co/functions/v1/sync-markets
Headers:
  Authorization: Bearer YOUR_ANON_KEY
  Content-Type: application/json

# Sync all mainnet markets
Body: { "network": "mainnet" }

# Force full refresh
Body: { "network": "mainnet", "force": true }

# Update a specific market's status
Body: { "network": "mainnet", "update_status": true, "market_address": "EQ..." }

# Sync both networks
Body: { "network": "both" }
```

---

## 6. DATA FLOW

### Market Creation Flow

```
1. User sends 10,000 HNCH to Master Oracle (op: transfer_notification → inner op: 0x01 create_instance)
2. Master Oracle deploys new Oracle Instance contract
3. Instance sends instance_deployed (op: 0x07) back to Master
4. Master registers in instances dict: {id, address, created_at, creator}
5. 10,000 HNCH fee forwarded to Fee Distributor (op: 0x33 receive_market_fee)
   → 60% (6,000) added to current_epoch_rewards (stakers)
   → 25% (2,500) stored in creator_rebates dict
   → 10% (1,000) added to pending_treasury
   → 5%  (500) reserved for resolver_rewards
6. sync-markets Edge Function detects new market → inserts into Supabase
```

### Propose / Challenge Flow

```
1. User sends HNCH bond to Oracle Instance (op: transfer_notification → inner op: 0x10 propose or 0x11 challenge)
2. Instance stores bond in bonds dict, updates state
3. Bond amount escalates: base → 2x → 4x → 8x per escalation level
4. If max escalations reached → triggers DAO vote (op: 0x05 trigger_dao_vote)
5. sync-markets detects participant transaction → inserts into market_participants
```

### Resolution Flow

```
1. Challenge period expires without challenge → anyone calls settle (op: 0x13)
2. OR DAO vote completes → VetoGuard sends result to Master → Master sends to Instance
3. Instance sets final_answer, state = RESOLVED
4. Winning bonders claim: bond + proportional share of losers' bonds (op: 0x14 claim_reward)
5. Market fee already distributed at creation time
```

### Staking & Rewards Flow

```
1. User sends HNCH to Master Oracle (inner op: 0x03 stake)
2. Master adds to staker_registry, increments total_staked
3. Fees from market creation flow to Fee Distributor
4. Every 24h, epoch advances: current rewards → epoch_data, new epoch starts
5. User claims via Master Oracle (op: 0x09 → forwarded to Fee Distributor op: 0x32)
6. Fee Distributor calculates: sum of (epoch_rewards * user_stake / epoch_staked) for each finalized epoch
7. Sends HNCH reward to user via jetton transfer
```

---

## 7. COMPLETE MARKET LOAD SEQUENCE

### Option A: Supabase Cache (Fast, Recommended)

```typescript
// Step 1: Get all markets (single query, ~50ms)
const { data: markets } = await supabase
  .from('markets')
  .select('*')
  .eq('network', 'mainnet')
  .order('created_at', { ascending: false });

// Step 2: For resolved markets, get participants to determine winners
const resolvedAddresses = markets.filter(m => m.status === 'resolved').map(m => m.address);
const { data: participants } = await supabase
  .from('market_participants')
  .select('*')
  .in('market_address', resolvedAddresses)
  .eq('network', 'mainnet');

// Step 3: Optionally refresh stale data from blockchain
// Call sync-markets edge function periodically
```

### Option B: Direct Blockchain (Authoritative, Slower)

```typescript
// Step 1: Get market count
const countResp = await fetch(`${TONAPI}/blockchain/accounts/${MASTER}/methods/get_next_instance_id`);
const count = parseHex(countResp.stack[0].num);

// Step 2: For each market ID (0 to count-1), get address
for (let id = 0; id < count; id++) {
  const instanceResp = await fetch(`${TONAPI}/blockchain/accounts/${MASTER}/methods/get_instance?args=${id}`);
  const marketAddr = parseCellAddress(instanceResp.stack[0]); // Parse cell BOC
  const createdAt = parseHex(instanceResp.stack[1].num);
  const creator = parseCellAddress(instanceResp.stack[2]);

  // Step 3: Get market state
  const stateResp = await fetch(`${TONAPI}/blockchain/accounts/${marketAddr}/methods/get_instance_state`);
  const state = parseHex(stateResp.stack[1].num); // 0-4

  // Step 4: Get question/rules (parse cell)
  const queryResp = await fetch(`${TONAPI}/blockchain/accounts/${marketAddr}/methods/get_query`);
  const { question, rules, source } = parseQueryCell(queryResp.stack[0].cell);

  // Step 5: If proposed/challenged, get proposal
  if (state === 1 || state === 2) {
    const propResp = await fetch(`${TONAPI}/blockchain/accounts/${marketAddr}/methods/get_current_proposal`);
    // Parse: answer, bond, proposed_at, deadline
  }
}
```

**Note:** Option B requires many sequential TONAPI calls. With 50 markets and 4 calls each = 200 API calls. At free tier rates (~1/sec), this takes ~3-4 minutes. Use Option A for production.

---

## 8. TONCONNECT WALLET INTERACTIONS

For sending transactions (not just reading), users interact via TonConnect.

### Op Codes Reference

| Operation | Op Code | Target Contract | Method |
|-----------|---------|----------------|--------|
| Create Market | 0x01 | Master Oracle | Jetton transfer with forward_payload |
| Stake HNCH | 0x03 | Master Oracle | Jetton transfer with forward_payload |
| Unstake HNCH | 0x04 | Master Oracle | Direct message |
| Claim Staker Rewards | 0x09 | Master Oracle | Direct message (0.1 TON) |
| Propose Answer | 0x10 | Oracle Instance | Jetton transfer with forward_payload |
| Challenge Answer | 0x11 | Oracle Instance | Jetton transfer with forward_payload |
| Settle Market | 0x13 | Oracle Instance | Direct message (0.05 TON) |
| Claim Bond Reward | 0x14 | Oracle Instance | Direct message (0.1 TON) |
| Claim Creator Rebate | 0x34 | Fee Distributor | Direct message (0.1 TON) |
| Claim Resolver Reward | 0x37 | Fee Distributor | Direct message (0.1 TON) |
| Cast Veto | 0x41 | Veto Guard | Direct message (0.05 TON) |
| Counter Veto | 0x44 | Veto Guard | Direct message (0.05 TON) |

### Transaction Format (Jetton Transfer with Inner Op)

```typescript
// Example: Propose YES on a market with 10,000 HNCH bond
const body = beginCell()
  .storeUint(0x0f8a7ea5, 32)        // op: jetton transfer
  .storeUint(Date.now(), 64)         // query_id
  .storeCoins(10000n * 1000000000n)  // amount: 10,000 HNCH in nano
  .storeAddress(marketAddress)        // destination: Oracle Instance
  .storeAddress(userAddress)          // response_destination
  .storeBit(0)                        // no custom_payload
  .storeCoins(toNano('0.1'))         // forward_ton_amount
  .storeBit(1)                        // has forward_payload
  .storeRef(
    beginCell()
      .storeUint(0x10, 32)           // inner op: propose
      .storeInt(-1, 1)               // answer: YES (-1) or NO (0)
      .endCell()
  )
  .endCell();
```

---

## 9. RATE LIMITING & OPTIMIZATION

### TONAPI Rate Limits

| Tier | Parallel Requests | Recommended Delay | Throughput |
|------|-------------------|-------------------|------------|
| Free (no key) | 2 | 2.5s between batches | ~0.8 req/s |
| API Key | 10 | 1.1s between batches | ~9 req/s |

### Retry Strategy

```typescript
async function fetchTonApi(url: string, retries = 5): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (resp.status === 429) {
      await sleep(2000 * (i + 1)); // Exponential backoff
      continue;
    }
    if (resp.ok) return resp.json();
    throw new Error(`TONAPI ${resp.status}`);
  }
  throw new Error('Max retries');
}
```

### Optimization Strategy for themoon.business

1. **Primary: Use Supabase cache** for market listings (single query, no rate limits)
2. **Secondary: Direct TONAPI** for real-time data (user balances, live proposal status)
3. **Background: Periodic sync** via edge function (every 5 minutes or on-demand)
4. **Webhook: Monitor Master Oracle transactions** for instant new-market detection

---

## 10. INTEGRATION RECIPES FOR THEMOON.BUSINESS

### Recipe 1: Display All HUNCH Markets

```typescript
// Fast path: Supabase cache
const { data: markets } = await supabase
  .from('markets')
  .select('id, address, question, rules, status, category, created_at, resolution_deadline, proposed_outcome, current_bond, escalation_count, creator')
  .eq('network', 'mainnet')
  .order('created_at', { ascending: false });

// Each market has: question, rules, status, category, bonds, deadlines, creator
```

### Recipe 2: Get Real-Time Market Status

```typescript
// For a specific market, get live blockchain state
const stateResp = await fetchTonApi(
  `https://tonapi.io/v2/blockchain/accounts/${marketAddress}/methods/get_instance_state`
);
const state = parseInt(stateResp.stack[1].num, 16); // 0=open, 1=proposed, 2=challenged, 3=voting, 4=resolved

if (state === 1 || state === 2) {
  const propResp = await fetchTonApi(
    `https://tonapi.io/v2/blockchain/accounts/${marketAddress}/methods/get_current_proposal`
  );
  // propResp.stack: [proposer, answer, bond, proposed_at, deadline]
}
```

### Recipe 3: Get Staking Stats

```typescript
const totalStaked = await fetchTonApi(
  `https://tonapi.io/v2/blockchain/accounts/${MASTER_ORACLE}/methods/get_total_staked`
);
const epochInfo = await fetchTonApi(
  `https://tonapi.io/v2/blockchain/accounts/${FEE_DISTRIBUTOR}/methods/get_epoch_info`
);
// epochInfo.stack: [current_epoch, epoch_start, current_epoch_rewards, time_until_next]
```

### Recipe 4: Get User's Full Portfolio

```typescript
const addr = 'UQ...userNonBounceable';

// HNCH wallet balance
const balance = await fetch(`https://tonapi.io/v2/accounts/${addr}/jettons/${HNCH_MASTER}`);

// Staking info
const stakeInfo = await fetchTonApi(
  `${TONAPI}/blockchain/accounts/${MASTER_ORACLE}/methods/get_stake_info?args=${encodeURIComponent(addr)}`
);

// Claimable rewards
const rewards = await fetchTonApi(
  `${TONAPI}/blockchain/accounts/${FEE_DISTRIBUTOR}/methods/get_pending_rewards?args=${encodeURIComponent(addr)}&args=${stakeAmount}`
);

// Bond positions on each market
for (const market of markets) {
  const bond = await fetchTonApi(
    `${TONAPI}/blockchain/accounts/${market.address}/methods/get_bond_info?args=${encodeURIComponent(addr)}`
  );
  // bond.stack: [amount, answer, claimed]
}
```

### Recipe 5: Listen for New Markets

```typescript
// Poll for new markets every 60 seconds
let lastKnownCount = 0;

setInterval(async () => {
  const resp = await fetchTonApi(
    `${TONAPI}/blockchain/accounts/${MASTER_ORACLE}/methods/get_next_instance_id`
  );
  const currentCount = parseInt(resp.stack[0].num, 16);

  if (currentCount > lastKnownCount) {
    // New markets detected!
    for (let id = lastKnownCount; id < currentCount; id++) {
      const instance = await fetchTonApi(
        `${TONAPI}/blockchain/accounts/${MASTER_ORACLE}/methods/get_instance?args=${id}`
      );
      // Process new market...
    }
    lastKnownCount = currentCount;
  }
}, 60000);
```

### Recipe 6: Trigger Cache Refresh

```typescript
// Force sync after detecting a state change
await fetch('https://oogoitdpytaborwzjnno.supabase.co/functions/v1/sync-markets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ network: 'mainnet', force: true }),
});
```

---

## PROTOCOL PARAMETERS

| Parameter | Value | Description |
|-----------|-------|-------------|
| Market creation fee | 10,000 HNCH | Paid when creating a market |
| Base bond | 10,000 HNCH | Initial propose/challenge bond |
| Bond escalation | 2x per level | 10K → 20K → 40K → 80K |
| Max escalations | 3 | 4th escalation triggers DAO vote |
| Challenge period | 2h (initial), 4h (escalated) | Time to challenge a proposal |
| Epoch duration | 24 hours | Staking reward period |
| Staker share | 60% | Of protocol fees |
| Creator rebate | 25% | Of market creation fee |
| Treasury share | 10% | Of protocol fees |
| Resolver share | 5% | Of protocol fees |
| Veto threshold | 2% of supply | 2M HNCH + 24h lock for veto |
| HNCH supply | 1 billion | 9 decimals |

---

## ADDRESS FORMAT NOTES

TONAPI accepts different address formats depending on the endpoint:

| Format | Example | When to Use |
|--------|---------|-------------|
| Raw | `0:abc123...` | Internal calculations |
| Bounceable | `EQ...` (mainnet), `kQ...` (testnet) | Contract addresses, default format |
| Non-bounceable | `UQ...` (mainnet), `0Q...` (testnet) | User wallet addresses, TONAPI args |

**Rule of thumb:** Use non-bounceable (UQ...) format when passing user addresses as `args` to TONAPI getter calls. Use bounceable (EQ...) for contract addresses in the URL path.

```typescript
import { Address } from '@ton/core';
const addr = Address.parse('EQ...');
const nonBounceable = addr.toString({ bounceable: false, testOnly: false }); // UQ...
```
