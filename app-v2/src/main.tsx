// Polyfills must be imported first
import './polyfills';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { getTelegramWebApp } from './lib/telegram';
import './index.css';
import App from './App';

// Initialize Telegram Mini App
const twa = getTelegramWebApp();
if (twa) {
  twa.ready();
  twa.expand();
  twa.setHeaderColor('#0f0f0f');
  twa.setBackgroundColor('#0f0f0f');
}

// Use current origin for manifest URL
const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);
