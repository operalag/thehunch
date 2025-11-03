import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import WhyTONSection from '@/components/WhyTONSection';
import UseCasesSection from '@/components/UseCasesSection';
import StealthModeSection from '@/components/StealthModeSection';
import CommunitySection from '@/components/CommunitySection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <AboutSection />
      <HowItWorksSection />
      <WhyTONSection />
      <UseCasesSection />
      <StealthModeSection />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Index;
