# External Integrations

**Analysis Date:** 2026-02-01

## APIs & External Services

**Blockchain/Web3:**
- TON Connect - Wallet connection and authentication
  - SDK/Client: @tonconnect/ui-react 2.3.1
  - Component: `src/components/WalletConnect.tsx`
  - Manifest URL: https://hunch-demo-frontend.vercel.app/tonconnect-manifest.json
  - Usage: Connect user wallet, read account address, enable blockchain transactions

**Third-Party Services (Optional/Configured):**
- Telegram Web App - Native integration for Telegram users
  - Script: https://telegram.org/js/telegram-web-app.js (loaded in `index.html`)
  - Hook: `src/hooks/useTelegram.tsx`
  - Data accessed: User ID, first name, last name, username, language, premium status, theme
  - Usage: Allow Telegram users to access the app natively within Telegram

## Data Storage

**Databases:**
- Supabase (optional, for market caching)
  - Connection: VITE_SUPABASE_URL environment variable
  - API Key: VITE_SUPABASE_ANON_KEY environment variable
  - Status: Not currently active in code (configured but not integrated)
  - Intended use: Cache market data and user submissions

**Local Storage:**
- Browser localStorage (primary state persistence)
  - Zustand persist middleware: `src/store/blockchainStore.ts`
  - Key: hunch-storage
  - Data stored: User blockchain state, wallet address, balance, staking info, events
  - No server-side persistence currently implemented

**File Storage:**
- Local filesystem only (static assets in `/public`)
- CDN: Images and assets served through Vercel deployment

**Caching:**
- TanStack React Query (client-side caching)
  - Configured in `src/App.tsx`
  - Purpose: Cache server state when API integration is added
  - Currently not actively used for data fetching

## Authentication & Identity

**Auth Provider:**
- TON Connect (TON blockchain wallet)
  - Implementation: TonConnectButton component and useTonWallet hook
  - Location: `src/components/WalletConnect.tsx`
  - Behavior: Users connect real TON wallet OR use demo mode
  - State sync: Wallet address synced to blockchainStore via setAddress()
  - Demo mode fallback: "Demo Mode" button for testing without wallet

**Telegram Auth:**
- Telegram Web App native authentication
  - Location: `src/hooks/useTelegram.tsx`
  - Data: User identity retrieved from Telegram.WebApp.initDataUnsafe
  - Verification: Not currently implemented (raw data access)

## Monitoring & Observability

**Error Tracking:**
- None detected (not integrated)

**Logs:**
- Console logging only (standard browser console)
- No structured logging framework detected
- State management via Zustand with localStorage provides audit trail of actions

## CI/CD & Deployment

**Hosting:**
- Vercel (primary)
  - Project: thehunch-claude
  - Deployment: Automatic from git push to main branch
  - Domains: https://hunch.lovable.app/, https://hunch-demo-frontend.vercel.app/

**CI Pipeline:**
- Git-based automatic deployment (Vercel default)
- No custom CI configuration detected
- Build command: `npm run build` (runs vite build)
- Preview: `npm run preview` (local preview)

## Environment Configuration

**Required env vars (optional integrations):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TONAPI_KEY=your-tonapi-key
```

**Secrets location:**
- `.env.local` (git-ignored, local development)
- `.env` (if created from `.env.example`)
- Vercel environment variables (production configuration)

**Network Configuration:**
- TON network: Switched via localStorage UI toggle (not environment-based)
- No hardcoded network RPC endpoints in codebase
- Assumes useTonWallet hook handles network switching internally

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Data Flow

**Current State (Frontend-Only):**
1. User connects TON wallet via TonConnect
2. Wallet address stored in Zustand blockchainStore (localStorage persisted)
3. Mock blockchain data generated locally (in-memory state)
4. UI updates reflect local state changes only
5. No server-side persistence or API calls currently implemented

**Planned Integration Flow (from .env.example):**
1. User actions trigger events (create market, vote, stake)
2. Events could be stored via Supabase (not yet implemented)
3. TON API optional for better rate limits on chain queries (not yet implemented)
4. Query data cached via React Query (not yet actively used)

## SDK & Client Library Details

**@tonconnect/ui-react:**
- Component: `TonConnectButton` - Pre-styled wallet connect button
- Hook: `useTonWallet()` - Access connected wallet state
  - Returns: wallet object with account.address, account.chain, etc.
- Custom hook: `src/hooks/useTelegram.tsx` abstracts Telegram Web API

**Zustand Store:**
- File: `src/store/blockchainStore.ts`
- Persistence: Enabled via persist middleware
- Storage key: hunch-storage
- State shape:
  ```
  user: { address, hnchBalance, stakedBalance, delegatedTo, pendingRewards }
  events: OracleEvent[]
  protocolRevenue: number
  totalStakedGlobal: number
  isLoading: boolean
  ```

---

*Integration audit: 2026-02-01*
