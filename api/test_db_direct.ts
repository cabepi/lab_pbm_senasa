import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is missing');
        }

        const sql = neon(process.env.DATABASE_URL);
        // Use the simplest possible query
        const result = await sql`SELECT 1 as val`;

        res.json({
            status: 'ok',
            val: result[0].val,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
