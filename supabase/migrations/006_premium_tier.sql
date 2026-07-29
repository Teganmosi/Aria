-- Premium voice-call tier: wallet, transactions, and call session tracking.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    minutes_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- minutes is signed: positive for topup/refund/bonus, negative for deductions.
-- provider_ref is UNIQUE (NULLs exempt) — this is the Paystack idempotency key.
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,               -- topup | deduct | refund | bonus
    minutes NUMERIC(10, 2) NOT NULL,
    amount_ngn INTEGER,               -- set for topups
    provider_ref TEXT UNIQUE,         -- Paystack transaction reference
    call_session_id UUID,             -- set for deductions/refunds
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    tier_at_call TEXT NOT NULL DEFAULT 'free',
    engine TEXT NOT NULL DEFAULT 'hf', -- hf | gemini | qwen
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    provider_cost_usd NUMERIC(12, 6),
    minutes_charged NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'active' -- active | completed | failed | refunded
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_user_id ON call_sessions (user_id);
