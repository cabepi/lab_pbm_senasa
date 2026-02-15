import { neon } from '@neondatabase/serverless';

export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }
    // Force cast to any to avoid "TemplateStringsArray" type mismatch if TS definitions are acting up
    const sql = neon(process.env.DATABASE_URL as any);
    return {
        query: async (text: string, params?: any[]) => {
            console.log('Executing query:', text);
            try {
                // Force cast to any to allow calling as a function with string
                const result = await (sql as any)(text, params || []);
                return { rows: result as any[] };
            } catch (err) {
                console.error('Database query failed:', err);
                throw err;
            }
        }
    };
}
