import { neon } from '@neondatabase/serverless';

export function getDb() {
    const sql = neon(process.env.DATABASE_URL!);
    return {
        query: async (text: string, params?: any[]) => {
            const result = await sql(text, params || []);
            return { rows: result as any[] };
        }
    };
}
