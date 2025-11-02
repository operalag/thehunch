import { motion } from 'framer-motion';
import { FileQuestion, Search, BarChart3, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: FileQuestion,
      title: 'Request',
      description: 'A smart contract on TON needs external data—a price feed, event outcome, or API response.',
    },
    {
      number: 2,
      icon: Search,
      title: 'Query',
      description: 'HUNCH routes the request to multiple independent data providers staking collateral.',
    },
    {
      number: 3,
      icon: BarChart3,
      title: 'Aggregate',
      description: 'Responses are collected, validated, and aggregated using cryptoeconomic guarantees.',
    },
    {
      number: 4,
      icon: CheckCircle,
      title: 'Deliver',
      description: 'The verified result is delivered on-chain, fast and secure. Wrong data? Providers get slashed.',
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-gradient-to-b from-[hsl(var(--deep-navy))] to-[hsl(var(--slate-gray))]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white mb-6">How HUNCH works</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-[hsl(var(--electric-cyan))]/30 -translate-x-1/2 z-0" />
                )}

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-[hsl(var(--electric-cyan))] flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-[hsl(var(--deep-navy))]">{step.number}</span>
                  </div>

                  <h4 className="text-white text-center mb-4">{step.title}</h4>
                  <p className="text-[hsl(var(--soft-gray))] text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-[hsl(var(--soft-gray))]">
            Want the technical details? They're coming soon.{' '}
            <a href="#waitlist" className="text-[hsl(var(--electric-cyan))] underline hover:text-[hsl(var(--electric-cyan))]/80">
              Join the waitlist
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
