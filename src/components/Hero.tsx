import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Clock, Shield, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Zap size={16} className="text-accent" />
            <span className="text-sm font-medium">80% Complete • Testnet Live</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary-glow to-accent bg-clip-text text-transparent"
          >
            Resolve Events in Hours, Not Days
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          >
            The fastest decentralized oracle on TON. Secure markets up to $248K with escalating bonds. 
            Earn up to 42% APY staking $HNCH tokens.
          </motion.p>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto"
          >
            <div className="glass p-6 rounded-xl">
              <Clock className="w-8 h-8 text-primary mb-3 mx-auto" />
              <div className="text-3xl font-bold font-mono text-primary mb-1">3-6h</div>
              <div className="text-sm text-muted-foreground">Resolution Time</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <Shield className="w-8 h-8 text-accent mb-3 mx-auto" />
              <div className="text-3xl font-bold font-mono text-accent mb-1">$248K</div>
              <div className="text-sm text-muted-foreground">Market Security</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <Zap className="w-8 h-8 text-primary mb-3 mx-auto" />
              <div className="text-3xl font-bold font-mono text-primary mb-1">14-42%</div>
              <div className="text-sm text-muted-foreground">Staking APY</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg"
              onClick={() => window.open('https://t.me/hunchoracle', '_blank')}
              className="gradient-primary text-lg px-8 py-6 shadow-glow hover:scale-105 transition-smooth"
            >
              Launch on Telegram
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6 transition-smooth"
            >
              Learn How It Works
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-muted-foreground mt-8"
          >
            Trusted by prediction markets • Powered by TON blockchain
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
