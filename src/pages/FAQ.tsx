import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import WaitlistModal from '@/components/WaitlistModal';
import { useState } from 'react';
import topoPattern from '@/assets/topo-pattern.png';

const FAQ = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation onJoinWaitlist={() => setWaitlistOpen(true)} />
      
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: `url(${topoPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[hsl(var(--deep-navy))]/80" />
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Frequently Asked</span>
              <br />
              <span className="text-white">Questions</span>
            </h1>
            <p className="text-xl text-[hsl(var(--soft-gray))] max-w-2xl mx-auto">
              Everything you need to know about hunch oracle network
            </p>
          </motion.div>
        </div>
      </section>

      <FAQSection />
      <Footer onJoinWaitlist={() => setWaitlistOpen(true)} />
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
};

export default FAQ;
