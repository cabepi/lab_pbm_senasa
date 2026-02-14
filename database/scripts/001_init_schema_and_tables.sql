-- Create schema
CREATE SCHEMA IF NOT EXISTS lab_pbm_senasa;

-- Create users table
CREATE TABLE IF NOT EXISTS lab_pbm_senasa.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Create pharmacies table
CREATE TABLE IF NOT EXISTS lab_pbm_senasa.pharmacies (
    code INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    principal_code INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    PRIMARY KEY (code, principal_code)
);
