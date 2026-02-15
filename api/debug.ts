import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Inline getDb to avoid import issues
function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }
    const sql = neon(process.env.DATABASE_URL as any);
    return {
        query: async (text: string, params?: any[]) => {
            console.log('Executing query:', text);
            try {
                const result = await (sql as any)(text, params || []);
                return { rows: result as any[] };
            } catch (err) {
                console.error('Database query failed:', err);
                throw err;
            }
        }
    };
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const debugInfo: any = {
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_DB_URL: !!process.env.DATABASE_URL,
            DB_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'MISSING'
        },
        steps: ['Handler started']
    };

    try {
        // Test DB Connection
        debugInfo.steps.push('Testing DB connection...');
        const db = getDb();
        debugInfo.steps.push('DB Client created');

        const result = await db.query('SELECT NOW() as time');
        debugInfo.steps.push('DB Query executed');
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
