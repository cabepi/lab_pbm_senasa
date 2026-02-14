-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS lab_pbm_senasa;

-- Drop old table if exists (during dev transition)
DROP TABLE IF EXISTS lab_pbm_senasa.trazabilidad_autorizaciones;

CREATE TABLE IF NOT EXISTS lab_pbm_senasa.authorization_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id UUID, -- Groups related actions (Validation -> Authorization)
    
    -- 1. System Audit
    user_email VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45),
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('VALIDATION', 'AUTHORIZATION')),
    response_code INTEGER,
    duration_ms INTEGER,
    
    -- 2. Provider Context
    pharmacy_code VARCHAR(50) NOT NULL,
    branch_code VARCHAR(50),
    authorization_code VARCHAR(50),
    
    -- 3. Affiliate Snapshot
    affiliate_document VARCHAR(20) NOT NULL,
    affiliate_nss VARCHAR(20),
    affiliate_first_name VARCHAR(100),
    affiliate_last_name VARCHAR(100),
    affiliate_regimen VARCHAR(50),
    affiliate_status VARCHAR(50),
    
    -- 4. Full Payloads
    payload_input JSONB NOT NULL,
    payload_output JSONB NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_traces_created_at ON lab_pbm_senasa.authorization_traces(created_at);
CREATE INDEX IF NOT EXISTS idx_traces_affiliate_doc ON lab_pbm_senasa.authorization_traces(affiliate_document);
CREATE INDEX IF NOT EXISTS idx_traces_affiliate_nss ON lab_pbm_senasa.authorization_traces(affiliate_nss);
CREATE INDEX IF NOT EXISTS idx_traces_auth_code ON lab_pbm_senasa.authorization_traces(authorization_code);
CREATE INDEX IF NOT EXISTS idx_traces_user_email ON lab_pbm_senasa.authorization_traces(user_email);
