import { motion } from 'framer-motion';
import { Shield, Network, Zap } from 'lucide-react';
import kangarooNetwork from '@/assets/kangaroo-network.png';

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
    <section id="about" className="py-32 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-white mb-6">What is HUNCH?</h2>
          <p className="text-lg md:text-xl text-[hsl(var(--soft-gray))] max-w-4xl mx-auto leading-relaxed">
            Blockchains are isolated by design. They can't access real-world data—prices, weather, sports scores, or any information living off-chain. That's where oracles come in.
            <br /><br />
            HUNCH is building the most reliable oracle network on TON, connecting smart contracts to the data they need to power the next generation of decentralized applications.
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
