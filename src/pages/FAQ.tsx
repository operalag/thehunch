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
      <section className="relative pt-32 pb-20 overflow-hidden bg-[hsl(var(--deep-navy))]">
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
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
