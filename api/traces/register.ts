import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../_db';

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
                req.headers['x-forwarded-for'] || null,
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
        res.status(500).json({ error: 'Failed to log trace', details: (error as any).message });
    }
}
