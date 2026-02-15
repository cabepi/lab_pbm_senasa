import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const debugInfo: any = {
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_DB_URL: !!process.env.DATABASE_URL,
            HAS_JWT: !!process.env.JWT_SECRET,
            DB_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'MISSING'
        },
        steps: ['Handler started']
    };

    try {
        // 1. Test Bcrypt Execution
        debugInfo.steps.push('Testing bcrypt...');
        const hash = await bcrypt.hash('test', 1);
        debugInfo.steps.push('Bcrypt hash works');
        debugInfo.bcryptSample = hash;

        // 2. Test DB Connection
        debugInfo.steps.push('Testing DB connection (via api/_lib/db)...');
        const db = getDb();
        debugInfo.steps.push('DB Client created');

        // Execute query
        const result = await db.query('SELECT NOW() as time');
        debugInfo.steps.push('DB Query executed');
        // Our wrapper returns { rows: [...] }
        debugInfo.dbTime = result.rows[0].time;

        res.json({ status: 'ok', debugInfo });
    } catch (error: any) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
            stack: error.stack,
            debugInfo
        });
    }
}
