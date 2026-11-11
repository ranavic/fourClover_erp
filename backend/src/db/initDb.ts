import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import pool from "./connection";
import { seedDemoData } from "./seedDemoData";

export const initDb = async (closePool = true) => {
    try {
        console.log("🚀 Initializing fourClover PostgreSQL Database...");

        // 1. Run schema.sql
        const schemaPath = path.join(__dirname, "../../schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");

        await pool.query(schemaSql);
        console.log("✅ Tables and indexes created successfully");

        // 2. Seed default users
        const password = "Password123";
        const passwordHash = await bcrypt.hash(password, 10);

        const defaultUsers = [
            ["Admin User", "admin@fourclover.com", "ADMIN"],
            ["Sales User", "sales@fourclover.com", "SALES"],
            ["Warehouse User", "warehouse@fourclover.com", "WAREHOUSE"],
            ["Accounts User", "accounts@fourclover.com", "ACCOUNTS"]
        ];

        for (const [name, email, role] of defaultUsers) {
            await pool.query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [name, email, passwordHash, role]
            );
        }
        console.log("✅ Default fourClover users verified/seeded");

        // 3. Seed realistic Indian customers, electronics products, and sample challans when tables are empty
        await seedDemoData();

        console.log("🎉 Database initialization completed successfully!");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
        throw error;
    } finally {
        if (closePool) {
            await pool.end();
        }
    }
};

if (require.main === module) {
    initDb(true).catch(() => {
        process.exit(1);
    });
}
