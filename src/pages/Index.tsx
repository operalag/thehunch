import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Calculators from '@/components/Calculators';
import TokenEconomics from '@/components/TokenEconomics';
import Developers from '@/components/Developers';
import Roadmap from '@/components/Roadmap';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Calculators />
      <TokenEconomics />
      <Developers />
      <Roadmap />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
