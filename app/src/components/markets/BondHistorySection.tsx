import { useMarketParticipants } from '../../hooks/useMarketParticipants';
import type { Market } from '../../hooks/useMarketsCache';

export interface BondHistorySectionProps {
  market: Market;
  isExpanded: boolean;
  onToggle: () => void;
  formatTimeSince: (timestamp: number) => string;
}

export function BondHistorySection({ market, isExpanded, onToggle, formatTimeSince }: BondHistorySectionProps) {
  const { participants } = useMarketParticipants(market.address, market.currentAnswer);

  if (participants.length === 0) return null;

  return (
    <div className="bond-history-section">
      <button className="history-toggle-btn" onClick={onToggle}>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="toggle-text">View Market History ({participants.length} event{participants.length !== 1 ? 's' : ''})</span>
      </button>

      {isExpanded && (
        <div className="bond-history-timeline">
          {participants.map((participant, index) => (
            <div key={participant.id} className="timeline-event">
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                {index < participants.length - 1 && <div className="marker-line"></div>}
              </div>
              <div className="timeline-content">
                <div className="event-header">
                  <span className={`event-action ${participant.action}`}>
                    {participant.action === 'propose' ? '📝 Proposed' : '⚔️ Challenged'}
                  </span>
                  <span className="event-time">{formatTimeSince(participant.timestamp)}</span>
                </div>
                <div className="event-details">
                  <div className="event-answer">
                    Answer: <span className={`answer-badge ${participant.answer ? 'yes' : 'no'}`}>
                      {participant.answer ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="event-bond">
                    Bond: <strong>{participant.bondAmount.toLocaleString()} HNCH</strong>
                  </div>
                  <div className="event-participant">
                    By: <span className="participant-address">
                      {participant.participantAddress.slice(0, 6)}...{participant.participantAddress.slice(-4)}
                    </span>
                  </div>
                </div>
                {market.status === 'resolved' && market.currentAnswer === participant.answer && index === participants.length - 1 && (
                  <div className="winner-badge">🏆 Winner</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
