# Codebase Concerns

**Analysis Date:** 2026-02-01

## Tech Debt

**Verbose Market Fetching Logic:**
- Issue: `app/src/hooks/useMarkets.ts` contains deeply nested API call logic (772 lines) that fetches market data in multiple sequential phases, with heavy duplication for parsing contract state, proposals, veto data, and rebates. The hook makes 50-100+ individual API calls per market load, causing slow initial page load and user-visible delays.
- Files: `app/src/hooks/useMarkets.ts`, `app/src/hooks/useMarketsCache.ts`
- Impact: Slow UI responsiveness, frequent rate-limit hits without API key, poor perceived performance, complex debugging. Users see loading progress but real UX is degraded.
- Fix approach: Replace with Supabase caching layer (partially done in `useMarketsCache.ts`). Migrate fully to cache-first, only sync on-demand. Remove batch API call logic from hook.

**Hardcoded Testnet Markets in Source:**
- Issue: `app/src/hooks/useMarketsCache.ts` (lines 19-350+) contains hardcoded V6.3 testnet market data inline in the component. This blocks Supabase inserts and requires manual source code edits to update testnet data.
- Files: `app/src/hooks/useMarketsCache.ts`
- Impact: Cannot update testnet market data without code deployment. Testnet markets are static and out-of-sync with on-chain state. Service role key requirement for Supabase inserts is a blocker.
- Fix approach: Create backend endpoint to insert testnet markets into Supabase cache using service role key. Move hardcoded data to database migrations. Reference markets from cache only.

**Excessive console.log Statements:**
- Issue: 108 console.log/console.error calls across 14 files (`app/src/hooks/`, `app/src/config/supabase.ts`). No structured logging or log levels. Makes debugging harder and clutters browser console in production.
- Files: `app/src/hooks/useMarkets.ts` (22 logs), `app/src/hooks/useStakingInfo.ts` (24 logs), `app/src/hooks/useContract.ts` (11 logs), others
- Impact: Browser console noise, difficulty filtering production logs, no log aggregation, hard to track specific operations in production.
- Fix approach: Implement structured logging wrapper with log levels (debug/info/warn/error). Enable only in development or for errors in production.

**Duplicate Address Normalization Logic:**
- Issue: Multiple address parsing/conversion utilities scattered across files: `normalizeTonAddress()` in `Markets.tsx` (lines 81-96), similar logic in `useContract.ts`, `useStakingInfo.ts`. Each handles bounceable/non-bounceable/raw address formats differently.
- Files: `app/src/components/Markets.tsx`, `app/src/hooks/useContract.ts`, `app/src/hooks/useStakingInfo.ts`, `app/src/hooks/useMarkets.ts`
- Impact: Risk of address mismatch bugs, maintenance burden, inconsistent behavior across app. Hard to verify address comparisons are correct.
- Fix approach: Create single `utils/addresses.ts` with all address conversion functions. Import centrally. Add tests.

**Manually Calculated Epoch Logic:**
- Issue: Epoch calculations done at component render time (`app/src/hooks/useStakingInfo.ts` line 89: `const now = Math.floor(Date.now() / 1000)`) and recalculated on every render without memoization. No timer keeps it accurate across time passage.
- Files: `app/src/hooks/useStakingInfo.ts`
- Impact: Stale epoch data as time passes, user sees incorrect "time until next epoch" without refresh. Not persistent across renders.
- Fix approach: Use `useEffect` with interval timer or `setInterval` to keep epoch data fresh. Memoize epoch calculations.

**Hardcoded Configuration Values Scattered:**
- Issue: Contract addresses, op codes, fee amounts, delays, and constants defined in multiple files: `app/src/config/contracts.ts`, `app/src/config/networks.ts`, `app/src/hooks/useContract.ts` (OP_CODES, MIN_BOND_HNCH, MARKET_CREATION_FEE_HNCH), `app/src/hooks/useMarkets.ts` (PROPOSAL_DELAY_SECONDS, batch sizes, delays).
- Files: `app/src/config/contracts.ts`, `app/src/config/networks.ts`, `app/src/hooks/useContract.ts`, `app/src/hooks/useMarkets.ts`
- Impact: Hard to track all config values, risk of inconsistency (e.g., different fee amounts in different files), difficult to update for new contract versions.
- Fix approach: Create centralized `app/src/config/constants.ts` for all magic numbers. Import everywhere.

**Type Casting with `any` Type:**
- Issue: 30 uses of `any` type across 10 files. Examples: `app/src/hooks/useMarketsCache.ts` line 355 `catch (err: any)`, `app/src/hooks/useMarkets.ts` line 400 `catch (error: any)`, `app/src/components/Markets.tsx` multiple places. This bypasses TypeScript safety.
- Files: `app/src/hooks/useJettonBalance.ts`, `app/src/hooks/useMarketsCache.ts`, `app/src/hooks/useMarkets.ts`, `app/src/hooks/useContract.ts`, `app/src/components/Markets.tsx`, others
- Impact: Loss of type safety, easier to introduce bugs with undefined properties, refactoring errors go undetected, harder to debug.
- Fix approach: Replace all `any` with proper TypeScript types. Create error types, response types. Use discriminated unions for API responses.

## Known Bugs

**Hardcoded Bounceable Flag in Veto Guard Parsing:**
- Symptoms: Veto guard addresses always parsed with `testOnly: true` in `app/src/hooks/useMarkets.ts` line 550 regardless of actual network. Should use `getNetworkConfig().name === 'testnet'`.
- Files: `app/src/hooks/useMarkets.ts` (line 550)
- Trigger: Call veto function on mainnet
- Workaround: None - this is a critical bug for mainnet veto voting
- Impact: Veto voting broken on mainnet, veto addresses invalid

**TODO Implementation Gap:**
- Symptoms: Unimplemented stub in `app/src/components/WaitlistModal.tsx` line 24 with comment "TODO: Implement actual submission"
- Files: `app/src/components/WaitlistModal.tsx` (lines 14-108)
- Trigger: Try to submit waitlist form
- Workaround: Form doesn't exist in built UI (component not used)
- Impact: Dead code, confuses developers, could be accidentally enabled

**Race Condition in Market Status Updates:**
- Symptoms: After transaction submitted, hardcoded 8-second delay `app/src/components/Markets.tsx` line 644 before status refresh. If transaction fails or takes longer, stale UI state.
- Files: `app/src/components/Markets.tsx` (lines 643-645)
- Trigger: Submit challenge/proposal/veto, watch status bar
- Workaround: Manual page refresh
- Impact: Users see incorrect market state, miss deadline windows, make uninformed decisions

**Soft Errors Silently Converted to Null:**
- Symptoms: `app/src/hooks/useMarkets.ts` line 51: `batch.map(item => fetchFn(item).catch(err => { ... return null; }))`. Network errors become null, no user feedback.
- Files: `app/src/hooks/useMarkets.ts`, `app/src/hooks/useMarketsCache.ts`
- Trigger: Any network hiccup or timeout
- Workaround: Check browser console, page will show partial data
- Impact: Silent failures, incomplete market lists, user confusion about why some markets are missing

## Security Considerations

**Anon Key Exposed in Frontend:**
- Risk: Supabase anonymous key (`VITE_SUPABASE_ANON_KEY`) stored in environment and used in frontend to make direct API calls to Supabase. If key leaked, attacker can modify market cache data, insert fake markets.
- Files: `app/src/config/networks.ts` (lines 117-118), `app/src/hooks/useMarketsCache.ts` (lines 383, 425)
- Current mitigation: Supabase row-level security (RLS) policies should restrict writes, but this relies on Supabase backend being configured correctly.
- Recommendations:
  - Verify RLS policies on `markets` table prevent unauthorized inserts/updates
  - Add table-level constraints (unique on address + network)
  - Consider moving sync operations to backend-only edge functions
  - Monitor Supabase logs for suspicious queries

**Direct Blockchain Calls Without Validation:**
- Risk: Market contract calls in `app/src/hooks/useContract.ts` send HNCH tokens and execute state-changing operations. No client-side validation of contract state before execution (e.g., no pre-flight check that market is actually in correct state).
- Files: `app/src/hooks/useContract.ts` (lines 202-237 proposal/challenge/settle functions)
- Current mitigation: Contract enforces state transitions on-chain, rejecting invalid ops
- Recommendations:
  - Add pre-flight checks: fetch current market state, verify it matches expected state before sending
  - Show user the actual on-chain state vs. cached state before prompting action
  - Implement timeout + retry with exponential backoff for transaction confirmation

**Address Format Confusion Risk:**
- Risk: Multiple address formats (raw `0:...`, bounceable `EQ...`, non-bounceable `UQ...`, testnet `kQ...`). Mixed usage increases risk of sending tokens to wrong address.
- Files: `app/src/hooks/useContract.ts`, `app/src/hooks/useStakingInfo.ts`, `app/src/hooks/useMarkets.ts`, `app/src/components/Markets.tsx`
- Current mitigation: Manual conversions case-by-case, pray they're correct
- Recommendations:
  - Strict address type (branded type `type FriendlyAddress = string & { readonly __brand: 'FriendlyAddress' }`)
  - All external APIs use only friendly format
  - All internal storage uses raw format
  - Add runtime format validation

**Missing Input Validation:**
- Risk: Bond amounts entered by user (`app/src/components/Markets.tsx` lines 1867, 1961) are parsed but not validated for overflow/underflow. No max bond limit checks.
- Files: `app/src/components/Markets.tsx`, `app/src/components/Stake.tsx`
- Current mitigation: HTML input type="number" provides basic browser validation
- Recommendations:
  - Add minimum/maximum bond validation matching contract limits
  - Check user HNCH balance before showing action buttons
  - Display transaction gas cost estimate before submission

**Unencrypted Sensitive Data in Logs:**
- Risk: 108 console.log calls log addresses, balances, transaction details. If logs forwarded to third-party service without sanitization, sensitive data leaked.
- Files: All files in `app/src/hooks/`, `app/src/config/`
- Current mitigation: Only visible to user (not sent anywhere by default)
- Recommendations:
  - Never log addresses, balances, or transaction IDs
  - Use structured logging with redaction rules
  - Never log full API responses

## Performance Bottlenecks

**Initial Market Load - 50-100 Sequential API Calls:**
- Problem: `useMarkets.ts` calls TONAPI individually for each of 50+ markets to fetch state, proposals, veto data, rebates. Even with batch limiting, takes 30-60+ seconds on slow connections.
- Files: `app/src/hooks/useMarkets.ts` (lines 38-71, 400+)
- Cause: No batch methods in TONAPI, must fetch individual contract state per market. Rate limit forces serialization.
- Current numbers: BATCH_SIZE=2 (free tier), BATCH_DELAY_MS=2500, per-item API_DELAY_MS=500
- Improvement path:
  1. Use Supabase cache exclusively (already partially implemented in `useMarketsCache.ts`)
  2. Set up backend sync job to refresh cache on schedule
  3. Only fetch new/changed markets incrementally
  4. Target: <1 second initial load from cache, background refresh

**High Memory Usage with Large Market Lists:**
- Problem: Markets component renders all markets in DOM, even invisible ones. With 100+ markets, DOM bloat.
- Files: `app/src/components/Markets.tsx` (lines 1000+)
- Cause: No virtualization, no pagination, all markets loaded at once
- Improvement path: Implement react-window virtualization or pagination. Only render visible items.

**No Caching of Hook Results:**
- Problem: `useStakingInfo`, `useMarketsCache`, `useContract` refetch on every render or on dependency change. No deduplication.
- Files: `app/src/hooks/`
- Cause: React hooks don't naturally deduplicate requests, multiple components may fetch same data
- Improvement path: Implement React Query or SWR for automatic request deduplication + cache invalidation

## Fragile Areas

**Markets Component (2169 lines):**
- Files: `app/src/components/Markets.tsx`
- Why fragile:
  - Massive component with ~50 useState calls, complex conditional rendering
  - Multiple interwoven features: filtering, sorting, bonding, challenging, settling, veto voting
  - Hard to test individual features without running full component
  - Easy to introduce bugs when adding new market statuses or operations
- Safe modification:
  - Extract each market status into sub-component
  - Move filter/sort logic to custom hooks
  - Add integration tests for each status flow
- Test coverage: No tests exist

**useMarkets Hook (772 lines):**
- Files: `app/src/hooks/useMarkets.ts`
- Why fragile:
  - Complex nested API call orchestration with multiple error paths
  - Manual address parsing/conversion scattered through
  - Each market can fail independently but all-or-nothing error handling
  - Hard to add new market fields without touching 10 places
- Safe modification:
  - Extract parsing logic to separate utils
  - Use map/reduce instead of nested loops
  - Add early validation of API responses
- Test coverage: No tests exist

**Contract Address Configuration:**
- Files: `app/src/config/networks.ts`, `app/src/config/contracts.ts`
- Why fragile:
  - Addresses hardcoded, must match on-chain deployments exactly
  - No validation that addresses are valid TON format
  - Comments mention contract versions (V6.2, V6.3) but no way to verify in code
  - Wrong address means all operations silently fail
- Safe modification:
  - Add address format validation (should be 34 chars base64url)
  - Add comment with contract deployment date/tx hash for verification
  - Create migration script to test contract addresses before deploy
- Test coverage: No validation

**Rate Limiting / TONAPI Calls:**
- Files: `app/src/hooks/useMarkets.ts` (lines 23-32)
- Why fragile:
  - Rate limit hardcoded (BATCH_SIZE=2, BATCH_DELAY_MS=2500 for free tier)
  - No adaptive backoff if rate limit actually hit
  - If TONAPI changes limits or adds new endpoints, code breaks
  - API key optional (`hasApiKey`), triggers different code paths, hard to test both
- Safe modification:
  - Implement proper exponential backoff (not just fixed retry)
  - Add TONAPI health check on startup
  - Use queue/worker pattern instead of Promise.all
- Test coverage: No tests

## Scaling Limits

**TONAPI Free Tier Limits:**
- Current capacity: ~1 request/second without key, ~10 req/s with key
- Limit: Dashboard becomes unusable with 20+ markets. Each market = 3-5 API calls, so max ~5-7 markets at once without key
- Scaling path: Mandate TONAPI API key for production. With key, can handle 20-30 markets. For 100+ markets, must move to cache-first architecture (Supabase).

**Supabase Cache Dependency:**
- Current capacity: Supabase free tier = 500MB database, ~100k database requests/month
- Limit: With 100+ markets and hourly refreshes, will exceed free tier quickly
- Scaling path: Paid Supabase tier or replace with self-hosted cache (Redis, PostgreSQL). Must pay as scale grows.

**Browser Memory for Large Market Lists:**
- Current capacity: ~100 markets in state before noticeable slowdown
- Limit: DOM rendering slows, hooks refetch on every market change
- Scaling path: Virtualize market list (react-window). Pagination. Implement proper caching layer.

**Transaction Confirmation Polling:**
- Current capacity: Fixed 8-second wait per transaction
- Limit: If mainnet network congestion increases, 8 seconds becomes too short
- Scaling path: Query transaction status via TONAPI, not just wait + hope. Exponential backoff.

## Dependencies at Risk

**@ton/core (^0.62.0):**
- Risk: Semver allows minor/patch updates. address parsing formats may change.
- Impact: Breaking address serialization, comparison failures
- Migration plan: Pin to exact version in package.json, add tests for address handling before upgrading

**TonConnect UI (^2.3.1):**
- Risk: Wallet connection requirements may change. Breaking auth flow.
- Impact: Users can't connect wallets, app unusable
- Migration plan: Monitor TonConnect releases, test before upgrading, pin version in critical deployment

**Supabase (@supabase/supabase-js ^2.89.0):**
- Risk: Schema changes, auth changes, RLS breaking
- Impact: Cache layer fails, app loads markets slowly
- Migration plan: Use stable API version, test schema migrations in staging before prod

## Missing Critical Features

**Transaction Confirmation / Status Tracking:**
- Problem: After submitting transaction, app waits fixed 8 seconds then assumes it succeeded. If it fails on-chain, user never knows. No way to view transaction history or re-submit.
- Blocks: Users can't recover from failed transactions, no confidence in actions
- Impact: Lost HNCH tokens, frustrated users

**Market Search / Advanced Filtering:**
- Problem: Can only filter by status, category, sort by few fields. No full-text search for market questions.
- Blocks: Users can't find specific markets in large lists
- Impact: Poor UX for 100+ markets

**Multi-Network State Management:**
- Problem: Switching networks triggers full page reload. Cannot view testnet and mainnet markets simultaneously.
- Blocks: Testing, comparing networks, user context lost
- Impact: Clunky UX, hard to debug issues

**Batch Transaction Support:**
- Problem: Each action (propose, challenge, settle) is one transaction. If user wants to perform 5 actions, needs 5 wallet confirmations.
- Blocks: Bulk operations impossible
- Impact: Poor UX for active users

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Utility functions, address parsing, epoch calculations, fee math, market state transitions
- Files: All files in `app/src/` and `app/src/hooks/`
- Risk: Any refactoring breaks things silently. Hard to verify address logic correct. Fee calculations unverified.
- Priority: High (address parsing + fee math most critical)

**No Integration Tests:**
- What's not tested: Hook flows (fetch markets -> parse -> update state), contract interactions (propose -> challenge -> settle)
- Files: `app/src/hooks/useMarkets.ts`, `app/src/hooks/useContract.ts`, `app/src/components/Markets.tsx`
- Risk: Cannot verify market state transitions work correctly. Breaking changes to API responses go undetected.
- Priority: High

**No End-to-End Tests:**
- What's not tested: Full user workflows (connect wallet -> view markets -> propose -> challenge -> settle)
- Files: Entire app
- Risk: Cannot test on testnet before mainnet deployment. Cannot regression test after updates.
- Priority: Medium (expensive to run, but prevents catastrophic failures)

**No Mock/Stub for TONAPI:**
- What's not tested: App behavior when TONAPI is slow/down. Rate limit retry logic. Error handling.
- Files: `app/src/hooks/useMarkets.ts`, `app/src/hooks/useContract.ts`
- Risk: Assume TONAPI always works. No fallback if it goes down.
- Priority: Medium

---

*Concerns audit: 2026-02-01*
