import { useState, useEffect } from 'react';
import { X, Rocket } from 'lucide-react';

const InvestorBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('investorBannerDismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('investorBannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-40 gradient-blue-purple text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm md:text-base">
          <Rocket className="h-5 w-5 animate-bounce" />
          <span className="font-semibold">
            Raising $40K Strategic Round • Closes in 2 Weeks •{' '}
            <a href="#contact" className="underline hover:opacity-80 transition-opacity">
              Schedule Due Diligence Call →
            </a>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 hover:opacity-80 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default InvestorBanner;
