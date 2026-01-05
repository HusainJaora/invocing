import joi from "joi";

export const addCustomerValidation = (req, res, next) => {
  const schema = joi.object({
    customer_name: joi.string()
      .trim()   
      .required()
      .messages({
        "string.base": "Customer name must be a string",
        "string.empty": "Customer name is required",
        "any.required": "Customer name is required"
      }),

    customer_contact: joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/) // exactly 10 digits
      .required()
      .messages({
        "string.pattern.base": "Customer contact must be a 10-digit number",
        "string.empty": "Customer contact is required",
        "any.required": "Customer contact is required"
      }),

    customer_email: joi.string()
      .trim()
      .email()
      .allow("NA")
      .optional()
      .messages({
        "string.email": "Invalid email format"
      }),

    customer_address: joi.string()
      .trim()
      .allow("")
      .allow("NA")
      .optional()
      .messages({
        "string.base": "Customer address must be a string"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export const updateCustomerValidation = (req, res, next) => {
  const schema = joi.object({
    customer_name: joi.string()
      .trim()
      .optional()
      .messages({   
        "string.base": "Customer name must be a string",
        "string.empty": "Customer name is required",
        "any.required": "Customer name is required"
      }),

    customer_contact: joi.string()
      .trim()
      .pattern(/^[0-9]{10}$/) // exactly 10 digits
      .optional()
      .messages({
        "string.pattern.base": "Customer contact must be a 10-digit number",
        "string.empty": "Customer contact is required",
        "any.required": "Customer contact is required"
      }),

    customer_email: joi.string()
      .trim()
      .email()
      .allow("NA")
      .allow("")
      .optional()
      .messages({
        "string.email": "Invalid email format"
      }),

    customer_address: joi.string()
      .trim()
      .allow("")
      .allow("NA")
      .optional()
      .messages({
        "string.base": "Customer address must be a string"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};