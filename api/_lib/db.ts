import { Pool } from 'pg';

// Use a global variable to cache the pool across invocations in serverless environment
let pool: Pool | undefined;

export function getDb() {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }

        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }, // Necessary for Neon/Vercel
            max: 1 // Limit max connections per lambda 
        });
    }

    return {
        query: async (text: string, params?: any[]) => {
            console.log('Executing query:', text);
            try {
                const result = await pool!.query(text, params || []);
                return { rows: result.rows };
            } catch (err) {
                console.error('Database query failed:', err);
                throw err;
            }
        }
    };
}
