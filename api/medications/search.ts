import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const db = getDb();
        const searchTerm = `%${q}%`;
        const result = await db.query(
            `SELECT code, name FROM lab_pbm_senasa.medications
             WHERE code ILIKE $1 OR name ILIKE $1
             ORDER BY name LIMIT 50`,
            [searchTerm]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
