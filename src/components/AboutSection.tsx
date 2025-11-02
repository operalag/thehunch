import { motion } from 'framer-motion';
import { Shield, Network, Zap } from 'lucide-react';

const AboutSection = () => {
  const pillars = [
    {
      icon: Shield,
      color: 'hsl(var(--oracle-purple))',
      title: 'Cryptoeconomic Security',
      description: 'Data providers stake value to earn rewards. Incorrect data means slashing. The math is simple: honesty pays better than manipulation.',
    },
    {
      icon: Network,
      color: 'hsl(var(--electric-cyan))',
      title: 'Decentralized by Design',
      description: 'No single point of failure. Multiple independent data sources aggregate responses, ensuring resilience and censorship resistance.',
    },
    {
      icon: Zap,
      color: 'hsl(var(--electric-cyan))',
      title: 'Built for TON',
      description: "Native integration with TON's ultra-fast architecture. Low latency, low cost, high throughput—ready for DeFi, gaming, and beyond.",
    },
  ];

  return (
    <section id="about" className="py-32 bg-[hsl(var(--deep-navy))]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-white mb-6">What is hunch?</h2>
          <p className="text-lg md:text-xl text-[hsl(var(--soft-gray))] max-w-4xl mx-auto leading-relaxed">
            Blockchains are isolated by design. They can't access real-world data—prices, weather, sports scores, or any information living off-chain. That's where oracles come in.
            <br /><br />
            hunch is building the most reliable oracle network on TON, connecting smart contracts to the data they need to power the next generation of decentralized applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-light rounded-2xl p-12 border border-white/5 hover:border-[hsl(var(--electric-cyan))]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <Icon className="h-16 w-16 mb-6" style={{ color: pillar.color }} />
                <h4 className="text-white mb-4">{pillar.title}</h4>
                <p className="text-[hsl(var(--soft-gray))] leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
