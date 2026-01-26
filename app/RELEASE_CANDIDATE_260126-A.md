# HUNCH Oracle Frontend - Release Candidate 260126-A

**Status:** RELEASE CANDIDATE
**Version:** RC-260126-A
**Date:** January 26, 2026
**Deployment:** https://hunch-oracle-app.vercel.app

---

## Verification Status

| Feature | Status | Verified |
|---------|--------|----------|
| V6.3 Markets Display (Mainnet) | Working | Jan 26, 2026 |
| V6.3 Markets Display (Testnet) | Working | Jan 26, 2026 |
| Network Switcher | Working | Jan 26, 2026 |
| Staking Flow (Mainnet) | **VERIFIED** | Jan 26, 2026 |
| Wallet Connection | Working | Jan 26, 2026 |

---

## Executive Summary

This release candidate introduces the V6.3 ICC T20 World Cup 2026 prediction markets on both mainnet and testnet. The frontend has been updated to display only V6.3 markets, with a unified interface supporting network switching between mainnet and testnet.

---

## What Was Completed

### 1. V6.3 Smart Contract Deployment

**Mainnet Markets (3 markets):**

| ID | Question | Contract Address | Resolution Date |
|----|----------|------------------|-----------------|
| 201 | Will at least one Associate Member team qualify for the Super 8 stage? | `EQC_VsNJ-J_HSsmx0Y1QFS8E0LK6rCWXPHXQFE0oxl1Hueo7` | Feb 21, 2026 |
| 202 | Will the 2026 T20 World Cup Final be held in Ahmedabad? | `EQCDuW199q4qRQvhNEUISARBVLQv2dzIZyloarWHTFWeX5ls` | Mar 6, 2026 |
| 203 | Will India win the 2026 ICC Men's T20 World Cup? | `EQDiIaoH-6tkypJpRF0yKTkLbgRhYCeohdRHvtbotDBpUW_b` | Mar 10, 2026 |

**Testnet Markets (4 markets):**

| ID | Question | Contract Address | Resolution Date |
|----|----------|------------------|-----------------|
| 101 | Will this resolve to YES? (Test Market) | `kQDfp5UzzqG0fgn20V_waUKdRibJBSqvcbu7xkhao4uNRL7a` | Already passed |
| 102 | Will India win the 2026 ICC Men's T20 World Cup? | `kQDAQgBDY8HkA6Jn-gmPgE95Q_X-J2RRdesOC6kqDJ61oHvL` | Mar 10, 2026 |
| 103 | Will the 2026 T20 World Cup Final be held in Ahmedabad? | `kQAhDEt2GwdhEd0VGuYzPEX7zUaUBFimx6qgPUWHk-Bnwo7J` | Mar 6, 2026 |
| 104 | Will at least one Associate Member team qualify for the Super 8? | `kQCQueuPJYMfDofROv0rYyevQwMGk4AI46vAq_JQPQkHNrdM` | Feb 21, 2026 |

### 2. Supabase Cache Integration

All V6.3 markets have been inserted into the Supabase cache:
- **Project URL:** `https://sjxzalzokkxrxcdwwiwd.supabase.co`
- **Table:** `markets`
- Markets are fetched instantly from cache instead of blockchain API calls

### 3. Frontend Updates

**Key Changes:**
- Added network switcher (mainnet/testnet toggle)
- Implemented V6.3 market filtering (ID range 101-999 for testnet, 201-999 for mainnet)
- Added hardcoded V6.3 testnet markets as fallback when Supabase unavailable
- Updated version to v2.3.2

**Files Modified:**
- `src/hooks/useMarketsCache.ts` - Market fetching with V6.3 filtering
- `src/components/Header.tsx` - Version badge

### 4. Infrastructure

**Master Oracle Contracts:**
- Mainnet: `EQB4nPFKiajN2M_5ZTo83MQ9rRMUzPq0pkSEU33RH877cW3J`
- Testnet: `kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf`

**HNCH Token (Mainnet):**
- Jetton Master: `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs`

**Deployer Wallet:**
- Address: `UQBTNdmtPpYGrWqKzcbaZsbXHOrImwcp7yPQ-htNDs199P2D`
- Minted 50,000 HNCH for market deployment fees

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.3.0 | Jan 26, 2026 | Initial V6.3 ICC markets support |
| v2.3.1 | Jan 26, 2026 | Added ID >= 101/201 filter |
| v2.3.2 | Jan 26, 2026 | Fixed filter to exclude V6.2 markets (ID 101-999 range) |

---

## Git Commits

```
eac1496d - fix: Filter out V6.2 markets with large IDs
b58e2a67 - fix: Filter to show only V6.3+ markets
86797248 - feat: Add V6.3 ICC T20 World Cup 2026 markets support
```

---

## Known Issues & Technical Debt

### Issues Resolved This Session
1. **V6.2 markets showing** - Old markets had IDs like 1769380451+ which passed the >= 101 filter. Fixed by adding upper bound (ID <= 999).

### Remaining Technical Debt
1. **Hardcoded market IDs** - The V6.3 filter uses hardcoded ID ranges. Future market creation should follow a consistent ID scheme.
2. **V6.2 markets in Supabase** - Old V6.2 markets still exist in Supabase (not deleted, just filtered out). Consider cleanup.
3. **Large bundle size** - Vite build warning: main chunk is 1,118 KB. Consider code-splitting.

---

## Future Improvements Discussed

### Short-term (Next Sprint)
1. **Market Creation Flow** - When new markets are created via frontend, ensure they get sequential IDs (105+, 204+)
2. **Supabase Cleanup** - Delete old V6.2 markets from Supabase to reduce database clutter
3. **Real-time Updates** - Add Supabase realtime subscriptions for market status changes

### Medium-term
1. **Market Maker Integration** - API documentation created (`V6_3_DEPLOYMENT_REPORT.md` in contracts directory)
2. **Trading Interface** - Implement buy YES/NO functionality with HNCH tokens
3. **Resolution Flow** - Implement propose/challenge/settle UI

### Long-term
1. **Mobile Responsiveness** - Optimize for mobile devices
2. **Multi-language Support** - Add Hindi, Urdu, Bengali for cricket markets
3. **Analytics Dashboard** - Track trading volume, user participation

---

## Testing Checklist

### Verified Working
- [x] Mainnet shows exactly 3 V6.3 markets
- [x] Testnet shows exactly 4 V6.3 markets
- [x] Network switcher toggles between mainnet/testnet
- [x] Markets load from Supabase cache instantly
- [x] Version badge shows RC-260126-A
- [x] Wallet connection via TonConnect
- [x] **Staking flow on Mainnet** - VERIFIED Jan 26, 2026

### Needs Testing
- [ ] Market detail page displays correctly
- [ ] Trading flow (buy YES/NO)
- [ ] Proposal/challenge flow
- [ ] Unstaking flow
- [ ] Claim rewards flow
- [ ] Mobile responsiveness

---

## Deployment Commands

```bash
# Build locally
npm run build

# Deploy to Vercel
vercel --prod --yes

# Check deployment
curl https://hunch-oracle-app.vercel.app
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/hooks/useMarketsCache.ts` | Market fetching from Supabase with V6.3 filtering |
| `src/components/Header.tsx` | App header with version badge |
| `src/config/supabase.ts` | Supabase client configuration |
| `src/config/networks.ts` | Network configuration (mainnet/testnet) |

---

## Contact & Handoff Notes

**For Scrum Master:**
- This is a **RELEASE CANDIDATE** ready for QA testing
- All V6.3 ICC T20 World Cup 2026 markets are live on mainnet
- Frontend filters correctly show only V6.3 markets
- Market maker integration docs available at `/contracts/V6_3_DEPLOYMENT_REPORT.md`

**For Developers:**
- The ID filtering logic is in `useMarketsCache.ts` lines 302-315
- If adding new markets, use IDs 105+ (testnet) or 204+ (mainnet)
- Supabase service role key required for inserting new markets (stored in env, not in code)

**For QA:**
- Test both mainnet and testnet market display
- Verify market details show correct resolution dates
- Test wallet connection and balance display

---

*Report generated: January 26, 2026*
*Last updated by: Claude Code session*
