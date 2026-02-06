import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { CONTRACTS } from '../config/contracts';
import { getNetworkConfig } from '../config/networks';

export function Admin() {
  const { wallet, userAddress, setFeeDistributor } = useContract();
  const [feeDistAddr, setFeeDistAddr] = useState(CONTRACTS.FEE_DISTRIBUTOR);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const networkConfig = getNetworkConfig();

  const handleSetFeeDistributor = async () => {
    if (!feeDistAddr.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      await setFeeDistributor(feeDistAddr.trim());
      setStatus('Transaction submitted. Verify on explorer in ~15s.');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'var(--surface)',
      borderRadius: '12px',
      border: '1px solid var(--danger)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--danger)' }}>Admin Panel</h2>
        <span style={{
          fontSize: '0.75rem',
          background: 'var(--danger)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
        }}>TEMPORARY</span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Network: <strong>{networkConfig.displayName}</strong> | Wallet: <code style={{ fontSize: '0.8rem' }}>{userAddress || 'Not connected'}</code>
      </p>

      {!wallet && (
        <p style={{ color: 'var(--warning)', padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px' }}>
          Connect your admin wallet to use these functions.
        </p>
      )}

      {/* Set Fee Distributor */}
      <div style={{
        padding: '1.25rem',
        background: 'var(--background)',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Set Fee Distributor on Master Oracle</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
          Updates the Master Oracle's stored Fee Distributor address (op 0x0E). Admin only.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>
          Master Oracle: <code>{CONTRACTS.MASTER_ORACLE}</code>
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
          Current frontend config: <code>{CONTRACTS.FEE_DISTRIBUTOR}</code>
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={feeDistAddr}
            onChange={(e) => setFeeDistAddr(e.target.value)}
            placeholder="New Fee Distributor address (EQ...)"
            style={{
              flex: 1,
              padding: '0.6rem 0.8rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
            }}
          />
          <button
            onClick={handleSetFeeDistributor}
            disabled={loading || !wallet}
            style={{
              padding: '0.6rem 1.2rem',
              background: loading ? 'var(--surface-light)' : 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !wallet ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: !wallet ? 0.5 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Set Fee Distributor'}
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div style={{
          padding: '0.75rem 1rem',
          background: status.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${status.startsWith('Error') ? 'var(--danger)' : 'var(--secondary)'}`,
          borderRadius: '6px',
          color: status.startsWith('Error') ? 'var(--danger)' : 'var(--secondary)',
          fontSize: '0.85rem',
          marginTop: '1rem',
        }}>
          {status}
        </div>
      )}

      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        marginTop: '1.5rem',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        Remove this component after fixing the Fee Distributor address.
        <br />
        Access via: <code>{window.location.origin}/#admin</code>
      </p>
    </div>
  );
}
