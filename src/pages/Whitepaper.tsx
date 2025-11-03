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
              HUNCH Oracle Whitepaper
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Decentralized Optimistic Oracle for TON Blockchain
            </p>
            <p className="text-lg text-foreground/80">
              Enabling prediction markets, DeFi insurance, and provably fair gaming for 900M Telegram users
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
                <h3 className="text-xl font-semibold mb-3 text-accent">The Problem</h3>
                <p className="text-foreground/80 leading-relaxed">
                  TON blockchain lacks dispute-based oracle infrastructure needed for subjective data resolution. 
                  Without this critical layer, the ecosystem cannot support prediction markets, DeFi insurance, 
                  or provably fair gaming—missing a $10-25B total addressable market opportunity.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-accent">The Solution</h3>
                <p className="text-foreground/80 leading-relaxed">
                  HUNCH introduces an optimistic oracle with escalating bond mechanics and quadratic governance, 
                  enabling trustless resolution of subjective outcomes. Our 2x escalation (vs UMA's 1:1) and 
                  60% revenue share to stakers (vs UMA's 0%) creates superior economic security and participant alignment.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-accent">Market Opportunity</h3>
                <p className="text-foreground/80 leading-relaxed">
                  With 900M Telegram users on TON, fast finality, and low costs, HUNCH is positioned to capture 
                  significant market share across prediction markets ($5-10B), DeFi insurance ($3-8B), and gaming ($2-7B).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Introduction</h2>
          <div className="space-y-6">
            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">The TON Ecosystem Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  TON blockchain presents a unique opportunity with its 900M Telegram users, sub-second finality, 
                  and minimal transaction costs. However, the ecosystem lacks critical infrastructure for subjective 
                  data resolution—a gap that prevents the development of prediction markets, insurance protocols, 
                  and fair gaming applications.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Traditional price feed oracles (Chainlink, Pyth) excel at objective data but cannot resolve 
                  subjective outcomes like "Did this smart contract get exploited?" or "Who won this tournament?" 
                  These questions require human judgment combined with economic incentives—the domain of optimistic oracles.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">Why Oracles Matter for Subjective Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed">
                  Optimistic oracles assume data is correct unless challenged, enabling capital-efficient resolution 
                  of subjective questions. This mechanism unlocks entirely new application categories:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li><strong className="text-foreground">Prediction Markets:</strong> "Will TON hit $10 by year end?"</li>
                  <li><strong className="text-foreground">DeFi Insurance:</strong> "Did STON.fi suffer an exploit?"</li>
                  <li><strong className="text-foreground">Gaming:</strong> "Who won the tournament?"</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed">
                  HUNCH brings this infrastructure to TON, enabling developers to build these applications natively 
                  on the blockchain with the most distribution potential.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How HUNCH Works */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">How HUNCH Works</h2>
          
          {/* 3-Step Flow */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Simple 3-Step Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-accent">Propose</h3>
                  <p className="text-foreground/80 text-sm">
                    Submit outcome + 10k $HNCH bond → 2-hour challenge window opens
                  </p>
                </div>
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-accent">Challenge</h3>
                  <p className="text-foreground/80 text-sm">
                    Escalating bonds: 20k → 40k → 80k (2x each level)
                  </p>
                </div>
                <div className="text-center space-y-4 p-6 rounded-lg bg-white/5">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-accent">Resolve</h3>
                  <p className="text-foreground/80 text-sm">
                    If 3 challenges → DAO vote (quadratic) → Final outcome
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalating Bond Mechanics */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Escalating Bond Mechanics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-4 w-full max-w-3xl">
                    {[
                      { level: "Initial", amount: "10k" },
                      { level: "Challenge 1", amount: "20k" },
                      { level: "Challenge 2", amount: "40k" },
                      { level: "Challenge 3", amount: "80k" }
                    ].map((item, idx) => (
                      <div key={idx} className="relative">
                        <div 
                          className="bg-gradient-to-t from-primary/80 to-primary/40 rounded-t-lg flex flex-col items-center justify-end p-4"
                          style={{ height: `${(idx + 1) * 60}px` }}
                        >
                          <span className="text-2xl font-bold text-white">{item.amount}</span>
                        </div>
                        <div className="text-center mt-2 text-sm text-foreground/80">{item.level}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed text-center">
                  Each challenge requires 2x the previous bond, creating exponential griefing costs while maintaining 
                  capital efficiency. After 3 challenges, the dispute escalates to DAO quadratic voting for final resolution.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="glass-light border-white/10">
            <CardHeader>
              <CardTitle className="text-accent">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Fixed Challenge Windows</h4>
                  <p className="text-foreground/80 text-sm">2-hour windows provide predictability and fast finality</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Economic Security</h4>
                  <p className="text-foreground/80 text-sm">$1.4M attack cost for $500k VaR (2.8x security ratio)</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Capital Efficiency</h4>
                  <p className="text-foreground/80 text-sm">9.3x ratio enables high throughput with minimal bonds</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Quadratic Governance</h4>
                  <p className="text-foreground/80 text-sm">Prevents plutocracy in DAO dispute resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Token Economics */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Token Economics</h2>
          
          {/* $HNCH Utility */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">$HNCH Utility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-white/5 text-center">
                  <h4 className="font-semibold mb-2 text-primary">Bonding</h4>
                  <p className="text-sm text-foreground/80">Required for all proposals and challenges</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 text-center">
                  <h4 className="font-semibold mb-2 text-primary">Governance</h4>
                  <p className="text-sm text-foreground/80">Quadratic voting power in DAO disputes</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 text-center">
                  <h4 className="font-semibold mb-2 text-primary">Staking Rewards</h4>
                  <p className="text-sm text-foreground/80">60% of all protocol fees distributed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply & Distribution */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Supply & Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-primary">
                    <span className="text-foreground font-semibold">Total Supply</span>
                    <span className="font-bold text-2xl text-foreground">100M $HNCH</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                        <span className="text-foreground/90 font-medium">Community</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">35%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ 
                        width: '35%', 
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: '0 0 10px hsl(var(--primary) / 0.5)'
                      }} />
                    </div>
                    <div className="text-sm text-muted-foreground">35M $HNCH</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--accent))' }} />
                        <span className="text-foreground/90 font-medium">Public Sale</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">20%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ 
                        width: '20%', 
                        backgroundColor: 'hsl(var(--accent))',
                        boxShadow: '0 0 10px hsl(var(--accent) / 0.5)'
                      }} />
                    </div>
                    <div className="text-sm text-muted-foreground">20M $HNCH</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--success-green))' }} />
                        <span className="text-foreground/90 font-medium">Treasury</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">18%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ 
                        width: '18%', 
                        backgroundColor: 'hsl(var(--success-green))',
                        boxShadow: '0 0 10px hsl(var(--success-green) / 0.5)'
                      }} />
                    </div>
                    <div className="text-sm text-muted-foreground">18M $HNCH</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--oracle-purple))' }} />
                        <span className="text-foreground/90 font-medium">Team (5yr vest)</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">12%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ 
                        width: '12%', 
                        backgroundColor: 'hsl(var(--oracle-purple))',
                        boxShadow: '0 0 10px hsl(var(--oracle-purple) / 0.5)'
                      }} />
                    </div>
                    <div className="text-sm text-muted-foreground">12M $HNCH</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--soft-gray))' }} />
                        <span className="text-foreground/90 font-medium">Early Backers (4yr vest)</span>
                      </div>
                      <span className="font-bold text-foreground text-lg">10%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ 
                        width: '10%', 
                        backgroundColor: 'hsl(var(--soft-gray))',
                        boxShadow: '0 0 10px hsl(var(--soft-gray) / 0.5)'
                      }} />
                    </div>
                    <div className="text-sm text-muted-foreground">10M $HNCH</div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-72 h-72">
                    <svg viewBox="0 0 120 120" className="transform -rotate-90 w-full h-full">
                      {/* Community 35% */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        fill="none" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="28" 
                        strokeDasharray="87.92 251.2"
                        strokeDashoffset="0"
                        className="drop-shadow-lg"
                      />
                      {/* Public Sale 20% */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        fill="none" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth="28" 
                        strokeDasharray="50.24 251.2"
                        strokeDashoffset="-87.92"
                        className="drop-shadow-lg"
                      />
                      {/* Treasury 18% */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        fill="none" 
                        stroke="hsl(var(--success-green))" 
                        strokeWidth="28" 
                        strokeDasharray="45.216 251.2"
                        strokeDashoffset="-138.16"
                        className="drop-shadow-lg"
                      />
                      {/* Team 12% */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        fill="none" 
                        stroke="hsl(var(--oracle-purple))" 
                        strokeWidth="28" 
                        strokeDasharray="30.144 251.2"
                        strokeDashoffset="-183.376"
                        className="drop-shadow-lg"
                      />
                      {/* Early Backers 10% */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="45" 
                        fill="none" 
                        stroke="hsl(var(--soft-gray))" 
                        strokeWidth="28" 
                        strokeDasharray="25.12 251.2"
                        strokeDashoffset="-213.52"
                        className="drop-shadow-lg"
                      />
                      {/* Center circle for donut effect */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="31" 
                        fill="hsl(var(--deep-navy))"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center transform rotate-90">
                        <div className="text-3xl font-bold text-foreground">100M</div>
                        <div className="text-sm text-muted-foreground">$HNCH</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Split */}
          <Card className="glass-light border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-accent">Fee Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-2">60%</div>
                  <div className="text-sm text-foreground/80">Stakers</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-4xl font-bold text-accent mb-2">25%</div>
                  <div className="text-sm text-foreground/80">Proposers</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-success-green/10 border border-success-green/20">
                  <div className="text-4xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>10%</div>
                  <div className="text-sm text-foreground/80">Treasury</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-oracle-purple/10 border border-oracle-purple/20">
                  <div className="text-4xl font-bold" style={{ color: 'hsl(var(--oracle-purple))' }}>5%</div>
                  <div className="text-sm text-foreground/80">Burn</div>
                </div>
              </div>
              <p className="text-foreground/80 text-center mt-6 leading-relaxed">
                Industry-leading 60% revenue share to stakers ensures strong alignment and sustainable yield generation
              </p>
            </CardContent>
          </Card>

          {/* Value Accrual */}
          <Card className="glass-light border-white/10">
            <CardHeader>
              <CardTitle className="text-accent">Estimated Staking APY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold text-primary mb-2">13%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 1</div>
                  <div className="text-xs text-muted-foreground">50-200 proposals/day</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold text-accent mb-2">73%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 3</div>
                  <div className="text-xs text-muted-foreground">200-500 proposals/day</div>
                </div>
                <div className="text-center p-6 rounded-lg bg-white/5">
                  <div className="text-3xl font-bold" style={{ color: 'hsl(var(--success-green))' }}>199%</div>
                  <div className="text-sm text-foreground/80 mb-1">Year 5</div>
                  <div className="text-xs text-muted-foreground">500+ proposals/day</div>
                </div>
              </div>
              <p className="text-foreground/80 text-sm text-center mt-6 italic">
                Estimates based on $1-5 avg fees per proposal and 30% staking participation
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bootstrap Strategy */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Bootstrap Strategy</h2>
          <Card className="glass-light border-white/10">
            <CardContent className="p-8">
              <div className="space-y-8">
                {[
                  {
                    phase: "Phase 1",
                    timeline: "Month 1-3",
                    bonds: "100-500 $HNCH",
                    var: "<$10k VaR cap",
                    description: "Initial launch with low-stakes predictions, community building, social consensus endorsements"
                  },
                  {
                    phase: "Phase 2",
                    timeline: "Month 4-6",
                    bonds: "500-2,500 $HNCH",
                    var: "$10k-50k VaR",
                    description: "Insurance pool pilots, increased throughput, cross-protocol integrations begin"
                  },
                  {
                    phase: "Phase 3",
                    timeline: "Month 7-12",
                    bonds: "2,500-10,000 $HNCH",
                    var: "$50k-500k VaR",
                    description: "Full v3.0 unlocked, institutional adoption, high-value use cases enabled"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-8 border-l-2 border-primary/30">
                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-accent">{item.phase}</h3>
                        <span className="text-sm text-muted-foreground">{item.timeline}</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="px-3 py-1 rounded bg-primary/20 text-primary">{item.bonds}</span>
                        <span className="px-3 py-1 rounded bg-accent/20 text-accent">{item.var}</span>
                      </div>
                      <p className="text-foreground/80 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-semibold mb-3 text-foreground">Social Consensus</h4>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  Endorsement system requires 3 trusted community members to vouch for new proposers, 
                  ensuring quality and preventing Sybil attacks during bootstrap phase
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">Prediction Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 text-sm">
                  Build Polymarket-style prediction markets on TON ecosystem events
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">"Will TON hit $10 by Dec 31?"</strong>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">"Will STON.fi TVL exceed $1B?"</strong>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">"Next TON ecosystem unicorn?"</strong>
                  </div>
                </div>
                <p className="text-foreground/80 text-sm">
                  Enable retail and institutional traders to bet on outcomes with trustless settlement
                </p>
              </CardContent>
            </Card>

            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">DeFi Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 text-sm">
                  Protect users against smart contract exploits and protocol failures
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Smart Contract Exploit Protection</strong>
                    <p className="text-foreground/80 text-xs mt-1">STON.fi, DeDust coverage pools</p>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Stablecoin Depeg Coverage</strong>
                    <p className="text-foreground/80 text-xs mt-1">jUSDT, jUSDC insurance</p>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Bridge Failure Insurance</strong>
                    <p className="text-foreground/80 text-xs mt-1">Cross-chain asset protection</p>
                  </div>
                </div>
                <p className="text-foreground/80 text-sm">
                  Provide peace of mind for institutional and retail DeFi users
                </p>
              </CardContent>
            </Card>

            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle className="text-accent">Gaming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 text-sm">
                  Enable provably fair outcomes for tournaments and sports betting
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Tournament Verification</strong>
                    <p className="text-foreground/80 text-xs mt-1">E-sports outcome settlement</p>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Sports Betting</strong>
                    <p className="text-foreground/80 text-xs mt-1">Decentralized match resolution</p>
                  </div>
                  <div className="p-3 rounded bg-white/5">
                    <strong className="text-foreground">Provably Fair Leaderboards</strong>
                    <p className="text-foreground/80 text-xs mt-1">Transparent ranking systems</p>
                  </div>
                </div>
                <p className="text-foreground/80 text-sm">
                  Eliminate centralized control and build trust with players
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitive Analysis */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Competitive Analysis</h2>
          <Card className="glass-light border-white/10">
            <CardContent className="p-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-foreground">Feature</th>
                    <th className="text-left py-4 px-4 text-primary">HUNCH</th>
                    <th className="text-left py-4 px-4 text-foreground/60">UMA</th>
                    <th className="text-left py-4 px-4 text-foreground/60">Chainlink</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Escalation", hunch: "2x", uma: "1:1", chainlink: "N/A" },
                    { feature: "Revenue Share", hunch: "60%", uma: "0%", chainlink: "0%" },
                    { feature: "Voting", hunch: "Quadratic", uma: "Coin", chainlink: "N/A" },
                    { feature: "TON Support", hunch: "Native", uma: "No", chainlink: "No" },
                    { feature: "Bootstrap Cost", hunch: "100 $HNCH", uma: "$1,500", chainlink: "$10k+" },
                    { feature: "Challenge Window", hunch: "2 hours", uma: "Varies", chainlink: "N/A" },
                    { feature: "Subjective Data", hunch: "Yes", uma: "Yes", chainlink: "No" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="py-4 px-4 text-foreground/80">{row.feature}</td>
                      <td className="py-4 px-4 font-semibold text-primary">{row.hunch}</td>
                      <td className="py-4 px-4 text-foreground/60">{row.uma}</td>
                      <td className="py-4 px-4 text-foreground/60">{row.chainlink}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Roadmap</h2>
          <div className="space-y-6">
            {[
              {
                quarter: "Q4 2025",
                title: "Mainnet Launch",
                items: [
                  "December 1st mainnet deployment",
                  "Target 50+ proposals/day",
                  "Community onboarding programs",
                  "Initial prediction market partners"
                ]
              },
              {
                quarter: "Q1 2026",
                title: "Ecosystem Integration",
                items: [
                  "2-3 protocol integrations",
                  "Insurance pool pilots",
                  "Scale to 200 proposals/day",
                  "Mobile dApp launch"
                ]
              },
              {
                quarter: "Q2 2026",
                title: "Scale Operations",
                items: [
                  "Increase bonds to 10k $HNCH",
                  "500+ proposals/day throughput",
                  "Institutional partnerships",
                  "Gaming platform integrations"
                ]
              },
              {
                quarter: "Q3 2026+",
                title: "Cross-Chain Expansion",
                items: [
                  "Multi-chain oracle support",
                  "Enterprise adoption programs",
                  "Advanced governance features",
                  "Global market expansion"
                ]
              }
            ].map((item, idx) => (
              <Card key={idx} className="glass-light border-white/10">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold px-3 py-1 rounded bg-primary/20 text-primary">{item.quarter}</span>
                    <CardTitle className="text-accent">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.items.map((point, pidx) => (
                      <li key={pidx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground/80 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Backers */}
      <section className="py-16 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-5xl">
          <h2 className="text-4xl font-bold mb-8 text-gradient">Team & Backers</h2>
          <Card className="glass-light border-white/10">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-accent">Experienced Team</h3>
                <p className="text-foreground/80 leading-relaxed">
                  HUNCH is built by senior blockchain developers with extensive experience in DeFi protocols, 
                  oracle systems, and TON ecosystem development. Our team has previously contributed to 
                  leading blockchain projects and brings deep technical expertise in mechanism design, 
                  smart contract security, and decentralized governance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-accent">Stealth Launch</h3>
                <p className="text-foreground/80 leading-relaxed">
                  We're taking a community-first approach with a stealth launch strategy. This allows us 
                  to focus on building robust infrastructure, gathering early user feedback, and establishing 
                  product-market fit before scaling marketing efforts.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-foreground/80 leading-relaxed text-center">
                  Join our community to learn more about the team, roadmap updates, and early participation opportunities
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-gradient">Join the HUNCH Community</h2>
          <p className="text-lg text-foreground/80 mb-8">
            Be part of building the future of decentralized oracles on TON
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