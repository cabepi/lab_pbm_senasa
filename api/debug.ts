import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        // 1. Test Bcrypt Import
        let bcrypt;
        try {
            const bcryptModule = await import('bcryptjs');
            bcrypt = bcryptModule.default || bcryptModule;
            debugInfo.steps.push('Imported bcryptjs');
        } catch (e: any) {
            debugInfo.bcryptError = e.message;
            throw new Error(`Failed to import bcryptjs: ${e.message}`);
        }

        // 2. Test Bcrypt Execution
        const hash = await bcrypt.hash('test', 1);
        debugInfo.steps.push('Bcrypt hash works');
        debugInfo.bcryptSample = hash;

        // 3. Test DB Import
        let getDb;
        try {
            // Use relative path for dynamic import
            const dbModule = await import('./_db.js');
            getDb = dbModule.getDb;
            debugInfo.steps.push('Imported _db');
        } catch (e: any) {
            debugInfo.dbImportError = e.message;
            // Try without .js extension if failed
            try {
                const dbModule = await import('./_db');
                getDb = dbModule.getDb;
                debugInfo.steps.push('Imported _db (no extension)');
                debugInfo.dbImportError = null; // clear error
            } catch (e2: any) {
                throw new Error(`Failed to import _db: ${e.message} / ${e2.message}`);
            }
        }

        // 4. Test DB Connection
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
