import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const tokenDistribution = [
  { name: 'Team (4yr vest)', value: 25, color: '#8B5CF6' },
  { name: 'Community & Ecosystem', value: 35, color: '#0098EA' },
  { name: 'Liquidity Mining', value: 15, color: '#F59E0B' },
  { name: 'Treasury', value: 15, color: '#10B981' },
  { name: 'Strategic Investors', value: 5, color: '#EF4444' },
  { name: 'Security Reserve', value: 5, color: '#64748B' },
];

const Tokenomics = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="gradient-text mb-6">$HNCH Tokenomics</h1>
            <p className="text-xl text-muted-foreground">
              Real Yield • Real Utility • Real Value
            </p>
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
              Revenue-sharing token with oracle participation rights and governance power. 
              100% of staker rewards come from protocol revenue, not inflation.
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Token Distribution</h2>
            <div className="bg-white border border-border rounded-xl p-8">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Staking Rewards</h2>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Time-Lock Multiplier Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4">Lock Period</th>
                      <th className="text-center py-3 px-4">Multiplier</th>
                      <th className="text-right py-3 px-4">Early Unstake Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { period: 'No lock', multiplier: '1.0x', penalty: 'None' },
                      { period: '3 months', multiplier: '1.5x', penalty: '50% of rewards' },
                      { period: '6 months', multiplier: '2.0x', penalty: '50% of rewards' },
                      { period: '12 months', multiplier: '2.5x', penalty: '50% of rewards' },
                      { period: '24 months', multiplier: '3.0x', penalty: '50% of rewards' },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4">{row.period}</td>
                        <td className="text-center py-3 px-4 font-bold text-primary">{row.multiplier}</td>
                        <td className="text-right py-3 px-4">{row.penalty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000</div>
                <div className="text-sm text-muted-foreground">Minimum $HNCH stake for oracle participation</div>
              </div>
              <div className="bg-white border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">12%</div>
                <div className="text-sm text-muted-foreground">Reward on winning oracle proposals</div>
              </div>
              <div className="bg-white border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">14-42%</div>
                <div className="text-sm text-muted-foreground">Estimated APY range (based on lock period)</div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tokenomics;
