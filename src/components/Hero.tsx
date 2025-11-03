import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import heroVisual from '@/assets/hero-visual.png';
import { useTelegram } from '@/hooks/useTelegram';

const Hero = () => {
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
      {/* Consistent dark background */}
      <div className="absolute inset-0 bg-[hsl(var(--deep-navy))]" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      
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
