import { useBlockchainStore } from '@/store/blockchainStore';
import { Card } from '@/components/ui/card';
import { ArrowRight, Wallet, Landmark, Coins, Gift } from 'lucide-react';

const TokenFlow = () => {
  const { user, protocolRevenue, totalStakedGlobal } = useBlockchainStore();

  const FlowCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="glass border-white/10 p-4 flex flex-col items-center justify-center text-center min-w-[140px] relative z-10">
      <div className={`p-3 rounded-full bg-opacity-20 mb-2 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div className="text-xs text-muted-foreground mb-1">{title}</div>
      <div className="font-bold text-sm md:text-base break-all">{value}</div>
    </Card>
  );

  const Arrow = ({ label }: { label?: string }) => (
    <div className="flex flex-col items-center justify-center mx-2 text-muted-foreground/50">
      {label && <span className="text-[10px] mb-1 uppercase tracking-wider">{label}</span>}
      <ArrowRight className="w-5 h-5 animate-pulse" />
    </div>
  );

  return (
    <div className="w-full mb-8 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Token Economy & Flow</h3>
      <div className="flex items-center justify-between min-w-[600px] p-4 rounded-xl bg-white/5 border border-white/5">
        
        {/* Wallet */}
        <FlowCard 
          title="Your Wallet" 
          value={`${user.hnchBalance.toLocaleString()} HNCH`}
          icon={Wallet} 
          colorClass="text-primary"
        />

        <div className="flex flex-col gap-8">
          {/* Top Path: Staking */}
          <div className="flex items-center">
            <Arrow label="Stake" />
            <FlowCard 
              title="Global Staking Pool" 
              value={`${totalStakedGlobal.toLocaleString()} HNCH`}
              icon={Landmark} 
              colorClass="text-accent"
            />
          </div>

          {/* Bottom Path: Fees */}
          <div className="flex items-center">
            <Arrow label="Fees" />
            <FlowCard 
              title="Protocol Revenue" 
              value={`${protocolRevenue.toLocaleString()} HNCH`}
              icon={Coins} 
              colorClass="text-warning" // Warning usually yellow/orange
            />
            <Arrow label="Distribution" />
            <FlowCard 
              title="Your Rewards" 
              value={`${user.pendingRewards.toLocaleString()} HNCH`}
              icon={Gift} 
              colorClass="text-success-green"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TokenFlow;
