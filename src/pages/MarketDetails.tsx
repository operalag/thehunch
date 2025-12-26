import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlockchainStore } from '@/store/blockchainStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertTriangle, Gavel, Check, X } from 'lucide-react';

const MarketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, user, reportOutcome, challengeOutcome, vote, isLoading } = useBlockchainStore();
  
  const event = events.find(e => e.id === id);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [voteAmount, setVoteAmount] = useState('');

  if (!event) return <div className="pt-32 text-center">Market not found</div>;

  const isDisputed = ['Disputed', 'DAO_Vote'].includes(event.status);
  const isDaoVote = event.status === 'DAO_Vote';

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[hsl(var(--deep-navy))]">
      <div className="container-custom max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/app')} className="mb-6 pl-0">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <Badge variant="secondary">{event.category}</Badge>
                  <span className="text-sm font-mono text-muted-foreground">ID: {event.id}</span>
                </div>
                <CardTitle className="text-2xl leading-tight">{event.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Bond</p>
                    <p className="text-xl font-bold font-mono">{event.bond.toLocaleString()} HNCH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Challenge Count</p>
                    <p className="text-xl font-bold">{event.challengeCount}/3</p>
                  </div>
                </div>

                {event.outcome && (
                  <div className="p-4 border border-white/10 rounded-lg bg-accent/5">
                    <p className="text-sm text-muted-foreground mb-1">Reported Outcome:</p>
                    <p className="text-lg font-semibold text-accent">{event.outcome}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voting Interface (Only if DAO Vote) */}
            {isDaoVote && (
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    DAO Governance Vote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Yes (Support)</span>
                      <span>{event.votesFor.toLocaleString()} VP</span>
                    </div>
                    <Progress value={(event.votesFor / (event.votesFor + event.votesAgainst)) * 100 || 0} className="h-2" />
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg space-y-4">
                    <Label>Cast Quadratic Vote</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="Amount HNCH" 
                        value={voteAmount}
                        onChange={(e) => setVoteAmount(e.target.value)}
                      />
                      <Button onClick={() => vote(event.id, true, Number(voteAmount))} className="bg-green-600 hover:bg-green-700">
                        Vote Yes
                      </Button>
                      <Button onClick={() => vote(event.id, false, Number(voteAmount))} className="bg-red-600 hover:bg-red-700">
                        Vote No
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cost: {voteAmount} HNCH = {Math.sqrt(Number(voteAmount)).toFixed(2)} Votes (Sqrt)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="glass-light border-white/10">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.status === 'Active' && (
                  <div className="space-y-3">
                    <Label>Report Outcome</Label>
                    <Input 
                      placeholder="e.g. Yes / Team A" 
                      value={outcomeInput}
                      onChange={(e) => setOutcomeInput(e.target.value)}
                    />
                    <Button 
                      className="w-full gradient-primary" 
                      onClick={() => reportOutcome(event.id, outcomeInput)}
                      disabled={isLoading || !outcomeInput}
                    >
                      Bond & Report
                    </Button>
                  </div>
                )}

                {(event.status === 'Reported' || event.status === 'Disputed') && (
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm text-orange-200 flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Disputing requires a {event.bond * 2} HNCH bond (2x current).</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => challengeOutcome(event.id)}
                      disabled={isLoading || user.hnchBalance < event.bond * 2}
                    >
                      Challenge Outcome
                    </Button>
                  </div>
                )}

                {event.status === 'Finalized' && (
                  <div className="text-center p-4 bg-green-500/10 rounded text-green-400">
                    <Check className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold">Market Resolved</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;
