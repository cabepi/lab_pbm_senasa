-- Add price column to medications table
ALTER TABLE lab_pbm_senasa.medications
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- Add comment for documentation
COMMENT ON COLUMN lab_pbm_senasa.medications.price IS 'Unit price of the medication';
