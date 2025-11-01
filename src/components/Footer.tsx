import { Link } from 'react-router-dom';
import { Github, MessageCircle, Send, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold mb-2">HUNCH</h3>
            <p className="text-sm text-white/70 mb-4">Oracle Infrastructure for TON</p>
            <p className="text-xs text-white/50">© {currentYear} Hunch Protocol. All rights reserved.</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm uppercase font-semibold mb-4 text-white/70">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/technology" className="text-sm hover:text-primary transition-colors">Technology</Link></li>
              <li><Link to="/tokenomics" className="text-sm hover:text-primary transition-colors">Tokenomics</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#roadmap" className="text-sm hover:text-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm uppercase font-semibold mb-4 text-white/70">Community</h4>
            <ul className="space-y-2">
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Discord</a></li>
              <li><a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Telegram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Twitter/X</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm uppercase font-semibold mb-4 text-white/70">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/community" className="text-sm hover:text-primary transition-colors">About</Link></li>
              <li><a href="#" className="text-sm hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 pt-8 border-t border-white/10">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <Twitter className="h-6 w-6" />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <Send className="h-6 w-6" />
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <MessageCircle className="h-6 w-6" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
            <Github className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
