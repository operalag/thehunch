# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Decentralized prediction market platform with layered frontend architecture using React + Vite.

**Key Characteristics:**
- Dual-application structure: marketing frontend (`/src`) and production app (`/app/src`)
- TON blockchain integration for smart contract interactions
- Supabase caching layer for market data optimization
- Component-driven UI with Radix UI/shadcn primitive library
- State management via Zustand and React hooks
- Network-aware configuration (testnet/mainnet switching)

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI and handle user interactions
- Location: `/src/components/`, `/src/pages/`, `/app/src/components/`
- Contains: React components (`.tsx`), UI primitives, feature sections
- Depends on: hooks, store, utils
- Used by: React Router pages in `/src/pages/`

**Data Management Layer (Hooks):**
- Purpose: Encapsulate blockchain and API logic; fetch/cache market and user data
- Location: `/app/src/hooks/`
- Contains: Custom React hooks (`useMarkets`, `useContract`, `useJettonBalance`, `useStakingInfo`, `useMarketsCache`)
- Depends on: config (contracts, networks), Supabase client, TonConnect, @ton libraries
- Used by: Components requiring blockchain state

**Configuration Layer:**
- Purpose: Centralize environment setup and network-specific values
- Location: `/app/src/config/`
- Contains: `contracts.ts` (contract addresses with getters), `networks.ts` (testnet/mainnet config), `supabase.ts` (Supabase client and cache functions)
- Depends on: environment variables
- Used by: hooks and components

**State Management Layer:**
- Purpose: Global application state for older mock data flow
- Location: `/src/store/blockchainStore.ts`
- Contains: Zustand store with `useBlockchainStore` hook
- Depends on: none (mock data)
- Used by: Legacy pages that still reference blockchain state

**Styling:**
- Purpose: Application appearance and theme
- Location: `/src/index.css`, `/src/App.css`, `/app/src/index.css`, `/app/src/App.css`, `/app/src/components/TokenFlow.css`
- Contains: Global styles, component scoped styles, Tailwind configuration
- Applied via: Tailwind CSS + custom CSS

## Data Flow

**Market Data Fetch Flow (Primary):**

1. Component renders (e.g., `Markets.tsx`)
2. Component calls `useMarketsCache()` or `useMarkets()` hook
3. Hook checks Supabase cache first (via `supabase.ts`)
4. If cached data available and fresh: return cached data
5. If no cache: fetch from TON blockchain via TonAPI (`getNetworkConfig().tonapiUrl`)
6. Hook performs rate-limited batch requests (2 req/sec free tier, 10 with API key) via `fetchInBatches()`
7. Results returned to component; component updates UI
8. Optional: Write to Supabase cache for next load

**User Wallet Flow:**

1. User clicks wallet connect in Header
2. TonConnect UI prompt opens (TonConnectUIProvider wrapper)
3. User selects wallet (TonKeeper, etc.)
4. `useTonWallet()` and `useTonAddress()` hooks update in components
5. Dashboard renders with wallet address via `useTonAddress()`
6. useJettonBalance fetches HNCH tokens for connected address
7. Components display balance and enable transaction buttons

**Transaction Flow:**

1. User initiates action (stake, propose, challenge)
2. Component calls `useContract()` hook function (e.g., `stake()`, `proposeOutcome()`)
3. Hook builds TON message body with operation code (OP_CODES) and parameters
4. Hook sends via TonConnect (`tonConnectUI.sendTransaction()`)
5. User confirms in wallet UI
6. Transaction broadcasts to network
7. Hook optionally updates cache via `updateMarketInCache()`

**Market Creation Flow:**

1. User accesses `/app/create` page (in marketing site) or CreateMarket component
2. User fills market form (question, outcomes, resolution deadline, category)
3. Form submits to `stake()` or market creation hook
4. Hook creates transaction with MARKET_CREATION_FEE deducted
5. On success: market inserted into Supabase cache via `insertMarketToCache()`
6. Markets list refreshes showing new market

**State Management:**

- **User State:** TonConnect wallet connection (via hooks `useTonWallet()`, `useTonAddress()`)
- **Market State:** Fetched from blockchain (via hooks) or Supabase cache (fallback/optimization)
- **Network State:** Read from `localStorage` at app load (in `networks.ts::getCurrentNetwork()`)
- **Legacy Mock State:** Zustand store in `/src/store/blockchainStore.ts` (used only in legacy pages)

## Key Abstractions

**Custom Hooks:**
- Purpose: Encapsulate blockchain/API logic; provide React state and lifecycle
- Examples: `useMarkets` (fetch markets with caching), `useContract` (send transactions), `useJettonBalance` (fetch token balance), `useStakingInfo` (fetch user stake)
- Pattern: Use React hooks (`useState`, `useEffect`, `useCallback`) to manage async data and error states

**Configuration Getters:**
- Purpose: Provide fresh network/contract values at runtime (avoid module caching issues)
- Examples: `CONTRACTS.MASTER_ORACLE` (getter), `getNetworkConfig()` (getter), `CURRENT_NETWORK` (constant)
- Pattern: Use getter functions and export constants evaluated at module load

**Supabase Cache Layer:**
- Purpose: Reduce blockchain API calls by caching market data
- Examples: `insertMarketToCache()`, `updateMarketInCache()`, `supabase` client
- Pattern: Optional cache (graceful degradation if Supabase unavailable)

**TonConnect Integration:**
- Purpose: Wrap app in TonConnectUIProvider; enable wallet connection via hooks
- Examples: `useTonWallet()`, `useTonAddress()`, `useTonConnectUI()`
- Pattern: Provider pattern in `main.tsx`; hooks in components

**Rate Limiting & Batching:**
- Purpose: Handle TonAPI free tier limits (~1 req/sec) and prevent rate limiting
- Examples: `fetchInBatches()`, `fetchWithRetry()`, batch size of 2 (free) or 10 (with key)
- Pattern: Queue requests in batches; exponential backoff on 429 errors

## Entry Points

**Marketing Site Entry (`src/main.tsx`):**
- Location: `/Users/tonicaradonna/thehunch-claude/src/main.tsx`
- Triggers: Browser loads root URL
- Responsibilities: Render App with React Router, TonConnect provider

**Application Entry (`app/src/main.tsx`):**
- Location: `/Users/tonicaradonna/thehunch-claude/app/src/main.tsx`
- Triggers: Browser loads `/app/*` routes
- Responsibilities: Import polyfills, render App with TonConnect provider, StrictMode for dev

**App Router (`src/App.tsx`):**
- Location: `/Users/tonicaradonna/thehunch-claude/src/App.tsx`
- Triggers: On component mount
- Responsibilities: Define routes (marketing pages + app dashboard), wrap with providers (QueryClient, TooltipProvider)

**App Component (`app/src/App.tsx`):**
- Location: `/Users/tonicaradonna/thehunch-claude/app/src/App.tsx`
- Triggers: On component mount after TonConnect provider
- Responsibilities: Lazy-load heavy components (Dashboard, Stake, TokenFlow, Markets); wrap with ErrorBoundary and Suspense; display network indicator

## Error Handling

**Strategy:** Component-level error boundaries + try-catch in hooks + API request retry logic

**Patterns:**

- **Error Boundary:** `<ErrorBoundary>` component catches React render errors; displays fallback UI
- **Async Errors:** Hooks use `try-catch` in `useEffect` or async functions; set error state on failure
- **API Retry:** `fetchWithRetry()` in useMarkets implements exponential backoff (1s, 2s, 4s) up to 3 retries
- **Rate Limit Handling:** 429 responses trigger retry with doubled delay
- **Graceful Degradation:** If Supabase unavailable, fetch from blockchain instead; if API key missing, use conservative rate limits

**Example:** In `Markets.tsx`, failed dashboard load shows `<ErrorFallback>` UI without crashing the page

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.log()`, `console.error()` throughout codebase
- Examples: `[Markets]` prefix in useMarkets, `[getJettonWallet]` prefix in useContract
- Pattern: Prefix logs with component/function name for debugging

**Validation:**
- Approach: Zod schemas (imported but not extensively used in core logic)
- Pattern: Validate user input in forms; validate API responses before use
- Examples: Network config validates contract addresses are strings

**Authentication:**
- Approach: TonConnect wallet connection (no centralized auth server)
- Pattern: User identity = TON wallet address; checked via `useTonWallet()` and `useTonAddress()`
- Examples: Dashboard shows "Connect wallet" prompt if no address

**Network Awareness:**
- Approach: Configuration layer switches contracts/URLs based on network
- Pattern: `getCurrentNetwork()` reads from localStorage; `getNetworkConfig()` returns network-specific values
- Examples: Testnet uses `TESTNET_CONFIG.contracts.MASTER_ORACLE`; mainnet uses `MAINNET_CONFIG.contracts.MASTER_ORACLE`

**Caching:**
- Approach: Supabase for market data; React hooks for component state
- Pattern: Cache on insert/update; optional (graceful degradation)
- Examples: Markets cache fetched once, updated on market changes

---

*Architecture analysis: 2026-02-01*
