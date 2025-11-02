import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import WhyTONSection from '@/components/WhyTONSection';
import UseCasesSection from '@/components/UseCasesSection';
import StealthModeSection from '@/components/StealthModeSection';
import CommunitySection from '@/components/CommunitySection';

import Footer from '@/components/Footer';
import WaitlistModal from '@/components/WaitlistModal';

const Index = () => {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation onJoinWaitlist={() => setWaitlistOpen(true)} />
      <Hero onJoinWaitlist={() => setWaitlistOpen(true)} />
      <AboutSection />
      <HowItWorksSection />
      <WhyTONSection />
      <UseCasesSection />
      <StealthModeSection />
      <CommunitySection />
      <Footer onJoinWaitlist={() => setWaitlistOpen(true)} />
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
};

export default Index;
