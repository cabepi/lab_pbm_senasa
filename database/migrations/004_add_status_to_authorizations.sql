
-- Add status column with default 'AUTHORIZED' and CHECK constraint
ALTER TABLE lab_pbm_senasa.authorizations
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'AUTHORIZED';

-- Add CHECK constraint to only allow AUTHORIZED or VOIDED
ALTER TABLE lab_pbm_senasa.authorizations
ADD CONSTRAINT chk_authorizations_status CHECK (status IN ('AUTHORIZED', 'VOIDED'));
