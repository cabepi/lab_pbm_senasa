import dotenv from 'dotenv';
import { PostgresDatabaseClient } from '../src/data/infrastructure/PostgresDatabaseClient.ts';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function migrate() {
    const db = new PostgresDatabaseClient();
    try {
        const migrationPath = path.join(process.cwd(), 'database/migrations/008_add_file_path_to_prescriptions.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration:', migrationPath);
        await db.query(sql);
        console.log('Migration applied successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await db.query('SELECT 1'); // Keep alive check or just exit
        process.exit(0);
    }
}

migrate();
