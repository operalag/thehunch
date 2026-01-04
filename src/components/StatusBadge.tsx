import { Badge } from '@/components/ui/badge';
import { EventStatus } from '@/store/blockchainStore';
import { Clock, AlertTriangle, CheckCircle, Gavel } from 'lucide-react';

const StatusBadge = ({ status }: { status: EventStatus }) => {
  const styles = {
    'Active': 'bg-primary/20 text-primary border-primary/20',
    'Reported': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    'Disputed': 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    'DAO_Vote': 'bg-red-500/20 text-red-400 border-red-500/20 animate-pulse',
    'Finalized': 'bg-green-500/20 text-green-400 border-green-500/20',
  };

  const icons = {
    'Active': <Clock className="w-3 h-3 mr-1" />,
    'Reported': <CheckCircle className="w-3 h-3 mr-1" />,
    'Disputed': <AlertTriangle className="w-3 h-3 mr-1" />,
    'DAO_Vote': <Gavel className="w-3 h-3 mr-1" />,
    'Finalized': <CheckCircle className="w-3 h-3 mr-1" />,
  };

  const labels = {
    'Active': 'Open',
    'Reported': 'Waiting for Review',
    'Disputed': 'In Dispute',
    'DAO_Vote': 'DAO Governance',
    'Finalized': 'Closed',
  };

  return (
    <Badge variant="outline" className={`${styles[status]} flex items-center`}>
      {icons[status]} {labels[status]}
    </Badge>
  );
};

export default StatusBadge;
