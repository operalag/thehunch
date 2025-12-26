import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import logo from '@/assets/hunch-icon.png';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAppPage = location.pathname.startsWith('/app');

  const navLinks = [
    { name: 'Whitepaper', href: '/whitepaper', type: 'link' },
    { name: 'FAQ', href: '/faq', type: 'link' },
  ];

  if (!isAppPage) {
    navLinks.unshift(
      { name: 'Network', href: '#how-it-works', type: 'scroll' },
      { name: 'Community', href: '#community', type: 'scroll' }
    );
  } else {
    navLinks.unshift(
      { name: 'Dashboard', href: '/app', type: 'link' },
      { name: 'Create', href: '/app/create', type: 'link' },
      { name: 'Staking', href: '/app/staking', type: 'link' }
    );
  }

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
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Hunch" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-gradient">HUNCH</span>
          </Link>

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
          <div className="hidden md:flex items-center gap-4">
            {!isAppPage ? (
              <Link to="/app">
                <button className="gradient-primary text-white rounded-lg px-6 py-2 text-sm font-semibold hover:scale-105 hover:glow-cyan transition-all">
                  Launch App
                </button>
              </Link>
            ) : (
              <WalletConnect />
            )}
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
            <div className="pt-4 border-t border-white/5">
              {!isAppPage ? (
                <Link to="/app" onClick={() => setMobileMenuOpen(false)}>
                  <button className="gradient-primary text-white rounded-lg w-full py-3 font-semibold">
                    Launch App
                  </button>
                </Link>
              ) : (
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;