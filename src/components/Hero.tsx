import { motion } from 'framer-motion';
import { Calendar, FileText, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="absolute inset-0 opacity-30">
          {/* Network nodes */}
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-purple-400/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 left-1/4 w-36 h-36 rounded-full bg-primary/20 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-purple-400/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Main Headline */}
          <h1 className="gradient-text mb-6 animate-fade-up">
            The First Optimistic Oracle
            <br />
            for TON Blockchain
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Real-time data feeds for 900M Telegram users. Fast oracle resolution with economic finality. 
            Built for prediction markets, DeFi, gaming, and real-world applications.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Investor Call
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-10 py-6 text-lg transition-all"
            >
              <FileText className="mr-2 h-5 w-5" />
              Read Technical Docs
            </Button>
          </motion.div>

          {/* Tertiary CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-muted-foreground"
          >
            <a href="#community" className="hover:text-primary transition-colors underline">
              Join 2,000+ community members on Discord →
            </a>
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-sm text-muted-foreground mb-2">Scroll to explore</span>
        <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
      </motion.div>
    </section>
  );
};

export default Hero;
