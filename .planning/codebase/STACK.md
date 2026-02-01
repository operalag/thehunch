# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**
- TypeScript 5.8.3 - Full codebase (both components and utilities)
- React 18.3.1 - UI component library
- CSS (Tailwind) 3.4.17 - Styling system

## Runtime

**Environment:**
- Node.js (inferred from package manager)
- Browser (client-side only)

**Package Manager:**
- npm (package-lock.json present)
- Alternative: Bun (bun.lockb file indicates Bun support)
- Lockfile: Present (package-lock.json, bun.lockb)

## Frameworks

**Core:**
- React 18.3.1 - UI framework
- React Router DOM 6.30.1 - Client-side routing
- Vite 5.4.19 - Build tool and dev server (configured in `vite.config.ts`)

**UI Component System:**
- shadcn/ui (component library built on Radix UI primitives)
- Radix UI - Accessible component primitives
  - Accordion, Dialog, Dropdown, Select, Tabs, Tooltip, and 20+ other components
  - All versions ^1.x to ^2.x, imported as @radix-ui/react-*

**Styling & Theming:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
  - Configuration: `tailwind.config.ts` with custom theme, animations, sidebar colors
  - CSS Variables for dynamic theming (HSL-based color system)
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.21 - Browser compatibility

**State Management:**
- Zustand 5.0.9 - Lightweight state management
  - Used in: `src/store/blockchainStore.ts`
  - Includes persist middleware for local storage

**Data Fetching & Caching:**
- TanStack React Query 5.83.0 - Server state management
  - Configured in `src/App.tsx` with QueryClientProvider

**Forms & Validation:**
- React Hook Form 7.61.1 - Form state management
- @hookform/resolvers 3.10.0 - Form validation resolvers
- Zod 3.25.76 - Schema validation library

**Animation:**
- Framer Motion 12.23.24 - Animation library (used in all section components)
- Tailwind CSS Animate 1.0.7 - CSS animation utilities

**Blockchain/Web3:**
- @tonconnect/ui-react 2.3.1 - TON wallet connection and UI components
  - Manifest URL: https://hunch-demo-frontend.vercel.app/tonconnect-manifest.json

**Charts & Visualization:**
- Recharts 2.15.4 - React charting library

**UI Utilities:**
- Lucide React 0.462.0 - Icon library
- Class Variance Authority 0.7.1 - CSS class composition
- clsx 2.1.1 - Conditional CSS class builder
- Tailwind Merge 2.6.0 - Merge Tailwind classes
- Sonner 1.7.4 - Toast notifications
- Embla Carousel React 8.6.0 - Carousel/slider component
- Vaul 0.9.9 - Drawer/modal primitives
- React Resizable Panels 2.1.9 - Resizable UI panels
- Input OTP 1.4.2 - OTP input component
- React Day Picker 8.10.1 - Date picker component
- Date-fns 3.6.0 - Date utility library
- Next Themes 0.3.0 - Theme management

**Development Tools:**
- TypeScript ESLint 8.38.0 - TypeScript linting
  - ESLint 9.32.0 - JavaScript linter
  - ESLint config: `eslint.config.js` (flat config format)
- ESLint Plugin React Hooks 5.2.0 - React hooks linting rules
- ESLint Plugin React Refresh 0.4.20 - Vite React refresh linting
- @vitejs/plugin-react-swc 3.11.0 - SWC compiler for Vite (faster transpilation)
- Lovable Tagger 1.1.11 - Component tagging utility (dev mode)
- @types/react 18.3.23 - React type definitions
- @types/react-dom 18.3.7 - React DOM type definitions
- @types/node 22.16.5 - Node.js type definitions
- Globals 15.15.0 - Global variable types
- @tailwindcss/typography 0.5.16 - Tailwind typography plugin

## Key Dependencies

**Critical:**
- @tonconnect/ui-react 2.3.1 - TON blockchain wallet integration (core to app functionality)
- zustand 5.0.9 - State management for blockchain data and user state
- react-router-dom 6.30.1 - Page navigation and routing
- zod 3.25.76 - Runtime type validation for forms

**Infrastructure:**
- vite 5.4.19 - Fast build tool with dev server
- tailwindcss 3.4.17 - CSS framework
- typescript 5.8.3 - Type system

## Configuration

**Environment:**
- Defined in: `app/.env.example`
- Key variables required:
  - VITE_SUPABASE_URL - Supabase project URL (optional for market caching)
  - VITE_SUPABASE_ANON_KEY - Supabase anonymous API key (optional)
  - VITE_TONAPI_KEY - TON API key for improved rate limits (optional)
- Note: Network switching handled via localStorage UI, no environment variable needed

**Build:**
- Build config: `vite.config.ts`
  - Server host: `::`
  - Server port: 8080
  - Path alias: `@/` → `./src/`
  - Plugins: React SWC, Lovable Tagger (dev mode)
- Tailwind config: `tailwind.config.ts`
  - Dark mode: class-based
  - Custom keyframes: fade-in, slide-up, pulse-glow, float
  - Sidebar component theme variables
- PostCSS config: `postcss.config.js`
  - Tailwind CSS + Autoprefixer
- TypeScript config: `tsconfig.app.json` (primary), `tsconfig.json` (root)
  - Target: ES2020
  - Module: ESNext
  - Strict mode: Disabled (for flexibility)
- Component config: `components.json` (shadcn/ui)
  - Template: TSX
  - CSS: Tailwind with CSS variables

## Platform Requirements

**Development:**
- Node.js (npm/Bun compatible)
- TypeScript support required
- Modern browser (ES2020 target)

**Production:**
- Deployment: Vercel (configured via `.vercel/project.json`)
  - Project ID: prj_BoKYAjDNJtOQBIvriXVvz2RoyCd0
  - Organization ID: team_gnGwRxIk4OQbhNVObDruMSmV
- Hosting: Static site (frontend only, no backend)
- Domain: https://hunch.lovable.app/ and https://hunch-demo-frontend.vercel.app/

---

*Stack analysis: 2026-02-01*
