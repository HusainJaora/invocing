import joi from "joi";

export const loginValidation = async (req, res, next) => {
  // Validation schema
  const schema = joi.object({
    email: joi.string().trim().email().required().messages({
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: joi.string().trim().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};