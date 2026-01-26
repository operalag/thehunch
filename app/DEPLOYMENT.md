# HUNCH Oracle Frontend v2.0.0 - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

Ensure the following environment variables are set:

```bash
# Supabase Configuration (Required for market caching)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# TonAPI Configuration (Optional but recommended for better rate limits)
VITE_TONAPI_KEY=your-tonapi-key  # Get free key at https://tonconsole.com

# Network Configuration (auto-detected from domain)
# testnet for *.vercel.app, mainnet for thehunch.app
```

### 2. Supabase Setup

**Database Migration**:
```sql
-- Run the migration to create markets and cache_metadata tables
-- File: /Users/tonicaradonna/hunch-oracle-launchpad/contracts/supabase/migrations/001_markets_cache.sql
```

**Cache Population**:
```bash
# Option 1: Run cache worker locally
cd contracts
node scripts/cache-worker.js

# Option 2: Deploy as Supabase Edge Function
# Follow instructions in contracts/supabase/functions/README.md
```

### 3. Build Configuration

**Current Settings**:
- Build output: `/dist`
- Bundle size: ~1.1 MB (main chunk)
- CSS: ~33 KB
- Lazy loaded: Dashboard, Stake, TokenFlow

**Build Command**:
```bash
npm run build
```

**Preview Build**:
```bash
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Steps**:
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Deploy:
```bash
# Manual deployment
vercel --prod

# Or commit to main branch (auto-deploy)
git push origin main
```

**Environment Variables in Vercel**:
- Go to Project Settings → Environment Variables
- Add all VITE_* variables
- Redeploy for changes to take effect

### Option 2: Netlify

**Steps**:
1. Connect repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Site Settings
4. Deploy

### Option 3: Static Hosting (S3, Cloudflare Pages, etc.)

**Build Locally**:
```bash
npm run build
```

**Upload `/dist` folder** to your hosting provider

**Important**: Configure redirects for SPA routing:
```
/*    /index.html   200
```

## Post-Deployment Verification

### 1. Functional Tests

Access the deployed site and verify:

- [ ] Site loads without errors
- [ ] TonConnect wallet connection works
- [ ] Markets list displays from Supabase cache
- [ ] Filters and sorting work
- [ ] Market details show correctly
- [ ] Countdowns display
- [ ] Action buttons appear for appropriate statuses
- [ ] Forms validate input correctly
- [ ] Network indicator shows correct network

### 2. Performance Tests

Check in browser DevTools:

- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Bundle size warnings acceptable
- [ ] No console errors

### 3. Mobile Tests

Test on mobile devices:

- [ ] Responsive layout works
- [ ] TonConnect mobile wallet works
- [ ] Forms are usable
- [ ] Buttons are clickable
- [ ] No horizontal scrolling

## Monitoring

### Key Metrics to Track

1. **User Actions**:
   - Markets created
   - Proposals made
   - Challenges submitted
   - Votes cast
   - Rewards claimed

2. **Performance**:
   - Page load time
   - API response times
   - Cache hit rate

3. **Errors**:
   - JavaScript errors
   - Failed transactions
   - API failures

### Recommended Tools

- **Analytics**: Google Analytics or Plausible
- **Error Tracking**: Sentry or LogRocket
- **Performance**: Vercel Analytics or Lighthouse CI

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Vercel)
```bash
# Revert to previous deployment
vercel rollback
```

### Manual Rollback
```bash
# Switch back to v1.9.0
git revert HEAD
git push origin main
```

### Component-Level Rollback

If only Markets component has issues, revert to MarketsSimple:

```typescript
// In src/App.tsx
import { MarketsSimple } from './components/MarketsSimple'

// Replace <Markets /> with <MarketsSimple />
```

## Troubleshooting

### Build Fails

**"Module not found"**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**"Out of memory"**:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Runtime Errors

**"Supabase not configured"**:
- Check environment variables are set
- Verify they start with `VITE_`
- Rebuild after adding variables

**"Markets not loading"**:
- Verify Supabase cache is populated
- Check network tab for API errors
- Ensure CORS is configured on Supabase

**"Wallet won't connect"**:
- Check TonConnect manifest is accessible
- Verify manifest URL is correct for domain
- Test with different wallet apps

## Security Considerations

### Environment Variables

**Never commit**:
- `.env` files
- API keys
- Private keys

**Always use**:
- Environment-specific variables
- Vercel's environment variable encryption
- Read-only Supabase keys for frontend

### Smart Contract Interaction

**Frontend never has**:
- Admin privileges
- Contract deployment keys
- Direct database write access

**Users must**:
- Sign all transactions via TonConnect
- Approve each action in their wallet
- Pay gas fees from their own wallet

## Performance Optimization

### Current Optimizations

1. **Lazy Loading**: Dashboard, Stake, TokenFlow
2. **Code Splitting**: Automatic by Vite
3. **Memoization**: Filters and sorting
4. **Supabase Cache**: No blockchain calls for list view

### Future Optimizations

If bundle size becomes an issue:

1. **Manual Chunk Splitting**:
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ton-sdk': ['@ton/core', '@ton/ton'],
          'ui': ['@tonconnect/ui-react'],
        }
      }
    }
  }
}
```

2. **Dynamic Imports**:
```typescript
const Markets = lazy(() => import('./components/Markets'))
```

3. **Image Optimization**:
```typescript
// Use WebP format
// Lazy load images
// Use CDN for assets
```

## Maintenance

### Regular Tasks

**Weekly**:
- [ ] Check error logs
- [ ] Verify cache is updating
- [ ] Monitor transaction success rate

**Monthly**:
- [ ] Update dependencies
- [ ] Review bundle size
- [ ] Performance audit

**Per Release**:
- [ ] Update version number in Header.tsx and App.tsx
- [ ] Update CHANGELOG.md
- [ ] Tag release in Git
- [ ] Announce in community channels

## Support

### Getting Help

1. **Check logs**: Vercel deployment logs, browser console
2. **Search issues**: GitHub issues for similar problems
3. **Community**: Telegram/Discord for quick help
4. **Documentation**: This file and MARKET_INTERACTIONS.md

### Reporting Bugs

Include:
- Browser and version
- Wallet app used
- Steps to reproduce
- Console errors
- Network (testnet/mainnet)

## Changelog

### v2.0.0 (2026-01-25)
- ✨ Restored full market interaction features
- ✨ Added propose, challenge, settle actions
- ✨ Implemented DAO voting (veto/counter-veto)
- ✨ Added creator rebate and resolver reward claims
- ✨ Enhanced filtering and sorting
- ✨ Real-time countdown timers with urgency indicators
- 🎨 Improved UI/UX for market cards
- 📚 Comprehensive documentation

### v1.9.0 (Previous)
- Simple read-only markets view
- Supabase cache integration
- Basic filters

## License

[Your License]

## Credits

Built with:
- React 19
- Vite 7
- TonConnect
- TON SDK
- Supabase
