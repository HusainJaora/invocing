import db from "../db/database.js";
import bcrypt from "bcrypt";


export const create_user = async (req, res) => {
    const { username, email, password } = req.body;

    try {

        const [existing] = await db.query(`
            SELECT user_id FROM users 
            WHERE email = ?  AND status = 1`, 
            [email.trim().toLowerCase()]
        );

        // If active user exists, don't allow duplicate
        if (existing.length > 0) {
            return res.status(400).json({ 
                error: "User with this email already exists" 
            });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(`
            INSERT INTO users(username, email, password) 
            VALUES(?, ?, ?)`, 
            [username.trim(), email.trim().toLowerCase(), hashpassword]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                user_id: result.insertId,
                username: username.trim(),
                email: email.trim().toLowerCase()
            }
        });

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const get_all_users = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT user_id, username, email FROM users where status ='1'`);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const get_User_ById = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT user_id, username, email FROM users WHERE user_id = ? AND STATUS = '1'",
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];
        res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const delete_user = async(req,res)=>{
    const { user_id } = req.params;
    try {
        const [user] = await db.query(`SELECT status FROM users WHERE user_id = ?`, [user_id]);

        if (!user.length || user[0].status === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const [result] = await db.query(
            `UPDATE users
             SET status = '0'
             WHERE user_id =?
            `,[user_id]
        )

        if(result.affectedRows ===0){
                res.status(404).json({message:"User not found or unauthorized"})
            };
        res.status(200).json({message:"User deleted successfully"});
    } catch (error) {
        res.status(500).json({error:error.message})
        
    }
}


export const update_user = async (req, res) => {
    const { user_id } = req.params;
    const { username, email, password } = req.body;

    try {
        // Check if user exists and is active
        const [user] = await db.query(
            `SELECT status FROM users WHERE user_id = ?`, 
            [user_id]
        );

        if (!user.length || user[0].status === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Build dynamic update query based on provided fields
        const updateFields = [];
        const updateValues = [];

        if (username !== undefined) {
            if (!username || username.trim() === '') {
                return res.status(400).json({ error: "Username cannot be empty" });
            }

            // Check if another ACTIVE user with this username exists
            const [existing] = await db.query(
                `SELECT user_id FROM users 
                WHERE username = ? AND status = 1 AND user_id != ?`,
                [username.trim(), user_id]
            );

            if (existing.length > 0) {
                return res.status(409).json({ 
                    error: "Another user with this username already exists" 
                });
            }

            updateFields.push('username = ?');
            updateValues.push(username.trim());
        }

        if (email !== undefined) {
            if (!email || email.trim() === '') {
                return res.status(400).json({ error: "Email cannot be empty" });
            }

            // Check if another ACTIVE user with this email exists
            const [existing] = await db.query(
                `SELECT user_id FROM users 
                WHERE email = ? AND status = 1 AND user_id != ?`,
                [email.trim().toLowerCase(), user_id]
            );

            if (existing.length > 0) {
                return res.status(409).json({ 
                    error: "Another user with this email already exists" 
                });
            }

            updateFields.push('email = ?');
            updateValues.push(email.trim().toLowerCase());
        }

        if (password !== undefined) {
            if (!password || password.trim() === '') {
                return res.status(400).json({ error: "Password cannot be empty" });
            }
            // Hash password if provided
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Add user_id to values array for WHERE clause
        updateValues.push(user_id);

        // Execute update query
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
        await db.query(updateQuery, updateValues);

        res.status(200).json({ message: "User updated successfully" });

    } catch (error) {
        console.error('Error updating user:', error);
        
        res.status(500).json({ error: "Internal server error" });
    }
};