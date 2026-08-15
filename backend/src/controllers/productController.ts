import { Request, Response } from "express";
import pool from "../db/connection";

// Helper to ensure stock_movements table exists in PostgreSQL
const ensureStockMovementsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS stock_movements (
                id SERIAL PRIMARY KEY,
                product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                quantity_changed INT NOT NULL,
                movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
                reason VARCHAR(255) NOT NULL,
                created_by INT NOT NULL REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (err) {
        console.error("Error creating stock_movements table:", err);
    }
};

ensureStockMovementsTable();

const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        } = req.body;

        const userId = (req as any).user?.id || 1;

        if (
            !name ||
            !sku ||
            !category ||
            unit_price === undefined ||
            current_stock === undefined ||
            minimum_stock === undefined ||
            !warehouse_location
        ) {
            return res.status(400).json({
                message: "Required product fields are missing"
            });
        }

        if (
            Number(unit_price) < 0 ||
            Number(current_stock) < 0 ||
            Number(minimum_stock) < 0
        ) {
            return res.status(400).json({
                message: "Product values cannot be negative"
            });
        }

        const result = await pool.query(
            `INSERT INTO products
            (name, sku, category, unit_price, current_stock,
             minimum_stock, warehouse_location)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                name.trim(),
                sku.trim(),
                category.trim(),
                unit_price,
                current_stock,
                minimum_stock,
                warehouse_location.trim()
            ]
        );

        const productId = result.rows[0].id;

        // Log initial stock movement if stock > 0
        if (Number(current_stock) > 0) {
            await pool.query(
                `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                 VALUES ($1, $2, 'IN', 'Initial Stock Import', $3)`,
                [productId, Number(current_stock), userId]
            );
        }

        res.status(201).json({
            message: "Product created successfully",
            productId
        });
    } catch (error: any) {
        console.error("Error creating product:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create product"
        });
    }
};

const getProducts = async (req: Request, res: Response) => {
    try {
        const { search, category } = req.query;

        let query = "SELECT * FROM products WHERE 1 = 1";
        const values: any[] = [];
        let paramIndex = 1;

        if (search && typeof search === "string" && search.trim() !== "") {
            query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR warehouse_location ILIKE $${paramIndex})`;
            const term = `%${search.trim()}%`;
            values.push(term);
            paramIndex++;
        }

        if (category && typeof category === "string" && category.trim() !== "") {
            query += ` AND category = $${paramIndex}`;
            values.push(category.trim());
            paramIndex++;
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location,
            reason
        } = req.body;

        const userId = (req as any).user?.id || 1;

        const existingResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

        if (existingResult.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const currentProduct = existingResult.rows[0];

        const newName = name !== undefined ? name : currentProduct.name;
        const newSku = sku !== undefined ? sku : currentProduct.sku;
        const newCategory = category !== undefined ? category : currentProduct.category;
        const newPrice = unit_price !== undefined ? unit_price : currentProduct.unit_price;
        const newStock = current_stock !== undefined ? current_stock : currentProduct.current_stock;
        const newMinStock = minimum_stock !== undefined ? minimum_stock : currentProduct.minimum_stock;
        const newLocation = warehouse_location !== undefined ? warehouse_location : currentProduct.warehouse_location;

        if (Number(newPrice) < 0 || Number(newStock) < 0 || Number(newMinStock) < 0) {
            return res.status(400).json({ message: "Product values cannot be negative" });
        }

        const oldStock = Number(currentProduct.current_stock);
        const updatedStockNum = Number(newStock);
        const stockDiff = updatedStockNum - oldStock;

        await pool.query(
            `UPDATE products SET
                name = $1,
                sku = $2,
                category = $3,
                unit_price = $4,
                current_stock = $5,
                minimum_stock = $6,
                warehouse_location = $7,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $8`,
            [newName, newSku, newCategory, newPrice, updatedStockNum, newMinStock, newLocation, id]
        );

        // Record stock movement if current_stock changed
        if (stockDiff !== 0) {
            const movementType = stockDiff > 0 ? "IN" : "OUT";
            const qtyChanged = Math.abs(stockDiff);
            const movementReason = reason || (stockDiff > 0 ? "Stock Increase via Edit" : "Stock Decrease via Edit");

            await pool.query(
                `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, qtyChanged, movementType, movementReason, userId]
            );
        }

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error: any) {
        console.error("Error updating product:", error);
        if (error.code === "23505") {
            return res.status(409).json({ message: "SKU already exists" });
        }
        res.status(500).json({ message: "Failed to update product" });
    }
};

const addStockMovement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity_changed, movement_type, reason } = req.body;
        const userId = (req as any).user?.id || 1;

        const qty = Number(quantity_changed);
        if (!qty || qty <= 0 || !["IN", "OUT"].includes(movement_type) || !reason) {
            return res.status(400).json({
                message: "Valid quantity_changed (> 0), movement_type ('IN' or 'OUT'), and reason are required."
            });
        }

        const existingResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

        if (existingResult.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const product = existingResult.rows[0];
        if (movement_type === "OUT" && Number(product.current_stock) < qty) {
            return res.status(400).json({
                message: `Insufficient stock! Current stock is ${product.current_stock}, requested reduction is ${qty}`
            });
        }

        const newStock = movement_type === "IN" 
            ? Number(product.current_stock) + qty 
            : Number(product.current_stock) - qty;

        await pool.query("UPDATE products SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newStock, id]);

        const result = await pool.query(
            `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [id, qty, movement_type, reason, userId]
        );

        res.status(201).json({
            message: "Stock movement recorded successfully",
            movementId: result.rows[0].id,
            new_stock: newStock
        });
    } catch (error) {
        console.error("Error recording stock movement:", error);
        res.status(500).json({ message: "Failed to record stock movement" });
    }
};

const getStockMovements = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let query = `
            SELECT sm.id, sm.product_id, p.name as product_name, p.sku,
                   sm.quantity_changed, sm.movement_type, sm.reason,
                   sm.created_by, u.name as created_by_name, sm.created_at
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            LEFT JOIN users u ON sm.created_by = u.id
        `;
        const values: any[] = [];

        if (id) {
            query += " WHERE sm.product_id = $1";
            values.push(id);
        }

        query += " ORDER BY sm.created_at DESC";

        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching stock movements:", error);
        res.status(500).json({ message: "Failed to fetch stock movements" });
    }
};

export {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    addStockMovement,
    getStockMovements
};