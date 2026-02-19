import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db.js';
import { getAuthorizations, saveAuthorization } from '../_lib/services/authorizationService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const db = getDb();

    if (req.method === 'GET') {
        try {
            const rows = await getAuthorizations(db);
            return res.json(rows);
        } catch (error) {
            console.error('Error fetching authorizations:', error);
            return res.status(500).json({ error: 'Failed to fetch authorizations' });
        }
    }

    if (req.method === 'POST') {
        try {
            const authData = req.body;

            if (!authData.authorization_code || !authData.transaction_id || !authData.pharmacy_code) {
                return res.status(400).json({ error: 'Missing required fields for authorization record' });
            }

            await saveAuthorization(db, authData);

            return res.status(201).json({ message: 'Authorization saved successfully' });
        } catch (error) {
            console.error('Error saving authorization:', error);
            return res.status(500).json({ error: 'Failed to save authorization' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
