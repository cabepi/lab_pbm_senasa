
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const migrate = async () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false, // For local/dev environments
        },
    });

    try {
        const sqlPath = path.join(__dirname, '../database/migrations/003_add_user_tracking_to_authorizations.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration:', sqlPath);
        await pool.query(sql);
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

migrate();
