BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, vault_id UUID NOT NULL UNIQUE,
  profile JSONB NOT NULL CHECK (COALESCE(profile->>'version','') = '1' AND octet_length(profile::text) < 140000),
  profile_revision INTEGER NOT NULL DEFAULT 1 CHECK (profile_revision > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS passkeys (
  id VARCHAR(1024) PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key BYTEA NOT NULL CHECK (octet_length(public_key) BETWEEN 32 AND 4096),
  counter BIGINT NOT NULL DEFAULT 0 CHECK (counter >= 0), transports TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS passkeys_user_idx ON passkeys(user_id);
CREATE TABLE IF NOT EXISTS challenges (
  token_hash BYTEA PRIMARY KEY CHECK (octet_length(token_hash)=32), purpose VARCHAR(32) NOT NULL,
  payload JSONB NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS challenges_expiry_idx ON challenges(expires_at);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash BYTEA PRIMARY KEY CHECK (octet_length(token_hash)=32),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device BOOLEAN NOT NULL DEFAULT false, label VARCHAR(120) NOT NULL DEFAULT 'Browser',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), authenticated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS two_factor (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_seed BYTEA NOT NULL CHECK(octet_length(encrypted_seed) BETWEEN 48 AND 128),
  enabled BOOLEAN NOT NULL DEFAULT false, last_counter BIGINT NOT NULL DEFAULT -1,
  pending_expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS recovery_codes (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash BYTEA NOT NULL CHECK(octet_length(code_hash)=32), used_at TIMESTAMPTZ,
  UNIQUE(user_id,code_hash)
);
CREATE INDEX IF NOT EXISTS recovery_user_idx ON recovery_codes(user_id) WHERE used_at IS NULL;
CREATE TABLE IF NOT EXISTS vault_items (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL CHECK(revision > 0), deleted BOOLEAN NOT NULL DEFAULT false,
  envelope JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id,id),
  CHECK ((deleted AND envelope IS NULL) OR (NOT deleted AND envelope IS NOT NULL AND COALESCE(envelope->>'version','')='1' AND octet_length(envelope::text)<140000))
);
CREATE INDEX IF NOT EXISTS items_user_idx ON vault_items(user_id,updated_at);
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY, sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, item_id UUID NOT NULL,
  envelope JSONB NOT NULL CHECK(octet_length(envelope::text)<145000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(sender_id<>recipient_id),
  FOREIGN KEY(sender_id,item_id) REFERENCES vault_items(user_id,id) ON DELETE CASCADE,
  UNIQUE(sender_id,recipient_id,item_id)
);
CREATE INDEX IF NOT EXISTS shares_recipient_idx ON shares(recipient_id);
CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, action VARCHAR(80) NOT NULL,
  success BOOLEAN NOT NULL, object_id UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_user_time_idx ON audit_events(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS auth_throttle (
  key_hash BYTEA PRIMARY KEY CHECK(octet_length(key_hash)=32), attempts INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0, window_started TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_allowed TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS throttle_updated_idx ON auth_throttle(updated_at);
CREATE TABLE IF NOT EXISTS device_pairings (
  token_hash BYTEA PRIMARY KEY CHECK(octet_length(token_hash)=32),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(120) NOT NULL, expires_at TIMESTAMPTZ NOT NULL
);
COMMIT;
