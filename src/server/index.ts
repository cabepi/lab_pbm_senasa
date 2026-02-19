
import express from 'express';
import cors from 'cors';
import { PostgresDatabaseClient } from '../data/infrastructure/PostgresDatabaseClient.ts';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';
import multer from 'multer';
import { authenticateUser } from '../../api/_lib/services/loginService.js';
import { searchPharmacies } from '../../api/_lib/services/pharmacyService.js';
import { searchMedications } from '../../api/_lib/services/medicationService.js';
import { getTraces, registerTrace } from '../../api/_lib/services/traceService.js';
import { getAuthorizations, saveAuthorization } from '../../api/_lib/services/authorizationService.js';
import type { DbClient } from '../../api/_lib/services/authorizationService.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rawDb = new PostgresDatabaseClient();

// Adapter: PostgresDatabaseClient returns T[] but shared services expect { rows: T[] }
const db: DbClient = {
    query: async (text: string, params?: any[]) => {
        const rows = await rawDb.query(text, params);
        return { rows };
    }
};

// ... (other routes) ...

// Proxy for Unipago API to match Vercel Serverless Function behavior
app.use('/api/unipago', async (req, res) => {
    const SENASA_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

    // In app.use('/api/unipago'), req.url is relative to the mount point.
    const relativePath = req.url;
    const targetUrl = `${SENASA_BASE_URL}MedicamentosUnipago${relativePath}`;

    console.log(`[Local Proxy] Forwarding ${req.method} to ${targetUrl}`);

    try {
        const contentType = req.headers['content-type'] || 'application/json';

        // Forward headers
        const forwardedHeaders: Record<string, string> = {
            'Content-Type': contentType, // Preserve original content type
            'Accept': 'application/json',
        };

        if (req.headers.authorization) {
            forwardedHeaders['Authorization'] = req.headers.authorization as string;
        }

        let body: any;

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            if (contentType.includes('application/x-www-form-urlencoded')) {
                // serialized body for form data
                body = new URLSearchParams(req.body).toString();
            } else {
                // serialized body for json
                body = JSON.stringify(req.body);
            }
        }

        const fetchOptions: RequestInit = {
            method: req.method,
            headers: forwardedHeaders,
            body: body,
        };

        const response = await fetch(targetUrl, fetchOptions);
        console.log(`[Local Proxy] Upstream response: ${response.status}`);

        // Forward response headers
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');

        const text = await response.text();

        try {
            const json = JSON.parse(text);
            res.status(response.status).json(json);
        } catch {
            res.status(response.status).send(text);
        }

    } catch (error: any) {
        console.error('[Local Proxy Error]', error);
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await authenticateUser(db, email, password);

        if (!result.success) {
            return res.status(401).json({ error: result.error });
        }

        res.json({ token: result.token, user: result.user });
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
        const rows = await searchPharmacies(db, q);
        res.json(rows);
    } catch (error) {
        console.error('Pharmacy search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Multer setup for in-memory file handling
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload-prescription', upload.single('file'), async (req, res) => {
    const { authorization_code } = req.body;
    const file = req.file;

    if (!file || !authorization_code) {
        return res.status(400).json({ error: 'File and authorization_code are required' });
    }

    try {
        console.log(`[Upload] Uploading file ${file.originalname} for auth ${authorization_code}`);

        const filename = file.originalname;
        const blobPath = `medical_prescriptions/${authorization_code}/${filename}`;

        const blob = await put(blobPath, file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`[Upload] Success: ${blob.url}`);
        res.json({ url: blob.url });
    } catch (error: any) {
        console.error('[Upload Error]', error);
        res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
});

app.get('/api/medications/search', async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const rows = await searchMedications(db, q);
        res.json(rows);
    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to fetch traces
app.get('/api/traces', async (_req, res) => {
    try {
        const rows = await getTraces(db);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching traces:', error);
        res.status(500).json({ error: 'Failed to fetch traces' });
    }
});

// Endpoint to save a successful authorization
app.post('/api/authorizations', async (req, res) => {
    try {
        const authData = req.body;
        console.log('[DEBUG] Received POST /api/authorizations, code:', authData.authorization_code);

        if (!authData.authorization_code || !authData.transaction_id || !authData.pharmacy_code) {
            return res.status(400).json({ error: 'Missing required fields for authorization record' });
        }

        await saveAuthorization(db, authData);

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
        const rows = await getAuthorizations(db);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching authorizations:', error);
        res.status(500).json({ error: 'Failed to fetch authorizations' });
    }
});

app.post('/api/traces/register', async (req, res) => {
    try {
        const trace = req.body;

        if (!trace || !trace.user_email || !trace.pharmacy_code) {
            return res.status(400).json({ error: 'Missing required trace fields' });
        }

        const userIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || null;
        await registerTrace(db, trace, userIp);

        res.status(201).json({ message: 'Trace recorded successfully' });
    } catch (error) {
        console.error('Traceability log error:', error);
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
        const authResult = await db.query(
            `SELECT * FROM lab_pbm_senasa.authorizations WHERE authorization_code = $1`,
            [code]
        );

        if (authResult.rows.length === 0) {
            return res.status(404).json({ error: 'Authorization not found' });
        }

        const authRecord = authResult.rows[0];
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
             SET status = 'VOIDED', voider_email = $1, voided_at = $2, void_reason = $3
             WHERE authorization_code = $4`,
            [voider_email, voidedAt, motivo, code]
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


// Proxy for Unipago API to match Vercel Serverless Function behavior
app.use('/api/unipago', async (req, res) => {
    const SENASA_BASE_URL = process.env.VITE_SENASA_BASE_URL || 'http://186.148.93.132/';

    // In app.use('/api/unipago'), req.url is relative to the mount point.
    // e.g. /api/unipago/api/Afiliado/Consultar -> req.url = /api/Afiliado/Consultar
    const relativePath = req.url;
    const targetUrl = `${SENASA_BASE_URL}MedicamentosUnipago${relativePath}`;

    console.log(`[Local Proxy] Forwarding ${req.method} to ${targetUrl}`);

    try {
        // Forward headers, filtering potentially problematic ones
        const forwardedHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (req.headers.authorization) {
            forwardedHeaders['Authorization'] = req.headers.authorization as string;
        }

        const fetchOptions: RequestInit = {
            method: req.method,
            headers: forwardedHeaders,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        };

        const response = await fetch(targetUrl, fetchOptions);
        console.log(`[Local Proxy] Upstream response: ${response.status}`);

        // Forward response headers
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');

        const text = await response.text();

        try {
            const json = JSON.parse(text);
            res.status(response.status).json(json);
        } catch {
            res.status(response.status).send(text);
        }

    } catch (error: any) {
        console.error('[Local Proxy Error]', error);
        res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
