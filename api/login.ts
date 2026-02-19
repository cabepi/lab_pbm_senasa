import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db.js';
import { authenticateUser } from './_lib/services/loginService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const db = getDb();
        const result = await authenticateUser(db, email, password);

        if (!result.success) {
            return res.status(401).json({ error: result.error });
        }

        res.json({ token: result.token, user: result.user });
    } catch (error: any) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
