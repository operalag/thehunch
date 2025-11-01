import Header from '@/components/Header';
import InvestorBanner from '@/components/InvestorBanner';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import Footer from '@/components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <InvestorBanner />
      <Hero />
      <StatsBar />
      <ProblemSection />
      <SolutionSection />
      <Footer />
    </div>
  );
};

export default Home;
