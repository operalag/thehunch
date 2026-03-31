import type { Market } from '../../hooks/useMarketsCache';

interface DaoConfirmModalProps {
  show: boolean;
  market: Market | null;
  isChallenging: boolean;
  onConfirm: (market: Market) => void;
  onClose: () => void;
}

export function DaoConfirmModal({ show, market, isChallenging, onConfirm, onClose }: DaoConfirmModalProps) {
  if (!show || !market) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dao-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">⚖️</span>
          <h3>This Will Trigger a DAO Vote!</h3>
        </div>
        <div className="modal-body">
          <p className="modal-warning">
            After your challenge, this market will enter a <strong>48-hour DAO voting period</strong>.
          </p>
          <div className="modal-info-box">
            <h4>What happens next:</h4>
            <ul>
              <li>Market enters DAO voting for 48 hours</li>
              <li>Only users with 2M+ HNCH staked for 24h+ can vote</li>
              <li>Community votes to resolve the dispute</li>
              <li>After 48 hours, anyone can finalize the vote</li>
            </ul>
          </div>
          <div className="modal-challenge-details">
            <p><strong>Your Challenge:</strong></p>
            <p>Proposing: <span className={`outcome-${!market.proposedOutcome ? 'yes' : 'no'}`}>
              {!market.proposedOutcome ? 'YES' : 'NO'}
            </span></p>
            <p>Bond Required: <strong>{((market.currentBond || 0) * 2).toLocaleString()} HNCH</strong></p>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="btn-confirm-dao"
            onClick={() => onConfirm(market)}
            disabled={isChallenging}
          >
            {isChallenging ? 'Submitting...' : 'Confirm & Trigger DAO Vote'}
          </button>
          <button
            className="btn-cancel-modal"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
