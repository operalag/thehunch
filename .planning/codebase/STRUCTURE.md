# Codebase Structure

**Analysis Date:** 2026-02-05

## Directory Layout

```
thehunch-claude/
├── app/                    # Blockchain dApp (production app)
│   ├── src/               # dApp source code
│   ├── supabase/          # Database migrations and edge functions
│   ├── docs/              # dApp-specific documentation
│   └── public/            # dApp static assets
├── src/                   # Landing site source code
├── public/                # Landing site static assets
├── .planning/             # GSD planning documents
│   └── codebase/          # Codebase analysis documents
├── dist/                  # Build output (generated)
└── node_modules/          # Dependencies (generated)
```

## Directory Purposes

**`/app`:**
- Purpose: Complete blockchain dApp for interacting with HUNCH prediction markets
- Contains: Full React application with TON integration, contract hooks, caching layer
- Key files: `/app/src/App.tsx` (entry), `/app/src/hooks/useContract.ts` (blockchain interactions), `/app/src/config/networks.ts` (network config)

**`/app/src`:**
- Purpose: dApp source code
- Contains: Components, hooks, configuration, TypeScript sources
- Key files: `App.tsx`, `main.tsx`, `App.css`

**`/app/src/components`:**
- Purpose: dApp UI components
- Contains: `Dashboard.tsx`, `Markets.tsx`, `Stake.tsx`, `Stats.tsx`, `TokenFlow.tsx`, `Header.tsx`, `ErrorBoundary.tsx`
- Key files: `Markets.tsx` (2,957 lines - main market interaction UI), `Stake.tsx` (staking interface)

**`/app/src/hooks`:**
- Purpose: Custom React hooks for blockchain data and interactions
- Contains: Contract interaction, market fetching, balance queries, caching logic
- Key files: `useContract.ts` (transaction builder), `useMarkets.ts` (blockchain queries), `useMarketsCache.ts` (Supabase cache), `useStakingInfo.ts`, `useJettonBalance.ts`, `useMasterOracleBalance.ts`, `useMarketParticipants.ts`

**`/app/src/config`:**
- Purpose: Environment and network configuration
- Contains: Network settings, contract addresses, Supabase client
- Key files: `networks.ts` (testnet/mainnet config), `contracts.ts` (contract addresses), `supabase.ts` (caching config)

**`/app/supabase`:**
- Purpose: Database schema and serverless functions
- Contains: SQL migrations, Edge Functions for market cache refresh
- Key files: `migrations/` (database schema), `functions/sync-markets/` (cache refresh function)

**`/app/docs`:**
- Purpose: Technical documentation for dApp
- Contains: Implementation guides, test plans, deployment docs
- Key files: `IMPLEMENTATION_SUMMARY.md`, `TEST_PLAN.md`, `DEPLOYMENT.md`, `QUICKSTART.md`

**`/src`:**
- Purpose: Landing site source code (marketing/demo site)
- Contains: Landing pages, marketing components, mock blockchain store
- Key files: `App.tsx` (router setup), `main.tsx` (entry point)

**`/src/pages`:**
- Purpose: Landing site page components
- Contains: Route-level components for each landing page
- Key files: `Index.tsx`, `Dashboard.tsx`, `MarketDetails.tsx`, `CreateMarket.tsx`, `Staking.tsx`, `Membership.tsx`, `FAQ.tsx`, `Whitepaper.tsx`, `NotFound.tsx`

**`/src/components`:**
- Purpose: Landing site shared components
- Contains: Navigation, Hero, sections, modals
- Key files: `Navigation.tsx`, `Hero.tsx`, `WalletConnect.tsx`, `StealthModeSection.tsx`, `FAQSection.tsx`, `WaitlistModal.tsx`

**`/src/components/ui`:**
- Purpose: Reusable UI component library (shadcn/ui)
- Contains: Button, Card, Dialog, Form elements, etc.
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `tabs.tsx`, `toast.tsx`

**`/src/store`:**
- Purpose: State management for landing site
- Contains: Zustand store with mock blockchain data
- Key files: `blockchainStore.ts` (mock events, user state, actions)

**`/src/hooks`:**
- Purpose: Custom React hooks for landing site
- Contains: UI helpers, toast management, Telegram integration
- Key files: `use-toast.ts`, `use-mobile.tsx`, `useTelegram.tsx`

**`/src/lib`:**
- Purpose: Utility functions for landing site
- Contains: Tailwind class merging utility
- Key files: `utils.ts` (cn() function)

**`/src/assets`:**
- Purpose: Images, videos, graphics for landing site
- Contains: PNG images, GIF animations, MP4 video
- Key files: `hunch-logo.png`, `hunch-icon.png`, `hero-animation.mp4`, `circuit-visual.png`, `platinum-pattern.gif`

**`/public`:**
- Purpose: Static assets served directly
- Contains: Favicon, manifest, static files for landing site
- Key files: `tonconnect-manifest.json`

**`/.planning`:**
- Purpose: GSD planning and analysis documents
- Contains: Codebase analysis, implementation plans
- Key files: `HEDERA_PORTING_GUIDE.md`, `codebase/` (this directory)

**`/.planning/codebase`:**
- Purpose: Codebase analysis documents for GSD commands
- Contains: Architecture, structure, stack, conventions, etc.
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md` (this document)

## Key File Locations

**Entry Points:**
- `/src/main.tsx`: Landing site entry point (React 18, TonConnect wrapper)
- `/app/src/main.tsx`: dApp entry point (React 19, TonConnect wrapper)
- `/index.html`: Root HTML for landing site
- `/app/index.html`: Root HTML for dApp

**Configuration:**
- `/vite.config.ts`: Vite config for landing site (port 8080, @ alias to /src)
- `/app/vite.config.ts`: Vite config for dApp
- `/tsconfig.json`: TypeScript config (references app and node configs)
- `/tsconfig.app.json`: App-specific TypeScript settings
- `/tailwind.config.ts`: Tailwind CSS configuration
- `/postcss.config.js`: PostCSS configuration
- `/eslint.config.js`: ESLint configuration (both apps)
- `/components.json`: shadcn/ui configuration

**Core Logic:**
- `/app/src/hooks/useContract.ts`: All blockchain transaction logic (create market, stake, propose, challenge, settle)
- `/app/src/hooks/useMarkets.ts`: Direct blockchain market queries via TonAPI
- `/app/src/hooks/useMarketsCache.ts`: Supabase-cached market data
- `/app/src/config/networks.ts`: Network configuration and switching
- `/src/store/blockchainStore.ts`: Mock blockchain state for landing site demo

**Testing:**
- No test files detected in current structure
- Test configuration files: `jest.config.*`, `vitest.config.*` not present

## Naming Conventions

**Files:**
- Components: PascalCase with .tsx extension (`Dashboard.tsx`, `Markets.tsx`, `WalletConnect.tsx`)
- Hooks: camelCase with .ts/.tsx extension, prefixed with "use" (`useContract.ts`, `useMarkets.ts`)
- Config: camelCase with .ts extension (`networks.ts`, `contracts.ts`, `supabase.ts`)
- UI components: kebab-case with .tsx extension (`alert-dialog.tsx`, `scroll-area.tsx`)
- Types: Defined in same file as implementation or in `.d.ts` files
- Styles: Same name as component with .css extension (`App.css`, `TokenFlow.css`)

**Directories:**
- Lowercase with hyphens for multi-word names (not observed, mostly single words)
- Lowercase single words: `src`, `hooks`, `components`, `config`, `assets`, `public`
- Special: `ui` subdirectory for shadcn/ui components

## Where to Add New Code

**New Blockchain Feature (dApp):**
- Primary code: `/app/src/components/[FeatureName].tsx`
- Contract interaction: Add methods to `/app/src/hooks/useContract.ts` or create new hook in `/app/src/hooks/use[Feature].ts`
- Import and render in `/app/src/App.tsx` within an ErrorBoundary

**New Landing Page:**
- Primary code: `/src/pages/[PageName].tsx`
- Add route to `/src/App.tsx` in the `<Routes>` component
- Add navigation link in `/src/components/Navigation.tsx`

**New Component/Module:**
- Implementation: `/src/components/[ComponentName].tsx` (landing) or `/app/src/components/[ComponentName].tsx` (dApp)
- Shared UI component: `/src/components/ui/[component-name].tsx` (follows shadcn/ui pattern)

**Utilities:**
- Shared helpers: `/src/lib/utils.ts` (landing) or create `/app/src/lib/utils.ts` (dApp)
- Blockchain utilities: Add to `/app/src/hooks/useContract.ts` or create specialized utility file in `/app/src/lib/`

**New Hook:**
- Landing site: `/src/hooks/use[HookName].tsx`
- dApp: `/app/src/hooks/use[HookName].ts` (blockchain-related hooks use .ts, UI hooks can use .tsx)

**Configuration:**
- Network settings: `/app/src/config/networks.ts` (add to TESTNET_CONFIG or MAINNET_CONFIG)
- Contract addresses: `/app/src/config/contracts.ts` (update CONTRACTS object)
- Environment variables: `/app/.env.local` (not committed), documented in `/app/.env.example`

**Database Schema:**
- Supabase migrations: `/app/supabase/migrations/[timestamp]_[description].sql`
- Edge functions: `/app/supabase/functions/[function-name]/index.ts`

**Assets:**
- Images/media: `/src/assets/[filename]` (landing) or `/app/src/assets/[filename]` (dApp)
- Static files: `/public/[filename]` (landing) or `/app/public/[filename]` (dApp)

## Special Directories

**`/node_modules`:**
- Purpose: NPM dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**`/dist`:**
- Purpose: Production build output
- Generated: Yes (via npm run build)
- Committed: No (in .gitignore)

**`/app/node_modules`:**
- Purpose: dApp-specific dependencies
- Generated: Yes (via npm install in /app directory)
- Committed: No (in .gitignore)

**`/.vercel` and `/app/.vercel`:**
- Purpose: Vercel deployment configuration
- Generated: Yes (by Vercel CLI)
- Committed: No (in .gitignore)

**`/.planning/codebase`:**
- Purpose: Codebase analysis documents for GSD system
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes (helps future Claude instances understand the codebase)

**`/.claude`:**
- Purpose: Claude Desktop configuration
- Generated: No (manually created)
- Committed: Depends on project settings

**`/.git`:**
- Purpose: Git version control metadata
- Generated: Yes (by git init)
- Committed: No (never committed)

---

*Structure analysis: 2026-02-05*
