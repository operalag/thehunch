# HUNCH Oracle v2.0.0 - Testing Plan

## Quick Test (5 minutes)

### 1. Build Test
```bash
cd /Users/tonicaradonna/hunch-oracle-launchpad/frontend
npm run build
```
**Expected**: Build completes without errors

### 2. Visual Test
```bash
npm run preview
```
**Expected**:
- Site loads at http://localhost:4173
- No console errors
- Markets section visible

### 3. Connection Test
- Click TonConnect button
- Connect wallet
**Expected**: Wallet connects successfully

### 4. Markets Display Test
- Scroll to Markets section
**Expected**:
- Markets list displays
- Filter buttons show counts
- Status badges show colors

## Full Test Suite (30 minutes)

### Test 1: Market List Display

**Steps**:
1. Open site
2. Navigate to Markets section
3. Verify markets load from Supabase

**Verification**:
- [ ] Markets list displays (not "No markets found")
- [ ] Each market shows: question, status, deadline, contract link
- [ ] Status badges show correct colors
- [ ] Contract links open in new tab to explorer

**Expected Results**:
```
Market Cards Display:
┌─────────────────────────────┐
│ [OPEN] Market #123          │
│ Question: Will...?          │
│ Deadline: Jan 26, 2026      │
│ Contract: kQBO...            │
│ [Propose Outcome]           │
└─────────────────────────────┘
```

### Test 2: Filters and Sorting

**Steps**:
1. Click different status filters
2. Click category filters
3. Change sort option

**Verification**:
- [ ] Status filter updates count and list
- [ ] "All" shows all markets
- [ ] "Open" shows only ready-to-propose markets
- [ ] "Waiting" shows markets before proposal window
- [ ] Category filter works
- [ ] Sort options reorder correctly

**Test Data**:
```
Filter: Open → Shows markets with green "Open" badge
Filter: Proposed → Shows markets with blue "Proposed" badge
Sort: Deadline (Soonest) → Markets with nearest deadline first
Sort: Status → DAO Voting markets appear first
```

### Test 3: Wallet Connection

**Steps**:
1. Click TonConnect button (top right)
2. Select wallet (TonKeeper, OpenMask, etc.)
3. Approve connection
4. Check balance displays

**Verification**:
- [ ] Wallet connects successfully
- [ ] HNCH balance displays in Markets section
- [ ] Create Market form appears
- [ ] Action buttons become enabled

**Expected**:
```
Your HNCH Balance: 1,234,567 HNCH
Minimum bond: 10,000 HNCH
```

### Test 4: Create Market Form

**Pre-requisites**: Wallet connected, sufficient balance

**Steps**:
1. Fill in question
2. Add optional rules and source
3. Select future date/time
4. Choose timezone
5. Verify Unix timestamp displays
6. Submit

**Verification**:
- [ ] Form accepts input
- [ ] Unix timestamp calculates correctly
- [ ] Warning shows if date < 2 hours away
- [ ] Warning shows if date > 1 year away
- [ ] Submit button enables when valid
- [ ] Transaction prompt appears

**Test Cases**:
```
Valid Input:
Question: "Will BTC reach $100k by June 2026?"
Date: 2026-06-30
Time: 23:59
Timezone: UTC
→ Should show unix timestamp and enable submit

Invalid Input:
Date: Today (less than 2 hours)
→ Should show error: "Resolution date must be at least 2 hours from now"
```

### Test 5: Propose Outcome

**Pre-requisites**:
- Wallet connected
- Market in "Open" status with proposals enabled
- Balance ≥ 10,000 HNCH

**Steps**:
1. Find an Open market with "Propose Outcome" button
2. Click "Propose Outcome"
3. Select YES or NO
4. Enter bond amount (≥ 10,000)
5. Click "Submit Proposal"
6. Approve in wallet

**Verification**:
- [ ] Proposal form displays inline
- [ ] YES/NO buttons toggle
- [ ] Bond input validates minimum
- [ ] Balance check works
- [ ] Transaction sends successfully
- [ ] Success message appears

**Test Cases**:
```
Valid Proposal:
Answer: YES
Bond: 10,000 HNCH
→ Should create proposal transaction

Invalid Proposal:
Answer: YES
Bond: 5,000 HNCH
→ Should show error: "Minimum bond is 10,000 HNCH"

Insufficient Balance:
Bond: 100,000 HNCH (but user has 50,000)
→ Should show error: "Insufficient HNCH balance"
```

### Test 6: Challenge Proposal

**Pre-requisites**:
- Market in "Proposed" or "Challenged" status
- Challenge period active (countdown > 0)
- Balance ≥ 2x current bond

**Steps**:
1. Find a Proposed market
2. Note current bond amount
3. Click "Challenge" button
4. Verify bond requirement (2x current)
5. Enter bond amount
6. Submit challenge

**Verification**:
- [ ] Challenge button shows required bond
- [ ] Form displays opposite answer automatically
- [ ] Minimum bond enforced (2x current)
- [ ] Transaction sends
- [ ] Market updates to "Challenged" status (after refresh)

**Test Cases**:
```
Market with 10,000 HNCH bond:
Challenge button: "Challenge (20,000 HNCH)"
Min bond: 20,000 HNCH
Opposite answer: Automatic (YES → NO or NO → YES)
```

### Test 7: Countdown Timers

**Steps**:
1. Find markets with active countdowns
2. Verify timer displays correctly
3. Check urgency indicator
4. Refresh page
5. Verify timer updated

**Verification**:
- [ ] Proposal countdown shows time until proposals open
- [ ] Challenge countdown shows time remaining
- [ ] DAO voting countdown shows 48h period
- [ ] Progress bars match time remaining
- [ ] Urgency colors change (green → yellow → red)

**Expected Display**:
```
┌──────────────────────────────┐
│ ⏱️ Challenge Period          │
│ 1h 23m 45s                   │
│ to challenge this outcome    │
│ [████████░░] 80%             │
└──────────────────────────────┘

Safe (>50%): Green border
Warning (12-50%): Yellow border
Urgent (<12%): Red border, pulsing
```

### Test 8: Settle Market

**Pre-requisites**:
- Market in "Proposed" or "Challenged" status
- Challenge period expired (countdown = "Challenge period ended")

**Steps**:
1. Find market with expired challenge period
2. Click "Settle Market"
3. Approve transaction
4. Wait for confirmation

**Verification**:
- [ ] Settle button only shows when period expired
- [ ] Transaction sends successfully
- [ ] Market resolves to final outcome
- [ ] Status changes to "Resolved"

### Test 9: DAO Voting

**Pre-requisites**:
- Market in "Voting" status
- User has ≥ 2,000,000 HNCH staked for 24+ hours

**Steps**:
1. Navigate to Stake section
2. Stake 2,000,000 HNCH
3. Wait 24 hours (or test with existing stake)
4. Find market in DAO Voting
5. Verify eligibility message
6. Click "Veto" or "Support"
7. Approve transaction

**Verification**:
- [ ] Eligibility check works
- [ ] "Eligible" message shows for qualified users
- [ ] "Not eligible" message shows requirements
- [ ] Veto/Support buttons work
- [ ] Vote counts update (after refresh)
- [ ] Net effect displays correctly

**Eligibility Test**:
```
User with 2M+ HNCH staked 24h+:
→ "You are eligible to veto/counter-veto"
→ Buttons enabled

User with < 2M HNCH or < 24h stake:
→ "Requires 2,000,000 HNCH staked for 24h+"
→ Buttons disabled
```

### Test 10: Finalize Veto

**Pre-requisites**:
- Market in "Voting" status
- Voting period expired (48h passed)

**Steps**:
1. Find market with expired veto period
2. Click "Finalize Vote"
3. Approve transaction

**Verification**:
- [ ] Finalize button appears after period expires
- [ ] Transaction sends
- [ ] Market resolves based on net veto count
- [ ] Final outcome matches vote result

### Test 11: Claim Creator Rebate

**Pre-requisites**:
- Market in "Resolved" status
- User is market creator
- Rebate not claimed yet

**Steps**:
1. Find resolved market you created
2. Verify rebate info displays
3. Click "Claim X HNCH Rebate"
4. Approve transaction

**Verification**:
- [ ] Rebate amount shows (2,500 HNCH)
- [ ] Claim button only shows for creator
- [ ] Transaction sends
- [ ] Rebate marked as claimed

**Expected Display**:
```
Creator Rebate (25%): 2,500 HNCH (Available)
[Claim 2,500 HNCH Rebate]
```

### Test 12: Claim Resolver Reward

**Pre-requisites**:
- Market in "Resolved" status
- User is resolver (proposer or last challenger)
- Reward not claimed yet

**Steps**:
1. Find resolved market you resolved
2. Verify resolver reward displays
3. Click "Claim X HNCH Resolver Reward"
4. Approve transaction

**Verification**:
- [ ] Reward amount shows (500 HNCH)
- [ ] Claim button only shows for resolver
- [ ] Transaction sends
- [ ] Reward marked as claimed

**Expected Display**:
```
Resolver Reward (5%): 500 HNCH (Available)
[Claim 500 HNCH Resolver Reward]
```

### Test 13: Mobile Responsiveness

**Devices to Test**:
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

**Steps**:
1. Open site on mobile
2. Test navigation
3. Connect wallet (mobile wallet)
4. Try creating market
5. Test filters
6. Try proposing/challenging

**Verification**:
- [ ] Layout adapts to screen size
- [ ] Filters wrap correctly
- [ ] Forms are usable
- [ ] Buttons are tappable (min 44px)
- [ ] No horizontal scrolling
- [ ] Mobile wallet integration works

### Test 14: Error Handling

**Test Cases**:

1. **No Supabase Cache**:
   - Disable Supabase env vars
   - Expected: "Cache not configured" message

2. **Wallet Disconnected**:
   - Try to propose without wallet
   - Expected: Create market form hidden, actions disabled

3. **Insufficient Balance**:
   - Try to propose with < 10,000 HNCH
   - Expected: "Insufficient HNCH balance" error

4. **Transaction Rejection**:
   - Reject transaction in wallet
   - Expected: Error message, form resets

5. **Network Error**:
   - Disconnect internet
   - Try to refresh markets
   - Expected: Loading state or error message

## Performance Tests

### Load Time Test

**Tools**: Browser DevTools → Network tab

**Steps**:
1. Clear cache
2. Load site
3. Measure metrics

**Targets**:
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Time to Interactive < 4s
- [ ] Total bundle size < 2 MB

### Memory Test

**Tools**: Browser DevTools → Performance → Memory

**Steps**:
1. Load site
2. Interact with filters (50 times)
3. Refresh markets (10 times)
4. Check memory usage

**Targets**:
- [ ] No memory leaks
- [ ] Memory stable after interactions
- [ ] No interval timers running

## Browser Compatibility

**Test Browsers**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Brave

**Test Features**:
- [ ] TonConnect works
- [ ] Filters work
- [ ] Forms work
- [ ] Transactions work

## Regression Tests (After Updates)

**Before Each Release**:
1. Run full test suite
2. Test critical paths:
   - Market creation
   - Proposal
   - Challenge
   - DAO vote
   - Settle
3. Verify no console errors
4. Check bundle size hasn't grown >20%

## Bug Report Template

```markdown
### Bug Description
[Clear description of the issue]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- Browser: [Chrome 120]
- Wallet: [TonKeeper 3.5]
- Network: [Testnet]
- Version: [v2.0.0]

### Console Errors
[Paste any errors from browser console]

### Screenshots
[If applicable]
```

## Test Results Log

```markdown
## Test Run: [Date]

### Environment
- Version: v2.0.0
- Network: Testnet
- Tester: [Name]

### Results
- [x] Build Test: PASS
- [x] Market Display: PASS
- [x] Filters: PASS
- [x] Wallet Connection: PASS
- [x] Create Market: PASS
- [x] Propose: PASS
- [x] Challenge: PASS
- [ ] DAO Vote: SKIP (no eligible markets)
- [x] Settle: PASS
- [x] Claim Rebate: PASS
- [x] Mobile: PASS

### Issues Found
1. [Issue description] - Priority: High/Medium/Low
2. [Issue description] - Priority: High/Medium/Low

### Notes
[Any additional observations]
```
