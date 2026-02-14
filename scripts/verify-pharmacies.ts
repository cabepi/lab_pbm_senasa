import { PostgresDatabaseClient } from "../src/data/infrastructure/PostgresDatabaseClient.ts";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Verifying pharmacy data...");
    const db = new PostgresDatabaseClient();

    try {
        const countResult = await db.query<{ count: string }>(
            "SELECT count(*) FROM lab_pbm_senasa.pharmacies"
        );

        const count = parseInt(countResult[0].count, 10);
        console.log(`Total pharmacies found: ${count}`);

        if (count === 955) {
            console.log(`✅ Verification successful: All ${count} records ingested.`);
        } else {
            console.error(`❌ Verification failed: Expected 955 records, found ${count}.`);
        }

        // Sample check
        const sample = await db.query(
            "SELECT * FROM lab_pbm_senasa.pharmacies LIMIT 5"
        );
        console.log("Sample data:", sample);

    } catch (error) {
        console.error("Verification error:", error);
    } finally {
        await db.close();
    }
}

main();
