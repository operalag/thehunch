import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import platinumPattern from '@/assets/platinum-pattern.gif';

const Membership = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--deep-navy))]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="text-xl font-bold text-gradient">
              HUNCH
            </Link>
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-[hsl(var(--electric-cyan))]">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src={platinumPattern} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-[hsl(var(--electric-cyan))]/30 mb-8">
              <Sparkles className="w-4 h-4 text-[hsl(var(--electric-cyan))]" />
              <span className="text-sm font-medium text-[hsl(var(--electric-cyan))]">Exclusive Early Access</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
              Founding Members
            </h1>
            
            <p className="text-xl md:text-2xl text-[hsl(var(--soft-gray))] mb-12 leading-relaxed">
              Join HUNCH as an early adopter and secure your place in the future of decentralized oracles on TON
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* NFT Card */}
            <div className="glass-light rounded-2xl p-8 md:p-12 border border-white/10 mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Early Access NFT
                  </h2>
                  <p className="text-[hsl(var(--soft-gray))] text-lg mb-6">
                    Secure your position in the HUNCH ecosystem by acquiring one of our limited founding member NFTs on GetGems.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--electric-cyan))]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Users className="w-4 h-4 text-[hsl(var(--electric-cyan))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Only 100 NFTs Available</h3>
                        <p className="text-sm text-[hsl(var(--soft-gray))]">
                          Limited supply ensures exclusivity for early believers
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--electric-cyan))]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Calendar className="w-4 h-4 text-[hsl(var(--electric-cyan))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Snapshot: December 1st, 2025</h3>
                        <p className="text-sm text-[hsl(var(--soft-gray))]">
                          Make sure you own your NFT on this date to qualify
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--electric-cyan))]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--electric-cyan))]" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Early Access to $HNCH Tokens</h3>
                        <p className="text-sm text-[hsl(var(--soft-gray))]">
                          NFT holders get priority access to the HUNCH ecosystem
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href="https://getgems.io/collection/EQDirS1vK_KX28S-ugepwRJqwJJN77liPvZe3rtgkcrLW-KH"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gradient-primary text-white rounded-lg px-8 hover:scale-105 hover:glow-cyan transition-all w-full md:w-auto">
                      View Collection on GetGems
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
                
                <div className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-[hsl(var(--electric-cyan))]/30 glow-cyan">
                    <img 
                      src={platinumPattern} 
                      alt="HUNCH Founding Member NFT"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="glass-light rounded-2xl p-8 md:p-12 border border-white/10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Founding Member Benefits
              </h2>
              <ul className="space-y-4 text-[hsl(var(--soft-gray))]">
                <li className="flex items-start gap-3">
                  <span className="text-[hsl(var(--electric-cyan))] font-bold">•</span>
                  <span>Priority allocation of $HNCH tokens at launch</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[hsl(var(--electric-cyan))] font-bold">•</span>
                  <span>Early access to HUNCH oracle network features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[hsl(var(--electric-cyan))] font-bold">•</span>
                  <span>Exclusive community access and governance rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[hsl(var(--electric-cyan))] font-bold">•</span>
                  <span>Founding member recognition in the HUNCH ecosystem</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container-custom text-center">
          <p className="text-[hsl(var(--soft-gray))]">
            Questions? Join our{' '}
            <a 
              href="https://t.me/hunch_oracle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[hsl(var(--electric-cyan))] hover:underline"
            >
              Telegram community
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Membership;
