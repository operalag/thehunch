import { Users, Award, Link, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  {
    icon: Users,
    number: '2,000+',
    label: 'Community Members',
  },
  {
    icon: Award,
    number: '$25K',
    label: 'TON Foundation Grant (Under Review)',
  },
  {
    icon: Link,
    number: '3',
    label: 'Integration Partners Committed',
  },
  {
    icon: Rocket,
    number: 'Q4 2025',
    label: 'Mainnet Launch Target',
  },
];

const StatsBar = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
