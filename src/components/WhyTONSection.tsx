import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import gridPattern from '@/assets/grid-pattern.png';

const WhyTONSection = () => {
  const reasons = [
    {
      title: 'Infinite Sharding',
      description: "TON's sharding architecture means HUNCH can scale horizontally as demand grows—no bottlenecks.",
    },
    {
      title: 'Sub-second Finality',
      description: 'Fast blocks mean fast data delivery. DeFi applications need real-time prices, and TON delivers.',
    },
    {
      title: 'Low Fees',
      description: "Fetching oracle data shouldn't cost more than the transaction itself. TON's efficiency keeps costs minimal.",
    },
    {
      title: 'Growing Ecosystem',
      description: "From Telegram's 900M users to a thriving DeFi landscape, TON is where the next wave of users will arrive.",
    },
  ];

  return (
    <section id="why-ton" className="py-32 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
      {/* Hexagonal Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
              <polygon points="28,0 56,17 56,51 28,68 0,51 0,17" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <h2 className="text-white mb-8">Why TON?</h2>
            <p className="text-lg text-[hsl(var(--soft-gray))] mb-12 max-w-2xl leading-relaxed">
              TON isn't just fast—it's architecturally different. We're building on TON because oracle networks need the same qualities that make TON special.
            </p>

            <div className="space-y-10">
              {reasons.map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <Check className="h-8 w-8 text-[hsl(var(--success-green))] flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="text-white text-xl font-semibold mb-2">{reason.title}</h5>
                    <p className="text-[hsl(var(--soft-gray))] leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="glass-light rounded-2xl overflow-hidden relative h-96">
              <img 
                src={gridPattern} 
                alt="Network visualization" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--deep-navy))] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyTONSection;
