import bcrypt from "bcryptjs";
import pool from "./db/connection";

const createUsers = async () => {
    try {
        const password = "Password123";
        const passwordHash = await bcrypt.hash(password, 10);

        const users = [
            ["Admin User", "admin@fourclover.com", "ADMIN"],
            ["Sales User", "sales@fourclover.com", "SALES"],
            ["Warehouse User", "warehouse@fourclover.com", "WAREHOUSE"],
            ["Accounts User", "accounts@fourclover.com", "ACCOUNTS"]
        ];

        for (const [name, email, role] of users) {
            await pool.query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [name, email, passwordHash, role]
            );
        }

        console.log("fourClover users verified/created successfully");
    } catch (error) {
        console.error("Error creating users:", error);
    } finally {
        await pool.end();
    }
};

createUsers();