import { Pool } from 'pg';

let pool: Pool;

export function getDb() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 5,
        });
    }
    return pool;
}
