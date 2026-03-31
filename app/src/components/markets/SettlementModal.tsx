import type { Market } from '../../hooks/useMarketsCache';

interface SettlementModalProps {
  show: boolean;
  market: Market | null;
  isSettling: string | null;
  onSettle: (market: Market) => void;
  onClose: () => void;
}

export function SettlementModal({ show, market, isSettling, onSettle, onClose }: SettlementModalProps) {
  if (!show || !market) return null;

  return (
    <div className="settlement-modal-overlay" onClick={onClose}>
      <div className="settlement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settlement-modal-header">
          <span className="modal-icon">🎯</span>
          <h3>Settle Market & Earn Reward</h3>
        </div>
        <div className="settlement-modal-body">
          <div className="settlement-reward-badge">
            You Will Earn
            <span className="reward-amount">500 HNCH</span>
          </div>

          <div className="settlement-explainer">
            <h4>What Settlement Does:</h4>
            <ul className="settlement-explainer-list">
              <li>
                <span className="icon">🔒</span>
                <span className="text">
                  <strong>Finalizes the market</strong> with the current proposed outcome
                </span>
              </li>
              <li>
                <span className="icon">💰</span>
                <span className="text">
                  <strong>Bond winner receives</strong> their bond back + loser's bond + 2,000 HNCH bonus
                </span>
              </li>
              <li>
                <span className="icon">🎁</span>
                <span className="text">
                  <strong>You receive 500 HNCH</strong> as a reward for settling this market
                </span>
              </li>
              <li>
                <span className="icon">👤</span>
                <span className="text">
                  <strong>Market creator receives</strong> 2,500 HNCH rebate (25% of creation fee)
                </span>
              </li>
            </ul>
          </div>

          <div className="settlement-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              This action is irreversible! Make sure the proposed outcome is correct.
            </span>
          </div>

          <div className="settlement-explainer">
            <h4>Current Proposed Outcome:</h4>
            <ul className="settlement-explainer-list">
              <li>
                <span className="icon">{market.proposedOutcome ? '✅' : '❌'}</span>
                <span className="text">
                  <strong>{market.proposedOutcome ? 'YES' : 'NO'}</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="settlement-modal-actions">
          <button
            className="btn-settle-confirm"
            onClick={async () => {
              onClose();
              await onSettle(market);
            }}
            disabled={isSettling === market.address}
          >
            {isSettling === market.address ? 'Settling...' : 'Confirm & Settle'}
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
