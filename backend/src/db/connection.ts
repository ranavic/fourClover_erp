import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const poolConfig: PoolConfig = connectionString
    ? {
        connectionString,
        ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000
    }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "fourclover_erp",
        port: Number(process.env.DB_PORT) || 5432,
        ssl: process.env.DB_SSL === "true" || (process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1")
            ? { rejectUnauthorized: false }
            : false,
        max: 10,
        idleTimeoutMillis: 30000
    };

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client", err);
});

export default pool;