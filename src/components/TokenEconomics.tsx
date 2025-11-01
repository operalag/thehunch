import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const revenueData = [
  { name: 'RewardPool (40%)', value: 40, color: 'hsl(200, 100%, 40%)' },
  { name: 'Stakers (30%)', value: 30, color: 'hsl(180, 100%, 50%)' },
  { name: 'Token Buyback (20%)', value: 20, color: 'hsl(200, 100%, 60%)' },
  { name: 'Team (10%)', value: 10, color: 'hsl(220, 20%, 40%)' },
];

const stats = [
  { label: 'Total Supply', value: '100M', subtext: '$HNCH tokens' },
  { label: 'Staking Requirement', value: '10,000', subtext: '$HNCH to participate' },
  { label: 'Annual Burn Rate', value: '1.42%', subtext: 'Deflationary model' },
  { label: 'Real Yield APY', value: '14-42%', subtext: 'Paid in TON' },
];

const TokenEconomics = () => {
  return (
    <section id="token" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Token Economics</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sustainable revenue sharing and real yield for $HNCH holders
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16">
          {/* Revenue Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-xl"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground text-center mt-6">
              Service fees automatically distributed on-chain
            </p>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="gradient-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-3xl font-bold font-mono text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h4 className="font-bold mb-2">Staking Rewards</h4>
            <p className="text-sm text-muted-foreground">
              30% of all service fees distributed to $HNCH stakers
            </p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">🔥</div>
            <h4 className="font-bold mb-2">Token Buyback</h4>
            <p className="text-sm text-muted-foreground">
              20% used for $HNCH buyback and burn, reducing supply
            </p>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-4xl mb-3">💎</div>
            <h4 className="font-bold mb-2">Governance Rights</h4>
            <p className="text-sm text-muted-foreground">
              Vote on protocol parameters and treasury allocation
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TokenEconomics;
