import db from "../db/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { generateRefreshToken, hashtoken } = require("../utils/tokenutils.js");



const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const [existing] = await db.query(
            "SELECT * FROM users WHERE email = ? AND status = '1'",
            [email.trim().toLowerCase()]
        );

        const user = existing[0];
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const accessToken = jwt.sign(
            { user_id: user.user_id, username:user.username},
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = generateRefreshToken();
        const tokenHash = hashtoken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            `INSERT INTO refresh_token (signup_id, token_hash, expires_at) VALUES (?, ?, ?)`,
            [user.signup_id, tokenHash, expiresAt]
        );

        // Set HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data 
        res.status(200).json({
            message: "Logged in successfully",
            username: user.username,
            email:user.email,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports =  login;
   
