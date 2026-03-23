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
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name   VARCHAR(200) NOT NULL,
    owner_name      VARCHAR(200) NOT NULL,
    phone           VARCHAR(15) UNIQUE NOT NULL,
    email           VARCHAR(200) UNIQUE,
    cac_number      VARCHAR(50),

--commission/txn - 1.5%
    commission_bp   SMALLINT NOT NULL DEFAULT 150,
    is_approved     BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Schema --
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) UNIQUE NOT NULL,
    pin_hash        TEXT NOT NULL,
    full_name       VARCHAR(200),
    email           VARCHAR(200) UNIQUE,
    state           VARCHAR(200),
    lga             VARCHAR(200),
    address         TEXT,

    ---vendor that registered the user
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    kyc_level       kyc_level NOT NULL DEFAULT 'phone_only',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

---device schema --