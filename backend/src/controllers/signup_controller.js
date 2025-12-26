// import db from "../db/database.js";
// import bcrypt from "bcrypt";

// export const create_user = async (req, res) => {
//     const { username, email, password} = req.body;

//     try {
//         const hashpassword = await bcrypt.hash(password, 10);

//          await db.query(
//             "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
//             [username.trim(), email.trim().toLowerCase(), hashpassword]
//         );

//         res.status(200).json({ message: "User registered successfully" });
//     } catch (error) {
//         if (error.code === "ER_DUP_ENTRY") {
//             res.status(409).json({ error: "User with this email or username already exists" });
//         } else {
//             res.status(500).json({ error: error.message });
//         }
//     }
// };


import db from "../db/database.js";
import bcrypt from "bcrypt";

export const create_user = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password
        const hashpassword = await bcrypt.hash(password, 10);

        // Insert user into database - matching your table structure
        const [result] = await db.query(
            "INSERT INTO users (username, email, password, status) VALUES (?, ?, ?, ?)",
            [username.trim(), email.trim().toLowerCase(), hashpassword, 1]
        );

        console.log(`✓ User created successfully: ${email}`);
        
        res.status(201).json({ 
            message: "User registered successfully",
            user: {
                user_id: result.insertId,
                username: username.trim(),
                email: email.trim().toLowerCase(),
                status: 1
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        
        if (error.code === "ER_DUP_ENTRY") {
            res.status(409).json({ 
                error: "User with this email already exists" 
            });
        } else {
            res.status(500).json({ 
                error: "Failed to create user",
                message: error.message 
            });
        }
    }
};