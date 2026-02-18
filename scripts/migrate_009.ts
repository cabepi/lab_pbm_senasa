
import { PostgresDatabaseClient } from '../src/data/infrastructure/PostgresDatabaseClient.ts';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const runMigration = async () => {
    console.log('Running migration 009...');
    const db = new PostgresDatabaseClient();
    try {
        await db.query(`ALTER TABLE lab_pbm_senasa.prescriptions ADD COLUMN prescription_type VARCHAR(50);`);
        console.log('Migration 009 completed successfully.');
    } catch (error: any) {
        if (error.code === '42701') { // duplicate_column
            console.log('Column prescription_type already exists. Skipping.');
        } else {
            console.error('Migration 009 failed:', error);
            process.exit(1);
        }
    } finally {
        // We need to close the pool to exit the process
        // But the client doesn't expose close() publicly in the interface maybe?
        // Let's check the file content again. It has close().
        // Note: The class exports close() method.
        // wait, I need to cast or fix if interface hides it.
        // actually looking at the file it has public close().
        // However, I need to import the class correctly.
        process.exit(0);
    }
};

runMigration();
