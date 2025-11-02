import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CheckCircle2 } from 'lucide-react';

const StealthModeSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const checklist = [
    'Core protocol architecture',
    'Cryptoeconomic security model',
    'Data provider recruitment',
    'Testnet launch preparation',
    'Integration partnerships',
  ];

  return (
    <section id="waitlist" className="py-36 bg-gradient-to-b from-[hsl(var(--deep-navy))] via-[hsl(var(--oracle-purple))]/10 to-[hsl(var(--deep-navy))]">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[hsl(var(--electric-cyan))] text-sm font-bold tracking-widest mb-5">
            LAUNCHING SOON
          </p>

          <h2 className="text-white mb-6">We're in stealth mode.</h2>

          <p className="text-lg text-[hsl(var(--soft-gray))] leading-relaxed mb-12">
            hunch is being built by a team of cryptoeconomics researchers, distributed systems engineers, and Web3 veterans. We're moving fast and will share more soon.
            <br /><br />
            For now, here's what we're working on:
          </p>

          <div className="text-left max-w-md mx-auto mb-16 space-y-5">
            {checklist.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <span className="text-[hsl(var(--electric-cyan))] text-xl">→</span>
                <span className="text-white text-lg">{item}</span>
              </motion.div>
            ))}
          </div>

          <h3 className="text-white text-3xl font-semibold mb-6">Want early access?</h3>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="glass-light rounded-xl p-2 border border-white/10 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent border-none text-white placeholder:text-[hsl(var(--soft-gray))] focus-visible:ring-0 text-base"
              />
              <Button
                type="submit"
                className="gradient-primary text-white rounded-lg px-8 py-3 hover:glow-cyan transition-all whitespace-nowrap"
              >
                Join Waitlist
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-[hsl(var(--success-green))] text-xl"
            >
              <CheckCircle2 className="h-6 w-6" />
              <span>You're on the list. We'll be in touch soon.</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default StealthModeSection;
