-- Records user acceptance of legal documents (Terms of Service, Privacy Policy).
-- One row per user per document; a new version is recorded as a fresh row,
-- preserving an audit trail of which version each user agreed to and when.
CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    document TEXT NOT NULL,
    version TEXT NOT NULL,
    source TEXT DEFAULT 'register',
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consents_user_id ON consents (user_id);
