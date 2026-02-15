import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const db = getDb();

    if (req.method === 'GET') {
        try {
            const result = await db.query(
                `SELECT * FROM lab_pbm_senasa.authorizations ORDER BY created_at DESC LIMIT 100`
            );
            return res.json(result.rows);
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

            await db.query(
                `INSERT INTO lab_pbm_senasa.authorizations (
                    authorization_code,
                    transaction_id,
                    pharmacy_code,
                    pharmacy_name,
                    affiliate_document,
                    affiliate_name,
                    total_amount,
                    regulated_copay,
                    authorized_amount,
                    detail_json,
                    authorizer_email,
                    branch_code
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (authorization_code) DO NOTHING`,
                [
                    authData.authorization_code,
                    authData.transaction_id,
                    authData.pharmacy_code,
                    authData.pharmacy_name,
                    authData.affiliate_document,
                    authData.affiliate_name,
                    authData.total_amount,
                    authData.regulated_copay,
                    authData.authorized_amount,
                    authData.detail_json,
                    authData.authorizer_email,
                    authData.branch_code || null
                ]
            );

            return res.status(201).json({ message: 'Authorization saved successfully' });
        } catch (error) {
            console.error('Error saving authorization:', error);
            return res.status(500).json({ error: 'Failed to save authorization' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
