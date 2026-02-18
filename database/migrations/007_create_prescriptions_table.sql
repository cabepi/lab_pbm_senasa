CREATE TABLE IF NOT EXISTS lab_pbm_senasa.prescriptions (
    id SERIAL PRIMARY KEY,
    authorization_code VARCHAR(50) NOT NULL,
    prescriber_name VARCHAR(255),
    prescription_date DATE,
    diagnosis VARCHAR(255),
    is_chronic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_authorization
        FOREIGN KEY (authorization_code)
        REFERENCES lab_pbm_senasa.authorizations(authorization_code)
        ON DELETE CASCADE
);

CREATE INDEX idx_prescriptions_auth_code ON lab_pbm_senasa.prescriptions(authorization_code);
