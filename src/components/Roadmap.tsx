import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const phases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    status: 'complete',
    items: [
      'Core smart contracts development',
      'Bond escalation mechanism',
      'Basic oracle resolution flow',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Testing & Optimization',
    status: 'complete',
    items: [
      'Testnet deployment on TON',
      'Security audits',
      'Gas optimization',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Token Launch',
    status: 'complete',
    items: [
      '$HNCH token deployment',
      'Staking contracts',
      'Revenue distribution system',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Telegram Integration',
    status: 'current',
    items: [
      'Telegram Mini App development',
      'TON Connect wallet integration',
      'User-friendly interface',
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Mainnet & Growth',
    status: 'upcoming',
    items: [
      'Mainnet launch',
      'Partner integrations',
      'Community governance activation',
    ],
  },
];

const Roadmap = () => {
  return (
    <section id="roadmap" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Roadmap</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Currently 80% complete with testnet live
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary hidden md:block" />

          <div className="space-y-8">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-6">
                  {/* Status Icon */}
                  <div className="relative z-10 hidden md:block">
                    {phase.status === 'complete' && (
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-glow">
                        <CheckCircle size={32} />
                      </div>
                    )}
                    {phase.status === 'current' && (
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center animate-pulse-glow">
                        <Clock size={32} />
                      </div>
                    )}
                    {phase.status === 'upcoming' && (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Circle size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass p-6 rounded-xl hover:shadow-glow transition-smooth">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-accent font-mono mb-1">{phase.phase}</div>
                        <h3 className="text-2xl font-bold">{phase.title}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'complete' ? 'bg-primary/20 text-primary' :
                        phase.status === 'current' ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {phase.status === 'complete' ? 'Complete' :
                         phase.status === 'current' ? 'In Progress' :
                         'Upcoming'}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle 
                            size={16} 
                            className={`mt-1 flex-shrink-0 ${
                              phase.status === 'complete' ? 'text-primary' :
                              phase.status === 'current' ? 'text-accent' :
                              'text-muted-foreground'
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
