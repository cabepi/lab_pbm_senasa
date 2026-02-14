import { PostgresDatabaseClient } from "../src/data/infrastructure/PostgresDatabaseClient.ts";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
    console.log("Testing database connection...");

    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL is not defined in environment variables.");
        process.exit(1);
    }

    const db = new PostgresDatabaseClient();

    try {
        const result = await db.query("SELECT NOW() as now");
        console.log("Connection successful!");
        console.log("Current time from DB:", result[0]);
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        await db.close();
    }
}

main();
