import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_add_branch_code_to_authorizations.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log('Running migration 005: Add branch_code to authorizations...');
        await pool.query(sql);
        console.log('Migration 005 completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
