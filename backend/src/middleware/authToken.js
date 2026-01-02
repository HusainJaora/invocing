import jwt from "jsonwebtoken";


const ensureAuthenticated = (req, res, next) => {
    // Read token from cookies 
    const token = req.cookies.accessToken;
    
    if (!token) {
        
        return res.status(401).json({ message: "Access denied, JWT token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "JWT token has expired" });
        }
        return res.status(401).json({ message: "Invalid JWT token" });
    }
};

export default ensureAuthenticated;