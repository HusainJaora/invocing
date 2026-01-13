import db from '../db/database.js';

export const add_Invoice = async (req, res) => {
    const { customer_id, invoice_date, items } = req.body;

    try {
        // Basic validation
        if (!customer_id) {
            return res.status(400).json({ 
                error: "Customer ID is required" 
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                error: "At least one invoice item is required" 
            });
        }

        // Check for duplicate product IDs
        const productIds = items.map(item => item.product_id);
        const uniqueProductIds = new Set(productIds);
        
        if (productIds.length !== uniqueProductIds.size) {
            return res.status(400).json({ 
                error: "Duplicate product IDs are not allowed in the same invoice." 
            });
        }

        // Validate each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.product_id || !item.price || !item.quantity) {
                return res.status(400).json({ 
                    error: `Item ${i + 1}: product_id, price, and quantity are required` 
                });
            }
            if (item.price <= 0 || item.quantity <= 0) {
                return res.status(400).json({ 
                    error: `Item ${i + 1}: price and quantity must be greater than 0` 
                });
            }
        }

        // Check if customer exists 
        const [customerCheck] = await db.query(
            'SELECT customer_id FROM customers WHERE customer_id = ? AND customer_status = 1',
            [customer_id]
        );

        if (customerCheck.length === 0) {
            return res.status(400).json({ 
                error: "Customer not found." 
            });
        }

        // Verify all products exist 
        for (const item of items) {
            const [productCheck] = await db.query(
                'SELECT product_id FROM products WHERE product_id = ? AND product_status = 1',
                [item.product_id]
            );

            if (productCheck.length === 0) {
                return res.status(400).json({ 
                    error: `Product with ID ${item.product_id} not found.` 
                });
            }
        }

        // Calculate grand total
        const grand_total = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        // Insert invoice 
        const invoiceQuery = invoice_date 
            ? 'INSERT INTO invoices (customer_id, invoice_date, grand_total) VALUES (?, ?, ?)'
            : 'INSERT INTO invoices (customer_id, grand_total) VALUES (?, ?)';

        const invoiceParams = invoice_date 
            ? [customer_id, invoice_date, grand_total]
            : [customer_id, grand_total];

        const [invoiceResult] = await db.query(invoiceQuery, invoiceParams);
        const invoice_id = invoiceResult.insertId;

        // Insert invoice items
        for (const item of items) {
            await db.query(
                'INSERT INTO invoice_item (invoice_id, product_id, price, quantity) VALUES (?, ?, ?, ?)',
                [invoice_id, item.product_id, item.price, item.quantity]
            );
        }

        // Fetch the created invoice with items for response
        const [invoiceData] = await db.query(
            'SELECT * FROM invoices WHERE invoice_id = ?',
            [invoice_id]
        );

        const [itemsData] = await db.query(
            'SELECT * FROM invoice_item WHERE invoice_id = ?',
            [invoice_id]
        );

        return res.status(201).json({
            message: "Invoice created successfully",
            invoice: {
                invoice_id: invoiceData[0].invoice_id,
                customer_id: invoiceData[0].customer_id,
                invoice_date: invoiceData[0].invoice_date,
                grand_total: invoiceData[0].grand_total,
                items: itemsData.map(item => ({
                    item_id: item.item_id,
                    product_id: item.product_id,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total
                }))
            }
        });

    } catch (error) {
        console.error("Error creating invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const get_AllInvoice = async (req, res) => {
    try {
        // Get all  invoices with customer information
        const [invoices] = await db.query(`
            SELECT 
                i.invoice_id,
                i.customer_id,
                c.customer_name,
                c.customer_contact,
                i.invoice_date,
                i.grand_total
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE i.invoice_status = 1
            ORDER BY i.invoice_date DESC, i.invoice_id DESC
        `);

        if (invoices.length === 0) {
            return res.status(200).json({
                message: "No invoices found",
                invoices: []
            });
        }

        return res.status(200).json({
            message: "Invoices retrieved successfully",
            count: invoices.length,
            invoices: invoices
        });

    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const get_Invoice_ById = async (req, res) => {
    const { invoice_id } = req.params;
    try {
        // Get invoice details
        const [invoiceData] = await db.query(
            `SELECT 
                i.invoice_id,
                i.customer_id,
                c.customer_name,
                c.customer_contact,
                i.invoice_date,
                i.grand_total
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.customer_id
            WHERE i.invoice_id = ? AND i.invoice_status = 1`,
            [invoice_id]
        );
        if (invoiceData.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const [itemsData] = await db.query(
            `SELECT ii.item_id, ii.product_id, p.product_name, p.product_description, ii.price, ii.quantity, ii.total 
            FROM invoice_item ii
            JOIN products p ON ii.product_id = p.product_id
            WHERE ii.invoice_id = ? AND ii.item_status = 1`,
            [invoice_id]
        );
        return res.status(200).json({
            invoice: {

                invoice_id: invoiceData[0].invoice_id,
                customer_id: invoiceData[0].customer_id,
                customer_name: invoiceData[0].customer_name,
                customer_contact: invoiceData[0].customer_contact,
                invoice_date: invoiceData[0].invoice_date,
                grand_total: invoiceData[0].grand_total,
                items: itemsData.map(item => ({
                    item_id: item.item_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_description: item.product_description,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.total
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const delete_Invoice = async(req,res)=>{
    const { invoice_id } = req.params;
    try {
        // Validate invoice_id
        if (!invoice_id || isNaN(invoice_id)) {
            return res.status(400).json({ error: "Invalid invoice ID" });
        }

        // Check if invoice exists
        const [invoiceCheck] = await db.query(
            'SELECT invoice_id FROM invoices WHERE invoice_id = ? AND invoice_status = 1',
            [invoice_id]
        );

        if (invoiceCheck.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Soft delete invoice items first
        const [itemResult] = await db.query(
            'UPDATE invoice_item SET item_status = 0 WHERE invoice_id = ? AND item_status = 1',
            [invoice_id]
        );


        // Soft delete invoice
        const [invoiceResult] = await db.query(
            'UPDATE invoices SET invoice_status = 0 WHERE invoice_id = ?',
            [invoice_id]
        );


        return res.status(200).json({ 
            message: "Invoice deleted successfully",
            items_deleted: itemResult.affectedRows
        });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const update_Invoice = async (req, res) => {
    const { invoice_id } = req.params;
    const { customer_id, invoice_date, items } = req.body;

    try {
        // Check if invoice exists and is active
        const [invoice] = await db.query(
            'SELECT invoice_status FROM invoices WHERE invoice_id = ?',
            [invoice_id]
        );

        if (!invoice.length || invoice[0].invoice_status === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Build dynamic update query for invoice
        const updateFields = [];
        const updateValues = [];

        if (customer_id !== undefined) {
            if (!customer_id) {
                return res.status(400).json({ error: "Customer ID cannot be empty" });
            }

            // Check if customer exists and is active
            const [customerCheck] = await db.query(
                'SELECT customer_id FROM customers WHERE customer_id = ? AND customer_status = 1',
                [customer_id]
            );

            if (customerCheck.length === 0) {
                return res.status(400).json({ error: "Customer not found" });
            }

            updateFields.push('customer_id = ?');
            updateValues.push(customer_id);
        }

        if (invoice_date !== undefined) {
            if (!invoice_date || invoice_date.trim() === '') {
                return res.status(400).json({ error: "Invoice date cannot be empty" });
            }
            updateFields.push('invoice_date = ?');
            updateValues.push(invoice_date);
        }

        // Handle items update
        if (items !== undefined) {
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ 
                    error: "At least one invoice item is required" 
                });
            }

            // Separate items into existing (with item_id) and new (without item_id)
            const existingItems = items.filter(item => item.item_id);
            const newItems = items.filter(item => !item.item_id);

            // FIRST: Get all current active item_ids from database BEFORE making any changes
            const [currentItemsInDb] = await db.query(
                'SELECT item_id FROM invoice_item WHERE invoice_id = ? AND item_status = 1',
                [invoice_id]
            );

            // Get item_ids from the request (only existing items that should be kept)
            const submittedItemIds = existingItems.map(item => parseInt(item.item_id));

            // Find items that are in DB but not in the submitted list (these should be deleted)
            const itemsToDelete = currentItemsInDb
                .map(row => row.item_id)
                .filter(itemId => !submittedItemIds.includes(itemId));

            // Validate each item
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                // Basic validation for all items
                if (!item.product_id || !item.price || !item.quantity) {
                    return res.status(400).json({ 
                        error: `Item ${i + 1}: product_id, price, and quantity are required` 
                    });
                }

                if (item.price <= 0 || item.quantity <= 0) {
                    return res.status(400).json({ 
                        error: `Item ${i + 1}: price and quantity must be greater than 0` 
                    });
                }

                // Verify product exists
                const [productCheck] = await db.query(
                    'SELECT product_id FROM products WHERE product_id = ? AND product_status = 1',
                    [item.product_id]
                );

                if (productCheck.length === 0) {
                    return res.status(400).json({ 
                        error: `Product with ID ${item.product_id} not found` 
                    });
                }
            }

            // Check for duplicate products in the submitted items
            const productIds = items.map(item => item.product_id);
            const uniqueProductIds = new Set(productIds);
            
            if (productIds.length !== uniqueProductIds.size) {
                return res.status(400).json({ 
                    error: "Duplicate product IDs are not allowed in the same invoice" 
                });
            }

            // Process existing items (update)
            for (const item of existingItems) {
                // Check if item exists and belongs to this invoice
                const [itemCheck] = await db.query(
                    'SELECT item_id FROM invoice_item WHERE item_id = ? AND invoice_id = ? AND item_status = 1',
                    [item.item_id, invoice_id]
                );

                if (itemCheck.length === 0) {
                    return res.status(404).json({ 
                        error: `Item with ID ${item.item_id} not found in this invoice` 
                    });
                }

                // Update the item
                await db.query(
                    'UPDATE invoice_item SET product_id = ?, price = ?, quantity = ? WHERE item_id = ?',
                    [item.product_id, item.price, item.quantity, item.item_id]
                );
            }

            // Process new items (insert)
            for (const item of newItems) {
                await db.query(
                    'INSERT INTO invoice_item (invoice_id, product_id, price, quantity) VALUES (?, ?, ?, ?)',
                    [invoice_id, item.product_id, item.price, item.quantity]
                );
            }

            // Soft delete the removed items (using the list we calculated earlier)
            if (itemsToDelete.length > 0) {
                await db.query(
                    'UPDATE invoice_item SET item_status = 0 WHERE item_id IN (?) AND invoice_id = ?',
                    [itemsToDelete, invoice_id]
                );
            }

            // Recalculate grand total after all items updates
            const [itemsData] = await db.query(
                'SELECT SUM(total) as grand_total FROM invoice_item WHERE invoice_id = ? AND item_status = 1',
                [invoice_id]
            );

            const grand_total = itemsData[0].grand_total || 0;
            updateFields.push('grand_total = ?');
            updateValues.push(grand_total);
        }

        // Update invoice fields if any
        if (updateFields.length > 0) {
            updateValues.push(invoice_id);
            const updateQuery = `UPDATE invoices SET ${updateFields.join(', ')} WHERE invoice_id = ?`;
            await db.query(updateQuery, updateValues);
        }

        return res.status(200).json({ message: "Invoice updated successfully" });

    } catch (error) {
        console.error("Error updating invoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};