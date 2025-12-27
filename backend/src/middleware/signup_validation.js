import joi from "joi";
import db from "../db/database.js";

export const validateDuplicateUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const signupValidation = async (req, res, next) => {
  const schema = joi.object({
    username: joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be less than or equal to 30 characters",
        "any.required": "Username is required",
      }),

  
    email: joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.email": "Email must be a valid email",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),

    password: joi.string()
      .trim()
      .min(3)
      .max(20)
      .required()
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must be less than or equal to 20 characters",
        "any.required": "Password is required",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

export const updateUserValidation = async (req, res, next) => {
  const schema = joi.object({
    username: joi.string()
      .trim()
      .min(3)
      .max(50)
      .optional()
      .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username is required",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be less than or equal to 30 characters",
        "any.required": "Username is required",
      }),

  
    email: joi.string()
      .trim()
      .email()
      .optional()
      .messages({
        "string.email": "Email must be a valid email",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),

    password: joi.string()
      .trim()
      .min(3)
      .max(20)
      .optional()
      .messages({
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must be less than or equal to 20 characters",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  next();
};

