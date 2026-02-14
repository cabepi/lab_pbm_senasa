import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const INPUT_FILE = path.join(__dirname, "../database/raw_pharmacies.txt");
const OUTPUT_FILE = path.join(__dirname, "../database/scripts/002_create_pharmacies_table.sql");

// Helper to escape single quotes in SQL
function escapeSql(str: string): string {
    return str.replace(/\'/g, "''");
}

async function main() {
    console.log("Generating SQL from pharmacy data...");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Input file not found: ${INPUT_FILE}`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(INPUT_FILE, "utf-8");
        const lines = rawData.split("\n").filter(line => line.trim() !== "");

        // Skip header row
        const dataLines = lines.slice(1);

        console.log(`Found ${dataLines.length} records.`);

        let sql = `-- Create pharmacies table
CREATE TABLE IF NOT EXISTS lab_pbm_senasa.pharmacies (
    code INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    principal_code INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    PRIMARY KEY (code, principal_code)
);

-- Truncate existing data to ensure clean state
TRUNCATE TABLE lab_pbm_senasa.pharmacies;

`;

        const allValues: string[] = [];
        const seenPKs = new Set<string>();

        for (const line of dataLines) {
            // Split by tab (assuming TSV format)
            const parts = line.split("\t").map(p => p.trim());

            if (parts.length < 6) {
                console.warn(`Skipping invalid line (columns < 6): ${line}`);
                continue;
            }

            const code = parseInt(parts[0], 10);
            const name = escapeSql(parts[1]);
            const principalCode = parseInt(parts[2], 10);
            const type = escapeSql(parts[3]);
            const province = escapeSql(parts[4]);
            const municipality = escapeSql(parts[5]);

            if (isNaN(code) || isNaN(principalCode)) {
                console.warn(`Skipping line with invalid numbers (line content: "${line}")`);
                continue;
            }

            const pk = `${code}-${principalCode}`;
            if (seenPKs.has(pk)) {
                console.warn(`Skipping duplicate primary key: ${pk} (line content: "${line}")`);
                continue;
            }
            seenPKs.add(pk);

            allValues.push(`(${code}, '${name}', ${principalCode}, '${type}', '${province}', '${municipality}')`);
        }

        if (allValues.length > 0) {
            // Batch generation
            const BATCH_SIZE = 100;
            for (let i = 0; i < allValues.length; i += BATCH_SIZE) {
                const batch = allValues.slice(i, i + BATCH_SIZE);
                sql += `-- Batch ${Math.floor(i / BATCH_SIZE) + 1}\n`;
                sql += `INSERT INTO lab_pbm_senasa.pharmacies (code, name, principal_code, type, province, municipality) VALUES\n`;
                sql += batch.join(",\n") + ";\n\n";
            }
        } else {
            console.warn("No valid records found to insert.");
        }

        fs.writeFileSync(OUTPUT_FILE, sql);
        console.log(`Generated SQL script at: ${OUTPUT_FILE}`);
        console.log(`Total records processed: ${allValues.length}`);

    } catch (error) {
        console.error("Error processing file:", error);
        process.exit(1);
    }
}

main();
