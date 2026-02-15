
import express from 'express';
import cors from 'cors';
import { PostgresDatabaseClient } from '../data/infrastructure/PostgresDatabaseClient.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'; // In production, move to .env

app.use(cors());
app.use(express.json());

const db = new PostgresDatabaseClient();

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await db.query<any>(
            `SELECT * FROM lab_pbm_senasa.users WHERE email = '${email}'`
        );

        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, email: user.email, name: user.full_name } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pharmacies/search', async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const searchTerm = `%${q}%`;
        const result = await db.query<any>(
            `SELECT code, name, principal_code, type 
             FROM lab_pbm_senasa.pharmacies 
             WHERE code::text ILIKE $1 
                OR name ILIKE $1 
                OR principal_code::text ILIKE $1 
                OR type ILIKE $1
             LIMIT 50`,
            [searchTerm]
        );
        res.json(result);
    } catch (error) {
        console.error('Pharmacy search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/medications/search', async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const searchTerm = `%${q}%`;
        const result = await db.query<any>(
            `SELECT code, name 
             FROM lab_pbm_senasa.medications 
             WHERE code::text ILIKE $1 
                OR name ILIKE $1
             LIMIT 50`,
            [searchTerm]
        );
        res.json(result);
    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to save a successful authorization
app.post('/api/authorizations', async (req, res) => {
    try {
        const authData = req.body;
        console.log('[DEBUG] Received POST /api/authorizations, code:', authData.authorization_code);

        // Validate required fields
        if (!authData.authorization_code || !authData.transaction_id || !authData.pharmacy_code) {
            return res.status(400).json({ error: 'Missing required fields for authorization record' });
        }

        await db.query(
            `INSERT INTO lab_pbm_senasa.authorizations (
                authorization_code,
                transaction_id,
                pharmacy_code,
                pharmacy_name,
                affiliate_document,
                affiliate_name,
                total_amount,
                regulated_copay,
                authorized_amount,
                detail_json,
                authorizer_email,
                branch_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (authorization_code) DO NOTHING`,
            [
                authData.authorization_code,
                authData.transaction_id,
                authData.pharmacy_code,
                authData.pharmacy_name,
                authData.affiliate_document,
                authData.affiliate_name,
                authData.total_amount,
                authData.regulated_copay,
                authData.authorized_amount,
                authData.detail_json,
                authData.authorizer_email,
                authData.branch_code || null
            ]
        );

        console.log(`Authorization saved: ${authData.authorization_code}`);
        res.status(201).json({ message: 'Authorization saved successfully' });
    } catch (error) {
        console.error('Error saving authorization:', error);
        res.status(500).json({ error: 'Failed to save authorization' });
    }
});

// Endpoint to list authorizations
app.get('/api/authorizations', async (_req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM lab_pbm_senasa.authorizations ORDER BY created_at DESC LIMIT 100`
        );
        res.json(result);
    } catch (error) {
        console.error('Error fetching authorizations:', error);
        res.status(500).json({ error: 'Failed to fetch authorizations' });
    }
});

app.post('/api/traces/register', async (req, res) => {
    try {
        const trace = req.body;

        // Basic validation
        if (!trace || !trace.user_email || !trace.pharmacy_code) {
            return res.status(400).json({ error: 'Missing required trace fields' });
        }

        // Insert into lab_pbm_senasa.authorization_traces
        await db.query(
            `INSERT INTO lab_pbm_senasa.authorization_traces (
                created_at,
                transaction_id,
                user_email,
                user_ip,
                action_type,
                response_code,
                duration_ms,
                pharmacy_code,
                branch_code,
                authorization_code,
                affiliate_document,
                affiliate_nss,
                affiliate_first_name,
                affiliate_last_name,
                affiliate_regimen,
                affiliate_status,
                payload_input,
                payload_output
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
                trace.created_at || new Date(),
                trace.transaction_id,
                trace.user_email,
                req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || null, // Robust IP extraction
                trace.action_type,
                trace.response_code,
                trace.duration_ms,
                trace.pharmacy_code,
                trace.branch_code,
                trace.authorization_code,
                trace.affiliate?.document,
                trace.affiliate?.nss,
                trace.affiliate?.first_name,
                trace.affiliate?.last_name,
                trace.affiliate?.regimen,
                trace.affiliate?.status,
                trace.payload_input,
                trace.payload_output
            ]
        );

        res.status(201).json({ message: 'Trace recorded successfully' });
    } catch (error) {
        console.error('Traceability log error:', error);
        console.error('Received trace data:', JSON.stringify(req.body, null, 2));
        // Do not return 500 to client to avoid disrupting UX for a log failure, 
        // or return 500 if strict. Usually 202 or 200/500 is fine.
        res.status(500).json({ error: 'Failed to log trace', details: (error as any).message });
    }
});

// Endpoint to void an authorization
app.post('/api/authorizations/:code/void', async (req, res) => {
    const { code } = req.params;
    const { motivo, voider_email, pharmacy_code } = req.body;

    if (!motivo || !voider_email || !pharmacy_code) {
        return res.status(400).json({ error: 'Motivo, voider_email, and pharmacy_code are required' });
    }

    try {
        // 1. Verify the authorization exists and is AUTHORIZED
        const authRecords = await db.query<any>(
            `SELECT * FROM lab_pbm_senasa.authorizations WHERE authorization_code = $1`,
            [code]
        );

        if (authRecords.length === 0) {
            return res.status(404).json({ error: 'Authorization not found' });
        }

        const authRecord = authRecords[0];
        if (authRecord.status !== 'AUTHORIZED') {
            return res.status(400).json({ error: 'Authorization is not in AUTHORIZED status' });
        }

        // 2. Authenticate with Unipago
        const SENASA_BASE_URL = process.env.VITE_SENASA_BASE_URL || '';
        const SENASA_USERNAME = process.env.VITE_SENASA_USERNAME || '';
        const SENASA_PASSWORD = process.env.VITE_SENASA_PASSWORD || '';

        const authResponse = await fetch(`${SENASA_BASE_URL}MedicamentosUnipago/Autenticar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: SENASA_USERNAME,
                password: SENASA_PASSWORD,
                grant_type: 'password',
            }),
        });

        if (!authResponse.ok) {
            console.error('Unipago auth failed:', authResponse.status);
            return res.status(502).json({ error: 'Failed to authenticate with Unipago' });
        }

        const authData = await authResponse.json() as { access_token: string };
        const token = authData.access_token;

        // 3. Call Unipago Anular API
        const anularResponse = await fetch(`${SENASA_BASE_URL}MedicamentosUnipago/api/Autorizacion/Anular`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                CodigoAutorizacion: Number(code),
                CodigoFarmacia: Number(pharmacy_code),
                Motivo: motivo,
            }),
        });

        const anularResult = await anularResponse.text();
        let anularJson: any;
        try {
            anularJson = JSON.parse(anularResult);
        } catch {
            anularJson = { raw: anularResult };
        }

        // Check for the exact success message in the response body
        const SUCCESS_MSG = 'La Autorización fue anulada exitosamente';
        if (anularJson?.MSG !== SUCCESS_MSG) {
            const errorMsg = anularJson?.MSG || anularJson?.raw || 'Respuesta inesperada del servicio';
            console.error('Unipago Anular failed:', anularResponse.status, anularResult);
            return res.status(502).json({
                error: errorMsg,
            });
        }

        // 4. Update the authorization record
        const voidedAt = new Date();
        await db.query(
            `UPDATE lab_pbm_senasa.authorizations
             SET status = 'VOIDED', voider_email = $1, voided_at = $2
             WHERE authorization_code = $3`,
            [voider_email, voidedAt, code]
        );

        // 5. Insert trace record (non-blocking)
        try {
            await db.query(
                `INSERT INTO lab_pbm_senasa.authorization_traces (
                    created_at, transaction_id, user_email, user_ip,
                    action_type, response_code, pharmacy_code, authorization_code,
                    affiliate_document, payload_input, payload_output
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    voidedAt,
                    authRecord.transaction_id,
                    voider_email,
                    req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || null,
                    'VOID',
                    anularResponse.status,
                    pharmacy_code,
                    code,
                    authRecord.affiliate_document,
                    JSON.stringify({ CodigoAutorizacion: Number(code), CodigoFarmacia: Number(pharmacy_code), Motivo: motivo }),
                    JSON.stringify(anularJson),
                ]
            );
        } catch (traceError) {
            console.error('Error inserting void trace (non-blocking):', traceError);
        }

        console.log(`Authorization voided: ${code} by ${voider_email}`);
        res.json({ message: 'Authorization voided successfully', result: anularJson });
    } catch (error) {
        console.error('Error voiding authorization:', error);
        res.status(500).json({ error: 'Failed to void authorization' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
