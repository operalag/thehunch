import { MessageCircle, Twitter, Github, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center font-bold text-xl">
                H
              </div>
              <span className="font-bold text-xl">Hunch Oracle</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fast, secure decentralized oracle on TON blockchain
            </p>
            <div className="flex gap-3">
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => window.open('https://t.me/hunchoracle', '_blank')}
              >
                <MessageCircle size={20} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => window.open('https://twitter.com/hunchoracle', '_blank')}
              >
                <Twitter size={20} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => window.open('https://github.com/hunchoracle', '_blank')}
              >
                <Github size={20} />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Calculators
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('token')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Token
                </button>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-bold mb-4">Developers</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  SDK
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates on Hunch Oracle
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="your@email.com"
                className="bg-background/50"
              />
              <Button className="gradient-primary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Hunch Oracle. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
