-- Data base schema --

-- gen random uuid for generating UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- enum customized
CREATE TYPE app_env AS ENUM ('development', 'production');
CREATE TYPE device_type AS ENUM ('grid', 'solar');
CREATE TYPE device_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE txn_status AS ENUM ('pending', 'production');
CREATE TYPE app_env AS ENUM ('development', 'production');
CREATE TYPE app_env AS ENUM ('development', 'production');
CREATE TYPE app_env AS ENUM ('development', 'production');
CREATE TYPE app_env AS ENUM ('development', 'production');