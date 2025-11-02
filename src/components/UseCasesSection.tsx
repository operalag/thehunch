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
    <section className="py-32 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
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
          <h2 className="text-white mb-6">Built for the next generation of dApps</h2>
          <p className="text-xl text-[hsl(var(--soft-gray))]">
            HUNCH enables applications that weren't possible before.
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
                className="glass-light rounded-2xl p-10 border border-white/5 hover:border-[hsl(var(--electric-cyan))]/30 hover:-translate-y-1 transition-all duration-300"
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
