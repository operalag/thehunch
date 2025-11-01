import { motion } from 'framer-motion';
import { AlertCircle, Target, Users, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: AlertCircle,
    title: 'Request',
    description: 'User requests event resolution by depositing 194 TON service fee',
    time: '0h',
  },
  {
    icon: Target,
    title: 'Propose',
    description: 'Oracle stakes 2,000 TON bond and proposes outcome within 3-6 hours',
    time: '3-6h',
  },
  {
    icon: Users,
    title: 'Challenge',
    description: 'Community can challenge with escalating bonds (2x, 4x, 8x) over 3 rounds',
    time: '+24h',
  },
  {
    icon: CheckCircle,
    title: 'Finalize',
    description: 'Correct outcome finalized. Winners earn 12% rewards, losers forfeit bonds',
    time: 'Final',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple 4-step process that ensures speed, security, and accuracy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent opacity-30 z-0" />
              )}

              <div className="glass p-6 rounded-xl hover:shadow-glow transition-smooth relative z-10 h-full">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 animate-pulse-glow">
                  <step.icon size={24} />
                </div>
                
                <div className="text-sm font-mono text-accent mb-2">{step.time}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="glass inline-block px-8 py-4 rounded-xl">
            <p className="text-lg">
              <span className="font-bold text-primary">vs UMA Oracle:</span>{' '}
              <span className="text-muted-foreground line-through">48+ hours</span>{' '}
              <span className="text-accent font-bold">→ 3-6 hours</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
