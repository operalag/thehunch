# Architecture

**Analysis Date:** 2026-02-05

## Pattern Overview

**Overall:** Dual-Application Frontend Architecture

**Key Characteristics:**
- Two separate React applications sharing design system but serving different purposes
- Marketing/landing site (`/src`) with client-side routing
- Blockchain dApp (`/app/src`) with TON blockchain integration
- State management via Zustand for mock data (landing) and React hooks for blockchain data (dApp)
- External data caching via Supabase for blockchain market data

## Layers

**Presentation Layer (Landing Site):**
- Purpose: Marketing and user acquisition
- Location: `/src`
- Contains: Page components, UI components from shadcn/ui, hero sections, FAQ
- Depends on: React Router DOM, Framer Motion for animations, TonConnect for wallet preview
- Used by: Public visitors, potential users

**Presentation Layer (dApp):**
- Purpose: Blockchain interaction and prediction market management
- Location: `/app/src`
- Contains: Dashboard, Markets, Staking interfaces, blockchain transaction components
- Depends on: TON SDK, TonConnect, custom hooks for contract interaction
- Used by: Connected wallet users

**Business Logic Layer (dApp):**
- Purpose: Encapsulate blockchain interactions and data fetching
- Location: `/app/src/hooks`
- Contains: `useContract.ts`, `useMarkets.ts`, `useStakingInfo.ts`, `useJettonBalance.ts`
- Depends on: TON libraries (`@ton/core`, `@ton/ton`), TonConnect, network configuration
- Used by: Presentation components

**State Management Layer (Landing):**
- Purpose: Mock blockchain state for demonstration
- Location: `/src/store/blockchainStore.ts`
- Contains: Zustand store with mock events, user state, protocol revenue
- Depends on: Zustand with persist middleware
- Used by: Landing site pages and components

**Configuration Layer:**
- Purpose: Environment-specific settings and contract addresses
- Location: `/app/src/config`
- Contains: `networks.ts`, `contracts.ts`, `supabase.ts`
- Depends on: Environment variables, localStorage for network selection
- Used by: All blockchain interaction hooks

**Data Caching Layer:**
- Purpose: Improve performance by caching blockchain market data
- Location: Supabase (external), accessed via `/app/src/config/supabase.ts` and `/app/src/hooks/useMarketsCache.ts`
- Contains: Market metadata, status, cached blockchain state
- Depends on: Supabase client SDK
- Used by: Market display components

**UI Component Library:**
- Purpose: Reusable design system components
- Location: `/src/components/ui` (landing), shared design tokens
- Contains: shadcn/ui components (Button, Card, Dialog, Form elements)
- Depends on: Radix UI primitives, Tailwind CSS
- Used by: Both landing and dApp presentation layers

## Data Flow

**Wallet Connection Flow:**

1. User clicks "Connect Wallet" in Header (`/app/src/components/Header.tsx`)
2. TonConnect UI modal opens (via `@tonconnect/ui-react`)
3. User selects wallet and approves connection
4. `useTonWallet()` and `useTonAddress()` hooks receive wallet data
5. All contract interaction hooks now have access to user address

**Market Creation Flow:**

1. User fills form in Markets component (`/app/src/components/Markets.tsx`)
2. Component calls `createMarket()` from `useContract()` hook
3. Hook constructs cell payload with OP_CODE (0x01), question, rules, deadline
4. Jetton transfer transaction sent to Master Oracle contract
5. Transaction confirmed on TON blockchain
6. Market data cached to Supabase via `insertMarketToCache()` (`/app/src/config/supabase.ts`)
7. Cache refresh triggered, UI updates with new market

**Market Display Flow (with Cache):**

1. `Markets` component uses `useMarketsCache()` hook
2. Hook fetches from Supabase: `SELECT * FROM markets WHERE network = ?`
3. Cache returns array of `MarketRow` objects with pre-fetched blockchain state
4. For fresh data, hook can optionally query blockchain directly via `useMarkets()`
5. Component renders market cards with cached data
6. Background refresh updates cache periodically

**Staking Flow:**

1. User enters amount in Stake component (`/app/src/components/Stake.tsx`)
2. Component calls `stake(amount)` from `useContract()` hook
3. Hook gets user's jetton wallet address via TonAPI
4. Constructs jetton transfer with forward_payload containing stake OP_CODE (0x03)
5. Transaction routes: User Jetton Wallet → Master Oracle → Fee Distributor
6. `useStakingInfo()` hook polls blockchain for updated staked balance
7. UI updates with new stake amount and rewards

**State Management:**

- Landing site: Zustand store with persist middleware to localStorage
- dApp: No global state, uses React Query pattern via hooks that fetch blockchain state
- Network selection: localStorage (`ton-network` key) via `getCurrentNetwork()` in `networks.ts`

## Key Abstractions

**Contract Interaction (useContract):**
- Purpose: Encapsulates all blockchain transaction logic
- Examples: `/app/src/hooks/useContract.ts`
- Pattern: Hook returns functions (createMarket, stake, propose, challenge) that construct TON cells and send transactions via TonConnect

**Market Data Fetching (useMarkets / useMarketsCache):**
- Purpose: Abstract blockchain querying and caching logic
- Examples: `/app/src/hooks/useMarkets.ts`, `/app/src/hooks/useMarketsCache.ts`
- Pattern: Hooks expose market arrays, loading states, and refresh functions; internally manage TonAPI calls and Supabase queries

**Network Configuration:**
- Purpose: Single source of truth for testnet/mainnet settings
- Examples: `/app/src/config/networks.ts`
- Pattern: Getter functions (`getNetworkConfig()`) return network-specific contract addresses and API endpoints based on localStorage selection

**Blockchain Store (Mock):**
- Purpose: Simulate blockchain state for landing site demo
- Examples: `/src/store/blockchainStore.ts`
- Pattern: Zustand store with actions that mimic contract operations with setTimeout delays

## Entry Points

**Landing Site:**
- Location: `/src/main.tsx`
- Triggers: Browser navigation to `/`
- Responsibilities: Renders React app with TonConnectUIProvider, initializes React Router with landing pages (Index, FAQ, Whitepaper, etc.)

**dApp:**
- Location: `/app/src/main.tsx`
- Triggers: Direct navigation or build target
- Responsibilities: Renders App component with TonConnect provider, initializes error boundaries and lazy-loaded sections

**Vite Dev Server:**
- Location: Root `vite.config.ts` and `/app/vite.config.ts`
- Triggers: `npm run dev` command
- Responsibilities: Hot module replacement, path alias resolution (`@/*`), SWC compilation

**Landing App Component:**
- Location: `/src/App.tsx`
- Triggers: After main.tsx renders
- Responsibilities: Sets up routing (BrowserRouter), provides QueryClient and TooltipProvider context, defines route structure

**dApp App Component:**
- Location: `/app/src/App.tsx`
- Triggers: After main.tsx renders
- Responsibilities: Renders Header, lazy-loads Dashboard/Markets/Stake/TokenFlow with error boundaries, displays network indicator

## Error Handling

**Strategy:** Error Boundaries with Graceful Degradation

**Patterns:**
- dApp uses React Error Boundaries (`/app/src/components/ErrorBoundary.tsx`) around each major section
- Sections fail independently without crashing entire app
- Contract hooks return `{ error: string | null }` in result objects
- Transaction failures caught with try/catch, displayed via toast notifications
- Network errors handled by falling back from cache to direct blockchain queries

## Cross-Cutting Concerns

**Logging:** Console logging for development (`console.log`, `console.error`); hooks prefix logs with `[hookName]` for debugging (e.g., `[getJettonWallet]`)

**Validation:** Form validation in landing site uses React Hook Form + Zod schemas; dApp validates transaction parameters (min bond, address format) in hooks before sending

**Authentication:** TonConnect handles wallet connection and signing; no traditional auth system; user identity is TON wallet address

---

*Architecture analysis: 2026-02-05*
