import { PostgresDatabaseClient } from "../src/data/infrastructure/PostgresDatabaseClient.ts";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Starting database migration...");

    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL is not defined in environment variables.");
        process.exit(1);
    }

    const db = new PostgresDatabaseClient();

    // Directory containing the SQL scripts
    const scriptsDir = path.join(__dirname, "../database/scripts");

    if (!fs.existsSync(scriptsDir)) {
        console.error(`Scripts directory not found: ${scriptsDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(scriptsDir).sort(); // Ensure execution order

    try {
        for (const file of files) {
            if (file.endsWith(".sql")) {
                console.log(`Executing script: ${file}`);
                const filePath = path.join(scriptsDir, file);
                const query = fs.readFileSync(filePath, "utf-8");

                await db.query(query);
                console.log(`Successfully executed: ${file}`);
            }
        }
        console.log("All scripts executed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await db.close();
    }
}

main();
