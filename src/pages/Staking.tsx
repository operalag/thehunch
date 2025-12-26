import { useState } from 'react';
import { useBlockchainStore } from '@/store/blockchainStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Trophy, Users, Vote, ArrowRight, Wallet } from 'lucide-react';

const Staking = () => {
  const { user, stake, unstake, claimRewards, delegate, faucet, isLoading } = useBlockchainStore();
  const [stakeAmount, setStakeAmount] = useState('');
  const [delegateAddress, setDelegateAddress] = useState('');

  const handleStake = () => {
    if (!stakeAmount) return;
    stake(Number(stakeAmount));
    setStakeAmount('');
  };

  const handleUnstake = () => {
    if (!stakeAmount) return;
    unstake(Number(stakeAmount));
    setStakeAmount('');
  };

  if (!user.address) {
    return (
      <div className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Connect Wallet to Earn Yield</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Connect your TON wallet to stake HNCH, earn 60% protocol revenue, and participate in governance.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[hsl(var(--deep-navy))]">
      <div className="container-custom max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Staking & Governance</h1>
            <p className="text-muted-foreground mt-2">Earn 60% of all oracle fees by securing the network.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={faucet} 
            disabled={isLoading}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Coins className="w-4 h-4 mr-2" />
            Mint Test HNCH (+50k)
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass-light border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{user.hnchBalance.toLocaleString()} HNCH</div>
            </CardContent>
          </Card>
          <Card className="glass-light border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Staked Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{user.stakedBalance.toLocaleString()} HNCH</div>
            </CardContent>
          </Card>
          <Card className="glass-light border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current APY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">164.3%</div>
              <p className="text-xs text-muted-foreground mt-1">Based on last 7 days</p>
            </CardContent>
          </Card>
          <Card className="glass-light border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unclaimed Rewards</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-end">
              <div className="text-2xl font-bold text-success-green">{user.pendingRewards} HNCH</div>
              <Button size="sm" onClick={claimRewards} disabled={user.pendingRewards === 0 || isLoading} className="h-8">
                Claim
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Staking Interface */}
          <div className="lg:col-span-2">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle>Manage Stake</CardTitle>
                <CardDescription>Stake tokens to earn yield and voting power.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stake" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stake" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <label className="text-muted-foreground">Amount to Stake</label>
                        <span className="text-foreground cursor-pointer" onClick={() => setStakeAmount(user.hnchBalance.toString())}>
                          Max: {user.hnchBalance}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                        <Button onClick={handleStake} disabled={isLoading || !stakeAmount} className="w-32 gradient-primary">
                          {isLoading ? '...' : 'Stake'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex gap-3 text-sm text-primary/90">
                      <Trophy className="w-5 h-5 shrink-0" />
                      <p>Staking grants you voting power in the DAO. You must hold your stake for at least 7 days to earn rewards.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="unstake" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <label className="text-muted-foreground">Amount to Unstake</label>
                        <span className="text-foreground cursor-pointer" onClick={() => setStakeAmount(user.stakedBalance.toString())}>
                          Max: {user.stakedBalance}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                        <Button onClick={handleUnstake} disabled={isLoading || !stakeAmount} variant="secondary" className="w-32">
                          {isLoading ? '...' : 'Unstake'}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unstaking initiates a 7-day unbonding period. You will not earn rewards during this time.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Delegation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass border-white/10 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-accent" />
                  Delegation
                </CardTitle>
                <CardDescription>Delegate your voting power to a trusted entity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delegate Address</label>
                  <Input 
                    placeholder="EQ..." 
                    value={delegateAddress}
                    onChange={(e) => setDelegateAddress(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                
                {user.delegatedTo ? (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">Currently Delegated To:</p>
                    <p className="font-mono text-sm text-accent truncate">{user.delegatedTo}</p>
                    <Button 
                      variant="link" 
                      className="text-accent h-auto p-0 mt-2 text-xs"
                      onClick={() => delegate('')} // Mock undelegate
                    >
                      Revoke Delegation
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => delegate(delegateAddress)} 
                    disabled={isLoading || !delegateAddress} 
                    className="w-full border-accent text-accent hover:bg-accent/10" 
                    variant="outline"
                  >
                    Delegate Votes
                  </Button>
                )}

                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Top Delegates
                  </h4>
                  <div className="space-y-3">
                    {['EQC...DAO_Council', 'EQD...Community_Lead', 'EQB...Validator_1'].map((addr, i) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 rounded hover:bg-white/5 cursor-pointer" onClick={() => setDelegateAddress(addr)}>
                        <span className="font-mono text-muted-foreground">{addr}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;
