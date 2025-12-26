import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useBlockchainStore } from '@/store/blockchainStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, PlusCircle, Info } from 'lucide-react';

const CreateMarket = () => {
  const navigate = useNavigate();
  const { createEvent, user, isLoading } = useBlockchainStore();
  
  const [question, setQuestion] = useState('');
  const [outcomeA, setOutcomeA] = useState('Yes');
  const [outcomeB, setOutcomeB] = useState('No');
  const [source, setSource] = useState('');
  const [resolutionTime, setResolutionTime] = useState('');
  const [category, setCategory] = useState<string>('');
  const [bond, setBond] = useState('10000');

  const handleCreate = () => {
    if (!question || !outcomeA || !outcomeB || !source || !resolutionTime || !category || !bond) return;
    const resolutionTimestamp = new Date(resolutionTime).getTime();
    createEvent(question, Number(bond), category as any, [outcomeA, outcomeB], source, resolutionTimestamp);
    navigate('/app');
  };

  if (!user.address) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet to Create Markets</h1>
          <Button onClick={() => navigate('/app')}>Back to Dashboard</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-28 pb-12 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app')} 
          className="mb-6 hover:text-accent pl-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">Create New Oracle Market</CardTitle>
            <CardDescription>
              Define a question and post a bond to request data verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input 
                placeholder="e.g. Will Bitcoin exceed $100k by Jan 1st?" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">Be specific. Ambiguous questions may be resolved as invalid.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Outcome A</Label>
                <Input 
                  value={outcomeA}
                  onChange={(e) => setOutcomeA(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome B</Label>
                <Input 
                  value={outcomeB}
                  onChange={(e) => setOutcomeB(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resolution Source</Label>
              <Input 
                placeholder="e.g. Binance API, SportsAPI, NYTimes" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">Provide a reliable source for the result.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Resolution Time</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Make sure the result can be typed in only 10 min after the event officially finishes.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input 
                type="datetime-local"
                value={resolutionTime}
                onChange={(e) => setResolutionTime(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                    <SelectItem value="Tech">Tech</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Initial Bond (HNCH)</Label>
                <Input 
                  type="number" 
                  value={bond}
                  onChange={(e) => setBond(e.target.value)}
                  className="bg-white/5 border-white/10 font-mono"
                />
                <p className="text-xs text-muted-foreground">Min: 10,000 HNCH</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Wallet Balance:</span>
                <span className="font-mono">{user.hnchBalance.toLocaleString()} HNCH</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-primary">Cost to Create:</span>
                <span>{Number(bond).toLocaleString()} HNCH</span>
              </div>
            </div>

            <Button 
              className="w-full gradient-primary" 
              size="lg"
              onClick={handleCreate}
              disabled={isLoading || !question || !outcomeA || !outcomeB || !source || !resolutionTime || !category || user.hnchBalance < Number(bond)}
            >
              {isLoading ? 'Creating...' : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default CreateMarket;
