import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getDb();

        // Fetch last 500 traces. Join with authorizations to get the code if missing in traces.
        const result = await db.query(
            `SELECT 
                t.*,
                COALESCE(t.authorization_code, a.authorization_code) as authorization_code
             FROM lab_pbm_senasa.authorization_traces t
             LEFT JOIN lab_pbm_senasa.authorizations a ON t.transaction_id = a.transaction_id
             ORDER BY t.created_at DESC 
             LIMIT 500`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching traces:', error);
        res.status(500).json({ error: 'Failed to fetch traces' });
    }
}
