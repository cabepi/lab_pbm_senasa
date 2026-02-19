import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { registerTrace } from '../_lib/services/traceService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getDb();
        const trace = req.body;

        if (!trace || !trace.user_email || !trace.pharmacy_code) {
            return res.status(400).json({ error: 'Missing required trace fields' });
        }

        const userIp = (req.headers['x-forwarded-for'] as string) || null;
        await registerTrace(db, trace, userIp);

        res.status(201).json({ message: 'Trace recorded successfully' });
    } catch (error) {
        console.error('Traceability log error:', error);
        res.status(500).json({ error: 'Failed to log trace', details: (error as any).message });
    }
}
