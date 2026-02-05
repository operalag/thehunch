# Coding Conventions

**Analysis Date:** 2026-02-05

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Dashboard.tsx`, `ErrorBoundary.tsx`, `Markets.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMarkets.ts`, `useStakingInfo.ts`, `useContract.ts`)
- Config files: camelCase (e.g., `contracts.ts`, `networks.ts`, `supabase.ts`)
- Type definition files: kebab-case with `.d.ts` (e.g., `vite-env.d.ts`)
- CSS files: Match component name (e.g., `TokenFlow.css` for `TokenFlow.tsx`)

**Functions:**
- Component functions: PascalCase (e.g., `Dashboard()`, `ErrorBoundary()`)
- Hook functions: camelCase with `use` prefix (e.g., `useMarkets()`, `useStakingInfo()`)
- Helper functions: camelCase (e.g., `fetchMarkets()`, `formatBalance()`, `parseQuestionCell()`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleJoinClick()`)

**Variables:**
- Constants (module-level): UPPER_SNAKE_CASE (e.g., `STATE_OPEN`, `BATCH_SIZE`, `API_DELAY_MS`)
- React state: camelCase (e.g., `markets`, `loading`, `error`)
- Config objects: camelCase or UPPER_SNAKE_CASE (e.g., `CONTRACTS`, `FEE_CONFIG`)
- Local variables: camelCase (e.g., `address`, `totalStaked`, `userStake`)

**Types:**
- Interfaces: PascalCase (e.g., `Market`, `StakingInfo`, `UseMarketsResult`)
- Type aliases: PascalCase (e.g., `MarketCategory`, `NetworkType`)
- Enums: PascalCase with UPPER_SNAKE_CASE values

## Code Style

**Formatting:**
- No Prettier config detected - relies on editor/IDE defaults
- Indentation: 2 spaces (consistent across files)
- Semicolons: Inconsistent - some files use them (`useMarkets.ts`), others don't (`App.tsx`)
- String quotes: Single quotes preferred in `.tsx` files, both single and backticks in `.ts` files
- Line length: No enforced limit, but long lines exist (e.g., 773 lines in `useMarkets.ts`)

**Linting:**
- Tool: ESLint v9.32.0 with TypeScript ESLint v8.38.0
- Config: `eslint.config.js` (flat config format)
- Key rules:
  - React Hooks rules enabled
  - React Refresh warnings for component exports
  - `@typescript-eslint/no-unused-vars` disabled
  - Extends recommended configs from `@eslint/js` and `typescript-eslint`

## Import Organization

**Order:**
1. External React imports (`import { useState, useEffect } from 'react'`)
2. External library imports (`import { useTonWallet } from '@tonconnect/ui-react'`)
3. External utility imports (`import { Cell, Address } from '@ton/core'`)
4. Internal config imports (`import { CONTRACTS } from '../config/contracts'`)
5. Internal hook imports (`import { useStakingInfo } from '../hooks/useStakingInfo'`)
6. Internal component imports (`import { Header } from './components/Header'`)
7. CSS imports (`import './App.css'`)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Used in some files: `import { Button } from '@/components/ui/button'`
- Relative paths still common: `import { CONTRACTS } from '../config/contracts'`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations with console.error logging
- Hooks return error state: `{ data, loading, error }`
- Error boundaries for React component errors (`ErrorBoundary.tsx`)
- Fallback UI provided via `fallback` prop or default error message
- Graceful degradation: catch errors but continue execution where possible

**Example from `useMarkets.ts`:**
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
} catch (err: any) {
  console.error('Failed to fetch markets:', err);
  setError(err.message);
}
```

**Example from `App.tsx`:**
```typescript
<ErrorBoundary name="Dashboard" fallback={<ErrorFallback name="Dashboard" />}>
  <Suspense fallback={<LoadingFallback name="Dashboard" />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>
```

## Logging

**Framework:** Console API (native)

**Patterns:**
- Prefix logs with component/hook name: `console.log('[Markets] Instance count:', count)`
- Debug logs for tracing: `console.log('[StakingInfo Debug] API response:', data)`
- Error logs: `console.error('Failed to fetch markets:', err)`
- Warning logs: `console.warn('[StakingInfo] Fee Distributor not available')`
- Verbose logging in development (not stripped for production)

## Comments

**When to Comment:**
- Complex blockchain data parsing logic
- Network configuration and rate limiting
- Contract state constants and their meanings
- Timing calculations (epochs, lock periods)
- Workarounds or temporary solutions

**JSDoc/TSDoc:**
- Not consistently used
- Some type definitions include inline comments
- Interface properties occasionally documented inline

**Example:**
```typescript
// 5 minutes delay after resolution deadline before proposals can be made
const PROPOSAL_DELAY_SECONDS = 300;

// Helper: convert raw address (0:...) to friendly format (EQ.../kQ...) for TonAPI
const toFriendlyAddress = (rawAddress: string, testnet = true): string => {
  // Implementation
}
```

## Function Design

**Size:**
- No strict limit enforced
- Some long functions exist (e.g., `fetchMarkets()` in `useMarkets.ts` is ~530 lines)
- Complex data fetching logic not decomposed into smaller functions

**Parameters:**
- Prefer destructuring for objects: `{ name, value }: Props`
- Optional parameters use `?` syntax: `name?: string`
- Default parameters: `testnet = true`

**Return Values:**
- Hooks return objects with multiple values: `{ markets, loading, error, refetch }`
- Components return JSX
- Helper functions return specific types (string, number, boolean)
- Async functions return Promises

## Module Design

**Exports:**
- Named exports preferred: `export function useMarkets()`
- Default exports for components: `export default App`
- Type exports: `export type MarketCategory = 'cricket' | 'other'`
- Const exports for configs: `export const CONTRACTS = { ... }`

**Barrel Files:**
- Not used
- Direct imports from specific files required

## TypeScript Configuration

**Strictness:**
- `strict: false` - TypeScript strict mode DISABLED
- `noImplicitAny: false` - Implicit any allowed
- `noUnusedLocals: false` - Unused variables allowed
- `noUnusedParameters: false` - Unused parameters allowed
- `strictNullChecks: false` - Null checks disabled
- `skipLibCheck: true` - Skip type checking of declaration files
- `allowJs: true` - JavaScript files allowed

**Target:**
- ES2020 for both compilation and libraries
- Module: ESNext with bundler resolution

## React Patterns

**Component Style:**
- Functional components only (no class components except `ErrorBoundary`)
- Hooks for state management
- Named exports for utilities, default exports for app components

**State Management:**
- React hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- Zustand used (listed in dependencies) but not visible in analyzed files
- TanStack Query (`@tanstack/react-query`) for data fetching

**Lazy Loading:**
- Used for heavy components: `const Dashboard = lazy(() => import('./components/Dashboard'))`
- Wrapped in `Suspense` with loading fallbacks
- Combined with `ErrorBoundary` for resilience

**Refs:**
- Used for DOM references and mutable values
- Pattern: `const mountedRef = useRef(true)`
- Cleanup in useEffect return: `mountedRef.current = false`

## Blockchain-Specific Conventions

**Address Handling:**
- Always convert addresses for API calls: `toNonBounceableAddress()` for TonAPI
- Use `Address.parse()` from `@ton/core` for parsing
- Convert to appropriate format: bounceable vs non-bounceable
- Network-aware: testnet vs mainnet formats differ

**Number Parsing:**
- BigInt for large numbers: `BigInt(value).toString()`
- Hex to decimal conversion: `parseInt(numStr, 16)`
- Token decimals: divide by `1e9` for HNCH

**API Calls:**
- Rate limiting awareness: batch requests, add delays between calls
- Retry logic with exponential backoff
- Progress tracking for long-running operations
- Use network-specific API URLs and headers from config

---

*Convention analysis: 2026-02-05*
