import crypto from "crypto";

// Generete secure refresh token
export const generateRefreshToken = ()=> crypto.randomBytes(64).toString("hex");

// Hash refresh Token
export const hashtoken = (token) => crypto.createHash("sha256").update(token).digest("hex");

