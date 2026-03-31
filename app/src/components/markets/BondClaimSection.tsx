import { useMarketParticipants } from '../../hooks/useMarketParticipants';
import type { Market } from '../../hooks/useMarketsCache';
import { normalizeTonAddress } from './constants';

export interface BondClaimSectionProps {
  market: Market;
  userAddress: string | undefined;
  isClaimingBonds: string | null;
  onClaimBonds: (market: Market) => void;
}

export function BondClaimSection({ market, userAddress, isClaimingBonds, onClaimBonds }: BondClaimSectionProps) {
  const { winner } = useMarketParticipants(market.address, market.currentAnswer);

  const canClaim = () => {
    if (!userAddress || !winner) return false;
    // Normalize both addresses to compare the hash portion
    // This handles UQ... (non-bounceable) vs EQ... (bounceable) being the same address
    const userHash = normalizeTonAddress(userAddress);
    const participantHash = normalizeTonAddress(winner.participant.participantAddress);
    return market.status === 'resolved' && userHash === participantHash;
  };

  if (!winner || !canClaim()) return null;

  return (
    <div className="rebate-claim-action bond-claim-action">
      <button
        className="btn-claim-rebate btn-claim-bonds"
        onClick={() => onClaimBonds(market)}
        disabled={isClaimingBonds === market.address}
      >
        {isClaimingBonds === market.address
          ? 'Claiming...'
          : `Claim Your Winnings: ${winner.winnings.toLocaleString()} HNCH`}
      </button>
      <div className="winnings-breakdown">
        <span className="breakdown-item">Bond returned: {winner.bondReturned.toLocaleString()} HNCH</span>
        <span className="breakdown-item">Bonds won: {winner.bondsWon.toLocaleString()} HNCH</span>
        <span className="breakdown-item">Bonus: {winner.bonus.toLocaleString()} HNCH</span>
      </div>
    </div>
  );
}
