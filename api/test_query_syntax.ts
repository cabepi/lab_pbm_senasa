import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is missing');
        }

        const sql = neon(process.env.DATABASE_URL);

        // Test the .query() syntax logic
        // The error message said: use sql.query("SELECT $1", [value], options)
        // We need to cast to any because TS definitions might be outdated or strict
        const result = await (sql as any).query('SELECT $1::int as val', [123]);

        res.json({
            status: 'ok',
            val: result[0].val,
            message: 'query() syntax works!'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
