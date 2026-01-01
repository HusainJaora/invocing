import joi from "joi";

export const addProductValidation = (req, res, next) => {
  const schema = joi.object({
    product_name: joi.string()
      .trim()   
      .required()
      .messages({
        "string.base": "Product name must be a string",
        "string.empty": "Product name is required",
        "any.required": "Product name is required"
      }),
      product_description: joi.string()
      .trim()
      .allow("")
      .allow("NA")
      .optional()
      .messages({
        "string.pattern.base": "Product description must be a string",
        "string.empty": "Product description is required",
        "any.required": "Product description is required"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export const updateProductValidation = (req, res, next) => {
  const schema = joi.object({
    product_name: joi.string()
      .trim()   
      .optional()
      .messages({
        "string.base": "Product name must be a string",
        "string.empty": "Product name is required",
        "any.required": "Product name is required"
      }),
      product_description: joi.string()
      .trim()
      .allow("")
      .allow("NA")
      .optional()
      .messages({
        "string.pattern.base": "Product description must be a string",
        "string.empty": "Product description is required",
        "any.required": "Product description is required"
      })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};