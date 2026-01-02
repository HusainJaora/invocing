import joi from "joi";

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
        "string.max": "Username must be less than or equal to 50 characters",
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
        "string.min": "Password must be at least 3 characters",
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
        "string.empty": "Username cannot be empty",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be less than or equal to 50 characters",
      }),

    email: joi.string()
      .trim()
      .email()
      .optional()
      .messages({
        "string.email": "Email must be a valid email",
        "string.empty": "Email cannot be empty",
      }),

    password: joi.string()
      .trim()
      .min(3)
      .max(20)
      .optional()
      .messages({
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 3 characters",
        "string.max": "Password must be less than or equal to 20 characters",
        "string.empty": "Password cannot be empty",
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