-- Add branch_code column to authorizations table
ALTER TABLE lab_pbm_senasa.authorizations
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(50) NULL;
