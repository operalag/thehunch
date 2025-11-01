import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Technology', path: '/technology' },
    { name: 'Tokenomics', path: '/tokenomics' },
    { name: 'Community', path: '/community' },
    { name: 'Docs', path: 'https://github.com', external: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col">
            <span className="text-2xl font-extrabold text-primary">HUNCH</span>
            <span className="text-xs text-muted-foreground">Oracle Infrastructure for TON</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white shadow-lg">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Call
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
        <div className="md:hidden bg-white border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            <Button variant="outline" className="border-primary text-primary w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Join Discord
            </Button>
            <Button className="bg-primary hover:bg-primary-dark text-white w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Call
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
