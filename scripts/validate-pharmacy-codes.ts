import { PostgresDatabaseClient } from "../src/data/infrastructure/PostgresDatabaseClient.ts";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODES_FILE = path.join(__dirname, "../database/codes_to_validate.txt");

async function main() {
    console.log("Validating pharmacy codes...");

    if (!fs.existsSync(CODES_FILE)) {
        console.error(`Codes file not found: ${CODES_FILE}`);
        process.exit(1);
    }

    // Read codes from file
    const fileContent = fs.readFileSync(CODES_FILE, "utf-8");
    const inputCodes = fileContent
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0 && !isNaN(parseInt(line, 10)))
        .map(line => parseInt(line, 10));

    console.log(`Loaded ${inputCodes.length} codes from file.`);

    const db = new PostgresDatabaseClient();

    try {
        // Fetch existing codes from DB
        // We check against 'code' column.
        const result = await db.query<{ code: number }>(
            "SELECT code FROM lab_pbm_senasa.pharmacies"
        );

        const existingCodes = new Set(result.map(row => row.code));
        const missingCodes: number[] = [];

        for (const code of inputCodes) {
            if (!existingCodes.has(code)) {
                missingCodes.push(code);
            }
        }

        if (missingCodes.length === 0) {
            console.log("✅ All provided codes exist in the database.");
        } else {
            console.log(`❌ Found ${missingCodes.length} missing codes.`);
            console.log("Missing Codes:");
            missingCodes.forEach(c => console.log(c));
        }

    } catch (error) {
        console.error("Error validating codes:", error);
    } finally {
        await db.close();
    }
}

main();
