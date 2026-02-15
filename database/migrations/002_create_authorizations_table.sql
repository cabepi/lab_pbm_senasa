
-- Create authorizations table to store successful authorizations
-- This table is designed to store the full detail of an approved authorization
CREATE TABLE IF NOT EXISTS lab_pbm_senasa.authorizations (
    authorization_code VARCHAR(50) PRIMARY KEY, -- CodigoAutorizacion from response
    transaction_id UUID NOT NULL, -- Link to the trace
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Pharmacy Context
    pharmacy_code VARCHAR(50) NOT NULL,
    pharmacy_name VARCHAR(255),
    
    -- Affiliate Context
    affiliate_document VARCHAR(20) NOT NULL,
    affiliate_name VARCHAR(255),
    
    -- Financials
    total_amount DECIMAL(10, 2) NOT NULL,
    regulated_copay DECIMAL(10, 2) NOT NULL,
    authorized_amount DECIMAL(10, 2) NOT NULL,
    
    -- Full JSON Detail
    detail_json JSONB NOT NULL
);

-- Index for fast lookup by affiliate document
CREATE INDEX IF NOT EXISTS idx_authorizations_affiliate_document ON lab_pbm_senasa.authorizations(affiliate_document);
-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_authorizations_created_at ON lab_pbm_senasa.authorizations(created_at DESC);
