import db from "../db/database.js";

export const add_Product = async (req, res) => {
    const { product_name, product_description = "NA" } = req.body;

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
            INSERT INTO products(product_name, product_description) 
            VALUES(?, ?)`, 
            [product_name, product_description]
        );

        return res.status(201).json({
            message: "Product added successfully",
            product: {
                product_id: result.insertId,
                product_name,
                product_description
            }
        });

    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const get_Allproduct = async (req, res) => {

    try {

        const [products] = await db.query(`
            SELECT product_id, product_name, product_description
            FROM products
            WHERE product_status='1'
            ORDER BY product_id DESC
            `);

        if (products.length === 0) {
            return res.status(400).json({ message: "No product found" });
        }

        res.status(200).json({ products });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

export const get_Product_ById = async (req, res) => {
    const { product_id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT product_id, product_name, product_description FROM products WHERE product_id = ? AND product_status = '1'",
            [product_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = rows[0];
        res.status(200).json({
            product_id: product.product_id,
            product_name: product.product_name,
            product_description: product.product_description,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const delete_Product = async(req,res)=>{
    const { product_id } = req.params;
    try {
        const [product] = await db.query(`SELECT product_status FROM products WHERE product_id = ?`, [product_id]);

        if (!product.length || product[0].product_status === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const [result] = await db.query(
            `UPDATE products
             SET product_status = '0'
             WHERE product_id =?
            `,[product_id]
        )

        if(result.affectedRows ===0){
                res.status(404).json({message:"Product not found or unauthorized"})
            }
        res.status(200).json({message:"Product deleted successfully"});
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export const update_Product = async (req, res) => {
    const { product_id } = req.params;
    const { product_name, product_description } = req.body;

    try {
        // Check if product exists and is active
        const [product] = await db.query(
            `SELECT product_status FROM products WHERE product_id = ?`, 
            [product_id]
        );

        if (!product.length || product[0].product_status === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (product_name !== undefined) {
            if (!product_name || product_name.trim() === '') {
                return res.status(400).json({ error: "Product name cannot be empty" });
            }

            // Check if another ACTIVE product with this name exists
            const [existing] = await db.query(
                `SELECT product_id FROM products 
                WHERE product_name = ? AND product_status = 1 AND product_id != ?`,
                [product_name.trim(), product_id]
            );

            if (existing.length > 0) {
                return res.status(409).json({ 
                    error: "Another product with this name already exists" 
                });
            }

            updateFields.push('product_name = ?');
            updateValues.push(product_name.trim());
        }

        if (product_description !== undefined) {
            // Allow empty string or "NA" for optional field
            const descriptionValue = product_description.trim() === '' ? 'NA' : product_description.trim();
            updateFields.push('product_description = ?');
            updateValues.push(descriptionValue);
        }

    

        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Add product_id to values array for WHERE clause
        updateValues.push(product_id);

        // Execute update query
        const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE product_id = ?`;
        await db.query(updateQuery, updateValues);

        res.status(200).json({ message: "Product updated successfully" });

    } catch (error) {
        console.error('Error updating product:', error);
        
        res.status(500).json({ error: "Internal server error" });
    }
}