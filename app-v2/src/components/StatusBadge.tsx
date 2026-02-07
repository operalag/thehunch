type MarketStatus = 'open' | 'proposed' | 'challenged' | 'voting' | 'resolved';

interface StatusBadgeProps {
  status: MarketStatus;
}

const statusConfig: Record<
  MarketStatus,
  { label: string; dotColor: string; bgColor: string }
> = {
  open: {
    label: 'Open',
    dotColor: 'bg-success',
    bgColor: 'bg-success/10',
  },
  proposed: {
    label: 'Proposed',
    dotColor: 'bg-warning',
    bgColor: 'bg-warning/10',
  },
  challenged: {
    label: 'Challenged',
    dotColor: 'bg-warning-light',
    bgColor: 'bg-warning-light/10',
  },
  voting: {
    label: 'DAO Vote',
    dotColor: 'bg-brand-400',
    bgColor: 'bg-brand-400/10',
  },
  resolved: {
    label: 'Resolved',
    dotColor: 'bg-tg-hint',
    bgColor: 'bg-white/5',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
