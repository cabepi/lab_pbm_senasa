-- Truncate existing data to clean table
TRUNCATE TABLE lab_pbm_senasa.medications;

-- Drop existing Primary Key (assuming it was on 'code')
ALTER TABLE lab_pbm_senasa.medications DROP CONSTRAINT IF EXISTS medications_pkey;

-- Drop 'code' uniqueness if it exists separately (often PK implies unique, but just in case)
ALTER TABLE lab_pbm_senasa.medications DROP CONSTRAINT IF EXISTS medications_code_key;

-- Add new SERIAL ID column and make it the Primary Key
ALTER TABLE lab_pbm_senasa.medications ADD COLUMN id SERIAL PRIMARY KEY;

-- Ensure 'code' is still present but not unique (it usually is equivalent to 'Simon' in JSON)
-- We can add an index for performance on lookups
CREATE INDEX IF NOT EXISTS idx_medications_code ON lab_pbm_senasa.medications(code);
