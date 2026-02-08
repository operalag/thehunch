# App-V2 Handoff Report

**Date:** 2026-02-07
**Sprint:** Frontend Upgrade — Telegram Mini App
**Status:** Scaffolding complete, deployed to Vercel, not yet production-ready

---

## Objective

Build a new frontend (app-v2) for the HUNCH Oracle prediction market dApp on TON blockchain, targeted at Telegram users as a Telegram Mini App (TMA). The new frontend runs in parallel to the existing production frontend (app/) to allow independent testing and fine-tuning before switching.

**Deployment strategy:** DNS swap — app-v2 deploys to a beta subdomain, same backend (TonAPI, Supabase, same smart contracts). When ready, swap DNS to replace the production frontend.

---

## What Was Done

### 1. Project Setup & Configuration

| File | Purpose |
|------|---------|
| `package.json` | Vite 7.2.4, React 19, Tailwind CSS 3.4, Framer Motion 11, TonConnect, @telegram-apps/sdk-react, Supabase |
| `tsconfig.json` | ES2020 target, path aliases `@/*` → `./src/*`, vite/client types |
| `vite.config.ts` | React plugin, path aliases, manual chunks (vendor/ton/telegram), port 3000 |
| `tailwind.config.ts` | Custom design system: Telegram theme variables, brand purple (#6c5ce7), glassmorphism, surface colors, semantic colors, custom animations |
| `postcss.config.js` | Tailwind + Autoprefixer |
| `index.html` | Includes `telegram-web-app.js` script, viewport-fit=cover |
| `vercel.json` | Vercel deployment config with `--legacy-peer-deps` install command, SPA rewrites, mainnet env |
| `.env.example` | Template for VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TONAPI_KEY |
| `eslint.config.js` | ESLint 9 flat config with React hooks + refresh plugins |
| `public/tonconnect-manifest.json` | TonConnect wallet manifest |

### 2. Shared Config (copied from app/)

| File | Purpose |
|------|---------|
| `src/config/networks.ts` | Testnet/mainnet config with contract addresses, TonAPI URLs, explorer links |
| `src/config/contracts.ts` | Dynamic contract address getters (HNCH Jetton Master, Master Oracle, Fee Distributor) |
| `src/config/supabase.ts` | Supabase client + MarketRow type definition |

### 3. Hooks (copied from app/)

All 6 hooks were copied verbatim from the existing app/ to maintain identical blockchain interaction logic:

| Hook | Size | Purpose |
|------|------|---------|
| `useContract.ts` | 547 lines | All blockchain operations: create market, propose, challenge, settle, claim, stake, unstake, veto, admin |
| `useMarkets.ts` | 772 lines | Fetch all markets from blockchain via TonAPI with batch processing and rate limiting |
| `useMarketsCache.ts` | 463 lines | Supabase cache layer with V6.3 testnet fallback, sync operations |
| `useStakingInfo.ts` | 423 lines | Staking data with epoch calculations, APY, unlock timing |
| `useJettonBalance.ts` | 189 lines | HNCH + TON balance with retry logic and auto-refresh |
| `useMarketParticipants.ts` | 161 lines | Participant tracking, bond winner determination |

### 4. Core App Structure

| File | Purpose |
|------|---------|
| `src/polyfills.ts` | Buffer polyfill for TON libraries |
| `src/main.tsx` | Entry point: TMA initialization (ready, expand, header/bg color), TonConnectUIProvider |
| `src/App.tsx` | Navigation controller: tab state, market detail overlay, create market overlay, admin overlay, Telegram BackButton handling, AnimatePresence page transitions |
| `src/index.css` | Tailwind directives, glass-card/glass-navbar utility classes, safe-area padding, hidden scrollbar, iOS bounce disabled |
| `src/lib/telegram.ts` | TMA utilities: getTelegramWebApp(), haptic feedback helpers (success/error/light/medium/selection), isTelegramContext(), getTelegramUser() |
| `src/lib/utils.ts` | Formatting: formatCompact(), formatBalance(), truncateAddress(), formatDuration(), timeAgo(), cn() |

### 5. UI Components

| Component | Purpose |
|-----------|---------|
| `BottomNav.tsx` | Fixed bottom nav with 4 tabs (Home, Markets, Stake, Profile), glassmorphism, Framer Motion active indicator, haptic feedback |
| `StatusBadge.tsx` | Market status pill (open=green, proposed=yellow, challenged=orange, voting=purple, resolved=gray) |
| `MarketCard.tsx` | Glassmorphism card with question, status, category, deadline countdown, bond display |
| `BalanceCard.tsx` | Gradient card: HNCH balance (large), TON balance, staked HNCH, wallet address with copy |
| `Skeleton.tsx` | Shimmer loading skeletons (base, CardSkeleton, BalanceSkeleton) |

### 6. Pages

| Page | Features |
|------|----------|
| `HomePage.tsx` | **Disconnected:** Hero with brand logo, TonConnectButton, feature cards (Predict/Earn/Resolve). **Connected:** BalanceCard, active markets list (top 3), quick action buttons (Create → CreateMarketPage, Stake → StakePage, Trade → MarketsPage) |
| `MarketsPage.tsx` | Search bar, filter tabs (All/Open/Active/Resolved), category pills, market cards with click-to-detail, refresh button, floating "+" create button |
| `MarketDetailPage.tsx` | Full market lifecycle view — see details below |
| `CreateMarketPage.tsx` | Market creation form — see details below |
| `StakePage.tsx` | Stats grid (total staked, APY, your stake, pending rewards), stake/unstake inputs with max buttons, lock timer, claim rewards with epoch info |
| `ProfilePage.tsx` | Telegram user info, wallet address with copy/explorer, network switcher, community links (Telegram, docs), admin panel access, app version info, disconnect button |
| `AdminPage.tsx` | Admin operations — see details below |

#### MarketDetailPage Details
Handles all 5 market states with contextual actions:
- **Open (waiting):** Countdown to resolution deadline / proposal start
- **Open (ready):** Propose YES/NO with bond input (min 10K HNCH)
- **Proposed/Challenged:** Current answer display, challenge with 2x bond, settle button when challenge period expired
- **Voting:** Veto/support progress bar, cast veto / counter veto / finalize
- **Resolved:** Final answer (YES/NO), winner info, claim bond reward / creator rebate / resolver reward

Also includes: expandable rules & resolution source, timeline with key dates, participants list with bonds/escalation levels, contract address.

#### CreateMarketPage Details
- Fee banner (10K HNCH) with balance check
- Question textarea (500 char limit, must be YES/NO answerable)
- Category selector pills (Cricket, Champions League, World Cup, Winter Olympics, Other)
- Resolution deadline picker (native datetime-local, 1h minimum)
- Optional expandable fields: resolution rules (2000 char), resolution source
- Fee breakdown card (60% stakers, 25% creator rebate, 10% treasury, 5% resolver)

#### AdminPage Details
- Warning banner (admin-only, unauthorized txns fail on-chain)
- Environment info (network, wallet)
- Contract addresses with explorer links and copy buttons
- **Set Fee Distributor:** Update Fee Distributor address on Master Oracle (op 0x0E)
- **Mint HNCH Tokens:** Mint to any address with amount input
- **Supabase Cache:** Sync New (incremental), Force Sync (full refresh), single market status update

### 7. Deployment

- **Vercel project:** `hunch-tma-beta`
- **Auto-assigned URL:** https://hunch-tma-beta.vercel.app
- **Build:** 691 modules, ~1.5s build time, 381 KB gzipped total
- **Git commits:**
  - `d532e9f` — feat: scaffold app-v2 Telegram Mini App frontend (38 files, 11,497 lines)
  - `9f6a1c6` — fix: add legacy-peer-deps install command for Vercel builds

---

## What Remains To Be Done

### P0 — Blocking for Beta Testing

- [ ] **Set Vercel environment variables** for `hunch-tma-beta` project:
  - `VITE_SUPABASE_URL` — copy from existing `hunch-oracle-app` project
  - `VITE_SUPABASE_ANON_KEY` — copy from existing `hunch-oracle-app` project
  - `VITE_TONAPI_KEY` — optional but recommended for rate limits
  - Then redeploy: `vercel deploy --prod` from app-v2/
- [ ] **Add custom domain** `beta.thehunch.xyz` (or `beta.thehunch.business`):
  - Vercel dashboard → Settings → Domains → Add domain
  - Add CNAME DNS record pointing to `cname.vercel-dns.com`
- [ ] **Register as Telegram Mini App** via @BotFather:
  - Create or use existing bot
  - Set Web App URL to the beta domain
  - Test in Telegram

### P1 — Functional Gaps

- [ ] **Network switcher** — ProfilePage toggle is UI-only, needs to call `setNetwork()` from networks.ts (triggers page reload)
- [ ] **Category not saved** — CreateMarketPage captures category selection but `createMarket()` doesn't send it to the contract (category is a Supabase-only field, needs to be synced after creation)
- [ ] **Market data refresh after actions** — After propose/challenge/settle, the MarketDetailPage shows stale data. Need to call `updateMarketStatus()` or refetch after successful transactions
- [ ] **Veto vote parameters** — `castVeto`/`counterVeto` in MarketDetailPage pass `0n` and `0` as stake amount and lock time. The real values need to come from `useStakingInfo` (user's actual stake amount and lock timestamp)
- [ ] **Error messages** — Transaction errors show raw error strings. Should parse common TON errors into user-friendly messages

### P2 — Missing Features

- [ ] **Token flow visualization** — Visual showing how HNCH flows through the system (create → fee distribution → staking rewards)
- [ ] **Market creation confirmation** — Show a summary/confirmation step before submitting the transaction
- [ ] **Transaction history** — Show user's past transactions (proposals, challenges, claims)
- [ ] **Push notifications** — Telegram Mini App notifications for market state changes (challenge window closing, rewards available)
- [ ] **Share market** — Telegram share button to share a market link in chats
- [ ] **Market sorting** — Sort markets by deadline, bond amount, creation date
- [ ] **Pull-to-refresh** — Mobile gesture to refresh market list

### P3 — Optimization & Polish

- [ ] **Code-splitting** — The `index` chunk is 599KB (172KB gzipped). Split MarketDetailPage, CreateMarketPage, AdminPage, StakePage into lazy-loaded routes
- [ ] **Image/logo assets** — Currently using inline SVG icons. Add proper HUNCH brand logo
- [ ] **Loading states** — Some pages show no loading indicator during first fetch
- [ ] **Empty state illustrations** — Custom illustrations for empty market list, no rewards, etc.
- [ ] **Accessibility** — Add aria-labels to icon buttons, keyboard navigation support
- [ ] **Animation tuning** — Page transitions work but could be smoother; stagger delays may feel slow on fast devices
- [ ] **Dark/light theme** — Currently dark-only; Telegram supports both themes via CSS variables
- [ ] **.gitignore** — Add `tsconfig.tsbuildinfo` to gitignore

### P4 — Pre-Production Checklist

- [ ] **End-to-end testing** — Test all market lifecycle flows on testnet (create → propose → challenge → settle → claim)
- [ ] **Wallet edge cases** — Test disconnect during transaction, wallet switch, session expiry
- [ ] **Mobile viewport testing** — Test on iPhone SE, Android small screens, Telegram desktop
- [ ] **Rate limiting** — Verify TonAPI rate limits don't cause failures without API key
- [ ] **Error boundaries** — Add React error boundaries so crashes don't blank the entire app
- [ ] **Analytics** — Add event tracking for key actions (connect wallet, create market, stake)
- [ ] **SEO/OG tags** — Add Open Graph meta tags for market sharing links
- [ ] **DNS swap plan** — Document the exact steps to swap beta → production when ready

---

## Architecture Notes

### Tech Stack
- **Build:** Vite 7.2.4 + TypeScript 5.9
- **UI:** React 19 + Tailwind CSS 3.4 + Framer Motion 11
- **Blockchain:** @ton/core + @ton/ton + @tonconnect/ui-react
- **TMA:** telegram-web-app.js + @telegram-apps/sdk-react
- **Backend:** Supabase (market cache) + TonAPI (blockchain data)
- **Deploy:** Vercel

### Navigation Model
The app uses a flat state-based navigation (not a router):
- `activeTab`: 'home' | 'markets' | 'stake' | 'profile'
- `selectedMarket`: Market | null → shows MarketDetailPage overlay
- `showCreateMarket`: boolean → shows CreateMarketPage overlay
- `showAdmin`: boolean → shows AdminPage overlay

Telegram BackButton is wired to close overlays in reverse order, then navigate back to home tab.

### Contract Addresses (Testnet)
- HNCH Jetton Master: `kQDiGlipbnCEHokWD7984TwKSjy52X5O_omWhVbw5FH4jeWf`
- Master Oracle: `kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf`
- Fee Distributor: `kQAeRl5W6SpCoQwjXzFz-iYDNI8Td8XC4O0K3rmYNvoM9LVF`

### Contract Addresses (Mainnet)
- HNCH Jetton Master: `EQD529CGTmX1Tgcsn3vYBfUPKrVdgermb1T8o5MKLGOGdHpb`
- Master Oracle: `EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J`
- Fee Distributor: `EQAJmXOgU62n3hkN6RcZv1I5MIdqFqK6sFit3Z7bktKj61QU`

### Known Peer Dependency Issue
`@ton/ton@16.2.2` requires `@ton/core@>=0.63.0` but we pin `@ton/core@^0.62.0`. This is resolved with `--legacy-peer-deps` during install. Both versions are compatible at runtime. The Vercel install command is configured accordingly in `vercel.json`.

### File Count
- 38 source files
- 11,497 lines of code
- 691 modules in production build
