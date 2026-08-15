import { Request, Response } from "express";
import pool from "../db/connection";

const createCustomer = async (req: Request, res: Response) => {
    try {
        const {
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        } = req.body;

        if (
            !name ||
            !mobile ||
            !business_name ||
            !customer_type ||
            !address
        ) {
            return res.status(400).json({
                message: "Required customer fields are missing"
            });
        }

        const result = await pool.query(
            `INSERT INTO customers
            (name, mobile, email, business_name, gst_number,
             customer_type, address, status, follow_up_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
                name,
                mobile,
                email || null,
                business_name,
                gst_number || null,
                customer_type,
                address,
                status || "Lead",
                follow_up_date || null,
                notes || null
            ]
        );

        const customerId = result.rows[0].id;

        res.status(201).json({
            message: "Customer created successfully",
            customerId
        });
    } catch (error) {
        console.error("Error creating customer:", error);

        res.status(500).json({
            message: "Failed to create customer"
        });
    }
};

const getCustomers = async (req: Request, res: Response) => {
    try {
        const { search, status, customer_type } = req.query;

        let query = `
            SELECT *
            FROM customers
            WHERE 1 = 1
        `;

        const values: any[] = [];
        let paramIndex = 1;

        if (search && typeof search === "string" && search.trim() !== "") {
            const searchValue = `%${search.trim()}%`;
            query += `
                AND (
                    name ILIKE $${paramIndex}
                    OR mobile ILIKE $${paramIndex}
                    OR email ILIKE $${paramIndex}
                    OR business_name ILIKE $${paramIndex}
                )
            `;
            values.push(searchValue);
            paramIndex++;
        }

        if (status && typeof status === "string" && status.trim() !== "") {
            query += ` AND status = $${paramIndex}`;
            values.push(status.trim());
            paramIndex++;
        }

        if (customer_type && typeof customer_type === "string" && customer_type.trim() !== "") {
            query += ` AND customer_type = $${paramIndex}`;
            values.push(customer_type.trim());
            paramIndex++;
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, values);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching customers:", error);

        return res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
};

const getCustomerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM customers WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching customer:", error);

        return res.status(500).json({
            message: "Failed to fetch customer detail"
        });
    }
};

const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        } = req.body;

        const existingResult = await pool.query(
            "SELECT * FROM customers WHERE id = $1",
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const current = existingResult.rows[0];

        await pool.query(
            `UPDATE customers
             SET name = $1,
                 mobile = $2,
                 email = $3,
                 business_name = $4,
                 gst_number = $5,
                 customer_type = $6,
                 address = $7,
                 status = $8,
                 follow_up_date = $9,
                 notes = $10,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $11`,
            [
                name !== undefined ? name : current.name,
                mobile !== undefined ? mobile : current.mobile,
                email !== undefined ? email : current.email,
                business_name !== undefined ? business_name : current.business_name,
                gst_number !== undefined ? gst_number : current.gst_number,
                customer_type !== undefined ? customer_type : current.customer_type,
                address !== undefined ? address : current.address,
                status !== undefined ? status : current.status,
                follow_up_date !== undefined ? follow_up_date : current.follow_up_date,
                notes !== undefined ? notes : current.notes,
                id
            ]
        );

        return res.status(200).json({
            message: "Customer updated successfully"
        });
    } catch (error) {
        console.error("Error updating customer:", error);

        return res.status(500).json({
            message: "Failed to update customer"
        });
    }
};

export { createCustomer, getCustomers, getCustomerById, updateCustomer };
