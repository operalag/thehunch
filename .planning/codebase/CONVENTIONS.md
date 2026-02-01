# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `Header.tsx`, `Markets.tsx`, `ErrorBoundary.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useContract.ts`, `useStakingInfo.ts`, `useMarkets.ts`)
- Config files: camelCase (e.g., `contracts.ts`, `networks.ts`, `supabase.ts`)
- Utilities: camelCase (e.g., `polyfills.ts`)

**Functions:**
- React components: PascalCase (e.g., `function Header()`, `export function Stake()`)
- Hook functions: camelCase starting with `use` (e.g., `export function useContract()`, `useStakingInfo()`)
- Regular functions: camelCase (e.g., `fetchWithRetry()`, `formatBalance()`, `normalizeTonAddress()`)
- Helper functions within components: camelCase (e.g., `formatCountdown()`, `ClaimInfoTooltip()` for nested components)

**Variables:**
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `LOCK_PERIOD_SECONDS`, `EPOCH_DURATION`, `MIN_BOND_HNCH`, `OP_CODES`)
- State variables: camelCase (e.g., `isStaking`, `amount`, `lockTime`, `totalStaked`)
- React props: camelCase (e.g., `name`, `address`, `fallback`, `onToggle`)
- Callback props: camelCase with `on` prefix (e.g., `onToggle()`, `onProgress()`)

**Types:**
- Interfaces: PascalCase with no `I` prefix (e.g., `interface StakingInfo`, `interface Market`, `interface Props`)
- Types: PascalCase (e.g., `type NetworkType = 'testnet' | 'mainnet'`, `type StatusFilter = 'all' | 'open'`)
- Type exports: Place at module level with `export interface` or `export type`

## Code Style

**Formatting:**
- Configured via ESLint with TypeScript support (ESLint 9.39.1)
- Config file: `/Users/tonicaradonna/thehunch-claude/app/eslint.config.js`
- Single quotes for strings (enforced by codebase convention, not prettier)
- No explicit formatter configured; ESLint provides linting only
- Line length: No strict limit enforced, but code generally stays under 100 characters

**Linting:**
- ESLint with `@eslint/js` and `typescript-eslint` (v8.46.4)
- React plugin: `eslint-plugin-react-hooks` (v7.0.1) for hook rules
- React Refresh plugin: `eslint-plugin-react-refresh` (v0.4.24)
- Config extends: JS recommended + TypeScript recommended + React hooks rules
- React Refresh rule: Warns when exports are not component/hook definitions

**Key Rules Enforced:**
- No unused variables (TypeScript strict: `noUnusedLocals`, `noUnusedParameters`)
- No fallthrough switch cases (`noFallthroughCasesInSwitch`)
- Strict null checking (`strict: true`)
- Requires explicit module detection (`moduleDetection: "force"`)

## Import Organization

**Order:**
1. React/external libraries (`import { useState } from 'react'`)
2. Third-party dependencies (`import { useTonWallet } from '@tonconnect/ui-react'`)
3. Local modules (`import { useContract } from '../hooks/useContract'`)
4. Relative imports (deep paths to components, hooks, config)
5. CSS/assets (`import './App.css'`)

**Path Aliases:**
- Not configured; all imports use relative paths (`../`)
- Common patterns:
  - From components: `import { Header } from './components/Header'`
  - From hooks: `import { useStakingInfo } from '../hooks/useStakingInfo'`
  - From config: `import { CONTRACTS } from '../config/contracts'`

**Example Pattern from `App.tsx`:**
```typescript
import { Suspense, lazy } from 'react'
import { Header } from './components/Header'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Markets } from './components/Markets'
import { StatsSimple } from './components/StatsSimple'
import { getNetworkConfig, isMainnet } from './config/networks'
import './App.css'
```

## Error Handling

**Patterns:**
- Throw custom `Error` instances with descriptive messages for validation errors
- Use `try/catch` blocks in async functions
- Log errors with context prefix (e.g., `[getJettonWallet]`, `[StakingInfo]`)
- For API errors: include HTTP status code and response details

**Example from `useContract.ts`:**
```typescript
const getJettonWalletAddress = async (): Promise<string | null> => {
  if (!userAddress) return null;
  try {
    const response = await fetch(...);
    if (!response.ok) {
      console.log(`[getJettonWallet] Response not OK: ${response.status}`);
      return null;
    }
    const data = await response.json();
    // ...
    return friendlyAddress;
  } catch (err) {
    console.error(`[getJettonWallet] Error:`, err);
    return null;
  }
};
```

**Validation Errors:**
```typescript
// Throw with descriptive message
if (bondAmount < MIN_BOND_HNCH) {
  throw new Error(`Minimum bond is ${MIN_BOND_HNCH.toLocaleString()} HNCH`);
}

// Check wallet connection before operations
if (!userAddress) {
  throw new Error('Wallet not connected');
}
```

**Error Boundaries:**
- Use class-based `ErrorBoundary` component (`/Users/tonicaradonna/thehunch-claude/app/src/components/ErrorBoundary.tsx`) to wrap sections
- Provides custom fallback UI and error logging via `componentDidCatch`
- All major sections use ErrorBoundary + Suspense combo

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- Prefix logs with context in brackets: `[ComponentName]` or `[HookName]`
- Use `console.log()` for informational messages (not verbose, but helpful for debugging)
- Use `console.warn()` for rate-limit warnings
- Use `console.error()` for actual errors

**Examples:**
```typescript
// In useContract.ts
console.log(`[getJettonWallet] Fetching for ${userAddress}`);
console.log(`[getJettonWallet] Response:`, data);
console.error(`[getJettonWallet] Error:`, err);

// In useStakingInfo.ts
console.log('[StakingInfo] Hook called, TonConnect address:', address);
console.warn('[StakingInfo] Fee Distributor not available');
console.error('Failed to fetch staking info:', err);
```

**When to Log:**
- API requests and responses (including status codes)
- Address conversions and format transformations
- State changes in complex hooks
- Errors and recovery attempts
- Not recommended: Debug-level verbose logs in normal flow (only for investigation)

**Rate-Limiting Context:**
- Logs include API key configuration status and rate-limit strategy
- Example: `'[Markets] TONAPI key configured:', hasApiKey ? 'yes' : 'no (using conservative rate limits)'`

## Comments

**When to Comment:**
- Complex algorithms or address transformations (e.g., base64 decoding in `normalizeTonAddress()`)
- Non-obvious business logic (e.g., epoch calculations in `useStakingInfo.ts`)
- Important constraints or limitations (e.g., "Current epoch is still accumulating, so not claimable yet")
- Contract interaction details (operation codes, payload structure)
- Guard comments explaining why something is skipped or done differently

**Example Comments:**
```typescript
// 5 minutes delay after resolution deadline before proposals can be made
const PROPOSAL_DELAY_SECONDS = 300;

// Helper: Convert address to non-bounceable format for TONAPI queries
// TONAPI accepts UQ... (non-bounceable) or 0:... (raw), but NOT EQ... (bounceable)
const toNonBounceableAddress = (addressStr: string): string => {
  // ...
};

// No automatic timer - calculate on render only to prevent memory issues
```

**JSDoc/TSDoc:**
- Not consistently used for simple functions
- Used for complex public functions in hooks and config modules
- Documents parameters, return types, and important notes

**Example from `useContract.ts`:**
```typescript
/**
 * Create a new prediction market (Oracle Instance)
 * Cost: 10,000 HNCH fee + ~0.25 TON for deployment (v1.1)
 * Fee distribution: 60% stakers, 25% creator rebate, 10% treasury, 5% resolver reward
 * @param question - The prediction question (must be YES/NO answerable)
 * @param resolutionDeadline - Unix timestamp after which outcomes can be proposed
 * @param rules - Optional rules for resolution
 * @param resolutionSource - Optional source for resolution verification
 */
const createMarket = async (
  question: string,
  resolutionDeadline: number,
  rules?: string,
  resolutionSource?: string
) => {
```

## Function Design

**Size:**
- Prefer functions under 50 lines; complex logic broken into smaller helpers
- Long functions exist in data-fetching hooks where unavoidable (e.g., `useStakingInfo.ts` with complex state assembly)

**Parameters:**
- Use destructuring for React props (enforced by TypeScript interfaces)
- Async functions return Promises
- Optional parameters use TypeScript `?` syntax

**Return Values:**
- Functions explicitly type return values
- Async functions return `Promise<T>`
- Helper functions return appropriate types (strings, numbers, booleans, objects)
- Error cases either throw or return null (context-dependent)

**Example from `useStakingInfo.ts`:**
```typescript
// Clear return types and structure
const formatBalance = (balance: string) => {
  const num = Number(balance) / 1e9;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Complex return object with explicit interface
export function useStakingInfo(): StakingInfo {
  // Implementation
  return {
    totalStaked,
    formattedTotalStaked: formatBalance(totalStaked),
    userStake,
    // ... more properties
  };
}
```

## Module Design

**Exports:**
- Named exports are standard: `export function`, `export const`, `export interface`
- Default exports used for React components in App.tsx (`export default App`)
- Config modules use both named and default-like approaches (getters + constants)

**Barrel Files:**
- No barrel files (`index.ts`) used in the codebase
- Direct imports from specific module files

**Example Export Pattern from `contracts.ts`:**
```typescript
// Use getters to ensure fresh values
export const CONTRACTS = {
  get HNCH_JETTON_MASTER() {
    return getNetworkConfig().contracts.HNCH_JETTON_MASTER;
  },
  // ...
};

// Direct constants
export const FEE_CONFIG = {
  MARKET_CREATION_FEE: 10000,
  STAKER_SHARE: 60,
  // ...
} as const;

// Function exports
export const getNetwork = () => getNetworkConfig().name;
```

**Pattern for Hook Exports:**
```typescript
// Interface first
interface StakingInfo {
  // properties
}

// Hook function that returns interface
export function useStakingInfo(): StakingInfo {
  // implementation
  return { /* properties */ };
}
```

---

*Convention analysis: 2026-02-01*
