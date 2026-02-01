# Codebase Structure

**Analysis Date:** 2026-02-01

## Directory Layout

```
/Users/tonicaradonna/thehunch-claude/
├── src/                              # Marketing website frontend (Vite + React)
│   ├── App.tsx                       # Main app component with router
│   ├── main.tsx                      # Entry point
│   ├── App.css                       # Global styles
│   ├── index.css                     # CSS reset/Tailwind
│   ├── pages/                        # Page components (route destinations)
│   │   ├── Index.tsx                 # Landing page
│   │   ├── Dashboard.tsx             # Demo dashboard redirect
│   │   ├── FAQ.tsx                   # FAQ page
│   │   ├── Whitepaper.tsx            # Whitepaper page
│   │   ├── Membership.tsx            # Membership info
│   │   ├── Staking.tsx               # Staking info page
│   │   ├── CreateMarket.tsx          # Market creation (marketing info)
│   │   ├── MarketDetails.tsx         # Market details view
│   │   └── NotFound.tsx              # 404 page
│   ├── components/                   # Reusable UI components
│   │   ├── Hero.tsx                  # Landing hero section
│   │   ├── Navigation.tsx            # Top navigation bar
│   │   ├── Footer.tsx                # Footer
│   │   ├── AboutSection.tsx          # About project section
│   │   ├── HowItWorksSection.tsx     # How it works section
│   │   ├── UseCasesSection.tsx       # Use cases section
│   │   ├── StealthModeSection.tsx    # Privacy features section
│   │   ├── CommunitySection.tsx      # Community section
│   │   ├── FAQSection.tsx            # FAQ components
│   │   ├── CountdownTimer.tsx        # Timer component
│   │   ├── StatusBadge.tsx           # Status indicator component
│   │   ├── TokenFlow.tsx             # Token flow visualization
│   │   ├── WaitlistModal.tsx         # Waitlist signup modal
│   │   ├── WalletConnect.tsx         # Wallet connection UI
│   │   └── ui/                       # shadcn/Radix UI primitives (generated)
│   │       ├── button.tsx            # Button component
│   │       ├── card.tsx              # Card component
│   │       ├── tabs.tsx              # Tabs component
│   │       ├── dialog.tsx            # Modal/Dialog
│   │       └── [50+ more UI primitives]
│   ├── store/                        # State management
│   │   └── blockchainStore.ts        # Zustand store (legacy mock data)
│   ├── lib/                          # Utility functions
│   │   └── utils.ts                  # Helper functions (classname merging)
│   ├── hooks/                        # Custom React hooks (not in use in src/)
│   ├── assets/                       # Static assets
│   │   └── [images, icons]
│
├── app/                              # Production application frontend
│   ├── src/
│   │   ├── App.tsx                   # Main app component (lazy loads sections)
│   │   ├── main.tsx                  # Entry point (polyfills, TonConnect)
│   │   ├── App.css                   # Global app styles
│   │   ├── index.css                 # CSS reset
│   │   ├── polyfills.ts              # TON SDK polyfills
│   │   ├── vite-env.d.ts             # Vite environment type definitions
│   │   ├── config/                   # Configuration files
│   │   │   ├── contracts.ts          # Contract addresses (testnet/mainnet) with getters
│   │   │   ├── networks.ts           # Network configuration (testnet/mainnet URLs, chain IDs)
│   │   │   └── supabase.ts           # Supabase client, cache functions, database types
│   │   ├── components/               # React components
│   │   │   ├── Header.tsx            # Top navigation (network switcher, wallet)
│   │   │   ├── Dashboard.tsx         # Wallet info and balance display
│   │   │   ├── Markets.tsx           # Market list with filtering, sorting, bond history
│   │   │   ├── MarketsSimple.tsx     # Simplified market view (fallback)
│   │   │   ├── Stake.tsx             # Staking UI
│   │   │   ├── Stats.tsx             # Protocol statistics (complex version)
│   │   │   ├── StatsSimple.tsx       # Protocol statistics (simplified/crash-proof)
│   │   │   ├── TokenFlow.tsx         # Token flow visualization
│   │   │   ├── TokenFlow.css         # TokenFlow styles
│   │   │   ├── NetworkIndicator.tsx  # Network status display
│   │   │   ├── NetworkSwitcher.tsx   # Testnet/Mainnet selector
│   │   │   └── ErrorBoundary.tsx     # Error boundary component
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useMarkets.ts         # Fetch all markets from blockchain (raw)
│   │   │   ├── useMarketsCache.ts    # Fetch markets from Supabase or hardcoded V6.3 testnet data
│   │   │   ├── useContract.ts        # Send transactions (stake, propose, challenge, etc.)
│   │   │   ├── useJettonBalance.ts   # Fetch user HNCH and TON balances
│   │   │   ├── useStakingInfo.ts     # Fetch user staking info (staked balance, rewards)
│   │   │   ├── useMarketParticipants.ts # Fetch market history (proposals/challenges)
│   │   │   └── useMasterOracleBalance.ts # Monitor MASTER_ORACLE balance (required for operations)
│   │   ├── assets/                   # Static assets
│   │   │   └── react.svg             # React logo
│   │   └── index.css                 # CSS entry point
│   ├── supabase/                     # Supabase project files
│   │   ├── functions/                # Edge functions
│   │   │   └── sync-markets/         # Serverless function to sync markets
│   │   └── migrations/               # Database migrations
│   └── public/                       # Public assets
│       └── tonconnect-manifest.json  # TonConnect manifest
│
├── public/                           # Root public assets
│   ├── tonconnect-manifest.json      # TonConnect manifest
│   └── [other assets]
│
├── .planning/                        # GSD planning documents
│   └── codebase/                     # Architecture analysis (this directory)
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── STACK.md
│       ├── CONVENTIONS.md
│       ├── TESTING.md
│       ├── CONCERNS.md
│       └── INTEGRATIONS.md
│
├── vite.config.ts                    # Vite build configuration (src/)
├── tsconfig.json                     # TypeScript configuration (root)
├── tsconfig.app.json                 # TypeScript app config (src/)
├── tsconfig.node.json                # TypeScript node config (build tools)
├── package.json                      # Root dependencies (src/ project)
├── package-lock.json                 # Dependency lock (src/)
├── bun.lockb                         # Bun lock file (optional)
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── eslint.config.js                  # ESLint configuration
├── components.json                   # shadcn/ui configuration
├── index.html                        # Root HTML entry (src/)
├── README.md                         # Project README
└── app/                              # app/ has separate package.json and build
    ├── package.json                  # app/ dependencies
    ├── vite.config.ts                # Vite config for app/
    ├── tsconfig.json                 # TypeScript config for app/
    └── index.html                    # app/ HTML entry
```

## Directory Purposes

**`src/` (Marketing Website):**
- Purpose: Landing page, marketing content, educational pages
- Contains: Page components, section components, UI library, legacy Zustand store
- Key files: `pages/Index.tsx` (landing), `components/Hero.tsx`, `components/Navigation.tsx`

**`src/pages/`:**
- Purpose: Route-level page components (destinations for router)
- Contains: Full-page layouts
- Key files: `Index.tsx` (landing), `FAQ.tsx`, `Whitepaper.tsx`, `Staking.tsx`

**`src/components/`:**
- Purpose: Reusable UI components and sections
- Contains: Feature sections, UI primitives, marketing components
- Key files: `Hero.tsx`, `Navigation.tsx`, `Footer.tsx`, `ui/` (shadcn primitives)

**`src/store/`:**
- Purpose: Global application state (legacy)
- Contains: Zustand store with mock blockchain data
- Key files: `blockchainStore.ts` (mock events, user state, mock transactions)

**`app/src/` (Production Application):**
- Purpose: Main application for interacting with HUNCH Oracle contracts
- Contains: Components, hooks, configuration for blockchain interaction
- Key files: `App.tsx` (main layout), `components/Markets.tsx` (market list), `config/networks.ts`

**`app/src/config/`:**
- Purpose: Centralized configuration for contracts, networks, and external services
- Contains: Network-specific addresses, URLs, Supabase client
- Key files: `networks.ts` (testnet/mainnet config), `contracts.ts` (contract getters), `supabase.ts` (cache client)

**`app/src/components/`:**
- Purpose: Interactive UI for blockchain interaction
- Contains: Dashboard, markets list, staking, statistics, header/footer
- Key files: `Markets.tsx` (largest component, ~100KB), `Dashboard.tsx`, `Stake.tsx`

**`app/src/hooks/`:**
- Purpose: Encapsulate blockchain and API logic
- Contains: Custom React hooks for data fetching and transactions
- Key files: `useMarkets.ts` (fetch from blockchain), `useMarketsCache.ts` (fetch from cache), `useContract.ts` (transactions), `useJettonBalance.ts` (user balance)

**`app/supabase/`:**
- Purpose: Supabase backend configuration
- Contains: Edge functions, database migrations
- Key files: `functions/sync-markets/` (syncs markets to cache), `migrations/` (database schema)

**`.planning/codebase/`:**
- Purpose: Generated architecture and analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, STACK.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, INTEGRATIONS.md
- Auto-generated by GSD mapping commands

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Marketing site entry (React, TonConnect provider)
- `src/index.html`: Root HTML for marketing site
- `app/src/main.tsx`: App entry (polyfills, TonConnect provider)
- `app/index.html`: Root HTML for app
- `src/App.tsx`: Marketing site router and layout
- `app/src/App.tsx`: App main layout (lazy-loaded sections)

**Configuration:**
- `app/src/config/networks.ts`: Testnet/mainnet URLs, contract addresses, chain IDs
- `app/src/config/contracts.ts`: Contract addresses with getters for network switching
- `app/src/config/supabase.ts`: Supabase client, cache functions, database types
- `vite.config.ts`: Vite build config (marketing site)
- `app/vite.config.ts`: Vite build config (app)
- `tailwind.config.ts`: Tailwind CSS theme configuration
- `components.json`: shadcn/ui configuration (generated)

**Core Logic:**
- `app/src/hooks/useMarkets.ts`: Fetch markets from TON blockchain via TonAPI
- `app/src/hooks/useMarketsCache.ts`: Fetch markets from Supabase cache (fast) or hardcoded testnet data
- `app/src/hooks/useContract.ts`: Send transactions (stake, propose, challenge, etc.) via TonConnect
- `app/src/hooks/useJettonBalance.ts`: Fetch user HNCH token balance via TonAPI
- `app/src/hooks/useStakingInfo.ts`: Fetch user staking data from MASTER_ORACLE contract
- `src/store/blockchainStore.ts`: Zustand mock store (legacy, used in old pages)

**Testing:**
- No test files found (tests not yet implemented)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Dashboard.tsx`, `Markets.tsx`, `ErrorBoundary.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMarkets.ts`, `useContract.ts`)
- Utilities: camelCase (e.g., `utils.ts`)
- Styles: Component name + `.css` (e.g., `TokenFlow.css`)
- Config: camelCase (e.g., `networks.ts`, `contracts.ts`)

**Directories:**
- Component folders: lowercase (e.g., `components/`, `ui/`, `hooks/`)
- Feature folders: lowercase (e.g., `config/`, `assets/`)

## Where to Add New Code

**New Feature:**
- Primary code: `app/src/components/[FeatureName].tsx` (new component) + `app/src/hooks/use[Feature].ts` (new hook for data)
- Tests: `app/src/components/[FeatureName].test.tsx` (when testing is set up)
- Configuration: `app/src/config/[feature].ts` (if config needed)

**New Component/Module:**
- Implementation: `app/src/components/[ComponentName].tsx` (if UI), or `app/src/hooks/use[HookName].ts` (if logic only)
- Export from parent: Add import/export in `app/src/App.tsx` or parent component

**Utilities:**
- Shared helpers: `app/src/lib/` (create if not exists) or `src/lib/utils.ts` (for marketing site)
- Hook utilities: `app/src/hooks/` (if used by multiple hooks)

**Configuration/Constants:**
- Network/contract config: `app/src/config/networks.ts` or `app/src/config/contracts.ts`
- Supabase queries: `app/src/config/supabase.ts` (or new `app/src/lib/cache.ts`)
- UI theme: `tailwind.config.ts`

**Pages (Marketing Site):**
- New marketing page: `src/pages/[PageName].tsx` + add route to `src/App.tsx`

## Special Directories

**`node_modules/`:**
- Purpose: Third-party dependencies
- Generated: Yes (via npm/bun install)
- Committed: No (git-ignored)

**`.git/`:**
- Purpose: Git repository metadata
- Generated: Yes
- Committed: N/A (internal to git)

**`dist/`:**
- Purpose: Build output (compiled JavaScript/CSS)
- Generated: Yes (via `vite build`)
- Committed: No (git-ignored)

**`.claude/`:**
- Purpose: Claude IDE configuration
- Generated: Yes (by Claude IDE)
- Committed: No (git-ignored)

**`.planning/codebase/`:**
- Purpose: Architecture analysis documents
- Generated: Yes (by GSD mapping commands)
- Committed: Yes (checked into repo)

**`app/node_modules/`:**
- Purpose: app/ dependencies (separate from root)
- Generated: Yes
- Committed: No

**`app/supabase/`:**
- Purpose: Supabase project definition
- Generated: No (manually created and maintained)
- Committed: Yes (supabase CLI project)

---

*Structure analysis: 2026-02-01*
