# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Status:** No test framework currently configured or in use.

**Test Files:** None found in codebase (`find /Users/tonicaradonna/thehunch-claude/app/src -name "*.test.*" -o -name "*.spec.*"` returns no results)

**Note:** This is a React + TypeScript frontend application without automated test infrastructure. Testing is currently manual/ad-hoc only.

## Development & Type Safety

**Compile-Time Safety:**
- TypeScript strict mode enabled in `tsconfig.app.json`
- Config location: `/Users/tonicaradonna/thehunch-claude/app/tsconfig.app.json`
- Key settings:
  ```json
  {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
  ```

**Type Checking:**
- Run via build process: `npm run build` (runs `tsc -b && vite build`)
- Command from package.json: `/Users/tonicaradonna/thehunch-claude/app/package.json`
- TypeScript version: ~5.9.3

**ESLint Linting:**
- Command: `npm run lint` (runs `eslint .`)
- Config: `/Users/tonicaradonna/thehunch-claude/app/eslint.config.js`
- Checks for unused variables, React hook rules, React Refresh violations

## Manual Testing Approach

**Runtime Errors:**
The application uses error boundaries and try-catch blocks to handle runtime issues gracefully rather than automated testing.

**Error Boundary Pattern (from `/Users/tonicaradonna/thehunch-claude/app/src/components/ErrorBoundary.tsx`):**
```typescript
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}] Caught error:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="error-boundary-fallback">
          <h3>Something went wrong{this.props.name ? ` in ${this.props.name}` : ''}</h3>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Error Wrapping Pattern (from `/Users/tonicaradonna/thehunch-claude/app/src/App.tsx`):**
```typescript
<ErrorBoundary name="Dashboard" fallback={<ErrorFallback name="Dashboard" />}>
  <Suspense fallback={<LoadingFallback name="Dashboard" />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>
```

## Code Organization for Testability

**Current Structure:**
- Logic organized in custom hooks (`/Users/tonicaradonna/thehunch-claude/app/src/hooks/`)
- Each hook encapsulates API calls, state management, and calculations
- Separation makes individual hooks easier to test (if testing were implemented)

**Hook File Examples:**
- `useContract.ts`: Smart contract interactions, transaction building
- `useStakingInfo.ts`: Complex state assembly from multiple API calls
- `useMarkets.ts`: Market data fetching with rate limiting
- `useJettonBalance.ts`: Token balance fetching with retry logic
- `useMarketsCache.ts`: Supabase caching layer

**Component Organization:**
- Components import hooks for business logic
- Minimal component logic (mostly UI rendering and event handling)
- Example from `Stake.tsx`:
  ```typescript
  export function Stake() {
    const wallet = useTonWallet();
    const { stakeTokens, unstakeTokens, claimStakerRewards } = useContract();
    const { balance, formattedBalance } = useJettonBalance();
    const { formattedUserStake, canUnstake } = useStakingInfo();
    // ... component logic
  }
  ```

## Testing Recommendations for Future

**To Implement Unit Tests:**

1. **Framework Setup:**
   - Install Vitest or Jest
   - Add test configuration file
   - Location: `/Users/tonicaradonna/thehunch-claude/app/vitest.config.ts` or `jest.config.js`

2. **Priority Areas:**
   - Hook logic in `/Users/tonicaradonna/thehunch-claude/app/src/hooks/`
     - `useStakingInfo.ts`: Complex epoch calculation and balance formatting
     - `useContract.ts`: Transaction building, address conversion
     - `useMarkets.ts`: Rate limiting, batch fetching, retry logic
   - Config functions in `/Users/tonicaradonna/thehunch-claude/app/src/config/`
     - Address conversion utilities
     - Network configuration helpers

3. **Component Testing:**
   - Use React Testing Library for component tests
   - Test user interactions (button clicks, form submissions)
   - Mock hooks using custom implementations or libraries

4. **Integration Testing:**
   - Test hook interactions with mock API responses
   - Test error boundary error catching
   - Test network switching behavior

## Validation & Guards

**Defensive Programming Patterns:**

**Address Validation:**
```typescript
// From useContract.ts
const friendlyAddress: string;
try {
  const addr = Address.parse(to);
  friendlyAddress = addr.toString({ testOnly: isTestnet, bounceable: true });
} catch (e) {
  console.error(`[sendTransaction] Failed to parse address: ${to}`, e);
  throw new Error(`Invalid address format: ${to}`);
}
```

**Amount Validation:**
```typescript
// From useContract.ts
if (bondAmount < MIN_BOND_HNCH) {
  throw new Error(`Minimum bond is ${MIN_BOND_HNCH.toLocaleString()} HNCH`);
}

// From Stake.tsx
const hnchAmount = parseFloat(amount);
if (isNaN(hnchAmount) || hnchAmount <= 0) {
  throw new Error('Invalid stake amount');
}
```

**Connection Checks:**
```typescript
// From useContract.ts
if (!wallet) {
  throw new Error('Wallet not connected');
}

if (!userAddress) {
  throw new Error('Wallet not connected');
}
```

**API Response Validation:**
```typescript
// From useStakingInfo.ts
if (userData.stack && userData.stack.length >= 2) {
  const stakeValue = userData.stack[0];
  if (typeof stakeValue === 'object' && stakeValue.num) {
    // Parse and use
  } else if (typeof stakeValue === 'string') {
    // Parse as string
  } else {
    console.log('[StakingInfo Debug] Could not parse stakeValue, type:', typeof stakeValue);
  }
}
```

## Logging for Debugging

**Debug Logs by Feature:**

**Jetton Balance Fetching** (from `useJettonBalance.ts`):
```typescript
console.log(`[HNCH Balance] Network: ${config.name}`);
console.log(`[HNCH Balance] Fetching for ${address}`);
console.log(`[HNCH Balance] API: ${apiUrl}`);
console.warn(`[HNCH Balance] Rate limited, retry ${retryAttempt + 1}/5...`);
console.log(`[HNCH Balance] SUCCESS! Balance: ${balanceValue}`);
console.error('[HNCH Balance] FAILED:', err.message);
```

**Staking Info Fetching** (from `useStakingInfo.ts`):
```typescript
console.log('[StakingInfo] Hook called, TonConnect address:', address);
console.log('[StakingInfo] Address conversion:', { input, output, network });
console.log('[StakingInfo Debug] API response status:', status, ok);
console.log('[StakingInfo Debug] get_epoch_info response:', epochData);
console.log('[StakingInfo] Returning values:', { userStake, actualCurrentEpoch, claimableEpochs });
```

**Transaction Building** (from `useContract.ts`):
```typescript
console.log(`[getJettonWallet] Fetching for ${userAddress}`);
console.log(`[sendTransaction] Converted address: ${to} -> ${friendlyAddress}`);
console.log('[Stake Debug] OP_CODES.STAKE =', OP_CODES.STAKE, '(expected: 3)');
console.log('[Stake Debug] Forward payload BOC:', payloadCell.toBoc().toString('hex'));
```

**Market Fetching** (from `useMarkets.ts`):
```typescript
console.log('[Markets] TONAPI key configured:', hasApiKey ? 'yes' : 'no');
console.log('[Markets] Batch item failed:', err);
console.log(`[Markets] Rate limited, retrying in ${retryDelay}ms...`);
console.log('[Markets] Instance count response:', countData);
```

## Current Coverage Gaps

**Untested Areas:**
- All React components (no component tests)
- Hook integration behavior (hooks rarely tested in isolation with mock data)
- Contract interaction encoding (address conversions, cell building)
- Error boundary fallback rendering
- Supabase cache layer functionality

**Risk Areas Without Tests:**
- `useStakingInfo.ts` (complex epoch calculation, hex value parsing)
- `useMarkets.ts` (rate limiting logic, batch fetching, data transformation)
- `useContract.ts` (transaction building, address format conversion)
- Error recovery in async operations (retry logic)

## Recommendations

**Short-term (No Breaking Changes):**
1. Add JSDoc comments to hooks documenting expected behavior
2. Increase console logging coverage for critical paths
3. Create manual test checklist for critical user flows

**Medium-term:**
1. Set up Vitest with React Testing Library
2. Write unit tests for hooks (especially useStakingInfo, useMarkets, useContract)
3. Add integration tests for common user flows

**Long-term:**
1. Implement E2E tests with Playwright or Cypress
2. Add visual regression testing
3. Set up CI/CD with test execution gates

---

*Testing analysis: 2026-02-01*
