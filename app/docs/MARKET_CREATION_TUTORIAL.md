# HUNCH Oracle - Market Creation Tutorial

## Complete Guide to Creating Prediction Markets

**Version:** 1.0
**Last Updated:** January 26, 2026
**Applicable To:** HUNCH Oracle v2.3.2+

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Set Up a TON Wallet](#3-step-1-set-up-a-ton-wallet)
4. [Step 2: Get TON Tokens](#4-step-2-get-ton-tokens)
5. [Step 3: Get HNCH Tokens on STON.fi](#5-step-3-get-hnch-tokens-on-stonfi)
6. [Step 4: Connect Wallet to HUNCH Oracle](#6-step-4-connect-wallet-to-hunch-oracle)
7. [Step 5: Create Your Market](#7-step-5-create-your-market)
8. [After Market Creation](#8-after-market-creation)
9. [Troubleshooting](#9-troubleshooting)
10. [Appendix: Cost Summary](#10-appendix-cost-summary)

---

## 1. Overview

HUNCH Oracle is a decentralized prediction market platform on the TON blockchain. Anyone can create markets about future events (sports, crypto, politics, etc.) and earn rewards when their markets are resolved.

### What You'll Need

| Requirement | Amount | Purpose |
|-------------|--------|---------|
| TON Wallet | - | To interact with the blockchain |
| TON Tokens | ~1-2 TON | Gas fees for transactions |
| HNCH Tokens | 10,000 HNCH minimum | Market creation fee |

### What You'll Create

A prediction market with:
- A YES/NO question
- Resolution rules (how to determine the outcome)
- Resolution deadline (when the outcome can be reported)

---

## 2. Prerequisites

Before starting, ensure you have:

- [ ] A smartphone (iOS or Android) OR desktop browser
- [ ] Internet connection
- [ ] A way to purchase cryptocurrency (exchange account or existing crypto)
- [ ] Basic understanding of blockchain wallets

### Supported Networks

| Network | Use Case | HNCH Token |
|---------|----------|------------|
| **Mainnet** | Real markets with real value | Real HNCH |
| **Testnet** | Testing (no real value) | Test HNCH |

**For this tutorial, we'll use Mainnet for real market creation.**

---

## 3. Step 1: Set Up a TON Wallet

### Recommended: Tonkeeper Wallet

Tonkeeper is the most popular and user-friendly TON wallet.

#### 3.1 Download Tonkeeper

**Mobile:**
- iOS: [App Store](https://apps.apple.com/app/tonkeeper/id1587742107)
- Android: [Google Play](https://play.google.com/store/apps/details?id=com.ton_keeper)

**Desktop:**
- Chrome Extension: [Chrome Web Store](https://chrome.google.com/webstore/detail/tonkeeper/omaabbefbmiijedngplfjmnooppbclkk)

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper download page on App Store/Play Store
```

#### 3.2 Create a New Wallet

1. Open Tonkeeper
2. Tap **"Create New Wallet"**
3. **IMPORTANT:** Write down your 24-word recovery phrase on paper
4. Store the recovery phrase securely (never share it!)
5. Confirm your recovery phrase
6. Set a PIN or biometric lock

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper wallet creation screen showing "Create New Wallet" button
```

```
📸 SCREENSHOT PLACEHOLDER: Recovery phrase backup screen with 24 words
```

#### 3.3 Secure Your Wallet

| DO | DON'T |
|----|-------|
| Write recovery phrase on paper | Screenshot your recovery phrase |
| Store in a safe place | Share with anyone |
| Use biometric/PIN lock | Store digitally unencrypted |

---

## 4. Step 2: Get TON Tokens

You need approximately **1-2 TON** for gas fees. Here's how to get TON:

### Option A: Buy from an Exchange

Popular exchanges that support TON:
- **Binance** - Largest exchange globally
- **OKX** - Good liquidity
- **Bybit** - Easy withdrawal
- **KuCoin** - Multiple trading pairs

#### Steps:
1. Create/login to your exchange account
2. Complete KYC verification if required
3. Deposit fiat or crypto
4. Buy TON (search for "TON" or "Toncoin")
5. Withdraw to your Tonkeeper wallet address

```
📸 SCREENSHOT PLACEHOLDER: Exchange withdrawal screen showing TON withdrawal to external address
```

### Option B: Use a Fiat On-ramp

Tonkeeper has built-in fiat purchase options:
1. Open Tonkeeper
2. Tap **"Buy"**
3. Select your payment method (card, bank transfer)
4. Follow the prompts to purchase TON

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper buy screen with fiat options
```

### Finding Your TON Address

1. Open Tonkeeper
2. Tap on your TON balance
3. Tap **"Receive"**
4. Copy your address (starts with `UQ...` or `EQ...`)

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper receive screen showing wallet address and QR code
```

---

## 5. Step 3: Get HNCH Tokens on STON.fi

HNCH is the native token used for market creation and resolution bonds on HUNCH Oracle. You can swap TON for HNCH on STON.fi, TON's largest decentralized exchange.

### 5.1 Access STON.fi

1. Go to **https://app.ston.fi/swap**
2. You'll see the swap interface

```
📸 SCREENSHOT PLACEHOLDER: STON.fi homepage with swap interface
```

### 5.2 Connect Your Wallet

1. Click **"Connect Wallet"** (top right)
2. Select **"Tonkeeper"**
3. Approve the connection in your Tonkeeper wallet
4. Your wallet address will appear in the top right

```
📸 SCREENSHOT PLACEHOLDER: STON.fi wallet connection modal showing Tonkeeper option
```

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper approval popup for STON.fi connection
```

### 5.3 Swap TON for HNCH

1. In the **"You pay"** field, select **TON**
2. In the **"You receive"** field, search for **HNCH**
   - HNCH Contract: `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs`
3. Enter the amount of TON you want to swap
4. Review the exchange rate and fees
5. Click **"Swap"**
6. Confirm the transaction in Tonkeeper

```
📸 SCREENSHOT PLACEHOLDER: STON.fi swap interface with TON selected as input and HNCH as output
```

### 5.4 Recommended Amount

| Purpose | HNCH Needed |
|---------|-------------|
| Create 1 market | 10,000 HNCH |
| Create 1 market + propose outcome | 20,000 HNCH |
| Create multiple markets | 10,000 HNCH per market |

**Tip:** Get at least **15,000 HNCH** to have some buffer for proposals.

### 5.5 Verify HNCH in Wallet

After the swap completes:
1. Open Tonkeeper
2. You should see HNCH in your token list
3. If not visible, tap **"+"** to add the token manually

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper wallet showing HNCH token balance
```

---

## 6. Step 4: Connect Wallet to HUNCH Oracle

### 6.1 Access the Application

1. Go to **https://hunch-oracle-app.vercel.app**
2. You'll see the HUNCH Oracle homepage

```
📸 SCREENSHOT PLACEHOLDER: HUNCH Oracle homepage showing header with "Connect Wallet" button
```

### 6.2 Select Network

Before connecting, ensure you're on the correct network:

1. Look at the **network indicator** in the header
2. Click to toggle between **Mainnet** and **Testnet**
3. For real markets, select **Mainnet**

```
📸 SCREENSHOT PLACEHOLDER: Network switcher showing Mainnet/Testnet toggle
```

### 6.3 Connect Your Wallet

1. Click **"Connect Wallet"** button (top right)
2. Select **"Tonkeeper"** from the wallet options
3. Approve the connection in your wallet app
4. Your wallet address will appear in the header

```
📸 SCREENSHOT PLACEHOLDER: TonConnect wallet selection modal
```

```
📸 SCREENSHOT PLACEHOLDER: Connected state showing truncated wallet address
```

### 6.4 Verify Your Balances

After connecting, scroll down to the Markets section. You should see:
- Your HNCH balance displayed
- "Create New Market" form (only visible when connected)

```
📸 SCREENSHOT PLACEHOLDER: Balance info section showing "Your HNCH Balance: X HNCH"
```

---

## 7. Step 5: Create Your Market

### 7.1 Navigate to the Market Creation Form

1. Scroll down to the **"Markets"** section
2. Find the **"Create New Market"** form
3. The form shows the creation cost: **10,000 HNCH + ~0.2 TON**

```
📸 SCREENSHOT PLACEHOLDER: Create New Market form with empty fields
```

### 7.2 Fill in Market Details

#### Question (Required)
Enter a clear YES/NO question.

**Good Examples:**
- "Will India win the 2026 ICC T20 World Cup?"
- "Will Bitcoin reach $100,000 before July 2026?"
- "Will SpaceX launch Starship to Mars in 2026?"

**Bad Examples:**
- "What will be the price of ETH?" (not YES/NO)
- "Who will win the election?" (not YES/NO)

```
📸 SCREENSHOT PLACEHOLDER: Question field filled with example question
```

#### Resolution Rules (Optional but Recommended)
Explain exactly how the market will be resolved.

**Example:**
```
Market resolves YES if India is officially declared the winner
of the ICC Men's T20 World Cup 2026 Final.

Market resolves NO if:
- Any other team wins the tournament
- India is eliminated before the final
- The tournament is cancelled
```

```
📸 SCREENSHOT PLACEHOLDER: Rules textarea filled with detailed resolution criteria
```

#### Resolution Source (Optional but Recommended)
Specify where to verify the outcome.

**Examples:**
- "Official ICC website (icc-cricket.com)"
- "CoinGecko price data"
- "Official company press release"

```
📸 SCREENSHOT PLACEHOLDER: Resolution source field filled
```

#### Resolution Date & Time (Required)
Set when the market outcome can be reported.

1. Select the **date** using the date picker
2. Select the **time** using the time picker
3. Choose your **timezone**
4. The form will show the UTC equivalent

**Rules:**
- Must be at least **2 hours** in the future
- Warning shown if more than **1 year** away

```
📸 SCREENSHOT PLACEHOLDER: Date/time pickers and timezone selector filled in
```

### 7.3 Review Your Market

Before submitting, verify:

| Field | Check |
|-------|-------|
| Question | Clear YES/NO format? |
| Rules | Unambiguous resolution criteria? |
| Source | Reliable verification source? |
| Deadline | Correct date/time/timezone? |
| Cost | 10,000 HNCH + ~0.2 TON available? |

```
📸 SCREENSHOT PLACEHOLDER: Completed form ready for submission
```

### 7.4 Submit the Transaction

1. Click **"Create Market"**
2. Tonkeeper will open with a transaction to approve
3. Review the transaction details:
   - Sending: 10,000 HNCH to Master Oracle
   - Gas: ~0.2 TON
4. Tap **"Confirm"** in Tonkeeper

```
📸 SCREENSHOT PLACEHOLDER: Tonkeeper transaction approval screen
```

### 7.5 Wait for Confirmation

1. The button will show **"Creating..."**
2. Wait for blockchain confirmation (usually 5-15 seconds)
3. You'll see a success message
4. The new market will appear in the markets list after refresh

```
📸 SCREENSHOT PLACEHOLDER: Success message after market creation
```

---

## 8. After Market Creation

### 8.1 Find Your Market

1. Click **"Refresh"** in the markets section
2. Your market should appear at the top (sorted by newest)
3. Click on your market to expand details

```
📸 SCREENSHOT PLACEHOLDER: Markets list showing the newly created market
```

### 8.2 Share Your Market

Share your market to attract traders:
- Copy the market address from the expanded view
- Share on social media, forums, or with friends

### 8.3 Market Lifecycle

| Phase | Description | Your Role |
|-------|-------------|-----------|
| **Open** | Before resolution deadline | Wait for event |
| **Waiting for Proposal** | After deadline | Anyone can propose outcome |
| **Proposed** | Outcome proposed | Can challenge if wrong |
| **Challenge Period** | Someone challenged | Bond escalation |
| **DAO Veto** | Final review period | Community votes |
| **Resolved** | Final outcome set | Claim creator rebate |

### 8.4 Claim Creator Rebate

After your market is resolved:
1. Find your market in the list
2. Click **"Claim Creator Rebate"**
3. Approve the transaction
4. Receive your HNCH reward!

---

## 9. Troubleshooting

### "Insufficient HNCH Balance"

**Cause:** You don't have enough HNCH tokens.

**Solution:**
1. Check your balance in Tonkeeper
2. Go to STON.fi and swap more TON for HNCH
3. Wait for the swap to complete
4. Refresh the HUNCH Oracle page

### "Transaction Failed"

**Cause:** Various reasons (network issues, insufficient gas, etc.)

**Solution:**
1. Ensure you have at least 0.5 TON for gas
2. Wait a few minutes and try again
3. Check TON network status

### "Wallet Not Connecting"

**Cause:** Browser/wallet compatibility issues.

**Solution:**
1. Try refreshing the page
2. Disconnect and reconnect wallet
3. Clear browser cache
4. Try a different browser

### "Market Not Appearing"

**Cause:** Blockchain delay or caching.

**Solution:**
1. Wait 30 seconds
2. Click "Refresh" in the markets section
3. Check your transaction in Tonkeeper history

### "HNCH Not Visible in Tonkeeper"

**Cause:** Token not auto-detected.

**Solution:**
1. Tap "+" in Tonkeeper to add token
2. Search for HNCH or enter contract:
   ```
   EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs
   ```

---

## 10. Appendix: Cost Summary

### Market Creation Costs

| Item | Cost | Notes |
|------|------|-------|
| Creation Fee | 10,000 HNCH | Sent to Master Oracle |
| Gas Fee | ~0.2 TON | Network transaction fee |
| **Total** | **10,000 HNCH + ~0.2 TON** | Per market |

### Other Actions (After Market Creation)

| Action | Cost |
|--------|------|
| Propose Outcome | 10,000 HNCH (minimum bond) |
| Challenge Outcome | 2x current bond |
| Cast Veto Vote | No cost (gas only) |
| Settle Market | Gas only (~0.1 TON) |
| Claim Rewards | Gas only (~0.05 TON) |

### Current Exchange Rates (Approximate)

Check STON.fi for current rates:
- https://app.ston.fi/swap

---

## Quick Reference Card

```
╔════════════════════════════════════════════════════════════╗
║           HUNCH ORACLE - QUICK REFERENCE                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  WEBSITE:    https://hunch-oracle-app.vercel.app           ║
║  DEX:        https://app.ston.fi/swap                      ║
║  WALLET:     Tonkeeper (recommended)                       ║
║                                                            ║
║  HNCH TOKEN (Mainnet):                                     ║
║  EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs         ║
║                                                            ║
║  COSTS:                                                    ║
║  • Create Market:  10,000 HNCH + ~0.2 TON                  ║
║  • Propose:        10,000 HNCH minimum                     ║
║  • Challenge:      2x current bond                         ║
║                                                            ║
║  REQUIREMENTS:                                             ║
║  • Resolution date must be 2+ hours in future              ║
║  • Question must be YES/NO answerable                      ║
║  • Clear resolution criteria recommended                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Support

For questions or issues:
- Check this documentation first
- Visit the HUNCH Oracle website
- Contact the development team

---

*Tutorial created: January 26, 2026*
*For HUNCH Oracle v2.3.2*
