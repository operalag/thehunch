# Market Interactions - v2.0.0

## Overview

Version 2.0.0 restores full market interaction capabilities to the HUNCH Oracle frontend. Users can now create markets, propose outcomes, challenge proposals, participate in DAO voting, and claim rewards.

## Features Implemented

### 1. Market List View

**Data Source**: Supabase cache (for performance)
- Instant loading without blockchain calls
- Real-time filtering and sorting
- Responsive design

**Display Information**:
- Market question, rules, and resolution source
- Current status (open, proposed, challenged, voting, resolved)
- Resolution deadline with timezone support
- Contract address with explorer link
- Category badges (Cricket, Champions League, Soccer, Winter Olympics, Other)

**Filtering**:
- **Status Filter**: All, Open, Waiting, Proposed, Challenged, DAO Veto, Resolved
- **Category Filter**: All categories or specific sports
- **Sort Options**: Newest, Oldest, Deadline (soon/late), Status urgency, Alphabetical

### 2. Market Detail View

**Displayed for Each Market**:
- Full question and resolution rules
- Resolution source verification
- Current proposal status and bond amounts
- Escalation count (max 3 before DAO)
- Real-time countdown timers

**Countdown Timers** (with visual urgency indicators):
- Proposal window (5 min after deadline)
- Challenge period (2h initial, 4h escalated)
- DAO voting period (48h)
- Color-coded urgency: Green (safe) → Yellow (warning) → Red (urgent)

### 3. Market Creation

**Form Fields**:
- Question (YES/NO answerable)
- Resolution rules (optional)
- Resolution source (optional)
- Resolution date and time
- Timezone selector

**Cost**: 10,000 HNCH + ~0.2 TON for deployment

**Validation**:
- Date must be at least 2 hours in future
- Warning if date is more than 1 year away
- Timezone-aware Unix timestamp calculation

### 4. Propose Outcome

**Requirements**:
- Market must be in "open" status
- Proposal window must be active (5 min after deadline)
- Minimum bond: 10,000 HNCH

**Process**:
1. Click "Propose Outcome" button
2. Select YES or NO
3. Enter bond amount (min 10,000 HNCH)
4. Submit proposal
5. Wait for blockchain confirmation

**Challenge Period**:
- Initial proposal: 2 hours
- After 1st challenge: 4 hours
- After 2nd challenge: 4 hours
- After 3rd challenge: Goes to DAO

### 5. Challenge Proposal

**Requirements**:
- Market must be in "proposed" or "challenged" status
- Challenge period must be active
- Bond amount: 2x current bond
- Max 3 escalations before DAO

**Process**:
1. Click "Challenge" button
2. System automatically selects opposite answer
3. Enter bond amount (min 2x current)
4. Submit challenge
5. Wait for confirmation

**Bond Escalation**:
- Proposal: 10,000 HNCH
- 1st Challenge: 20,000 HNCH
- 2nd Challenge: 40,000 HNCH
- 3rd Challenge: 80,000 HNCH → DAO

### 6. DAO Voting (Veto System)

**Requirements to Vote**:
- Stake at least 2,000,000 HNCH (2% of supply)
- Stake must be locked for 24+ hours
- Market must be in "voting" status

**Voting Options**:
- **Veto**: Flip the proposed answer
- **Counter-Veto**: Support the proposed answer
- Net effect determines final outcome

**Voting Period**: 48 hours

**Process**:
1. Market escalates to DAO after 3 challenges
2. Eligible stakers can cast veto or counter-veto
3. After 48h, anyone can finalize the vote
4. Final outcome determined by net veto count

**Vote Display**:
- Veto count vs Support count
- Net effect prediction
- Countdown timer with visual urgency
- Eligibility indicator

### 7. Settle Market

**Requirements**:
- Market must be in "proposed" or "challenged" status
- Challenge period must have expired
- No one challenged during the period

**Process**:
- Click "Settle Market" button
- Market resolves to current proposed outcome
- Bonds are distributed

### 8. Claim Rewards

**Creator Rebate (25%)**:
- Available after market resolves
- 2,500 HNCH per market (25% of 10,000 fee)
- Only claimable by market creator
- Button appears automatically when eligible

**Resolver Reward (5%)**:
- Available after market resolves
- 500 HNCH per market (5% of 10,000 fee)
- Claimable by:
  - Proposer (if unchallenged)
  - Last challenger (if challenged)
  - Treasury (if DAO vetoed)

## User Interface

### Market Card Structure

```
┌─────────────────────────────────────────┐
│ [STATUS BADGE]              Market #123 │
│                                         │
│ Question: Will ETH reach $5,000?       │
│                                         │
│ Rules: Market resolves YES if...       │
│                                         │
│ Resolution Source: CoinGecko            │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │  ⏱️  Challenge Period           │    │
│ │  1h 23m 45s                     │    │
│ │  [Progress Bar ████░░░░░░]     │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Proposed: YES                           │
│ Current Bond: 20,000 HNCH              │
│ Escalations: 1/3                       │
│                                         │
│ Contract: kQBO...5JPc →                │
│                                         │
│ [Challenge (40,000 HNCH)]              │
└─────────────────────────────────────────┘
```

### Filter Controls

```
Status: [All] [Open] [Waiting] [Proposed] [Challenged] [DAO Veto] [Resolved]
                ↑ Active filter highlighted

Category: [All] [Cricket 🏏] [Champions League ⚽] [Other 📊]

Sort by: [Newest First ↕]
```

## Technical Architecture

### Component Structure

```
Markets.tsx (Main Component)
├── useContract() - Blockchain interactions
├── useMarketsCache() - Supabase data fetching
├── useJettonBalance() - HNCH balance
├── useStakingInfo() - Veto eligibility
└── UI Components:
    ├── Market Creation Form
    ├── Market Filters
    ├── Market List
    │   └── Market Card
    │       ├── Status Badge
    │       ├── Countdown Timer
    │       ├── Market Details
    │       └── Action Buttons
    └── Action Forms (Propose/Challenge)
```

### Data Flow

```
Blockchain ─── Cache Worker ──→ Supabase ──→ useMarketsCache ──→ Markets Component
                (Periodic)                                              │
                                                                        ↓
User Actions ←── useContract ←── TonConnect ←────────────────── Action Buttons
```

### State Management

**Market Data**: Fetched from Supabase cache via `useMarketsCache`
**User Wallet**: Managed by TonConnect hooks
**Action State**: Local component state for forms
**Countdown Timers**: Calculated once per market refresh (no intervals to prevent memory leaks)

## Smart Contract Integration

### Operation Codes Used

| Action | OP Code | Contract Method |
|--------|---------|-----------------|
| Create Market | 0x01 | create_instance |
| Propose | 0x10 | propose |
| Challenge | 0x11 | challenge |
| Settle | 0x13 | settle |
| Claim Reward | 0x14 | claim_reward |
| Cast Veto | 0x41 | cast_veto |
| Counter Veto | 0x44 | counter_veto |
| Finalize Vote | 0x42 | finalize_vote |
| Claim Rebate | 0x34 | claim_creator_rebate |
| Claim Resolver | 0x37 | claim_resolver_reward |

### Contract Addresses (Testnet)

- **Master Oracle**: `kQBO-cZMdJU0lxlH1bBF8Mn7AjF5SQenaqRkq0_a5JPcqLbf`
- **HNCH Jetton**: Network-specific (see config/networks.ts)
- **Fee Distributor**: Network-specific (see config/contracts.ts)

## Performance Optimizations

1. **Supabase Cache**: Markets list loads instantly from cache
2. **Lazy Loading**: Heavy components loaded on-demand
3. **Memoization**: Filters and sorting optimized with useMemo
4. **No Auto-Refresh**: Countdowns calculated once (user can manually refresh)
5. **Error Boundaries**: Crashes isolated to individual components

## Known Limitations

1. **Countdown Timers**: Not real-time (user must refresh to update)
2. **Transaction Status**: No automatic confirmation tracking
3. **Gas Estimation**: Fixed gas amounts may need adjustment
4. **Mobile UX**: Some forms may be tight on small screens

## Testing Checklist

Before using market interactions:

- [ ] Wallet connected via TonConnect
- [ ] HNCH balance sufficient for actions
- [ ] Supabase cache populated (check with refresh)
- [ ] Network set to correct environment (testnet/mainnet)

## Common Issues

### "No markets found in cache"
**Solution**: Run the cache population script or wait for automatic refresh

### "Wallet not connected"
**Solution**: Click TonConnect button in header

### "Insufficient HNCH balance"
**Solution**: Acquire HNCH tokens (faucet for testnet, DEX for mainnet)

### "Challenge period has not ended yet"
**Solution**: Wait for countdown timer to reach zero, then manually refresh

### "You need at least 2,000,000 HNCH staked for 24h+ to veto"
**Solution**: Stake HNCH in the Stake section and wait 24 hours

## Future Enhancements

Potential improvements for future versions:

1. **Real-time Updates**: WebSocket connection for live market updates
2. **Transaction Tracking**: Show pending transactions and confirmations
3. **Notifications**: Browser notifications for countdown expiry
4. **Market Charts**: Historical data visualization
5. **Leaderboard**: Top proposers, resolvers, and voters
6. **Search**: Full-text search across market questions
7. **Bookmarks**: Save favorite markets
8. **Mobile App**: Native mobile experience

## Version History

- **v2.0.0** (2026-01-25): Full market interactions restored
- **v1.9.0** (Previous): Simple read-only markets view
- **v1.1.0** (Earlier): Resolver rewards added
- **v1.0.0** (Initial): Basic market creation

## Support

For issues or questions:
- GitHub: https://github.com/yourusername/hunch-oracle-launchpad
- Website: https://thehunch.app
- Telegram: [Your Telegram]
