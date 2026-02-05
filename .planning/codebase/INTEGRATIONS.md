# External Integrations

**Analysis Date:** 2026-02-05

## APIs & External Services

**Blockchain:**
- TON Blockchain - Prediction market smart contracts
  - SDK/Client: `@tonconnect/ui-react` 2.3.1
  - Purpose: Wallet connection, transaction signing, smart contract interaction
  - Manifest: `public/tonconnect-manifest.json` (configured for hunch-demo-frontend.vercel.app)
  - Integration: `src/main.tsx` wraps app in `TonConnectUIProvider`
  - Wallet support: TonKeeper, TonHub, OpenMask (via TonConnect protocol)

**TONAPI (Optional):**
- Service: TONAPI
  - Purpose: Enhanced rate limits for TON blockchain API calls
  - Auth: `VITE_TONAPI_KEY` environment variable
  - Status: Optional integration (better rate limits)

**Telegram WebApp:**
- Service: Telegram Mini Apps
  - Purpose: Run as Telegram bot/mini app
  - Integration: `src/hooks/useTelegram.tsx`
  - API: `window.Telegram.WebApp` global
  - Features: User detection, theme integration, viewport management
  - Status: Conditional (works standalone or inside Telegram)

## Data Storage

**Databases:**
- Supabase (Optional, Not Currently Active)
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Purpose: Market caching (mentioned in `.env.example` but no implementation detected)
  - Client: None detected in codebase
  - Status: Planned/commented out

**Client-Side Storage:**
- localStorage
  - Library: Zustand persist middleware
  - Key: `hunch-storage`
  - Purpose: Persist user wallet state, events, balances
  - Location: `src/store/blockchainStore.ts`

**Blockchain Storage:**
- TON Blockchain
  - Smart contracts store: markets, staking data, outcomes, bonds
  - Read via: TonConnect/TONAPI
  - Write via: Wallet transactions

**File Storage:**
- Static assets only (public folder)
  - Images: `public/favicon.png`, `public/og-image.png`
  - Manifest: `public/tonconnect-manifest.json`

**Caching:**
- None detected (no Redis, no service workers)

## Authentication & Identity

**Auth Provider:**
- TON Connect (Decentralized)
  - Implementation: Wallet-based authentication
  - Package: `@tonconnect/ui-react`
  - Flow: Connect wallet → Sign message → Derive address
  - Components: `src/components/WalletConnect.tsx`
  - Demo Mode: Fallback demo wallet (`EQC...DemoUser`) when no real wallet connected

**Session Management:**
- Wallet address stored in Zustand store
- Persisted to localStorage
- No traditional JWT/session tokens

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, no Bugsnag)

**Logs:**
- Console only
- No structured logging service

**Analytics:**
- None detected (no Google Analytics, no Mixpanel)

## CI/CD & Deployment

**Hosting:**
- Vercel
  - Evidence: `tonconnect-manifest.json` references `hunch-demo-frontend.vercel.app`
  - Type: Static SPA hosting

**CI Pipeline:**
- None detected in repository
- Likely using Vercel's automatic GitHub integration

**Build Output:**
- Vite static build
- Commands: `npm run build` (production), `npm run build:dev` (development build)

## Environment Configuration

**Required env vars:**
- None required for basic functionality
- All external integrations are optional

**Optional env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_TONAPI_KEY` - TONAPI rate limit key

**Secrets location:**
- `.env.local` (gitignored)
- `.env.example` provides template

**Network Configuration:**
- Network switching (mainnet/testnet) handled via localStorage
- No environment variable for network selection

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected
- Smart contract events queried via blockchain, not pushed

## Smart Contract Integration

**Contract Addresses (Testnet per app/README.md):**
- HNCH Jetton Master: `kQDkukAhHvMleIcMyLho8kJl69D3SbqPL8uROGPnvLelXOP8`
- Price Oracle: `kQDlog79RnYke1cLEd0ZkwmypTEhHi1snU5GKVEFiJs67uXa`
- Fee Distributor: `kQAaPoUoA0aakiPcHF2c2VnYixeWYxY3WQ6B1KACR_ueWfmJ`
- Master Oracle: `kQAPl-1SsNmu879wojb7y2_syC5iTbV_fB7Sjrn8mdGovDTc`

**Mainnet Contracts (per HEDERA_PORTING_GUIDE.md):**
- Master Oracle: `EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J`
- Fee Distributor: `EQDgNzF96F7yawAkZ83vEijSUlfA4YWuA_MS2ft_3fgrI3Ld`
- HNCH Jetton Master: `EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb`

**Contract Interaction:**
- Method: TonConnect wallet transactions
- State Management: `src/store/blockchainStore.ts` (currently mock implementation)
- Demo Mode: Local state simulation when wallet not connected

## Third-Party UI/CDN

**Fonts:**
- Not detected (likely system fonts or Tailwind defaults)

**CDN:**
- None detected (all assets bundled via Vite)

**External Scripts:**
- Telegram WebApp SDK (loaded conditionally from Telegram context)

## Potential Future Integrations

**Mentioned but Not Implemented:**
- Supabase for market caching (`.env.example` includes variables, no code detected)

**Hedera Migration Planned:**
- Documentation exists for porting to Hedera blockchain (`.planning/HEDERA_PORTING_GUIDE.md`)
- Would replace TON with Hedera Hashgraph
- Would replace TonConnect with HashConnect
- Would replace Jettons with Hedera Token Service (HTS)

---

*Integration audit: 2026-02-05*
