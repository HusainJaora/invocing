import db from "../db/database.js";

export const addProduct = async (req, res) => {
    const { product_name, product_price, product_description = "NA" } = req.body;

    try {
        // Check if an ACTIVE product with this name exists
        const [existing] = await db.query(`
            SELECT product_id FROM products 
            WHERE product_name = ? AND product_status = 1`, 
            [product_name]
        );

        // If active product exists, don't allow duplicate
        if (existing.length > 0) {
            return res.status(400).json({ 
                error: "Product with this name already exists." 
            });
        }

        const [result] = await db.query(`
            INSERT INTO products(product_name, product_price, product_description) 
            VALUES(?, ?, ?)`, 
            [product_name, product_description, product_price]
        );

        return res.status(201).json({
            message: "Product added successfully",
            product: {
                product_id: result.insertId,
                product_name,
                product_description,
                product_price
            }
        });

    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
