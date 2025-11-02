import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import logo from '@/assets/hunch-logo.png';

interface NavigationProps {
  onJoinWaitlist: () => void;
}

const Navigation = ({ onJoinWaitlist }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Network', href: '#how-it-works' },
    { name: 'Why TON', href: '#why-ton' },
    { name: 'Community', href: '#community' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center">
            <img src={logo} alt="hunch" className="h-10 md:h-12" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              onClick={onJoinWaitlist}
              className="gradient-primary text-white rounded-lg px-8 hover:scale-105 hover:glow-cyan transition-all"
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-light border-t border-white/5">
          <nav className="container-custom py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button 
              onClick={() => { setMobileMenuOpen(false); onJoinWaitlist(); }}
              className="gradient-primary text-white rounded-lg w-full"
            >
              Join Waitlist
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
