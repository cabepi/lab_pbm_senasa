
import { PostgresDatabaseClient } from "../src/data/infrastructure/PostgresDatabaseClient.ts";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Verifying seeded users...");
    const db = new PostgresDatabaseClient();

    try {
        const users = await db.query<{ full_name: string; email: string }>(
            "SELECT full_name, email FROM lab_pbm_senasa.users"
        );

        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.full_name} (${u.email})`));

        const expectedEmails = ["fmarinez@unipago.com.do", "cbetancur@unipago.com.do"];
        const foundEmails = users.map(u => u.email);

        const allFound = expectedEmails.every(email => foundEmails.includes(email));

        if (allFound) {
            console.log("✅ Verification successful: All expected users found.");
        } else {
            console.error("❌ Verification failed: Missing some expected users.");
        }

    } catch (error) {
        console.error("Verification error:", error);
    } finally {
        await db.close();
    }
}

main();
