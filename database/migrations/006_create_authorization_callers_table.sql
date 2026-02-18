CREATE TABLE IF NOT EXISTS lab_pbm_senasa.authorization_callers (
    id SERIAL PRIMARY KEY,
    authorization_code VARCHAR(50) NOT NULL,
    caller_name VARCHAR(255) NOT NULL,
    caller_document VARCHAR(50) NOT NULL,
    caller_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_authorization_code FOREIGN KEY (authorization_code) REFERENCES lab_pbm_senasa.authorizations(authorization_code)
);

CREATE INDEX IF NOT EXISTS idx_authorization_callers_auth_code ON lab_pbm_senasa.authorization_callers(authorization_code);
