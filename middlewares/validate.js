
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[property];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,     
      allowUnknown: false,   
      stripUnknown: true,    
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message.replace(/"/g, ""),
        })),
      });
    }


    req[property] = value;

    next();
  };
};

export default validate;