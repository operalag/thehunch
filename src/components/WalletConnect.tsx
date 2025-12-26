import { useEffect } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useBlockchainStore } from '@/store/blockchainStore';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

export const WalletConnect = () => {
  const wallet = useTonWallet();
  const { connectWallet, disconnectWallet, setAddress, user, isLoading } = useBlockchainStore();

  // Sync real TON Connect state with our App Store
  useEffect(() => {
    if (wallet?.account?.address) {
      setAddress(wallet.account.address);
    } else if (!wallet && user.address && !user.address.startsWith('EQC...Demo')) {
      // Only disconnect if it wasn't a "Demo Mode" login
      disconnectWallet();
    }
  }, [wallet, user.address, setAddress, disconnectWallet]);

  return (
    <div className="flex items-center gap-4">
      {/* The Real TON Connect Button */}
      <TonConnectButton />

      {/* Demo Mode Fallback (if not connected real wallet) */}
      {!wallet && !user.address && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={connectWallet}
          disabled={isLoading}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isLoading ? 'Connecting...' : 'Demo Mode'}
        </Button>
      )}
    </div>
  );
};
