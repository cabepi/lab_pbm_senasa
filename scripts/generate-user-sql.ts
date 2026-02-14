
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, "../database/scripts/003_seed_users.sql");

async function main() {
    console.log("Generating user seeding SQL...");

    const password = "Unipago2026@";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const users = [
        { name: "Francis Marinez", email: "fmarinez@unipago.com.do" },
        { name: "Carlos Betancur", email: "cbetancur@unipago.com.do" }
    ];

    let sql = `-- Seed initial users\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n\n`;

    for (const user of users) {
        sql += `INSERT INTO lab_pbm_senasa.users (full_name, email, password_hash)
VALUES ('${user.name}', '${user.email}', '${hashedPassword}')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();\n\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`Generated SQL script at: ${OUTPUT_FILE}`);
}

main();
