ALTER TABLE lab_pbm_senasa.prescriptions
ADD COLUMN IF NOT EXISTS file_path VARCHAR(255);
