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
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

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
            <div className="glass-light rounded-2xl p-10 border border-white/5 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-[hsl(var(--electric-cyan))] font-bold text-2xl">TON Blockchain</p>
                <p className="text-[hsl(var(--soft-gray))] mt-2">Infinite Sharding</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyTONSection;
