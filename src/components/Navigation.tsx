import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import logo from '@/assets/hunch-icon.png';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About', href: '#about', type: 'scroll' },
    { name: 'Network', href: '#how-it-works', type: 'scroll' },
    { name: 'Community', href: '#community', type: 'scroll' },
    { name: 'Membership', href: '/membership', type: 'link' },
    { name: 'Whitepaper', href: '/whitepaper', type: 'link' },
    { name: 'FAQ', href: '/faq', type: 'link' },
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
          {/* Logo removed */}
          <div className="flex items-center" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.type === 'link' ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button 
              onClick={() => window.open('https://t.me/hunch_oracle', '_blank')}
              className="gradient-primary text-white rounded-lg px-8 hover:scale-105 hover:glow-cyan transition-all"
            >
              Join TG Channel
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
              link.type === 'link' ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className="text-sm font-medium text-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors"
                >
                  {link.name}
                </a>
              )
            ))}
            <Button 
              onClick={() => { setMobileMenuOpen(false); window.open('https://t.me/hunch_oracle', '_blank'); }}
              className="gradient-primary text-white rounded-lg w-full"
            >
              Join TG Channel
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
