import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { MarketsPage } from './pages/MarketsPage';
import { StakePage } from './pages/StakePage';
import { ProfilePage } from './pages/ProfilePage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { CreateMarketPage } from './pages/CreateMarketPage';
import { AdminPage } from './pages/AdminPage';
import { getTelegramWebApp } from './lib/telegram';
import type { Market } from './hooks/useMarketsCache';

export type TabId = 'home' | 'markets' | 'stake' | 'profile';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateMarket, setShowCreateMarket] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Close overlays when switching tabs
  const handleTabChange = useCallback((tab: TabId) => {
    setSelectedMarket(null);
    setShowCreateMarket(false);
    setShowAdmin(false);
    setActiveTab(tab);
  }, []);

  // Handle back: close overlays first, then navigate to home
  const handleBack = useCallback(() => {
    if (showAdmin) {
      setShowAdmin(false);
    } else if (showCreateMarket) {
      setShowCreateMarket(false);
    } else if (selectedMarket) {
      setSelectedMarket(null);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [activeTab, selectedMarket, showCreateMarket, showAdmin]);

  useEffect(() => {
    const twa = getTelegramWebApp();
    if (!twa) return;

    if (showAdmin || showCreateMarket || selectedMarket || activeTab !== 'home') {
      twa.BackButton.show();
      twa.BackButton.onClick(handleBack);
    } else {
      twa.BackButton.hide();
    }

    return () => {
      twa.BackButton.offClick(handleBack);
    };
  }, [activeTab, selectedMarket, showCreateMarket, showAdmin, handleBack]);

  // Admin page overlay
  if (showAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-tg-bg text-tg-text">
        <main className="flex-1 pb-20 overflow-y-auto">
          <motion.div
            key="admin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
          >
            <AdminPage onBack={() => setShowAdmin(false)} />
          </motion.div>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  // Create market overlay
  if (showCreateMarket) {
    return (
      <div className="flex flex-col min-h-screen bg-tg-bg text-tg-text">
        <main className="flex-1 pb-20 overflow-y-auto">
          <motion.div
            key="create-market"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
          >
            <CreateMarketPage
              onBack={() => setShowCreateMarket(false)}
              onCreated={() => {
                setShowCreateMarket(false);
                setActiveTab('markets');
              }}
            />
          </motion.div>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  // When a market detail is open, show it instead of the tab page
  if (selectedMarket) {
    return (
      <div className="flex flex-col min-h-screen bg-tg-bg text-tg-text">
        <main className="flex-1 pb-20 overflow-y-auto">
          <motion.div
            key={`market-${selectedMarket.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
          >
            <MarketDetailPage
              market={selectedMarket}
              onBack={() => setSelectedMarket(null)}
            />
          </motion.div>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-tg-bg text-tg-text">
      <main className="flex-1 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
          >
            {activeTab === 'home' && <HomePage onNavigate={setActiveTab} onSelectMarket={setSelectedMarket} onCreateMarket={() => setShowCreateMarket(true)} />}
            {activeTab === 'markets' && <MarketsPage onSelectMarket={setSelectedMarket} onCreateMarket={() => setShowCreateMarket(true)} />}
            {activeTab === 'stake' && <StakePage />}
            {activeTab === 'profile' && <ProfilePage onOpenAdmin={() => setShowAdmin(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
