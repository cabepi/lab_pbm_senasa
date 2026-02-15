import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../src/lib/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const db = getDb();
        const result = await db.query('SELECT 1 as val');

        res.json({
            status: 'ok',
            val: result.rows[0].val,
            message: 'Shared lib works!'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
