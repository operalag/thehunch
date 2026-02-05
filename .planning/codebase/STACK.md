# Technology Stack

**Analysis Date:** 2026-02-05

## Languages

**Primary:**
- TypeScript 5.8.3 - All application code, type-safe throughout
- JavaScript - Configuration files (ESLint, PostCSS, Tailwind)

**Secondary:**
- CSS - Via Tailwind CSS utility classes
- HTML - React JSX templates

## Runtime

**Environment:**
- Node.js (version not pinned in project)
- Browser (client-side React SPA)

**Package Manager:**
- npm (Node Package Manager)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework
- Vite 5.4.19 - Build tool and dev server
- React Router DOM 6.30.1 - Client-side routing

**UI Components:**
- Radix UI - Complete component library (@radix-ui/react-*)
  - Includes: accordion, alert-dialog, dialog, dropdown, popover, select, tabs, toast, tooltip, and 20+ more primitives
- shadcn/ui architecture - Component system built on Radix
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- Framer Motion 12.23.24 - Animation library

**State Management:**
- Zustand 5.0.9 - Global state management
- @tanstack/react-query 5.83.0 - Server state/async data fetching
- React Hook Form 7.61.1 - Form state management

**Styling:**
- Tailwind CSS 3.4.17
- PostCSS 8.5.6
- Autoprefixer 10.4.21
- tailwindcss-animate 1.0.7 - Animation utilities
- class-variance-authority 0.7.1 - Component variant styling
- tailwind-merge 2.6.0 - Conditional class merging

**Testing:**
- No testing framework detected

**Build/Dev:**
- Vite 5.4.19 - Build tool
- @vitejs/plugin-react-swc 3.11.0 - React Fast Refresh via SWC
- TypeScript 5.8.3 - Type checking
- ESLint 9.32.0 - Linting
- lovable-tagger 1.1.11 - Development component tagging

## Key Dependencies

**Critical:**
- @tonconnect/ui-react 2.3.1 - TON blockchain wallet connection (critical for wallet integration)
- react 18.3.1 - Core framework
- react-dom 18.3.1 - React DOM renderer
- zustand 5.0.9 - Application state (stores wallet state, events, user data)

**Infrastructure:**
- @tanstack/react-query 5.83.0 - Async state management
- react-router-dom 6.30.1 - Navigation

**UI/UX:**
- @radix-ui/* packages (30+ packages) - Headless UI primitives
- lucide-react 0.462.0 - Icon library
- framer-motion 12.23.24 - Animations
- next-themes 0.3.0 - Theme switching
- sonner 1.7.4 - Toast notifications

**Forms & Validation:**
- react-hook-form 7.61.1 - Form management
- @hookform/resolvers 3.10.0 - Form validation resolvers
- zod 3.25.76 - Schema validation

**Utilities:**
- date-fns 3.6.0 - Date manipulation
- clsx 2.1.1 - Conditional classnames
- cmdk 1.1.1 - Command menu component

**Data Visualization:**
- recharts 2.15.4 - Chart library

**UI Components:**
- embla-carousel-react 8.6.0 - Carousel component
- react-day-picker 8.10.1 - Date picker
- react-resizable-panels 2.1.9 - Resizable layouts
- input-otp 1.4.2 - OTP input component
- vaul 0.9.9 - Drawer component

## Configuration

**Environment:**
- Environment variables via Vite (VITE_* prefix)
- `.env.example` shows optional configuration:
  - `VITE_SUPABASE_URL` - Supabase URL (for market caching, not currently used)
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)
  - `VITE_TONAPI_KEY` - TONAPI key (optional, for better rate limits)
- Network switching handled via localStorage in UI

**TypeScript:**
- Config: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Path alias: `@/*` maps to `./src/*`
- Strict mode disabled (noImplicitAny, strictNullChecks both false)
- Skip lib check enabled

**Build:**
- `vite.config.ts` - Vite configuration
  - React plugin with SWC compiler
  - Development: lovable-tagger for component debugging
  - Dev server: port 8080, IPv6 support
  - Path alias: `@` resolves to `./src`

**Linting:**
- `eslint.config.js` - ESLint configuration
  - TypeScript ESLint parser
  - React hooks rules
  - React refresh rules
  - Unused vars rule disabled

**Styling:**
- `tailwind.config.ts` - Tailwind configuration
  - Dark mode via class strategy
  - Custom color system (HSL variables)
  - Custom animations (fade-in, slide-up, pulse-glow, float)
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer

## Platform Requirements

**Development:**
- Node.js (no specific version pinned)
- npm or compatible package manager
- Modern browser for testing

**Production:**
- Static hosting (SPA)
- Deployment target: Vercel (based on `tonconnect-manifest.json` URL pointing to `hunch-demo-frontend.vercel.app`)

---

*Stack analysis: 2026-02-05*
