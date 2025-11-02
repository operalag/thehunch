import { motion } from 'framer-motion';
import { TrendingUp, Target, Umbrella, Gamepad2, UserCheck, Cpu } from 'lucide-react';
import circuitVisual from '@/assets/circuit-visual.png';

const UseCasesSection = () => {
  const useCases = [
    {
      icon: TrendingUp,
      color: 'hsl(var(--electric-cyan))',
      title: 'Price Feeds for DeFi',
      description: 'Power lending protocols, DEXs, and derivatives with reliable, manipulation-resistant price data.',
    },
    {
      icon: Target,
      color: 'hsl(var(--oracle-purple))',
      title: 'Prediction Markets',
      description: 'Settle bets on sports, elections, or any real-world event with verifiable outcomes.',
    },
    {
      icon: Umbrella,
      color: 'hsl(var(--success-green))',
      title: 'Parametric Insurance',
      description: 'Automate payouts based on real-world triggers—weather events, flight delays, crop yields.',
    },
    {
      icon: Gamepad2,
      color: 'hsl(var(--electric-cyan))',
      title: 'On-chain Gaming',
      description: 'Bring randomness, real-world events, and dynamic content into blockchain games.',
    },
    {
      icon: UserCheck,
      color: 'hsl(var(--oracle-purple))',
      title: 'Identity & Reputation',
      description: 'Verify credentials, certifications, or off-chain achievements directly on-chain.',
    },
    {
      icon: Cpu,
      color: 'hsl(var(--success-green))',
      title: 'IoT & Supply Chain',
      description: 'Connect physical sensors to smart contracts for real-time supply chain and device data.',
    },
  ];

  return (
    <section 
      className="py-32 relative"
      style={{
        backgroundImage: `url(${circuitVisual})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="absolute inset-0 bg-[hsl(var(--slate-gray))]/90" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-white mb-6">Built for the next generation of dApps</h2>
          <p className="text-xl text-[hsl(var(--soft-gray))]">
            hunch enables applications that weren't possible before.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[hsl(var(--deep-navy))] to-[hsl(var(--slate-gray))] rounded-2xl p-10 border border-white/5 hover:border-[hsl(var(--oracle-purple))]/40 hover:scale-105 transition-all duration-300"
              >
                <Icon className="h-12 w-12 mb-6" style={{ color: useCase.color }} />
                <h5 className="text-white text-xl font-semibold mb-3">{useCase.title}</h5>
                <p className="text-[hsl(var(--soft-gray))] leading-relaxed">
                  {useCase.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
