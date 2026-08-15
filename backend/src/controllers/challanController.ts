import { Request, Response } from "express";
import pool from "../db/connection";
import PDFDocument from "pdfkit";

export const createChallan = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { customer_id, items } = req.body;
        const userId = (req as any).user?.id || 1;

        if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
            client.release();
            return res.status(400).json({ message: "customer_id and a non-empty items array are required" });
        }

        await client.query("BEGIN");

        const customerResult = await client.query("SELECT id FROM customers WHERE id = $1", [customer_id]);
        if (customerResult.rows.length === 0) {
            await client.query("ROLLBACK");
            client.release();
            return res.status(404).json({ message: "Customer not found" });
        }

        let totalQuantity = 0;
        const challanItemsToInsert = [];

        for (const item of items) {
            const { product_id, quantity } = item;
            
            if (!product_id || quantity === undefined || typeof quantity !== "number" || quantity <= 0) {
                await client.query("ROLLBACK");
                client.release();
                return res.status(400).json({ message: "Each item must have a valid product_id and a positive quantity" });
            }

            const productResult = await client.query("SELECT id, name, sku, unit_price FROM products WHERE id = $1", [product_id]);
            if (productResult.rows.length === 0) {
                await client.query("ROLLBACK");
                client.release();
                return res.status(404).json({ message: `Product with id ${product_id} not found` });
            }

            const product = productResult.rows[0];
            totalQuantity += quantity;
            
            challanItemsToInsert.push({
                product_id,
                product_name_snapshot: product.name,
                product_sku_snapshot: product.sku,
                product_price_snapshot: product.unit_price,
                quantity
            });
        }

        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
        const challanNumber = `CHL-${timestamp}-${randomStr}`;

        const challanResult = await client.query(
            `INSERT INTO challans 
            (challan_number, customer_id, total_quantity, status, created_by)
            VALUES ($1, $2, $3, 'Draft', $4)
            RETURNING id`,
            [challanNumber, customer_id, totalQuantity, userId]
        );
        
        const challanId = challanResult.rows[0].id;

        for (const ci of challanItemsToInsert) {
            await client.query(
                `INSERT INTO challan_items 
                (challan_id, product_id, product_name_snapshot, product_sku_snapshot, product_price_snapshot, quantity)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [challanId, ci.product_id, ci.product_name_snapshot, ci.product_sku_snapshot, ci.product_price_snapshot, ci.quantity]
            );
        }

        await client.query("COMMIT");
        client.release();

        return res.status(201).json({
            message: "Challan created successfully",
            challanId,
            challanNumber,
            status: "Draft",
            totalQuantity
        });

    } catch (error) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error creating challan:", error);
        return res.status(500).json({ message: "Internal server error while creating challan" });
    }
};

export const getChallans = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT 
                c.id, c.challan_number, c.total_quantity, c.status, c.created_at,
                cu.id as customer_id, cu.name AS customer_name, cu.business_name,
                u.id as created_by_id, u.name AS created_by_name
            FROM challans c
            JOIN customers cu ON c.customer_id = cu.id
            JOIN users u ON c.created_by = u.id
            WHERE 1 = 1
        `;
        const values: any[] = [];

        if (status && typeof status === "string" && status.trim() !== "") {
            query += " AND c.status = $1";
            values.push(status.trim());
        }

        query += " ORDER BY c.created_at DESC";

        const result = await pool.query(query, values);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching challans:", error);
        return res.status(500).json({ message: "Internal server error while fetching challans" });
    }
};

export const getChallanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const challanResult = await pool.query(
            `SELECT 
                c.id, c.challan_number, c.customer_id, c.total_quantity, c.status, c.created_at,
                cu.name AS customer_name, cu.business_name, cu.email AS customer_email, cu.mobile AS customer_mobile, cu.address AS customer_address,
                u.name AS created_by_name
            FROM challans c
            JOIN customers cu ON c.customer_id = cu.id
            JOIN users u ON c.created_by = u.id
            WHERE c.id = $1`,
            [id]
        );

        if (challanResult.rows.length === 0) {
            return res.status(404).json({ message: "Challan not found" });
        }

        const challan = challanResult.rows[0];

        const itemResult = await pool.query(
            `SELECT 
                ci.id, ci.product_id, ci.product_name_snapshot, ci.product_sku_snapshot, ci.product_price_snapshot, ci.quantity
            FROM challan_items ci
            WHERE ci.challan_id = $1`,
            [id]
        );

        return res.status(200).json({
            ...challan,
            items: itemResult.rows
        });
    } catch (error) {
        console.error("Error fetching challan details:", error);
        return res.status(500).json({ message: "Internal server error while fetching challan details" });
    }
};

export const updateChallanStatus = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (req as any).user?.id || 1;

        if (!status || !["Draft", "Confirmed", "Cancelled"].includes(status)) {
            client.release();
            return res.status(400).json({ message: "Invalid status. Must be Draft, Confirmed, or Cancelled" });
        }

        await client.query("BEGIN");

        const challanResult = await client.query("SELECT id, status, challan_number FROM challans WHERE id = $1 FOR UPDATE", [id]);

        if (challanResult.rows.length === 0) {
            await client.query("ROLLBACK");
            client.release();
            return res.status(404).json({ message: "Challan not found" });
        }

        const challan = challanResult.rows[0];
        const currentStatus = challan.status;

        if (currentStatus === "Cancelled") {
            await client.query("ROLLBACK");
            client.release();
            return res.status(400).json({ message: "Cannot update a cancelled challan" });
        }

        if (currentStatus === "Confirmed" && status === "Confirmed") {
            await client.query("ROLLBACK");
            client.release();
            return res.status(400).json({ message: "Challan is already confirmed" });
        }

        if (currentStatus === "Confirmed" && status !== "Confirmed") {
            await client.query("ROLLBACK");
            client.release();
            return res.status(400).json({ message: "Cannot change status of a confirmed challan" });
        }
        
        if (status === "Confirmed") {
            const itemResult = await client.query("SELECT product_id, quantity FROM challan_items WHERE challan_id = $1", [id]);
            const items = itemResult.rows;

            for (const item of items) {
                const productResult = await client.query("SELECT id, current_stock, name FROM products WHERE id = $1 FOR UPDATE", [item.product_id]);
                
                if (productResult.rows.length === 0) {
                    await client.query("ROLLBACK");
                    client.release();
                    return res.status(400).json({ message: `Product with id ${item.product_id} no longer exists` });
                }

                const product = productResult.rows[0];
                if (Number(product.current_stock) < item.quantity) {
                    await client.query("ROLLBACK");
                    client.release();
                    return res.status(400).json({ 
                        message: `Insufficient stock for product ${product.name}. Required: ${item.quantity}, Available: ${product.current_stock}` 
                    });
                }
            }

            for (const item of items) {
                await client.query("UPDATE products SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [item.quantity, item.product_id]);
                
                await client.query(
                    `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                     VALUES ($1, $2, 'OUT', $3, $4)`,
                    [item.product_id, item.quantity, `Sales Challan Confirmed: ${challan.challan_number}`, userId]
                );
            }
        }

        await client.query("UPDATE challans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);

        await client.query("COMMIT");
        client.release();

        return res.status(200).json({ message: `Challan status updated to ${status}` });

    } catch (error) {
        await client.query("ROLLBACK");
        client.release();
        console.error("Error updating challan status:", error);
        return res.status(500).json({ message: "Internal server error while updating status" });
    }
};

export const generateInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const challanResult = await pool.query(
            `SELECT 
                c.id, c.challan_number, c.customer_id, c.total_quantity, c.status, c.created_at,
                cu.name AS customer_name, cu.business_name, cu.email AS customer_email, cu.mobile AS customer_mobile, cu.address AS customer_address
            FROM challans c
            JOIN customers cu ON c.customer_id = cu.id
            WHERE c.id = $1`,
            [id]
        );

        if (challanResult.rows.length === 0) {
            return res.status(404).json({ message: "Challan not found" });
        }

        const challan = challanResult.rows[0];

        if (challan.status !== "Confirmed") {
            return res.status(400).json({ message: "Invoices can only be generated for Confirmed challans." });
        }

        const itemResult = await pool.query(
            `SELECT 
                ci.product_name_snapshot, ci.product_sku_snapshot, ci.product_price_snapshot, ci.quantity
            FROM challan_items ci
            WHERE ci.challan_id = $1`,
            [id]
        );
        const items = itemResult.rows;

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Invoice-${challan.challan_number}.pdf"`);
        
        doc.pipe(res);

        doc.fontSize(20).text("TAX INVOICE", { align: "center" });
        doc.moveDown();

        const invoiceNumber = `INV-${challan.challan_number}`;
        doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Challan Ref: ${challan.challan_number}`);
        doc.text(`Date: ${new Date(challan.created_at).toLocaleDateString()}`);
        doc.moveDown();

        doc.text("Billed To:");
        doc.text(challan.customer_name);
        doc.text(challan.business_name);
        doc.text(challan.customer_address);
        doc.text(`Phone: ${challan.customer_mobile}`);
        doc.moveDown(2);

        const tableTop = doc.y;
        doc.font("Helvetica-Bold");
        doc.text("SKU", 50, tableTop);
        doc.text("Product", 150, tableTop);
        doc.text("Price", 350, tableTop, { width: 70, align: "right" });
        doc.text("Qty", 430, tableTop, { width: 50, align: "right" });
        doc.text("Total", 490, tableTop, { width: 60, align: "right" });
        
        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.font("Helvetica");

        let currentY = doc.y + 15;
        let grandTotal = 0;

        for (const item of items) {
            const lineTotal = Number(item.product_price_snapshot) * item.quantity;
            grandTotal += lineTotal;

            doc.text(item.product_sku_snapshot, 50, currentY);
            doc.text(item.product_name_snapshot, 150, currentY);
            doc.text(Number(item.product_price_snapshot).toFixed(2), 350, currentY, { width: 70, align: "right" });
            doc.text(item.quantity.toString(), 430, currentY, { width: 50, align: "right" });
            doc.text(lineTotal.toFixed(2), 490, currentY, { width: 60, align: "right" });
            
            currentY += 20;
        }

        doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke();
        currentY += 15;

        doc.font("Helvetica-Bold");
        doc.text("Grand Total:", 350, currentY, { width: 130, align: "right" });
        doc.text(grandTotal.toFixed(2), 490, currentY, { width: 60, align: "right" });

        doc.end();

    } catch (error) {
        console.error("Error generating invoice:", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal server error while generating invoice" });
        }
    }
};
