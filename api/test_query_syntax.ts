import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is missing');
        }

        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();

        // Test .query() syntax logic (native to pg)
        const result = await client.query('SELECT $1::int as val', [123]);
        await client.end();

        res.json({
            status: 'ok',
            val: result.rows[0].val,
            message: 'pg client query() works!'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
