
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
