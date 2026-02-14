-- Seed initial users
-- Generated on 2026-02-14T15:02:04.256Z

INSERT INTO lab_pbm_senasa.users (full_name, email, password_hash)
VALUES ('Francis Marinez', 'fmarinez@unipago.com.do', '$2b$10$Y./WsWgz8boVIkKEACz1TumuMtn8y7mOQ5AkuUH1sGfWaFBPrVykW')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

INSERT INTO lab_pbm_senasa.users (full_name, email, password_hash)
VALUES ('Carlos Betancur', 'cbetancur@unipago.com.do', '$2b$10$Y./WsWgz8boVIkKEACz1TumuMtn8y7mOQ5AkuUH1sGfWaFBPrVykW')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

