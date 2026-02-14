
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PostgresDatabaseClient } from '../src/data/infrastructure/PostgresDatabaseClient.ts';

// Load env vars
dotenv.config();

const run = async () => {
    const db = new PostgresDatabaseClient();
    try {
        console.log("Running migration...");
        const migrationPath = path.resolve(process.cwd(), 'database/migrations/001_create_traceability_table.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log(`Executing SQL from ${migrationPath}...`);
        await db.query(sql);

        console.log("Migration executed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await db.close();
    }
};

run();
