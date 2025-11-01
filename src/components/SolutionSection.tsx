import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    color: 'text-green-500',
    title: 'Fast: 1-3 Hour Resolution',
    description:
      'Unlike UMA\'s 2-7 day challenge period, Hunch uses 1-hour rounds with escalating bonds. Markets resolve in hours, enabling capital-efficient applications and better UX.',
  },
  {
    icon: Shield,
    color: 'text-primary',
    title: 'Secure: Economic Finality',
    description:
      'Escalating bond mechanism (500 → 1000 → 2000 TON) makes manipulation prohibitively expensive. Attackers must risk exponentially more capital than they can gain, ensuring honest resolution.',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-500',
    title: 'Sustainable: Profitable from Day 1',
    description:
      '194 TON service fee per request covers all rewards and operational costs. Protocol breaks even at 32 requests/day and becomes highly profitable at 50+ daily requests (achievable with just 3-5 integrated apps).',
  },
];

const SolutionSection = () => {
  return (
    <section className="py-20 gradient-blue-purple">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-wide text-white/90 font-semibold mb-4">THE SOLUTION</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Optimistic Oracles for TON
          </h2>
          <p className="text-xl text-white/90">Fast • Secure • Profitable</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              'Client submits question + 500 TON bond',
              'Oracle participant proposes answer',
              'Challenger doubles bond (1000 TON) if they disagree',
              'Bonds escalate (2000 TON) until no challenges',
              'Winner gets bond back + 12% reward',
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-primary font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-6 py-4 flex-1">
                  <p className="text-white font-medium">{step}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-xl p-6"
              >
                <benefit.icon className={`h-10 w-10 ${benefit.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
