import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Whitepaper = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--deep-navy))]">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container-custom py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--hunch-blue))_0%,_transparent_50%)] opacity-10" />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              Hunch Oracle v4.0
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              TON-Native Optimistic Oracle Network
            </p>
            <p className="text-lg text-foreground/80">
              The first cryptoeconomically secure oracle optimized for TON’s infinite sharding and asynchronous architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Executive Summary</h2>
          <Card className="glass-light border-white/10">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-foreground/80 leading-relaxed mb-6">
                  The Open Network (TON) represents a paradigm shift in blockchain architecture—infinite sharding, 
                  asynchronous messaging, and direct integration with 900M Telegram users. Yet this explosive growth 
                  faces a critical infrastructure gap: <strong>no native, cryptoeconomically secure oracle network 
                  optimized for TON’s unique actor-model architecture.</strong>
                </p>
                <h3 className="text-xl font-semibold mb-4 text-accent">Three Breakthrough Innovations</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Dual-Anchor Bonding</h4>
                    <p className="text-foreground/80 text-sm">
                      Security guarantees that hold in all market conditions. Bonds are valued at MAX(HNCH, USD), 
                      preventing security loss even during 90% token crashes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Delegation Voting</h4>
                    <p className="text-foreground/80 text-sm">
                      Achieves 25-40% DAO participation (vs industry &lt;3%) through asynchronous delegation, 
                      solving the "staker's dilemma" between yield and governance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Sharded Architecture</h4>
                    <p className="text-foreground/80 text-sm">
                      Multi-contract system designed for TON’s infinite sharding. Separate instance contracts 
                      per market ensure scalability without global bottlenecks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The TON Challenge */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">The TON-Specific Challenge</h2>
          <div className="space-y-6">
            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">Why Existing Oracles Fail on TON</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  Existing oracles (Chainlink, UMA, Pyth) are designed for EVM's synchronous, single-shard model. 
                  TON's architecture is fundamentally different:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li><strong>Asynchronous Actor Model:</strong> Contracts cannot atomically read other contract states. All interactions happen via messages.</li>
                  <li><strong>Infinite Sharding:</strong> State is split across shards; cross-shard communication is slow and requires logical time ordering.</li>
                  <li><strong>Parallel Execution:</strong> A message cascade can span multiple blocks, requiring robust handling of race conditions.</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  Hunch v4.0 is built from the ground up for this environment, treating every oracle request 
                  as an independent state machine that manages its own lifecycle and bond escrow.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Technical Architecture</h2>
          
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Multi-Contract Sharded Design</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="border-l-2 border-primary/30 pl-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Layer 1: Master Oracle</h3>
                  <p className="text-sm font-mono text-accent mb-2">hunch_master.fc</p>
                  <p className="text-foreground/80">
                    Lives on the MasterChain (or a base WorkChain). Stores global parameters, aggregates DAO votes, 
                    manages the Guardian Council multisig, and handles the global delegation registry.
                  </p>
                </div>

                <div className="border-l-2 border-primary/30 pl-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Layer 2: Oracle Instances</h3>
                  <p className="text-sm font-mono text-accent mb-2">hunch_instance.fc</p>
                  <p className="text-foreground/80">
                    Deployed per prediction market on various ShardChains. Handles the `propose` &rarr; `challenge` 
                    lifecycle for a specific event. Manages its own bond escrow and enforcing the 2-hour challenge window. 
                    This ensures that high traffic on one market does not congest the entire oracle network.
                  </p>
                </div>

                <div className="border-l-2 border-primary/30 pl-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Layer 3: Support Contracts</h3>
                  <ul className="space-y-2 text-foreground/80 mt-2">
                    <li><span className="font-mono text-accent">price_oracle.fc</span>: Integrates STON.fi/DeDust TWAP for Dual-Anchor bonding.</li>
                    <li><span className="font-mono text-accent">fee_distributor.fc</span>: Splits revenue 60/25/10/5.</li>
                    <li><span className="font-mono text-accent">vote_guard.fc</span>: Temporary contract deployed only during DAO disputes to manage quadratic voting.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Async Flow */}
          <Card className="glass-light border-white/10">
            <CardHeader>
              <CardTitle className="text-accent">Asynchronous Resolution Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">1</div>
                  <h3 className="font-semibold text-foreground">Propose</h3>
                  <p className="text-xs text-foreground/80">
                    User sends `op::propose` to Instance. 
                    Bond = MAX(10k HNCH, $2k USD). 
                    Timer starts.
                  </p>
                </div>
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">2</div>
                  <h3 className="font-semibold text-foreground">Escalate</h3>
                  <p className="text-xs text-foreground/80">
                    Challenger sends `op::challenge`. 
                    Bond doubles (2x). 
                    If &gt;3 challenges, trigger DAO.
                  </p>
                </div>
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">3</div>
                  <h3 className="font-semibold text-foreground">Resolve</h3>
                  <p className="text-xs text-foreground/80">
                    VoteGuard counts quadratic votes. 
                    Master signals result. 
                    Instance distributes bonds + fees.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Economic Model */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Economic Model</h2>
          
          {/* Fee Split */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Revenue Waterfall</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">60%</div>
                  <div className="text-sm text-foreground/80">Stakers</div>
                  <div className="text-xs text-muted-foreground mt-1">Direct Rev Share</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-4xl font-bold text-accent mb-2">25%</div>
                  <div className="text-sm text-foreground/80">Proposers</div>
                  <div className="text-xs text-muted-foreground mt-1">Accuracy Incentive</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-success-green/10 border border-success-green/20">
                  <div className="text-4xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>10%</div>
                  <div className="text-sm text-foreground/80">Treasury</div>
                  <div className="text-xs text-muted-foreground mt-1">Ops & Audits</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-oracle-purple/10 border border-oracle-purple/20">
                  <div className="text-4xl font-bold" style={{ color: 'hsl(var(--oracle-purple))' }}>5%</div>
                  <div className="text-sm text-foreground/80">Burn</div>
                  <div className="text-xs text-muted-foreground mt-1">Deflation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Analysis */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Cryptoeconomic Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground/80">
                <strong>Benchmark:</strong> 5.4:1 Attack-Cost Ratio (vs 0.32:1 in v3.0). This makes Hunch 18.8x more secure.
              </p>
              <div className="p-4 rounded-lg bg-white/5 font-mono text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Attack Target (VaR):</span>
                  <span className="text-accent">$500,000</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between">
                  <span>Bonds Lost (Escalation):</span>
                  <span>$150,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Vote Manipulation Cost:</span>
                  <span>$781,728 - $2.5M</span>
                </div>
                <div className="flex justify-between font-bold text-primary">
                  <span>Total Attack Cost:</span>
                  <span>~$931,000+</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                *Vote manipulation cost includes slippage when acquiring 51% of quadratic voting power (approx. 2.6% of total supply).
              </p>
            </CardContent>
          </Card>

          {/* Staking APY */}
          <Card className="glass-light border-white/10">
            <CardHeader>
              <CardTitle className="text-accent">Projected Real Yield (APY)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold text-primary mb-2">11.7%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 1</div>
                  <div className="text-xs text-muted-foreground">20 req/day</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold text-accent mb-2">62.6%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 2</div>
                  <div className="text-xs text-muted-foreground">100 req/day</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>164%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 3</div>
                  <div className="text-xs text-muted-foreground">250 req/day</div>
                </div>
              </div>
              <p className="text-foreground/80 text-sm text-center mt-6 italic">
                Note: APY scales with oracle usage, not token inflation. This is real yield from protocol revenue.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Token Distribution */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Token Distribution</h2>
          <Card className="glass-light border-white/10">
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-primary">
                    <span className="text-foreground font-semibold">Total Supply</span>
                    <span className="font-bold text-2xl text-foreground">50M $HNCH</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Community", pct: "35%", val: "17.5M", color: "hsl(var(--primary))" },
                      { label: "Public Sale (TGE)", pct: "25%", val: "12.5M", color: "hsl(var(--accent))" },
                      { label: "Treasury", pct: "18%", val: "9M", color: "hsl(var(--success-green))" },
                      { label: "Team (Vested)", pct: "12%", val: "6M", color: "hsl(var(--oracle-purple))" },
                      { label: "Early Backers", pct: "10%", val: "5M", color: "hsl(var(--soft-gray))" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/90">{item.label}</span>
                          <span className="font-bold">{item.pct}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: item.pct, backgroundColor: item.color }} 
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">{item.val} $HNCH</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* SVG Chart adapted for 50M */}
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                      {/* Segments - Simplified visualization */}
                      <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="20" strokeDasharray="87.9 251.2" strokeDashoffset="0" />
                      <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--accent))" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-87.9" />
                      <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--success-green))" strokeWidth="20" strokeDasharray="45.2 251.2" strokeDashoffset="-150.7" />
                      <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--oracle-purple))" strokeWidth="20" strokeDasharray="30.1 251.2" strokeDashoffset="-195.9" />
                      <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--soft-gray))" strokeWidth="20" strokeDasharray="25.1 251.2" strokeDashoffset="-226" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-foreground">50M</span>
                      <span className="text-xs text-muted-foreground">Fixed Supply</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-gradient">Join the Hunch Ecosystem</h2>
          <p className="text-lg text-foreground/80 mb-8">
            Powering the next generation of prediction markets on TON.
          </p>
          <a 
            href="https://t.me/hunch_oracle" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-lg gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Join Telegram Community
          </a>
        </div>
      </section>
    </div>
  );
};

export default Whitepaper;