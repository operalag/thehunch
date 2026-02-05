# Codebase Concerns

**Analysis Date:** 2026-02-05

## Tech Debt

**Hardcoded V6.3 Market Data:**
- Issue: 4 testnet markets hardcoded in `app/src/hooks/useMarketsCache.ts` (lines 19-283) because Supabase insert requires service role key
- Files: `app/src/hooks/useMarketsCache.ts`
- Impact: New testnet markets won't appear until code is manually updated and redeployed. Data duplication between code and database.
- Fix approach: Set up Supabase service role key for sync-markets Edge Function, remove hardcoded data, rely on database sync

**Waitlist Form Has No Backend:**
- Issue: TODO comment on line 24 of `src/components/WaitlistModal.tsx` - form submission is mocked with setTimeout, no actual email collection
- Files: `src/components/WaitlistModal.tsx`
- Impact: Users joining waitlist are not recorded anywhere. False promise of "we'll email you updates"
- Fix approach: Integrate with email service (SendGrid, Mailchimp) or store in Supabase

**Excessive Console Logging:**
- Issue: 171 console.log/warn/error statements across 17 files in production code
- Files: `app/src/config/supabase.ts`, `app/src/hooks/useJettonBalance.ts`, `app/src/hooks/useMarkets.ts`, `app/src/hooks/useMarketsCache.ts`, `app/src/hooks/useStakingInfo.ts`, `app/src/hooks/useContract.ts`, `app/src/components/Markets.tsx`, `app/src/components/Stats.tsx`, `app/src/components/Stake.tsx`, `app/supabase/functions/sync-markets/index.ts`
- Impact: Exposes internal logic in browser console, performance overhead, potential information disclosure
- Fix approach: Implement proper logging framework with environment-based log levels, remove debug logs from production builds

**Magic Number Pollution:**
- Issue: Hardcoded timeouts (15000ms, 2000ms), delays (300s, 5 minutes), and constants scattered throughout without named variables
- Files: `app/src/components/Stake.tsx` (lines 126, 144, 166), `app/src/hooks/useJettonBalance.ts` (retry delays), `app/src/hooks/useContract.ts` (transaction validUntil)
- Impact: Difficult to maintain consistent timing behavior, unclear why specific values chosen
- Fix approach: Extract to named constants in config file with explanatory comments

**Legacy Compatibility Code:**
- Issue: Export aliases for backwards compatibility (e.g., `useMarketsCache` exports as both new and old hook name)
- Files: `app/src/hooks/useMarketsCache.ts` (line 462), `app/src/config/contracts.ts` (lines 18, 37)
- Impact: Maintains dead code paths, unclear which is canonical import
- Fix approach: Remove legacy exports after confirming no usage in codebase

## Known Bugs

**Address Normalization Fallback:**
- Symptoms: TON address comparison uses complex base64 decoding to extract hash, but silently falls back to lowercase string comparison on decode failure
- Files: `app/src/components/Markets.tsx` (lines 79-96)
- Trigger: Malformed or unexpected address formats
- Workaround: Try-catch swallows errors and falls back, may cause false negatives in address matching

**Transaction Refresh Timing:**
- Symptoms: After staking/unstaking/claiming, UI shows stale data for 15 seconds (hardcoded setTimeout)
- Files: `app/src/components/Stake.tsx` (lines 126, 144, 166)
- Trigger: Any stake operation
- Workaround: 15-second delay before refetch, but TON blockchain confirmation can vary widely (2-30 seconds)

## Security Considerations

**Environment Variables Not Validated:**
- Risk: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY causes silent failures, app continues with degraded functionality
- Files: `app/src/config/supabase.ts`, `app/src/config/networks.ts`
- Current mitigation: Returns null client if credentials missing, falls back to hardcoded data
- Recommendations: Add startup validation, fail fast with clear error message if critical env vars missing

**No Environment File Committed:**
- Risk: .env files properly gitignored, but no .env.example in root (only in app/)
- Files: `app/.gitignore`, `.gitignore`, `app/.env.example`
- Current mitigation: Strong .gitignore patterns prevent accidental commits
- Recommendations: Add root-level .env.example documenting all required variables for monorepo setup

**TON API Key Optional:**
- Risk: Application works without VITE_TONAPI_KEY but hits rate limits quickly (referenced in useJettonBalance.ts line 67-73)
- Files: `app/src/config/networks.ts` (line 102), `app/src/hooks/useJettonBalance.ts` (lines 67-73)
- Current mitigation: Exponential backoff retry on rate limit errors
- Recommendations: Make API key required or implement request queuing to stay under free tier limits

## Performance Bottlenecks

**Markets Component Size:**
- Problem: Single 2,169-line component handling all market operations
- Files: `app/src/components/Markets.tsx`
- Cause: Monolithic component with 10+ operations (propose, challenge, settle, claim, veto, etc.) and complex state management
- Improvement path: Split into subcomponents (MarketCard, ProposalForm, ChallengeForm, VetoSection), extract operations to custom hooks

**Parallel API Batching Not Optimal:**
- Problem: Market fetching uses "parallel" but still sequential for some operations, 3-9 second load time for 12 markets
- Files: `app/src/hooks/useMarkets.ts` (lines 216-728)
- Cause: Sequential get_instance calls, each market requires multiple API calls for full state
- Improvement path: Already mitigated with Supabase caching, but direct blockchain fetching could use better batching strategy

**Sync-Markets Edge Function Size:**
- Problem: 967-line Edge Function doing market detection, participant parsing, and sync orchestration
- Files: `app/supabase/functions/sync-markets/index.ts`
- Cause: Single function handles all sync logic including transaction parsing, participant tracking, deduplication
- Improvement path: Split into separate functions (detect-markets, sync-participants, update-status), use Supabase functions composition

## Fragile Areas

**Market Status Auto-Update:**
- Files: `app/src/components/Markets.tsx`
- Why fragile: After propose/challenge/settle operations, market status updated via setTimeout(refetch, 8000ms) - assumes blockchain confirmation in 8 seconds
- Safe modification: Operations at lines 559, 594, 651, 683, 715, 740, 770, 789, 809, 829, 895 all follow same pattern
- Test coverage: No automated tests found (zero .test.ts or .spec.ts files in project)

**Address Format Handling:**
- Files: `app/src/hooks/useContract.ts` (lines 72-76, 96-104)
- Why fragile: Multiple address format conversions (raw 0:xxx to EQ.../UQ..., bounceable/non-bounceable, testnet flags)
- Safe modification: Always use Address.parse() and toString() methods from @ton/core, never manual string manipulation
- Test coverage: No tests for address conversion edge cases

**Supabase Client Nullable:**
- Files: `app/src/config/supabase.ts` (lines 13-16)
- Why fragile: `supabase` export is `SupabaseClient | null`, requires null checks before every use
- Safe modification: All Supabase operations must check `isCacheEnabled()` first or handle null client
- Test coverage: Falls back to hardcoded data on testnet, but mainnet has no fallback

**Participant Deduplication Logic:**
- Files: `app/supabase/functions/sync-markets/index.ts` (lines 389-460)
- Why fragile: Manual duplicate detection in parseParticipants() before database insert with ignoreDuplicates flag
- Safe modification: Relies on compound unique constraint (market_address, escalation_level, participant_address). Don't modify constraint without updating deduplication logic
- Test coverage: No tests, relies on production behavior

## Scaling Limits

**Market ID Range Filtering:**
- Current capacity: V6.3 markets filtered by ID ranges (testnet 101-199, mainnet 201-299)
- Limit: ID-based versioning doesn't scale - V6.4 needs new ranges, hardcoded in useMarketsCache.ts
- Scaling path: Add version field to markets table, filter by version instead of ID ranges

**Single Network per Deployment:**
- Current capacity: Network switching in UI, but network detection based on domain (testnet for *.vercel.app, mainnet for thehunch.app)
- Limit: Can't test mainnet markets on staging domain without code changes
- Scaling path: Make network a user preference in localStorage, remove domain-based detection

**Supabase Cache Refresh Strategy:**
- Current capacity: Manual refresh in UI + background Edge Function (not visible in codebase)
- Limit: No visible cron job or scheduled refresh in supabase/functions directory
- Scaling path: Document and implement scheduled refresh (every 4 hours as mentioned in SUPABASE_MARKET_CACHING_PLAN.md)

## Dependencies at Risk

**React 19.2.0:**
- Risk: React 19 is very recent (released Jan 2025), some libraries may not be compatible
- Impact: UI library (@shadcn/ui components) and state management
- Migration plan: None needed currently, but monitor for compatibility issues

**@ton/core 0.62.0:**
- Risk: TON ecosystem libraries update frequently, breaking changes possible
- Impact: All address parsing, cell serialization, transaction building
- Migration plan: Pin versions in package.json, test thoroughly before upgrading

**TonAPI Dependency:**
- Risk: Application heavily depends on TonAPI for all blockchain queries, no fallback
- Impact: If TonAPI down or rate limits exhausted, app non-functional
- Migration plan: Implement TON HTTP API fallback or run own TON node

## Missing Critical Features

**No Automated Tests:**
- Problem: Zero test files found in project (only test files are in node_modules/zod)
- Blocks: Confident refactoring, regression prevention, CI/CD pipeline
- Priority: High

**No Error Boundary for Async Failures:**
- Problem: ErrorBoundary component exists but only catches render errors, not async failures
- Files: `app/src/components/ErrorBoundary.tsx`, `src/pages/NotFound.tsx`
- Blocks: Graceful degradation when API calls fail
- Priority: Medium

**No Transaction Status Tracking:**
- Problem: After sending transactions (propose, challenge, stake), user gets alert() but no way to check transaction status
- Blocks: User can't verify if transaction succeeded without checking explorer manually
- Priority: Medium

**No Market Maker Integration:**
- Problem: V6.3_FINAL_AUDIT_REPORT.md mentions "Market Maker Documentation prepared for integration" but no code found
- Files: Documentation only, no implementation in `app/` directory
- Blocks: Liquidity provision for prediction markets
- Priority: Low (future feature)

## Test Coverage Gaps

**Hook Error States Untested:**
- What's not tested: Error handling in useMarkets, useJettonBalance, useStakingInfo, useContract
- Files: `app/src/hooks/useMarkets.ts`, `app/src/hooks/useJettonBalance.ts`, `app/src/hooks/useStakingInfo.ts`, `app/src/hooks/useContract.ts`
- Risk: Rate limit handling, network failures, malformed responses could cause uncaught errors
- Priority: High

**Address Conversion Edge Cases:**
- What's not tested: TON address parsing with invalid formats, raw vs friendly, bounceable vs non-bounceable
- Files: `app/src/hooks/useContract.ts` (lines 72-104), `app/src/components/Markets.tsx` (lines 79-96)
- Risk: Address mismatch in bond claims, transaction failures
- Priority: High

**Market Status Transitions:**
- What's not tested: State machine transitions (open → proposed → challenged → voting → resolved)
- Files: `app/src/hooks/useMarketsCache.ts`, `app/supabase/functions/sync-markets/index.ts`
- Risk: Invalid status transitions could corrupt UI state or database
- Priority: Medium

**Supabase Sync Deduplication:**
- What's not tested: Duplicate transaction detection, participant deduplication, market upsert logic
- Files: `app/supabase/functions/sync-markets/index.ts` (lines 389-460, 728-841)
- Risk: Duplicate entries in database, incorrect participant counts
- Priority: Medium

**Environment Variable Fallbacks:**
- What's not tested: App behavior with missing/invalid env vars, null Supabase client, missing API keys
- Files: `app/src/config/supabase.ts`, `app/src/config/networks.ts`
- Risk: Silent failures, degraded functionality without clear errors
- Priority: Low

---

*Concerns audit: 2026-02-05*
