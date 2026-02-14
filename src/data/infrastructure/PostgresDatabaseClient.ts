import { Pool, type PoolClient } from "pg";
import type { DatabaseClient } from "../../domain/repositories/DatabaseClient";

export class PostgresDatabaseClient implements DatabaseClient {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        });

        // Error handling for idle clients
        this.pool.on("error", (err) => {
            console.error("Unexpected error on idle client", err);
            // Don't exit process, just log
        });
    }

    async query<T>(sql: string, params?: any[]): Promise<T[]> {
        const client: PoolClient = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
