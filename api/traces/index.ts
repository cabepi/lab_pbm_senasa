import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getTraces } from '../_lib/services/traceService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getDb();
        const rows = await getTraces(db);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching traces:', error);
        res.status(500).json({ error: 'Failed to fetch traces' });
    }
}
