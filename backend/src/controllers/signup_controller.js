import db from "../db/database.js";
import bcrypt from "bcrypt";

export const create_user = async (req, res) => {
    const { username, email, password} = req.body;

    try {
        const hashpassword = await bcrypt.hash(password, 10);

         await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username.trim(), email.trim().toLowerCase(), hashpassword]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "User with this email or username already exists" });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const get_all_users = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT user_id, username, email, status FROM users where status ='1'`);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const get_User_ById = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT user_id, username, email, password FROM users WHERE user_id = ? AND STATUS = '1'",
            [user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];
        res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            email: user.email, 
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

export const update_user = async(req, res) => {
    const { user_id } = req.params;
    const { username, email, password } = req.body;

    try {
        // Check if user exists and is active
        const [user] = await db.query(`SELECT status FROM users WHERE user_id = ?`, [user_id]);

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
            updateFields.push('username = ?');
            updateValues.push(username.trim());
        }

        if (email !== undefined) {
            if (!email || email.trim() === '') {
                return res.status(400).json({ error: "Email cannot be empty" });
            }
            updateFields.push('email = ?');
            updateValues.push(email.trim());
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
        
        // Handle duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email already exists" });
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
}


