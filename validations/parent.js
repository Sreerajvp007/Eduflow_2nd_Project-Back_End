import Joi from "joi";

export const updateParentProfileValidation = Joi.object({
  fullName: Joi.string().min(2).max(50),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
});

export const updateParentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be 10 digits",
      "string.empty": "Phone is required",
    }),
});

export const updateStudentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(40)
    .required(),

  grade: Joi.number()
    .min(1)
    .max(12)
    .required(),

  board: Joi.string()
    .valid("STATE", "CBSE", "ICSE")
    .required(),
});


export const addStudentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(40)
    .required()
    .messages({
      "string.empty": "Student name is required",
      "string.min": "Student name must be at least 2 characters",
    }),

  grade: Joi.number()
    .min(1)
    .max(12)
    .required()
    .messages({
      "number.base": "Grade must be a number",
      "number.min": "Grade must be between 1 and 12",
      "number.max": "Grade must be between 1 and 12",
    }),

  board: Joi.string()
    .valid("STATE", "CBSE", "ICSE")
    .required()
    .messages({
      "any.only": "Board must be STATE, CBSE or ICSE",
      "string.empty": "Board is required",
    }),

  photo: Joi.string().optional(),
});