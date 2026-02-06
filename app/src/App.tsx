import { Suspense, lazy, useState, useEffect } from 'react'
import { Header } from './components/Header'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Markets } from './components/Markets'
import { StatsSimple } from './components/StatsSimple'
import { getNetworkConfig, isMainnet } from './config/networks'
import './App.css'

// Lazy load heavy components to prevent initial crash
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })))
const Stake = lazy(() => import('./components/Stake').then(m => ({ default: m.Stake })))
const TokenFlow = lazy(() => import('./components/TokenFlow').then(m => ({ default: m.TokenFlow })))
const Admin = lazy(() => import('./components/Admin').then(m => ({ default: m.Admin })))

// Simple loading fallback
function LoadingFallback({ name }: { name: string }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
      Loading {name}...
    </div>
  )
}

// Error fallback component
function ErrorFallback({ name }: { name: string }) {
  return (
    <div style={{
      padding: '2rem',
      margin: '1rem',
      background: '#2d1f1f',
      borderRadius: '8px',
      border: '1px solid #5a3333'
    }}>
      <h3 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0' }}>
        {name} failed to load
      </h3>
      <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
        This section encountered an error. The rest of the app should still work.
      </p>
    </div>
  )
}

function App() {
  const networkConfig = getNetworkConfig();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isAdmin = hash === '#admin';

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {isAdmin ? (
          /* Admin panel - hidden behind #admin hash */
          <ErrorBoundary name="Admin" fallback={<ErrorFallback name="Admin" />}>
            <Suspense fallback={<LoadingFallback name="Admin" />}>
              <Admin />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <>
            {/* Dashboard - lazy loaded with error boundary */}
            <ErrorBoundary name="Dashboard" fallback={<ErrorFallback name="Dashboard" />}>
              <Suspense fallback={<LoadingFallback name="Dashboard" />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>

            {/* Markets - full interactive version with proposal, challenge, and DAO voting */}
            <ErrorBoundary name="Markets" fallback={<ErrorFallback name="Markets" />}>
              <Suspense fallback={<LoadingFallback name="Markets" />}>
                <Markets />
              </Suspense>
            </ErrorBoundary>

            {/* Stake - lazy loaded with error boundary */}
            <ErrorBoundary name="Stake" fallback={<ErrorFallback name="Stake" />}>
              <Suspense fallback={<LoadingFallback name="Stake" />}>
                <Stake />
              </Suspense>
            </ErrorBoundary>

            {/* Stats - using simple crash-proof version */}
            <ErrorBoundary name="Stats" fallback={<ErrorFallback name="Stats" />}>
              <StatsSimple />
            </ErrorBoundary>

            {/* TokenFlow - lazy loaded with error boundary */}
            <ErrorBoundary name="TokenFlow" fallback={<ErrorFallback name="TokenFlow" />}>
              <Suspense fallback={<LoadingFallback name="TokenFlow" />}>
                <TokenFlow />
              </Suspense>
            </ErrorBoundary>
          </>
        )}
      </main>
      <footer className="footer">
        <p>HUNCH Oracle - Decentralized Prediction Markets on TON</p>
        <p className={isMainnet() ? 'mainnet-info' : 'testnet-warning'}>
          Currently running on {networkConfig.displayName}
        </p>
        <p className="version">v2.2.0</p>
      </footer>
    </div>
  )
}

export default App
