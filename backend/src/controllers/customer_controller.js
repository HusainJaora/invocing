import db from '../db/database.js';

export const addCustomer = async (req, res) => {
    const { customer_name, customer_contact, customer_email = "NA", customer_address = "NA" } = req.body;

    try {
        // Check if an ACTIVE customer with this contact exists
        const [existing] = await db.query(`
            SELECT customer_id FROM customers 
            WHERE customer_contact = ? AND customer_status = 1`, 
            [customer_contact]
        );

        // If active customer exists, don't allow duplicate
        if (existing.length > 0) {
            return res.status(400).json({ 
                error: "Customer with this contact already exists and is active" 
            });
        }

        const [result] = await db.query(`
            INSERT INTO customers(customer_name, customer_contact, customer_email, customer_address, customer_status) 
            VALUES(?, ?, ?, ?, 1)`, 
            [customer_name, customer_contact, customer_email, customer_address]
        );

        return res.status(201).json({
            message: "Customer added successfully",
            customer: {
                customer_id: result.insertId,
                customer_name,
                customer_contact,
                customer_email,
                customer_address
            }
        });

    } catch (error) {
        console.error("Error adding customer:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getAllcustomer = async (req, res) => {

    try {

        const [customers] = await db.query(`
            SELECT customer_id, customer_name, customer_contact, customer_email, customer_address
            FROM customers
            WHERE customer_status='1'
            ORDER BY customer_id DESC
            `);

        if (customers.length === 0) {
            return res.status(400).json({ message: "No customer found" });
        }



        res.status(200).json({ customers });

    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

export const get_Customer_ById = async (req, res) => {
    const { customer_id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT customer_id, customer_name, customer_contact, customer_email, customer_address FROM customers WHERE customer_id = ? AND customer_status = '1'",
            [customer_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const customer = rows[0];
        res.status(200).json({
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            customer_contact: customer.customer_contact,
            customer_email: customer.customer_email,
            customer_address: customer.customer_address
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const delete_customer = async(req,res)=>{
    const { customer_id } = req.params;
    try {
        const [customer] = await db.query(`SELECT customer_status FROM customers WHERE customer_id = ?`, [customer_id]);

        if (!customer.length || customer[0].customer_status === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const [result] = await db.query(
            `UPDATE customers
             SET customer_status = '0'
             WHERE customer_id =?
            `,[customer_id]
        )

        if(result.affectedRows ===0){
                res.status(404).json({message:"Customer not found or unauthorized"})
            };
        res.status(200).json({message:"Customer deleted successfully"});
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
}


export const updateCustomer = async (req, res) => {
    const { customer_id } = req.params;
    const { customer_name, customer_contact, customer_email, customer_address } = req.body;

    try {
        // Check if customer exists and is active
        const [customer] = await db.query(
            `SELECT customer_status FROM customers WHERE customer_id = ?`, 
            [customer_id]
        );

        if (!customer.length || customer[0].customer_status === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (customer_name !== undefined) {
            if (!customer_name || customer_name.trim() === '') {
                return res.status(400).json({ error: "Customer name cannot be empty" });
            }
            updateFields.push('customer_name = ?');
            updateValues.push(customer_name.trim());
        }

        if (customer_contact !== undefined) {
            if (!customer_contact || customer_contact.trim() === '') {
                return res.status(400).json({ error: "Customer contact cannot be empty" });
            }

            // Check if another ACTIVE customer with this contact exists
            const [existing] = await db.query(
                `SELECT customer_id FROM customers 
                WHERE customer_contact = ? AND customer_status = 1 AND customer_id != ?`,
                [customer_contact.trim(), customer_id]
            );

            if (existing.length > 0) {
                return res.status(409).json({ 
                    error: "Another customer with this contact already exists" 
                });
            }

            updateFields.push('customer_contact = ?');
            updateValues.push(customer_contact.trim());
        }

        if (customer_email !== undefined) {
            // Allow empty string or "NA" for optional field
            const emailValue = customer_email.trim() === '' ? 'NA' : customer_email.trim();
            updateFields.push('customer_email = ?');
            updateValues.push(emailValue);
        }

        if (customer_address !== undefined) {
            // Allow empty string or "NA" for optional field
            const addressValue = customer_address.trim() === '' ? 'NA' : customer_address.trim();
            updateFields.push('customer_address = ?');
            updateValues.push(addressValue);
        }

        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Add customer_id to values array for WHERE clause
        updateValues.push(customer_id);

        // Execute update query
        const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE customer_id = ?`;
        await db.query(updateQuery, updateValues);

        res.status(200).json({ message: "Customer updated successfully" });

    } catch (error) {
        console.error('Error updating customer:', error);
        
        res.status(500).json({ error: "Internal server error" });
    }
};
