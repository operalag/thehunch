import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useBlockchainStore, OracleEvent, EventStatus } from '@/store/blockchainStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

const EventCard = ({ event }: { event: OracleEvent }) => (
  <Card className="glass-light border-white/10 hover:border-primary/30 transition-all hover:-translate-y-1">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start mb-2">
        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10">
          {event.category}
        </Badge>
        <StatusBadge status={event.status} />
      </div>
      <CardTitle className="text-lg font-medium leading-tight h-14 line-clamp-2">
        {event.question}
      </CardTitle>
    </CardHeader>
    <CardContent className="pb-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Total Bond</p>
          <p className="font-mono font-semibold">{event.bond.toLocaleString()} HNCH</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Created</p>
          <p className="font-mono text-muted-foreground">
            {new Date(event.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {event.outcome && (
        <div className="mt-4 p-2 rounded bg-white/5 border border-white/5 text-sm">
          <span className="text-muted-foreground">Current Outcome: </span>
          <span className="font-semibold text-foreground">{event.outcome}</span>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <Link to={`/app/market/${event.id}`} className="w-full">
        <Button className="w-full" variant={event.status === 'Active' ? 'default' : 'outline'}>
          {event.status === 'Active' ? 'Report Outcome' : 'View Details'}
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

const Dashboard = () => {
  const { events } = useBlockchainStore();
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'active') return e.status === 'Active';
    if (filter === 'disputed') return ['Disputed', 'DAO_Vote'].includes(e.status);
    if (filter === 'finalized') return e.status === 'Finalized';
    return true;
  });

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-28 pb-12 bg-[hsl(var(--deep-navy))]">
        <div className="container-custom max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Market Dashboard</h1>
            <p className="text-muted-foreground mt-2">Browse, report on, and dispute prediction markets.</p>
          </div>
          <Link to="/app/create">
            <Button className="gradient-primary text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Create Market
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
          <TabsList className="mb-8 bg-white/5 border border-white/10">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="active">Open</TabsTrigger>
            <TabsTrigger value="disputed">In Dispute</TabsTrigger>
            <TabsTrigger value="finalized">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="active" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="disputed" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="finalized" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
