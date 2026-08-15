import pool from "./db/connection";

const updateProducts = async () => {
    try {
        console.log("Updating product names...");
        
        const result = await pool.query(
            "UPDATE products SET name = $1 WHERE id = $2 RETURNING *",
            ["test 1", 32]
        );
        
        console.log("Update result count:", result.rowCount);

        // Fetch to verify
        const rows = await pool.query("SELECT id, name FROM products");
        console.log("Current Products in DB:", rows.rows);

    } catch (err) {
        console.error("Error updating products:", err);
    } finally {
        await pool.end();
    }
};

updateProducts();
