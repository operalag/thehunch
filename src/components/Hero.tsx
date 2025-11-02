import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import heroVisual from '@/assets/hero-visual.png';
import { useTelegram } from '@/hooks/useTelegram';

const Hero = ({ onJoinWaitlist }: { onJoinWaitlist: () => void }) => {
  const { user, isFromTelegram } = useTelegram();
  
  const getGreeting = () => {
    if (isFromTelegram && user) {
      const name = user.username || user.first_name;
      return `Welcome, @${name}!`;
    }
    return 'Truth, delivered.';
  };

  const handleJoinClick = () => {
    window.open('https://t.me/hunch_oracle', '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with hero visual */}
      <div className="absolute inset-0 bg-[hsl(var(--deep-navy))]" />
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroVisual})`,
          backgroundBlendMode: 'lighten',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--deep-navy))]/60 to-[hsl(var(--deep-navy))]" />
      
      <div className="relative z-10 container-custom text-center py-32">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="text-gradient mb-6">
          {getGreeting()}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="text-xl text-[hsl(var(--soft-gray))] max-w-2xl mx-auto mb-12">
          The oracle network bringing verifiable real-world data to TON.<br /><span className="text-foreground">Coming soon.</span>
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 }}>
          <Button onClick={handleJoinClick} size="lg" className="gradient-primary text-white rounded-xl px-10 py-6">Join the Community</Button>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2"><ChevronDown className="h-6 w-6 animate-bounce" /></div>
    </section>
  );
};

export default Hero;
