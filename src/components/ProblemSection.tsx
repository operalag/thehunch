import { motion } from 'framer-motion';
import { Send, Link2Off, Clock } from 'lucide-react';

const problems = [
  {
    icon: Send,
    title: '900M Users, Zero Oracle Infrastructure',
    description:
      'TON has the largest potential user base of any blockchain through Telegram integration, but lacks the oracle infrastructure to bring real-world data on-chain. DeFi, prediction markets, and gaming all depend on external data feeds.',
  },
  {
    icon: Link2Off,
    title: 'Centralized Solutions Create Trust Bottlenecks',
    description:
      'Traditional oracle solutions require trusting a single operator or closed committee. This defeats the purpose of decentralized applications and creates single points of failure. TON needs trustless, economically secured oracles.',
  },
  {
    icon: Clock,
    title: 'Slow Resolution Kills User Experience',
    description:
      'Existing optimistic oracles (UMA) take 2-7 days to resolve. TON users expect Telegram-speed performance. Markets need resolution in hours, not days, to enable capital-efficient applications.',
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-wide text-primary font-semibold mb-4">THE OPPORTUNITY</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why TON Needs Decentralized Oracle Infrastructure
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300"
            >
              <problem.icon className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
