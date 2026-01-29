-- Migration: Create market_participants table for tracking bond winners
-- This table stores all participants (proposers and challengers) in each market
-- to determine who wins bonds after resolution

-- Create market_participants table
CREATE TABLE IF NOT EXISTS market_participants (
  id BIGSERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL,
  network TEXT NOT NULL,
  market_address TEXT NOT NULL,
  participant_address TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('propose', 'challenge')),
  answer BOOLEAN NOT NULL,
  bond_amount BIGINT NOT NULL,
  escalation_level INTEGER NOT NULL DEFAULT 0,
  timestamp INTEGER NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT market_participants_unique
    UNIQUE(market_address, participant_address, escalation_level)
);

-- Add comments to explain the table's purpose
COMMENT ON TABLE market_participants IS 'Tracks all participants who bonded HNCH in prediction markets';
COMMENT ON COLUMN market_participants.market_id IS 'Market ID from markets table';
COMMENT ON COLUMN market_participants.network IS 'Network: mainnet or testnet';
COMMENT ON COLUMN market_participants.market_address IS 'Oracle Instance contract address';
COMMENT ON COLUMN market_participants.participant_address IS 'User wallet address who bonded';
COMMENT ON COLUMN market_participants.action IS 'Type of participation: propose or challenge';
COMMENT ON COLUMN market_participants.answer IS 'The answer they bonded for (true=YES, false=NO)';
COMMENT ON COLUMN market_participants.bond_amount IS 'Amount bonded in nano HNCH (divide by 1e9 for HNCH)';
COMMENT ON COLUMN market_participants.escalation_level IS 'Escalation level (0=initial, 1-3=escalated)';
COMMENT ON COLUMN market_participants.timestamp IS 'Unix timestamp when bond was placed';
COMMENT ON COLUMN market_participants.tx_hash IS 'Transaction hash for verification';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_participants_market
  ON market_participants(market_address);

CREATE INDEX IF NOT EXISTS idx_participants_address
  ON market_participants(participant_address);

CREATE INDEX IF NOT EXISTS idx_participants_network
  ON market_participants(network);

CREATE INDEX IF NOT EXISTS idx_participants_market_network
  ON market_participants(market_address, network);
