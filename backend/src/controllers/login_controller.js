import db from "../db/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const login = async (req, res) => {
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
      {
        user_id: user.user_id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


        res.status(200).json({
            message: "Logged in successfully",
            accessToken: accessToken,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



   
