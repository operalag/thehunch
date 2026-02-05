# Testing Patterns

**Analysis Date:** 2026-02-05

## Test Framework

**Runner:**
- None detected in project
- No test configuration files found (no `jest.config.*`, `vitest.config.*`, `playwright.config.*`)

**Assertion Library:**
- Not applicable - no testing framework configured

**Run Commands:**
```bash
# No test commands available
# package.json scripts do not include test commands
```

**Available Scripts:**
```bash
npm run dev              # Start development server (Vite)
npm run build            # Production build
npm run build:dev        # Development build
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## Test File Organization

**Location:**
- No test files exist in the project
- No `__tests__` directories found
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files in source directories

**Naming:**
- Not applicable - no test files present

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- No testing patterns established

**Patterns:**
- Testing is not implemented in this project

## Mocking

**Framework:**
- Not applicable - no mocking framework configured

**Patterns:**
- No mocking patterns established

**What to Mock:**
- Guidelines not established

**What NOT to Mock:**
- Guidelines not established

## Fixtures and Factories

**Test Data:**
- No test data fixtures exist

**Location:**
- No fixtures directory

## Coverage

**Requirements:**
- No coverage requirements enforced
- No coverage tooling configured

**View Coverage:**
```bash
# No coverage command available
```

## Test Types

**Unit Tests:**
- Not implemented

**Integration Tests:**
- Not implemented

**E2E Tests:**
- Not implemented

## Common Patterns

**Async Testing:**
- No async testing patterns established

**Error Testing:**
- No error testing patterns established

## Testing Recommendations

Based on the codebase analysis, if testing were to be added, the following areas would benefit most:

**Critical Areas to Test:**

1. **Blockchain Data Parsing** (`app/src/hooks/useMarkets.ts`):
   - Address conversion functions (`toFriendlyAddress`)
   - Number parsing from hex (`parseNum`, `parseHexNum`)
   - Cell data parsing (`parseQuestionCell`)

2. **Network Configuration** (`app/src/config/networks.ts`, `app/src/config/contracts.ts`):
   - Network switching logic
   - Contract address getters
   - Explorer link generation

3. **Custom Hooks** (`app/src/hooks/`):
   - `useMarkets` - complex fetching and state management
   - `useStakingInfo` - staking calculations and epoch logic
   - `useJettonBalance` - balance fetching and formatting
   - `useContract` - transaction building

4. **Error Boundaries** (`app/src/components/ErrorBoundary.tsx`):
   - Error catching and fallback rendering

5. **Helper Functions**:
   - Balance formatting functions
   - Time calculations (unlock times, epochs)
   - Category detection (`detectCategory`)

**Suggested Test Framework Setup:**

For this React + TypeScript + Vite project, recommended setup:
- **Vitest** - Fast, Vite-native test runner
- **@testing-library/react** - React component testing
- **@testing-library/user-event** - User interaction simulation
- **@vitest/ui** - Visual test UI

**Mock Requirements:**

If testing were implemented, these would need mocking:
- `@tonconnect/ui-react` hooks (`useTonWallet`, `useTonAddress`, `useTonConnectUI`)
- `fetch` API calls to TonAPI
- `@ton/core` utilities (`Address`, `Cell`)
- Supabase client (`@supabase/supabase-js`)
- Local storage access
- Browser APIs (Buffer polyfill)

## Current Quality Assurance

**Without automated tests, quality is maintained through:**

1. **TypeScript** (though strict mode is disabled)
2. **ESLint** with React and TypeScript rules
3. **Error Boundaries** for runtime error isolation
4. **Console Logging** for debugging and tracing
5. **Manual Testing** on testnet and mainnet

**Code Review Checkpoints:**

When adding new code, verify:
- Error handling with try-catch blocks
- Loading and error states in hooks
- Address format conversion for blockchain calls
- Rate limiting compliance for API calls
- Network-specific configuration usage
- Component lazy loading and error boundaries

---

*Testing analysis: 2026-02-05*
