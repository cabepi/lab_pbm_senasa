import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { searchMedications } from '../_lib/services/medicationService.js';

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
        const rows = await searchMedications(db, q);
        res.json(rows);
    } catch (error) {
        console.error('Medication search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
