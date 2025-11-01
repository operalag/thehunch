import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Calculators = () => {
  const [bondRound, setBondRound] = useState(1);
  const [stakePeriod, setStakePeriod] = useState(12);
  const [confidenceLevel, setConfidenceLevel] = useState(95);

  const calculateBond = (round: number) => {
    return 2000 * Math.pow(2, round - 1);
  };

  const calculateStakingAPY = (months: number) => {
    const baseAPY = 14;
    const multiplier = 1 + (months - 1) / 11 * 2; // 1x at 1 month, 3x at 12 months
    return (baseAPY * multiplier).toFixed(1);
  };

  const calculateOracleReward = (confidence: number) => {
    const baseFee = 194;
    const rewardPercentage = 12;
    const confidenceMultiplier = confidence / 100;
    return (baseFee * (rewardPercentage / 100) * confidenceMultiplier).toFixed(2);
  };

  return (
    <section id="calculators" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Interactive Calculators</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the economics behind Hunch Oracle
          </p>
        </motion.div>

        <Tabs defaultValue="bonds" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="bonds">Bond Escalation</TabsTrigger>
            <TabsTrigger value="staking">Staking Rewards</TabsTrigger>
            <TabsTrigger value="oracle">Oracle Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="bonds">
            <Card className="glass p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Bond Escalation Calculator</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-sm text-muted-foreground mb-4 block">
                    Challenge Round: {bondRound}
                  </label>
                  <Slider
                    value={[bondRound]}
                    onValueChange={(value) => setBondRound(value[0])}
                    min={1}
                    max={4}
                    step={1}
                    className="mb-4"
                  />
                </div>

                <div className="gradient-card p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Bond Required</div>
                      <div className="text-4xl font-bold font-mono text-primary">
                        {calculateBond(bondRound).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">TON</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Secures Up To</div>
                      <div className="text-4xl font-bold font-mono text-accent">
                        ${(calculateBond(bondRound) * 7.75).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">USD Value</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Bonds double each round to deter frivolous challenges
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="staking">
            <Card className="glass p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Staking Reward Calculator</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-sm text-muted-foreground mb-4 block">
                    Lock Period: {stakePeriod} months
                  </label>
                  <Slider
                    value={[stakePeriod]}
                    onValueChange={(value) => setStakePeriod(value[0])}
                    min={1}
                    max={12}
                    step={1}
                    className="mb-4"
                  />
                </div>

                <div className="gradient-card p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">APY</div>
                      <div className="text-4xl font-bold font-mono text-primary">
                        {calculateStakingAPY(stakePeriod)}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Annual Return</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Multiplier</div>
                      <div className="text-4xl font-bold font-mono text-accent">
                        {(1 + (stakePeriod - 1) / 11 * 2).toFixed(1)}x
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Boost</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Longer lock periods earn higher rewards (1.0x to 3.0x multiplier)
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="oracle">
            <Card className="glass p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Oracle Reward Calculator</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-sm text-muted-foreground mb-4 block">
                    Confidence Level: {confidenceLevel}%
                  </label>
                  <Slider
                    value={[confidenceLevel]}
                    onValueChange={(value) => setConfidenceLevel(value[0])}
                    min={50}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                </div>

                <div className="gradient-card p-6 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Expected Reward</div>
                      <div className="text-4xl font-bold font-mono text-primary">
                        {calculateOracleReward(confidenceLevel)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">TON</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
                      <div className="text-4xl font-bold font-mono text-accent">
                        {confidenceLevel}%
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                  Honest oracles earn 12% of the 194 TON service fee
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Calculators;
