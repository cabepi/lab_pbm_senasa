import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';

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
        const searchTerm = String(q).trim();
        const isNumeric = /^\d+$/.test(searchTerm);

        let query = '';
        let params: any[] = [];

        if (isNumeric) {
            // Exact or prefix match for code
            query = `SELECT code, name, price FROM lab_pbm_senasa.medications WHERE code::text LIKE $1 LIMIT 50`;
            params = [`${searchTerm}%`];
        } else {
            // Fuzzy match for name
            query = `SELECT code, name, price FROM lab_pbm_senasa.medications WHERE name ILIKE $1 LIMIT 50`;
            params = [`%${searchTerm}%`];
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
