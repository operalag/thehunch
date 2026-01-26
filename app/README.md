# HUNCH Oracle Frontend

React frontend for the HUNCH Oracle prediction market platform on TON blockchain.

## Features

- TonKeeper wallet integration via TonConnect
- Dashboard with wallet stats and deployed contracts
- Prediction markets interface
- HNCH token staking

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuration

The TonConnect manifest is configured for `thehunch.app` domain:
- Manifest: `public/tonconnect-manifest.json`
- Update the manifest URL in `src/main.tsx` for production

## Contract Addresses (Testnet)

| Contract | Address |
|----------|---------|
| HNCH Jetton Master | `kQDkukAhHvMleIcMyLho8kJl69D3SbqPL8uROGPnvLelXOP8` |
| Price Oracle | `kQDlog79RnYke1cLEd0ZkwmypTEhHi1snU5GKVEFiJs67uXa` |
| Fee Distributor | `kQAaPoUoA0aakiPcHF2c2VnYixeWYxY3WQ6B1KACR_ueWfmJ` |
| Master Oracle | `kQAPl-1SsNmu879wojb7y2_syC5iTbV_fB7Sjrn8mdGovDTc` |

## Tech Stack

- React 18 + TypeScript
- Vite
- TonConnect UI React
- @ton/ton SDK
