import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db/connection";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import productRoutes from "./routes/productRoutes";
import challanRoutes from "./routes/challanRoutes";

dotenv.config();

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/challans", challanRoutes);

app.get("/", (_req, res) => {
    res.json({
        message: "fourClover ERP CRM API is running"
    });
});

app.get("/db-test", async (_req, res) => {
    try {
        const result = await pool.query("SELECT 1 AS result");

        res.json({
            message: "PostgreSQL database connected successfully",
            data: result.rows
        });
    } catch (error: any) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`fourClover Server running on port ${PORT}`);
});