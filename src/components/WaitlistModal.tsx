import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

const WaitlistModal = ({ open, onClose }: WaitlistModalProps) => {
  const [email, setEmail] = useState('');
  const [isProvider, setIsProvider] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement actual submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
      setIsProvider(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[hsl(var(--slate-gray))] border border-[hsl(var(--electric-cyan))]/30 max-w-lg glass text-white">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-white text-4xl font-bold mb-4">
                Get early access to hunch
              </DialogTitle>
              <p className="text-[hsl(var(--soft-gray))] text-base leading-relaxed">
                Join the waitlist to receive updates on testnet launch, token details, and opportunities to participate as a data provider.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(var(--soft-gray))] text-sm">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[hsl(var(--deep-navy))] border-white/15 text-white placeholder:text-[hsl(var(--soft-gray))] focus-visible:border-[hsl(var(--electric-cyan))] h-12 rounded-lg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="provider"
                  checked={isProvider}
                  onCheckedChange={(checked) => setIsProvider(checked as boolean)}
                  className="border-white/15 data-[state=checked]:bg-[hsl(var(--electric-cyan))] data-[state=checked]:border-[hsl(var(--electric-cyan))]"
                />
                <label
                  htmlFor="provider"
                  className="text-[hsl(var(--soft-gray))] text-sm cursor-pointer"
                >
                  I'm interested in becoming a data provider
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-primary text-white rounded-xl py-6 text-lg hover:glow-cyan hover:scale-105 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-[hsl(var(--success-green))] mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-[hsl(var(--success-green))] mb-4">
              You're on the list!
            </h3>
            <p className="text-[hsl(var(--soft-gray))] text-lg">
              We'll email you updates as we get closer to launch.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
