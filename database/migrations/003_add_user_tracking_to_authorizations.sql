
-- Add user tracking columns to authorizations table
ALTER TABLE lab_pbm_senasa.authorizations
ADD COLUMN IF NOT EXISTS authorizer_email VARCHAR(255) NOT NULL DEFAULT 'system@senasa.gob.do',
ADD COLUMN IF NOT EXISTS voider_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP WITH TIME ZONE;

-- Remove default after adding column to ensure future inserts provide it, 
-- or keep it if we want a fallback. For now, we remove the default to enforce explicit providing if desired,
-- but having a default helps with existing rows.
ALTER TABLE lab_pbm_senasa.authorizations ALTER COLUMN authorizer_email DROP DEFAULT;
