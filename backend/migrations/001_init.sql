-- Data base schema --

-- gen random uuid for generating UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- enum customized
CREATE TYPE app_env AS ENUM ('development', 'production');
CREATE TYPE device_type AS ENUM ('grid', 'solar');
CREATE TYPE device_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE txn_status AS ENUM ('pending', 'success', 'failed', 'reversed');
CREATE TYPE payment_channel AS ENUM ('ussd', 'web', 'diaspora');
CREATE TYPE alert_type AS ENUM ('low_balance', 'depletion_soon', 'payment_due', 'top_up_success' );
CREATE TYPE alert_channel AS ENUM ('sms', 'ussd', 'push');
CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE reading_trigger AS ENUM ('scheduled', 'top_up', 'alert_check');
CREATE TYPE kyc_level AS ENUM ('phone_only', 'name_added', 'full_kyc');


-- Vendor Schema --
CREATE TABLE vendors (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name           VARCHAR(200) NOT NULL,
    owner_name              VARCHAR(200) NOT NULL,
    phone                   VARCHAR(15) UNIQUE NOT NULL,
    email                   VARCHAR(200) UNIQUE,
    cac_number              VARCHAR(50),

--commission/txn - 1.5%
    commission_bp           SMALLINT NOT NULL DEFAULT 150,
    is_approved             BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- User Schema --
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone                   VARCHAR(15) UNIQUE NOT NULL,
    pin_hash                TEXT NOT NULL,
    full_name               VARCHAR(200),
    email                   VARCHAR(200) UNIQUE,
    state                   VARCHAR(200),
    lga                     VARCHAR(200),
    address                 TEXT,

    ---vendor that registered the user
    vendor_id               UUID REFERENCES vendors(id) ON DELETE SET NULL,
    is_verified             BOOLEAN NOT NULL DEFAULT false,
    kyc_level               kyc_level NOT NULL DEFAULT 'phone_only',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


---device schema {parent - grid & solar } --
CREATE TABLE devices (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vendor_id               UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    device_name             VARCHAR(200) NOT NULL,
    device_type             device_type NOT NULL,
    status                  device_status NOT NULL DEFAULT 'active',
    state                   VARCHAR(100),
    lga                     VARCHAR(100),
    address                 TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--grid meter{child device}--
CREATE TABLE grid_meters (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id               UUID UNIQUE NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    meter_number            VARCHAR(20) UNIQUE NOT NULL,
    tarrif_kobo_per_kwh     BIGINT NOT NULL,
    units_balance           DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    last_vend_at            TIMESTAMPTZ
);


--- solar device {child device} ---
CREATE TABLE solar_kits (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id               UUID UNIQUE NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    kits_serial_number      VARCHAR(50) UNIQUE NOT NULL,
    battery_percent         SMALLINT NOT NULL DEFAULT 0 CHECK (battery_percent >= 0 AND battery_percent <= 100),
    daily_rate_kobo         BIGINT NOT NULL, --RATE IN KOBO--
    is_active               BOOLEAN NOT NULL DEFAULT false,
    next_payment_due        TIMESTAMPTZ,
    activated_at            TIMESTAMPTZ
);


--- Txn schema ---
CREATE TABLE transactions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    device_id               UUID NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
    amount_kobo             BIGINT NOT NULL CHECK (amount_kobo > 0),
    units_purchased         DECIMAL(12, 4) NOT NULL,
    channel                 payment_channel NOT NULL,
    status                  txn_status NOT NULL DEFAULT 'pending',
    interswitch_ref         VARCHAR(100) UNIQUE,
    token_id                UUID,
    initiated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ
);


--token schema--
CREATE TABLE tokens (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id          UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    device_id               UUID NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
    token_code              VARCHAR(20) UNIQUE NOT NULL, --20 DIGIT CODE FOR TOKEN
    units                   DECIMAL(12, 4) NOT NULL,
    is_used                 BOOLEAN NOT NULL DEFAULT false,
    used_at                 TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_token
    FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE SET NULL;

--- consumption log schema ---
CREATE TABLE consumption_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id               UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    units_remaining         DECIMAL(12, 4) NOT NULL, ---kwh - grid and % for solar
    previous_reading        DECIMAL(12, 4),
    consumption_rate        DECIMAL(10, 6), --calculated as units/hr at the inserted time *note
    reading_trigger         reading_trigger NOT NULL DEFAULT 'scheduled',
    recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--alerts schema --
CREATE TABLE alerts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id         UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    alert_type        alert_type NOT NULL,
    message           TEXT NOT NULL,
    sent_via          alert_channel NOT NULL,
    status            alert_status NOT NULL DEFAULT 'pending',
    scheduled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


--- Index schema - for speedup of queries---
-- Users INDEX —-- query phone on every login
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_vendor_id ON users(vendor_id);

-- Devices index — query by both our user and vendor
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_vendor_id ON devices(vendor_id);
CREATE INDEX idx_devices_type ON devices(device_type);

-- Txn Index — txn dashboard preview user by their status
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_device_id ON transactions(device_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_initiated_at ON transactions(initiated_at DESC);

-- Tokens Index--— must validate on every meter entry
CREATE INDEX idx_tokens_token_code ON tokens(token_code);
CREATE INDEX idx_tokens_device_id ON tokens(device_id);

-- Consumption logs Index--— predict the logs queries by device + time
CREATE INDEX idx_consumption_device_id ON consumption_logs(device_id);
CREATE INDEX idx_consumption_recorded_at ON consumption_logs(recorded_at DESC);

-- Alerts Index — query user by status
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);

--Auto uodate and updated at {auto updates updated_at on every row}--
---so manually set updated_at in codebase---
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
