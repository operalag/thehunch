import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const Technology = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="gradient-text mb-6">Technical Architecture</h1>
            <p className="text-xl text-muted-foreground">
              Optimistic Oracle System for TON Blockchain
            </p>
            <p className="text-muted-foreground mt-4">
              Deep dive into the contracts, game theory, and economic security model powering Hunch Protocol
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">Smart Contract Architecture</h2>
            <div className="bg-white border border-border rounded-xl p-8">
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">OracleFactory</h3>
                  <p className="text-muted-foreground">Creates oracle requests, distributes revenue</p>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">OracleRequest</h3>
                  <p className="text-muted-foreground">Manages resolution game, handles bonds</p>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">RewardPool</h3>
                  <p className="text-muted-foreground">Pays winning proposers</p>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">GovernancePool</h3>
                  <p className="text-muted-foreground">Collects losing bonds, redistributes</p>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">StakingRewards</h3>
                  <p className="text-muted-foreground">Distributes revenue to stakers</p>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">BuybackContract</h3>
                  <p className="text-muted-foreground">Weekly $HNCH buyback & burn</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8">Integration Guide</h2>
            <p className="text-xl text-muted-foreground mb-6">Integrate Hunch Oracle in 10 Minutes</p>
            
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-3">Step 1: Install SDK</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <code>npm install @hunch/oracle-sdk</code>
                </pre>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-3">Step 2: Initialize Client</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`import { HunchOracle } from '@hunch/oracle-sdk';

const oracle = new HunchOracle({
  network: 'mainnet',
  apiKey: process.env.HUNCH_API_KEY
});`}
                </pre>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold mb-3">Step 3: Create Request</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`const request = await oracle.createRequest({
  question: "Did ETH price close above $3000 on Nov 1, 2025?",
  callback: myContract.address,
  bond: 500,
  serviceFee: 194
});`}
                </pre>
              </div>

              <div className="text-center mt-8">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Full Documentation
                </a>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Technology;
