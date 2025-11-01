import { motion } from 'framer-motion';
import { Zap, Shield, DollarSign, Users, Lock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: '3-6 hour resolution vs 48+ hours for competitors. Get answers when you need them.',
    stat: '8x faster',
  },
  {
    icon: Shield,
    title: 'Escalating Security',
    description: 'Bonds increase exponentially (2,000 → 4,000 → 8,000 → 16,000 TON) to secure markets.',
    stat: '$248K protection',
  },
  {
    icon: DollarSign,
    title: 'Lower Costs',
    description: 'Just 194 TON service fee (~$388) to request resolution. No hidden charges.',
    stat: '50% cheaper',
  },
  {
    icon: Users,
    title: 'Anti-Griefing',
    description: 'Require 10,000 $HNCH stake to participate. Serious oracles only.',
    stat: '99.9% uptime',
  },
  {
    icon: Lock,
    title: 'Transparent',
    description: 'All bonds, penalties, and rewards tracked on-chain. Full auditability.',
    stat: '100% on-chain',
  },
  {
    icon: TrendingUp,
    title: 'Sustainable Revenue',
    description: 'Service fees auto-distributed: RewardPool, stakers, buybacks, and team.',
    stat: '1.42% burn rate',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Hunch Oracle?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for speed, security, and sustainability on the TON blockchain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="gradient-card p-6 rounded-xl hover:shadow-glow transition-smooth group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-full">
                  {feature.stat}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
