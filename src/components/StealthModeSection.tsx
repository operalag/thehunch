import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CheckCircle2 } from 'lucide-react';

const StealthModeSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleJoinClick = () => {
    window.open('https://t.me/hunch_oracle', '_blank');
  };

  const checklist = [
    'Core protocol architecture',
    'Cryptoeconomic security model',
    'Data provider recruitment',
    'Testnet launch preparation',
    'Integration partnerships',
  ];

  return (
    <section id="waitlist" className="py-36 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom max-w-4xl relative z-10">
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
            HUNCH is being built by a team of cryptoeconomics researchers, distributed systems engineers, and Web3 veterans. We're moving fast and will share more soon.
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
            <Button
              onClick={handleJoinClick}
              className="gradient-primary text-white rounded-lg px-10 py-4 hover:glow-cyan transition-all text-lg"
            >
              Join the Community
            </Button>
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
